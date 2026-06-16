"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { api } from "@/lib/api";
import { Member, BMIRecord } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Edit, Trash2, ArrowLeft, CheckCircle, Scale, Activity, History, Loader2, Download, Mail, Utensils } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

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

  // Reports and Diet state
  const [dietPlans, setDietPlans] = useState<{ _id: string; name: string; isVegetarian: boolean; isNonVegetarian: boolean }[]>([]);
  const [assigningBmiId, setAssigningBmiId] = useState<string | null>(null);
  const [selectedDietId, setSelectedDietId] = useState<string>("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [downloadingRecordId, setDownloadingRecordId] = useState<string | null>(null);
  const [emailingRecordId, setEmailingRecordId] = useState<string | null>(null);

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
    if (role === "staff" || role === "owner") {
      api
        .get("/diet-plans?isTemplate=true&isActive=true")
        .then((res) => {
          if (Array.isArray(res.data)) setDietPlans(res.data);
        })
        .catch(console.error);
    }
  }, [role]);

  useEffect(() => {
    if (memberId) {
      fetchMemberDetails();
    }
  }, [memberId]);

  const handleDownloadReport = async (recordId: string) => {
    setDownloadingRecordId(recordId);
    try {
      const genRes = await api.post<{ _id: string; fileName: string }>("/reports/generate", { bmiRecordId: recordId });
      const reportId = genRes.data._id;
      const fileName = genRes.data.fileName;

      const token = api.getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/reports/${reportId}/download`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (!response.ok) throw new Error("Failed to download PDF file");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Report downloaded successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate or download report");
    } finally {
      setDownloadingRecordId(null);
    }
  };

  const handleEmailReport = async (recordId: string) => {
    setEmailingRecordId(recordId);
    try {
      const genRes = await api.post<{ _id: string }>("/reports/generate", { bmiRecordId: recordId });
      const reportId = genRes.data._id;

      await api.post(`/reports/${reportId}/email`);
      toast.success("Report emailed to member successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to email report");
    } finally {
      setEmailingRecordId(null);
    }
  };

  const handleAssignDiet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningBmiId) return;
    setAssignLoading(true);
    try {
      await api.patch(`/bmi/${assigningBmiId}/diet`, { dietPlanId: selectedDietId || null });
      toast.success("Diet plan assigned successfully");
      setAssigningBmiId(null);
      setSelectedDietId("");
      fetchMemberDetails();
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign diet plan");
    } finally {
      setAssignLoading(false);
    }
  };

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
                <div key={record._id} className="py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-base text-foreground">{record.weight} kg</span>
                      <span className="text-xs text-muted-foreground">({formatDate(record.analysisDate)})</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                      <p>BMI: <span className="font-semibold text-foreground">{record.bmi}</span> ({record.bmiCategory})</p>
                      <p className="flex items-center gap-1">
                        <Utensils className="h-3.5 w-3.5 text-primary" />
                        <span>Diet: <span className="font-medium text-foreground">{(record.dietPlanId as any)?.name || "Not Assigned"}</span></span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {(role === "staff" || role === "owner") && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setAssigningBmiId(record._id);
                          setSelectedDietId((record.dietPlanId as any)?._id || record.dietPlanId || "");
                        }}
                        className="text-[11px] h-8 px-2.5 flex items-center gap-1 hover:bg-primary/5 border-primary/20 text-primary"
                      >
                        <Utensils className="h-3.5 w-3.5" /> Assign Diet
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadReport(record._id)}
                      disabled={downloadingRecordId === record._id}
                      className="text-[11px] h-8 px-2.5 flex items-center gap-1"
                    >
                      {downloadingRecordId === record._id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      Report
                    </Button>

                    {(role === "staff" || role === "owner") && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEmailReport(record._id)}
                        disabled={emailingRecordId === record._id}
                        className="text-[11px] h-8 px-2.5 flex items-center gap-1"
                      >
                        {emailingRecordId === record._id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Mail className="h-3.5 w-3.5" />
                        )}
                        Email
                      </Button>
                    )}
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

      {/* Assign Diet Modal */}
      {assigningBmiId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-lg border shadow-lg max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Utensils className="h-5 w-5 text-primary" /> Assign Diet Plan
              </h3>
              <form onSubmit={handleAssignDiet} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="modal-diet-plan">Select Diet Template</Label>
                  <select
                    id="modal-diet-plan"
                    value={selectedDietId}
                    onChange={(e) => setSelectedDietId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">-- No Diet Plan --</option>
                    {dietPlans.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} {p.isVegetarian ? "(Veg)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2 border-t pt-4">
                  <Button variant="outline" type="button" onClick={() => setAssigningBmiId(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={assignLoading}>
                    {assignLoading ? "Saving..." : "Save Assignment"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
