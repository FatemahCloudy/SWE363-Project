import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, Users, Heart, MessageCircle, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function PublicProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch profile data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/users/profile", username],
    enabled: !!username,
  });

  // Fetch user's memories
  const { data: memories, isLoading: memoriesLoading } = useQuery({
    queryKey: [`/api/users/${profile?.id}/memories`],
    enabled: !!profile?.id,
  });

  // Check if following
  const { data: followStatus } = useQuery({
    queryKey: [`/api/follows/check/${profile?.id}`],
    enabled: !!profile?.id && !!currentUser,
  });

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.id) throw new Error("Profile not loaded");
      return await apiRequest("POST", "/api/follows", { followingId: profile.id });
    },
    onSuccess: () => {
      if (profile?.id) {
        queryClient.invalidateQueries({ queryKey: [`/api/follows/check/${profile.id}`] });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/users/profile", username] });
    },
  });

  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.id) throw new Error("Profile not loaded");
      return await apiRequest("DELETE", `/api/follows/${profile.id}`);
    },
    onSuccess: () => {
      if (profile?.id) {
        queryClient.invalidateQueries({ queryKey: [`/api/follows/check/${profile.id}`] });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/users/profile", username] });
    },
  });

  const handleFollowToggle = () => {
    if (followStatus?.isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  const handleSendMessage = () => {
    if (profile?.id) {
      // Navigate to messages page with this user's ID selected conversation
      setLocation(`/messages?user=${profile.id}`);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">User not found</h2>
          <p className="text-muted-foreground">The user you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      {/* Cover Image */}
      <div className="relative mb-20">
        <div
          className="h-64 rounded-lg bg-gradient-to-r from-primary/20 to-primary/10"
          style={{
            backgroundImage: profile.coverUrl ? `url(${profile.coverUrl})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        
        {/* Avatar positioned over cover */}
        <div className="absolute -bottom-16 left-8">
          <Avatar className="h-32 w-32 border-4 border-background">
            <AvatarImage src={profile.avatarUrl || undefined} />
            <AvatarFallback className="text-4xl">
              {profile.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Profile Info */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-1">{profile.fullName || profile.username}</h1>
            <p className="text-muted-foreground mb-3">@{profile.username}</p>
            
            {profile.bio && (
              <p className="text-foreground mb-4">{profile.bio}</p>
            )}
            
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-4">
              <div className="text-center">
                <div className="font-bold text-lg" data-testid="text-memory-count">{profile.memoryCount}</div>
                <div className="text-sm text-muted-foreground">Memories</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg" data-testid="text-follower-count">{profile.followerCount}</div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg" data-testid="text-following-count">{profile.followingCount}</div>
                <div className="text-sm text-muted-foreground">Following</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {currentUser && !isOwnProfile && (
            <div className="flex gap-2">
              <Button
                data-testid="button-send-message"
                onClick={handleSendMessage}
                variant="default"
              >
                <Send className="h-4 w-4 mr-2" />
                Message
              </Button>
              <Button
                data-testid={followStatus?.isFollowing ? "button-unfollow" : "button-follow"}
                onClick={handleFollowToggle}
                variant={followStatus?.isFollowing ? "outline" : "default"}
                disabled={followMutation.isPending || unfollowMutation.isPending}
              >
                {followMutation.isPending || unfollowMutation.isPending
                  ? "Loading..."
                  : followStatus?.isFollowing
                  ? "Unfollow"
                  : "Follow"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="memories" className="w-full">
        <TabsList>
          <TabsTrigger value="memories" data-testid="tab-memories">Memories</TabsTrigger>
          <TabsTrigger value="likes" data-testid="tab-likes">Likes</TabsTrigger>
        </TabsList>

        <TabsContent value="memories" className="mt-6">
          {memoriesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : memories && memories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {memories.map((memory) => (
                <Card key={memory.id} className="overflow-hidden hover-elevate" data-testid={`card-memory-${memory.id}`}>
                  {memory.imageUrl && (
                    <div
                      className="h-48 bg-muted bg-cover bg-center"
                      style={{ backgroundImage: `url(${memory.imageUrl})` }}
                    />
                  )}
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-1">{memory.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {memory.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {memory.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="line-clamp-1">{memory.location}</span>
                        </div>
                      )}
                      <span>{formatDistanceToNow(new Date(memory.createdAt), { addSuffix: true })}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No memories yet</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="likes" className="mt-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Liked memories will appear here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
