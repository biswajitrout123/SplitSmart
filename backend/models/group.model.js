import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please provide a group name"],
            trim: true,
            maxLength: [100, "Group name cannot exceed 100 characters"]
        },
        description: {
            type: String,
            required: true,
            trim: true,
            maxLength: [500, "Description cannot exceed 500 characters"]
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ]
    },
    {
        timestamps: true
    }
);

const Group = mongoose.model("Group", groupSchema);
export default Group;