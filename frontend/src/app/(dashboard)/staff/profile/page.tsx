"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ProfileHeader } from "@/components/profile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogOut, User as UserIcon, Camera, Edit, Shield, X } from "lucide-react";
import { toast } from "sonner";
import { User } from "@/types";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { ImageEditorDialog } from "@/components/profile/ImageEditorDialog";
import { FitnessLoader } from "@/components/ui/FitnessLoader";

export default function StaffProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logout = useAuthStore((state) => state.logout);

  // Photo upload state
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  // Edit form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState<number | string>("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [height, setHeight] = useState<number | string>("");
  const [currentWeight, setCurrentWeight] = useState<number | string>("");

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      const userRes = await api.get<User>("/auth/me");
      const userData = userRes.data;
      setUser(userData);

      if (userData.memberId) {
        const m = userData.memberId;
        setFullName(m.fullName || "");
        setPhone(m.contactNumber || "");
        setAge(m.age || "");
        setGender(m.gender || "male");
        setHeight(m.height || "");
        setCurrentWeight(m.currentWeight || "");
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  useEffect(() => {
    if (editorOpen || isEditOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [editorOpen, isEditOpen]);

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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.memberId?._id) return;

    try {
      setIsSaving(true);
      const payload = {
        fullName,
        contactNumber: phone,
        age: Number(age),
        gender,
        height: Number(height),
        currentWeight: Number(currentWeight),
      };

      await api.put(`/members/${user.memberId._id}`, payload);
      toast.success("Profile updated successfully");

      // Refresh user profile details
      const userRes = await api.get<User>("/auth/me");
      setUser(userRes.data);
      setIsEditOpen(false);
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image file size must be less than 2MB");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (!user?.memberId?._id) {
      toast.error("User profile is not fully loaded. Please try again.");
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
    if (!user?.memberId?._id) return;
    setEditorOpen(false);
    setIsSaving(true);
    try {
      await api.put(`/members/${user.memberId._id}`, { profilePhoto: croppedBase64 });
      toast.success("Profile photo updated successfully");

      // Re-fetch user to show the new picture
      const userRes = await api.get<User>("/auth/me");
      setUser(userRes.data);
    } catch (err) {
      toast.error("Failed to upload image");
    } finally {
      setIsSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50/50 to-white">
        <FitnessLoader label="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 to-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center shrink-0">
          <h1 className="text-3xl font-bold mb-2">Staff Profile</h1>
          <p className="text-muted-foreground">
            View your personal profile details and update photo
          </p>
        </div>

        {/* Hidden File Input for Avatar */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
        />

        {/* Profile Header Card */}
        <div className="max-w-3xl mx-auto">
          <ProfileHeader
            user={user}
            gymName={user?.roleId?.name || "Gym Staff"}
            joinDate={user?.createdAt}
            onEditPhoto={() => fileInputRef.current?.click()}
          />
        </div>

        {/* Profile Details Container (Centered max-w) */}
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Personal Information */}
          <Card className="shadow-sm border border-border bg-card">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" /> Personal Information
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full hover:bg-muted"
                  onClick={() => setIsEditOpen(true)}
                  aria-label="Edit personal details"
                >
                  <Edit className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-xl border border-border/50 text-center">
                  <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Age</span>
                  <span className="font-bold text-foreground text-lg mt-1">{user?.memberId?.age || "N/A"} years</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-xl border border-border/50 text-center">
                  <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Gender</span>
                  <span className="font-bold text-foreground text-lg mt-1 capitalize">{user?.memberId?.gender || "N/A"}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-xl border border-border/50 text-center">
                  <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Height</span>
                  <span className="font-bold text-foreground text-lg mt-1">{user?.memberId?.height || "N/A"} cm</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-xl border border-border/50 text-center">
                  <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Weight</span>
                  <span className="font-bold text-foreground text-lg mt-1">{user?.memberId?.currentWeight || "N/A"} kg</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Status Card */}
          <Card className="shadow-sm border border-border bg-card">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  Account Overview
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-xl border border-border/50 text-center">
                  <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Status</span>
                  <span className="font-bold text-green-600 bg-green-50 dark:bg-green-950/30 px-3 py-1 rounded-full text-xs font-semibold mt-1.5 capitalize">
                    {user?.status || "Active"}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-xl border border-border/50 text-center">
                  <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Role</span>
                  <span className="font-bold text-foreground text-lg mt-1">{user?.roleId?.name || "Staff"}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-xl border border-border/50 text-center col-span-2">
                  <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Membership ID</span>
                  <span className="font-mono font-bold text-primary text-base mt-1">{user?.memberId?.membershipNumber || "N/A"}</span>
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

      {/* Edit Profile Details Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-background rounded-lg border shadow-lg max-w-lg w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b shrink-0 flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-primary" />
                Edit Profile Details
              </h2>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="flex-1 overflow-y-auto p-6 space-y-4 pb-20 scroll-pb-20">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-name">Full Name *</Label>
                  <Input
                    id="edit-name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-phone">Contact Number *</Label>
                  <Input
                    id="edit-phone"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-age">Age *</Label>
                  <Input
                    id="edit-age"
                    type="number"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-gender">Gender *</Label>
                  <select
                    id="edit-gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    disabled={isSaving}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-height">Height (cm) *</Label>
                  <Input
                    id="edit-height"
                    type="number"
                    required
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-weight">Current Weight (kg) *</Label>
                  <Input
                    id="edit-weight"
                    type="number"
                    step="0.1"
                    required
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(e.target.value)}
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4 shrink-0">
                <Button variant="outline" type="button" onClick={() => setIsEditOpen(false)} disabled={isSaving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Details"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

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
