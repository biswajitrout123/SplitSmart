import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const DashboardLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">

            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

                <Topbar setSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 dark:bg-slate-950">
                    {children}
                </main>

            </div>

        </div>
    );
};

export default DashboardLayout;