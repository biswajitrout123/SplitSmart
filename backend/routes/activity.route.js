import express from "express";
import { getGroupActivity } from "../controllers/activity.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router({ mergeParams: true });

// Require authentication for all routes
router.use(authMiddleware);

router.route("/:groupId/activities").get(getGroupActivity);

export default router;
