import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
    {
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: true
        },
        type: {
            type: String,
            enum: [
                "expense_added",
                "expense_edited",
                "expense_deleted",
                "settlement_recorded",
                "settlement_deleted"
            ],
            required: true
        },
        message: {
            type: String,
            required: true
        },
        actorId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        actorName: {
            type: String,
            required: true
        },
        referenceId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        amount: {
            type: Number
        },
        receiverName: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

// Compound index for querying a group's activity sorted by newest
activitySchema.index({ group: 1, createdAt: -1 });

const Activity = mongoose.model("Activity", activitySchema);

export default Activity;
