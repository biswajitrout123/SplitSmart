import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../components/layouts/DashboardLayout";

import { getGroupById } from "../services/group.service";

import {
    getExpenseAnalytics,
    getMonthlyExpenseTrends
} from "../services/expense.service";

const Analytics = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();

    const [group, setGroup] = useState(null);

    const [analytics, setAnalytics] = useState(null);
    const [monthlyTrends, setMonthlyTrends] = useState([]);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [loading, setLoading] = useState(true);
    const [filtering, setFiltering] = useState(false);
    const [error, setError] = useState("");

    // ---------------------------------------------------
    // LOAD ANALYTICS
    // ---------------------------------------------------
    const loadAnalytics = async (filters = {}) => {
        try {
            setFiltering(true);
            setError("");

            const [analyticsData, monthlyData] = await Promise.all([
                getExpenseAnalytics(groupId, filters),
                getMonthlyExpenseTrends(groupId)
            ]);

            setAnalytics(analyticsData);
            setMonthlyTrends(
                monthlyData.monthlyTrends || []
            );
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to load analytics"
            );
        } finally {
            setFiltering(false);
        }
    };

    // ---------------------------------------------------
    // INITIAL LOAD
    // ---------------------------------------------------
    useEffect(() => {
        const loadPage = async () => {
            try {
                setLoading(true);
                setError("");

                const groupData = await getGroupById(groupId);

                setGroup(groupData.group);

                await loadAnalytics();
            } catch (err) {
                console.error(err);

                setError(
                    err.response?.data?.message ||
                    "Failed to load analytics"
                );
            } finally {
                setLoading(false);
            }
        };

        if (groupId) {
            loadPage();
        }
    }, [groupId]);

    // ---------------------------------------------------
    // APPLY DATE FILTER
    // ---------------------------------------------------
    const handleApplyFilter = async (e) => {
        e.preventDefault();

        if (startDate && endDate && startDate > endDate) {
            setError(
                "Start date cannot be after end date"
            );
            return;
        }

        const params = {};

        if (startDate) {
            params.startDate = startDate;
        }

        if (endDate) {
            params.endDate = endDate;
        }

        await loadAnalytics(params);
    };

    // ---------------------------------------------------
    // CLEAR FILTER
    // ---------------------------------------------------
    const handleClearFilter = async () => {
        setStartDate("");
        setEndDate("");

        await loadAnalytics();
    };

    // ---------------------------------------------------
    // MONTH NAME
    // ---------------------------------------------------
    const getMonthName = (month) => {
        return new Date(
            2000,
            month - 1,
            1
        ).toLocaleString("en-IN", {
            month: "long"
        });
    };

    // ---------------------------------------------------
    // LOADING
    // ---------------------------------------------------
    if (loading) {
        return (
            <DashboardLayout>
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Loading analytics...
                        </p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

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

                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Analytics
                    </p>

                    <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                        {group?.name || "Group analytics"}
                    </h1>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Understand how your group is spending money.
                    </p>
                </div>

                {/* ERROR */}
                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
                        <p className="text-sm text-red-600 dark:text-red-400">
                            {error}
                        </p>
                    </div>
                )}

                {/* DATE FILTER */}
                <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">

                    <div className="mb-5">
                        <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                            Filter spending
                        </h2>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Select a date range to analyze expenses.
                        </p>
                    </div>

                    <form
                        onSubmit={handleApplyFilter}
                        className="grid gap-4 md:grid-cols-3"
                    >
                        <div>
                            <label className="mb-1.5 block text-sm text-slate-600 dark:text-slate-300">
                                Start date
                            </label>

                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) =>
                                    setStartDate(e.target.value)
                                }
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm text-slate-600 dark:text-slate-300">
                                End date
                            </label>

                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) =>
                                    setEndDate(e.target.value)
                                }
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                            />
                        </div>

                        <div className="flex items-end gap-3">

                            <button
                                type="submit"
                                disabled={filtering}
                                className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                            >
                                {filtering
                                    ? "Applying..."
                                    : "Apply filter"}
                            </button>

                            <button
                                type="button"
                                onClick={handleClearFilter}
                                disabled={filtering}
                                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                Clear
                            </button>

                        </div>
                    </form>
                </div>

                {/* SUMMARY CARDS */}
                {analytics && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Total spending
                            </p>

                            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                                ₹
                                {Number(
                                    analytics.totalExpense || 0
                                ).toFixed(2)}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Expenses
                            </p>

                            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                                {analytics.expenseCount || 0}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Categories
                            </p>

                            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                                {analytics.categoryCount || 0}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Average daily
                            </p>

                            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                                {analytics.averageDailyExpense !== null &&
                                analytics.averageDailyExpense !== undefined
                                    ? `₹${Number(
                                          analytics.averageDailyExpense
                                      ).toFixed(2)}`
                                    : "—"}
                            </p>
                        </div>

                    </div>
                )}

                {/* HIGHEST CATEGORY */}
                {analytics?.highestCategory && (
                    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Highest spending category
                        </p>

                        <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">

                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                                {analytics.highestCategory.category}
                            </h2>

                            <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                ₹
                                {Number(
                                    analytics.highestCategory.amount
                                ).toFixed(2)}
                            </p>

                        </div>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {analytics.highestCategory.percentage}% of total spending
                        </p>

                    </div>
                )}

                {/* CATEGORY BREAKDOWN */}
                <div className="mt-6 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">

                    <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                        <h2 className="font-medium text-slate-900 dark:text-white">
                            Spending by category
                        </h2>
                    </div>

                    {analytics?.categoryBreakdown?.length === 0 ? (
                        <p className="px-5 py-6 text-sm text-slate-500 dark:text-slate-400">
                            No category data available.
                        </p>
                    ) : (
                        <div className="divide-y divide-slate-200 dark:divide-slate-800">

                            {analytics?.categoryBreakdown?.map(
                                (item) => (
                                    <div
                                        key={item.category}
                                        className="px-5 py-5"
                                    >

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                    {item.category}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                    {item.percentage}%
                                                </p>
                                            </div>

                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                ₹
                                                {Number(
                                                    item.amount
                                                ).toFixed(2)}
                                            </p>
                                        </div>

                                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">

                                            <div
                                                className="h-full rounded-full bg-slate-900 dark:bg-white"
                                                style={{
                                                    width: `${Math.min(
                                                        Number(
                                                            item.percentage
                                                        ),
                                                        100
                                                    )}%`
                                                }}
                                            />

                                        </div>

                                    </div>
                                )
                            )}

                        </div>
                    )}

                </div>

                {/* MONTHLY TRENDS */}
                <div className="mt-6 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">

                    <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                        <h2 className="font-medium text-slate-900 dark:text-white">
                            Monthly expense trends
                        </h2>

                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Total spending grouped by month.
                        </p>
                    </div>

                    {monthlyTrends.length === 0 ? (
                        <p className="px-5 py-6 text-sm text-slate-500 dark:text-slate-400">
                            No monthly expense data available.
                        </p>
                    ) : (
                        <div className="divide-y divide-slate-200 dark:divide-slate-800">

                            {monthlyTrends.map((item) => {

                                const maxExpense = Math.max(
                                    ...monthlyTrends.map(
                                        (trend) =>
                                            Number(
                                                trend.totalExpense
                                            ) || 0
                                    ),
                                    1
                                );

                                const width =
                                    (Number(
                                        item.totalExpense
                                    ) /
                                        maxExpense) *
                                    100;

                                return (
                                    <div
                                        key={`${item.year}-${item.month}`}
                                        className="px-5 py-5"
                                    >

                                        <div className="flex items-center justify-between">

                                            <div>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                    {getMonthName(
                                                        item.month
                                                    )}{" "}
                                                    {item.year}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                    {
                                                        item.expenseCount
                                                    }{" "}
                                                    {item.expenseCount ===
                                                    1
                                                        ? "expense"
                                                        : "expenses"}
                                                </p>
                                            </div>

                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                ₹
                                                {Number(
                                                    item.totalExpense
                                                ).toFixed(2)}
                                            </p>

                                        </div>

                                        <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">

                                            <div
                                                className="h-full rounded-full bg-slate-900 dark:bg-white"
                                                style={{
                                                    width: `${width}%`
                                                }}
                                            />

                                        </div>

                                    </div>
                                );
                            })}

                        </div>
                    )}

                </div>

            </div>
        </DashboardLayout>
    );
};

export default Analytics;