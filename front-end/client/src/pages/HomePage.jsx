import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, MapPin, Heart, MessageCircle, Bookmark, Search, Share2, Filter } from "lucide-react";
import { AddMemoryModal } from "@/components/modals/AddMemoryModal";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

function MemoryCard({ memory }) {
    const { user } = useAuth();
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    const { data: reactions = [] } = useQuery({
        queryKey: [`/api/memories/${memory.id}/reactions`],
    });

    const { data: savedStatus } = useQuery({
        queryKey: [`/api/saved-memories/check/${memory.id}`],
        enabled: !!user,
    });

    const reactionCount = reactions.length;
    const userHasLiked = user ? reactions.some(r => r.userId === user.id) : false;
    const isSaved = savedStatus?.isSaved || false;

    const handleShare = async () => {
        const url = `${window.location.origin}/memory/${memory.id}`;
        try {
            await navigator.clipboard.writeText(url);
            toast({
                title: "Link copied!",
                description: "Memory link copied to clipboard",
            });
        } catch (error) {
            toast({
                title: "Failed to copy",
                description: "Could not copy link to clipboard",
                variant: "destructive",
            });
        }
    };

    const likeMutation = useMutation({
        mutationFn: async () => {
            if (userHasLiked) {
                await apiRequest("DELETE", `/api/memories/${memory.id}/like`);
            } else {
                await apiRequest("POST", `/api/memories/${memory.id}/like`, { type: "like" });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/memories/${memory.id}/reactions`] });
        },
    });

    const saveMutation = useMutation({
        mutationFn: async () => {
            if (isSaved) {
                await apiRequest("DELETE", `/api/saved-memories/${memory.id}`, undefined);
            } else {
                await apiRequest("POST", "/api/saved-memories", { memoryId: memory.id });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/saved-memories/check/${memory.id}`] });
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

    const handleCardClick = (e) => {
        if ((e.target).closest('button')) {
            return;
        }
        setLocation(`/memory/${memory.id}`);
    };

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

    // Log warning for debugging if user data is missing (but still render card with fallbacks)
    if (!memory.user) {
        console.warn(`Memory ${memory.id} missing user data - using fallbacks`);
    }

    return (
        <Card
            className="overflow-hidden hover-elevate cursor-pointer"
            onClick={handleCardClick}
            data-testid={`card-memory-${memory.id}`}
        >
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
                <Avatar>
                    <AvatarImage src={memory.user?.avatarUrl || undefined} />
                    <AvatarFallback>{memory.user?.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        {memory.user?.username ? (
                            <Link
                                href={`/user/${memory.user.username}`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <p className="font-semibold hover:underline" data-testid={`text-author-${memory.id}`}>
                                    {memory.user.username}
                                </p>
                            </Link>
                        ) : (
                            <p className="font-semibold text-muted-foreground" data-testid={`text-author-${memory.id}`}>
                                Unknown User
                            </p>
                        )}
                        <Badge className={getCategoryBadgeColor(memory.category)} variant="secondary">
                            {memory.category?.replace(/_/g, " ") || 'other'}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {memory.createdAt && formatDistanceToNow(new Date(memory.createdAt), { addSuffix: true })}
                    </p>
                </div>
            </CardHeader>

            <CardContent className="space-y-3 pb-3">
                {(memory.title || memory.description) && (
                    <div>
                        {memory.title && (
                            <h3 className="text-xl font-semibold mb-2" data-testid={`text-title-${memory.id}`}>
                                {memory.title}
                            </h3>
                        )}
                        {memory.description && (
                            <p className="text-muted-foreground whitespace-pre-wrap" data-testid={`text-description-${memory.id}`}>
                                {memory.description}
                            </p>
                        )}
                    </div>
                )}

                {memory.imageUrl && (
                    <img
                        src={memory.imageUrl}
                        alt={memory.title}
                        className="w-full rounded-md object-cover max-h-96"
                        data-testid={`img-memory-${memory.id}`}
                    />
                )}

                {memory.locationAddress && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span data-testid={`text-location-${memory.id}`}>{memory.locationAddress}</span>
                    </div>
                )}
            </CardContent>

            <CardFooter className="flex gap-2 border-t pt-3 flex-wrap">
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={() => likeMutation.mutate()}
                    disabled={likeMutation.isPending}
                    data-testid={`button-like-${memory.id}`}
                >
                    <Heart className={`h-4 w-4 ${userHasLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    {reactionCount > 0 ? `${reactionCount}` : 'Like'}
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/memory/${memory.id}`);
                    }}
                    data-testid={`button-comment-${memory.id}`}
                >
                    <MessageCircle className="h-4 w-4" />
                    Comment
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={() => saveMutation.mutate()}
                    disabled={!user || saveMutation.isPending}
                    data-testid={`button-save-${memory.id}`}
                >
                    <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                    {isSaved ? 'Saved' : 'Save'}
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleShare();
                    }}
                    data-testid={`button-share-${memory.id}`}
                >
                    <Share2 className="h-4 w-4" />
                    Share
                </Button>
            </CardFooter>
        </Card>
    );
}

const CATEGORIES = [
    { value: "all", label: "All" },
    { value: "travel", label: "Travel" },
    { value: "family", label: "Family" },
    { value: "friends", label: "Friends" },
    { value: "celebration", label: "Celebration" },
    { value: "achievement", label: "Achievement" },
    { value: "daily_life", label: "Daily Life" },
    { value: "special_event", label: "Special Event" },
    { value: "other", label: "Other" },
];

export default function HomePage() {
    const { isAuthenticated, user } = useAuth();
    const [addMemoryOpen, setAddMemoryOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [activeTab, setActiveTab] = useState("public");

    const { data: memories = [], isLoading } = useQuery({
        queryKey: ["/api/memories"],
        enabled: isAuthenticated,
    });

    const { data: followedUsers = [] } = useQuery({
        queryKey: ["/api/follows"],
        enabled: isAuthenticated,
    });

    const followedUserIds = followedUsers.map(f => f.followingId);

    const getFilteredMemories = () => {
        let filtered = memories;

        // Filter by tab
        if (activeTab === "my") {
            // Show all my memories regardless of privacy
            filtered = filtered.filter(m => m.userId === user?.id);
        } else if (activeTab === "friends") {
            // Show memories from users I follow (public and followers_only)
            filtered = filtered.filter(m =>
                followedUserIds.includes(m.userId) &&
                (m.privacy === "public" || m.privacy === "followers_only")
            );
        } else if (activeTab === "public") {
            // Show only public memories from all users
            filtered = filtered.filter(m => m.privacy === "public");
        }

        // Filter by search
        filtered = filtered.filter((memory) => {
            const matchesSearch = searchQuery === "" ||
                memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                memory.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (memory.locationAddress && memory.locationAddress.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesCategory = selectedCategory === "all" || memory.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });

        return filtered;
    };

    const filteredMemories = getFilteredMemories();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Loading memories...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-6 max-w-5xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:flex-1">
                    <TabsList className="grid w-full max-w-2xl grid-cols-3">
                        <TabsTrigger value="my" data-testid="tab-my-memories" className="text-xs sm:text-sm">My Memories</TabsTrigger>
                        <TabsTrigger value="friends" data-testid="tab-friend-memories" className="text-xs sm:text-sm">Friend Memories</TabsTrigger>
                        <TabsTrigger value="public" data-testid="tab-public-memories" className="text-xs sm:text-sm">Public Memories</TabsTrigger>
                    </TabsList>
                </Tabs>
                <Button
                    onClick={() => setAddMemoryOpen(true)}
                    className="gap-2 w-full md:w-auto"
                    data-testid="button-add-memory"
                >
                    <Plus className="h-4 w-4" />
                    Share Memory
                </Button>
            </div>

            {/* Search and Filter Section */}
            <div className="space-y-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search memories by title, description, or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        data-testid="input-search"
                    />
                </div>

                {/* Category Filters */}
                <div className="flex gap-2 flex-wrap items-center">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    {CATEGORIES.map((category) => (
                        <Badge
                            key={category.value}
                            variant={selectedCategory === category.value ? "default" : "outline"}
                            className="cursor-pointer hover-elevate"
                            onClick={() => setSelectedCategory(category.value)}
                            data-testid={`filter-${category.value}`}
                        >
                            {category.label}
                        </Badge>
                    ))}
                </div>
            </div>

            {filteredMemories.length === 0 ? (
                <Card className="text-center p-12">
                    <CardContent>
                        <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">
                            {memories.length === 0 ? "No memories yet" : "No memories found"}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            {memories.length === 0
                                ? "Be the first to share a memory!"
                                : "Try adjusting your search or filters"}
                        </p>
                        {memories.length === 0 && (
                            <Button onClick={() => setAddMemoryOpen(true)} data-testid="button-create-first-memory">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Your First Memory
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {filteredMemories.map((memory) => (
                        <MemoryCard key={memory.id} memory={memory} />
                    ))}
                </div>
            )}

            <AddMemoryModal open={addMemoryOpen} onOpenChange={setAddMemoryOpen} />
        </div>
    );
}
