import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Calendar, Users, Image as ImageIcon, UserPlus, UserMinus, Search, Share2, Heart, MessageCircle, Bookmark } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function CollaborativeMemoryCard({ group }) {
    const [, setLocation] = useLocation();

    const latestEntry = group.entries && group.entries.length > 0
        ? group.entries[0]
        : null;

    const contributorCount = group.collaborators?.length || group.contributorCount || 0;

    const displayImage = latestEntry?.imageUrl || group.coverImage || null;
    const displayTitle = group.title;
    const displayDescription = group.description || latestEntry?.description || '';
    const displayDate = latestEntry?.createdAt || group.createdAt;

    return (
        <Card
            className="overflow-hidden hover-elevate cursor-pointer"
            onClick={() => setLocation(`/shared-memories/${group._id || group.id}`)}
            data-testid={`card-memory-collab-${group._id || group.id}`}
        >
            {displayImage && (
                <div className="aspect-video relative overflow-hidden">
                    <img
                        src={displayImage}
                        alt={displayTitle}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold line-clamp-1">{displayTitle}</h3>
                    <Badge variant="secondary" className="gap-1">
                        <Users className="h-3 w-3" />
                        Shared
                    </Badge>
                </div>
                {displayDescription && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {displayDescription}
                    </p>
                )}
                <p className="text-xs text-muted-foreground">
                    {group.entries?.length || 0} memories from {contributorCount} contributor{contributorCount !== 1 ? 's' : ''}
                </p>
                {displayDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(displayDate))} ago
                    </p>
                )}
            </CardContent>
            <CardFooter className="p-4 pt-0 flex items-center gap-4">
                <Button variant="ghost" size="sm" className="gap-1">
                    <Users className="h-4 w-4" />
                    View
                </Button>
            </CardFooter>
        </Card>
    );
}


const CATEGORY_COLORS = {
    travel: "bg-blue-500",
    family: "bg-green-500",
    friends: "bg-yellow-500",
    celebration: "bg-purple-500",
    achievement: "bg-orange-500",
    daily_life: "bg-gray-500",
    special_event: "bg-pink-500",
    other: "bg-slate-500",
};

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

function MemoryCard({ memory }) {
    const { toast } = useToast();

    const handleShare = async (e) => {
        e.stopPropagation();
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

    return (
        <Card
            data-testid={`card-memory-${memory.id}`}
            className="overflow-hidden hover-elevate cursor-pointer"
            onClick={() => (window.location.href = `/memory/${memory.id}`)}
        >
            {memory.imageUrl && (
                <div className="aspect-video relative overflow-hidden">
                    <img
                        src={memory.imageUrl}
                        alt={memory.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold line-clamp-1">{memory.title}</h3>
                    <Badge
                        variant="secondary"
                        className={`${
                            CATEGORY_COLORS[memory.category] || CATEGORY_COLORS.other
                        } text-white`}
                    >
                        {(memory.category || 'other').replace("_", " ")}
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {memory.description}
                </p>
                {memory.location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="line-clamp-1">{memory.location}</span>
                    </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(memory.createdAt))} ago
                </p>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex items-center justify-between gap-2">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <Heart className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <MessageCircle className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <Bookmark className="h-4 w-4" />
                    </div>
                </div>
                <Button
                    data-testid={`button-share-${memory.id}`}
                    size="sm"
                    variant="ghost"
                    onClick={handleShare}
                >
                    <Share2 className="h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    );
}

function ProfilePage() {
    const params = useParams();
    const username = params.username;
    const [, setLocation] = useLocation();
    const { user, isAuthenticated } = useAuth();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");

    // Fetch profile data
    const { data: profile, isLoading: profileLoading, status: profileStatus } = useQuery({
        queryKey: ["/api/users/profile", username],
        enabled: !!username,
    });

    const isOwnProfile = user?.id === profile?.id;

    // Fetch user's memories
    const { data: memories = [], isLoading: memoriesLoading } = useQuery({
        queryKey: [`/api/users/${profile?.id}/memories`],
        enabled: !!profile?.id,
    });

    // Fetch collaborative groups for this user
    const { data: collaborativeGroups = { owned: [], contributing: [] } } = useQuery({
        queryKey: ["/api/collaborative/my-groups"],
        enabled: isAuthenticated && isOwnProfile,
    });

    // Check if current user is following this profile
    const { data: followStatus } = useQuery({
        queryKey: [`/api/follows/check/${profile?.id}`],
        enabled: isAuthenticated && !!profile?.id && profile.id !== user?.id,
    });

    // Follow mutation
    const followMutation = useMutation({
        mutationFn: async () => {
            await apiRequest("POST", "/api/follows", { followingId: profile?.id });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/follows/check/${profile?.id}`] });
            queryClient.invalidateQueries({ queryKey: ["/api/users/profile", username] });
            toast({
                title: "Success",
                description: `You are now following ${profile?.username}`,
            });
        },
        onError: (error) => {
            toast({
                title: "Failed to follow",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    // Unfollow mutation
    const unfollowMutation = useMutation({
        mutationFn: async () => {
            await apiRequest("DELETE", `/api/follows/${profile?.id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/follows/check/${profile?.id}`] });
            queryClient.invalidateQueries({ queryKey: ["/api/users/profile", username] });
            toast({
                title: "Success",
                description: `You unfollowed ${profile?.username}`,
            });
        },
        onError: (error) => {
            toast({
                title: "Failed to unfollow",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    // Filter memories based on search and category
    const filteredMemories = memories.filter((memory) => {
        const matchesSearch = searchQuery === "" ||
            (memory.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (memory.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (memory.location && memory.location.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCategory = selectedCategory === "all" || memory.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    // Get all items including collaborative memories
    const getAllItems = () => {
        const allGroups = isOwnProfile
            ? [...(collaborativeGroups.owned || []), ...(collaborativeGroups.contributing || [])]
            : [];

        const collabItems = allGroups
            .filter(group => {
                if (searchQuery === "") return true;
                const query = searchQuery.toLowerCase();
                return group.title?.toLowerCase().includes(query) ||
                    group.description?.toLowerCase().includes(query);
            })
            .map(group => ({
                type: 'collaborative',
                data: group,
                sortDate: group.entries?.[0]?.createdAt || group.createdAt
            }));

        const memoryItems = filteredMemories.map(m => ({
            type: 'memory',
            data: m,
            sortDate: m.createdAt
        }));

        return [...collabItems, ...memoryItems].sort((a, b) =>
            new Date(b.sortDate) - new Date(a.sortDate)
        );
    };

    const allItems = getAllItems();


    if (profileLoading) {
        return (
            <div className="container mx-auto p-6 max-w-6xl">
                <p className="text-muted-foreground">Loading profile...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="container mx-auto p-6 max-w-6xl">
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <h3 className="text-lg font-semibold">User not found</h3>
                        <p className="text-muted-foreground">
                            {username ? (
                                <>The user "@{username}" does not exist.</>
                            ) : (
                                <>No username provided in the URL.</>
                            )}
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-6 max-w-6xl">
            {/* Cover and Profile Header */}
            <Card className="overflow-hidden">
                {/* Cover Image */}
                <div
                    className="h-48 bg-gradient-to-r from-purple-500 to-orange-500"
                    style={
                        profile.coverUrl
                            ? { backgroundImage: `url(${profile.coverUrl})`, backgroundSize: "cover" }
                            : undefined
                    }
                />

                {/* Profile Info */}
                <CardContent className="relative pb-6">
                    <div className="flex flex-col md:flex-row gap-6 -mt-16">
                        {/* Avatar */}
                        <Avatar className="w-32 h-32 border-4 border-background">
                            <AvatarImage src={profile.avatarUrl} alt={profile.username} />
                            <AvatarFallback className="text-3xl">
                                {profile.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        {/* User Details */}
                        <div className="flex-1 pt-16 md:pt-0">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold">{profile.fullName || profile.username}</h1>
                                    <p className="text-muted-foreground">@{profile.username}</p>
                                    {profile.bio && <p className="mt-2 text-sm">{profile.bio}</p>}
                                </div>

                                {/* Action Buttons */}
                                {isOwnProfile ? (
                                    <Button data-testid="button-edit-profile" variant="outline">
                                        Edit Profile
                                    </Button>
                                ) : isAuthenticated && (
                                    <div className="flex gap-2 flex-wrap">
                                        <Button
                                            data-testid={followStatus?.isFollowing ? "button-unfollow" : "button-follow"}
                                            variant={followStatus?.isFollowing ? "outline" : "default"}
                                            onClick={() =>
                                                followStatus?.isFollowing
                                                    ? unfollowMutation.mutate()
                                                    : followMutation.mutate()
                                            }
                                            disabled={followMutation.isPending || unfollowMutation.isPending}
                                        >
                                            {followStatus?.isFollowing ? (
                                                <>
                                                    <UserMinus className="mr-2 h-4 w-4" />
                                                    Unfollow
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus className="mr-2 h-4 w-4" />
                                                    Follow
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            data-testid="button-message"
                                            variant="outline"
                                            onClick={() => setLocation(`/messages?user=${profile.id}`)}
                                        >
                                            <MessageCircle className="mr-2 h-4 w-4" />
                                            Message
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Stats and Meta */}
                            <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                                {profile.location && (
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        <span>{profile.location}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>Joined {formatDistanceToNow(new Date(profile.createdAt))} ago</span>
                                </div>
                            </div>

                            {/* Counts */}
                            <div className="flex gap-6 mt-4">
                                <div>
                                    <span className="font-bold text-lg">{profile.memoryCount}</span>
                                    <span className="text-muted-foreground ml-1">Memories</span>
                                </div>
                                <div>
                                    <span className="font-bold text-lg">{profile.followerCount}</span>
                                    <span className="text-muted-foreground ml-1">Followers</span>
                                </div>
                                <div>
                                    <span className="font-bold text-lg">{profile.followingCount}</span>
                                    <span className="text-muted-foreground ml-1">Following</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Memories Section */}
            <div className="mt-8">
                <CardHeader className="px-0">
                    <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Memories
                    </CardTitle>
                </CardHeader>

                {/* Search and Filter Bar */}
                <div className="mb-6 space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            data-testid="input-search-memories"
                            type="text"
                            placeholder="Search memories by title, description, or location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Category Filter Badges */}
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((category) => (
                            <Badge
                                key={category.value}
                                data-testid={`badge-category-${category.value}`}
                                variant={selectedCategory === category.value ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => setSelectedCategory(category.value)}
                            >
                                {category.label}
                            </Badge>
                        ))}
                    </div>
                </div>

                {memoriesLoading ? (
                    <p className="text-muted-foreground">Loading memories...</p>
                ) : allItems.length === 0 ? (
                    <Card>
                        <CardContent className="p-6 text-center text-muted-foreground">
                            {memories.length === 0 ? "No memories yet" : "No memories match your search"}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {allItems.map((item) => (
                            item.type === 'collaborative'
                                ? <CollaborativeMemoryCard key={`collab-${item.data._id || item.data.id}`} group={item.data} />
                                : <MemoryCard key={item.data.id} memory={item.data} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProfilePage;
