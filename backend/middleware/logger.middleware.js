import { logger } from "../utils/logger.js";

export const requestLogger = (req, res, next) => {
    // Skip logging tests if needed, but requirements ask to log
    // We can conditionally skip if process.env.NODE_ENV === 'test' to keep test output clean,
    // but a good logger shouldn't hurt. We'll disable it in tests for cleaner output.
    if (process.env.NODE_ENV === "test") {
        return next();
    }

    const startTime = Date.now();
    
    // Log once response finishes
    res.on("finish", () => {
        const duration = Date.now() - startTime;
        const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
        
        logger[level](`${req.method} ${req.originalUrl}`, {
            statusCode: res.statusCode,
            method: req.method,
            route: req.originalUrl,
            duration: `${duration}ms`,
            ip: req.ip
        });
    });
    
    next();
};
