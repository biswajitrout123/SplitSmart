import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../components/layouts/DashboardLayout";

import { getGroupById } from "../services/group.service";

import { getGroupExpenses, createExpense } from "../services/expense.service";

const Expenses = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();

    const [group, setGroup] = useState(null);
    const [expenses, setExpenses] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        description: "",
        amount: "",
        category: "Other"
    });

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadExpenses = async () => {
            try {
                setLoading(true);
                setError("");

                const [groupData, expenseData] = await Promise.all([
                    getGroupById(groupId),
                    getGroupExpenses(groupId)
                ]);

                setGroup(groupData.group);
                setExpenses(expenseData.expenses || []);
            } catch (err) {
                console.error(err);

                setError(
                    err.response?.data?.message ||
                    "Failed to load expenses"
                );
            } finally {
                setLoading(false);
            }
        };

        if (groupId) {
            loadExpenses();
        }
    }, [groupId]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreateExpense = async (e) => {
        e.preventDefault();

        if (!formData.description.trim()) {
            setError("Please enter an expense description");
            return;
        }

        if (!formData.amount || Number(formData.amount) <= 0) {
            setError("Please enter a valid amount");
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            const data = await createExpense(groupId, {
                description: formData.description.trim(),
                amount: Number(formData.amount),
                category: formData.category
            });

            setExpenses((prev) => [
                data.expense,
                ...prev
            ]);

            setFormData({
                description: "",
                amount: "",
                category: "Other"
            });

            setShowForm(false);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to create expense"
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-8">
                    <button
                        type="button"
                        onClick={() => navigate(`/groups/${groupId}`)}
                        className="mb-5 text-sm text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                        ← Back to group
                    </button>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Expenses
                            </p>

                            <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                                {group?.name || "Group expenses"}
                            </h1>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Track shared spending for this group.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowForm((prev) => !prev)}
                            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                        >
                            {showForm ? "Cancel" : "+ Add expense"}
                        </button>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
                        <p className="text-sm text-red-600 dark:text-red-400">
                            {error}
                        </p>
                    </div>
                )}

                {/* Create expense form */}
                {showForm && (
                    <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">

                        <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                            Add expense
                        </h2>

                        <form
                            onSubmit={handleCreateExpense}
                            className="mt-5 grid gap-4 md:grid-cols-3"
                        >
                            <div>
                                <label className="mb-1.5 block text-sm text-slate-600 dark:text-slate-300">
                                    Description
                                </label>

                                <input
                                    type="text"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Dinner, hotel, cab..."
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm text-slate-600 dark:text-slate-300">
                                    Amount
                                </label>

                                <input
                                    type="number"
                                    name="amount"
                                    min="0.01"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm text-slate-600 dark:text-slate-300">
                                    Category
                                </label>

                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                >
                                    <option value="Food">Food</option>
                                    <option value="Travel">Travel</option>
                                    <option value="Transport">Transport</option>
                                    <option value="Entertainment">
                                        Entertainment
                                    </option>
                                    <option value="Shopping">Shopping</option>
                                    <option value="Bills">Bills</option>
                                    <option value="Health">Health</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="md:col-span-3">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900"
                                >
                                    {submitting
                                        ? "Adding..."
                                        : "Add expense"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Loading expenses...
                        </p>
                    </div>
                )}

                {/* Empty */}
                {!loading && expenses.length === 0 && (
                    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                            No expenses yet
                        </h2>

                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            Add your first shared expense to start tracking
                            the group.
                        </p>
                    </div>
                )}

                {/* Expenses */}
                {!loading && expenses.length > 0 && (
                    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">

                        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <h2 className="font-medium text-slate-900 dark:text-white">
                                    Expense history
                                </h2>

                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                    {expenses.length} expenses
                                </span>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-200 dark:divide-slate-800">
                            {expenses.map((expense) => (
                                <div
                                    key={expense._id}
                                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                                            {expense.description}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            {expense.category || "Other"}
                                            {" · "}
                                            Paid by{" "}
                                            {expense.paidBy?.name ||
                                                "Unknown"}
                                        </p>

                                        {expense.createdAt && (
                                            <p className="mt-1 text-xs text-slate-400">
                                                {new Date(
                                                    expense.createdAt
                                                ).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>

                                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                                        ₹{Number(expense.amount).toFixed(2)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
};

export default Expenses;