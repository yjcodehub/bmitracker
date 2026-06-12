"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProfileHeader, GymInformationCard } from "@/components/profile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { User } from "@/types";
import { api } from "@/lib/api";

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

  const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 to-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-muted-foreground">
            Manage your gym and personal information
          </p>
        </div>

        {/* Profile Header */}
        <ProfileHeader
          user={user}
          gymName={gymSettings?.name}
          joinDate={user?.createdAt}
          onEditPhoto={() => {
            toast.info("Avatar upload feature coming soon");
          }}
        />

        {/* Gym Information Card */}
        <GymInformationCard gymData={gymSettings} onEdit={handleGymEditClick} />

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Subscription Information Card */}
          <Card className="shadow-sm border border-border bg-card">
            <CardContent className="p-6 flex flex-col justify-between h-full space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Subscription Information</h3>

                <div>
                  <span className="text-xs text-muted-foreground block">Current Plan</span>
                  <span className="text-2xl font-bold text-primary capitalize">Premium</span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground block">Features Included</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600 font-bold shrink-0" />
                      <span>Unlimited Members</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600 font-bold shrink-0" />
                      <span>BMI Tracking</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600 font-bold shrink-0" />
                      <span>Progress Analytics</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600 font-bold shrink-0" />
                      <span>Data Export</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-muted space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Plan Expiry Date</span>
                  <span className="text-sm font-medium text-destructive">{expiryDate}</span>
                </div>
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow active:scale-[0.98] font-medium py-2 rounded-lg"
                  onClick={() => toast.success("Redirecting to subscription renewal...")}
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
      </div>
    </div>
  );
}
