"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, Users, Clock, Plus, UserPlus, FileText, ChevronRight, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

interface StaffStats {
  totalMembers: number;
  pendingMembers: number;
  todayAnalyses: number;
  recentAnalyses: Array<{
    _id: string;
    memberId: {
      _id: string;
      fullName: string;
      membershipNumber: string;
    };
    weight: number;
    bmi: number;
    bmiCategory: string;
    analysisDate: string;
  }>;
}

export default function StaffDashboard() {
  const [stats, setStats] = useState<StaffStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<StaffStats>("/analytics/staff-dashboard")
      .then((res) => {
        setStats(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Staff Portal" subtitle="Today's overview" />

      <div className="grid grid-cols-3 gap-3">
        <StatCard title="Today's Analyses" value={stats?.todayAnalyses ?? 0} icon={Activity} />
        <StatCard title="Total Members" value={stats?.totalMembers ?? 0} icon={Users} />
        <StatCard title="Pending Approvals" value={stats?.pendingMembers ?? 0} icon={Clock} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-3">
          <Button asChild variant="outline" className="flex-col h-auto py-4 gap-2">
            <Link href="/staff/bmi/new">
              <Plus className="h-5 w-5 text-primary" />
              <span className="text-xs">Add BMI</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-col h-auto py-4 gap-2">
            <Link href="/staff/members/new">
              <UserPlus className="h-5 w-5 text-primary" />
              <span className="text-xs">Add Member</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-col h-auto py-4 gap-2">
            <Link href="/staff/members?status=pending_approval">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-xs">View Pending</span>
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Analyses</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {stats?.recentAnalyses && stats.recentAnalyses.length > 0 ? (
            <div className="divide-y">
              {stats.recentAnalyses.map((rec) => (
                <Link key={rec._id} href={`/staff/members/${rec.memberId?._id}`} className="block">
                  <div className="p-4 flex justify-between items-center hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-semibold text-sm">{rec.memberId?.fullName || "Unknown Member"}</p>
                      <p className="text-xs text-muted-foreground">
                        {rec.memberId?.membershipNumber} · {rec.weight} kg
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <p className="text-sm font-semibold">BMI: {rec.bmi}</p>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                          {rec.bmiCategory}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">
              No analyses recorded yet. Click &quot;Add BMI&quot; to get started.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
