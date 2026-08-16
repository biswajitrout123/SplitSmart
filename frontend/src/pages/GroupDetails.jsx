import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { getGroupDashboard } from "../services/group.service";

const GroupDetails = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (groupId) {
            localStorage.setItem("activeGroupId", groupId);
        }
    }, [groupId]);

    useEffect(() => {
        const loadGroupDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getGroupDashboard(groupId);

                setDashboard(data);
            } catch (err) {
                console.error(err);

                setError(
                    err.response?.data?.message ||
                    "Failed to load group dashboard"
                );
            } finally {
                setLoading(false);
            }
        };

        if (groupId) {
            loadGroupDashboard();
        }
    }, [groupId]);

    const getBalanceText = (balance) => {
        if (balance > 0) {
            return {
                text: `You should receive ₹${balance.toFixed(2)}`,
                className: "text-emerald-500"
            };
        }

        if (balance < 0) {
            return {
                text: `You owe ₹${Math.abs(balance).toFixed(2)}`,
                className: "text-red-500"
            };
        }

        return {
            text: "You are settled",
            className: "text-slate-500 dark:text-slate-400"
        };
    };

    const currentUserBalance =
        dashboard?.balances?.find(
            (member) =>
                member.userId?.toString() ===
                user?._id?.toString()
        )?.balance ?? 0;

    const balanceInfo = getBalanceText(currentUserBalance);

    return (
        <DashboardLayout>
            <div className="mx-auto max-w-7xl">

                {/* Back */}
                <button
                    type="button"
                    onClick={() => navigate("/groups")}
                    className="mb-6 text-sm text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                    ← Back to groups
                </button>

                {/* Loading */}
                {loading && (
                    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Loading group dashboard...
                        </p>
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/30">
                        <p className="text-sm text-red-600 dark:text-red-400">
                            {error}
                        </p>
                    </div>
                )}

                {!loading && !error && dashboard && (
                    <>
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                        Group
                                    </p>

                                    <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                                        {dashboard.group.name}
                                    </h1>

                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        {dashboard.group.description ||
                                            "No description"}
                                    </p>
                                </div>


                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                `/groups/${groupId}/expenses`
                                            )
                                        }
                                        className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                                    >
                                        Add expense
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                `/groups/${groupId}/settlements`
                                            )
                                        }
                                        className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                        Settle up
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Tabs (Added Block) */}
                        <div className="mb-8 border-b border-slate-800">
                            <nav className="flex gap-6 overflow-x-auto">

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(`/groups/${groupId}`)
                                    }
                                    className="border-b-2 border-slate-900 px-1 pb-3 text-sm font-medium text-slate-900 dark:border-white dark:text-white"
                                >
                                    Overview
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(`/groups/${groupId}/expenses`)
                                    }
                                    className="border-b-2 border-transparent px-1 pb-3 text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                >
                                    Expenses
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(`/groups/${groupId}/settlements`)
                                    }
                                    className="border-b-2 border-transparent px-1 pb-3 text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                >
                                    Settlements
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(`/groups/${groupId}/analytics`)
                                    }
                                    className="border-b-2 border-transparent px-1 pb-3 text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                >
                                    Analytics
                                </button>

                            </nav>
                        </div>

                        {/* Summary cards */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Total expenses
                                </p>

                                <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                                    ₹
                                    {dashboard.financialSummary.totalExpense.toFixed(
                                        2
                                    )}
                                </p>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Your share
                                </p>

                                <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                                    ₹
                                    {dashboard.financialSummary.sharePerMember.toFixed(
                                        2
                                    )}
                                </p>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Expenses
                                </p>

                                <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                                    {dashboard.financialSummary.expenseCount}
                                </p>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Settlements
                                </p>

                                <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                                    {dashboard.financialSummary.settlementCount}
                                </p>
                            </div>

                        </div>

                        {/* Your balance */}
                        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Your balance
                            </p>

                            <p
                                className={`mt-2 text-xl font-semibold ${balanceInfo.className}`}
                            >
                                {balanceInfo.text}
                            </p>
                        </div>

                        {/* Members + balances */}
                        <div className="mt-6 grid gap-6 lg:grid-cols-2">

                            {/* Members */}
                            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">

                                <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                                    <div className="flex items-center justify-between">
                                        <h2 className="font-medium text-slate-900 dark:text-white">
                                            Group members
                                        </h2>

                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            {dashboard.group.memberCount} members
                                        </span>
                                    </div>
                                </div>

                                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {dashboard.group.members.map(
                                        (member) => (
                                            <div
                                                key={member._id}
                                                className="flex items-center gap-3 px-5 py-4"
                                            >
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                                    {member.name
                                                        ?.charAt(0)
                                                        ?.toUpperCase()}
                                                </div>

                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                        {member.name}
                                                    </p>

                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        {member.email}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>

                            </div>

                            {/* Balances */}
                            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">

                                <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                                    <h2 className="font-medium text-slate-900 dark:text-white">
                                        Group balances
                                    </h2>
                                </div>

                                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {dashboard.balances.map(
                                        (member) => (
                                            <div
                                                key={member.userId}
                                                className="flex items-center justify-between px-5 py-4"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                        {member.name}
                                                    </p>

                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        Paid ₹
                                                        {member.paid.toFixed(
                                                            2
                                                        )}
                                                    </p>
                                                </div>

                                                <div className="text-right">
                                                    {member.balance > 0 && (
                                                        <p className="text-sm font-semibold text-emerald-500">
                                                            +₹
                                                            {member.balance.toFixed(
                                                                2
                                                            )}
                                                        </p>
                                                    )}

                                                    {member.balance < 0 && (
                                                        <p className="text-sm font-semibold text-red-500">
                                                            -₹
                                                            {Math.abs(
                                                                member.balance
                                                            ).toFixed(2)}
                                                        </p>
                                                    )}

                                                    {member.balance === 0 && (
                                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                                            Settled
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>

                            </div>

                        </div>

                        {/* Category */}
                        <div className="mt-6 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">

                            <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                                <h2 className="font-medium text-slate-900 dark:text-white">
                                    Spending by category
                                </h2>
                            </div>

                            <div className="divide-y divide-slate-200 dark:divide-slate-800">

                                {dashboard.categoryBreakdown.length === 0 ? (
                                    <p className="px-5 py-5 text-sm text-slate-500 dark:text-slate-400">
                                        No category data available.
                                    </p>
                                ) : (
                                    dashboard.categoryBreakdown.map(
                                        (item) => (
                                            <div
                                                key={item.category}
                                                className="px-5 py-4"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                            {item.category}
                                                        </p>

                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            {item.percentage}%
                                                        </p>
                                                    </div>

                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                        ₹
                                                        {item.amount.toFixed(
                                                            2
                                                        )}
                                                    </p>
                                                </div>

                                                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                                    <div
                                                        className="h-full rounded-full bg-slate-900 dark:bg-white"
                                                        style={{
                                                            width: `${item.percentage}%`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    )
                                )}

                            </div>
                        </div>

                        {/* Recent expenses */}
                        <div className="mt-6 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">

                            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                                <h2 className="font-medium text-slate-900 dark:text-white">
                                    Recent expenses
                                </h2>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            `/groups/${groupId}/expenses`
                                        )
                                    }
                                    className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                >
                                    View all
                                </button>
                            </div>

                            {dashboard.recentExpenses.length === 0 ? (
                                <p className="px-5 py-5 text-sm text-slate-500 dark:text-slate-400">
                                    No recent expenses.
                                </p>
                            ) : (
                                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {dashboard.recentExpenses.map(
                                        (expense) => (
                                            <div
                                                key={expense._id}
                                                className="flex items-center justify-between px-5 py-4"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                        {expense.description}
                                                    </p>

                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        {expense.category} ·
                                                        Paid by{" "}
                                                        {
                                                            expense.paidBy
                                                                ?.name
                                                        }
                                                    </p>
                                                </div>

                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                    ₹
                                                    {expense.amount.toFixed(
                                                        2
                                                    )}
                                                </p>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}

                        </div>

                        {/* Recent settlements */}
                        <div className="mt-6 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">

                            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                                <h2 className="font-medium text-slate-900 dark:text-white">
                                    Recent settlements
                                </h2>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            `/groups/${groupId}/settlements`
                                        )
                                    }
                                    className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                >
                                    View all
                                </button>
                            </div>

                            {dashboard.recentSettlements.length === 0 ? (
                                <p className="px-5 py-5 text-sm text-slate-500 dark:text-slate-400">
                                    No settlements yet.
                                </p>
                            ) : (
                                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {dashboard.recentSettlements.map(
                                        (settlement) => (
                                            <div
                                                key={settlement._id}
                                                className="flex items-center justify-between px-5 py-4"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                        {
                                                            settlement.from
                                                                ?.name
                                                        }{" "}
                                                        →{" "}
                                                        {
                                                            settlement.to
                                                                ?.name
                                                        }
                                                    </p>

                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        Settlement
                                                    </p>
                                                </div>

                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                    ₹
                                                    {settlement.amount.toFixed(
                                                        2
                                                    )}
                                                </p>
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

export default GroupDetails;