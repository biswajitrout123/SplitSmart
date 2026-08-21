import Settlement from "../models/settlement.model.js";
import Group from "../models/group.model.js";
import Expense from "../models/expense.model.js";
import AppError from "../utils/AppError.js";
import { calculateGroupBalances } from "../utils/groupBalance.util.js";


// CREATE SETTLEMENT
export const createSettlement = async (req, res, next) => {
    try {
        // 1. Get group ID
        const { groupId } = req.params;

        // 2. Get settlement data
        const { to, amount } = req.body;

        // 3. Validate data
        if (!to || amount === undefined) {
            throw new AppError(
                "Recipient and amount are required",
                400
            );
        }

        // 4. Validate amount
        if (amount <= 0) {
            throw new AppError(
                "Amount must be greater than 0",
                400
            );
        }

        // 5. Find group
        const group = await Group.findById(groupId);

        if (!group) {
            throw new AppError("Group not found", 404);
        }

        // 6. Check sender membership
        const isSenderMember = group.members.some(
            (memberId) =>
                memberId.toString() === req.user._id.toString()
        );

        if (!isSenderMember) {
            throw new AppError(
                "You are not a member of this group",
                403
            );
        }

        // 7. Check receiver membership
        const isReceiverMember = group.members.some(
            (memberId) =>
                memberId.toString() === to.toString()
        );

        if (!isReceiverMember) {
            throw new AppError(
                "Receiver is not a member of this group",
                400
            );
        }

        // 8. Prevent self-settlement
        if (
            req.user._id.toString() ===
            to.toString()
        ) {
            throw new AppError(
                "You cannot settle with yourself",
                400
            );
        }

        // 9. Get all expenses
        const expenses = await Expense.find({
            group: groupId
        });

        // 10. Get existing settlements
        const settlements = await Settlement.find({
            group: groupId
        });

        const { balances } = calculateGroupBalances({
            members: group.members,
            expenses,
            settlements
        });

        const senderBalanceObj = balances.find(
            (b) => b.userId.toString() === req.user._id.toString()
        );
        const receiverBalanceObj = balances.find(
            (b) => b.userId.toString() === to.toString()
        );

        if (!senderBalanceObj || !receiverBalanceObj) {
             throw new AppError("Member not found in balances", 400);
        }

        const senderBalance = senderBalanceObj.balance;
        const receiverBalance = receiverBalanceObj.balance;

        // 16. Sender must actually owe money (negative balance)
        if (senderBalance >= -0.01) {
            throw new AppError(
                "You do not currently owe money in this group",
                400
            );
        }

        // 19. Receiver must be owed money (positive balance)
        if (receiverBalance <= 0.01) {
            throw new AppError(
                "Receiver is not owed money in this group",
                400
            );
        }

        // 20. Maximum amount sender can pay
        const outstandingDebt =
            Math.abs(senderBalance);

        // 21. Prevent overpayment
        if (amount > outstandingDebt) {
            throw new AppError(
                `Settlement amount cannot exceed your outstanding debt of ₹${outstandingDebt.toFixed(2)}`,
                400
            );
        }

        // 22. Prevent paying more than receiver is owed
        if (amount > receiverBalance) {
            throw new AppError(
                `Settlement amount cannot exceed receiver's outstanding balance of ₹${receiverBalance.toFixed(2)}`,
                400
            );
        }

        // 23. Create settlement
        const settlement = await Settlement.create({
            group: groupId,
            from: req.user._id,
            to,
            amount
        });

        // 24. Return success
        return res.status(201).json({
            success: true,
            message: "Settlement created successfully",
            settlement
        });

    } catch (err) {
        next(err);
    }
};


// GET ALL GROUP SETTLEMENTS
export const getGroupSettlements = async (req, res, next) => {
    try {
        const { groupId } = req.params;

        // 1. Find group
        const group = await Group.findById(groupId);

        if (!group) {
            throw new AppError("Group not found", 404);
        }
        // 2. Check membership
        const isMember = group.members.some(
            (memberId) =>
                memberId.toString() === req.user._id.toString()
        );

        if (!isMember) {
            throw new AppError(
                "You are not a member of this group",
                403
            );
        }
        // 3. Find settlements
        const settlements = await Settlement.find({
            group: groupId
        })
            .populate("from", "name email")
            .populate("to", "name email")
            .sort({ createdAt: -1 });

        // 4. Return settlements
        return res.status(200).json({
            success: true,
            count: settlements.length,
            settlements
        });

    } catch (err) {
        next(err);
    }
};



// DELETE SETTLEMENT
export const deleteSettlement = async (req, res, next) => {
    try {
        const { groupId, settlementId } = req.params;

        // 1. Find group
        const group = await Group.findById(groupId);

        if (!group) {
            throw new AppError("Group not found", 404);
        }

        // 2. Check membership
        const isMember = group.members.some(
            (memberId) =>
                memberId.toString() === req.user._id.toString()
        );

        if (!isMember) {
            throw new AppError(
                "You are not a member of this group",
                403
            );
        }

        // 3. Find settlement
        const settlement = await Settlement.findOne({
            _id: settlementId,
            group: groupId
        });

        if (!settlement) {
            throw new AppError(
                "Settlement not found",
                404
            );
        }
        
        // 4. Delete settlement
        await Settlement.findByIdAndDelete(settlementId);

        // 5. Return success
        return res.status(200).json({
            success: true,
            message: "Settlement deleted successfully"
        });

    } catch (err) {
        next(err);
    }
};


// GET SETTLEMENT SUMMARY
export const getSettlementSummary = async (req, res, next) => {
    try {
        const { groupId } = req.params;

        // 1. Find group
        const group = await Group.findById(groupId);

        if (!group) {
            throw new AppError("Group not found", 404);
        }

        // 2. Check membership
        const isMember = group.members.some(
            (memberId) =>
                memberId.toString() === req.user._id.toString()
        );

        if (!isMember) {
            throw new AppError(
                "You are not a member of this group",
                403
            );
        }

        // 3. Get all settlements
        const settlements = await Settlement.find({
            group: groupId
        })
            .populate("from", "name email")
            .populate("to", "name email")
            .sort({ createdAt: -1 });

        // 4. Total amount settled
        const totalSettled = settlements.reduce(
            (total, settlement) =>
                total + settlement.amount,
            0
        );

        // 5. Calculate current user's payments
        const userId = req.user._id.toString();

        const amountPaidByMe = settlements
            .filter(
                (settlement) =>
                    settlement.from._id.toString() === userId
            )
            .reduce(
                (total, settlement) =>
                    total + settlement.amount,
                0
            );

        // 6. Calculate current user's received amount
        const amountReceivedByMe = settlements
            .filter(
                (settlement) =>
                    settlement.to._id.toString() === userId
            )
            .reduce(
                (total, settlement) =>
                    total + settlement.amount,
                0
            );

        // 7. Net settlement
        const netSettlement =
            amountReceivedByMe - amountPaidByMe;

        // 8. Get latest settlement
        const lastSettlement = settlements.length > 0
            ? settlements[0]
            : null;

        // 9. Get recent settlements
        const recentSettlements = settlements.slice(0, 5);

        // 10. Return summary
        return res.status(200).json({
            success: true,
            groupId,

            settlementCount: settlements.length,

            totalSettled: Number(
                totalSettled.toFixed(2)
            ),

            mySettlement: {
                amountPaid: Number(
                    amountPaidByMe.toFixed(2)
                ),

                amountReceived: Number(
                    amountReceivedByMe.toFixed(2)
                ),

                netSettlement: Number(
                    netSettlement.toFixed(2)
                )
            },

            lastSettlement,

            recentSettlements
        });

    } catch (err) {
        next(err);
    }
};