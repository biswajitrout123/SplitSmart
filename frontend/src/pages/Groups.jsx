import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layouts/DashboardLayout";
import GroupCard from "../components/groups/GroupCard";
import CreateGroupModal from "../components/groups/CreateGroupModal";
import {
    getMyGroups,
    createGroup
} from "../services/group.service";

const Groups = () => {
    const navigate = useNavigate();

    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);

    const loadGroups = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getMyGroups();

            setGroups(data.groups || []);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to load groups"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGroups();
    }, []);

    const handleCreateGroup = async (formData) => {
        try {
            const data = await createGroup(formData);

            const newGroup = data.group;

            setGroups((prev) => [newGroup, ...prev]);

            setShowModal(false);

            navigate(`/groups/${newGroup._id}`);
        } catch (err) {
            throw new Error(
                err.response?.data?.message ||
                "Failed to create group"
            );
        }
    };

    return (
        <DashboardLayout>

            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
                            Groups
                        </h1>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Manage your shared expense groups.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowModal(true)}
                        className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                    >
                        + Create group
                    </button>

                </div>

                {/* Loading */}
                {loading && (
                    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Loading your groups...
                        </p>
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-950/30">
                        <p className="text-sm text-red-600 dark:text-red-400">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={loadGroups}
                            className="mt-3 text-sm font-medium text-slate-900 underline dark:text-white"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* Empty */}
                {!loading &&
                    !error &&
                    groups.length === 0 && (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">

                            <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                                No groups yet
                            </h2>

                            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                                Create your first group and start sharing
                                expenses with friends, family or teammates.
                            </p>

                            <button
                                type="button"
                                onClick={() => setShowModal(true)}
                                className="mt-5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-slate-900"
                            >
                                Create your first group
                            </button>

                        </div>
                    )}

                {/* Groups */}
                {!loading &&
                    !error &&
                    groups.length > 0 && (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                            {groups.map((group) => (
                                <GroupCard
                                    key={group._id}
                                    group={group}
                                    onOpen={() =>
                                        navigate(`/groups/${group._id}`)
                                    }
                                />
                            ))}

                        </div>
                    )}

            </div>

            {/* Create modal */}
            {showModal && (
                <CreateGroupModal
                    onClose={() => setShowModal(false)}
                    onCreate={handleCreateGroup}
                />
            )}

        </DashboardLayout>
    );
};

export default Groups;