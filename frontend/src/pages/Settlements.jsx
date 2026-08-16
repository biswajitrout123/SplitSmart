import {
    useCallback,
    useEffect,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import DashboardLayout from "../components/layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";

import {
    getGroupById
} from "../services/group.service";

import {
    getGroupSettlements,
    getSettlementSummary,
    createSettlement,
    deleteSettlement,
    getSimplifiedSettlements
} from "../services/settlement.service";

const Settlements = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // -----------------------------------------
    // STATE
    // -----------------------------------------

    const [group, setGroup] = useState(null);
    const [settlements, setSettlements] = useState([]);
    const [summary, setSummary] = useState(null);
    const [simplifiedSettlements, setSimplifiedSettlements] =
        useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        to: "",
        amount: ""
    });

    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    // -----------------------------------------
    // HELPERS
    // -----------------------------------------

    const getUserId = (value) => {
        if (!value) {
            return "";
        }

        if (typeof value === "string") {
            return value;
        }

        return (
            value._id ||
            value.userId ||
            value.id ||
            ""
        );
    };

    const getUserName = (value, fallback = "Unknown member") => {
        if (!value) {
            return fallback;
        }

        if (typeof value === "string") {
            return fallback;
        }

        return (
            value.name ||
            value.email ||
            fallback
        );
    };

    // -----------------------------------------
    // LOAD ALL SETTLEMENT DATA
    // -----------------------------------------

    const loadSettlements = useCallback(async () => {
        if (!groupId) {
            return;
        }

        try {
            setLoading(true);
            setError("");

            const [
                groupData,
                settlementData,
                summaryData,
                simplifiedData
            ] = await Promise.all([
                getGroupById(groupId),
                getGroupSettlements(groupId),
                getSettlementSummary(groupId),
                getSimplifiedSettlements(groupId)
            ]);

            setGroup(
                groupData?.group || null
            );

            setSettlements(
                settlementData?.settlements || []
            );

            setSummary(
                summaryData || null
            );

            setSimplifiedSettlements(
                simplifiedData || null
            );

        } catch (err) {
            console.error(
                "Settlement loading error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to load settlements"
            );
        } finally {
            setLoading(false);
        }
    }, [groupId]);

    // -----------------------------------------
    // INITIAL LOAD
    // -----------------------------------------

    useEffect(() => {
        loadSettlements();
    }, [loadSettlements]);

    // -----------------------------------------
    // GET SUGGESTED SETTLEMENT LIST
    // -----------------------------------------

    const suggestedSettlements = Array.isArray(
        simplifiedSettlements?.settlements
    )
        ? simplifiedSettlements.settlements
        : [];

    // -----------------------------------------
    // ONLY PAYMENTS THAT CURRENT USER SHOULD MAKE
    // -----------------------------------------

    const payableSettlements =
        suggestedSettlements.filter((item) => {
            const fromId = getUserId(item?.from);
            const toId = getUserId(item?.to);
            const currentUserId = String(user?._id || "");

            return (
                String(fromId) === currentUserId &&
                String(toId) !== currentUserId
            );
        });

    // -----------------------------------------
    // SELECTED PAYMENT
    // -----------------------------------------

    const selectedPayment =
        payableSettlements.find((item) => {
            return (
                String(getUserId(item?.to)) ===
                String(formData.to)
            );
        }) || null;

    // -----------------------------------------
    // FORM CHANGE
    // -----------------------------------------

    const handleChange = (e) => {
        const {
            name,
            value
        } = e.target;

        if (name === "to") {
            const selected =
                payableSettlements.find((item) => {
                    return (
                        String(getUserId(item?.to)) ===
                        String(value)
                    );
                });

            setFormData({
                to: value,
                amount: selected
                    ? String(
                        Number(
                            selected.amount || 0
                        ).toFixed(2)
                    )
                    : ""
            });

            setError("");
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        setError("");
    };

    // -----------------------------------------
    // CREATE SETTLEMENT
    // -----------------------------------------

    const handleCreateSettlement = async (e) => {
        e.preventDefault();

        const receiverId = String(
            formData.to || ""
        );

        const amount = Number(
            formData.amount
        );

        const currentUserId = String(
            user?._id || ""
        );

        if (!receiverId) {
            setError(
                "Please select the member you are paying."
            );
            return;
        }

        if (
            receiverId === currentUserId
        ) {
            setError(
                "You cannot create a settlement with yourself."
            );
            return;
        }

        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            setError(
                "Please enter a valid settlement amount."
            );
            return;
        }

        // Make sure the selected person is actually
        // a valid payment target according to the
        // simplified settlement calculation.
        if (!selectedPayment) {
            setError(
                "You do not currently owe money to this member."
            );
            return;
        }

        const suggestedAmount = Number(
            selectedPayment.amount || 0
        );

        if (
            suggestedAmount <= 0
        ) {
            setError(
                "There is no outstanding amount for this payment."
            );
            return;
        }

        if (amount > suggestedAmount) {
            setError(
                `You can record a maximum payment of ₹${suggestedAmount.toFixed(
                    2
                )} for this member.`
            );
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            const payload = {
                to: receiverId,
                amount
            };

            console.log(
                "SETTLEMENT PAYLOAD:",
                payload
            );

            await createSettlement(
                groupId,
                payload
            );

            setFormData({
                to: "",
                amount: ""
            });

            setShowForm(false);

            await loadSettlements();

        } catch (err) {
            console.error(
                "CREATE SETTLEMENT ERROR:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to create settlement"
            );
        } finally {
            setSubmitting(false);
        }
    };

    // -----------------------------------------
    // DELETE SETTLEMENT
    // -----------------------------------------

    const handleDeleteSettlement = async (
        settlementId
    ) => {
        const confirmed =
            window.confirm(
                "Are you sure you want to delete this settlement?"
            );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(
                settlementId
            );

            setError("");

            await deleteSettlement(
                groupId,
                settlementId
            );

            await loadSettlements();

        } catch (err) {
            console.error(
                "Delete settlement error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to delete settlement"
            );
        } finally {
            setDeletingId(null);
        }
    };

    // -----------------------------------------
    // FORMAT DATE
    // -----------------------------------------

    const formatDate = (date) => {
        if (!date) {
            return "";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "";
        }

        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );
    };

    // -----------------------------------------
    // NET SETTLEMENT
    // -----------------------------------------

    const netSettlement = Number(
        summary?.mySettlement
            ?.netSettlement || 0
    );

    // -----------------------------------------
    // RENDER
    // -----------------------------------------

    return (
        <DashboardLayout>

            <div className="mx-auto max-w-7xl">

                {/* ================================= */}
                {/* HEADER */}
                {/* ================================= */}

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

                    <div>

                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Settlements
                        </p>

                        <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                            {group?.name ||
                                "Group settlements"}
                        </h1>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Track payments between group members.
                        </p>

                    </div>

                </div>

                {/* ================================= */}
                {/* ERROR */}
                {/* ================================= */}

                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">

                        <p className="text-sm text-red-600 dark:text-red-400">
                            {error}
                        </p>

                    </div>
                )}

                {/* ================================= */}
                {/* LOADING */}
                {/* ================================= */}

                {loading && (
                    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Loading settlements...
                        </p>

                    </div>
                )}

                {/* ================================= */}
                {/* MAIN */}
                {/* ================================= */}

                {!loading && (
                    <>

                        {/* ================================= */}
                        {/* SUMMARY */}
                        {/* ================================= */}

                        {summary && (
                            <div className="grid gap-4 sm:grid-cols-3">

                                {/* Total settled */}
                                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">

                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Total settled
                                    </p>

                                    <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                                        ₹
                                        {Number(
                                            summary.totalSettled || 0
                                        ).toFixed(2)}
                                    </p>

                                </div>

                                {/* Count */}
                                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">

                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Settlement count
                                    </p>

                                    <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                                        {summary.settlementCount || 0}
                                    </p>

                                </div>

                                {/* Net */}
                                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">

                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Your net settlement
                                    </p>

                                    {netSettlement > 0 ? (
                                        <p className="mt-2 text-2xl font-semibold text-emerald-500">
                                            Receive ₹
                                            {Math.abs(
                                                netSettlement
                                            ).toFixed(2)}
                                        </p>
                                    ) : netSettlement < 0 ? (
                                        <p className="mt-2 text-2xl font-semibold text-red-500">
                                            Pay ₹
                                            {Math.abs(
                                                netSettlement
                                            ).toFixed(2)}
                                        </p>
                                    ) : (
                                        <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                                            ₹0.00
                                        </p>
                                    )}

                                </div>

                            </div>
                        )}

                        {/* ================================= */}
                        {/* RECORD SETTLEMENT */}
                        {/* ================================= */}

                        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                <div>

                                    <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                                        Record a settlement
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        Record money that you paid to another group member.
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setError("");

                                        if (showForm) {
                                            setFormData({
                                                to: "",
                                                amount: ""
                                            });
                                        }

                                        setShowForm(
                                            (prev) => !prev
                                        );
                                    }}
                                    className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                                >
                                    {showForm
                                        ? "Cancel"
                                        : "+ Record settlement"}
                                </button>

                            </div>

                            {/* FORM */}

                            {showForm && (
                                <div className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-800">

                                    {payableSettlements.length === 0 ? (

                                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">

                                            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                                                You don't currently owe money to another member in this group.
                                            </p>

                                            <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-500">
                                                No outgoing settlement is required from your current balance.
                                            </p>

                                        </div>

                                    ) : (

                                        <form
                                            onSubmit={
                                                handleCreateSettlement
                                            }
                                            className="grid gap-4 md:grid-cols-2"
                                        >

                                            {/* Paid to */}

                                            <div>

                                                <label
                                                    htmlFor="settlement-to"
                                                    className="mb-1.5 block text-sm text-slate-600 dark:text-slate-300"
                                                >
                                                    Paid to
                                                </label>

                                                <select
                                                    id="settlement-to"
                                                    name="to"
                                                    value={formData.to}
                                                    onChange={handleChange}
                                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                                >

                                                    <option value="">
                                                        Select a member
                                                    </option>

                                                    {payableSettlements.map(
                                                        (
                                                            item,
                                                            index
                                                        ) => {

                                                            const toId =
                                                                String(
                                                                    getUserId(
                                                                        item?.to
                                                                    )
                                                                );

                                                            const toName =
                                                                getUserName(
                                                                    item?.to,
                                                                    `Member ${index + 1}`
                                                                );

                                                            return (
                                                                <option
                                                                    key={`pay-${toId}-${index}`}
                                                                    value={toId}
                                                                >
                                                                    {toName}
                                                                </option>
                                                            );
                                                        }
                                                    )}

                                                </select>

                                            </div>

                                            {/* Amount */}

                                            <div>

                                                <label
                                                    htmlFor="settlement-amount"
                                                    className="mb-1.5 block text-sm text-slate-600 dark:text-slate-300"
                                                >
                                                    Amount
                                                </label>

                                                <input
                                                    id="settlement-amount"
                                                    type="number"
                                                    name="amount"
                                                    min="0.01"
                                                    step="0.01"
                                                    max={
                                                        selectedPayment
                                                            ? Number(
                                                                selectedPayment.amount || 0
                                                            )
                                                            : undefined
                                                    }
                                                    value={
                                                        formData.amount
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    placeholder="0.00"
                                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                                />

                                                {selectedPayment && (
                                                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                                                        Suggested amount: ₹
                                                        {Number(
                                                            selectedPayment.amount || 0
                                                        ).toFixed(2)}
                                                    </p>
                                                )}

                                            </div>

                                            {/* Submit */}

                                            <div className="md:col-span-2">

                                                <button
                                                    type="submit"
                                                    disabled={
                                                        submitting ||
                                                        !formData.to
                                                    }
                                                    className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                                                >
                                                    {submitting
                                                        ? "Recording..."
                                                        : "Record settlement"}
                                                </button>

                                            </div>

                                        </form>
                                    )}

                                </div>
                            )}

                        </div>

                        {/* ================================= */}
                        {/* SUGGESTED SETTLEMENTS */}
                        {/* ================================= */}

                        <div className="mt-6 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">

                            <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">

                                <div className="flex items-center justify-between">

                                    <div>

                                        <h2 className="font-medium text-slate-900 dark:text-white">
                                            Suggested settlements
                                        </h2>

                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            Simplified transactions to settle the group balance.
                                        </p>

                                    </div>

                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                        {suggestedSettlements.length}
                                    </span>

                                </div>

                            </div>

                            {suggestedSettlements.length === 0 ? (

                                <p className="px-5 py-6 text-sm text-slate-500 dark:text-slate-400">
                                    Everyone is settled up.
                                </p>

                            ) : (

                                <div className="divide-y divide-slate-200 dark:divide-slate-800">

                                    {suggestedSettlements.map(
                                        (settlement, index) => {

                                            const fromId =
                                                getUserId(
                                                    settlement?.from
                                                );

                                            const toId =
                                                getUserId(
                                                    settlement?.to
                                                );

                                            const uniqueKey =
                                                `${fromId || "from"}-${toId || "to"}-${settlement?.amount || 0}-${index}`;

                                            return (
                                                <div
                                                    key={uniqueKey}
                                                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                                                >

                                                    <div>

                                                        <p className="text-sm font-medium text-slate-900 dark:text-white">

                                                            {getUserName(
                                                                settlement?.from
                                                            )}

                                                            {" → "}

                                                            {getUserName(
                                                                settlement?.to
                                                            )}

                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                            Suggested payment
                                                        </p>

                                                    </div>

                                                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                                                        ₹
                                                        {Number(
                                                            settlement?.amount || 0
                                                        ).toFixed(2)}
                                                    </p>

                                                </div>
                                            );
                                        }
                                    )}

                                </div>

                            )}

                        </div>

                        {/* ================================= */}
                        {/* HISTORY */}
                        {/* ================================= */}

                        <div className="mt-6 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">

                            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">

                                <h2 className="font-medium text-slate-900 dark:text-white">
                                    Settlement history
                                </h2>

                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                    {settlements.length}{" "}
                                    {settlements.length === 1
                                        ? "settlement"
                                        : "settlements"}
                                </span>

                            </div>

                            {settlements.length === 0 ? (

                                <p className="px-5 py-6 text-sm text-slate-500 dark:text-slate-400">
                                    No settlements recorded yet.
                                </p>

                            ) : (

                                <div className="divide-y divide-slate-200 dark:divide-slate-800">

                                    {settlements.map(
                                        (settlement, index) => (
                                            <div
                                                key={
                                                    settlement?._id ||
                                                    `settlement-${index}`
                                                }
                                                className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                                            >

                                                <div>

                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">

                                                        {getUserName(
                                                            settlement?.from
                                                        )}

                                                        {" paid "}

                                                        {getUserName(
                                                            settlement?.to
                                                        )}

                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                        {formatDate(
                                                            settlement?.createdAt
                                                        )}
                                                    </p>

                                                </div>

                                                <div className="flex items-center gap-4">

                                                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                                                        ₹
                                                        {Number(
                                                            settlement?.amount || 0
                                                        ).toFixed(2)}
                                                    </p>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteSettlement(
                                                                settlement?._id
                                                            )
                                                        }
                                                        disabled={
                                                            !settlement?._id ||
                                                            deletingId ===
                                                            settlement?._id
                                                        }
                                                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                                                    >
                                                        {deletingId ===
                                                            settlement?._id
                                                            ? "Deleting..."
                                                            : "Delete"}
                                                    </button>

                                                </div>

                                            </div>
                                        )
                                    )}

                                </div>

                            )}

                        </div>

                    </>
                )}

            </div>

        </DashboardLayout>
    );
};

export default Settlements;