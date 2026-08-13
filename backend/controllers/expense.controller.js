import Expense from "../models/expense.model.js";
import Group from "../models/group.model.js";
import Settlement from "../models/settlement.model.js";
import AppError from "../utils/AppError.js";


// CREATE EXPENSE
export const createExpense = async (req, res, next) => {
    try {
        // 1. Get group ID from URL
        const { groupId } = req.params;

        // 2. Get expense data from request body
        const { description, amount, category } = req.body;

        // 3. Validate data
        if (!description || amount === undefined) {
            throw new AppError(
                "Please provide description and amount",
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

        // 6. Check whether logged-in user is a member
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

        // 7. Create expense
        const expense = await Expense.create({
            description,
            amount,
            category,
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
        next(err);
    }
};


// GET ALL GROUP EXPENSES
export const getGroupExpenses = async (req, res, next) => {
    try {
        // 1. Get group ID from URL
        const { groupId } = req.params;

        // 2. Find group
        const group = await Group.findById(groupId);

        if (!group) {
            throw new AppError("Group not found", 404);
        }

        // 3. Check if logged-in user is a member
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
        next(err);
    }
};


// GET EXPENSE BY ID
export const getExpenseById = async (req, res, next) => {
    try {
        // 1. Get IDs from URL
        const { groupId, expenseId } = req.params;

        // 2. Find group
        const group = await Group.findById(groupId);

        if (!group) {
            throw new AppError("Group not found", 404);
        }

        // 3. Check if logged-in user is a member
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

        // 4. Find expense inside this group
        const expense = await Expense.findOne({
            _id: expenseId,
            group: groupId
        });

        if (!expense) {
            throw new AppError("Expense not found", 404);
        }

        // 5. Return expense
        return res.status(200).json({
            success: true,
            expense
        });

    } catch (err) {
        next(err);
    }
};


// UPDATE EXPENSE
export const updateExpense = async (req, res, next) => {
    try {
        // 1. Get IDs from URL
        const { groupId, expenseId } = req.params;

        // 2. Get updated data
        const { description, amount } = req.body || {};

        // 3. Find group
        const group = await Group.findById(groupId);

        if (!group) {
            throw new AppError("Group not found", 404);
        }

        // 4. Check if logged-in user is a member
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
        // 5. Find expense
        const expense = await Expense.findOne({
            _id: expenseId,
            group: groupId
        });

        if (!expense) {
            throw new AppError("Expense not found", 404);
        }

        // 6. Only the person who paid can update
        if (
            expense.paidBy.toString() !==
            req.user._id.toString()
        ) {
            throw new AppError(
                "Only the person who paid can update this expense",
                403
            );
        }

        // 7. Validate amount if provided
        if (amount !== undefined && amount <= 0) {
            throw new AppError(
                "Amount must be greater than 0",
                400
            );
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
        next(err);
    }
};

// DELETE EXPENSE
export const deleteExpense = async (req, res, next) => {
    try {
        // 1. Get IDs from URL
        const { groupId, expenseId } = req.params;

        // 2. Find group
        const group = await Group.findById(groupId);

        if (!group) {
            throw new AppError("Group not found", 404);
        }

        // 3. Check if logged-in user is a member
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

        // 4. Find expense
        const expense = await Expense.findOne({
            _id: expenseId,
            group: groupId
        });

        if (!expense) {
            throw new AppError("Expense not found", 404);
        }

        // 5. Check if logged-in user is the person who paid
        if (
            expense.paidBy.toString() !==
            req.user._id.toString()
        ) {
            throw new AppError(
                "Only the person who paid can delete this expense",
                403
            );
        }

        // 6. Delete expense
        await Expense.findByIdAndDelete(expenseId);

        // 7. Return success response
        return res.status(200).json({
            success: true,
            message: "Expense deleted successfully"
        });

    } catch (err) {
        next(err);
    }
};


// GET GROUP BALANCES
export const getGroupBalances = async (req, res, next) => {
    try {
        const { groupId } = req.params;

        // 1. Find group and populate members
        const group = await Group.findById(groupId).populate(
            "members",
            "name email"
        );

        if (!group) {
            throw new AppError("Group not found", 404);
        }

        // 2. Check membership
        const isMember = group.members.some(
            (member) =>
                member._id.toString() === req.user._id.toString()
        );

        if (!isMember) {
            throw new AppError(
                "You are not a member of this group",
                403
            );
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
            throw new AppError(
                "Group has no members",
                400
            );
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
        next(err);
    }
};


// GET SIMPLIFIED SETTLEMENTS
export const getSimplifiedSettlements = async (req, res, next) => {
    try {
        const { groupId } = req.params;

        // 1. Find group and populate members
        const group = await Group.findById(groupId).populate(
            "members",
            "name email"
        );

        if (!group) {
            throw new AppError("Group not found", 404);
        }

        // 2. Check membership
        const isMember = group.members.some(
            (member) =>
                member._id.toString() === req.user._id.toString()
        );

        if (!isMember) {
            throw new AppError(
                "You are not a member of this group",
                403
            );
        }

        // 3. Get expenses
        const expenses = await Expense.find({
            group: groupId
        });

        // 4. Get settlements already made
        const settlements = await Settlement.find({
            group: groupId
        });

        // 5. Calculate total expense
        const totalExpense = expenses.reduce(
            (total, expense) => total + expense.amount,
            0
        );

        // 6. Calculate equal share
        const memberCount = group.members.length;

        if (memberCount === 0) {
            throw new AppError(
                "Group has no members",
                400
            );
        }

        const sharePerMember = totalExpense / memberCount;

        // 7. Calculate net balance for each member
        const balances = group.members.map((member) => {

            // Total paid by member
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

            // Initial balance
            let balance = paid - sharePerMember;

            // Apply existing settlements
            settlements.forEach((settlement) => {

                // Member paid someone
                if (
                    settlement.from.toString() ===
                    member._id.toString()
                ) {
                    balance += settlement.amount;
                }

                // Member received money
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
                balance: Number(balance.toFixed(2))
            };
        });

        // 8. Separate debtors and creditors
        const debtors = [];
        const creditors = [];

        balances.forEach((member) => {

            if (member.balance < 0) {
                debtors.push({
                    ...member,
                    balance: Math.abs(member.balance)
                });
            }

            if (member.balance > 0) {
                creditors.push({
                    ...member
                });
            }
        });

        // 9. Simplify debts
        const suggestedSettlements = [];

        let debtorIndex = 0;
        let creditorIndex = 0;

        while (
            debtorIndex < debtors.length &&
            creditorIndex < creditors.length
        ) {
            const debtor = debtors[debtorIndex];
            const creditor = creditors[creditorIndex];

            const amount = Math.min(
                debtor.balance,
                creditor.balance
            );

            suggestedSettlements.push({
                from: {
                    userId: debtor.userId,
                    name: debtor.name,
                    email: debtor.email
                },
                to: {
                    userId: creditor.userId,
                    name: creditor.name,
                    email: creditor.email
                },
                amount: Number(amount.toFixed(2))
            });

            debtor.balance -= amount;
            creditor.balance -= amount;

            if (debtor.balance < 0.01) {
                debtorIndex++;
            }

            if (creditor.balance < 0.01) {
                creditorIndex++;
            }
        }

        // 10. Return result
        return res.status(200).json({
            success: true,
            groupId,
            totalExpense: Number(totalExpense.toFixed(2)),
            memberCount,
            sharePerMember: Number(
                sharePerMember.toFixed(2)
            ),
            transactionCount: suggestedSettlements.length,
            settlements: suggestedSettlements
        });

    } catch (err) {
        next(err);
    }
};

// GET EXPENSE ANALYTICS
export const getExpenseAnalytics = async (req, res, next) => {
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

        // 3. Get all expenses
        const expenses = await Expense.find({
            group: groupId
        });

        // 4. Calculate total expense
        const totalExpense = expenses.reduce(
            (total, expense) => total + expense.amount,
            0
        );

        // 5. Calculate category totals
        const categoryMap = {};

        expenses.forEach((expense) => {
            const category = expense.category || "Other";

            if (!categoryMap[category]) {
                categoryMap[category] = 0;
            }

            categoryMap[category] += expense.amount;
        });

        // 6. Convert category totals into analytics
        const categoryBreakdown = Object.entries(categoryMap)
            .map(([category, amount]) => ({
                category,
                amount: Number(amount.toFixed(2)),
                percentage:
                    totalExpense === 0
                        ? 0
                        : Number(
                            ((amount / totalExpense) * 100).toFixed(2)
                        )
            }))
            .sort((a, b) => b.amount - a.amount);

        // 7. Find highest spending category
        const highestCategory =
            categoryBreakdown.length > 0
                ? categoryBreakdown[0]
                : null;

        // 8. Return analytics
        return res.status(200).json({
            success: true,
            groupId,
            totalExpense: Number(totalExpense.toFixed(2)),
            expenseCount: expenses.length,
            categoryCount: categoryBreakdown.length,
            highestCategory,
            categoryBreakdown
        });

    } catch (err) {
        next(err);
    }
};

