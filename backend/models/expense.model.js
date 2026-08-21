import mongoose from "mongoose";

const expenseSplitSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        amount: {
            type: Number,
            required: true,
            min: [0, "Split amount cannot be negative"]
        }
    },
    {
        _id: false
    }
);

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
                "Other",
                "Custom"
            ],
            default: "Other"
        },
        
        customCategory: {
            type: String,
            trim: true,
            maxLength: [50, "Custom category cannot exceed 50 characters"]
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
        },

        splitType: {
            type: String,
            enum: [
                "equal",
                "exact",
                "percentage"
            ],
            default: "equal"
        },

        splits: {
            type: [expenseSplitSchema],
            default: []
        }
    },
    {
        timestamps: true
    }
);

const Expense = mongoose.model(
    "Expense",
    expenseSchema
);

export default Expense;