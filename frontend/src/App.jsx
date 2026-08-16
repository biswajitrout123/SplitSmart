import { BrowserRouter, Routes, Route, Link} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import Groups from "./pages/Groups";
import GroupDetails from "./pages/GroupDetails";
import Expenses from "./pages/Expenses";
import Settlements from "./pages/Settlements";

import ProtectedRoute from "./components/ProtectedRoute";

function Home() {
    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-white">
            <div className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-16">
                <div className="max-w-2xl">

                    <p className="text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        SplitSmart
                    </p>

                    <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                        Smart expense splitting for groups.
                    </h1>

                    <p className="mt-5 max-w-xl text-base leading-7 text-slate-500 dark:text-slate-400">
                        Manage shared expenses, balances and settlements
                        with your friends without doing the calculations
                        manually.
                    </p>

                    <div className="mt-8 flex gap-3">
                        <Link
                            to="/login"
                            className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                        >
                            Sign in
                        </Link>

                        <Link
                            to="/register"
                            className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-white dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
                        >
                            Create account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>

                        {/* Public */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Main dashboard */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />

                        {/* Groups */}
                        <Route
                            path="/groups"
                            element={
                                <ProtectedRoute>
                                    <Groups />
                                </ProtectedRoute>
                            }
                        />

                        {/* Group overview */}
                        <Route
                            path="/groups/:groupId"
                            element={
                                <ProtectedRoute>
                                    <GroupDetails />
                                </ProtectedRoute>
                            }
                        />

                        {/* Group expenses */}
                        <Route
                            path="/groups/:groupId/expenses"
                            element={
                                <ProtectedRoute>
                                    <Expenses />
                                </ProtectedRoute>
                            }
                        />

                        {/* Group settlements */}
                        <Route
                            path="/groups/:groupId/settlements"
                            element={
                                <ProtectedRoute>
                                    <Settlements />
                                </ProtectedRoute>
                            }
                        />

                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;