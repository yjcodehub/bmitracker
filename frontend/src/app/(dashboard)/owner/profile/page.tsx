"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ProfileHeader, GymInformationCard } from "@/components/profile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { User } from "@/types";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageEditorDialog } from "@/components/profile/ImageEditorDialog";

interface GymSettings {
  name?: string;
  address?: string;
  openingTime?: string;
  closingTime?: string;
  contactNumber?: string;
  website?: string;
  gstNumber?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User>();
  const [gymSettings, setGymSettings] = useState<GymSettings>();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const logout = useAuthStore((state) => state.logout);

  // Photo upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image file size must be less than 2MB");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setEditorOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSavePhoto = async (croppedBase64: string) => {
    setEditorOpen(false);
    setIsSavingPhoto(true);
    try {
      const res = await api.put<User>("/auth/me", { profilePhoto: croppedBase64 });
      setUser(res.data);
      toast.success("Profile photo updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile photo");
    } finally {
      setIsSavingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);

        // Fetch user data using standard api client
        const userRes = await api.get<User>("/auth/me");
        setUser(userRes.data);

        // Fetch gym settings using standard api client
        try {
          const settingsRes = await api.get<GymSettings>("/settings/gym");
          setGymSettings(settingsRes.data);
        } catch {
          // Set default gym settings if not found or errors
          setGymSettings({
            name: "My Gym",
            address: "",
            openingTime: "06:00",
            closingTime: "22:00",
            contactNumber: "",
            website: "",
            gstNumber: "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleGymEditClick = () => {
    router.push("/owner/profile/edit");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 to-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Profile</h1>
            <p className="text-muted-foreground">
              Manage your gym and personal information
            </p>
          </div>
          {isSavingPhoto && (
            <div className="flex items-center gap-2 bg-primary/10 text-primary text-xs px-3 py-1.5 rounded-full border border-primary/20 animate-pulse font-semibold">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving Photo...
            </div>
          )}
        </div>

        {/* Hidden File Input for Avatar */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
        />

        {/* Profile Header */}
        <ProfileHeader
          user={user}
          gymName={gymSettings?.name}
          joinDate={user?.createdAt}
          onEditPhoto={() => fileInputRef.current?.click()}
        />

        {/* Gym Information Card */}
        <GymInformationCard gymData={gymSettings} onEdit={handleGymEditClick} />

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Subscription Information Card */}
          <Card className="shadow-sm border border-border bg-card relative overflow-hidden">
            <CardContent className="p-6 flex flex-col justify-between h-full space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Subscription Information</h3>
                  <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider animate-pulse">
                    Coming Soon
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground block">Current Plan</span>
                  <Skeleton className="h-8 w-28" />
                </div>

                <div className="space-y-3">
                  <span className="text-xs text-muted-foreground block">Features Included</span>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 w-36" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-muted space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Plan Expiry Date</span>
                  <Skeleton className="h-4 w-24" />
                </div>
                <Button
                  disabled
                  className="w-full bg-primary/40 text-primary-foreground/80 cursor-not-allowed font-medium py-2 rounded-lg"
                >
                  Renew Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Stats Card */}
          <Card className="shadow-sm border border-border bg-card">
            <CardContent className="p-6 flex flex-col justify-between h-full space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Account Stats</h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-muted">
                    <span className="text-muted-foreground text-sm">Account Status</span>
                    <span className="font-semibold text-green-600 bg-green-50 dark:bg-green-950/30 px-2.5 py-0.5 rounded-full text-xs">Active</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-muted">
                    <span className="text-muted-foreground text-sm">Member Since</span>
                    <span className="font-medium text-sm">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          year: "numeric",
                        })
                        : "Jan 2026"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Account Type</span>
                    <span className="font-medium capitalize text-sm">Gym Owner</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logout Button */}
        <div className="flex justify-center mt-10">
          <Button
            variant="outline"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2 px-8 py-5 h-auto rounded-xl font-semibold text-base shadow-sm border border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive hover:text-destructive-foreground hover:shadow-lg hover:shadow-destructive/10 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] w-full max-w-xs"
          >
            {isLoggingOut ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <LogOut className="h-5 w-5" />
            )}
            Logout
          </Button>
        </div>
      </div>

      {/* Image Editor Dialog */}
      <ImageEditorDialog
        isOpen={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }}
        imageSrc={selectedImage}
        onSave={handleSavePhoto}
      />
    </div>
  );
}
