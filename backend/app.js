import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth.route.js";
import groupRoutes from "./routes/group.route.js";
import expenseRoutes from "./routes/expense.route.js";
import settlementRoutes from "./routes/settlement.route.js";
import activityRoutes from "./routes/activity.route.js";

import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();

// ================================
// MIDDLEWARE
// ================================

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ================================
// ROUTES
// ================================

app.use("/api/auth", authRouter);
app.use("/api/groups", groupRoutes);
app.use("/api/groups", expenseRoutes);
app.use("/api/groups", settlementRoutes);
app.use("/api/groups", activityRoutes);

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