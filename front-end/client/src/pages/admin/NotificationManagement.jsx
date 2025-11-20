import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Plus, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function NotificationManagement() {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        message: "",
        audience: "all_users",
        channel: "in_app",
    });

    const { data: notifications, isLoading } = useQuery({
        queryKey: ["/api/admin/notifications"],
    });

    const createMutation = useMutation({
        mutationFn: async (data) => {
            await apiRequest("POST", "/api/admin/notifications", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
            setIsDialogOpen(false);
            setFormData({ title: "", message: "", audience: "all_users", channel: "in_app" });
            toast({
                title: "Notification created",
                description: "Notification has been successfully created",
            });
        },
    });

    const sendMutation = useMutation({
        mutationFn: async (notificationId) => {
            await apiRequest("POST", `/api/admin/notifications/${notificationId}/send`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
            toast({
                title: "Notification sent",
                description: "Notification has been successfully sent",
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (notificationId) => {
            await apiRequest("DELETE", `/api/admin/notifications/${notificationId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
            toast({
                title: "Notification deleted",
                description: "Notification has been successfully deleted",
            });
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.title.trim()) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Title is required",
            });
            return;
        }

        if (!formData.message.trim()) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Message is required",
            });
            return;
        }

        createMutation.mutate(formData);
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <h1 className="text-3xl font-bold mb-6">Notification Management</h1>
                <Card>
                    <CardContent className="pt-6">
                        <div className="animate-pulse space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-20 bg-muted rounded" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Notification Management</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button data-testid="button-create-notification">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Notification
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Notification</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    data-testid="input-notification-title"
                                />
                            </div>
                            <div>
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                    id="message"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    required
                                    data-testid="input-notification-message"
                                />
                            </div>
                            <div>
                                <Label htmlFor="audience">Audience</Label>
                                <Select
                                    value={formData.audience}
                                    onValueChange={(value) => setFormData({ ...formData, audience: value })}
                                >
                                    <SelectTrigger id="audience" data-testid="select-audience">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all_users">All Users</SelectItem>
                                        <SelectItem value="creators">Creators Only</SelectItem>
                                        <SelectItem value="admins">Admins Only</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="channel">Channel</Label>
                                <Select
                                    value={formData.channel}
                                    onValueChange={(value) => setFormData({ ...formData, channel: value })}
                                >
                                    <SelectTrigger id="channel" data-testid="select-channel">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="in_app">In-App Only</SelectItem>
                                        <SelectItem value="email">Email Only</SelectItem>
                                        <SelectItem value="both">Both</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-notification">
                                    {createMutation.isPending ? "Creating..." : "Create Notification"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        System Notifications ({notifications?.length || 0})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {!notifications || notifications.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Send className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">No notifications sent</h3>
                            <p className="mb-4">Send announcements, updates, or alerts to users</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className="flex items-start justify-between p-4 border rounded-md"
                                    data-testid={`notification-item-${notification.id}`}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-semibold">{notification.title}</h3>
                                            <Badge variant={notification.sent ? "default" : "secondary"}>
                                                {notification.sent ? "Sent" : "Draft"}
                                            </Badge>
                                            <Badge variant="outline">{notification.audience}</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Created {format(new Date(notification.createdAt), "MMM d, yyyy")}
                                            {notification.sent && notification.sentAt && (
                                                <> • Sent {format(new Date(notification.sentAt), "MMM d, yyyy")}</>
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!notification.sent && (
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={() => sendMutation.mutate(notification.id)}
                                                disabled={sendMutation.isPending}
                                                data-testid={`button-send-notification-${notification.id}`}
                                            >
                                                <Send className="h-4 w-4 mr-2" />
                                                Send
                                            </Button>
                                        )}
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => deleteMutation.mutate(notification.id)}
                                            disabled={deleteMutation.isPending}
                                            data-testid={`button-delete-notification-${notification.id}`}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
