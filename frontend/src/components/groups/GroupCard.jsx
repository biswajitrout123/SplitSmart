const GroupCard = ({ group, onOpen }) => {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">

            <div className="flex items-start justify-between gap-3">

                <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {group.name}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {group.description || "No description"}
                    </p>
                </div>

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {group.name?.charAt(0)?.toUpperCase() || "G"}
                </div>

            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">

                <div>
                    <p className="text-xs text-slate-500">
                        Members
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                        {group.members?.length || 0}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onOpen}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                    Open group
                </button>

            </div>

        </div>
    );
};

export default GroupCard;