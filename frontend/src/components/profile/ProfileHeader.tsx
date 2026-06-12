"use client";

import { useState } from "react";
import { Camera, Mail, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "@/types";

interface ProfileHeaderProps {
  user?: User;
  gymName?: string;
  joinDate?: string;
  onEditPhoto?: () => void;
}

export function ProfileHeader({
  user,
  gymName,
  joinDate,
  onEditPhoto,
}: ProfileHeaderProps) {
  const initials =
    user?.email
      ?.split("@")[0]
      ?.split(".")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  const fullName =
    user?.email
      ?.split("@")[0]
      ?.replace(/\./g, " ")
      .replace(/^\w/, (c) => c.toUpperCase()) || "Owner";

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-start gap-6">
          {/* Avatar Section */}
          <div className="relative">
            <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white text-3xl font-bold">
              {initials}
            </div>
            {onEditPhoto && (
              <Button
                size="sm"
                variant="secondary"
                className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0"
                onClick={onEditPhoto}
              >
                <Camera className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">{fullName}</h1>
            <p className="text-muted-foreground mb-4">
              {gymName || "Gym Owner"}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium">
                    {user?.phone || "Not set"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">Plan</span>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Membership Plan
                  </p>
                  <p className="text-sm font-medium capitalize">Premium</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Member Since</p>
                  <p className="text-sm font-medium">{formatDate(joinDate)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
