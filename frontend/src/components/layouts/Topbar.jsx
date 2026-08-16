import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const Topbar = () => {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-950">

            {/* Page title */}
            <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Overview
                </p>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">

                {/* Theme toggle */}
                <button
                    type="button"
                    onClick={toggleTheme}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                    {theme === "dark" ? "Light" : "Dark"}
                </button>

                {/* Divider */}
                <div className="hidden h-8 w-px bg-slate-200 dark:bg-slate-800 sm:block" />

                {/* User information */}
                <div className="text-right">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {user?.name || "User"}
                    </p>

                    <p className="text-xs text-slate-500 dark:text-slate-500">
                        {user?.email || ""}
                    </p>
                </div>

                {/* Avatar */}
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>

            </div>

        </header>
    );
};

export default Topbar;