import Settlement from "../models/settlement.model.js";
import Group from "../models/group.model.js";


// CREATE SETTLEMENT
export const createSettlement = async (req, res) => {
    try {
        // 1. Get group ID
        const { groupId } = req.params;

        // 2. Get settlement data
        const { to, amount } = req.body;

        // 3. Validate data
        if (!to || amount === undefined) {
            return res.status(400).json({
                success: false,
                message: "Please provide receiver and amount"
            });
        }

        // 4. Validate amount
        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Amount must be greater than 0"
            });
        }

        // 5. Find group
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Group not found"
            });
        }

        // 6. Check logged-in user is a member
        const isMember = group.members.some(
            (memberId) =>
                memberId.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: "You are not a member of this group"
            });
        }

        // 7. Check receiver is also a group member
        const isReceiverMember = group.members.some(
            (memberId) =>
                memberId.toString() === to.toString()
        );

        if (!isReceiverMember) {
            return res.status(400).json({
                success: false,
                message: "Receiver is not a member of this group"
            });
        }

        // 8. Prevent settling with yourself
        if (req.user._id.toString() === to.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot settle with yourself"
            });
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
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


// GET ALL GROUP SETTLEMENTS
export const getGroupSettlements = async (req, res) => {
    try {
        const { groupId } = req.params;

        // 1. Find group
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Group not found"
            });
        }

        // 2. Check membership
        const isMember = group.members.some(
            (memberId) =>
                memberId.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: "You are not a member of this group"
            });
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
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};



// DELETE SETTLEMENT
export const deleteSettlement = async (req, res) => {
    try {
        const { groupId, settlementId } = req.params;

        // 1. Find group
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Group not found"
            });
        }

        // 2. Check membership
        const isMember = group.members.some(
            (memberId) =>
                memberId.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: "You are not a member of this group"
            });
        }

        // 3. Find settlement
        const settlement = await Settlement.findOne({
            _id: settlementId,
            group: groupId
        });

        if (!settlement) {
            return res.status(404).json({
                success: false,
                message: "Settlement not found"
            });
        }

        // 4. Delete settlement
        await Settlement.findByIdAndDelete(settlementId);

        // 5. Return success
        return res.status(200).json({
            success: true,
            message: "Settlement deleted successfully"
        });

    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};