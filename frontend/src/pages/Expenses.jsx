import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../components/layouts/DashboardLayout";

import { getGroupById } from "../services/group.service";

import {
    getGroupExpenses,
    createExpense,
    updateExpense,
    deleteExpense
} from "../services/expense.service";

const Expenses = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();

    const [group, setGroup] = useState(null);
    const [expenses, setExpenses] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Edit state
    const [editingExpense, setEditingExpense] = useState(null);
    const [savingEdit, setSavingEdit] = useState(false);

    // Delete state
    const [deletingExpenseId, setDeletingExpenseId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [formData, setFormData] = useState({
        description: "",
        amount: "",
        category: "Other"
    });

    // ---------------------------------------------------
    // LOAD GROUP + EXPENSES
    // ---------------------------------------------------
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

    useEffect(() => {
        if (groupId) {
            loadExpenses();
        }
    }, [groupId]);

    // ---------------------------------------------------
    // FORM CHANGE
    // ---------------------------------------------------
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // ---------------------------------------------------
    // RESET FORM
    // ---------------------------------------------------
    const resetForm = () => {
        setFormData({
            description: "",
            amount: "",
            category: "Other"
        });
    };

    // ---------------------------------------------------
    // CREATE EXPENSE
    // ---------------------------------------------------
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

            await createExpense(groupId, {
                description: formData.description.trim(),
                amount: Number(formData.amount),
                category: formData.category
            });

            resetForm();
            setShowForm(false);

            // Reload so paidBy is populated correctly
            await loadExpenses();

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

    // ---------------------------------------------------
    // START EDIT
    // ---------------------------------------------------
    const handleEditStart = (expense) => {
        setError("");

        setEditingExpense(expense);

        setFormData({
            description: expense.description || "",
            amount: expense.amount?.toString() || "",
            category: expense.category || "Other"
        });

        setShowForm(false);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // ---------------------------------------------------
    // CANCEL EDIT
    // ---------------------------------------------------
    const handleCancelEdit = () => {
        setEditingExpense(null);
        resetForm();
        setError("");
    };

    // ---------------------------------------------------
    // UPDATE EXPENSE
    // ---------------------------------------------------
    const handleUpdateExpense = async (e) => {
        e.preventDefault();

        if (!editingExpense) {
            return;
        }

        if (!formData.description.trim()) {
            setError("Please enter an expense description");
            return;
        }

        if (!formData.amount || Number(formData.amount) <= 0) {
            setError("Please enter a valid amount");
            return;
        }

        try {
            setSavingEdit(true);
            setError("");

            await updateExpense(
                groupId,
                editingExpense._id,
                {
                    description: formData.description.trim(),
                    amount: Number(formData.amount),
                    category: formData.category
                }
            );

            setEditingExpense(null);
            resetForm();

            // Reload populated data
            await loadExpenses();

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to update expense"
            );
        } finally {
            setSavingEdit(false);
        }
    };

    // ---------------------------------------------------
    // DELETE CONFIRMATION
    // ---------------------------------------------------
    const handleDeleteClick = (expenseId) => {
        setError("");
        setDeletingExpenseId(expenseId);
    };

    // ---------------------------------------------------
    // CANCEL DELETE
    // ---------------------------------------------------
    const handleCancelDelete = () => {
        setDeletingExpenseId(null);
    };

    // ---------------------------------------------------
    // DELETE EXPENSE
    // ---------------------------------------------------
    const handleDeleteExpense = async () => {
        if (!deletingExpenseId) {
            return;
        }

        try {
            setDeleting(true);
            setError("");

            await deleteExpense(
                groupId,
                deletingExpenseId
            );

            setDeletingExpenseId(null);

            // Reload after delete
            await loadExpenses();

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to delete expense"
            );
        } finally {
            setDeleting(false);
        }
    };

    // ---------------------------------------------------
    // FORM
    // ---------------------------------------------------
    const renderForm = () => (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">

            <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                    {editingExpense
                        ? "Edit expense"
                        : "Add expense"}
                </h2>

                {editingExpense && (
                    <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="text-sm text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                        Cancel
                    </button>
                )}
            </div>

            <form
                onSubmit={
                    editingExpense
                        ? handleUpdateExpense
                        : handleCreateExpense
                }
                className="mt-5 grid gap-4 md:grid-cols-3"
            >
                {/* DESCRIPTION */}
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
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                </div>

                {/* AMOUNT */}
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
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                </div>

                {/* CATEGORY */}
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
                        <option value="Transport">
                            Transport
                        </option>
                        <option value="Entertainment">
                            Entertainment
                        </option>
                        <option value="Shopping">
                            Shopping
                        </option>
                        <option value="Bills">Bills</option>
                        <option value="Health">Health</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                {/* BUTTON */}
                <div className="flex gap-3 md:col-span-3">
                    <button
                        type="submit"
                        disabled={
                            submitting ||
                            savingEdit
                        }
                        className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                    >
                        {editingExpense
                            ? savingEdit
                                ? "Saving..."
                                : "Save changes"
                            : submitting
                                ? "Adding..."
                                : "Add expense"}
                    </button>

                    {editingExpense && (
                        <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );

    return (
        <DashboardLayout>
            <div className="mx-auto max-w-7xl">

                {/* HEADER */}
                <div className="mb-8">
                    <button
                        type="button"
                        onClick={() =>
                            navigate(`/groups/${groupId}`)
                        }
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
                                {group?.name ||
                                    "Group expenses"}
                            </h1>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Track shared spending for this group.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setEditingExpense(null);
                                resetForm();
                                setShowForm(
                                    (prev) => !prev
                                );
                            }}
                            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                        >
                            {showForm
                                ? "Cancel"
                                : "+ Add expense"}
                        </button>
                    </div>
                </div>

                {/* ERROR */}
                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
                        <p className="text-sm text-red-600 dark:text-red-400">
                            {error}
                        </p>
                    </div>
                )}

                {/* CREATE / EDIT FORM */}
                {(showForm || editingExpense) &&
                    renderForm()}

                {/* LOADING */}
                {loading && (
                    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Loading expenses...
                        </p>
                    </div>
                )}

                {/* EMPTY */}
                {!loading &&
                    expenses.length === 0 && (
                        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">

                            <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                                No expenses yet
                            </h2>

                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                Add your first shared expense
                                to start tracking the group.
                            </p>
                        </div>
                    )}

                {/* EXPENSE LIST */}
                {!loading &&
                    expenses.length > 0 && (
                        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">

                            {/* LIST HEADER */}
                            <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <h2 className="font-medium text-slate-900 dark:text-white">
                                        Expense history
                                    </h2>

                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        {expenses.length}{" "}
                                        {expenses.length === 1
                                            ? "expense"
                                            : "expenses"}
                                    </span>
                                </div>
                            </div>

                            {/* EXPENSES */}
                            <div className="divide-y divide-slate-200 dark:divide-slate-800">
                                {expenses.map(
                                    (expense) => (
                                        <div
                                            key={expense._id}
                                            className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            {/* INFO */}
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                    {
                                                        expense.description
                                                    }
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                    {
                                                        expense.category
                                                    }
                                                    {" · "}
                                                    Paid by{" "}
                                                    {expense
                                                        .paidBy
                                                        ?.name ||
                                                        "Unknown"}
                                                </p>

                                                {expense.createdAt && (
                                                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                                        {new Date(
                                                            expense.createdAt
                                                        ).toLocaleDateString(
                                                            "en-IN"
                                                        )}
                                                    </p>
                                                )}
                                            </div>

                                            {/* RIGHT SIDE */}
                                            <div className="flex items-center justify-between gap-4 sm:justify-end">

                                                <p className="text-base font-semibold text-slate-900 dark:text-white">
                                                    ₹
                                                    {Number(
                                                        expense.amount
                                                    ).toFixed(
                                                        2
                                                    )}
                                                </p>

                                                <div className="flex items-center gap-2">

                                                    {/* EDIT */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleEditStart(
                                                                expense
                                                            )
                                                        }
                                                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                                                    >
                                                        Edit
                                                    </button>

                                                    {/* DELETE */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteClick(
                                                                expense._id
                                                            )
                                                        }
                                                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    )}

                {/* DELETE CONFIRMATION */}
                {deletingExpenseId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

                        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">

                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Delete expense?
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                This expense will be permanently
                                removed from this group. This action
                                cannot be undone.
                            </p>

                            <div className="mt-6 flex justify-end gap-3">

                                <button
                                    type="button"
                                    onClick={
                                        handleCancelDelete
                                    }
                                    disabled={deleting}
                                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={
                                        handleDeleteExpense
                                    }
                                    disabled={deleting}
                                    className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {deleting
                                        ? "Deleting..."
                                        : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Expenses;