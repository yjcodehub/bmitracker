"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GymEditForm } from "@/components/profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
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

export default function ProfileEditPage() {
  const router = useRouter();
  const [gymSettings, setGymSettings] = useState<GymSettings | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGymSettings = async () => {
      try {
        setIsLoading(true);
        const settingsRes = await api.get<GymSettings>("/settings/gym");
        setGymSettings(settingsRes.data);
      } catch (error) {
        console.error("Error fetching gym settings:", error);
        // Set default gym settings on error / not found
        setGymSettings({
          name: "My Gym",
          address: "",
          openingTime: "06:00",
          closingTime: "22:00",
          contactNumber: "",
          website: "",
          gstNumber: "",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchGymSettings();
  }, []);

  const handleSave = async (data: GymSettings | undefined) => {
    try {
      await api.put("/settings/gym", data);
      toast.success("Gym information updated successfully");
      router.push("/owner/profile");
    } catch (error) {
      console.error("Error saving gym settings:", error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 to-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-0 h-auto hover:bg-transparent"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Gym Information</h1>
            <p className="text-muted-foreground">Update your gym details</p>
          </div>
        </div>

        <Card className="shadow-sm border border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Gym Details</CardTitle>
          </CardHeader>
          <CardContent>
            <GymEditForm
              initialData={gymSettings}
              onSave={handleSave}
              onCancel={() => router.back()}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
