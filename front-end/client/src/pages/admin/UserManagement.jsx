import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function UserManagement() {
    const { toast } = useToast();
    const { data: users, isLoading } = useQuery({
        queryKey: ["/api/admin/users"],
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (userId) => {
            await apiRequest("DELETE", `/api/admin/users/${userId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
            toast({
                title: "User deleted",
                description: "User has been successfully deleted",
            });
        },
        onError: (error) => {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to delete user",
            });
        },
    });

    if (isLoading) {
        return (
            <div className="p-6">
                <h1 className="text-3xl font-bold mb-6">User Management</h1>
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">User Management</h1>
            <Card>
                <CardHeader>
                    <CardTitle>All Users ({users?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {users?.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between p-4 border rounded-md"
                                data-testid={`user-item-${user.id}`}
                            >
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={user.avatarUrl || undefined} />
                                        <AvatarFallback>
                                            {user.fullName?.charAt(0) || user.username.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold" data-testid={`text-username-${user.id}`}>
                                                {user.username}
                                            </p>
                                            {user.role === "admin" && (
                                                <Badge variant="default" className="bg-[#a303a0]">
                                                    <Shield className="w-3 h-3 mr-1" />
                                                    Admin
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {user.email}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Joined {format(new Date(user.createdAt), "MMM d, yyyy")}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {user.role !== "admin" && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    data-testid={`button-delete-user-${user.id}`}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete User</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to delete user "{user.username}"?
                                                        This action cannot be undone and will remove all their
                                                        memories, comments, and other content.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel data-testid="button-cancel-delete">
                                                        Cancel
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => deleteUserMutation.mutate(user.id)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        data-testid="button-confirm-delete"
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
