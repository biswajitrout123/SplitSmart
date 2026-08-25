import Notification from "../models/notification.model.js";
import Group from "../models/group.model.js";
import AppError from "../utils/AppError.js";
import { calculateGroupBalances } from "../utils/groupBalance.util.js";
import Expense from "../models/expense.model.js";
import Settlement from "../models/settlement.model.js";

// GET USER NOTIFICATIONS
export const getUserNotifications = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const notifications = await Notification.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const unreadCount = await Notification.countDocuments({
            user: req.user._id,
            isRead: false
        });

        return res.status(200).json({
            success: true,
            notifications,
            unreadCount
        });
    } catch (err) {
        next(err);
    }
};

// MARK NOTIFICATION AS READ
export const markAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, user: req.user._id }, // Auth check: must belong to user
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            throw new AppError("Notification not found or unauthorized", 404);
        }

        return res.status(200).json({
            success: true,
            notification
        });
    } catch (err) {
        next(err);
    }
};

// MARK ALL AS READ
export const markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, isRead: false },
            { isRead: true }
        );

        return res.status(200).json({
            success: true,
            message: "All notifications marked as read"
        });
    } catch (err) {
        next(err);
    }
};

// SEND DEBT REMINDER
export const sendDebtReminder = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const { debtorId } = req.body; // the person who owes money

        if (!debtorId) {
            throw new AppError("Debtor ID is required", 400);
        }

        if (debtorId.toString() === req.user._id.toString()) {
            throw new AppError("You cannot send a reminder to yourself", 400);
        }

        const group = await Group.findById(groupId);
        if (!group) throw new AppError("Group not found", 404);

        // Verify both are members
        const isSenderMember = group.members.some(id => id.toString() === req.user._id.toString());
        const isDebtorMember = group.members.some(id => id.toString() === debtorId.toString());

        if (!isSenderMember) throw new AppError("You are not a member of this group", 403);
        if (!isDebtorMember) throw new AppError("Target user is not a member of this group", 400);

        // Verify debt server-side
        const [expenses, settlements] = await Promise.all([
            Expense.find({ group: groupId }).populate("paidBy", "name email").lean(),
            Settlement.find({ group: groupId }).populate("from to", "name email").lean()
        ]);

        const { balances } = calculateGroupBalances({ members: group.members.map(m => ({ _id: m })), expenses, settlements });
        
        // Check if the sender is owed money and the debtor owes money
        // Actually, the most accurate check is if there is an active suggested settlement from debtor to sender
        // Wait, standard balances just say "Sender is owed +X, Debtor owes -Y". It doesn't strictly pair them up.
        // We can just verify the debtor's balance is < 0 and sender's balance is > 0.
        
        const senderBalanceObj = balances.find(b => b.userId.toString() === req.user._id.toString());
        const debtorBalanceObj = balances.find(b => b.userId.toString() === debtorId.toString());

        if (!senderBalanceObj || senderBalanceObj.balance <= 0.01) {
            throw new AppError("You are not owed any money in this group", 400);
        }

        if (!debtorBalanceObj || debtorBalanceObj.balance >= -0.01) {
            throw new AppError("This user does not owe any money", 400);
        }

        // Create the notification
        // Note: Duplicate prevention for reminders: avoid spamming.
        // Let's just check if there's an unread reminder from this user to this debtor recently.
        // Or just let it create a new one. The plan says "check if existing unread notification... bump it".
        // But for debt_reminder, referenceId is null, so it might merge all reminders?
        // Let's use `actorId` as referenceId just for deduplication context, or just let it insert.
        // The plan says: "Optional/null for events like debt_reminder".
        
        const message = `${req.user.name} sent you a reminder to settle your debts in ${group.name}`;

        const existingNotification = await Notification.findOne({
            user: debtorId,
            type: "debt_reminder",
            group: groupId,
            isRead: false
        });

        if (existingNotification) {
            existingNotification.message = message;
            existingNotification.updatedAt = Date.now();
            await existingNotification.save();
        } else {
            await Notification.create({
                user: debtorId,
                group: groupId,
                type: "debt_reminder",
                message: message,
                referenceId: null
            });
        }

        return res.status(200).json({
            success: true,
            message: "Reminder sent successfully"
        });

    } catch (err) {
        next(err);
    }
};
