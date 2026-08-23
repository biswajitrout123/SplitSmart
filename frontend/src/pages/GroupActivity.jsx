import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layouts/DashboardLayout";
import { getGroupActivity } from "../services/activity.service";

const GroupActivity = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();

    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const loadActivities = async (pageNum = 1) => {
        try {
            if (pageNum === 1) setLoading(true);
            else setLoadingMore(true);
            setError("");

            const data = await getGroupActivity(groupId, pageNum, 50);
            
            if (pageNum === 1) {
                setActivities(data.activities || []);
            } else {
                setActivities(prev => [...prev, ...(data.activities || [])]);
            }
            
            setHasMore(data.hasMore);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to load activity feed");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        loadActivities(1);
    }, [groupId]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadActivities(nextPage);
    };

    const getIconForType = (type) => {
        switch (type) {
            case "expense_added":
                return "➕";
            case "expense_edited":
                return "✏️";
            case "expense_deleted":
                return "🗑️";
            case "settlement_recorded":
                return "💸";
            case "settlement_deleted":
                return "❌";
            default:
                return "ℹ️";
        }
    };

    return (
        <DashboardLayout>
            <div className="mx-auto max-w-3xl">
                {/* Back */}
                <button
                    type="button"
                    onClick={() => navigate(`/groups/${groupId}`)}
                    className="mb-6 text-sm text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                    ← Back to group overview
                </button>

                <h1 className="mb-6 text-2xl font-semibold text-slate-900 dark:text-white">
                    Group Activity
                </h1>

                {loading ? (
                    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Loading activity...</p>
                    </div>
                ) : error ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/30">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                ) : activities.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-4xl mb-4">📭</p>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No activity yet</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Add an expense or record a settlement to get started!
                        </p>
                    </div>
                ) : (
                    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                        <div className="divide-y divide-slate-200 dark:divide-slate-800">
                            {activities.map((activity, idx) => (
                                <div key={activity._id || idx} className="flex gap-4 p-5">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg dark:bg-slate-800">
                                        {getIconForType(activity.type)}
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-900 dark:text-white leading-relaxed">
                                            {activity.message}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            {new Date(activity.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {hasMore && (
                            <div className="border-t border-slate-200 p-4 text-center dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                                >
                                    {loadingMore ? "Loading..." : "Load More"}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default GroupActivity;
