import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function Home() {
    return (
        <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
            <h1 className="text-3xl font-semibold">
                SplitSmart
            </h1>

            <p className="mt-2 text-slate-400">
                Smart expense splitting for groups.
            </p>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>

                    <Route
                        path="/"
                        element={<Home />}
                    />

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />

                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;