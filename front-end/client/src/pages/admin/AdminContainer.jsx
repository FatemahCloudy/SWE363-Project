import { useQuery } from "@tanstack/react-query";
import { useLocation, Route, Switch, Link } from "wouter";
import {
    SidebarProvider,
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Users, Flag, AlertCircle } from "lucide-react";
import AdminDashboard from "./AdminDashboard";
import UserManagement from "./UserManagement";
import ContentModeration from "./ContentModeration";
import NotFound from "../not-found";

const adminMenuItems = [
    {
        title: "Dashboard",
        url: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "User Management",
        url: "/admin/users",
        icon: Users,
    },
    {
        title: "Content Moderation",
        url: "/admin/moderation",
        icon: Flag,
    },
];

function AdminSidebar() {
    const [location] = useLocation();

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {adminMenuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={location === item.url}>
                                        <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/\s/g, '-')}`}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}

export default function AdminContainer() {
    const { data: user, isLoading } = useQuery({
        queryKey: ["/api/auth/me"],
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a303a0]" />
            </div>
        );
    }

    if (!user || user.role !== "admin") {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <AlertCircle className="w-16 h-16 text-destructive" />
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="text-muted-foreground">
                    You don't have permission to access the admin panel.
                </p>
                <Link href="/" className="text-[#a303a0] hover:underline">
                    Go to Home
                </Link>
            </div>
        );
    }

    const style = {
        "--sidebar-width": "16rem",
        "--sidebar-width-icon": "3rem",
    };

    return (
        <SidebarProvider style={style.CSSProperties}>
            <div className="flex h-screen w-full">
                <AdminSidebar />
                <div className="flex flex-col flex-1">
                    <header className="flex items-center justify-between p-2 border-b min-h-9">
                        <SidebarTrigger data-testid="button-sidebar-toggle" />
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{user.username}</span>
                            <Link href="/" className="text-sm text-[#a303a0] hover:underline" data-testid="link-exit-admin">
                                Exit Admin
                            </Link>
                        </div>
                    </header>
                    <main className="flex-1 overflow-auto bg-background">
                        <Switch>
                            <Route path="/admin" component={AdminDashboard} />
                            <Route path="/admin/users" component={UserManagement} />
                            <Route path="/admin/moderation" component={ContentModeration} />
                            <Route component={NotFound} />
                        </Switch>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
