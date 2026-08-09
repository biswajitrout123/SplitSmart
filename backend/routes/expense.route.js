import express from "express";

import { authMiddleware } from "../middleware/auth.middleware.js";

import { createExpense, getGroupExpenses, getExpenseById, deleteExpense, updateExpense, getGroupBalances } from "../controllers/expense.controller.js";

const router = express.Router();

// CREATE EXPENSES
router.post("/:groupId/expenses", authMiddleware, createExpense);

// GET ALL GROUP EXPENSES
router.get("/:groupId/expenses", authMiddleware, getGroupExpenses);

// GET EXPENSE BY ID
router.get('/:groupId/expenses/:expenseId', authMiddleware, getExpenseById);

// DELETE EXPENSES
router.delete('/:groupId/expenses/:expenseId', authMiddleware, deleteExpense);

// UPDATE EXPENSE
router.patch('/:groupId/expenses/:expenseId', authMiddleware, updateExpense);

// DELETE EXPENSE
router.delete('/:groupId/expenses/:expenseId', authMiddleware, deleteExpense);

// GET GROUP BALANCES
router.get('/:groupId/balances', authMiddleware, getGroupBalances);




export default router;