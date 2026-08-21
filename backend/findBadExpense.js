import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const expenseSchema = new mongoose.Schema({
    description: String,
    amount: Number,
    category: String,
    customCategory: String,
    group: mongoose.Schema.Types.ObjectId,
    paidBy: mongoose.Schema.Types.ObjectId,
    splitType: String,
    splits: [
        {
            user: mongoose.Schema.Types.ObjectId,
            amount: Number
        }
    ]
}, { collection: "expenses" });

const Expense = mongoose.model("Expense", expenseSchema);

async function findBadExpenses() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.");

        const expenses = await Expense.find();
        let found = false;

        for (const expense of expenses) {
            const splitSum = expense.splits.reduce((sum, split) => sum + (split.amount || 0), 0);
            
            // Check for tolerance to avoid floating point issues
            if (Math.abs(splitSum - expense.amount) > 0.01) {
                console.log(`\n[BAD EXPENSE FOUND]`);
                console.log(`ID: ${expense._id}`);
                console.log(`Description: ${expense.description}`);
                console.log(`Amount: ${expense.amount}`);
                console.log(`Sum of Splits: ${splitSum}`);
                console.log(`Splits:`, JSON.stringify(expense.splits, null, 2));
                found = true;
            }
        }

        if (!found) {
            console.log("No bad expenses found. All expenses have splits matching the total amount.");
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}

findBadExpenses();
