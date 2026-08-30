import mongoose from "mongoose";

const settlementSchema = new mongoose.Schema(
    {
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: true
        },

        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        to: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        amount: {
            type: Number,
            required: true,
            min: 0.01
        }
    },
    {
        timestamps: true
    }
);

// Compound index for finding settlements in a group
settlementSchema.index({ group: 1, createdAt: -1 });

const Settlement = mongoose.model("Settlement", settlementSchema);

export default Settlement;