import Activity from "../models/activity.model.js";

/**
 * Log an activity event.
 * This is designed as a "best-effort" fire-and-forget helper.
 * Any errors are caught and logged so they do not interrupt core business logic.
 */
export const logActivity = async ({
    groupId,
    type,
    message,
    actorId,
    actorName,
    referenceId,
    amount,
    receiverName
}) => {
    try {
        await Activity.create({
            group: groupId,
            type,
            message,
            actorId,
            actorName,
            referenceId,
            amount,
            receiverName
        });
    } catch (error) {
        console.error(`[Activity Log Error] Failed to log ${type} for group ${groupId}:`, error);
        // Do not throw error to ensure the primary transaction (expense/settlement) succeeds
    }
};
