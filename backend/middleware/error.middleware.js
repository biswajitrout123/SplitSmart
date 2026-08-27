export const errorMiddleware = (err, req, res, next) => {
    console.error(err);

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

    // Hide internal server error details in production-like logic
    if (statusCode === 500 && !err.isOperational) {
        message = "Internal Server Error";
    }

    return res.status(statusCode).json({
        success: false,
        message
    });
};