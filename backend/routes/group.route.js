import express from 'express'

import { authMiddleware } from "../middleware/auth.middleware.js";
import { createGroup } from '../controllers/group.controller.js'

const router = express.Router();

router.post("/", authMiddleware, createGroup)

export default router;