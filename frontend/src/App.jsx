import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Groups from "./pages/Groups";
import GroupDetails from "./pages/GroupDetails";

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

                        <Route path="/" element={<Home />} />

                        <Route path="/login" element={<Login />} />

                        <Route path="/dashboard" element={<ProtectedRoute>  <Dashboard /> </ProtectedRoute>} />

                        <Route path="/groups" element={<ProtectedRoute> <Groups /> </ProtectedRoute>} />

                        <Route path="/groups/:groupId" element={<ProtectedRoute><GroupDetails /></ProtectedRoute>}></Route>


                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;