import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: true
        },
        type: {
            type: String,
            enum: ["expense_added", "expense_edited", "settlement_recorded", "debt_reminder"],
            required: true
        },
        message: {
            type: String,
            required: true
        },
        referenceId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true
        }
    },
    { timestamps: true }
);

// Compound index for querying a user's notifications efficiently
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
