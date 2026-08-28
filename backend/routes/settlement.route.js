import express from "express";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { validateRequest } from '../middleware/validation.middleware.js';
import { createSettlementValidator } from '../utils/validators.js';

import { createSettlement, deleteSettlement, getGroupSettlements, getSettlementSummary } from "../controllers/settlement.controller.js";

const router = express.Router();


// CREATE SETTLEMENT
router.post("/:groupId/settlements", authMiddleware, createSettlementValidator, validateRequest, createSettlement);
// GET GROUP SETTLEMENTS
router.get('/:groupId/settlements', authMiddleware, getGroupSettlements);
// GET SETTLEMENT SUMMARY
router.get("/:groupId/settlements/summary", authMiddleware, getSettlementSummary);
// DELETE SETTLEMENT
router.delete("/:groupId/settlements/:settlementId", authMiddleware, deleteSettlement);


export default router;