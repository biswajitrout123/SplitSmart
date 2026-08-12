import Settlement from "../models/settlement.model.js";
import Group from "../models/group.model.js";
import AppError from "../utils/AppError.js";


// CREATE SETTLEMENT
export const createSettlement = async (req, res, next) => {
    try {
        // 1. Get group ID
        const { groupId } = req.params;

        // 2. Get settlement data
        const { to, amount } = req.body;

        // 3. Validate data
        if (!to || amount === undefined || amount === null) {
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

        // 6. Check logged-in user is a member
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
        // 7. Check receiver is also a group member
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

        // 8. Prevent settling with yourself
        if (req.user._id.toString() === to.toString()) {
            throw new AppError(
                "You cannot settle with yourself",
                400
            );
        }

        // 9. Create settlement
        const settlement = await Settlement.create({
            group: groupId,
            from: req.user._id,
            to,
            amount
        });

        // 10. Return response
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