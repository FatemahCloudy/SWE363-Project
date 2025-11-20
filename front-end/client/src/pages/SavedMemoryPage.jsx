import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Heart, MessageCircle, Bookmark, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

function SavedMemoryCard({ data }) {
  const { memory, user: memoryUser } = data;
  
  if (!memory || !memoryUser) {
    return null;
  }
  
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const unsaveMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/saved-memories/${memory.id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-memories"] });
      queryClient.invalidateQueries({ queryKey: [`/api/saved-memories/check/${memory.id}`] });
      toast({
        title: "Memory unsaved",
        description: "Memory removed from your saved list",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to unsave memory",
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
    const colors = {
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

  return (
    <Card 
      className="overflow-hidden hover-elevate cursor-pointer" 
      onClick={handleCardClick}
      data-testid={`card-saved-memory-${memory.id}`}
    >
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
        <Avatar>
          <AvatarImage src={memoryUser.avatarUrl || undefined} />
          <AvatarFallback>{memoryUser.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold" data-testid={`text-author-${memory.id}`}>
              {memoryUser.username}
            </p>
            <Badge className={getCategoryBadgeColor(memory.category)} variant="secondary">
              {memory.category.replace(/_/g, " ")}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Saved {data.savedAt && formatDistanceToNow(new Date(data.savedAt), { addSuffix: true })}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-3">
        <div>
          <h3 className="text-xl font-semibold mb-2" data-testid={`text-title-${memory.id}`}>
            {memory.title}
          </h3>
          <p className="text-muted-foreground whitespace-pre-wrap line-clamp-3" data-testid={`text-description-${memory.id}`}>
            {memory.description}
          </p>
        </div>

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
          onClick={(e) => {
            e.stopPropagation();
            setLocation(`/memory/${memory.id}`);
          }}
          data-testid={`button-view-${memory.id}`}
        >
          <MessageCircle className="h-4 w-4" />
          View Details
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2" 
          onClick={(e) => {
            e.stopPropagation();
            unsaveMutation.mutate();
          }}
          disabled={unsaveMutation.isPending}
          data-testid={`button-unsave-${memory.id}`}
        >
          <Bookmark className="h-4 w-4 fill-current" />
          Unsave
        </Button>
      </CardFooter>
    </Card>
  );
}

export function SavedMemoryPage() {
  const { user, isLoading: authLoading } = useAuth();

  const { data: savedMemories = [], isLoading } = useQuery({
    queryKey: ["/api/saved-memories"],
    enabled: !!user && !authLoading,
  });

  if (isLoading || authLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-4xl">
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading saved memories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <Link href="/">
          <Button variant="ghost" className="gap-2" data-testid="button-back-home">
            <ArrowLeft className="h-4 w-4" />
            Back to Feed
          </Button>
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold">Saved Memories</h1>
      </div>

      {savedMemories.length === 0 ? (
        <Card>
          <CardContent className="text-center p-12">
            <Bookmark className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No saved memories yet</h3>
            <p className="text-muted-foreground mb-4">
              Bookmark memories you want to revisit later
            </p>
            <Link href="/">
              <Button data-testid="button-explore-memories">
                Explore Memories
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {savedMemories.map((data) => (
            <SavedMemoryCard key={data.memory?.id} data={data} />
          ))}
        </div>
      )}
    </div>
  );
}
