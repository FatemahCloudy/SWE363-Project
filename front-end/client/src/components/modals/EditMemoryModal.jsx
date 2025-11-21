import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertMemorySchema} from "@shared/schema";

const formSchema = insertMemorySchema.omit({ userId: true });

export function EditMemoryModal({ open, onOpenChange, memory }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: memory.title,
      description: memory.description || "",
      imageUrl: memory.imageUrl || "",
      category: memory.category,
      privacy: memory.privacy,
      location: memory.location || "",
      locationAddress: memory.locationAddress || "",
      latitude: memory.latitude,
      longitude: memory.longitude,
    },
  });

  // Reset form when memory changes
  useEffect(() => {
    form.reset({
      title: memory.title,
      description: memory.description || "",
      imageUrl: memory.imageUrl || "",
      category: memory.category,
      privacy: memory.privacy,
      location: memory.location || "",
      locationAddress: memory.locationAddress || "",
      latitude: memory.latitude,
      longitude: memory.longitude,
    });
  }, [memory, form]);

  const updateMemoryMutation = useMutation({
    mutationFn: async (data) => {
      // Convert empty strings to null for optional fields (preserve 0 values)
      const cleanedData = {
        ...data,
        imageUrl: data.imageUrl || null,
        location: data.location || null,
        locationAddress: data.locationAddress || null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
      };
      const res = await apiRequest("PUT", `/api/memories/${memory.id}`, cleanedData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/memories"] });
      queryClient.invalidateQueries({ queryKey: [`/api/memories/${memory.id}`] });
      toast({
        title: "Memory updated!",
        description: "Your changes have been saved successfully.",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update memory",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      updateMemoryMutation.mutate(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Memory</DialogTitle>
          <DialogDescription>
            Update your memory details
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      data-testid="input-edit-memory-title"
                      placeholder="Give your memory a title"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      data-testid="input-edit-memory-description"
                      placeholder="Tell us about this memory..."
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-memory-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="privacy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Privacy</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-memory-privacy">
                          <SelectValue placeholder="Select privacy" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">Public - Anyone can see</SelectItem>
                        <SelectItem value="followers_only">Followers Only</SelectItem>
                        <SelectItem value="private">Private - Only me</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      data-testid="input-edit-memory-image"
                      placeholder="https://example.com/image.jpg"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="locationAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      data-testid="input-edit-memory-location"
                      placeholder="City, Country"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-edit-memory-latitude"
                        type="number"
                        step="any"
                        placeholder="40.7128"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-edit-memory-longitude"
                        type="number"
                        step="any"
                        placeholder="-74.0060"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                data-testid="button-cancel-edit-memory"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                data-testid="button-submit-edit-memory"
              >
                {isSubmitting ? "Updating..." : "Update Memory"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
