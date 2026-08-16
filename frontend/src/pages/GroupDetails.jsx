import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layouts/DashboardLayout";
import { getGroupById } from "../services/group.service";

const GroupDetails = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();

    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadGroup = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getGroupById(groupId);

                setGroup(data.group);
            } catch (err) {
                console.error(err);

                setError(
                    err.response?.data?.message ||
                    "Failed to load group"
                );
            } finally {
                setLoading(false);
            }
        };

        loadGroup();
    }, [groupId]);

    return (
        <DashboardLayout>

            <div className="mx-auto max-w-7xl">

                <button
                    type="button"
                    onClick={() => navigate("/groups")}
                    className="mb-6 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                    ← Back to groups
                </button>

                {loading && (
                    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Loading group...
                        </p>
                    </div>
                )}

                {!loading && error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/30">
                        <p className="text-sm text-red-600 dark:text-red-400">
                            {error}
                        </p>
                    </div>
                )}

                {!loading && !error && group && (
                    <>
                        <div className="mb-8">

                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Group
                            </p>

                            <div className="mt-1 flex items-start justify-between gap-4">

                                <div>
                                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
                                        {group.name}
                                    </h1>

                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        {group.description || "No description"}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate("/dashboard")
                                    }
                                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                                >
                                    Dashboard
                                </button>

                            </div>

                        </div>

                        <div className="grid gap-6 lg:grid-cols-3">

                            {/* Group info */}
                            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">

                                <h2 className="font-medium text-slate-900 dark:text-white">
                                    Group members
                                </h2>

                                <div className="mt-4 space-y-3">

                                    {group.members?.map((member) => (
                                        <div
                                            key={member._id}
                                            className="flex items-center gap-3"
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
                                    ))}

                                </div>

                            </div>

                            {/* Expenses */}
                            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">

                                <h2 className="font-medium text-slate-900 dark:text-white">
                                    Expenses
                                </h2>

                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                    Expense management will appear here.
                                </p>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate("/expenses")
                                    }
                                    className="mt-5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-slate-900"
                                >
                                    View expenses
                                </button>

                            </div>

                            {/* Settlements */}
                            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">

                                <h2 className="font-medium text-slate-900 dark:text-white">
                                    Settlements
                                </h2>

                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                    Settlement information will appear here.
                                </p>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate("/settlements")
                                    }
                                    className="mt-5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-slate-900"
                                >
                                    View settlements
                                </button>

                            </div>

                        </div>
                    </>
                )}

            </div>

        </DashboardLayout>
    );
};

export default GroupDetails;