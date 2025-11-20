import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, MapPin, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Location } from "@shared/schema";
import { Map, Marker } from "leaflet";



const LOCATION_CATEGORIES = [
    { value: "park", label: "Park" },
    { value: "restaurant", label: "Restaurant" },
    { value: "museum", label: "Museum" },
    { value: "landmark", label: "Landmark" },
    { value: "beach", label: "Beach" },
    { value: "mountain", label: "Mountain" },
    { value: "city", label: "City" },
    { value: "historical_site", label: "Historical Site" },
    { value: "other", label: "Other" },
];

export default function LocationManagement() {
    const { toast } = useToast();
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);

    // Form state
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [category, setCategory] = useState("other");

    const { data: locations = [], isLoading, isError, error } = useQuery({
        queryKey: ["/api/admin/locations"],
        retry: (failureCount, error  ) => {
            // Don't retry on 403 Forbidden errors
            if (error?.message?.includes("Forbidden") || error?.message?.includes("403")) {
                return false;
            }
            return failureCount < 3;
        },
    });

    const createLocationMutation = useMutation({
        mutationFn: async (data) => {
            return await apiRequest("POST", "/api/admin/locations", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/locations"] });
            toast({
                title: "Location created",
                description: "Location has been created successfully.",
            });
            setShowAddDialog(false);
            resetForm();
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to create location",
                variant: "destructive",
            });
        },
    });

    const updateLocationMutation = useMutation({
        mutationFn: async ({ id, ...data }  ) => {
            return await apiRequest("PUT", `/api/admin/locations/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/locations"] });
            toast({
                title: "Location updated",
                description: "Location has been updated successfully.",
            });
            setShowEditDialog(false);
            resetForm();
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to update location",
                variant: "destructive",
            });
        },
    });

    const deleteLocationMutation = useMutation({
        mutationFn: async (id) => {
            return await apiRequest("DELETE", `/api/admin/locations/${id}`, {});
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/locations"] });
            toast({
                title: "Location deleted",
                description: "Location has been deleted successfully.",
            });
            setShowDeleteDialog(false);
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to delete location",
                variant: "destructive",
            });
        },
    });

    const resetForm = () => {
        setName("");
        setAddress("");
        setLatitude("");
        setLongitude("");
        setCategory("other");
        setSelectedLocation(null);
    };

    const openAddDialog = () => {
        resetForm();
        setShowAddDialog(true);
    };

    const openEditDialog = (location) => {
        setSelectedLocation(location);
        setName(location.name);
        setAddress(location.address);
        setLatitude(location.latitude);
        setLongitude(location.longitude);
        setCategory(location.category || "other");
        setShowEditDialog(true);
    };

    const openDeleteDialog = (location) => {
        setSelectedLocation(location);
        setShowDeleteDialog(true);
    };

    const handleSubmit = () => {
        if (!name || !address || !latitude || !longitude) {
            toast({
                title: "Error",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        const data = {
            name,
            address,
            latitude,
            longitude,
            category,
        };

        if (selectedLocation) {
            updateLocationMutation.mutate({ id: selectedLocation.id, ...data });
        } else {
            createLocationMutation.mutate(data);
        }
    };

    // Initialize map
    useEffect(() => {
        const initMap = async () => {
            if (!showAddDialog && !showEditDialog) return;

            const mapElement = document.getElementById("location-map");
            if (!mapElement || mapRef.current) return;

            const L = (await import("leaflet")).default;
            await import("leaflet/dist/leaflet.css");

            const initialLat = latitude ? parseFloat(latitude) : 40.7128;
            const initialLng = longitude ? parseFloat(longitude) : -74.0060;

            const map = L.map("location-map").setView([initialLat, initialLng], 13);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '© OpenStreetMap contributors',
            }).addTo(map);

            const customIcon = L.icon({
                iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
                iconSize: [25, 41],
                iconAnchor: [12, 41],
            });

            const marker = L.marker([initialLat, initialLng], { icon: customIcon, draggable: true }).addTo(map);

            marker.on("dragend", (e) => {
                const position = e.target.getLatLng();
                setLatitude(position.lat.toFixed(7));
                setLongitude(position.lng.toFixed(7));
            });

            map.on("click", (e) => {
                const { lat, lng } = e.latlng;
                marker.setLatLng([lat, lng]);
                setLatitude(lat.toFixed(7));
                setLongitude(lng.toFixed(7));
            });

            mapRef.current = map;
            markerRef.current = marker;

            setTimeout(() => {
                map.invalidateSize();
            }, 100);
        };

        initMap();

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                markerRef.current = null;
            }
        };
    }, [showAddDialog, showEditDialog]);

    // Update marker when coordinates change manually
    useEffect(() => {
        if (markerRef.current && latitude && longitude) {
            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);
            if (!isNaN(lat) && !isNaN(lng)) {
                markerRef.current.setLatLng([lat, lng]);
                mapRef.current?.setView([lat, lng], 13);
            }
        }
    }, [latitude, longitude]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <p className="text-muted-foreground">Loading locations...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center p-8 gap-4">
                <AlertCircle className="w-12 h-12 text-destructive" />
                <div className="text-center">
                    <h3 className="text-lg font-semibold">Error Loading Locations</h3>
                    <p className="text-sm text-muted-foreground">
                        {(error)?.message || "Failed to load locations. Please try again."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                    <h2 className="text-2xl font-semibold">Location Management</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage locations that can be placed on the map
                    </p>
                </div>
                <Button onClick={openAddDialog} data-testid="button-add-location">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Location
                </Button>
            </div>



            <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Locations ({locations.length})
            </CardTitle>
        </CardHeader>

    {locations.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
            <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No locations yet. Create one to get started.</p>
        </div>
    ) : (



        Name</TableHead>
        Address</TableHead>
        Coordinates</TableHead>
        Category</TableHead>
        Created By</TableHead>
        Created</TableHead>
        <TableHead className="text-right">Actions</TableHead>
    </TableRow>
    </TableHeader>

        {locations.map((location) => (
            <TableRow key={location.id} data-testid={`row-location-${location.id}`}>
                <TableCell className="font-medium" data-testid={`text-name-${location.id}`}>
                    {location.name}
                </TableCell>
                <TableCell className="max-w-xs truncate" data-testid={`text-address-${location.id}`}>
                    {location.address}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground" data-testid={`text-coords-${location.id}`}>
                    {location.latitude}, {location.longitude}
                </TableCell>

                <Badge variant="secondary" data-testid={`badge-category-${location.id}`}>
                    {LOCATION_CATEGORIES.find(c => c.value === location.category)?.label || location.category}
                </Badge>
            </TableCell>
            <TableCell data-testid={`text-creator-${location.id}`}>
                {location.creatorUsername}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground" data-testid={`text-created-${location.id}`}>
                {location.createdAt ? formatDistanceToNow(new Date(location.createdAt), { addSuffix: true }) : "N/A"}
            </TableCell>
            <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(location)}
                        data-testid={`button-edit-${location.id}`}
                    >
                        <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(location)}
                        data-testid={`button-delete-${location.id}`}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
        ))}
    </TableBody>
    </Table>
    )}
</CardContent>
</Card>

    {/* Add/Edit Dialog */}
    <Dialog open={showAddDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
            setShowAddDialog(false);
            setShowEditDialog(false);
            resetForm();
        }
    }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">

            <DialogTitle data-testid="title-dialog">
                {selectedLocation ? "Edit Location" : "Add New Location"}
            </DialogTitle>

            Click on the map or drag the marker to set the location coordinates
        </DialogDescription>
    </DialogHeader>

    <div className="space-y-4">
        <div>
            <Label htmlFor="name">Name *</Label>
            <FormControl>

                <Input                 id="name"
                                       value={name}
                                       onChange={(e) => setName(e.target.value)}
                                       placeholder="Central Park"
                                       data-testid="input-name"
                />
        </div>

        <div>
            <Label htmlFor="address">Address *</Label>
            <FormControl>

                <Input                 id="address"
                                       value={address}
                                       onChange={(e) => setAddress(e.target.value)}
                                       placeholder="123 Main St, New York, NY 10001"
                                       data-testid="input-address"
                />
        </div>

        <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
                <SelectTrigger data-testid="select-category">
                    <SelectValue />
                </SelectTrigger>

                {LOCATION_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>

    <div>
        Click on the map to set location *</Label>
    <div id="location-map" className="w-full h-96 rounded-md border" data-testid="map-container"></div>
{latitude && longitude && (
        <p className="text-sm text-muted-foreground mt-2">
            Selected coordinates: {parseFloat(latitude).toFixed(6)}, {parseFloat(longitude).toFixed(6)}
        </p>
    )}
</div>
</div>


    <Button
        variant="outline"
        onClick={() => {
            setShowAddDialog(false);
            setShowEditDialog(false);
            resetForm();
        }}
        data-testid="button-cancel"
    >
        Cancel
    </Button>
    <Button
        onClick={handleSubmit}
        disabled={createLocationMutation.isPending || updateLocationMutation.isPending}
        data-testid="button-submit"
    >
        {selectedLocation ? "Update Location" : "Create Location"}
    </Button>
</DialogFooter>
</DialogContent>
</Dialog>

    {/* Delete Confirmation Dialog */}
    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>


        Delete Location</AlertDialogTitle>

    Are you sure you want to delete "{selectedLocation?.name}"? This action cannot be undone.
</AlertDialogDescription>
</AlertDialogHeader>

    <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
    <AlertDialogAction
        onClick={() => {
            if (selectedLocation) {
                deleteLocationMutation.mutate(selectedLocation.id);
            }
        }}
        data-testid="button-confirm-delete"
    >
        Delete
    </AlertDialogAction>
</AlertDialogFooter>
</AlertDialogContent>
</AlertDialog>
</div>
);
}
