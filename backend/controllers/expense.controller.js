import Expense from "../models/expense.model.js";
import Group from "../models/group.model.js";
import Settlement from "../models/settlement.model.js";
import AppError from "../utils/AppError.js";
import { calculateExpenseSplits } from "../utils/expenseSplit.util.js";
import { calculateGroupBalances } from "../utils/groupBalance.util.js";


// CREATE EXPENSE
export const createExpense = async (req, res, next) => {
    try {
        const { groupId } = req.params;

        const {
            description,
            amount,
            category = "Other",
            customCategory,
            splitType = "equal",
            splits = []
        } = req.body;

        // ---------------------------------------------
        // BASIC VALIDATION
        // ---------------------------------------------
        if (!description?.trim()) {
            throw new AppError(
                "Please provide expense description",
                400
            );
        }

        const numericAmount = Number(amount);

        if (
            amount === undefined ||
            amount === null ||
            Number.isNaN(numericAmount) ||
            numericAmount <= 0
        ) {
            throw new AppError(
                "Expense amount must be greater than 0",
                400
            );
        }
        
        if (category === "Custom") {
            if (!customCategory || !customCategory.trim()) {
                throw new AppError(
                    "Please provide a custom category name",
                    400
                );
            }
        }

        // ---------------------------------------------
        // VALIDATE SPLIT TYPE
        // ---------------------------------------------
        const allowedSplitTypes = [
            "equal",
            "exact",
            "percentage"
        ];

        if (!allowedSplitTypes.includes(splitType)) {
            throw new AppError(
                "Invalid split type",
                400
            );
        }

        // ---------------------------------------------
        // VALIDATE SPLITS ARRAY
        // ---------------------------------------------
        if (!Array.isArray(splits)) {
            throw new AppError(
                "Splits must be an array",
                400
            );
        }

        // ---------------------------------------------
        // FIND GROUP
        // ---------------------------------------------
        const group = await Group.findById(groupId);

        if (!group) {
            throw new AppError(
                "Group not found",
                404
            );
        }

        // ---------------------------------------------
        // CHECK MEMBERSHIP
        // ---------------------------------------------
        const isMember = group.members.some(
            (memberId) =>
                memberId.toString() ===
                req.user._id.toString()
        );

        if (!isMember) {
            throw new AppError(
                "You are not a member of this group",
                403
            );
        }

        // ---------------------------------------------
        // CALCULATE SPLITS
        // ---------------------------------------------
        const calculatedSplits = calculateExpenseSplits({
            amount: numericAmount,
            splitType,
            splits,
            memberIds: group.members
        });

        // ---------------------------------------------
        // CREATE EXPENSE
        // ---------------------------------------------
        const expense = await Expense.create({
            description: description.trim(),
            amount: numericAmount,
            category,
            customCategory: category === "Custom" ? customCategory.trim() : undefined,
            group: groupId,
            paidBy: req.user._id,
            splitType,
            splits: calculatedSplits
        });

        // ---------------------------------------------
        // POPULATE RESPONSE
        // ---------------------------------------------
        await expense.populate([
            {
                path: "paidBy",
                select: "name email"
            },
            {
                path: "splits.user",
                select: "name email"
            }
        ]);

        // ---------------------------------------------
        // SUCCESS RESPONSE
        // ---------------------------------------------
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
        })
            .populate("paidBy", "name email")
            .sort({ createdAt: -1 });

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
        const { description, amount, category, customCategory, splitType, splits } = req.body || {};

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
        const numericAmount = amount !== undefined ? Number(amount) : undefined;
        if (numericAmount !== undefined && (Number.isNaN(numericAmount) || numericAmount <= 0)) {
            throw new AppError(
                "Amount must be greater than 0",
                400
            );
        }

        // 8. Update fields
        if (description !== undefined) {
            expense.description = description.trim();
        }

        if (numericAmount !== undefined) {
            expense.amount = numericAmount;
        }

        if (category !== undefined) {
            expense.category = category;
        }
        
        if (expense.category === "Custom") {
            const finalCustomCategory = customCategory !== undefined ? customCategory : expense.customCategory;
            if (!finalCustomCategory || !finalCustomCategory.trim()) {
                throw new AppError("Please provide a custom category name", 400);
            }
            expense.customCategory = finalCustomCategory.trim();
        } else {
            expense.customCategory = undefined;
        }

        
        if (splitType !== undefined) {
            const allowedSplitTypes = ["equal", "exact", "percentage"];
            if (!allowedSplitTypes.includes(splitType)) {
                throw new AppError("Invalid split type", 400);
            }
            expense.splitType = splitType;
        }
        
        // Always recalculate splits if splitType or splits or amount is provided, 
        // to ensure it stays valid.
        if (splits !== undefined || splitType !== undefined || numericAmount !== undefined) {
            const currentSplits = splits !== undefined ? splits : expense.splits;
            if (!Array.isArray(currentSplits)) {
                throw new AppError("Splits must be an array", 400);
            }
            
            const calculateAmount = numericAmount !== undefined ? numericAmount : expense.amount;
            const calculateSplitType = splitType !== undefined ? splitType : expense.splitType;
            
            const calculatedSplits = calculateExpenseSplits({
                amount: calculateAmount,
                splitType: calculateSplitType,
                splits: currentSplits,
                memberIds: group.members
            });
            expense.splits = calculatedSplits;
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

        const group = await Group.findById(groupId).populate(
            "members",
            "name email"
        );

        if (!group) {
            throw new AppError(
                "Group not found",
                404
            );
        }

        const isMember = group.members.some(
            (member) =>
                member._id.toString() ===
                req.user._id.toString()
        );

        if (!isMember) {
            throw new AppError(
                "You are not a member of this group",
                403
            );
        }

        const expenses = await Expense.find({
            group: groupId
        });

        const settlements = await Settlement.find({
            group: groupId
        });

        const {
            totalExpense,
            memberCount,
            balances
        } = calculateGroupBalances({
            members: group.members,
            expenses,
            settlements
        });

        return res.status(200).json({
            success: true,
            groupId,

            totalExpense,

            memberCount,

            balances
        });

    } catch (err) {
        next(err);
    }
};


// GET SIMPLIFIED SETTLEMENTS
export const getSimplifiedSettlements = async (
    req,
    res,
    next
) => {
    try {
        const { groupId } = req.params;

        const group = await Group.findById(groupId).populate(
            "members",
            "name email"
        );

        if (!group) {
            throw new AppError(
                "Group not found",
                404
            );
        }

        const isMember = group.members.some(
            (member) =>
                member._id.toString() ===
                req.user._id.toString()
        );

        if (!isMember) {
            throw new AppError(
                "You are not a member of this group",
                403
            );
        }

        const expenses = await Expense.find({
            group: groupId
        });

        const settlements = await Settlement.find({
            group: groupId
        });

        const {
            totalExpense,
            memberCount,
            balances
        } = calculateGroupBalances({
            members: group.members,
            expenses,
            settlements
        });

        // --------------------------------------------------
        // DEBTORS
        // --------------------------------------------------

        const debtors = [];

        // --------------------------------------------------
        // CREDITORS
        // --------------------------------------------------

        const creditors = [];

        balances.forEach((member) => {

            if (member.balance < -0.01) {

                debtors.push({
                    ...member,
                    balance:
                        Math.abs(member.balance)
                });
            }

            if (member.balance > 0.01) {

                creditors.push({
                    ...member
                });
            }
        });

        // --------------------------------------------------
        // SIMPLIFY SETTLEMENTS
        // --------------------------------------------------

        const suggestedSettlements = [];

        let debtorIndex = 0;
        let creditorIndex = 0;

        while (
            debtorIndex < debtors.length &&
            creditorIndex < creditors.length
        ) {

            const debtor =
                debtors[debtorIndex];

            const creditor =
                creditors[creditorIndex];

            const amount = Math.min(
                debtor.balance,
                creditor.balance
            );

            if (amount > 0) {

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

                    amount: Number(
                        amount.toFixed(2)
                    )
                });
            }

            debtor.balance -= amount;

            creditor.balance -= amount;

            if (debtor.balance < 0.01) {
                debtorIndex++;
            }

            if (creditor.balance < 0.01) {
                creditorIndex++;
            }
        }

        return res.status(200).json({
            success: true,
            groupId,

            totalExpense,

            memberCount,

            transactionCount:
                suggestedSettlements.length,

            settlements:
                suggestedSettlements
        });

    } catch (err) {
        next(err);
    }
};

// GET EXPENSE ANALYTICS
export const getExpenseAnalytics = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const { startDate, endDate } = req.query;

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

        // 3. Build expense filter
        const expenseFilter = {
            group: groupId
        };

        // 4. Validate and apply start date
        if (startDate) {
            const start = new Date(startDate);

            if (isNaN(start.getTime())) {
                throw new AppError(
                    "Invalid startDate. Use YYYY-MM-DD",
                    400
                );
            }

            start.setHours(0, 0, 0, 0);

            expenseFilter.createdAt = {
                $gte: start
            };
        }

        // 5. Validate and apply end date
        if (endDate) {
            const end = new Date(endDate);

            if (isNaN(end.getTime())) {
                throw new AppError(
                    "Invalid endDate. Use YYYY-MM-DD",
                    400
                );
            }

            end.setHours(23, 59, 59, 999);

            if (expenseFilter.createdAt) {
                expenseFilter.createdAt.$lte = end;
            } else {
                expenseFilter.createdAt = {
                    $lte: end
                };
            }
        }

        // 6. Validate date range
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            if (start > end) {
                throw new AppError(
                    "startDate cannot be after endDate",
                    400
                );
            }
        }

        // 7. Get expenses
        const expenses = await Expense.find(
            expenseFilter
        ).sort({ createdAt: -1 });

        // 8. Calculate total expense
        const totalExpense = expenses.reduce(
            (total, expense) =>
                total + expense.amount,
            0
        );

        // 9. Calculate category totals
        const categoryMap = {};

        expenses.forEach((expense) => {
            let category = expense.category || "Other";
            if (category === "Custom" && expense.customCategory) {
                category = expense.customCategory;
            }

            if (!categoryMap[category]) {
                categoryMap[category] = 0;
            }

            categoryMap[category] += expense.amount;
        });

        // 10. Build category breakdown
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

        // 11. Highest spending category
        const highestCategory =
            categoryBreakdown.length > 0
                ? categoryBreakdown[0]
                : null;

        // 12. Calculate number of days in selected period
        let periodDays = null;

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);

            periodDays =
                Math.ceil(
                    (end - start) /
                    (1000 * 60 * 60 * 24)
                );
        }

        // 13. Average daily spending
        const averageDailyExpense =
            periodDays && periodDays > 0
                ? totalExpense / periodDays
                : null;

        // 14. Return analytics
        return res.status(200).json({
            success: true,
            groupId,

            period: {
                startDate: startDate || null,
                endDate: endDate || null
            },

            totalExpense: Number(
                totalExpense.toFixed(2)
            ),

            expenseCount: expenses.length,

            categoryCount: categoryBreakdown.length,

            highestCategory,

            averageDailyExpense:
                averageDailyExpense === null
                    ? null
                    : Number(
                        averageDailyExpense.toFixed(2)
                    ),

            categoryBreakdown
        });

    } catch (err) {
        next(err);
    }
};

// GET MONTHLY EXPENSE TRENDS
export const getMonthlyExpenseTrends = async (req, res, next) => {
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

        // 3. Get monthly spending using MongoDB aggregation
        const monthlyData = await Expense.aggregate([
            {
                $match: {
                    group: group._id
                }
            },

            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    total: {
                        $sum: "$amount"
                    },
                    expenseCount: {
                        $sum: 1
                    }
                }
            },

            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1
                }
            }
        ]);

        // 4. Format response
        const monthlyTrends = monthlyData.map((item) => ({
            year: item._id.year,
            month: item._id.month,
            totalExpense: Number(item.total.toFixed(2)),
            expenseCount: item.expenseCount
        }));

        // 5. Return result
        return res.status(200).json({
            success: true,
            groupId,
            monthlyTrends
        });

    } catch (err) {
        next(err);
    }
};