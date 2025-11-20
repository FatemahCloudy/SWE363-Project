import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Heart, MessageCircle, Bookmark, ArrowLeft, MoreVertical, Pencil, Trash2, Flag } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EditMemoryModal } from "@/components/modals/EditMemoryModal";
import { MapView } from "@/components/MapView";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function MemoryDetailPage() {
    const [, params] = useRoute("/memory/:id");
    const memoryId = params?.id;
    const { user } = useAuth();
    const { toast } = useToast();
    const [, setLocation] = useLocation();
    const [commentText, setCommentText] = useState("");
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showReportDialog, setShowReportDialog] = useState(false);
    const [reportReason, setReportReason] = useState("");

    const { data: memory, isLoading } = useQuery({
        queryKey: [`/api/memories/${memoryId}`],
        enabled: !!memoryId,
    });

    const { data: reactions = [] } = useQuery({
        queryKey: [`/api/memories/${memoryId}/reactions`],
        enabled: !!memoryId,
    });

    const { data: comments = [] } = useQuery({
        queryKey: [`/api/memories/${memoryId}/comments`],
        enabled: !!memoryId,
    });

    const { data: savedStatus } = useQuery({
        queryKey: [`/api/saved-memories/check/${memoryId}`],
        enabled: !!memoryId && !!user,
    });

    const reactionCount = reactions.length;
    const userHasLiked = user ? reactions.some(r => r.userId === user.id) : false;
    const isSaved = savedStatus?.isSaved || false;

    const likeMutation = useMutation({
        mutationFn: async () => {
            if (userHasLiked) {
                await apiRequest("DELETE", `/api/memories/${memoryId}/like`);
            } else {
                await apiRequest("POST", `/api/memories/${memoryId}/like`, { type: "like" });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/memories/${memoryId}/reactions`] });
        },
    });

    const commentMutation = useMutation({
        mutationFn: async (content) => {
            await apiRequest("POST", `/api/memories/${memoryId}/comments`, { content });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/memories/${memoryId}/comments`] });
            setCommentText("");
        },
    });

    const saveMutation = useMutation({
        mutationFn: async () => {
            if (isSaved) {
                await apiRequest("DELETE", `/api/saved-memories/${memoryId}`, undefined);
            } else {
                await apiRequest("POST", "/api/saved-memories", { memoryId });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/saved-memories/check/${memoryId}`] });
            queryClient.invalidateQueries({ queryKey: ["/api/saved-memories"] });
            toast({
                title: isSaved ? "Memory unsaved" : "Memory saved",
                description: isSaved ? "Memory removed from your saved list" : "Memory added to your saved list",
            });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to save memory",
                variant: "destructive",
            });
        },
    });

    const handleSubmitComment = (e) => {
        e.preventDefault();
        if (commentText.trim()) {
            commentMutation.mutate(commentText);
        }
    };

    const deleteMemoryMutation = useMutation({
        mutationFn: async () => {
            await apiRequest("DELETE", `/api/memories/${memoryId}`, undefined);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/memories"] });
            toast({
                title: "Memory deleted",
                description: "Your memory has been removed successfully.",
            });
            setLocation("/");
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to delete memory",
                variant: "destructive",
            });
        },
    });

    const reportMutation = useMutation({
        mutationFn: async (reason) => {
            await apiRequest("POST", "/api/reports", {
                memoryId,
                reason,
            });
        },
        onSuccess: () => {
            setShowReportDialog(false);
            setReportReason("");
            toast({
                title: "Report submitted",
                description: "Thank you for reporting this content. Our team will review it shortly.",
            });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to submit report",
                variant: "destructive",
            });
        },
    });

    const handleReportSubmit = () => {
        if (reportReason.trim()) {
            reportMutation.mutate(reportReason);
        }
    };

    const isOwner = user && memory && user.id === memory.userId;

    const getCategoryBadgeColor = (category) => {
        const colors= {
            travel: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
            family: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
            friends: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
            celebration: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
            achievement: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
            daily_life: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
            special_event: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
            other: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300",
        };
        return colors[category] || colors.other;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Loading memory...</p>
            </div>
        );
    }

    if (!memory) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <p className="text-muted-foreground">Memory not found</p>
                <Link href="/">
                    <Button variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Feed
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-6 max-w-4xl">
            <Link href="/">
                <Button variant="ghost" className="mb-4 gap-2" data-testid="button-back">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Feed
                </Button>
            </Link>

            <Card className="overflow-hidden mb-6" data-testid="card-memory-detail">
                <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
                    <Avatar>
                        <AvatarImage src={memory.user.avatarUrl || undefined} />
                        <AvatarFallback>{memory.user.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold" data-testid="text-author">
                                {memory.user.username}
                            </p>
                            <Badge className={getCategoryBadgeColor(memory.category)} variant="secondary">
                                {memory.category.replace(/_/g, " ")}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {memory.createdAt && formatDistanceToNow(new Date(memory.createdAt), { addSuffix: true })}
                        </p>
                    </div>
                    {isOwner ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" data-testid="button-memory-options">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setShowEditModal(true)} data-testid="button-edit-memory">
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setShowDeleteDialog(true)}
                                    className="text-destructive"
                                    data-testid="button-delete-memory"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowReportDialog(true)}
                            data-testid="button-report-memory"
                        >
                            <Flag className="h-4 w-4 mr-2" />
                            Report
                        </Button>
                    )}
                </CardHeader>

                <CardContent className="space-y-3 pb-3">
                    <div>
                        <h1 className="text-2xl font-bold mb-2" data-testid="text-title">
                            {memory.title}
                        </h1>
                        <p className="text-muted-foreground whitespace-pre-wrap" data-testid="text-description">
                            {memory.description}
                        </p>
                    </div>

                    {memory.imageUrl && (
                        <img
                            src={memory.imageUrl}
                            alt={memory.title}
                            className="w-full rounded-md object-cover"
                            data-testid="img-memory"
                        />
                    )}

                    {memory.locationAddress && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                            <MapPin className="h-4 w-4" />
                            <span data-testid="text-location">{memory.locationAddress}</span>
                        </div>
                    )}

                    {/* Map View */}
                    {memory.latitude !== null && memory.latitude !== undefined &&
                        memory.longitude !== null && memory.longitude !== undefined && (() => {
                            const lat = parseFloat(memory.latitude);
                            const lng = parseFloat(memory.longitude);
                            // Only render map if coordinates are valid (including 0)
                            if (!isNaN(lat) && !isNaN(lng)) {
                                return (
                                    <div className="mt-4">
                                        <h3 className="text-sm font-semibold mb-2">Location</h3>
                                        <div className="h-64 rounded-md overflow-hidden border">
                                            <MapView
                                                latitude={lat}
                                                longitude={lng}
                                                markerLabel={memory.title}
                                                zoom={14}
                                            />
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })()}
                </CardContent>

                <CardFooter className="flex gap-2 border-t pt-3 flex-wrap">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() => likeMutation.mutate()}
                        disabled={likeMutation.isPending}
                        data-testid="button-like"
                    >
                        <Heart className={`h-4 w-4 ${userHasLiked ? 'fill-red-500 text-red-500' : ''}`} />
                        {reactionCount > 0 ? `${reactionCount}` : 'Like'}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2" data-testid="button-comment">
                        <MessageCircle className="h-4 w-4" />
                        {comments.length > 0 ? `${comments.length}` : 'Comment'}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() => saveMutation.mutate()}
                        disabled={!user || saveMutation.isPending}
                        data-testid="button-save"
                    >
                        <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                        {isSaved ? 'Saved' : 'Save'}
                    </Button>
                </CardFooter>
            </Card>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Comments ({comments.length})</h2>

                {user && (
                    <Card>
                        <CardContent className="pt-4">
                            <form onSubmit={handleSubmitComment} className="space-y-3">
                                <Textarea
                                    placeholder="Write a comment..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    rows={3}
                                    data-testid="input-comment"
                                />
                                <Button
                                    type="submit"
                                    disabled={!commentText.trim() || commentMutation.isPending}
                                    data-testid="button-submit-comment"
                                >
                                    {commentMutation.isPending ? "Posting..." : "Post Comment"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <div className="space-y-3">
                    {comments.length === 0 ? (
                        <Card>
                            <CardContent className="text-center p-8">
                                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
                            </CardContent>
                        </Card>
                    ) : (
                        comments.map((comment) => (
                            <Card key={comment.id} data-testid={`card-comment-${comment.id}`}>
                                <CardContent className="pt-4">
                                    <div className="flex gap-3">
                                        <Avatar>
                                            <AvatarImage src={comment.user.avatarUrl || undefined} />
                                            <AvatarFallback>
                                                {comment.user.username[0].toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-sm" data-testid={`text-comment-author-${comment.id}`}>
                                                    {comment.user.username}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {comment.createdAt && formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                                </p>
                                            </div>
                                            <p className="text-sm" data-testid={`text-comment-content-${comment.id}`}>
                                                {comment.content}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {memory && (
                <>
                    <EditMemoryModal
                        open={showEditModal}
                        onOpenChange={setShowEditModal}
                        memory={memory}
                    />

                    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Memory?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your memory and remove it from our servers.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => deleteMemoryMutation.mutate()}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    data-testid="button-confirm-delete"
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Report Memory</DialogTitle>
                                <DialogDescription>
                                    Please provide a detailed reason for reporting this content. Our moderation team will review your report.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="report-reason">Reason for reporting</Label>
                                    <Textarea
                                        id="report-reason"
                                        placeholder="Please describe why you are reporting this memory (minimum 10 characters)..."
                                        value={reportReason}
                                        onChange={(e) => setReportReason(e.target.value)}
                                        rows={4}
                                        className="mt-2"
                                        data-testid="textarea-report-reason"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowReportDialog(false);
                                        setReportReason("");
                                    }}
                                    data-testid="button-cancel-report"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleReportSubmit}
                                    disabled={reportReason.trim().length < 10 || reportMutation.isPending}
                                    data-testid="button-submit-report"
                                >
                                    {reportMutation.isPending ? "Submitting..." : "Submit Report"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </>
            )}
        </div>
    );
}
