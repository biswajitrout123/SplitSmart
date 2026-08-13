import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
    {
        description: {
            type: String,
            required: [true, "Please provide expense description"],
            trim: true,
            maxLength: [
                200,
                "Expense description cannot exceed 200 characters"
            ]
        },

        amount: {
            type: Number,
            required: [true, "Please provide expense amount"],
            min: [0.01, "Expense amount must be greater than 0"]
        },

        category: {
            type: String,
            enum: [
                "Food",
                "Travel",
                "Transport",
                "Entertainment",
                "Shopping",
                "Bills",
                "Health",
                "Other"
            ],
            default: "Other"
        },

        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: true
        },

        paidBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;