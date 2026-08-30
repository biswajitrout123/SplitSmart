import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import { logger } from "./utils/logger.js";

dotenv.config();

process.on("uncaughtException", (err) => {
    logger.error("UNCAUGHT EXCEPTION! 💥 Shutting down...", {}, err);
    process.exit(1);
});

connectDB();

const server = app.listen(3000, () => {
    logger.info("Server is running on port 3000");
});

process.on("unhandledRejection", (err) => {
    logger.error("UNHANDLED REJECTION! 💥 Shutting down...", {}, err);
    server.close(() => {
        process.exit(1);
    });
});