import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plus, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function ContentManagement() {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        mediaUrl: "",
        status: "published",
    });

    const { data: contents, isLoading } = useQuery({
        queryKey: ["/api/admin/contents"],
    });

    const createMutation = useMutation({
        mutationFn: async (data) => {
            await apiRequest("POST", "/api/admin/contents", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/contents"] });
            setIsDialogOpen(false);
            setFormData({ title: "", description: "", mediaUrl: "", status: "published" });
            toast({
                title: "Content created",
                description: "Content has been successfully created",
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (contentId) => {
            await apiRequest("DELETE", `/api/admin/contents/${contentId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/contents"] });
            toast({
                title: "Content deleted",
                description: "Content has been successfully deleted",
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

        if (!formData.description.trim()) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Description is required",
            });
            return;
        }

        createMutation.mutate(formData);
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <h1 className="text-3xl font-bold mb-6">Content Management</h1>
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
                <h1 className="text-3xl font-bold">Content Management</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button data-testid="button-create-content">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Content
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Content</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    data-testid="input-content-title"
                                />
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                    data-testid="input-content-description"
                                />
                            </div>
                            <div>
                                <Label htmlFor="mediaUrl">Media URL (optional)</Label>
                                <Input
                                    id="mediaUrl"
                                    value={formData.mediaUrl}
                                    onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                                    placeholder="https://example.com/image.jpg"
                                    data-testid="input-content-media"
                                />
                            </div>
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                                >
                                    <SelectTrigger id="status" data-testid="select-content-status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="published">Published</SelectItem>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-content">
                                    {createMutation.isPending ? "Creating..." : "Create Content"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Admin-Created Content ({contents?.length || 0})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {!contents || contents.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">No content yet</h3>
                            <p className="mb-4">Create featured content, announcements, or guides for users</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {contents.map((content) => (
                                <div
                                    key={content.id}
                                    className="flex items-start justify-between p-4 border rounded-md"
                                    data-testid={`content-item-${content.id}`}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-semibold">{content.title}</h3>
                                            <Badge
                                                variant={
                                                    content.status === "published"
                                                        ? "default"
                                                        : content.status === "draft"
                                                            ? "secondary"
                                                            : "outline"
                                                }
                                            >
                                                {content.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2">{content.description}</p>
                                        {content.mediaUrl && (
                                            <p className="text-xs text-muted-foreground">Media: {content.mediaUrl}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Created {format(new Date(content.createdAt), "MMM d, yyyy")}
                                        </p>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => deleteMutation.mutate(content.id)}
                                        disabled={deleteMutation.isPending}
                                        data-testid={`button-delete-content-${content.id}`}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
