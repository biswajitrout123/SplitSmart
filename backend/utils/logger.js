export const maskSensitiveData = (data) => {
    if (!data) return data;
    if (typeof data !== "object") return data;

    const masked = Array.isArray(data) ? [...data] : { ...data };
    const sensitiveFields = ["password", "token", "cookie", "authorization", "secret", "jwt", "newpassword", "currentpassword"];
    
    for (const key in masked) {
        if (typeof masked[key] === "object" && masked[key] !== null) {
            masked[key] = maskSensitiveData(masked[key]);
        } else if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
            masked[key] = "[FILTERED]";
        }
    }
    return masked;
};

const formatMessage = (level, msg, context = {}) => {
    const timestamp = new Date().toISOString();
    const safeContext = maskSensitiveData(context);
    const contextStr = Object.keys(safeContext).length ? JSON.stringify(safeContext) : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${msg} ${contextStr}`;
};

export const logger = {
    info: (msg, context) => console.log(formatMessage("info", msg, context)),
    warn: (msg, context) => console.warn(formatMessage("warn", msg, context)),
    error: (msg, context, err) => {
        const errorDetails = err ? { 
            name: err.name, 
            message: err.message, 
            stack: process.env.NODE_ENV === "production" ? undefined : err.stack 
        } : {};
        console.error(formatMessage("error", msg, { ...context, ...errorDetails }));
    }
};
