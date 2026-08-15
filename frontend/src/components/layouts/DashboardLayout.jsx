import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const DashboardLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-100">

            <Sidebar />

            <div className="flex min-w-0 flex-1 flex-col">

                <Topbar />

                <main className="flex-1 overflow-y-auto bg-slate-950 p-6">
                    {children}
                </main>

            </div>

        </div>
    );
};

export default DashboardLayout;