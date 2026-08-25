import express from "express";
import { authMiddleware as protect } from "../middleware/auth.middleware.js";
import {
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    sendDebtReminder
} from "../controllers/notification.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", getUserNotifications);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markAsRead);

// The reminder endpoint is technically related to groups, but we can mount it in group.route.js or here.
// The plan said: `POST /api/groups/:groupId/remind`.
// So we will export this separately or mount it properly.
// Let's just export sendDebtReminder to be mounted in group.route.js

export default router;
