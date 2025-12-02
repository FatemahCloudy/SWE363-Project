import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { 
  Users, 
  Calendar, 
  MapPin, 
  Clock, 
  Check, 
  X, 
  ChevronRight,
  ImageIcon,
  Loader2,
  Inbox
} from "lucide-react";
import { format } from "date-fns";

function SharedGroupCard({ group, type }) {
  const [, setLocation] = useLocation();
  
  const handleClick = () => {
    setLocation(`/shared-memories/${group._id}`);
  };

  return (
    <Card 
      className="hover-elevate cursor-pointer transition-all" 
      onClick={handleClick}
      data-testid={`shared-group-card-${group._id}`}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {group.coverImageUrl || group.hostMemoryId?.imageUrl ? (
            <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
              <img 
                src={group.coverImageUrl || group.hostMemoryId?.imageUrl} 
                alt={group.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold truncate">{group.title}</h3>
              <Badge variant="secondary" className="flex-shrink-0">
                {group.entryCount || 1} {group.entryCount === 1 ? 'memory' : 'memories'}
              </Badge>
            </div>
            
            {group.eventName && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Calendar className="h-3 w-3" />
                {group.eventName}
              </p>
            )}
            
            {group.location && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {group.location}
              </p>
            )}
            
            <div className="flex items-center gap-2 mt-2">
              <div className="flex -space-x-2">
                {group.contributors?.slice(0, 3).map((contributor, idx) => (
                  <Avatar key={contributor._id || idx} className="h-6 w-6 border-2 border-background">
                    <AvatarImage src={contributor.avatarUrl} />
                    <AvatarFallback className="text-xs">
                      {contributor.fullName?.charAt(0) || contributor.username?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              {group.contributorCount > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{group.contributorCount - 3} more
                </span>
              )}
            </div>
            
            {type === 'contributing' && group.owner && (
              <p className="text-xs text-muted-foreground mt-2">
                Created by @{group.owner.username}
              </p>
            )}
          </div>
          
          <ChevronRight className="h-5 w-5 text-muted-foreground self-center" />
        </div>
      </CardContent>
    </Card>
  );
}

function InvitationCard({ invitation }) {
  const { toast } = useToast();
  const [isResponding, setIsResponding] = useState(false);
  
  const respondMutation = useMutation({
    mutationFn: async ({ groupId, response }) => {
      const res = await apiRequest("POST", `/api/collaborative/groups/${groupId}/respond`, { response });
      return await res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/collaborative/my-groups'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: variables.response === 'accept' ? 'Invitation accepted!' : 'Invitation declined',
        description: variables.response === 'accept' 
          ? 'You can now add your memory to this shared album.'
          : 'The invitation has been declined.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to respond to invitation',
        variant: 'destructive',
      });
    },
  });

  const handleRespond = async (response) => {
    setIsResponding(true);
    try {
      await respondMutation.mutateAsync({ groupId: invitation._id, response });
    } finally {
      setIsResponding(false);
    }
  };

  return (
    <Card className="border-primary/20" data-testid={`invitation-card-${invitation._id}`}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {invitation.coverImageUrl || invitation.hostMemoryId?.imageUrl ? (
            <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
              <img 
                src={invitation.coverImageUrl || invitation.hostMemoryId?.imageUrl} 
                alt={invitation.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{invitation.title}</h3>
            
            <div className="flex items-center gap-2 mt-1">
              <Avatar className="h-5 w-5">
                <AvatarImage src={invitation.ownerId?.avatarUrl} />
                <AvatarFallback className="text-xs">
                  {invitation.ownerId?.fullName?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                {invitation.ownerId?.fullName || invitation.ownerId?.username} invited you
              </span>
            </div>
            
            {invitation.eventName && (
              <p className="text-xs text-muted-foreground mt-1">
                {invitation.eventName}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button 
            size="sm" 
            onClick={() => handleRespond('accept')}
            disabled={isResponding}
            className="flex-1"
            data-testid="button-accept-invite"
          >
            {isResponding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Check className="h-4 w-4 mr-1" />
                Accept
              </>
            )}
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleRespond('decline')}
            disabled={isResponding}
            className="flex-1"
            data-testid="button-decline-invite"
          >
            <X className="h-4 w-4 mr-1" />
            Decline
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ type }) {
  const messages = {
    owned: {
      title: "No shared albums yet",
      description: "Create a memory and invite friends to start a shared album",
    },
    contributing: {
      title: "No contributions yet",
      description: "When friends invite you and you accept, your albums will appear here",
    },
    invitations: {
      title: "No pending invitations",
      description: "When friends invite you to collaborate, invitations will appear here",
    },
  };

  const { title, description } = messages[type] || messages.owned;

  return (
    <div className="text-center py-12">
      <Inbox className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
      <h3 className="mt-4 font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  );
}

export default function SharedMemoriesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/collaborative/my-groups'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load shared memories</p>
      </div>
    );
  }

  const { owned = [], contributing = [], invitations = [] } = data || {};

  return (
    <div className="container max-w-4xl py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Shared Memories</h1>
          <p className="text-muted-foreground">Collaborative albums with friends</p>
        </div>
        {invitations.length > 0 && (
          <Badge variant="default">
            {invitations.length} pending invite{invitations.length > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      <Tabs defaultValue={invitations.length > 0 ? "invitations" : "owned"} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="owned" data-testid="tab-owned">
            My Albums ({owned.length})
          </TabsTrigger>
          <TabsTrigger value="contributing" data-testid="tab-contributing">
            Contributing ({contributing.length})
          </TabsTrigger>
          <TabsTrigger value="invitations" data-testid="tab-invitations">
            Invitations
            {invitations.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {invitations.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="owned">
          <div className="space-y-4">
            {owned.length > 0 ? (
              owned.map((group) => (
                <SharedGroupCard key={group._id} group={group} type="owned" />
              ))
            ) : (
              <EmptyState type="owned" />
            )}
          </div>
        </TabsContent>

        <TabsContent value="contributing">
          <div className="space-y-4">
            {contributing.length > 0 ? (
              contributing.map((group) => (
                <SharedGroupCard key={group._id} group={group} type="contributing" />
              ))
            ) : (
              <EmptyState type="contributing" />
            )}
          </div>
        </TabsContent>

        <TabsContent value="invitations">
          <div className="space-y-4">
            {invitations.length > 0 ? (
              invitations.map((invitation) => (
                <InvitationCard key={invitation._id} invitation={invitation} />
              ))
            ) : (
              <EmptyState type="invitations" />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
