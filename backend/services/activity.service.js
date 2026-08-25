import Activity from "../models/activity.model.js";
import Notification from "../models/notification.model.js";
import Group from "../models/group.model.js";

/**
 * Log an activity event and dispatch notifications.
 * This is designed as a "best-effort" fire-and-forget helper.
 */
export const logActivity = async ({
    groupId,
    type,
    message,
    actorId,
    actorName,
    referenceId,
    amount,
    receiverName,
    involvedUsers = [],
    receiverId = null
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

        // ======================================
        // NOTIFICATIONS DISPATCH
        // ======================================
        const group = await Group.findById(groupId).select("members");
        if (!group) return;

        let targetUsers = [];

        if (type === "expense_added") {
            // Notify all group members except the actor
            targetUsers = group.members.filter(id => id.toString() !== actorId.toString());
        } else if (type === "expense_edited") {
            // Notify only involved users except the actor
            targetUsers = involvedUsers.filter(id => id.toString() !== actorId.toString());
        } else if (type === "settlement_recorded") {
            // Notify the receiver
            if (receiverId && receiverId.toString() !== actorId.toString()) {
                targetUsers = [receiverId];
            }
        }
        
        // Exclude deletion events for notifications
        if (type === "expense_deleted" || type === "settlement_deleted") {
            return;
        }

        // Process each target user with deduplication
        for (const userId of targetUsers) {
            const existingNotification = await Notification.findOne({
                user: userId,
                type,
                referenceId
            });

            if (existingNotification) {
                if (!existingNotification.isRead) {
                    // Update unread notification (bump to top)
                    existingNotification.message = message;
                    existingNotification.updatedAt = Date.now();
                    await existingNotification.save();
                } else {
                    // Create a new notification if the old one was already read
                    await Notification.create({
                        user: userId,
                        group: groupId,
                        type,
                        message,
                        referenceId
                    });
                }
            } else {
                // Create a brand new notification
                await Notification.create({
                    user: userId,
                    group: groupId,
                    type,
                    message,
                    referenceId
                });
            }
        }

    } catch (error) {
        console.error(`[Activity/Notification Error] Failed to log/dispatch ${type} for group ${groupId}:`, error);
        // Do not throw error to ensure the primary transaction (expense/settlement) succeeds
    }
};
