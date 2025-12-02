import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Calendar, 
  MapPin, 
  Clock, 
  Plus,
  ArrowLeft,
  ImageIcon,
  Loader2,
  Heart,
  MessageCircle,
  Upload,
  X,
  Settings,
  UserPlus
} from "lucide-react";
import { format } from "date-fns";

function ContributionCard({ entry, isAuthor, onDelete }) {
  return (
    <Card className="overflow-hidden" data-testid={`contribution-card-${entry._id}`}>
      {entry.imageUrl && (
        <div className="aspect-video w-full overflow-hidden">
          <img 
            src={entry.imageUrl} 
            alt={entry.title || "Memory"} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={entry.authorId?.avatarUrl} />
            <AvatarFallback>
              {entry.authorId?.fullName?.charAt(0) || entry.authorId?.username?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">
                {entry.authorId?.fullName || entry.authorId?.username}
              </span>
              {entry.perspective && (
                <Badge variant="secondary" className="text-xs">
                  {entry.perspective}
                </Badge>
              )}
              {entry.mood && (
                <Badge variant="outline" className="text-xs">
                  {entry.mood}
                </Badge>
              )}
            </div>
            {entry.title && (
              <h4 className="font-semibold mt-1">{entry.title}</h4>
            )}
            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
              {entry.content}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {format(new Date(entry.createdAt), 'MMM d, yyyy • h:mm a')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AddContributionDialog({ groupId, onSuccess }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [perspective, setPerspective] = useState("");
  const [mood, setMood] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const addEntryMutation = useMutation({
    mutationFn: async (data) => {
      const res = await apiRequest("POST", `/api/collaborative/groups/${groupId}/entries`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/collaborative/groups/${groupId}`] });
      toast({
        title: "Memory added!",
        description: "Your memory has been added to the shared album.",
      });
      setOpen(false);
      resetForm();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add memory",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setTitle("");
    setContent("");
    setPerspective("");
    setMood("");
    setImageUrl("");
    setImagePreview(null);
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const maxDimension = 1200;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(compressedDataUrl);
        };
        img.onerror = reject;
        img.src = e.target?.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        setImagePreview(compressed);
        setImageUrl(compressed);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to process image",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please add some content to your memory",
        variant: "destructive",
      });
      return;
    }
    addEntryMutation.mutate({
      title,
      content,
      perspective,
      mood,
      imageUrl,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-add-contribution">
          <Plus className="h-4 w-4 mr-2" />
          Add Your Memory
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Your Memory</DialogTitle>
          <DialogDescription>
            Share your perspective of this moment
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Title (Optional)</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your memory a title"
              data-testid="input-contribution-title"
            />
          </div>

          <div className="space-y-2">
            <Label>Your Memory</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your perspective..."
              className="min-h-32"
              required
              data-testid="input-contribution-content"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Perspective (Optional)</Label>
              <Input
                value={perspective}
                onChange={(e) => setPerspective(e.target.value)}
                placeholder="e.g., The sunset view"
                data-testid="input-contribution-perspective"
              />
            </div>
            <div className="space-y-2">
              <Label>Mood</Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger data-testid="select-contribution-mood">
                  <SelectValue placeholder="How did you feel?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="happy">Happy</SelectItem>
                  <SelectItem value="nostalgic">Nostalgic</SelectItem>
                  <SelectItem value="excited">Excited</SelectItem>
                  <SelectItem value="peaceful">Peaceful</SelectItem>
                  <SelectItem value="grateful">Grateful</SelectItem>
                  <SelectItem value="funny">Funny</SelectItem>
                  <SelectItem value="emotional">Emotional</SelectItem>
                  <SelectItem value="adventurous">Adventurous</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Photo (Optional)</Label>
            {imagePreview ? (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-md"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setImagePreview(null);
                    setImageUrl("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="contribution-image"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById('contribution-image')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photo
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addEntryMutation.isPending}>
              {addEntryMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Memory"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function SharedGroupPage() {
  const { groupId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/collaborative/groups/${groupId}`],
    enabled: !!groupId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container max-w-4xl py-6">
        <Button variant="ghost" onClick={() => setLocation('/shared-memories')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Shared Memories
        </Button>
        <div className="text-center py-12">
          <p className="text-destructive">{error?.message || 'Failed to load shared memory group'}</p>
        </div>
      </div>
    );
  }

  const { group, entries, isOwner, isContributor, canContribute } = data;

  return (
    <div className="container max-w-4xl py-6">
      <Button variant="ghost" onClick={() => setLocation('/shared-memories')} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Shared Memories
      </Button>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex gap-6">
            {group.coverImageUrl || group.hostMemoryId?.imageUrl ? (
              <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  src={group.coverImageUrl || group.hostMemoryId?.imageUrl} 
                  alt={group.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">{group.title}</h1>
                  {group.description && (
                    <p className="text-muted-foreground mt-1">{group.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {isOwner && (
                    <Button variant="outline" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                {group.eventName && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {group.eventName}
                  </span>
                )}
                {group.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {group.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {group.contributorCount || 1} contributor{(group.contributorCount || 1) > 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <div className="flex -space-x-2">
                  {group.contributors?.slice(0, 5).map((contributor) => (
                    <Avatar key={contributor._id} className="h-8 w-8 border-2 border-background">
                      <AvatarImage src={contributor.avatarUrl} />
                      <AvatarFallback className="text-xs">
                        {contributor.fullName?.charAt(0) || contributor.username?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                {group.contributorCount > 5 && (
                  <span className="text-sm text-muted-foreground">
                    +{group.contributorCount - 5} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          Memories ({entries?.length || 0})
        </h2>
        {canContribute && (
          <AddContributionDialog groupId={groupId} />
        )}
      </div>

      {entries && entries.length > 0 ? (
        <div className="space-y-4">
          {entries.map((entry) => (
            <ContributionCard 
              key={entry._id} 
              entry={entry} 
              isAuthor={false}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
            <h3 className="mt-4 font-medium">No memories yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Be the first to add your perspective!
            </p>
            {canContribute && (
              <AddContributionDialog groupId={groupId} />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
