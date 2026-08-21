import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/layouts/DashboardLayout";
import {
    getMyGroups,
    getGroupDashboard
} from "../services/group.service";

const Dashboard = () => {
    const { user } = useAuth();

    const [groups, setGroups] = useState([]);
    const [dashboard, setDashboard] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                // Get groups
                const groupsData = await getMyGroups();

                console.log("GROUPS:", groupsData);

                const userGroups = groupsData.groups || [];

                setGroups(userGroups);

                // No groups
                if (userGroups.length === 0) {
                    setDashboard(null);
                    return;
                }

                // For now use first group.
                // Later this will be replaced with selected active group.
                const firstGroup = userGroups[0];

                const dashboardData = await getGroupDashboard(
                    firstGroup._id
                );

                console.log("DASHBOARD:", dashboardData);

                setDashboard(dashboardData);

            } catch (err) {
                console.error("Dashboard error:", err);

                setError(
                    err.response?.data?.message ||
                    "Failed to load dashboard"
                );
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    return (
        <DashboardLayout>
            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
                        Good morning,{" "}
                        {user?.name?.split(" ")[0] || "there"}
                    </h1>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Here's what's happening with your expenses.
                    </p>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Loading your financial summary...
                        </p>
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-950/30">
                        <p className="text-sm text-red-600 dark:text-red-400">
                            {error}
                        </p>
                    </div>
                )}

                {/* No groups */}
                {!loading &&
                    !error &&
                    groups.length === 0 && (
                        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                                No groups yet
                            </h2>

                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                Create a group to start tracking shared
                                expenses.
                            </p>
                        </div>
                    )}

                {/* Dashboard */}
                {!loading && !error && dashboard && (
                    <>
                        {/* Active group */}
                        <div className="mb-6">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Active group
                            </p>

                            <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                                {dashboard.group?.name || "Group"}
                            </h2>

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {dashboard.group?.description || ""}
                            </p>
                        </div>

                        {/* Summary cards */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                            {/* Total expenses */}
                            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Total expenses
                                </p>

                                <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                                    ₹
                                    {dashboard.financialSummary?.totalExpense ??
                                        0}
                                </p>
                            </div>

                            {/* Your share */}
                            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Your share
                                </p>

                                <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                                    ₹
                                    {dashboard.financialSummary?.sharePerMember ??
                                        0}
                                </p>
                            </div>

                            {/* Expenses */}
                            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Expenses
                                </p>

                                <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                                    {dashboard.financialSummary?.expenseCount ??
                                        0}
                                </p>
                            </div>

                            {/* Settlements */}
                            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Settlements
                                </p>

                                <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                                    {dashboard.financialSummary?.settlementCount ??
                                        0} recorded
                                </p>
                            </div>

                        </div>

                        {/* Main content */}
                        <div className="mt-6 grid gap-6 lg:grid-cols-2">

                            {/* Balances */}
                            <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

                                <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                                    <h3 className="font-medium text-slate-900 dark:text-white">
                                        Group balances
                                    </h3>
                                </div>

                                <div className="divide-y divide-slate-200 dark:divide-slate-800">

                                    {(dashboard.balances || []).length === 0 ? (
                                        <p className="px-5 py-6 text-sm text-slate-500 dark:text-slate-400">
                                            No balance information available.
                                        </p>
                                    ) : (
                                        dashboard.balances.map((member) => (
                                            <div
                                                key={member.userId}
                                                className="flex items-center justify-between px-5 py-4"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                        {member.name}
                                                    </p>

                                                    <p className="text-xs text-slate-500">
                                                        Paid ₹{member.paid}
                                                    </p>
                                                </div>

                                                <p
                                                    className={
                                                        `text-sm font-semibold ${
                                                            member.balance > 0
                                                                ? "text-emerald-600 dark:text-emerald-400"
                                                                : member.balance < 0
                                                                    ? "text-red-600 dark:text-red-400"
                                                                    : "text-slate-500 dark:text-slate-400"
                                                        }`
                                                    }
                                                >
                                                    {member.balance > 0
                                                        ? `+₹${member.balance}`
                                                        : member.balance < 0
                                                            ? `-₹${Math.abs(
                                                                member.balance
                                                            )}`
                                                            : "Settled"}
                                                </p>
                                            </div>
                                        ))
                                    )}

                                </div>
                            </div>

                            {/* Category breakdown */}
                            <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

                                <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                                    <h3 className="font-medium text-slate-900 dark:text-white">
                                        Spending by category
                                    </h3>
                                </div>

                                <div className="divide-y divide-slate-200 dark:divide-slate-800">

                                    {(dashboard.categoryBreakdown || []).length === 0 ? (
                                        <p className="px-5 py-6 text-sm text-slate-500 dark:text-slate-400">
                                            No category data available.
                                        </p>
                                    ) : (
                                        dashboard.categoryBreakdown.map(
                                            (item) => (
                                                <div
                                                    key={item.category}
                                                    className="flex items-center justify-between px-5 py-4"
                                                >
                                                    <div>
                                                        <p className="text-sm text-slate-700 dark:text-slate-200">
                                                            {item.category}
                                                        </p>

                                                        <p className="text-xs text-slate-500">
                                                            {item.percentage}%
                                                        </p>
                                                    </div>

                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                        ₹{item.amount}
                                                    </p>
                                                </div>
                                            )
                                        )
                                    )}

                                </div>
                            </div>

                        </div>

                        {/* Recent expenses */}
                        <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

                            <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                                <h3 className="font-medium text-slate-900 dark:text-white">
                                    Recent expenses
                                </h3>
                            </div>

                            <div className="divide-y divide-slate-200 dark:divide-slate-800">

                                {(dashboard.recentExpenses || []).length === 0 ? (
                                    <p className="px-5 py-6 text-sm text-slate-500 dark:text-slate-400">
                                        No recent expenses.
                                    </p>
                                ) : (
                                    dashboard.recentExpenses.map(
                                        (expense) => (
                                            <div
                                                key={expense._id}
                                                className="flex items-center justify-between px-5 py-4"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                        {expense.description}
                                                    </p>

                                                    <p className="text-xs text-slate-500 dark:text-slate-500">
                                                        {expense.category === "Custom" && expense.customCategory ? expense.customCategory : expense.category} · Paid
                                                        by {expense.paidBy?.name || "Unknown"}
                                                    </p>
                                                </div>

                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                    ₹{expense.amount}
                                                </p>
                                            </div>
                                        )
                                    )
                                )}

                            </div>
                        </div>
                    </>
                )}

            </div>
        </DashboardLayout>
    );
};

export default Dashboard;