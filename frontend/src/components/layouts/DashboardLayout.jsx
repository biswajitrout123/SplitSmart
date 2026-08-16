import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const DashboardLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">

            <Sidebar />

            <div className="flex min-w-0 flex-1 flex-col">

                <Topbar />

                <main className="flex-1 overflow-y-auto bg-slate-50 p-6 dark:bg-slate-950">
                    {children}
                </main>

            </div>

        </div>
    );
};

export default DashboardLayout;