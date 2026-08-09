import express from 'express'

import { authMiddleware } from "../middleware/auth.middleware.js";
import { addMember, createGroup, getGroupById, getMyGroups } from '../controllers/group.controller.js'

const router = express.Router();

router.post("/", authMiddleware, createGroup);
router.get('/', authMiddleware, getMyGroups);
router.get('/:groupId', authMiddleware, getGroupById);
router.post('/:groupId/members', authMiddleware, addMember);

export default router;