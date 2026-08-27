import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRouter from "./routes/auth.route.js";
import groupRoutes from "./routes/group.route.js";
import expenseRoutes from "./routes/expense.route.js";
import settlementRoutes from "./routes/settlement.route.js";
import activityRoutes from "./routes/activity.route.js";
import notificationRoutes from "./routes/notification.route.js";

import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();

// ================================
// MIDDLEWARE
// ================================

app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true
    })
);

// Security headers
app.use(helmet());

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 200 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests from this IP, please try again later."
    }
});
app.use("/api", limiter);

// ================================
// ROUTES
// ================================

app.use("/api/auth", authRouter);
app.use("/api/groups", groupRoutes);
app.use("/api/groups", expenseRoutes);
app.use("/api/groups", settlementRoutes);
app.use("/api/groups", activityRoutes);
app.use("/api/notifications", notificationRoutes);

// ================================
// HEALTH CHECK
// ================================

app.get("/api/health", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "SplitSmart API is running"
    });
});

// ================================
// GLOBAL ERROR HANDLER
// ================================

app.use(errorMiddleware);

export default app;