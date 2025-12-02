import {
    CalendarIcon,
    FileTextIcon,
    HomeIcon,
    ImageIcon,
    MessageSquareIcon,
    SettingsIcon,
    UserIcon,
    LogOut,
    Bell,
    Shield,
    Menu,
    Users,
} from "lucide-react";
import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

const navigationItems = [
    {
        id: "home",
        label: "Home",
        icon: HomeIcon,
        path: "/",
    },
    {
        id: "messages",
        label: "Messages",
        icon: MessageSquareIcon,
        path: "/messages",
    },
    {
        id: "shared-memories",
        label: "Shared Albums",
        icon: Users,
        path: "/shared-memories",
    },
    {
        id: "saved-memory",
        label: "Saved Memory",
        icon: FileTextIcon,
        path: "/saved",
    },
    {
        id: "discover",
        label: "Discover",
        icon: CalendarIcon,
        path: "/discover",
    },
    {
        id: "settings",
        label: "Settings",
        icon: SettingsIcon,
        path: "/settings",
    },
];

export const NavigationMenuSection = () => {
    const [location, setLocation] = useLocation();
    const { user, logout } = useAuth();
    const { toast } = useToast();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Fetch unread notification count
    const { data: unreadData } = useQuery({
        queryKey: ["/api/notifications/unread-count"],
        refetchInterval: 30000, // Refetch every 30 seconds
        enabled: !!user,
    });

    const unreadCount = unreadData?.count || 0;

    const handleLogout = async () => {
        try {
            await logout();
            toast({
                title: "Logged out",
                description: "You have been successfully logged out.",
            });
            setLocation("/landing");
            setMobileMenuOpen(false);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to logout. Please try again.",
                variant: "destructive",
            });
        }
    };

    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <>
            {/* Mobile Menu Button - Only on mobile */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-[60] bg-[#490057] px-4 py-3 flex items-center justify-between h-[52px]">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center">
                        <img className="w-4 h-4" alt="Memory of Place" src="/figmaAssets/home.png" />
                    </div>
                    <span className="font-['Nunito',Helvetica] font-bold text-white text-sm">
            Memory of Place
          </span>
                </div>
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/10"
                            data-testid="button-mobile-menu"
                        >
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 bg-[#490057] border-none p-0">
                        <div className="flex flex-col h-full">
                            <SheetHeader className="px-5 pt-6 pb-4">
                                <SheetTitle className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                        <img className="w-5 h-5" alt="Memory of Place" src="/figmaAssets/home.png" />
                                    </div>
                                    <div className="flex flex-col text-left">
                    <span className="font-['Nunito',Helvetica] font-bold text-white text-sm leading-tight">
                      Memory
                    </span>
                                        <span className="font-['Nunito',Helvetica] font-bold text-white text-sm leading-tight">
                      of Place
                    </span>
                                    </div>
                                </SheetTitle>
                            </SheetHeader>

                            <Separator className="bg-white/10" />

                            <nav className="flex flex-col gap-2.5 px-5 mt-4 flex-1 overflow-y-auto">
                                {/* Notifications */}
                                <Link href="/notifications" onClick={closeMobileMenu}>
                                    <Button
                                        variant="ghost"
                                        className={`min-h-11 w-full justify-start gap-4 px-3 py-2.5 ${
                                            location === "/notifications"
                                                ? "text-[#fbb03b]"
                                                : "text-white/70 hover:text-white hover:bg-white/5"
                                        }`}
                                    >
                                        <Bell className="w-5 h-5" />
                                        <span className="font-['Nunito',Helvetica] font-semibold text-sm">
                      Notifications
                    </span>
                                        {unreadCount > 0 && (
                                            <Badge variant="destructive" className="ml-auto h-5 min-w-5 text-xs">
                                                {unreadCount > 9 ? "9+" : unreadCount}
                                            </Badge>
                                        )}
                                    </Button>
                                </Link>

                                {/* Profile */}
                                {user?.username && (
                                    <Link href={`/profile/${user.username}`} onClick={closeMobileMenu}>
                                        <Button
                                            variant="ghost"
                                            className={`min-h-11 w-full justify-start gap-4 px-3 py-2.5 ${
                                                location === `/profile/${user.username}`
                                                    ? "text-[#fbb03b]"
                                                    : "text-white/70 hover:text-white hover:bg-white/5"
                                            }`}
                                        >
                                            <UserIcon className="w-5 h-5" />
                                            <span className="font-['Nunito',Helvetica] font-semibold text-sm">
                        Profile
                      </span>
                                        </Button>
                                    </Link>
                                )}

                                {/* Navigation Items */}
                                {navigationItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location === item.path;

                                    return (
                                        <Link key={item.id} href={item.path} onClick={closeMobileMenu}>
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
                          {item.label}
                        </span>
                                            </Button>
                                        </Link>
                                    );
                                })}

                                <Separator className="bg-white/10 my-2" />

                                {/* Admin */}
                                {user?.role === "admin" && (
                                    <Link href="/admin" onClick={closeMobileMenu}>
                                        <Button
                                            variant="ghost"
                                            className={`min-h-11 w-full justify-start gap-4 px-3 py-2.5 ${
                                                location === "/admin"
                                                    ? "text-[#fbb03b]"
                                                    : "text-white/70 hover:text-white hover:bg-white/5"
                                            }`}
                                        >
                                            <Shield className="w-5 h-5" />
                                            <span className="font-['Nunito',Helvetica] font-semibold text-sm">
                        Admin
                      </span>
                                        </Button>
                                    </Link>
                                )}
                            </nav>

                            {/* User Profile Section */}
                            <div className="px-5 pb-6 pt-4">
                                <Separator className="bg-white/10 mb-4" />

                                {user?.username && (
                                    <Link href={`/profile/${user.username}`} onClick={closeMobileMenu}>
                                        <div className="flex items-center gap-3 mb-3 p-2 rounded-lg hover:bg-white/5">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={user?.avatarUrl || undefined} />
                                                <AvatarFallback className="bg-white/20 text-white">
                                                    {user?.username?.slice(0, 2).toUpperCase() || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col flex-1">
                        <span className="font-['Nunito',Helvetica] font-semibold text-white text-sm truncate">
                          {user?.username || "User"}
                        </span>
                                                <span className="font-['Nunito',Helvetica] text-white/60 text-xs capitalize">
                          {user?.role || "viewer"}
                        </span>
                                            </div>
                                        </div>
                                    </Link>
                                )}

                                <Button
                                    variant="ghost"
                                    className="w-full min-h-10 justify-start gap-2 px-3 py-2 text-white/70 hover:text-white hover:bg-white/5"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="font-['Nunito',Helvetica] font-semibold text-sm">
                    Logout
                  </span>
                                </Button>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-56 h-screen bg-[#490057] flex-col fixed left-0 top-0">
                <header className="flex items-center gap-3 px-5 pt-8 pb-6">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                        <img
                            className="w-5 h-5"
                            alt="Memory of Place"
                            src="/figmaAssets/home.png"
                        />
                    </div>
                    <div className="flex flex-col">
          <span className="font-['Nunito',Helvetica] font-bold text-white text-sm leading-tight">
            Memory
          </span>
                        <span className="font-['Nunito',Helvetica] font-bold text-white text-sm leading-tight">
            of Place
          </span>
                    </div>
                </header>

                <Separator className="bg-white/10" />

                <nav className="flex flex-col gap-2.5 px-5 mt-6 flex-1">
                    {/* Notifications */}
                    <Link href="/notifications">
                        <Button
                            data-testid="nav-notifications"
                            variant="ghost"
                            className={`min-h-11 w-full justify-start gap-4 px-3 py-2.5 relative transition-colors duration-200 ${
                                location === "/notifications"
                                    ? "text-[#fbb03b] hover:text-[#fbb03b] hover:bg-transparent"
                                    : "text-white/70 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            {location === "/notifications" && (
                                <div className="absolute top-0 left-0 w-20 h-full rounded-[0px_5px_5px_0px] bg-[linear-gradient(90deg,rgba(251,176,59,1)_54%,rgba(255,255,255,0)_100%)] opacity-20" />
                            )}
                            <div className="relative z-10">
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <Badge
                                        variant="destructive"
                                        className="absolute -top-2 -right-2 h-4 min-w-4 flex items-center justify-center p-0 text-[10px]"
                                    >
                                        {unreadCount > 9 ? "9+" : unreadCount}
                                    </Badge>
                                )}
                            </div>
                            <span className="font-['Nunito',Helvetica] font-semibold text-sm leading-relaxed relative z-10">
              Notifications
            </span>
                        </Button>
                    </Link>

                    {/* Profile - with dynamic username */}
                    {user?.username && (
                        <Link href={`/profile/${user.username}`}>
                            <Button
                                data-testid="nav-profile"
                                variant="ghost"
                                className={`min-h-11 w-full justify-start gap-4 px-3 py-2.5 relative transition-colors duration-200 ${
                                    location === `/profile/${user.username}`
                                        ? "text-[#fbb03b] hover:text-[#fbb03b] hover:bg-transparent"
                                        : "text-white/70 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                {location === `/profile/${user.username}` && (
                                    <div className="absolute top-0 left-0 w-20 h-full rounded-[0px_5px_5px_0px] bg-[linear-gradient(90deg,rgba(251,176,59,1)_54%,rgba(255,255,255,0)_100%)] opacity-20" />
                                )}
                                <UserIcon className="w-5 h-5 relative z-10" />
                                <span className="font-['Nunito',Helvetica] font-semibold text-sm leading-relaxed relative z-10">
                Profile
              </span>
                            </Button>
                        </Link>
                    )}

                    {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location === item.path;

                        return (
                            <Link key={item.id} href={item.path}>
                                <Button
                                    data-testid={`nav-${item.id}`}
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
                  {item.label}
                </span>
                                </Button>
                            </Link>
                        );
                    })}

                    <Separator className="bg-white/10 my-2" />

                    {/* Admin Dashboard - only show for admins */}
                    {user?.role === "admin" && (
                        <Link href="/admin">
                            <Button
                                data-testid="nav-admin"
                                variant="ghost"
                                className={`min-h-11 w-full justify-start gap-4 px-3 py-2.5 relative transition-colors duration-200 ${
                                    location === "/admin"
                                        ? "text-[#fbb03b] hover:text-[#fbb03b] hover:bg-transparent"
                                        : "text-white/70 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                {location === "/admin" && (
                                    <div className="absolute top-0 left-0 w-20 h-full rounded-[0px_5px_5px_0px] bg-[linear-gradient(90deg,rgba(251,176,59,1)_54%,rgba(255,255,255,0)_100%)] opacity-20" />
                                )}
                                <Shield className="w-5 h-5 relative z-10" />
                                <span className="font-['Nunito',Helvetica] font-semibold text-sm leading-relaxed relative z-10">
                Admin
              </span>
                            </Button>
                        </Link>
                    )}
                </nav>

                {/* User Profile Section */}
                <div className="px-5 pb-6 pt-4">
                    <Separator className="bg-white/10 mb-4" />

                    {user?.username && (
                        <Link href={`/profile/${user.username}`}>
                            <div className="flex items-center gap-3 mb-3 p-2 rounded-lg hover:bg-white/5 transition-colors duration-200 cursor-pointer">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={user?.avatarUrl || undefined} />
                                    <AvatarFallback className="bg-white/20 text-white">
                                        {user?.username?.slice(0, 2).toUpperCase() || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col flex-1 overflow-hidden">
                <span className="font-['Nunito',Helvetica] font-semibold text-white text-sm truncate">
                  {user?.username || "User"}
                </span>
                                    <span className="font-['Nunito',Helvetica] text-white/60 text-xs capitalize">
                  {user?.role || "viewer"}
                </span>
                                </div>
                            </div>
                        </Link>
                    )}

                    <Button
                        data-testid="button-logout"
                        variant="ghost"
                        className="w-full min-h-10 justify-start gap-2 px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 transition-colors duration-200"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="font-['Nunito',Helvetica] font-semibold text-sm">
            Logout
          </span>
                    </Button>
                </div>
            </aside>
        </>
    );
};
