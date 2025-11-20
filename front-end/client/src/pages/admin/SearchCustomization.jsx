import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, Sliders, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function SearchCustomization() {
    const { toast } = useToast();
    const { data: settings, isLoading } = useQuery({
        queryKey: ["/api/admin/search-settings"],
    });

    const [formData, setFormData] = useState({
        ranking: 'relevance',
        advancedSearch: false,
        autocomplete: true,
        searchHistory: true,
        theme: 'auto',
    });

    // Hydrate form with fetched settings
    useEffect(() => {
        if (settings) {
            setFormData(settings);
        }
    }, [settings]);

    const saveMutation = useMutation({
        mutationFn: async (data) => {
            await apiRequest("PUT", "/api/admin/search-settings", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/search-settings"] });
            toast({
                title: "Settings saved",
                description: "Search settings have been successfully updated",
            });
        },
    });

    const handleSave = () => {
        saveMutation.mutate(formData);
    };

    if (isLoading) {
        return (
            <div className="p-6 max-w-4xl">
                <h1 className="text-3xl font-bold mb-6">Search Customization</h1>
                <Card>
                    <CardContent className="pt-6">
                        <div className="animate-pulse space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-10 bg-muted rounded" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Search Customization</h1>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sliders className="h-5 w-5" />
                            Search Settings
                        </CardTitle>
                        <CardDescription>
                            Configure how search works across the platform
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="ranking">Ranking Algorithm</Label>
                            <Select
                                value={formData.ranking}
                                onValueChange={(value) => setFormData({ ...formData, ranking: value })}
                            >
                                <SelectTrigger id="ranking" data-testid="select-ranking">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="relevance">Relevance</SelectItem>
                                    <SelectItem value="recent">Most Recent</SelectItem>
                                    <SelectItem value="popular">Most Popular</SelectItem>
                                    <SelectItem value="trending">Trending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="advanced-search">Enable Advanced Search</Label>
                            <Switch
                                id="advanced-search"
                                checked={formData.advancedSearch}
                                onCheckedChange={(checked) => setFormData({ ...formData, advancedSearch: checked })}
                                data-testid="switch-advanced-search"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="autocomplete">Enable Autocomplete</Label>
                            <Switch
                                id="autocomplete"
                                checked={formData.autocomplete}
                                onCheckedChange={(checked) => setFormData({ ...formData, autocomplete: checked })}
                                data-testid="switch-autocomplete"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="search-history">Save Search History</Label>
                            <Switch
                                id="search-history"
                                checked={formData.searchHistory}
                                onCheckedChange={(checked) => setFormData({ ...formData, searchHistory: checked })}
                                data-testid="switch-search-history"
                            />
                        </div>

                        <Button onClick={handleSave} disabled={saveMutation.isPending} data-testid="button-save-search-settings">
                            {saveMutation.isPending ? "Saving..." : "Save Search Settings"}
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Palette className="h-5 w-5" />
                            Search UI Customization
                        </CardTitle>
                        <CardDescription>
                            Customize the appearance of search interface
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="theme">Search Bar Theme</Label>
                            <Select
                                value={formData.theme}
                                onValueChange={(value) => setFormData({ ...formData, theme: value })}
                            >
                                <SelectTrigger id="theme" data-testid="select-theme">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">Light</SelectItem>
                                    <SelectItem value="dark">Dark</SelectItem>
                                    <SelectItem value="auto">Auto</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button onClick={handleSave} variant="outline" disabled={saveMutation.isPending} data-testid="button-save-ui-settings">
                            {saveMutation.isPending ? "Saving..." : "Save UI Settings"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
