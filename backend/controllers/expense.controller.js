import Expense from "../models/expense.model.js";
import Group from "../models/group.model.js";
import Settlement from "../models/settlement.model.js";


// CREATE EXPENSE
export const createExpense = async (req, res) => {
    try {
        // 1. Get group ID from URL
        const { groupId } = req.params;

        // 2. Get expense data from request body
        const { description, amount } = req.body;

        // 3. Validate data
        if (!description || amount === undefined) {
            return res.status(400).json({
                success: false,
                message: "Please provide description and amount"
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

        // 6. Check whether logged-in user is a member
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

        // 7. Create expense
        const expense = await Expense.create({
            description,
            amount,
            group: groupId,
            paidBy: req.user._id
        });

        // 8. Return success response
        return res.status(201).json({
            success: true,
            message: "Expense created successfully",
            expense
        });

    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


// GET ALL GROUP EXPENSES
export const getGroupExpenses = async (req, res) => {
    try {
        // 1. Get group ID from URL
        const { groupId } = req.params;

        // 2. Find group
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Group not found"
            });
        }

        // 3. Check if logged-in user is a member
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

        // 4. Get all expenses of this group
        const expenses = await Expense.find({
            group: groupId
        }).sort({ createdAt: -1 });

        // 5. Return expenses
        return res.status(200).json({
            success: true,
            count: expenses.length,
            expenses
        });

    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


// GET EXPENSE BY ID
export const getExpenseById = async (req, res) => {
    try {
        // 1. Get IDs from URL
        const { groupId, expenseId } = req.params;

        // 2. Find group
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Group not found"
            });
        }

        // 3. Check if logged-in user is a member
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

        // 4. Find expense inside this group
        const expense = await Expense.findOne({
            _id: expenseId,
            group: groupId
        });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found"
            });
        }

        // 5. Return expense
        return res.status(200).json({
            success: true,
            expense
        });

    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


// UPDATE EXPENSE
export const updateExpense = async (req, res) => {
    try {
        // 1. Get IDs from URL
        const { groupId, expenseId } = req.params;

        // 2. Get updated data
        const { description, amount } = req.body || {};

        // 3. Find group
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Group not found"
            });
        }

        // 4. Check if logged-in user is a member
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

        // 5. Find expense
        const expense = await Expense.findOne({
            _id: expenseId,
            group: groupId
        });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found"
            });
        }

        // 6. Only the person who paid can update
        if (
            expense.paidBy.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "Only the person who paid can update this expense"
            });
        }

        // 7. Validate amount if provided
        if (amount !== undefined && amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Amount must be greater than 0"
            });
        }

        // 8. Update only provided fields
        if (description !== undefined) {
            expense.description = description;
        }

        if (amount !== undefined) {
            expense.amount = amount;
        }

        // 9. Save updated expense
        await expense.save();

        // 10. Return response
        return res.status(200).json({
            success: true,
            message: "Expense updated successfully",
            expense
        });

    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// DELETE EXPENSE
export const deleteExpense = async (req, res) => {
    try {
        // 1. Get IDs from URL
        const { groupId, expenseId } = req.params;

        // 2. Find group
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Group not found"
            });
        }

        // 3. Check if logged-in user is a member
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

        // 4. Find expense
        const expense = await Expense.findOne({
            _id: expenseId,
            group: groupId
        });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found"
            });
        }

        // 5. Check if logged-in user is the person who paid
        if (
            expense.paidBy.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "Only the person who paid can delete this expense"
            });
        }

        // 6. Delete expense
        await Expense.findByIdAndDelete(expenseId);

        // 7. Return success response
        return res.status(200).json({
            success: true,
            message: "Expense deleted successfully"
        });

    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


// GET GROUP BALANCES
export const getGroupBalances = async (req, res) => {
    try {
        const { groupId } = req.params;

        // 1. Find group and populate members
        const group = await Group.findById(groupId).populate(
            "members",
            "name email"
        );

        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Group not found"
            });
        }

        // 2. Check membership
        const isMember = group.members.some(
            (member) =>
                member._id.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: "You are not a member of this group"
            });
        }

        // 3. Get all group expenses
        const expenses = await Expense.find({
            group: groupId
        });

        // 4. Get all group settlements
        const settlements = await Settlement.find({
            group: groupId
        });

        // 5. Calculate total expenses
        const totalExpense = expenses.reduce(
            (total, expense) => total + expense.amount,
            0
        );

        // 6. Calculate equal share
        const memberCount = group.members.length;

        if (memberCount === 0) {
            return res.status(400).json({
                success: false,
                message: "Group has no members"
            });
        }

        const sharePerMember = totalExpense / memberCount;

        // 7. Calculate each member's balance
        const balances = group.members.map((member) => {

            // Total amount paid by this member
            const paid = expenses
                .filter(
                    (expense) =>
                        expense.paidBy.toString() ===
                        member._id.toString()
                )
                .reduce(
                    (total, expense) => total + expense.amount,
                    0
                );

            // Initial balance from expenses
            let balance = paid - sharePerMember;

            // 8. Apply settlements
            settlements.forEach((settlement) => {

                // from = person who paid the settlement
                // Their negative balance moves toward 0
                if (
                    settlement.from.toString() ===
                    member._id.toString()
                ) {
                    balance += settlement.amount;
                }

                // to = person who received the settlement
                // Their positive balance moves toward 0
                if (
                    settlement.to.toString() ===
                    member._id.toString()
                ) {
                    balance -= settlement.amount;
                }
            });

            return {
                userId: member._id,
                name: member.name,
                email: member.email,
                paid: Number(paid.toFixed(2)),
                share: Number(sharePerMember.toFixed(2)),
                balance: Number(balance.toFixed(2))
            };
        });

        // 9. Return result
        return res.status(200).json({
            success: true,
            groupId,
            totalExpense: Number(totalExpense.toFixed(2)),
            memberCount,
            sharePerMember: Number(sharePerMember.toFixed(2)),
            balances
        });

    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};