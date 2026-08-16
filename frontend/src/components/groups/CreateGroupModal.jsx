import { useState } from "react";

const CreateGroupModal = ({ onClose, onCreate }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            setError("Group name is required.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            await onCreate({
                name: name.trim(),
                description: description.trim()
            });

        } catch (err) {
            setError(err.message || "Failed to create group");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">

            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">

                {/* Header */}
                <div className="flex items-start justify-between">

                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Create a group
                        </h2>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Start a new shared expense group.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    >
                        ×
                    </button>

                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="mt-6 space-y-4"
                >

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Group name
                        </label>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Goa Trip"
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-500"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Description
                        </label>

                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Trip with college friends"
                            rows={3}
                            className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-500"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                            {error}
                        </p>
                    )}

                    <div className="flex justify-end gap-3 pt-2">

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900"
                        >
                            {loading ? "Creating..." : "Create group"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};

export default CreateGroupModal;