import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Plus, TrendingUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function InnovationManagement() {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        impact: "medium",
    });

    const { data: innovations, isLoading } = useQuery({
        queryKey: ["/api/admin/innovations"],
    });

    const createMutation = useMutation({
        mutationFn: async (data) => {
            await apiRequest("POST", "/api/admin/innovations", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/innovations"] });
            setIsDialogOpen(false);
            setFormData({ title: "", description: "", impact: "medium" });
            toast({
                title: "Idea submitted",
                description: "Innovation idea has been successfully submitted",
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, status }) => {
            await apiRequest("PUT", `/api/admin/innovations/${id}`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/innovations"] });
            toast({
                title: "Status updated",
                description: "Innovation status has been successfully updated",
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (innovationId) => {
            await apiRequest("DELETE", `/api/admin/innovations/${innovationId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/innovations"] });
            toast({
                title: "Idea deleted",
                description: "Innovation idea has been successfully deleted",
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

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case "approved": return "default";
            case "implemented": return "default";
            case "rejected": return "destructive";
            default: return "secondary";
        }
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <h1 className="text-3xl font-bold mb-6">Innovation Management</h1>
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

    const stats = {
        underReview: innovations?.filter(i => i.status === "under_review").length || 0,
        approved: innovations?.filter(i => i.status === "approved").length || 0,
        implemented: innovations?.filter(i => i.status === "implemented").length || 0,
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Innovation Management</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button data-testid="button-submit-idea">
                            <Plus className="h-4 w-4 mr-2" />
                            Submit Idea
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Submit Innovation Idea</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    data-testid="input-idea-title"
                                />
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                    data-testid="input-idea-description"
                                />
                            </div>
                            <div>
                                <Label htmlFor="impact">Expected Impact</Label>
                                <Select
                                    value={formData.impact}
                                    onValueChange={(value) => setFormData({ ...formData, impact: value })}
                                >
                                    <SelectTrigger id="impact" data-testid="select-impact">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-innovation">
                                    {createMutation.isPending ? "Submitting..." : "Submit Idea"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Innovation Pipeline
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <Badge variant="secondary" data-testid="badge-status-pending">
                            Under Review: {stats.underReview}
                        </Badge>
                        <Badge variant="default" data-testid="badge-status-approved">
                            Approved: {stats.approved}
                        </Badge>
                        <Badge variant="outline" data-testid="badge-status-implemented">
                            Implemented: {stats.implemented}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        Innovation Ideas ({innovations?.length || 0})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {!innovations || innovations.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Lightbulb className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">No ideas submitted yet</h3>
                            <p className="mb-4">Track and review platform improvement ideas from the team</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {innovations.map((idea) => (
                                <div
                                    key={idea.id}
                                    className="flex items-start justify-between p-4 border rounded-md"
                                    data-testid={`innovation-item-${idea.id}`}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-semibold">{idea.title}</h3>
                                            <Badge variant={getStatusBadgeVariant(idea.status)}>
                                                {idea.status.replace("_", " ")}
                                            </Badge>
                                            <Badge variant="outline">{idea.impact} impact</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2">{idea.description}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Submitted {format(new Date(idea.createdAt), "MMM d, yyyy")}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {idea.status === "under_review" && (
                                            <>
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={() => updateMutation.mutate({ id: idea.id, status: "approved" })}
                                                    disabled={updateMutation.isPending}
                                                    data-testid={`button-approve-idea-${idea.id}`}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => updateMutation.mutate({ id: idea.id, status: "rejected" })}
                                                    disabled={updateMutation.isPending}
                                                    data-testid={`button-reject-idea-${idea.id}`}
                                                >
                                                    Reject
                                                </Button>
                                            </>
                                        )}
                                        {idea.status === "approved" && (
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={() => updateMutation.mutate({ id: idea.id, status: "implemented" })}
                                                disabled={updateMutation.isPending}
                                                data-testid={`button-implement-idea-${idea.id}`}
                                            >
                                                Mark Implemented
                                            </Button>
                                        )}
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => deleteMutation.mutate(idea.id)}
                                            disabled={deleteMutation.isPending}
                                            data-testid={`button-delete-idea-${idea.id}`}
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
