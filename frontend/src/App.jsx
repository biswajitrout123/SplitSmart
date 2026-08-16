import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

import Groups from "./pages/Groups";
import GroupDetails from "./pages/GroupDetails";
import Expenses from "./pages/Expenses";
import Settlements from "./pages/Settlements";

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
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>

                        {/* Public routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />

                        {/* Dashboard */}
                        <Route path="/dashboard" element={<ProtectedRoute>  <Dashboard /> </ProtectedRoute>} />
                        
                        {/* Groups */}
                        <Route path="/groups" element={<ProtectedRoute> <Groups /> </ProtectedRoute>} />
                        
                        {/* Single group */}
                        <Route path="/groups/:groupId" element={<ProtectedRoute><GroupDetails /></ProtectedRoute>}></Route>

                        {/* Group expenses */}
                        <Route path="/groups/:groupId/expenses" element={<ProtectedRoute> <Expenses /></ProtectedRoute>} />
                        
                        {/* Group settlements */}
                        <Route path="/groups/:groupId/settlements" element={<ProtectedRoute> <Settlements /> </ProtectedRoute>} />

                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;