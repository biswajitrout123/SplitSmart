import express from 'express'

import { authMiddleware } from "../middleware/auth.middleware.js";
import { createGroup, getMyGroups } from '../controllers/group.controller.js'

const router = express.Router();

router.post("/", authMiddleware, createGroup);
router.get('/', authMiddleware, getMyGroups);

export default router;