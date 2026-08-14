import { createContext, useContext, useEffect, useState } from "react";
import {
    loginUser,
    registerUser,
    getCurrentUser,
    logoutUser
} from "../services/auth.service";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = async (userData) => {
        const data = await loginUser(userData);

        if (data.success) {
            setUser(data.user);
        }

        return data;
    };

    const register = async (userData) => {
        return await registerUser(userData);
    };

    const logout = async () => {
        await logoutUser();
        setUser(null);
    };

    useEffect(() => {
        const loadUser = async () => {
            try {
                const data = await getCurrentUser();

                if (data.success) {
                    setUser(data.user);
                }
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};