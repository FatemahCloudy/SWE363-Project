import { createContext, useContext, useState, useEffect } from "react";
import { queryClient } from "@/lib/queryClient";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const userData = localStorage.getItem("memoryplace_user");
            setUser(userData ? JSON.parse(userData) : null);
        } catch {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (username, password) => {
        const users = JSON.parse(localStorage.getItem("memoryplace_users") || "[]");
        const user = users.find(
            (u) => u.username === username && u.password === password
        );

        if (!user) {
            setUser(null);
            return;
        }

        const safeUser = { ...user };
        delete safeUser.password;
        localStorage.setItem("memoryplace_user", JSON.stringify(safeUser));

        setUser(safeUser);
        await queryClient.invalidateQueries();
    };

    const signup = async (username, email, password) => {
        const users = JSON.parse(localStorage.getItem("memoryplace_users") || "[]");

        const newUser = {
            id: crypto.randomUUID(),
            username,
            email,
            password,
            role: "creator",
            createdAt: new Date().toISOString(),
        };

        users.push(newUser);
        localStorage.setItem("memoryplace_users", JSON.stringify(users));

        const safeUser = { ...newUser };
        delete safeUser.password;
        localStorage.setItem("memoryplace_user", JSON.stringify(safeUser));

        setUser(safeUser);
        await queryClient.invalidateQueries();
    };

    const logout = async () => {
        localStorage.removeItem("memoryplace_user");
        setUser(null);
        await queryClient.clear();
    };

    const value = {
        user,
        isLoading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        isCreator: true,
        isViewer: true,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
