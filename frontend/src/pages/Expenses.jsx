import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../components/layouts/DashboardLayout";

import { getGroupById } from "../services/group.service";

import {
    getGroupExpenses,
    createExpense,
    updateExpense,
    deleteExpense
} from "../services/expense.service";

const SPLIT_TYPES = {
    EQUAL: "equal",
    EXACT: "exact",
    PERCENTAGE: "percentage"
};

const CATEGORIES = [
    "Food",
    "Travel",
    "Transport",
    "Entertainment",
    "Shopping",
    "Bills",
    "Health",
    "Other",
    "Custom"
];

const Expenses = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();

    // =====================================================
    // DATA
    // =====================================================

    const [group, setGroup] = useState(null);
    const [expenses, setExpenses] = useState([]);

    // =====================================================
    // PAGE STATE
    // =====================================================

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =====================================================
    // CREATE FORM STATE
    // =====================================================

    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // =====================================================
    // EDIT STATE
    // =====================================================

    const [editingExpense, setEditingExpense] = useState(null);
    const [savingEdit, setSavingEdit] = useState(false);

    // =====================================================
    // VIEW DETAILS STATE
    // =====================================================
    const [viewingExpense, setViewingExpense] = useState(null);

    // =====================================================
    // DELETE STATE
    // =====================================================

    const [deletingExpenseId, setDeletingExpenseId] =
        useState(null);

    const [deleting, setDeleting] = useState(false);

    // =====================================================
    // FILTER STATE
    // =====================================================

    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [filterPayer, setFilterPayer] = useState("");
    const [filterSplitType, setFilterSplitType] = useState("");

    const clearFilters = () => {
        setSearchQuery("");
        setFilterCategory("");
        setFilterPayer("");
        setFilterSplitType("");
    };

    // =====================================================
    // EXPENSE FORM
    // =====================================================

    const [formData, setFormData] = useState({
        description: "",
        amount: "",
        category: "Other",
        customCategory: ""
    });

    // =====================================================
    // SPLIT STATE
    // =====================================================

    const [splitType, setSplitType] = useState(
        SPLIT_TYPES.EQUAL
    );

    /*
        IMPORTANT FIX

        Instead of:

        [
            {
                user: "id1",
                amount: "",
                percentage: ""
            },
            {
                user: "id2",
                amount: "",
                percentage: ""
            }
        ]

        we store:

        {
            "id1": {
                user: "id1",
                amount: "",
                percentage: ""
            },
            "id2": {
                user: "id2",
                amount: "",
                percentage: ""
            }
        }

        This guarantees that each member has
        completely independent state.
    */

    const [splitValues, setSplitValues] = useState({});

    // =====================================================
    // CREATE INITIAL SPLIT VALUES
    // =====================================================

    const createInitialSplitValues = (members = []) => {
        const initialValues = {};

        members.forEach((member) => {
            const userId = String(member._id);

            initialValues[userId] = {
                user: member._id,
                amount: "",
                percentage: ""
            };
        });

        return initialValues;
    };

    // =====================================================
    // LOAD GROUP + EXPENSES
    // =====================================================

    const loadExpenses = async () => {
        try {
            setLoading(true);
            setError("");

            const [groupData, expenseData] =
                await Promise.all([
                    getGroupById(groupId),
                    getGroupExpenses(groupId)
                ]);

            const currentGroup = groupData?.group;

            setGroup(currentGroup || null);

            setExpenses(
                expenseData?.expenses || []
            );

            setSplitValues(
                createInitialSplitValues(
                    currentGroup?.members || []
                )
            );
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

    // =====================================================
    // FILTER LOGIC
    // =====================================================

    const uniqueCategories = useMemo(() => {
        const cats = new Set();
        expenses.forEach(e => {
            if (e.category === "Custom" && e.customCategory) {
                cats.add(e.customCategory);
            } else if (e.category) {
                cats.add(e.category);
            }
        });
        return Array.from(cats).sort();
    }, [expenses]);

    const filteredExpenses = useMemo(() => {
        return expenses.filter(expense => {
            // Search Description (case-insensitive)
            if (searchQuery && !expense.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }
            // Filter Category
            if (filterCategory) {
                const actualCategory = expense.category === "Custom" && expense.customCategory 
                    ? expense.customCategory 
                    : expense.category || "Other";
                if (actualCategory !== filterCategory) {
                     return false;
                }
            }
            // Filter Payer
            if (filterPayer) {
                const payerId = expense.paidBy?._id?.toString() || expense.paidBy?.toString();
                if (payerId !== filterPayer) {
                    return false;
                }
            }
            // Filter Split Type
            if (filterSplitType && (expense.splitType || "equal") !== filterSplitType) {
                return false;
            }
            return true;
        });
    }, [expenses, searchQuery, filterCategory, filterPayer, filterSplitType]);

    // =====================================================
    // FORM CHANGE
    // =====================================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        setError("");
    };

    // =====================================================
    // RESET FORM
    // =====================================================

    const resetForm = () => {
        setFormData({
            description: "",
            amount: "",
            category: "Other",
            customCategory: ""
        });

        setSplitType(
            SPLIT_TYPES.EQUAL
        );

        setSplitValues(
            createInitialSplitValues(
                group?.members || []
            )
        );
    };

    // =====================================================
    // SPLIT TYPE CHANGE
    // =====================================================

    const handleSplitTypeChange = (e) => {
        const newSplitType = e.target.value;

        setSplitType(newSplitType);

        // Clear old exact/percentage values
        setSplitValues(
            createInitialSplitValues(
                group?.members || []
            )
        );

        setError("");
    };

    // =====================================================
    // SPLIT VALUE CHANGE
    // =====================================================

    const handleSplitValueChange = (
        memberId,
        field,
        value
    ) => {
        const userId = String(memberId);

        setSplitValues((prev) => ({
            ...prev,
            [userId]: {
                ...(prev[userId] || {
                    user: memberId,
                    amount: "",
                    percentage: ""
                }),

                user: memberId,

                [field]: value
            }
        }));

        setError("");
    };

    // =====================================================
    // GET MEMBER SPLIT
    // =====================================================

    const getMemberSplit = (memberId) => {
        return (
            splitValues[String(memberId)] || {
                user: memberId,
                amount: "",
                percentage: ""
            }
        );
    };

    // =====================================================
    // BUILD SPLIT PAYLOAD
    // =====================================================

    const buildSplitPayload = () => {
        const members = group?.members || [];

        if (members.length === 0) {
            throw new Error(
                "This group has no members."
            );
        }

        const totalAmount = Number(
            formData.amount
        );

        if (
            !Number.isFinite(totalAmount) ||
            totalAmount <= 0
        ) {
            throw new Error(
                "Please enter a valid expense amount."
            );
        }

        // =================================================
        // EQUAL
        // =================================================

        if (
            splitType ===
            SPLIT_TYPES.EQUAL
        ) {
            // Backend calculates equal shares.
            return [];
        }

        // =================================================
        // EXACT
        // =================================================

        if (
            splitType ===
            SPLIT_TYPES.EXACT
        ) {
            const splits = members.map(
                (member) => {
                    const split =
                        getMemberSplit(
                            member._id
                        );

                    return {
                        user: member._id,

                        amount: Number(
                            split.amount || 0
                        )
                    };
                }
            );

            const splitTotal =
                splits.reduce(
                    (sum, split) =>
                        sum + split.amount,
                    0
                );

            if (
                Math.abs(
                    splitTotal -
                    totalAmount
                ) > 0.01
            ) {
                throw new Error(
                    `Exact split total must equal ₹${totalAmount.toFixed(
                        2
                    )}. Current total is ₹${splitTotal.toFixed(
                        2
                    )}.`
                );
            }

            return splits;
        }

        // =================================================
        // PERCENTAGE
        // =================================================

        if (
            splitType ===
            SPLIT_TYPES.PERCENTAGE
        ) {
            const splits = members.map(
                (member) => {
                    const split =
                        getMemberSplit(
                            member._id
                        );

                    return {
                        user: member._id,

                        percentage: Number(
                            split.percentage || 0
                        )
                    };
                }
            );

            const percentageTotal =
                splits.reduce(
                    (sum, split) =>
                        sum +
                        split.percentage,
                    0
                );

            if (
                Math.abs(
                    percentageTotal -
                    100
                ) > 0.01
            ) {
                throw new Error(
                    `Percentage split must equal 100%. Current total is ${percentageTotal.toFixed(
                        2
                    )}%.`
                );
            }

            return splits;
        }

        throw new Error(
            "Invalid split type."
        );
    };

    // =====================================================
    // SPLIT PREVIEW
    // =====================================================

    const getSplitPreview = () => {
        const members = group?.members || [];

        const total = Number(
            formData.amount || 0
        );

        if (
            members.length === 0 ||
            total <= 0
        ) {
            return [];
        }

        // =================================================
        // EQUAL
        // =================================================

        if (
            splitType ===
            SPLIT_TYPES.EQUAL
        ) {
            const baseAmount =
                Math.floor(
                    (
                        total /
                        members.length
                    ) * 100
                ) / 100;

            const distributed =
                baseAmount *
                members.length;

            const remaining =
                Number(
                    (
                        total -
                        distributed
                    ).toFixed(2)
                );

            return members.map(
                (member, index) => ({
                    userId: String(
                        member._id
                    ),

                    name:
                        member.name,

                    amount:
                        index ===
                            members.length - 1
                            ? Number(
                                (
                                    baseAmount +
                                    remaining
                                ).toFixed(2)
                            )
                            : Number(
                                baseAmount.toFixed(
                                    2
                                )
                            )
                })
            );
        }

        // =================================================
        // EXACT
        // =================================================

        if (
            splitType ===
            SPLIT_TYPES.EXACT
        ) {
            return members.map(
                (member) => {
                    const split =
                        getMemberSplit(
                            member._id
                        );

                    return {
                        userId: String(
                            member._id
                        ),

                        name:
                            member.name,

                        amount:
                            Number(
                                split.amount ||
                                0
                            )
                    };
                }
            );
        }

        // =================================================
        // PERCENTAGE
        // =================================================

        if (
            splitType ===
            SPLIT_TYPES.PERCENTAGE
        ) {
            return members.map(
                (member) => {
                    const split =
                        getMemberSplit(
                            member._id
                        );

                    const percentage =
                        Number(
                            split.percentage ||
                            0
                        );

                    const previewAmount =
                        Number(
                            (
                                total *
                                (
                                    percentage /
                                    100
                                )
                            ).toFixed(2)
                        );

                    return {
                        userId: String(
                            member._id
                        ),

                        name:
                            member.name,

                        percentage,

                        amount:
                            previewAmount
                    };
                }
            );
        }

        return [];
    };

    // =====================================================
    // CREATE EXPENSE
    // =====================================================

    const handleCreateExpense = async (
        e
    ) => {
        e.preventDefault();

        if (
            !formData.description.trim()
        ) {
            setError(
                "Please enter an expense description."
            );
            return;
        }

        const numericAmount =
            Number(formData.amount);

        if (
            !formData.amount ||
            !Number.isFinite(
                numericAmount
            ) ||
            numericAmount <= 0
        ) {
            setError(
                "Please enter a valid amount."
            );
            return;
        }

        if (formData.category === "Custom") {
            if (!formData.customCategory.trim()) {
                setError(
                    "Please enter a custom category name."
                );
                return;
            }
        }

        let splits;

        try {
            splits =
                buildSplitPayload();
        } catch (err) {
            setError(
                err.message ||
                "Invalid split details."
            );
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            await createExpense(
                groupId,
                {
                    description:
                        formData.description.trim(),

                    amount:
                        numericAmount,

                    category:
                        formData.category,

                    customCategory:
                        formData.category === "Custom" ? formData.customCategory.trim() : undefined,

                    splitType,

                    splits
                }
            );

            resetForm();

            setShowForm(false);

            await loadExpenses();
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to create expense."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // =====================================================
    // START EDIT
    // =====================================================

    const handleEditStart = (
        expense
    ) => {
        setError("");

        setEditingExpense(
            expense
        );

        setFormData({
            description:
                expense.description ||
                "",

            amount:
                expense.amount
                    ?.toString() || "",

            category:
                expense.category ||
                "Other",

            customCategory:
                expense.customCategory ||
                ""
        });

        /*
         * Your current backend update endpoint
         * updates description + amount.
         *
         * Split editing remains disabled here.
         */

        setSplitType(
            expense.splitType ||
            SPLIT_TYPES.EQUAL
        );

        const values =
            createInitialSplitValues(
                group?.members || []
            );

        if (
            Array.isArray(
                expense.splits
            )
        ) {
            const isPercentage = expense.splitType === SPLIT_TYPES.PERCENTAGE;
            const totalExpenseAmount = Number(expense.amount) || 0;

            expense.splits.forEach(
                (split) => {
                    const userId =
                        split.user?._id ||
                        split.user;

                    if (!userId) {
                        return;
                    }

                    const key =
                        String(userId);

                    if (
                        values[key]
                    ) {
                        let calculatedPercentage = "";
                        if (isPercentage && totalExpenseAmount > 0) {
                            calculatedPercentage = parseFloat(((Number(split.amount || 0) / totalExpenseAmount) * 100).toFixed(2));
                        }

                        values[key] = {
                            ...values[key],

                            amount:
                                split.amount ??
                                "",

                            percentage:
                                split.percentage ?? calculatedPercentage
                        };
                    }
                }
            );
        }

        setSplitValues(
            values
        );

        setShowForm(false);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // =====================================================
    // CANCEL EDIT
    // =====================================================

    const handleCancelEdit = () => {
        setEditingExpense(
            null
        );

        resetForm();

        setError("");
    };

    // =====================================================
    // UPDATE EXPENSE
    // =====================================================

    const handleUpdateExpense = async (
        e
    ) => {
        e.preventDefault();

        if (!editingExpense) {
            return;
        }

        if (
            !formData.description.trim()
        ) {
            setError(
                "Please enter an expense description."
            );
            return;
        }

        const numericAmount =
            Number(formData.amount);

        if (
            !formData.amount ||
            !Number.isFinite(
                numericAmount
            ) ||
            numericAmount <= 0
        ) {
            setError(
                "Please enter a valid amount."
            );
            return;
        }

        if (formData.category === "Custom") {
            if (!formData.customCategory.trim()) {
                setError(
                    "Please enter a custom category name."
                );
                return;
            }
        }

        let splits;

        try {
            splits =
                buildSplitPayload();
        } catch (err) {
            setError(
                err.message ||
                "Invalid split details."
            );
            return;
        }

        try {
            setSavingEdit(true);
            setError("");

            await updateExpense(
                groupId,
                editingExpense._id,
                {
                    description:
                        formData.description.trim(),

                    amount:
                        numericAmount,

                    category:
                        formData.category,

                    customCategory:
                        formData.category === "Custom" ? formData.customCategory.trim() : undefined,

                    splitType,

                    splits
                }
            );

            setEditingExpense(
                null
            );

            resetForm();

            await loadExpenses();
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to update expense."
            );
        } finally {
            setSavingEdit(false);
        }
    };

    // =====================================================
    // DELETE
    // =====================================================

    const handleDeleteClick = (
        expenseId
    ) => {
        setError("");

        setDeletingExpenseId(
            expenseId
        );
    };

    const handleCancelDelete =
        () => {
            setDeletingExpenseId(
                null
            );
        };

    const handleDeleteExpense =
        async () => {
            if (
                !deletingExpenseId
            ) {
                return;
            }

            try {
                setDeleting(true);
                setError("");

                await deleteExpense(
                    groupId,
                    deletingExpenseId
                );

                setDeletingExpenseId(
                    null
                );

                await loadExpenses();
            } catch (err) {
                console.error(err);

                setError(
                    err.response?.data?.message ||
                    "Failed to delete expense."
                );
            } finally {
                setDeleting(false);
            }
        };

    // =====================================================
    // SPLIT TOTALS
    // =====================================================

    const getExactTotal = () => {
        return Object.values(
            splitValues
        ).reduce(
            (sum, split) =>
                sum +
                Number(
                    split.amount || 0
                ),
            0
        );
    };

    const getPercentageTotal = () => {
        return Object.values(
            splitValues
        ).reduce(
            (sum, split) =>
                sum +
                Number(
                    split.percentage || 0
                ),
            0
        );
    };

    const splitPreview =
        getSplitPreview();

    // =====================================================
    // FORM
    // =====================================================

    const renderForm = () => (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">

            {/* HEADER */}
            <div className="flex items-center justify-between">

                <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                    {editingExpense
                        ? "Edit expense"
                        : "Add expense"}
                </h2>

                {editingExpense && (
                    <button
                        type="button"
                        onClick={
                            handleCancelEdit
                        }
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
                className="mt-5 space-y-6"
            >

                {/* =================================================
                    BASIC DETAILS
                ================================================= */}

                <div className="grid gap-4 md:grid-cols-3">

                    {/* DESCRIPTION */}

                    <div>
                        <label className="mb-1.5 block text-sm text-slate-600 dark:text-slate-300">
                            Description
                        </label>

                        <input
                            type="text"
                            name="description"
                            value={
                                formData.description
                            }
                            onChange={
                                handleChange
                            }
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
                            value={
                                formData.amount
                            }
                            onChange={
                                handleChange
                            }
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
                            value={
                                formData.category
                            }
                            onChange={(e) => {
                                handleChange(e);
                                if (e.target.value !== "Custom") {
                                    setFormData(prev => ({ ...prev, customCategory: "" }));
                                }
                            }}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        >
                            {CATEGORIES.map(
                                (
                                    category
                                ) => (
                                    <option
                                        key={
                                            category
                                        }
                                        value={
                                            category
                                        }
                                    >
                                        {
                                            category
                                        }
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    {/* CUSTOM CATEGORY INPUT */}
                    {formData.category === "Custom" && (
                        <div>
                            <label className="mb-1.5 block text-sm text-slate-600 dark:text-slate-300">
                                Custom category
                            </label>

                            <input
                                type="text"
                                name="customCategory"
                                value={
                                    formData.customCategory
                                }
                                onChange={
                                    handleChange
                                }
                                maxLength={50}
                                placeholder="E.g. Project supplies..."
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                            />
                        </div>
                    )}
                </div>

                {/* =================================================
                    SPLIT
                ================================================= */}

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">

                        <div className="mb-5">

                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                                Split expense
                            </h3>

                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Choose how this expense should be divided among group members.
                            </p>
                        </div>

                        {/* SPLIT TYPE */}

                        <div>

                            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Split type
                            </label>

                            <select
                                value={
                                    splitType
                                }
                                onChange={
                                    handleSplitTypeChange
                                }
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                            >
                                <option value="equal">
                                    Equal split
                                </option>

                                <option value="exact">
                                    Exact amounts
                                </option>

                                <option value="percentage">
                                    Percentage
                                </option>
                            </select>
                        </div>

                        {/* =================================================
                            EQUAL
                        ================================================= */}

                        {splitType ===
                            SPLIT_TYPES.EQUAL && (
                            <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">

                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    Equal split
                                </p>

                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    The total expense will be divided equally among all group members.
                                </p>

                                <div className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">

                                    {splitPreview.map(
                                        (
                                            member,
                                            index
                                        ) => (
                                            <div
                                                key={`equal-${member.userId}-${index}`}
                                                className="flex items-center justify-between py-3"
                                            >

                                                <span className="text-sm text-slate-700 dark:text-slate-300">
                                                    {
                                                        member.name
                                                    }
                                                </span>

                                                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                                    ₹
                                                    {Number(
                                                        member.amount ||
                                                        0
                                                    ).toFixed(2)}
                                                </span>

                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                        {/* =================================================
                            EXACT
                        ================================================= */}

                        {splitType ===
                            SPLIT_TYPES.EXACT && (
                            <div className="mt-5">

                                <div className="mb-3 flex items-center justify-between">

                                    <div>

                                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                                            Exact amounts
                                        </p>

                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Enter exactly how much each member owes.
                                        </p>

                                    </div>

                                    <span
                                        className={
                                            Math.abs(
                                                getExactTotal() -
                                                Number(
                                                    formData.amount ||
                                                    0
                                                )
                                            ) <=
                                            0.01
                                                ? "text-sm font-semibold text-emerald-500"
                                                : "text-sm font-semibold text-red-500"
                                        }
                                    >
                                        ₹
                                        {getExactTotal().toFixed(
                                            2
                                        )}
                                        {" / ₹"}
                                        {Number(
                                            formData.amount ||
                                            0
                                        ).toFixed(
                                            2
                                        )}
                                    </span>

                                </div>

                                <div className="space-y-3">

                                    {(
                                        group?.members ||
                                        []
                                    ).map(
                                        (
                                            member
                                        ) => {

                                            const split =
                                                getMemberSplit(
                                                    member._id
                                                );

                                            return (
                                                <div
                                                    key={`exact-${String(member._id)}`}
                                                    className="flex items-center justify-between gap-4"
                                                >

                                                    <div>

                                                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                            {
                                                                member.name
                                                            }
                                                        </p>

                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            {
                                                                member.email
                                                            }
                                                        </p>

                                                    </div>

                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={
                                                            split.amount ===
                                                                ""
                                                                ? ""
                                                                : String(
                                                                    split.amount
                                                                )
                                                        }
                                                        onChange={(
                                                            e
                                                        ) =>
                                                            handleSplitValueChange(
                                                                member._id,
                                                                "amount",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="0.00"
                                                        className="w-36 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                                    />

                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            </div>
                        )}

                        {/* =================================================
                            PERCENTAGE
                        ================================================= */}

                        {splitType ===
                            SPLIT_TYPES.PERCENTAGE && (
                            <div className="mt-5">

                                <div className="mb-3 flex items-center justify-between">

                                    <div>

                                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                                            Percentage split
                                        </p>

                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Percentages must add up to 100%.
                                        </p>

                                    </div>

                                    <span
                                        className={
                                            Math.abs(
                                                getPercentageTotal() -
                                                100
                                            ) <=
                                            0.01
                                                ? "text-sm font-semibold text-emerald-500"
                                                : "text-sm font-semibold text-red-500"
                                        }
                                    >
                                        {getPercentageTotal().toFixed(
                                            2
                                        )}
                                        %
                                    </span>

                                </div>

                                <div className="space-y-3">

                                    {(
                                        group?.members ||
                                        []
                                    ).map(
                                        (
                                            member
                                        ) => {

                                            const split =
                                                getMemberSplit(
                                                    member._id
                                                );

                                            const percentage =
                                                Number(
                                                    split.percentage ||
                                                    0
                                                );

                                            const previewAmount =
                                                Number(
                                                    (
                                                        Number(
                                                            formData.amount ||
                                                            0
                                                        ) *
                                                        (
                                                            percentage /
                                                            100
                                                        )
                                                    ).toFixed(
                                                        2
                                                    )
                                                );

                                            return (
                                                <div
                                                    key={`percentage-${String(member._id)}`}
                                                    className="flex items-center justify-between gap-4"
                                                >

                                                    <div>

                                                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                            {
                                                                member.name
                                                            }
                                                        </p>

                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            ₹
                                                            {previewAmount.toFixed(
                                                                2
                                                            )}
                                                        </p>

                                                    </div>

                                                    <div className="flex items-center gap-2">

                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            step="0.01"
                                                            value={
                                                                split.percentage ===
                                                                    ""
                                                                    ? ""
                                                                    : String(
                                                                        split.percentage
                                                                    )
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                handleSplitValueChange(
                                                                    member._id,
                                                                    "percentage",
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="0"
                                                            className="w-28 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                                        />

                                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                                            %
                                                        </span>

                                                    </div>

                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                {/* =================================================
                    BUTTONS
                ================================================= */}

                <div className="flex gap-3">

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
                            onClick={
                                handleCancelEdit
                            }
                            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <DashboardLayout>

            <div className="mx-auto max-w-7xl">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="mb-8">

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                `/groups/${groupId}`
                            )
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

                                setEditingExpense(
                                    null
                                );

                                resetForm();

                                setShowForm(
                                    (prev) =>
                                        !prev
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

                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">

                        <p className="text-sm text-red-600 dark:text-red-400">
                            {error}
                        </p>

                    </div>
                )}

                {/* =================================================
                    FORM
                ================================================= */}

                {(showForm ||
                    editingExpense) &&
                    renderForm()}

                {/* =================================================
                    LOADING
                ================================================= */}

                {loading && (
                    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Loading expenses...
                        </p>

                    </div>
                )}

                {/* =================================================
                    EMPTY
                ================================================= */}

                {!loading &&
                    expenses.length === 0 && (
                        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">

                            <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                                No expenses yet
                            </h2>

                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                Add your first shared expense to start tracking the group.
                            </p>

                        </div>
                    )}

                {/* =================================================
                    FILTERS
                ================================================= */}

                {!loading && expenses.length > 0 && (
                    <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                            <div className="lg:col-span-2">
                                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Search</label>
                                <input
                                    type="text"
                                    placeholder="Search by description..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Category</label>
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                >
                                    <option value="">All categories</option>
                                    {uniqueCategories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Paid by</label>
                                <select
                                    value={filterPayer}
                                    onChange={(e) => setFilterPayer(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                >
                                    <option value="">Anyone</option>
                                    {group?.members?.map(m => (
                                        <option key={m._id} value={m._id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Split type</label>
                                <select
                                    value={filterSplitType}
                                    onChange={(e) => setFilterSplitType(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                >
                                    <option value="">All types</option>
                                    <option value="equal">Equal</option>
                                    <option value="exact">Exact</option>
                                    <option value="percentage">Percentage</option>
                                </select>
                            </div>
                        </div>

                        {(searchQuery || filterCategory || filterPayer || filterSplitType) && (
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={clearFilters}
                                    className="text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                >
                                    Clear filters
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* =================================================
                    EMPTY FILTER RESULTS
                ================================================= */}

                {!loading && expenses.length > 0 && filteredExpenses.length === 0 && (
                    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                            No expenses match your filters
                        </h2>
                        <button
                            onClick={clearFilters}
                            className="mt-3 text-sm font-medium text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}

                {/* =================================================
                    EXPENSE LIST
                ================================================= */}

                {!loading &&
                    filteredExpenses.length > 0 && (
                        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">

                            <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">

                                <div className="flex items-center justify-between">

                                    <h2 className="font-medium text-slate-900 dark:text-white">
                                        Expense history
                                    </h2>

                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        {filteredExpenses.length !== expenses.length
                                            ? `Showing ${filteredExpenses.length} of ${expenses.length} expenses`
                                            : `${expenses.length} ${expenses.length === 1 ? "expense" : "expenses"}`
                                        }
                                    </span>

                                </div>

                            </div>

                            <div className="divide-y divide-slate-200 dark:divide-slate-800">

                                {filteredExpenses.map(
                                    (expense) => (
                                        <div
                                            key={
                                                expense._id
                                            }
                                            className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between"
                                        >

                                            <div className="min-w-0">

                                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                    {
                                                        expense.description
                                                    }
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">

                                                    {
                                                        expense.category === "Custom" && expense.customCategory
                                                            ? expense.customCategory
                                                            : expense.category
                                                    }

                                                    {" · "}

                                                    Paid by{" "}

                                                    {
                                                        expense
                                                            .paidBy
                                                            ?.name ||
                                                        "Unknown"
                                                    }

                                                </p>

                                                {expense.splitType && (
                                                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">

                                                        Split:{" "}

                                                        {expense.splitType ===
                                                            "equal"
                                                            ? "Equal"
                                                            : expense.splitType ===
                                                                "exact"
                                                                ? "Exact"
                                                                : "Percentage"}

                                                    </p>
                                                )}

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

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setViewingExpense(
                                                                expense
                                                            )
                                                        }
                                                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                                                    >
                                                        Details
                                                    </button>

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

                {/* =================================================
                    VIEW DETAILS MODAL
                ================================================= */}

                {viewingExpense && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8 overflow-y-auto">
                        <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 my-auto max-h-full overflow-y-auto">
                            
                            <div className="mb-6 border-b border-slate-100 pb-4 dark:border-slate-800">
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                                    {viewingExpense.description}
                                </h2>
                                <p className="mt-1 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                    <span>{new Date(viewingExpense.createdAt).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric"
                                    })}</span>
                                    <span>·</span>
                                    <span>₹{Number(viewingExpense.amount || 0).toFixed(2)}</span>
                                </p>
                            </div>

                            <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-950/50">
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Category</p>
                                    <p className="mt-0.5 text-sm font-medium text-slate-900 dark:text-white">
                                        {viewingExpense.category === "Custom" && viewingExpense.customCategory
                                            ? viewingExpense.customCategory
                                            : viewingExpense.category || "Other"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Paid By</p>
                                    <p className="mt-0.5 text-sm font-medium text-slate-900 dark:text-white">
                                        {viewingExpense.paidBy?.name || "Unknown"}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Split Type</p>
                                    <p className="mt-0.5 text-sm font-medium capitalize text-slate-900 dark:text-white">
                                        {viewingExpense.splitType || "Equal"}
                                    </p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                                    Split Breakdown
                                </h3>

                                {(!viewingExpense.splits || viewingExpense.splits.length === 0) ? (
                                    <p className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-900/50 dark:bg-yellow-900/20 dark:text-yellow-200">
                                        Split details are unavailable for this legacy expense.
                                    </p>
                                ) : (
                                    <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                                        {viewingExpense.splits.map((split, idx) => {
                                            const memberId = split.user?._id || split.user;
                                            const member = group?.members?.find(m => m._id.toString() === memberId.toString());
                                            const isPercentage = viewingExpense.splitType === "percentage";
                                            const total = Number(viewingExpense.amount) || 0;
                                            const amount = Number(split.amount) || 0;
                                            let pctString = "";
                                            if (isPercentage && total > 0) {
                                                pctString = `${parseFloat(((amount / total) * 100).toFixed(2))}%`;
                                            }

                                            return (
                                                <div key={idx} className="flex items-center justify-between p-3 sm:p-4">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                                            {member?.name || "Unknown Member"}
                                                        </p>
                                                        {member?.email && (
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                                {member.email}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="ml-4 text-right">
                                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                            ₹{amount.toFixed(2)}
                                                        </p>
                                                        {isPercentage && (
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                {pctString}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div className="flex items-center justify-between bg-slate-50 p-3 sm:p-4 dark:bg-slate-950/50 rounded-b-lg">
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                Total
                                            </p>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                ₹{(viewingExpense.splits.reduce((sum, split) => sum + (Number(split.amount) || 0), 0)).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setViewingExpense(null)}
                                    className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                                >
                                    Close
                                </button>
                            </div>

                        </div>
                    </div>
                )}

                {/* =================================================
                    DELETE MODAL
                ================================================= */}

                {deletingExpenseId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

                        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">

                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Delete expense?
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                This expense will be permanently removed from this group. This action cannot be undone.
                            </p>

                            <div className="mt-6 flex justify-end gap-3">

                                <button
                                    type="button"
                                    onClick={
                                        handleCancelDelete
                                    }
                                    disabled={
                                        deleting
                                    }
                                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={
                                        handleDeleteExpense
                                    }
                                    disabled={
                                        deleting
                                    }
                                    className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
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