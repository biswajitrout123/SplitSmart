import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
    const { logout } = useAuth();
    const location = useLocation();

    // Close sidebar on route change
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname, setSidebarOpen]);

    const activeGroupId = localStorage.getItem("activeGroupId");

    const navItems = [
        {
            label: "Overview",
            path: "/dashboard"
        },
        {
            label: "Groups",
            path: "/groups"
        },
        {
            label: "Expenses",
            path: activeGroupId
                ? `/groups/${activeGroupId}/expenses`
                : "/groups"
        },
        {
            label: "Settlements",
            path: activeGroupId
                ? `/groups/${activeGroupId}/settlements`
                : "/groups"
        }
    ];

    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            localStorage.removeItem("activeGroupId");
            window.location.href = "/login";
        }
    };

    return (
        <>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar content */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 dark:border-slate-800 dark:bg-slate-950 lg:static lg:translate-x-0 ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >

                {/* Brand */}
                <div className="flex h-16 shrink-0 items-center border-b border-slate-200 px-6 dark:border-slate-800">
                    <div>
                        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                            SplitSmart
                        </h1>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            Expense sharing made simple
                        </p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-5">

                    <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        Workspace
                    </p>

                    <div className="space-y-1">

                        {navItems.map((item) => (
                            <NavLink
                                key={item.label}
                                to={item.path}
                                className={({ isActive }) =>
                                    [
                                        "block rounded-lg px-3 py-2.5 text-sm font-medium transition",
                                        isActive
                                            ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200"
                                    ].join(" ")
                                }
                            >
                                {item.label}
                            </NavLink>
                        ))}

                    </div>
                </nav>

                {/* Logout */}
                <div className="shrink-0 border-t border-slate-200 p-3 dark:border-slate-800">

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-slate-600 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    >
                        Logout
                    </button>

                </div>

            </aside>
        </>
    );
};

export default Sidebar;