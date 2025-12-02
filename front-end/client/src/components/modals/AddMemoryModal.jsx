import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertMemorySchema } from "@shared/schema";
import { Upload, X, MapPin, Users, Calendar, Check, Loader2 } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const formSchema = insertMemorySchema.extend({
    isCollaborative: z.boolean().optional().default(false),
    collaboratorIds: z.array(z.string()).optional().default([]),
    eventName: z.string().optional(),
    eventDate: z.string().optional(),
    groupTitle: z.string().optional(),
    groupPrivacy: z.enum(['public', 'private', 'followers_only', 'collaborators_only']).optional().default('collaborators_only'),
});

function LocationPicker({ onLocationSelect }) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);
    const { toast } = useToast();

    const reverseGeocode = async (lat, lng) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            return data.display_name || "";
        } catch (error) {
            console.error("Reverse geocoding failed:", error);
            return "";
        }
    };

    const searchLocations = async (query) => {
        if (query.length < 3) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
            );
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsSearching(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery) {
                searchLocations(searchQuery);
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const getUserLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setCurrentLocation([lat, lng]);

                    if (mapInstanceRef.current && markerRef.current) {
                        mapInstanceRef.current.setView([lat, lng], 13);
                        markerRef.current.setLatLng([lat, lng]);
                        const address = await reverseGeocode(lat, lng);
                        onLocationSelect(lat, lng, address);
                    }

                    toast({
                        title: "Location found",
                        description: "Map centered on your current location",
                    });
                },
                (error) => {
                    toast({
                        title: "Location error",
                        description: "Unable to get your location. Please select manually.",
                        variant: "destructive",
                    });
                }
            );
        } else {
            toast({
                title: "Not supported",
                description: "Geolocation is not supported by your browser",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        const map = L.map(mapRef.current).setView([51.505, -0.09], 13);
        mapInstanceRef.current = map;

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
            maxZoom: 19
        }).addTo(map);

        const customIcon = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        const marker = L.marker([51.505, -0.09], {
            icon: customIcon,
            draggable: true
        }).addTo(map);
        markerRef.current = marker;

        marker.on('dragend', async () => {
            const pos = marker.getLatLng();
            const address = await reverseGeocode(pos.lat, pos.lng);
            onLocationSelect(pos.lat, pos.lng, address);
        });

        map.on('click', async (e) => {
            const { lat, lng } = e.latlng;
            marker.setLatLng([lat, lng]);
            const address = await reverseGeocode(lat, lng);
            onLocationSelect(lat, lng, address);
        });

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [onLocationSelect]);

    const selectSearchResult = async (result) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);

        if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setView([lat, lng], 15);
            markerRef.current.setLatLng([lat, lng]);
            onLocationSelect(lat, lng, result.display_name);
        }

        setSearchQuery("");
        setSearchResults([]);
    };

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Input
                        type="text"
                        placeholder="Search for a place..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        data-testid="input-location-search"
                    />
                    {searchResults.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {searchResults.map((result, index) => (
                                <div
                                    key={index}
                                    className="px-3 py-2 hover-elevate cursor-pointer border-b last:border-b-0"
                                    onClick={() => selectSearchResult(result)}
                                >
                                    <p className="text-sm">{result.display_name}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={getUserLocation}
                    data-testid="button-get-location"
                    title="Use my location"
                >
                    <MapPin className="h-4 w-4" />
                </Button>
            </div>
            <div ref={mapRef} style={{ height: '350px', width: '100%' }} className="rounded-md border" />
            <p className="text-xs text-muted-foreground">
                Click on the map or drag the marker to select a location
            </p>
        </div>
    );
}

function FriendSelector({ selectedIds, onSelectionChange }) {
    const { data: friendsData, isLoading } = useQuery({
        queryKey: ['/api/collaborative/friends'],
    });

    const friends = Array.isArray(friendsData) ? friendsData : (friendsData?.data || []);

    const toggleFriend = (friendId) => {
        if (selectedIds.includes(friendId)) {
            onSelectionChange(selectedIds.filter(id => id !== friendId));
        } else {
            onSelectionChange([...selectedIds, friendId]);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!friends || friends.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No friends available to invite</p>
                <p className="text-xs mt-1">Follow others or get followed to collaborate</p>
            </div>
        );
    }

    return (
        <ScrollArea className="h-48">
            <div className="space-y-2 pr-4">
                {friends.map((friend) => {
                    const friendId = friend._id || friend.id;
                    const isSelected = selectedIds.includes(friendId);
                    return (
                        <div
                            key={friendId}
                            onClick={() => toggleFriend(friendId)}
                            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                                isSelected
                                    ? 'bg-primary/10 border border-primary/30'
                                    : 'hover-elevate border border-transparent'
                            }`}
                            data-testid={`friend-item-${friendId}`}
                        >
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={friend.avatarUrl} />
                                <AvatarFallback>
                                    {friend.fullName?.charAt(0) || friend.username?.charAt(0) || '?'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{friend.fullName || friend.username}</p>
                                <p className="text-xs text-muted-foreground truncate">@{friend.username}</p>
                            </div>
                            {isSelected && (
                                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                    <Check className="h-3 w-3 text-primary-foreground" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </ScrollArea>
    );
}

export function AddMemoryModal({ open, onOpenChange }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [showMap, setShowMap] = useState(false);
    const [showCollaborative, setShowCollaborative] = useState(false);
    const fileInputRef = useRef(null);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            imageUrl: "",
            category: "other",
            privacy: "public",
            location: "",
            locationAddress: "",
            latitude: null,
            longitude: null,
            isCollaborative: false,
            collaboratorIds: [],
            eventName: "",
            eventDate: "",
            groupTitle: "",
            groupPrivacy: "collaborators_only",
        },
    });

    const isCollaborative = form.watch("isCollaborative");
    const selectedCollaborators = form.watch("collaboratorIds") || [];

    const createMemoryMutation = useMutation({
        mutationFn: async (data) => {
            const cleanedData = {
                ...data,
                imageUrl: data.imageUrl || null,
                location: data.location || null,
                locationAddress: data.locationAddress || null,
                latitude: data.latitude ?? null,
                longitude: data.longitude ?? null,
            };
            const res = await apiRequest("POST", "/api/memories", cleanedData);
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/memories"] });
            toast({
                title: "Memory created!",
                description: "Your memory has been shared successfully.",
            });
            form.reset();
            setImagePreview(null);
            setShowCollaborative(false);
            onOpenChange(false);
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to create memory",
                variant: "destructive",
            });
        },
    });

    const createCollaborativeMemoryMutation = useMutation({
        mutationFn: async (data) => {
            const cleanedData = {
                title: data.title,
                description: data.description,
                imageUrl: data.imageUrl || null,
                category: data.category,
                privacy: data.privacy,
                location: data.location || null,
                locationAddress: data.locationAddress || null,
                latitude: data.latitude ?? null,
                longitude: data.longitude ?? null,
                eventName: data.eventName || null,
                eventDate: data.eventDate || null,
                groupTitle: data.groupTitle || data.title,
                groupDescription: data.description,
                collaboratorIds: data.collaboratorIds,
                groupPrivacy: data.groupPrivacy || 'collaborators_only',
            };
            const res = await apiRequest("POST", "/api/collaborative/create", cleanedData);
            return await res.json();
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ["/api/memories"] });
            queryClient.invalidateQueries({ queryKey: ["/api/collaborative/my-groups"] });
            toast({
                title: "Shared memory created!",
                description: `Invitations sent to ${selectedCollaborators.length} friend${selectedCollaborators.length > 1 ? 's' : ''}.`,
            });
            form.reset();
            setImagePreview(null);
            setShowCollaborative(false);
            onOpenChange(false);
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to create shared memory",
                variant: "destructive",
            });
        },
    });

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
                const compressedImage = await compressImage(file);
                setImagePreview(compressedImage);
                form.setValue("imageUrl", compressedImage);
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to process image",
                    variant: "destructive",
                });
            }
        }
    };

    const removeImage = () => {
        setImagePreview(null);
        form.setValue("imageUrl", "");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleLocationSelect = (lat, lng) => {
        form.setValue("latitude", lat.toString());
        form.setValue("longitude", lng.toString());
        toast({
            title: "Location selected",
            description: `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        });
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            if (data.isCollaborative && data.collaboratorIds.length > 0) {
                createCollaborativeMemoryMutation.mutate(data);
            } else {
                createMemoryMutation.mutate(data);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCollaborativeToggle = (checked) => {
        form.setValue("isCollaborative", checked);
        setShowCollaborative(checked);
        if (!checked) {
            form.setValue("collaboratorIds", []);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create a Memory</DialogTitle>
                    <DialogDescription>
                        Share a special moment from a place that matters to you
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
                                            data-testid="input-memory-title"
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
                                            data-testid="input-memory-description"
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
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger data-testid="select-memory-category">
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="travel">Travel</SelectItem>
                                                <SelectItem value="family">Family</SelectItem>
                                                <SelectItem value="friends">Friends</SelectItem>
                                                <SelectItem value="food">Food</SelectItem>
                                                <SelectItem value="nature">Nature</SelectItem>
                                                <SelectItem value="adventure">Adventure</SelectItem>
                                                <SelectItem value="culture">Culture</SelectItem>
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
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger data-testid="select-memory-privacy">
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
                            render={() => (
                                <FormItem>
                                    <FormLabel>Image (Optional)</FormLabel>
                                    <FormControl>
                                        <div className="space-y-4">
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
                                                        onClick={removeImage}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div>
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                        className="hidden"
                                                        id="image-upload"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="w-full"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        data-testid="button-upload-image"
                                                    >
                                                        <Upload className="h-4 w-4 mr-2" />
                                                        Upload Image
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
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
                                            data-testid="input-memory-location"
                                            placeholder="City, Country"
                                            {...field}
                                            value={field.value || ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <FormLabel>Location on Map (Optional)</FormLabel>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowMap(!showMap)}
                                    data-testid="button-toggle-map"
                                >
                                    {showMap ? "Hide Map" : "Show Map"}
                                </Button>
                            </div>
                            {showMap && (
                                <div className="border rounded-md overflow-hidden">
                                    <LocationPicker onLocationSelect={handleLocationSelect} />
                                </div>
                            )}
                            {(form.watch("latitude") || form.watch("longitude")) && (
                                <p className="text-sm text-muted-foreground">
                                    Selected coordinates: {form.watch("latitude") && parseFloat(form.watch("latitude")).toFixed(4)}, {form.watch("longitude") && parseFloat(form.watch("longitude")).toFixed(4)}
                                </p>
                            )}
                        </div>

                        <div className="border rounded-md p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium text-sm">Collaborative Memory</p>
                                        <p className="text-xs text-muted-foreground">Invite friends to add their memories</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={isCollaborative}
                                    onCheckedChange={handleCollaborativeToggle}
                                    data-testid="switch-collaborative"
                                />
                            </div>

                            {showCollaborative && (
                                <div className="space-y-4 pt-2 border-t">
                                    <FormField
                                        control={form.control}
                                        name="eventName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    Event Name (Optional)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        data-testid="input-event-name"
                                                        placeholder="e.g., Beach Trip 2024"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="eventDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Event Date (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="date"
                                                        data-testid="input-event-date"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="groupPrivacy"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Shared Album Privacy</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger data-testid="select-group-privacy">
                                                            <SelectValue placeholder="Who can see this album" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="collaborators_only">Collaborators Only</SelectItem>
                                                        <SelectItem value="followers_only">Followers</SelectItem>
                                                        <SelectItem value="public">Public</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="collaboratorIds"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Invite Friends</FormLabel>
                                                <FormControl>
                                                    <FriendSelector
                                                        selectedIds={field.value || []}
                                                        onSelectionChange={(ids) => field.onChange(ids)}
                                                    />
                                                </FormControl>
                                                {selectedCollaborators.length > 0 && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {selectedCollaborators.length} friend{selectedCollaborators.length > 1 ? 's' : ''} selected
                                                    </p>
                                                )}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                                data-testid="button-cancel-memory"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || (isCollaborative && selectedCollaborators.length === 0)}
                                data-testid="button-submit-memory"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : isCollaborative ? (
                                    <>
                                        <Users className="h-4 w-4 mr-2" />
                                        Create & Invite
                                    </>
                                ) : (
                                    "Create Memory"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
