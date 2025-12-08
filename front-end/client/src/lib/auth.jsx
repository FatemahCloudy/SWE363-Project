import { createContext, useContext, useState, useEffect } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await apiRequest("GET", "/api/auth/me");
            const data = await response.json();
            if (data?.user) {
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (username, password) => {
        const response = await apiRequest("POST", "/api/auth/login", { username, password });
        const data = await response.json();
        if (data?.user) {
            setUser(data.user);
        }
        await queryClient.invalidateQueries();
    };

    const signup = async (username, email, password) => {
        const response = await apiRequest("POST", "/api/auth/signup", { username, email, password });
        const data = await response.json();
        if (data?.user) {
            setUser(data.user);
        }
        await queryClient.invalidateQueries();
    };

    const logout = async () => {
        await apiRequest("POST", "/api/auth/logout");
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
