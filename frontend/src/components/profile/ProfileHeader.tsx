"use client";

import { useState } from "react";
import { Camera, Mail, Phone, Calendar, X } from "lucide-react";
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
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const initials =
    user?.memberId?.fullName
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ||
    user?.email
      ?.split("@")[0]
      ?.split(".")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  const fullName =
    user?.memberId?.fullName ||
    user?.email
      ?.split("@")[0]
      ?.replace(/\./g, " ")
      .replace(/^\w/, (c) => c.toUpperCase()) || "User";

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
    <>
      <Card className="mb-6 overflow-hidden border border-border shadow-sm bg-gradient-to-r from-orange-500/5 via-transparent to-transparent">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            {/* Avatar Section */}
            <div className="relative group shrink-0">
              {user?.profilePhoto || user?.memberId?.profilePhoto ? (
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="block focus:outline-none focus:ring-2 focus:ring-primary rounded-full transition-all duration-300"
                  aria-label="View profile photo"
                >
                  <img
                    src={user?.profilePhoto || user?.memberId?.profilePhoto}
                    alt={fullName}
                    className="w-24 h-24 rounded-full object-cover border-4 border-background shadow-md transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                  />
                </button>
              ) : (
                <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white text-3xl font-bold font-mono border-4 border-background shadow-md">
                  {initials}
                </div>
              )}
              {onEditPhoto && (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="absolute bottom-0 right-0 rounded-full w-9 h-9 p-0 border shadow-md hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEditPhoto();
                  }}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1">{fullName}</h2>
                <p className="text-sm text-primary font-semibold tracking-wide uppercase">
                  {gymName || user?.roleId?.name || "Gym Owner"}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-muted/50">
                <div className="flex items-center justify-center sm:justify-start gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Email Address</p>
                    <p className="text-sm font-medium text-foreground">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Contact Number</p>
                    <p className="text-sm font-medium text-foreground">
                      {user?.phone || user?.memberId?.contactNumber || "Not set"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Member Since</p>
                    <p className="text-sm font-medium text-foreground">{formatDate(joinDate)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lightbox Preview Modal */}
      {isPreviewOpen && (user?.profilePhoto || user?.memberId?.profilePhoto) && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="relative max-w-lg w-full bg-card border rounded-2xl overflow-hidden shadow-2xl p-2 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-4 right-4 z-10 bg-background/80 hover:bg-background text-foreground p-1.5 rounded-full transition-colors border shadow-sm"
              aria-label="Close preview"
            >
              <X className="h-4 w-4" />
            </button>
            <img
              src={user?.profilePhoto || user?.memberId?.profilePhoto}
              alt={fullName}
              className="w-full h-auto max-h-[70vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </>
  );
}
