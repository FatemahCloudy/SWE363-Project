import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

export default function LandingPage() {
    const [, setLocation] = useLocation();

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-orange-50 to-purple-50 dark:from-purple-950 dark:via-orange-950 dark:to-purple-950">
            {/* Hero Section */}
            <div className="relative overflow-hidden flex-1">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-orange-600/10" />
                <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
                    <div className="text-center space-y-8">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <MapPin className="h-12 w-12 text-primary" />
                            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
                                Memory of Place
                            </h1>
                        </div>
                        <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto">
                            Preserve and share your special moments tied to the places that matter
                        </p>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Create beautiful memories, connect with friends and family, and explore moments from around the world
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
                            <Button
                                data-testid="button-get-started"
                                size="lg"
                                className="text-lg px-8 py-6"
                                onClick={() => setLocation("/signup")}
                            >
                                Get Started
                            </Button>
                            <Button
                                data-testid="button-login"
                                size="lg"
                                variant="outline"
                                className="text-lg px-8 py-6"
                                onClick={() => setLocation("/login")}
                            >
                                Sign In
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t bg-background/50">
                <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                    <div className="text-center text-sm text-muted-foreground">
                        <p>&copy; 2024 Memory of Place. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
