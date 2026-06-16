"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ProfileHeader } from "@/components/profile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogOut, User as UserIcon, Camera, Edit, Shield } from "lucide-react";
import { toast } from "sonner";
import { User } from "@/types";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { ImageEditorDialog } from "@/components/profile/ImageEditorDialog";

export default function StaffProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "edit" | "photo">("overview");
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
      setActiveTab("overview");
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.memberId?._id) return;

    // Validate size (max 2MB)
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

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
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
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Staff Profile</h1>
            <p className="text-muted-foreground">
              Manage your personal profile details and photo
            </p>
          </div>
          <div className="flex bg-muted/65 p-1 rounded-lg border w-fit shrink-0">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === "overview"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserIcon className="h-4 w-4" /> Overview
            </button>
            <button
              onClick={() => setActiveTab("edit")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === "edit"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Edit className="h-4 w-4" /> Edit Details
            </button>
            <button
              onClick={() => setActiveTab("photo")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === "photo"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Camera className="h-4 w-4" /> Avatar
            </button>
          </div>
        </div>

        {/* Profile Header Card */}
        <ProfileHeader
          user={user}
          gymName={user?.roleId?.name || "Gym Staff"}
          joinDate={user?.createdAt}
          onEditPhoto={activeTab !== "photo" ? () => setActiveTab("photo") : undefined}
        />

        {/* Tab Contents */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Account Information */}
            <Card className="shadow-sm border border-border bg-card">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" /> Personal Information
                </h3>
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-muted-foreground text-sm">Age</span>
                    <span className="font-medium text-sm">{user?.memberId?.age || "N/A"} years</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-muted-foreground text-sm">Gender</span>
                    <span className="font-medium text-sm capitalize">{user?.memberId?.gender || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-muted-foreground text-sm">Height</span>
                    <span className="font-medium text-sm">{user?.memberId?.height || "N/A"} cm</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-muted-foreground text-sm">Current Weight</span>
                    <span className="font-medium text-sm">{user?.memberId?.currentWeight || "N/A"} kg</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Status Card */}
            <Card className="shadow-sm border border-border bg-card">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  Account Overview
                </h3>
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-muted-foreground text-sm">Status</span>
                    <span className="font-semibold text-green-600 bg-green-50 dark:bg-green-950/30 px-2.5 py-0.5 rounded-full text-xs capitalize">
                      {user?.status || "Active"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-muted-foreground text-sm">Gym Staff Role</span>
                    <span className="font-medium text-sm">{user?.roleId?.name || "Staff"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Code / ID</span>
                    <span className="font-medium text-sm font-mono">{user?.memberId?.membershipNumber || "N/A"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "edit" && (
          <Card className="shadow-sm border border-border bg-card mt-6">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-6">Edit Profile Details</h3>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Full Name *</Label>
                    <Input
                      id="edit-name"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Contact Number *</Label>
                    <Input
                      id="edit-phone"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
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
                  <div className="space-y-2">
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
                  <div className="space-y-2">
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
                  <div className="space-y-2">
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

                <div className="flex gap-3 pt-4 border-t mt-6">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...
                      </>
                    ) : (
                      "Save Profile"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("overview")}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {activeTab === "photo" && (
          <Card className="shadow-sm border border-border bg-card mt-6">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-6">Profile Picture</h3>
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-muted rounded-xl bg-muted/10 space-y-4">
                {user?.memberId?.profilePhoto ? (
                  <img
                    src={user.memberId.profilePhoto}
                    alt="Preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary/20 shadow-md"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center text-primary text-4xl font-bold font-mono">
                    {user?.email?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
                
                <div className="text-center">
                  <p className="text-sm font-semibold">Upload a profile photo</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG or WEBP up to 2MB</p>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />

                <Button
                  onClick={triggerFileSelect}
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> Uploading...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4" /> Select File
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
