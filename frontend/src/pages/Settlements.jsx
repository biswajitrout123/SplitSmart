import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../components/layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { getGroupById } from "../services/group.service";
import {
    getGroupSettlements,
    getSettlementSummary
} from "../services/settlement.service";

const Settlements = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [group, setGroup] = useState(null);
    const [settlements, setSettlements] = useState([]);
    const [summary, setSummary] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadSettlements = async () => {
            try {
                setLoading(true);
                setError("");

                const [
                    groupData,
                    settlementData,
                    summaryData
                ] = await Promise.all([
                    getGroupById(groupId),
                    getGroupSettlements(groupId),
                    getSettlementSummary(groupId)
                ]);

                setGroup(groupData.group);
                setSettlements(settlementData.settlements || []);
                setSummary(summaryData);
            } catch (err) {
                console.error(err);

                setError(
                    err.response?.data?.message ||
                    "Failed to load settlements"
                );
            } finally {
                setLoading(false);
            }
        };

        if (groupId) {
            loadSettlements();
        }
    }, [groupId]);

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

                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Settlements
                        </p>

                        <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                            {group?.name || "Group settlements"}
                        </h1>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Track payments between group members.
                        </p>
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

                {/* Loading */}
                {loading && (
                    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Loading settlements...
                        </p>
                    </div>
                )}

                {!loading && !error && (
                    <>
                        {/* Summary */}
                        {summary && (
                            <div className="grid gap-4 sm:grid-cols-3">

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

                                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Settlement count
                                    </p>

                                    <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                                        {summary.settlementCount || 0}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Your net settlement
                                    </p>

                                    <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                                        ₹
                                        {Number(
                                            summary.mySettlement
                                                ?.netSettlement || 0
                                        ).toFixed(2)}
                                    </p>
                                </div>

                            </div>
                        )}

                        {/* Create settlement */}
                        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">

                            <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                                Record a settlement
                            </h2>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Record money that was paid from one group
                                member to another.
                            </p>

                            <button
                                type="button"
                                className="mt-5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-slate-900"
                            >
                                + Record settlement
                            </button>
                        </div>

                        {/* History */}
                        <div className="mt-6 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">

                            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">

                                <h2 className="font-medium text-slate-900 dark:text-white">
                                    Settlement history
                                </h2>

                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                    {settlements.length} settlements
                                </span>

                            </div>

                            {settlements.length === 0 ? (
                                <p className="px-5 py-6 text-sm text-slate-500 dark:text-slate-400">
                                    No settlements recorded yet.
                                </p>
                            ) : (
                                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {settlements.map(
                                        (settlement) => (
                                            <div
                                                key={settlement._id}
                                                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                        {
                                                            settlement.from
                                                                ?.name
                                                        }{" "}
                                                        paid{" "}
                                                        {
                                                            settlement.to
                                                                ?.name
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                        {settlement.createdAt
                                                            ? new Date(
                                                                settlement.createdAt
                                                            ).toLocaleDateString()
                                                            : ""}
                                                    </p>
                                                </div>

                                                <p className="text-base font-semibold text-slate-900 dark:text-white">
                                                    ₹
                                                    {Number(
                                                        settlement.amount
                                                    ).toFixed(2)}
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

export default Settlements;