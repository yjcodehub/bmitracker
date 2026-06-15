"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { api } from "@/lib/api";
import { Member, BMIRecord } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Edit, Trash2, ArrowLeft, CheckCircle, Scale, Activity, History, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

export function MemberDetails() {
  const params = useParams();
  const router = useRouter();
  const role = useAuthStore((s) => s.user?.roleId?.slug || "member");
  const memberId = params.id as string;
  const [member, setMember] = useState<Member | null>(null);
  const [history, setHistory] = useState<BMIRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const fetchMemberDetails = async () => {
    try {
      const res = await api.get<Member>(`/members/${memberId}`);
      setMember(res.data);
      
      const historyRes = await api.get<BMIRecord[]>(`/bmi/member/${memberId}?limit=10`);
      setHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load member");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (memberId) {
      fetchMemberDetails();
    }
  }, [memberId]);

  const handleApprove = async () => {
    if (!member) return;
    setIsApproving(true);
    try {
      await api.post(`/members/${member._id}/approve`);
      await fetchMemberDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve member");
    } finally {
      setIsApproving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to archive this member?")) return;

    setIsDeleting(true);
    try {
      await api.put(`/members/${memberId}`, { status: "archived" });
      router.push(`/${role}/members`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to archive member");
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </div>
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded text-destructive">
          {error}
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Member not found</p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 border-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "pending_approval":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/${role}/members`)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Members
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <PageHeader
          title={member.fullName}
          subtitle={`Membership #${member.membershipNumber}`}
        />

        <div className="flex gap-2">
          {member.status === "pending_approval" && role === "owner" && (
            <Button
              onClick={handleApprove}
              disabled={isApproving}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {isApproving ? "Approving..." : "Approve Registration"}
            </Button>
          )}

          <Button asChild variant="outline">
            <Link href={`/${role}/members/${member._id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>

          {role === "owner" && member.status !== "archived" && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? "Archiving..." : "Archive"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground uppercase">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <span
              className={`inline-block px-3 py-0.5 rounded-full text-sm font-semibold capitalize border ${getStatusColor(member.status)}`}
            >
              {member.status.replace("_", " ")}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground uppercase">Current Weight</CardTitle>
          </CardHeader>
          <CardContent className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{member.currentWeight}</span>
            <span className="text-xs text-muted-foreground">kg</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground uppercase">Height</CardTitle>
          </CardHeader>
          <CardContent className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{member.height}</span>
            <span className="text-xs text-muted-foreground">cm</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            Profile Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="grid grid-cols-3 py-2 border-b">
            <span className="text-muted-foreground col-span-1">Email</span>
            <span className="font-medium col-span-2 break-all">{member.email}</span>
          </div>
          <div className="grid grid-cols-3 py-2 border-b">
            <span className="text-muted-foreground col-span-1">Contact</span>
            <span className="font-medium col-span-2">{member.contactNumber}</span>
          </div>
          <div className="grid grid-cols-3 py-2 border-b">
            <span className="text-muted-foreground col-span-1">Age</span>
            <span className="font-medium col-span-2">{member.age} years</span>
          </div>
          <div className="grid grid-cols-3 py-2 border-b">
            <span className="text-muted-foreground col-span-1">Gender</span>
            <span className="font-medium col-span-2 capitalize">{member.gender}</span>
          </div>
          {member.trainerName && (
            <div className="grid grid-cols-3 py-2 border-b">
              <span className="text-muted-foreground col-span-1">Trainer</span>
              <span className="font-medium col-span-2 text-primary">{member.trainerName}</span>
            </div>
          )}
          <div className="grid grid-cols-3 py-2 border-b">
            <span className="text-muted-foreground col-span-1">Registered</span>
            <span className="font-medium col-span-2">{formatDate(member.registrationDate)}</span>
          </div>
        </CardContent>
      </Card>

      {(member.idealWeight || member.weightLossGoal) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Target Goals</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {member.idealWeight && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Ideal Weight</span>
                <span className="font-medium">{member.idealWeight} kg</span>
              </div>
            )}
            {member.weightLossGoal && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Weight Loss Goal</span>
                <span className="font-medium">{member.weightLossGoal} kg</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4" /> BMI Analysis History
          </CardTitle>
          {role === "staff" && (
            <Button asChild size="sm" variant="outline">
              <Link href={`/staff/bmi/new?memberId=${member._id}`}>
                New Analysis
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {history.length > 0 ? (
            <div className="divide-y text-sm">
              {history.map((record) => (
                <div key={record._id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{record.weight} kg</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(record.analysisDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">BMI: {record.bmi}</p>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {record.bmiCategory}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No BMI history recorded yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
