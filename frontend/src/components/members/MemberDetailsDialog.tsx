"use client";

import { useState } from "react";
import { Member } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Edit, Trash2, X } from "lucide-react";
import Link from "next/link";

interface MemberDetailsDialogProps {
  member: Member;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (member: Member) => void;
}

export function MemberDetailsDialog({
  member,
  isOpen,
  onClose,
  onDelete,
}: MemberDetailsDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this member?")) {
      setIsDeleting(true);
      onDelete?.(member);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle>Member Details</CardTitle>
          <button
            onClick={onClose}
            className="rounded-sm opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs font-medium">
                Full Name
              </p>
              <p className="font-medium">{member.fullName}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium">
                Membership #
              </p>
              <p className="font-medium">{member.membershipNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium">Email</p>
              <p className="font-medium break-all">{member.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium">
                Contact
              </p>
              <p className="font-medium">{member.contactNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium">Age</p>
              <p className="font-medium">{member.age} years</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium">
                Gender
              </p>
              <p className="font-medium capitalize">{member.gender}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium">
                Height
              </p>
              <p className="font-medium">{member.height} cm</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium">
                Current Weight
              </p>
              <p className="font-medium">{member.currentWeight} kg</p>
            </div>
            {member.idealWeight && (
              <div>
                <p className="text-muted-foreground text-xs font-medium">
                  Ideal Weight
                </p>
                <p className="font-medium">{member.idealWeight} kg</p>
              </div>
            )}
            {member.weightLossGoal && (
              <div>
                <p className="text-muted-foreground text-xs font-medium">
                  Weight Loss Goal
                </p>
                <p className="font-medium">{member.weightLossGoal} kg</p>
              </div>
            )}
            {member.trainerName && (
              <div>
                <p className="text-muted-foreground text-xs font-medium">
                  Trainer
                </p>
                <p className="font-medium">{member.trainerName}</p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground text-xs font-medium">
                Status
              </p>
              <p className="font-medium capitalize">
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    member.status === "active"
                      ? "bg-green-100 text-green-700"
                      : member.status === "inactive"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {member.status}
                </span>
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium">
                Registration Date
              </p>
              <p className="font-medium">
                {formatDate(member.registrationDate)}
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button asChild size="sm" variant="outline" className="flex-1">
              <Link href={`/owner/members/${member._id}/edit`}>
                <Edit className="h-4 w-4 mr-2" /> Edit
              </Link>
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
            <Button size="sm" onClick={onClose} className="flex-1">
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
