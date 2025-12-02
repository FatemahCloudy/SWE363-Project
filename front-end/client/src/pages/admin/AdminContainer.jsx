import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Route, Switch, Link } from "wouter";
import {
    LayoutDashboard,
    Users,
    Flag,
    AlertCircle,
    FileText,
    Bell,
    Shield,
    Search,
    Lightbulb,
    Map,
    LogOut,
    Menu,
    Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import AdminDashboard from "./AdminDashboard";
import UserManagement from "./UserManagement";
import ContentModeration from "./ContentModeration";
import ContentManagement from "./ContentManagement";
import NotificationManagement from "./NotificationManagement";
import SecuritySettings from "./SecuritySettings";
import SearchCustomization from "./SearchCustomization";
import InnovationManagement from "./InnovationManagement";
import MapLocationManagement from "./MapLocationManagement";
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
    {
        title: "Content Management",
        url: "/admin/content",
        icon: FileText,
    },
    {
        title: "Notifications",
        url: "/admin/notifications",
        icon: Bell,
    },
    {
        title: "Security Settings",
        url: "/admin/security",
        icon: Shield,
    },
    {
        title: "Search Settings",
        url: "/admin/search",
        icon: Search,
    },
    {
        title: "Innovation Ideas",
        url: "/admin/innovations",
        icon: Lightbulb,
    },
    {
        title: "Map & Locations",
        url: "/admin/map",
        icon: Map,
    },
];

function AdminSidebar({ user }) {
    const [location] = useLocation();

    return (
        <aside className="hidden md:flex w-56 h-screen bg-[#490057] flex-col fixed left-0 top-0">
            <header className="flex items-center gap-3 px-5 pt-8 pb-6">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
          <span className="font-['Nunito',Helvetica] font-bold text-white text-sm leading-tight">
            Admin
          </span>
                    <span className="font-['Nunito',Helvetica] font-bold text-white text-sm leading-tight">
            Panel
          </span>
                </div>
            </header>

            <Separator className="bg-white/10" />

            <nav className="flex flex-col gap-2.5 px-5 mt-6 flex-1 overflow-y-auto">
                {adminMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.url;

                    return (
                        <Link key={item.title} href={item.url}>
                            <Button
                                data-testid={`nav-admin-${item.title.toLowerCase().replace(/\s/g, '-')}`}
                                variant="ghost"
                                className={`min-h-11 w-full justify-start gap-4 px-3 py-2.5 relative transition-colors duration-200 ${
                                    isActive
                                        ? "text-[#fbb03b] hover:text-[#fbb03b] hover:bg-transparent"
                                        : "text-white/70 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                {isActive && (
                                    <div className="absolute top-0 left-0 w-20 h-full rounded-[0px_5px_5px_0px] bg-[linear-gradient(90deg,rgba(251,176,59,1)_54%,rgba(255,255,255,0)_100%)] opacity-20" />
                                )}
                                <Icon className="w-5 h-5 relative z-10" />
                                <span className="font-['Nunito',Helvetica] font-semibold text-sm leading-relaxed relative z-10">
                  {item.title}
                </span>
                            </Button>
                        </Link>
                    );
                })}

                <Separator className="bg-white/10 my-2" />

                <Link href="/">
                    <Button
                        data-testid="nav-exit-admin"
                        variant="ghost"
                        className="min-h-11 w-full justify-start gap-4 px-3 py-2.5 text-white/70 hover:text-white hover:bg-white/5 transition-colors duration-200"
                    >
                        <Home className="w-5 h-5" />
                        <span className="font-['Nunito',Helvetica] font-semibold text-sm leading-relaxed">
              Back to App
            </span>
                    </Button>
                </Link>
            </nav>

            <div className="px-5 pb-6 pt-4">
                <Separator className="bg-white/10 mb-4" />

                {user?.username && (
                    <div className="flex items-center gap-3 p-2 rounded-lg">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={user?.avatarUrl || undefined} />
                            <AvatarFallback className="bg-white/20 text-white">
                                {user?.username?.slice(0, 2).toUpperCase() || "A"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col flex-1 overflow-hidden">
              <span className="font-['Nunito',Helvetica] font-semibold text-white text-sm truncate">
                {user?.username || "Admin"}
              </span>
                            <span className="font-['Nunito',Helvetica] text-white/60 text-xs capitalize">
                {user?.role || "admin"}
              </span>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}

function MobileAdminHeader({ user }) {
    const [location] = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <div className="md:hidden fixed top-0 left-0 right-0 z-[60] bg-[#490057] px-4 py-3 flex items-center justify-between h-[52px]">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="font-['Nunito',Helvetica] font-bold text-white text-sm">
          Admin Panel
        </span>
            </div>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10"
                        data-testid="button-admin-mobile-menu"
                    >
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 bg-[#490057] border-none p-0">
                    <div className="flex flex-col h-full">
                        <SheetHeader className="px-5 pt-6 pb-4">
                            <SheetTitle className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex flex-col text-left">
                  <span className="font-['Nunito',Helvetica] font-bold text-white text-sm leading-tight">
                    Admin
                  </span>
                                    <span className="font-['Nunito',Helvetica] font-bold text-white text-sm leading-tight">
                    Panel
                  </span>
                                </div>
                            </SheetTitle>
                        </SheetHeader>

                        <Separator className="bg-white/10" />

                        <nav className="flex flex-col gap-2.5 px-5 mt-4 flex-1 overflow-y-auto">
                            {adminMenuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location === item.url;

                                return (
                                    <Link key={item.title} href={item.url} onClick={closeMobileMenu}>
                                        <Button
                                            variant="ghost"
                                            className={`min-h-11 w-full justify-start gap-4 px-3 py-2.5 ${
                                                isActive
                                                    ? "text-[#fbb03b]"
                                                    : "text-white/70 hover:text-white hover:bg-white/5"
                                            }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className="font-['Nunito',Helvetica] font-semibold text-sm">
                        {item.title}
                      </span>
                                        </Button>
                                    </Link>
                                );
                            })}

                            <Separator className="bg-white/10 my-2" />

                            <Link href="/" onClick={closeMobileMenu}>
                                <Button
                                    variant="ghost"
                                    className="min-h-11 w-full justify-start gap-4 px-3 py-2.5 text-white/70 hover:text-white hover:bg-white/5"
                                >
                                    <Home className="w-5 h-5" />
                                    <span className="font-['Nunito',Helvetica] font-semibold text-sm">
                    Back to App
                  </span>
                                </Button>
                            </Link>
                        </nav>

                        <div className="px-5 pb-6 pt-4">
                            <Separator className="bg-white/10 mb-4" />

                            {user?.username && (
                                <div className="flex items-center gap-3 p-2 rounded-lg">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={user?.avatarUrl || undefined} />
                                        <AvatarFallback className="bg-white/20 text-white">
                                            {user?.username?.slice(0, 2).toUpperCase() || "A"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col flex-1 overflow-hidden">
                    <span className="font-['Nunito',Helvetica] font-semibold text-white text-sm truncate">
                      {user?.username || "Admin"}
                    </span>
                                        <span className="font-['Nunito',Helvetica] text-white/60 text-xs capitalize">
                      {user?.role || "admin"}
                    </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
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

    return (
        <div className="min-h-screen bg-background">
            <MobileAdminHeader user={user} />
            <AdminSidebar user={user} />

            <main className="md:ml-56 pt-[52px] md:pt-0 min-h-screen">
                <Switch>
                    <Route path="/admin" component={AdminDashboard} />
                    <Route path="/admin/users" component={UserManagement} />
                    <Route path="/admin/moderation" component={ContentModeration} />
                    <Route path="/admin/content" component={ContentManagement} />
                    <Route path="/admin/notifications" component={NotificationManagement} />
                    <Route path="/admin/security" component={SecuritySettings} />
                    <Route path="/admin/search" component={SearchCustomization} />
                    <Route path="/admin/innovations" component={InnovationManagement} />
                    <Route path="/admin/map" component={MapLocationManagement} />
                    <Route component={NotFound} />
                </Switch>
            </main>
        </div>
    );
}
