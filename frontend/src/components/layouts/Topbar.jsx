import { useAuth } from "../../context/AuthContext";

const Topbar = () => {
    const { user } = useAuth();

    return (
        <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950 px-6">

            <div>
                <p className="text-sm text-slate-500">
                    Overview
                </p>
            </div>

            <div className="flex items-center gap-3">

                <button
                    type="button"
                    className="rounded-lg border border-slate-800 px-3 py-2 text-sm text-slate-400 hover:bg-slate-900"
                >
                    Dark
                </button>

                <div className="hidden h-8 w-px bg-slate-800 sm:block" />

                <div className="text-right">
                    <p className="text-sm font-medium text-white">
                        {user?.name || "User"}
                    </p>

                    <p className="text-xs text-slate-500">
                        {user?.email || ""}
                    </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>

            </div>

        </header>
    );
};

export default Topbar;