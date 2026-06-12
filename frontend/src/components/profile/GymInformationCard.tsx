"use client";

import { MapPin, Clock, Phone, Globe, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface GymInformationCardProps {
  gymData?: {
    name?: string;
    address?: string;
    openingTime?: string;
    closingTime?: string;
    contactNumber?: string;
    website?: string;
    gstNumber?: string;
  };
  onEdit?: () => void;
}

export function GymInformationCard({
  gymData,
  onEdit,
}: GymInformationCardProps) {
  const formatTime = (time?: string) => {
    if (!time) return "N/A";
    try {
      const [hours, minutes] = time.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Gym Information</CardTitle>
        {onEdit && (
          <Button size="sm" variant="outline" onClick={onEdit}>
            Edit
          </Button>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Gym Name */}
          <div className="flex items-start gap-3">
            <div className="w-4 h-4 rounded-full bg-orange-500 mt-1" />
            <div>
              <p className="text-xs text-muted-foreground">Gym Name</p>
              <p className="text-sm font-medium">
                {gymData?.name || "Not set"}
              </p>
            </div>
          </div>

          {/* Address */}
          {gymData?.address && (
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="text-sm font-medium">{gymData.address}</p>
              </div>
            </div>
          )}

          {/* Operating Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Opening Time</p>
                <p className="text-sm font-medium">
                  {formatTime(gymData?.openingTime)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Closing Time</p>
                <p className="text-sm font-medium">
                  {formatTime(gymData?.closingTime)}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Number */}
          {gymData?.contactNumber && (
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Contact Number</p>
                <p className="text-sm font-medium">{gymData.contactNumber}</p>
              </div>
            </div>
          )}

          {/* Website */}
          {gymData?.website && (
            <div className="flex items-start gap-3">
              <Globe className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Website</p>
                <p className="text-sm font-medium">
                  <a
                    href={gymData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-600 hover:underline"
                  >
                    {gymData.website}
                  </a>
                </p>
              </div>
            </div>
          )}

          {/* GST Number */}
          {gymData?.gstNumber && (
            <div className="flex items-start gap-3">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">GST Number</p>
                <p className="text-sm font-medium">{gymData.gstNumber}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
