"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { api } from "@/lib/api";
import { Member } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Edit, Trash2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MemberDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params.id as string;
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    api
      .get<Member>(`/members/${memberId}`)
      .then((res) => setMember(res.data))
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load member");
      })
      .finally(() => setLoading(false));
  }, [memberId]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to archive this member?")) return;

    setIsDeleting(true);
    try {
      await api.put(`/members/${memberId}`, { status: "archived" });
      router.push("/owner/members");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to archive member");
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Loading..." />
        <p className="text-center text-muted-foreground py-12">
          Loading member details...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageHeader title="Error" subtitle="Failed to load member" />
        </div>
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div>
        <PageHeader title="Not Found" subtitle="Member not found" />
        <p className="text-center text-muted-foreground py-12">
          The member you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "inactive":
        return "bg-gray-100 text-gray-700";
      case "pending_approval":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title={member.fullName}
          subtitle={`Membership #${member.membershipNumber}`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(member.status)}`}
            >
              {member.status}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Current Weight</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {member.currentWeight}{" "}
              <span className="text-sm text-muted-foreground">kg</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Height</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {member.height}{" "}
              <span className="text-sm text-muted-foreground">cm</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Email
            </p>
            <p className="font-medium break-all">{member.email}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Contact Number
            </p>
            <p className="font-medium">{member.contactNumber}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Age
            </p>
            <p className="font-medium">{member.age} years</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Gender
            </p>
            <p className="font-medium capitalize">{member.gender}</p>
          </div>
          {member.trainerName && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Trainer Name
              </p>
              <p className="font-medium">{member.trainerName}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Registration Date
            </p>
            <p className="font-medium">{formatDate(member.registrationDate)}</p>
          </div>
        </CardContent>
      </Card>

      {(member.idealWeight || member.weightLossGoal) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Goals</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {member.idealWeight && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Ideal Weight
                </p>
                <p className="font-medium">{member.idealWeight} kg</p>
              </div>
            )}
            {member.weightLossGoal && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Weight Loss Goal
                </p>
                <p className="font-medium">{member.weightLossGoal} kg</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button asChild>
          <Link href={`/owner/members/${member._id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Member
          </Link>
        </Button>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {isDeleting ? "Archiving..." : "Archive Member"}
        </Button>
      </div>
    </div>
  );
}
