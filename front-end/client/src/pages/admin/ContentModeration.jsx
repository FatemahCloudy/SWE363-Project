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
import { Trash2, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Link } from "wouter";


export default function ContentModeration() {
    const { toast } = useToast();
    const { data: reports, isLoading } = useQuery({
        queryKey: ["/api/admin/reports"],
    });

    const reviewReportMutation = useMutation({
        mutationFn: async ({ reportId, action }) => {
            await apiRequest("POST", `/api/admin/reports/${reportId}/review`, { action });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/reports"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
            toast({
                title: "Report reviewed",
                description: "Report has been processed successfully",
            });
        },
        onError: (error) => {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to review report",
            });
        },
    });

    if (isLoading) {
        return (
            <div className="p-6">
                <h1 className="text-3xl font-bold mb-6">Content Moderation</h1>
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-32 bg-muted animate-pulse rounded" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const pendingReports = reports?.filter((r) => r.status === "pending") || [];

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Content Moderation</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Flagged Content ({pendingReports.length} pending)</CardTitle>
                </CardHeader>
                <CardContent>
                    {pendingReports.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No pending reports
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {pendingReports.map((report) => (
                                <div
                                    key={report.id}
                                    className="border rounded-md p-4 space-y-4"
                                    data-testid={`report-item-${report.id}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-4 flex-1">
                                            {report.memory.imageUrl && (
                                                <img
                                                    src={report.memory.imageUrl}
                                                    alt={report.memory.title}
                                                    className="w-24 h-24 object-cover rounded-md"
                                                    data-testid={`img-memory-${report.memory.id}`}
                                                />
                                            )}
                                            <div className="flex-1">
                                                <Link href={`/memory/${report.memory.id}`}>
                                                    <h3 className="font-semibold hover:text-[#a303a0] cursor-pointer">
                                                        {report.memory.title}
                                                    </h3>
                                                </Link>
                                                <p className="text-sm text-muted-foreground">
                                                    By @{report.memory.user.username}
                                                </p>
                                                <div className="mt-2 p-3 bg-muted rounded-md">
                                                    <p className="text-sm font-medium mb-1">Reported Reason:</p>
                                                    <p className="text-sm" data-testid={`text-reason-${report.id}`}>
                                                        {report.reason}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                                    <Avatar className="w-5 h-5">
                                                        <AvatarImage src={report.reporter.avatarUrl || undefined} />
                                                        <AvatarFallback>
                                                            {report.reporter.username.charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span>Reported by @{report.reporter.username}</span>
                                                    <span>•</span>
                                                    <span>{format(new Date(report.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                reviewReportMutation.mutate({
                                                    reportId: report.id,
                                                    action: "dismiss",
                                                })
                                            }
                                            disabled={reviewReportMutation.isPending}
                                            data-testid={`button-dismiss-${report.id}`}
                                        >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Dismiss Report
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    data-testid={`button-delete-memory-${report.id}`}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete Memory
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Reported Memory</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to delete this memory? This action
                                                        cannot be undone and will permanently remove the memory
                                                        from the platform.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel data-testid="button-cancel-delete">
                                                        Cancel
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() =>
                                                            reviewReportMutation.mutate({
                                                                reportId: report.id,
                                                                action: "delete",
                                                            })
                                                        }
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        data-testid="button-confirm-delete"
                                                    >
                                                        Delete Memory
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
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
