import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, MapPin, Lock, Bell, Shield, Eye, Camera } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export const SettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Profile settings state
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  
  // Update form state when user data loads
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setBio(user.bio || "");
      setLocation(user.location || "");
      setPhone(user.phone || "");
    }
  }, [user]);
  
  // Privacy settings state
  const [privateAccount, setPrivateAccount] = useState(false);
  const [showLocation, setShowLocation] = useState(true);
  const [activityStatus, setActivityStatus] = useState(true);
  
  // Notification settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      if (!user?.id) {
        throw new Error("User not loaded");
      }
      return await apiRequest("PUT", `/api/users/${user.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleSaveChanges = () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not loaded. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate required fields are not empty
    if (fullName.trim() === "") {
      toast({
        title: "Validation Error",
        description: "Full name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    updateProfileMutation.mutate({
      fullName: fullName.trim(),
      bio: bio.trim(),
      location: location.trim(),
      phone: phone.trim(),
    });
  };

  const handleCancel = () => {
    // Refetch user data and reset form to latest backend state
    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    if (user) {
      setFullName(user.fullName || "");
      setBio(user.bio || "");
      setLocation(user.location || "");
      setPhone(user.phone || "");
    }
  };

  // Show loading state if user is not loaded
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information and profile details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar Section */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.avatarUrl || undefined} />
                <AvatarFallback className="text-2xl">
                  {user?.username?.slice(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button data-testid="button-change-avatar" variant="outline" size="sm">
                  <Camera className="h-4 w-4 mr-2" />
                  Change Avatar
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG or GIF. Max size 2MB
                </p>
              </div>
            </div>

            <Separator />

            {/* Username (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                data-testid="input-username"
                value={user?.username || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Username cannot be changed
              </p>
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                data-testid="input-email"
                type="email"
                value={user?.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                data-testid="input-fullname"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                data-testid="input-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                {bio.length}/500 characters
              </p>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </Label>
              <Input
                id="location"
                data-testid="input-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                data-testid="input-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy Settings
            </CardTitle>
            <CardDescription>
              Control who can see your content and information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <Label className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Private Account
                </Label>
                <p className="text-sm text-muted-foreground">
                  Only approved followers can see your memories
                </p>
              </div>
              <Switch
                data-testid="switch-private-account"
                checked={privateAccount}
                onCheckedChange={setPrivateAccount}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <Label className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Show Location
                </Label>
                <p className="text-sm text-muted-foreground">
                  Display location on your memories
                </p>
              </div>
              <Switch
                data-testid="switch-show-location"
                checked={showLocation}
                onCheckedChange={setShowLocation}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <Label>Activity Status</Label>
                <p className="text-sm text-muted-foreground">
                  Show when you're online
                </p>
              </div>
              <Switch
                data-testid="switch-activity-status"
                checked={activityStatus}
                onCheckedChange={setActivityStatus}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Manage how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive email about your activity
                </p>
              </div>
              <Switch
                data-testid="switch-email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get push notifications about new likes and comments
                </p>
              </div>
              <Switch
                data-testid="switch-push-notifications"
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>
              Manage your password and security settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button data-testid="button-change-password" variant="outline">
              Change Password
            </Button>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            data-testid="button-save-settings"
            onClick={handleSaveChanges}
            disabled={updateProfileMutation.isPending || !user}
          >
            {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            data-testid="button-cancel-settings"
            variant="outline"
            onClick={handleCancel}
            disabled={!user}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
