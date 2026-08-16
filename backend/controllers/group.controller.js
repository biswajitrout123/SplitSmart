import Group from "../models/group.model.js";
import User from "../models/user.model.js";
import Expense from "../models/expense.model.js";
import Settlement from "../models/settlement.model.js";
import AppError from "../utils/AppError.js";

export const createGroup = async (req, res) => {
    try {
        const { name, description } = req.body;

        // 1. Validate group name
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Please provide a group name"
            });
        }

        // 2. Create group
        const group = await Group.create({
            name,
            description,
            createdBy: req.user._id,
            members: [req.user._id]
        });
        // 3. Return success
        return res.status(201).json({
            success: true,
            message: "Group created successfully",
            group
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};



export const getMyGroups = async (req, res) => {
    try {

        const groups = await Group.find({
            members: req.user._id
        }).sort({ createdAt: -1 });

        // 2. Return groups
        return res.status(200).json({
            success: true,
            count: groups.length,
            groups
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};




export const getGroupById = async (req, res) => {
    try {

        // 1. Get group ID from URL 
        const { groupId } = req.params;

        // 2. Find group
        const group = await Group.findById(groupId);

        // 3. Check if group exists
        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Group not found"
            });
        }

        // 4. Check if logged-in user is a member
        const isMember = group.members.some(
            (memberId) => memberId.toString() == req.user._id.toString()
        );
        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: "You are not a member of this group"
            });
        }
        // 5. Return group
        return res.status(200).json({
            success: true,
            group
        });



    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};



export const addMember = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { email, userId } = req.body;

        // 1. Validate that email or userId was provided
        if (!email && !userId) {
            return res.status(400).json({
                success: false,
                message: "Please provide a user email or user ID"
            });
        }

        // 2. Find group
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Group not found"
            });
        }

        // 3. Only group creator can add members
        if (
            group.createdBy.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "Only the group creator can add members"
            });
        }

        // 4. Find the user
        let user;

        if (email) {
            user = await User.findOne({
                email: email.trim().toLowerCase()
            }).select("_id name email");
        } else if (userId) {
            user = await User.findById(userId).select(
                "_id name email"
            );
        }

        // 5. User not found
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // 6. Prevent duplicate member
        const alreadyMember = group.members.some(
            (memberId) =>
                memberId.toString() === user._id.toString()
        );

        if (alreadyMember) {
            return res.status(400).json({
                success: false,
                message: "User is already a member of this group"
            });
        }

        // 7. Add member
        group.members.push(user._id);

        // 8. Save
        await group.save();

        // 9. Fetch updated group with member details
        const updatedGroup = await Group.findById(groupId)
            .populate("members", "name email")
            .populate("createdBy", "name email");

        // 10. Return
        return res.status(200).json({
            success: true,
            message: "Member added successfully",
            group: updatedGroup
        });

    } catch (err) {
        console.error("ADD MEMBER ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};





// GET GROUP DASHBOARD
export const getGroupDashboard = async (req, res, next) => {
    try {
        const { groupId } = req.params;

        // 1. Find group and populate members
        const group = await Group.findById(groupId)
            .populate("members", "name email")
            .populate("createdBy", "name email");

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
        })
            .populate("paidBy", "name email")
            .sort({ createdAt: -1 });

        // 4. Get settlements
        const settlements = await Settlement.find({
            group: groupId
        })
            .populate("from", "name email")
            .populate("to", "name email")
            .sort({ createdAt: -1 });

        // 5. Total expense
        const totalExpense = expenses.reduce(
            (total, expense) => total + expense.amount,
            0
        );

        // 6. Member share
        const memberCount = group.members.length;

        const sharePerMember =
            memberCount > 0
                ? totalExpense / memberCount
                : 0;

        // 7. Calculate balances
        const balances = group.members.map((member) => {

            const paid = expenses
                .filter(
                    (expense) =>
                        expense.paidBy._id.toString() ===
                        member._id.toString()
                )
                .reduce(
                    (total, expense) =>
                        total + expense.amount,
                    0
                );

            let balance = paid - sharePerMember;

            // Apply settlements
            settlements.forEach((settlement) => {

                // Member paid someone
                if (
                    settlement.from._id.toString() ===
                    member._id.toString()
                ) {
                    balance += settlement.amount;
                }

                // Member received money
                if (
                    settlement.to._id.toString() ===
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

        // 8. Category analytics
        const categoryMap = {};

        expenses.forEach((expense) => {

            const category =
                expense.category || "Other";

            if (!categoryMap[category]) {
                categoryMap[category] = 0;
            }

            categoryMap[category] += expense.amount;
        });

        const categoryBreakdown = Object.entries(
            categoryMap
        )
            .map(([category, amount]) => ({
                category,
                amount: Number(amount.toFixed(2)),
                percentage:
                    totalExpense === 0
                        ? 0
                        : Number(
                            (
                                (amount / totalExpense) *
                                100
                            ).toFixed(2)
                        )
            }))
            .sort((a, b) => b.amount - a.amount);

        // 9. Highest spending category
        const highestCategory =
            categoryBreakdown.length > 0
                ? categoryBreakdown[0]
                : null;

        // 10. Monthly trends
        const monthlyData = await Expense.aggregate([
            {
                $match: {
                    group: group._id
                }
            },
            {
                $group: {
                    _id: {
                        year: {
                            $year: "$createdAt"
                        },
                        month: {
                            $month: "$createdAt"
                        }
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

        const monthlyTrends = monthlyData.map(
            (item) => ({
                year: item._id.year,
                month: item._id.month,
                totalExpense: Number(
                    item.total.toFixed(2)
                ),
                expenseCount: item.expenseCount
            })
        );

        // 11. Recent expenses
        const recentExpenses = expenses
            .slice(0, 5)
            .map((expense) => ({
                _id: expense._id,
                description: expense.description,
                amount: expense.amount,
                category: expense.category,
                paidBy: expense.paidBy,
                createdAt: expense.createdAt,
                updatedAt: expense.updatedAt
            }));

        // 12. Recent settlements
        const recentSettlements = settlements
            .slice(0, 5)
            .map((settlement) => ({
                _id: settlement._id,
                from: settlement.from,
                to: settlement.to,
                amount: settlement.amount,
                createdAt: settlement.createdAt,
                updatedAt: settlement.updatedAt
            }));

        // 13. Return dashboard
        return res.status(200).json({
            success: true,

            group: {
                _id: group._id,
                name: group.name,
                description: group.description,
                createdBy: group.createdBy,
                memberCount: group.members.length,
                members: group.members
            },

            financialSummary: {
                totalExpense: Number(
                    totalExpense.toFixed(2)
                ),
                sharePerMember: Number(
                    sharePerMember.toFixed(2)
                ),
                expenseCount: expenses.length,
                settlementCount: settlements.length
            },

            highestCategory,

            categoryBreakdown,

            balances,

            recentExpenses,

            recentSettlements,

            monthlyTrends
        });

    } catch (err) {
        next(err);
    }
};