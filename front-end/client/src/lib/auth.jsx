import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { localStorageAuth } from "@/lib/localStorage";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            // Use localStorage instead of API
            const userData = localStorageAuth.getCurrentUser();
            setUser(userData);
        } catch (error) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (username, password) => {
        const response = await apiRequest("POST", "/api/auth/login", { username, password });
        const userData = await response.json();
        setUser(userData);
        // Invalidate specific queries that depend on auth state
        queryClient.invalidateQueries({ queryKey: ["/api/memories"] });
        queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    };

    const signup = async (username, email, password) => {
        const response = await apiRequest("POST", "/api/auth/signup", { username, email, password });
        const userData = await response.json();
        setUser(userData);
        // Invalidate specific queries that depend on auth state
        queryClient.invalidateQueries({ queryKey: ["/api/memories"] });
        queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    };

    const logout = async () => {
        await apiRequest("POST", "/api/auth/logout");
        setUser(null);
        // Clear only user-specific data on logout
        queryClient.removeQueries({ queryKey: ["/api/memories"] });
        queryClient.removeQueries({ queryKey: ["/api/users"] });
        queryClient.removeQueries({ queryKey: ["/api/messages"] });
        queryClient.removeQueries({ queryKey: ["/api/notifications"] });
    };

    const value = {
        user,
        isLoading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        isCreator: true, // All users can create
        isViewer: true, // All users can view
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
