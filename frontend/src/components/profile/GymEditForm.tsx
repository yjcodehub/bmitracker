"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface GymSettingsData {
  name?: string;
  address?: string;
  openingTime?: string;
  closingTime?: string;
  contactNumber?: string;
  website?: string;
  gstNumber?: string;
}

interface GymEditFormProps {
  initialData?: GymSettingsData;
  onSave?: (data: GymSettingsData | undefined) => Promise<void>;
  onCancel?: () => void;
}

export function GymEditForm({
  initialData,
  onSave,
  onCancel,
}: GymEditFormProps) {
  const [formData, setFormData] = useState(initialData || {});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      toast.error("Gym name is required");
      return;
    }

    try {
      setIsLoading(true);
      await onSave?.(formData);
      toast.success("Gym information updated successfully");
    } catch (error) {
      console.error("Error updating gym information:", error);
      toast.error("Failed to update gym information");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Gym Name *</Label>
        <Input
          id="name"
          value={formData.name || ""}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Enter gym name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.address || ""}
          onChange={(e) => handleChange("address", e.target.value)}
          placeholder="Enter gym address"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="openingTime">Opening Time</Label>
          <Input
            id="openingTime"
            type="time"
            value={formData.openingTime || ""}
            onChange={(e) => handleChange("openingTime", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="closingTime">Closing Time</Label>
          <Input
            id="closingTime"
            type="time"
            value={formData.closingTime || ""}
            onChange={(e) => handleChange("closingTime", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactNumber">Contact Number</Label>
        <Input
          id="contactNumber"
          value={formData.contactNumber || ""}
          onChange={(e) => handleChange("contactNumber", e.target.value)}
          placeholder="Enter contact number"
          type="tel"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          value={formData.website || ""}
          onChange={(e) => handleChange("website", e.target.value)}
          placeholder="https://example.com"
          type="url"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="gstNumber">GST Number</Label>
        <Input
          id="gstNumber"
          value={formData.gstNumber || ""}
          onChange={(e) => handleChange("gstNumber", e.target.value)}
          placeholder="Enter GST number"
        />
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
}
