import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";
import { logger } from "./utils/logger.js";

process.on("uncaughtException", (err) => {
    logger.error("UNCAUGHT EXCEPTION! 💥 Shutting down...", {}, err);
    process.exit(1);
});

connectDB();

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, "0.0.0.0", () => {
    logger.info(`Server is running on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
    logger.error("UNHANDLED REJECTION! 💥 Shutting down...", {}, err);
    server.close(() => {
        process.exit(1);
    });
});