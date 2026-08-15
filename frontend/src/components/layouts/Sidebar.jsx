import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
    const { logout } = useAuth();

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
            path: "/expenses"
        },
        {
            label: "Settlements",
            path: "/settlements"
        },
        {
            label: "Analytics",
            path: "/analytics"
        }
    ];

    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            window.location.href = "/login";
        }
    };

    return (
        <aside className="flex w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-950">

            {/* Brand */}
            <div className="border-b border-slate-800 px-6 py-5">
                <h1 className="text-xl font-semibold tracking-tight text-white">
                    SplitSmart
                </h1>

                <p className="mt-1 text-xs text-slate-500">
                    Expense sharing made simple
                </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-5">
                <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Workspace
                </p>

                <div className="space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                [
                                    "block rounded-lg px-3 py-2.5 text-sm transition",
                                    isActive
                                        ? "bg-slate-800 text-white"
                                        : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                                ].join(" ")
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </div>
            </nav>

            {/* Bottom */}
            <div className="border-t border-slate-800 p-3">
                <button
                    onClick={handleLogout}
                    className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                >
                    Logout
                </button>
            </div>

        </aside>
    );
};

export default Sidebar;