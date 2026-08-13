import express from "express";

import { authMiddleware } from "../middleware/auth.middleware.js";

import { createExpense, getGroupExpenses, getExpenseById, deleteExpense, updateExpense, getGroupBalances, getSimplifiedSettlements, getExpenseAnalytics, getMonthlyExpenseTrends } from "../controllers/expense.controller.js";

const router = express.Router();

// CREATE EXPENSES
router.post("/:groupId/expenses", authMiddleware, createExpense);

// GET ALL GROUP EXPENSES
router.get("/:groupId/expenses", authMiddleware, getGroupExpenses);

// GET EXPENSE ANALYTICS
router.get('/:groupId/expenses/analytics', authMiddleware, getExpenseAnalytics);

// GET MONTHLY EXPENSE TRENDS
router.get('/:groupId/expenses/monthly-trends', authMiddleware, getMonthlyExpenseTrends);

// GET EXPENSE BY ID
router.get('/:groupId/expenses/:expenseId', authMiddleware, getExpenseById);

// DELETE EXPENSES
router.delete('/:groupId/expenses/:expenseId', authMiddleware, deleteExpense);

// UPDATE EXPENSE
router.patch('/:groupId/expenses/:expenseId', authMiddleware, updateExpense);


// GET GROUP BALANCES
router.get('/:groupId/balances', authMiddleware, getGroupBalances);

// GET SIMPLIFIED SETTLEMENTS
router.get('/:groupId/simplified-settlements', authMiddleware, getSimplifiedSettlements);






export default router;