import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Image, Heart, MessageSquare, Flag } from "lucide-react";

export default function AdminDashboard() {
    const { data: stats, isLoading } = useQuery({ queryKey: ["/api/admin/stats"] });

    if (isLoading) {
        return (
            <div className="p-6">
                <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(5)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <div className="h-4 bg-muted animate-pulse rounded" />
                            </CardHeader>
                            <CardContent>
                                <div className="h-8 bg-muted animate-pulse rounded" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    const statCards = [
        {
            title: "Total Users",
            value: stats?.totalUsers || 0,
            icon: Users,
            color: "text-blue-500",
        },
        {
            title: "Total Memories",
            value: stats?.totalMemories || 0,
            icon: Image,
            color: "text-purple-500",
        },
        {
            title: "Total Likes",
            value: stats?.totalLikes || 0,
            icon: Heart,
            color: "text-pink-500",
        },
        {
            title: "Total Comments",
            value: stats?.totalComments || 0,
            icon: MessageSquare,
            color: "text-green-500",
        },
        {
            title: "Pending Reports",
            value: stats?.pendingReports || 0,
            icon: Flag,
            color: "text-red-500",
        },
    ];

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((stat) => (
                    <Card key={stat.title} data-testid={`card-stat-${stat.title.toLowerCase().replace(/\s/g, '-')}`}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold" data-testid={`text-${stat.title.toLowerCase().replace(/\s/g, '-')}`}>
                                {stat.value.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
