import { logger } from "../utils/logger.js";

export const errorMiddleware = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Mongoose bad ObjectId
    if (err.name === "CastError") {
        message = "Resource not found";
        statusCode = 404;
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        message = "Duplicate field value entered";
        statusCode = 400;
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map(val => val.message);
        message = "Invalid input data: " + errors.join(", ");
        statusCode = 400;
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        message = "Invalid token. Please log in again.";
        statusCode = 401;
    }
    if (err.name === "TokenExpiredError") {
        message = "Your token has expired. Please log in again.";
        statusCode = 401;
    }

    // Hide internal server error details in production
    const isProduction = process.env.NODE_ENV === "production";
    if (statusCode === 500 && isProduction) {
        message = "Internal Server Error";
    }

    // Log the error
    if (process.env.NODE_ENV !== "test") {
        logger.error(`Error on ${req.method} ${req.originalUrl}`, {
            statusCode,
            method: req.method,
            route: req.originalUrl
        }, err);
    }

    return res.status(statusCode).json({
        success: false,
        message,
        // Only include stack trace if not in production
        ...( !isProduction && { stack: err.stack } )
    });
};