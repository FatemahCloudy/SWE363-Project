import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Map, MapPin, Plus, Globe, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function LocationMapPicker({ onLocationSelect, selectedLocation }) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Initialize map centered on New York
        const map = L.map(mapRef.current).setView([40.7128, -74.0060], 4);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        // Add click handler to select location
        map.on("click", (e) => {
            const { lat, lng } = e.latlng;

            // Remove existing marker
            if (markerRef.current) {
                map.removeLayer(markerRef.current);
            }

            // Add new marker
            markerRef.current = L.marker([lat, lng]).addTo(map);

            // Notify parent component
            onLocationSelect({ latitude: lat, longitude: lng });
        });

        mapInstanceRef.current = map;

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [onLocationSelect]);

    // Update marker when selectedLocation changes
    useEffect(() => {
        if (mapInstanceRef.current && selectedLocation.latitude && selectedLocation.longitude) {
            if (markerRef.current) {
                mapInstanceRef.current.removeLayer(markerRef.current);
            }
            markerRef.current = L.marker([selectedLocation.latitude, selectedLocation.longitude])
                .addTo(mapInstanceRef.current);
            mapInstanceRef.current.setView([selectedLocation.latitude, selectedLocation.longitude], 10);
        }
    }, [selectedLocation]);

    return (
        <div
            ref={mapRef}
            style={{ height: "300px", width: "100%", borderRadius: "8px" }}
            data-testid="map-picker"
        />
    );
}

export default function MapLocationManagement() {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        latitude: null,
        longitude: null,
        featured: false,
    });

    const { data: locations, isLoading } = useQuery({
        queryKey: ["/api/admin/locations"],
    });

    const createMutation = useMutation({
        mutationFn: async (data) => {
            await apiRequest("POST", "/api/admin/locations", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/locations"] });
            setIsDialogOpen(false);
            setFormData({ name: "", description: "", latitude: null, longitude: null, featured: false });
            toast({
                title: "Location added",
                description: "Location has been successfully added",
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (locationId) => {
            await apiRequest("DELETE", `/api/admin/locations/${locationId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/locations"] });
            toast({
                title: "Location deleted",
                description: "Location has been successfully deleted",
            });
        },
    });

    const handleLocationSelect = ({ latitude, longitude }) => {
        setFormData({ ...formData, latitude, longitude });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate name and description
        if (!formData.name.trim()) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Location name is required",
            });
            return;
        }

        if (!formData.description.trim()) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Description is required",
            });
            return;
        }

        // Validate coordinates
        if (formData.latitude === null || formData.longitude === null) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Please click on the map to select a location",
            });
            return;
        }

        createMutation.mutate({
            ...formData,
            latitude: formData.latitude,
            longitude: formData.longitude,
        });
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <h1 className="text-3xl font-bold mb-6">Map & Location Management</h1>
                <Card>
                    <CardContent className="pt-6">
                        <div className="animate-pulse space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-20 bg-muted rounded" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const stats = {
        total: locations?.length || 0,
        featured: locations?.filter(l => l.featured).length || 0,
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Map & Location Management</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button data-testid="button-add-location">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Location
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Add New Location</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Location Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="e.g., Times Square, Central Park"
                                    data-testid="input-location-name"
                                />
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                    placeholder="Describe this location..."
                                    data-testid="input-location-description"
                                />
                            </div>

                            <div>
                                <Label>Select Location on Map</Label>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Click anywhere on the map to set the location coordinates
                                </p>
                                <LocationMapPicker
                                    onLocationSelect={handleLocationSelect}
                                    selectedLocation={{ latitude: formData.latitude, longitude: formData.longitude }}
                                />
                                {formData.latitude !== null && formData.longitude !== null && (
                                    <div className="mt-2 p-2 bg-muted rounded-md text-sm">
                                        <MapPin className="h-4 w-4 inline mr-2" />
                                        Selected: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                                    </div>
                                )}
                            </div>

                            <DialogFooter>
                                <Button
                                    type="submit"
                                    disabled={createMutation.isPending || formData.latitude === null}
                                    data-testid="button-submit-location"
                                >
                                    {createMutation.isPending ? "Adding..." : "Add Location"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Location Overview
                    </CardTitle>
                    <CardDescription>
                        Manage featured locations and map settings
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <Badge variant="secondary" data-testid="badge-total-locations">
                            Total Locations: {stats.total}
                        </Badge>
                        <Badge variant="default" data-testid="badge-featured-locations">
                            Featured: {stats.featured}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Featured Locations ({locations?.length || 0})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {!locations || locations.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Map className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">No locations added yet</h3>
                            <p className="mb-4">Add and manage featured locations for users to discover</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {locations.map((location) => (
                                <div
                                    key={location.id}
                                    className="flex items-start justify-between p-4 border rounded-md"
                                    data-testid={`location-item-${location.id}`}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-semibold">{location.name}</h3>
                                            {location.featured && (
                                                <Badge variant="default">Featured</Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2">{location.description}</p>
                                        <p className="text-xs text-muted-foreground">
                                            <MapPin className="h-3 w-3 inline mr-1" />
                                            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Added {format(new Date(location.createdAt), "MMM d, yyyy")}
                                        </p>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => deleteMutation.mutate(location.id)}
                                        disabled={deleteMutation.isPending}
                                        data-testid={`button-delete-location-${location.id}`}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
