import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, Key, Mail, History, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function SecuritySettings() {
    const { toast } = useToast();
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [email, setEmail] = useState("");

    const updatePasswordMutation = useMutation({
        mutationFn: async (data) => {
            if (data.newPassword !== data.confirmPassword) {
                throw new Error("Passwords do not match");
            }
            if (data.newPassword.length < 8) {
                throw new Error("Password must be at least 8 characters");
            }
            await apiRequest("PUT", "/api/admin/security/password", data);
        },
        onSuccess: () => {
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            toast({
                title: "Password updated",
                description: "Your password has been successfully updated",
            });
        },
        onError: (error) => {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to update password",
            });
        },
    });

    const updateEmailMutation = useMutation({
        mutationFn: async (newEmail) => {
            if (!newEmail.includes("@")) {
                throw new Error("Invalid email address");
            }
            await apiRequest("PUT", "/api/admin/security/email", { email: newEmail });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
            setEmail("");
            toast({
                title: "Email updated",
                description: "Your email has been successfully updated",
            });
        },
        onError: (error) => {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to update email",
            });
        },
    });

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        updatePasswordMutation.mutate(passwordData);
    };

    const handleEmailSubmit = (e) => {
        e.preventDefault();
        updateEmailMutation.mutate(email);
    };

    return (
        <div className="p-6 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Security Settings</h1>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Key className="h-5 w-5" />
                            Change Password
                        </CardTitle>
                        <CardDescription>
                            Update your admin account password
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="current-password">Current Password</Label>
                                <Input
                                    id="current-password"
                                    type="password"
                                    placeholder="Enter current password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    required
                                    data-testid="input-current-password"
                                />
                            </div>
                            <div>
                                <Label htmlFor="new-password">New Password</Label>
                                <Input
                                    id="new-password"
                                    type="password"
                                    placeholder="Enter new password (min 8 characters)"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    required
                                    minLength={8}
                                    data-testid="input-new-password"
                                />
                            </div>
                            <div>
                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    required
                                    data-testid="input-confirm-password"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={updatePasswordMutation.isPending}
                                data-testid="button-update-password"
                            >
                                {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            Email Settings
                        </CardTitle>
                        <CardDescription>
                            Update your admin email address
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@memoryplace.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    data-testid="input-email"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={updateEmailMutation.isPending}
                                data-testid="button-update-email"
                            >
                                {updateEmailMutation.isPending ? "Updating..." : "Update Email"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Check className="h-5 w-5" />
                            Security Status
                        </CardTitle>
                        <CardDescription>
                            Your account security status
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <p className="text-sm">Password strength: Strong</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <p className="text-sm">Email verified</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <p className="text-sm">Account active</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
