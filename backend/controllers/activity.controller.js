import Activity from "../models/activity.model.js";
import Expense from "../models/expense.model.js";
import Settlement from "../models/settlement.model.js";
import Group from "../models/group.model.js";
import AppError from "../utils/AppError.js";

// GET GROUP ACTIVITY FEED
export const getGroupActivity = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        let page = parseInt(req.query.page, 10);
        if (isNaN(page) || page < 1) page = 1;

        let limit = parseInt(req.query.limit, 10);
        if (isNaN(limit) || limit < 1) limit = 50;

        // 1. Verify group and membership
        const group = await Group.findById(groupId);
        if (!group) {
            throw new AppError("Group not found", 404);
        }

        const isMember = group.members.some(
            (memberId) => memberId.toString() === req.user._id.toString()
        );
        if (!isMember) {
            throw new AppError("You are not a member of this group", 403);
        }

        // 2. Fetch all Activities for deduplication
        const activities = await Activity.find({ group: groupId })
            .sort({ createdAt: -1 })
            .lean();

        // Build a Set of existing "added/recorded" events by referenceId to prevent legacy duplicate synthesis
        const existingActivityRefs = new Set();
        activities.forEach(act => {
            if (act.type === "expense_added" || act.type === "settlement_recorded") {
                existingActivityRefs.add(act.referenceId.toString());
            }
        });

        // 3. Fetch Legacy Expenses and Settlements (only those not explicitly logged as added)
        const [expenses, settlements] = await Promise.all([
            Expense.find({ group: groupId }).populate("paidBy", "name").lean(),
            Settlement.find({ group: groupId }).populate("from to", "name").lean()
        ]);

        // 4. Synthesize Legacy Activities
        const syntheticActivities = [];

        expenses.forEach(exp => {
            if (!existingActivityRefs.has(exp._id.toString())) {
                const actorName = exp.paidBy?.name || "A deleted user";
                syntheticActivities.push({
                    _id: exp._id, // use expense ID temporarily
                    group: exp.group,
                    type: "expense_added",
                    message: `${actorName} added '${exp.description}' — ₹${exp.amount.toFixed(2)}`,
                    actorId: exp.paidBy?._id || null,
                    actorName: actorName,
                    referenceId: exp._id,
                    amount: exp.amount,
                    createdAt: exp.createdAt,
                    updatedAt: exp.createdAt
                });
            }
        });

        settlements.forEach(settle => {
            if (!existingActivityRefs.has(settle._id.toString())) {
                const actorName = settle.from?.name || "A deleted user";
                const receiverName = settle.to?.name || "a member";
                syntheticActivities.push({
                    _id: settle._id,
                    group: settle.group,
                    type: "settlement_recorded",
                    message: `${actorName} paid ${receiverName} — ₹${settle.amount.toFixed(2)}`,
                    actorId: settle.from?._id || null,
                    actorName: actorName,
                    referenceId: settle._id,
                    amount: settle.amount,
                    receiverName: receiverName,
                    createdAt: settle.createdAt,
                    updatedAt: settle.createdAt
                });
            }
        });

        // 5. Combine and Sort
        const allFeed = [...activities, ...syntheticActivities];
        allFeed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // 6. Paginate Results
        const safeLimit = Math.min(limit, 100);
        const startIndex = (page - 1) * safeLimit;
        const endIndex = page * safeLimit;
        const paginatedFeed = allFeed.slice(startIndex, endIndex);

        return res.status(200).json({
            success: true,
            count: paginatedFeed.length,
            total: allFeed.length,
            page,
            limit: safeLimit,
            totalPages: Math.ceil(allFeed.length / safeLimit),
            hasMore: endIndex < allFeed.length,
            activities: paginatedFeed
        });

    } catch (err) {
        next(err);
    }
};
