import { CameraIcon, User } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";



// Image compression function
const compressImage = () => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        resolve(compressedBase64);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

export const EditProfileModal = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    gender: user?.gender || "",
    birthdate: user?.birthdate || "",
    location: user?.location || "",
    locationAddress: user?.locationAddress || "",
    bio: user?.bio || "",
    avatarUrl: user?.avatarUrl || "",
    coverUrl: user?.coverUrl || "",
  });

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: user.gender || "",
        birthdate: user.birthdate || "",
        location: user.location || "",
        locationAddress: user.locationAddress || "",
        bio: user.bio || "",
        avatarUrl: user.avatarUrl || "",
        coverUrl: user.coverUrl || "",
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      return await apiRequest("/api/user/profile", "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update profile",
      });
    },
  });

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    console.log("Avatar file selected:", file);
    if (file) {
      try {
        console.log("Starting image compression...");
        const compressed = await compressImage(file);
        console.log("Image compressed, size:", compressed.length);
        setFormData({ ...formData, avatarUrl: compressed });
        toast({
          title: "Success",
          description: "Avatar image selected",
        });
      } catch (error) {
        console.error("Avatar compression error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to process image",
        });
      }
    }
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    console.log("Cover file selected:", file);
    if (file) {
      try {
        console.log("Starting cover image compression...");
        const compressed = await compressImage(file, 1600, 800);
        console.log("Cover image compressed, size:", compressed.length);
        setFormData({ ...formData, coverUrl: compressed });
        toast({
          title: "Success",
          description: "Cover image selected",
        });
      } catch (error) {
        console.error("Cover compression error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to process image",
        });
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting profile update:", formData);
    updateProfileMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
        
          <DialogTitle className="[font-family:'Nunito',Helvetica] font-bold text-[#490057] text-2xl">
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="w-32 h-32">
                <AvatarImage src={formData.avatarUrl} alt="Profile" />
                <AvatarFallback className="bg-[#fbb03b] text-white text-3xl">
                  <User className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                data-testid="input-avatar"
              />
              <Button
                type="button"
                size="icon"
                onClick={() => {
                  console.log("Camera button clicked!");
                  console.log("Avatar input ref:", avatarInputRef.current);
                  avatarInputRef.current?.click();
                }}
                className="absolute bottom-0 right-0 rounded-full bg-[#a303a0] hover:bg-[#a303a0]/90 text-white w-10 h-10"
                data-testid="button-change-avatar"
              >
                <CameraIcon className="w-5 h-5" />
              </Button>
            </div>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="hidden"
              data-testid="input-cover"
            />
            <Button 
              type="button"
              variant="outline"
              onClick={() => {
                console.log("Cover button clicked!");
                console.log("Cover input ref:", coverInputRef.current);
                coverInputRef.current?.click();
              }}
              className="border-[#a303a0] text-[#a303a0]"
              data-testid="button-change-cover"
            >
              Change Cover Photo
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="[font-family:'Nunito',Helvetica] font-semibold text-[#490057]">
                Full Name
              </Label>
              <FormControl>

                <Input                 value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="bg-[#f7f7f8] border-0 [font-family:'Nunito',Helvetica]"
                data-testid="input-fullname"
              />
            </div>

            <div className="space-y-2">
              <Label className="[font-family:'Nunito',Helvetica] font-semibold text-[#490057]">
                Gender
              </Label>
              <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                <SelectTrigger className="bg-[#f7f7f8] border-0 [font-family:'Nunito',Helvetica]" data-testid="select-gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="[font-family:'Nunito',Helvetica] font-semibold text-[#490057]">
                Email
              </Label>
              <FormControl>

                <Input                 type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-[#f7f7f8] border-0 [font-family:'Nunito',Helvetica]"
              />
            </div>

            <div className="space-y-2">
              <Label className="[font-family:'Nunito',Helvetica] font-semibold text-[#490057]">
                Phone
              </Label>
              <FormControl>

                <Input                 type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-[#f7f7f8] border-0 [font-family:'Nunito',Helvetica]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="[font-family:'Nunito',Helvetica] font-semibold text-[#490057]">
              Birthdate
            </Label>
            <FormControl>

              <Input               value={formData.birthdate}
              onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
              className="bg-[#f7f7f8] border-0 [font-family:'Nunito',Helvetica]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="[font-family:'Nunito',Helvetica] font-semibold text-[#490057]">
                City
              </Label>
              <FormControl>

                <Input                 value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="bg-[#f7f7f8] border-0 [font-family:'Nunito',Helvetica]"
              />
            </div>

            <div className="space-y-2">
              <Label className="[font-family:'Nunito',Helvetica] font-semibold text-[#490057]">
                Address
              </Label>
              <FormControl>

                <Input                 value={formData.locationAddress}
                onChange={(e) => setFormData({ ...formData, locationAddress: e.target.value })}
                className="bg-[#f7f7f8] border-0 [font-family:'Nunito',Helvetica]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="[font-family:'Nunito',Helvetica] font-semibold text-[#490057]">
              Bio
            </Label>
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="bg-[#f7f7f8] border-0 [font-family:'Nunito',Helvetica] min-h-[100px]"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit"
              className="bg-[#a303a0] hover:bg-[#a303a0]/90 text-white"
              disabled={updateProfileMutation.isPending}
              data-testid="button-save-profile"
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-[#a303a0] text-[#a303a0]"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-profile"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
