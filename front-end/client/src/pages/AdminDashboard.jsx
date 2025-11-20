import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "@/lib/auth";
import { MainLayout } from "@/components/layouts/MainLayout";

import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import HomePage from "@/pages/HomePage";
import MemoryDetailPage from "@/pages/MemoryDetailPage";
import ProfilePage from "@/pages/ProfilePage";
import PublicProfilePage from "@/pages/PublicProfilePage";
import MessagesPage from "@/pages/MessagesPage";
import { SavedMemoryPage } from "@/pages/SavedMemoryPage";
import DiscoverPage from "@/pages/DiscoverPage";
import { SettingsPage } from "@/pages/SettingsPage";
import AdminContainer from "@/pages/admin/AdminContainer";
import NotificationsPage from "@/pages/NotificationsPage";

// Protected Route component with layout
function ProtectedRoute({ component: Component }) {
    const { isAuthenticated, isLoading } = useAuth();
    const [location] = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Redirect to="/landing" />;
    }

    return (
        <MainLayout>
            <Component />
        </MainLayout>
    );
}

// Public Route component (redirect to home if already authenticated)
function PublicRoute({ component: Component }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Redirect to="/" />;
    }

    return <Component />;
}

function Router() {
    return (
        <Switch>
            {/* Public routes */}
            <Route path="/landing" component={LandingPage} />
            <Route path="/login">
                {() => <PublicRoute component={LoginPage} />}
            </Route>
            <Route path="/signup">
                {() => <PublicRoute component={SignupPage} />}
            </Route>

            {/* Protected routes */}
            <Route path="/">
                {() => <ProtectedRoute component={HomePage} />}
            </Route>
            <Route path="/profile/:username">
                {() => <ProtectedRoute component={ProfilePage} />}
            </Route>
            <Route path="/user/:username">
                {() => <ProtectedRoute component={PublicProfilePage} />}
            </Route>
            <Route path="/memory/:id">
                {() => <ProtectedRoute component={MemoryDetailPage} />}
            </Route>
            <Route path="/messages">
                {() => <ProtectedRoute component={MessagesPage} />}
            </Route>
            <Route path="/saved">
                {() => <ProtectedRoute component={SavedMemoryPage} />}
            </Route>
            <Route path="/discover">
                {() => <ProtectedRoute component={DiscoverPage} />}
            </Route>
            <Route path="/settings">
                {() => <ProtectedRoute component={SettingsPage} />}
            </Route>
            <Route path="/notifications">
                {() => <ProtectedRoute component={NotificationsPage} />}
            </Route>

            {/* Admin routes - separate layout */}
            <Route path="/admin/:rest*">
                {() => <AdminContainer />}
            </Route>
            <Route path="/admin">
                {() => <AdminContainer />}
            </Route>

            {/* Fallback to 404 */}
            <Route component={NotFound} />
        </Switch>
    );
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <TooltipProvider>
                    <Toaster />
                    <Router />
                </TooltipProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;
