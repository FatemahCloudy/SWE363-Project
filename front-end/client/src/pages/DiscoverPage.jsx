import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, Calendar, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { format } from "date-fns";
// Discover Page - Search for memories and people


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

function DiscoverPage() {
    const [activeTab, setActiveTab] = useState("memories");

    // Memory search state - filters apply automatically
    const [memorySearchQuery, setMemorySearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [privacyFilter, setPrivacyFilter] = useState("");

    // People search state
    const [peopleSearchQuery, setPeopleSearchQuery] = useState("");

    // Build filters object for the query - memoized to prevent unnecessary re-renders
    const memoryFilters = useMemo(() => ({
        q: memorySearchQuery,
        category: categoryFilter === "all" ? "" : categoryFilter,
        privacy: privacyFilter === "all" ? "" : privacyFilter,
    }), [memorySearchQuery, categoryFilter, privacyFilter]);

    const { data: memoriesData, isLoading: memoriesLoading } = useQuery({
        queryKey: ["/api/memories/search", memoryFilters],
        enabled: activeTab === "memories",
    });

    // Ensure memories is always an array, never null
    const memories = Array.isArray(memoriesData) ? memoriesData : [];

    const { data: users = [], isLoading: usersLoading } = useQuery({
        queryKey: ["/api/users/search", { q: peopleSearchQuery }],
        enabled: activeTab === "people" && peopleSearchQuery.length > 0,
    });

    const handleMemoryReset = () => {
        setMemorySearchQuery("");
        setCategoryFilter("");
        setPrivacyFilter("");
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
                <div className="space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold">Discover</h1>
                    <p className="text-muted-foreground">
                        Search and explore memories and people
                    </p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="memories" data-testid="tab-memories">Memories</TabsTrigger>
                        <TabsTrigger value="people" data-testid="tab-people">People</TabsTrigger>
                    </TabsList>

                    <TabsContent value="memories" className="space-y-6">
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex-1 min-w-[200px]">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search memories..."
                                                value={memorySearchQuery}
                                                onChange={(e) => setMemorySearchQuery(e.target.value)}
                                                className="pl-9"
                                                data-testid="input-search"
                                            />
                                        </div>
                                    </div>

                                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                        <SelectTrigger className="w-[180px]" data-testid="select-category">
                                            <SelectValue placeholder="Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            <SelectItem value="travel">Travel</SelectItem>
                                            <SelectItem value="family">Family</SelectItem>
                                            <SelectItem value="friends">Friends</SelectItem>
                                            <SelectItem value="celebration">Celebration</SelectItem>
                                            <SelectItem value="achievement">Achievement</SelectItem>
                                            <SelectItem value="daily_life">Daily Life</SelectItem>
                                            <SelectItem value="special_event">Special Event</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select value={privacyFilter} onValueChange={setPrivacyFilter}>
                                        <SelectTrigger className="w-[180px]" data-testid="select-privacy">
                                            <SelectValue placeholder="Privacy" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Privacy</SelectItem>
                                            <SelectItem value="public">Public</SelectItem>
                                            <SelectItem value="friends">Friends Only</SelectItem>
                                            <SelectItem value="private">Private</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {(memorySearchQuery || categoryFilter || privacyFilter) && (
                                        <Button variant="outline" onClick={handleMemoryReset} data-testid="button-reset">
                                            Clear Filters
                                        </Button>
                                    )}
                                </div>

                                {(memoryFilters.q || memoryFilters.category || memoryFilters.privacy) && (
                                    <div className="flex flex-wrap gap-2 items-center">
                                        <span className="text-sm text-muted-foreground">Active filters:</span>
                                        {memoryFilters.q && (
                                            <Badge variant="secondary">Search: {memoryFilters.q}</Badge>
                                        )}
                                        {memoryFilters.category && (
                                            <Badge variant="secondary">Category: {memoryFilters.category}</Badge>
                                        )}
                                        {memoryFilters.privacy && (
                                            <Badge variant="secondary">Privacy: {memoryFilters.privacy}</Badge>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {memoriesLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <Card key={i} className="overflow-hidden">
                                        <div className="h-48 bg-muted animate-pulse" />
                                        <CardContent className="p-4 space-y-2">
                                            <div className="h-6 bg-muted animate-pulse rounded" />
                                            <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : memories.length === 0 ? (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                    <h3 className="text-lg font-semibold mb-2">No memories found</h3>
                                    <p className="text-muted-foreground">
                                        Try adjusting your search criteria or filters
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        Found {memories.length} {memories.length === 1 ? "memory" : "memories"}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {memories.map((memory) => (
                                        <Link key={memory.id} href={`/memory/${memory.id}`}>
                                            <Card className="overflow-hidden hover-elevate cursor-pointer h-full" data-testid={`card-memory-${memory.id}`}>
                                                {memory.imageUrl && (
                                                    <div className="relative h-48 overflow-hidden bg-muted">
                                                        <img
                                                            src={memory.imageUrl}
                                                            alt={memory.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <Badge
                                                            className={`absolute top-3 right-3 ${
                                                                CATEGORY_COLORS[memory.category] || CATEGORY_COLORS.other
                                                            } text-white`}
                                                        >
                                                            {memory.category}
                                                        </Badge>
                                                    </div>
                                                )}
                                                <CardContent className="p-4 space-y-3">
                                                    <div>
                                                        <h3 className="font-semibold text-lg line-clamp-1">
                                                            {memory.title}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                                            {memory.description}
                                                        </p>
                                                    </div>

                                                    {memory.location && (
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <MapPin className="h-4 w-4" />
                                                            <span className="line-clamp-1">{memory.location}</span>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between pt-2 border-t">
                                                        <Link href={`/profile/${memory.user.username}`}>
                                                            <div className="flex items-center gap-2 hover-elevate rounded-md p-1 -m-1">
                                                                <Avatar className="h-6 w-6">
                                                                    <AvatarImage src={memory.user.avatarUrl} />
                                                                    <AvatarFallback>
                                                                        <User className="h-3 w-3" />
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <span className="text-sm font-medium">
                              {memory.user.username}
                            </span>
                                                            </div>
                                                        </Link>
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>{format(new Date(memory.createdAt), "MMM d")}</span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            </>
                        )}
                    </TabsContent>

                    <TabsContent value="people" className="space-y-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Search by name or username..."
                                        value={peopleSearchQuery}
                                        onChange={(e) => setPeopleSearchQuery(e.target.value)}
                                        className="pl-10"
                                        data-testid="input-user-search"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {usersLoading && (
                            <div className="text-center py-12 text-muted-foreground">
                                Searching for users...
                            </div>
                        )}

                        {!usersLoading && peopleSearchQuery && Array.isArray(users) && users.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                No users found matching "{peopleSearchQuery}"
                            </div>
                        )}

                        {!peopleSearchQuery && (
                            <div className="text-center py-12 text-muted-foreground">
                                Start typing to search for users
                            </div>
                        )}

                        {Array.isArray(users) && users.length > 0 && (
                            <div className="grid gap-4">
                                {users.map((user) => (
                                    <Link key={user.id} href={`/user/${user.username}`}>
                                        <Card className="hover-elevate cursor-pointer" data-testid={`card-user-${user.id}`}>
                                            <CardContent className="p-4">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-16 w-16">
                                                        <AvatarImage src={user.avatarUrl || undefined} alt={user.fullName || user.username} />
                                                        <AvatarFallback>{getInitials(user.fullName || user.username)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-semibold text-lg" data-testid={`text-username-${user.id}`}>
                                                            {user.fullName || user.username}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            @{user.username}
                                                        </div>
                                                        {user.bio && (
                                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                                {user.bio}
                                                            </p>
                                                        )}
                                                        {user.location && (
                                                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                                <MapPin className="h-3 w-3" />
                                                                {user.location}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

export default DiscoverPage;
