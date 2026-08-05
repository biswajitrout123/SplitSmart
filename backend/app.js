import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

// Health Check Route
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "SplitSmart API is running"
    });
});

export default app;