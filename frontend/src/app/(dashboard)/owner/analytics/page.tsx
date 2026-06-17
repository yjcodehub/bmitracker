"use client";

import { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  Activity,
  Calendar,
  UserCog,
  Award,
  Info,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Sparkles,
  ShieldAlert,
  Loader2
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BMIDistributionChart } from "@/components/charts/BMIDistributionChart";
import { WeightTrendChart } from "@/components/charts/WeightTrendChart";
import { MemberGrowthChart } from "@/components/charts/MemberGrowthChart";
import { api } from "@/lib/api";
import { DashboardStats, Trainer, Member } from "@/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function OwnerAnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bmiDist, setBmiDist] = useState<{ category: string; count: number }[]>([]);
  const [weightTrends, setWeightTrends] = useState<{ date: string; avgWeight: number }[]>([]);
  const [memberGrowth, setMemberGrowth] = useState<{ _id: { year: number; month: number }; count: number }[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState<number>(30); // 7, 30, 90, 180 days

  const fetchAnalyticsData = async (showRefreshToast = false) => {
    if (showRefreshToast) setRefreshing(true);
    else setLoading(true);

    try {
      const [dashRes, distRes, trendsRes, growthRes, trainersRes, membersRes] = await Promise.all([
        api.get<DashboardStats>("/analytics/dashboard"),
        api.get<{ category: string; count: number }[]>("/analytics/bmi-distribution"),
        api.get<{ date: string; avgWeight: number }[]>(`/analytics/weight-trends?days=${timeframe}`),
        api.get<{ _id: { year: number; month: number }; count: number }[]>("/analytics/member-growth"),
        api.get<Trainer[]>("/trainers?limit=100"),
        api.get<Member[]>("/members?limit=100&role=member")
      ]);

      setStats(dashRes.data);
      setBmiDist(distRes.data || []);
      setWeightTrends(trendsRes.data || []);
      setMemberGrowth(growthRes.data || []);
      setTrainers(trainersRes.data || []);
      setMembers(membersRes.data || []);

      if (showRefreshToast) {
        toast.success("Analytics data refreshed successfully!");
      }
    } catch (err) {
      console.error("Failed to load analytics data:", err);
      toast.error("Failed to refresh analytics dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeframe]);

  // Derived Performance Metrics
  const activeRate = stats?.totalMembers ? Math.round((stats.activeMembers / stats.totalMembers) * 100) : 0;
  const scanCoverage = stats?.activeMembers ? Math.round((stats.monthlyAnalyses / stats.activeMembers) * 100) : 0;
  const staffRatio = stats?.totalStaff && stats?.activeMembers ? Math.round(stats.activeMembers / stats.totalStaff) : 0;

  const totalBmiRecords = bmiDist.reduce((acc, curr) => acc + curr.count, 0);
  const normalBmiCount = bmiDist.find((d) => d.category.toLowerCase() === "normal")?.count || 0;
  const gymSuccessRate = totalBmiRecords > 0 ? Math.round((normalBmiCount / totalBmiRecords) * 100) : 0;

  // Calculate Trainer Workloads
  const trainerWorkloads = trainers.map((trainer) => {
    const assignedMembers = members.filter((m) => m.trainerId === trainer._id);
    const count = assignedMembers.length;
    let statusLabel: "Idle" | "Optimal" | "Busy" | "Overloaded" = "Idle";
    let statusClass = "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-400 border-slate-200 dark:border-slate-800";
    
    if (count > 20) {
      statusLabel = "Overloaded";
      statusClass = "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border-red-200/50 dark:border-red-900/50";
    } else if (count > 10) {
      statusLabel = "Busy";
      statusClass = "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/50";
    } else if (count > 0) {
      statusLabel = "Optimal";
      statusClass = "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/50";
    }

    return {
      ...trainer,
      count,
      statusLabel,
      statusClass,
    };
  });

  // Insights Generator
  const getInsights = () => {
    const insights = [];
    const totalBmi = bmiDist.reduce((acc, c) => acc + c.count, 0);
    const overweightObeseCount = bmiDist
      .filter((c) => ["overweight", "obese", "obese class 1", "obese class 2", "obese class 3"].includes(c.category.toLowerCase()))
      .reduce((acc, c) => acc + c.count, 0);
    const overweightObeseRate = totalBmi > 0 ? (overweightObeseCount / totalBmi) * 100 : 0;

    const underweightCount = bmiDist
      .filter((c) => c.category.toLowerCase() === "underweight")
      .reduce((acc, c) => acc + c.count, 0);
    const underweightRate = totalBmi > 0 ? (underweightCount / totalBmi) * 100 : 0;

    if (overweightObeseRate > 50) {
      insights.push({
        title: "Targeted Weight-Loss Required",
        text: `${Math.round(overweightObeseRate)}% of your diagnosed member community are Overweight or Obese. We recommend promoting targeted weight-loss packages, cardio classes, and assigning calorie-restricted diet plan templates.`,
        type: "warning",
        icon: AlertTriangle,
        color: "text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/40 bg-orange-50/50 dark:bg-orange-950/10",
      });
    }

    if (underweightRate > 15) {
      insights.push({
        title: "Muscle-Gain Template Demand",
        text: `${Math.round(underweightRate)}% of diagnosed members are underweight. Encourage trainers to design high-protein dietary programs and hypertrophy templates to assist their progress.`,
        type: "info",
        icon: Info,
        color: "text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/10",
      });
    }

    if (scanCoverage < 50) {
      insights.push({
        title: "Boost Diagnostic Scan Coverage",
        text: `Diagnostic scanner usage is currently at ${scanCoverage}%. Regular monthly assessments keep members motivated and lower churn. Encourage staff to schedule assessments during member sessions.`,
        type: "caution",
        icon: ShieldAlert,
        color: "text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/10",
      });
    }

    if (gymSuccessRate > 60) {
      insights.push({
        title: "Excellent Gym Outcomes",
        text: `Outstanding work! ${gymSuccessRate}% of members maintain a healthy 'Normal' BMI category. Highlight these operational statistics in your social media and landing pages to boost acquisitions.`,
        type: "success",
        icon: CheckCircle2,
        color: "text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/10",
      });
    }

    if (insights.length === 0) {
      insights.push({
        title: "Stable Health Trends",
        text: "Gym health metrics and member diagnostic records are balanced. Scan coverage and body weight trends are within target healthy performance margins.",
        type: "info",
        icon: Info,
        color: "text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20",
      });
    }

    return insights;
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Analyzing gym matrices...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <PageHeader
          title="Gym Business Analytics"
          subtitle="Real-time dashboard for fitness health, acquisition ratios, and operational workloads."
        />
        <Button
          onClick={() => fetchAnalyticsData(true)}
          disabled={refreshing}
          variant="outline"
          size="sm"
          className="w-full sm:w-auto h-10 font-medium flex items-center justify-center gap-2 border shadow-sm rounded-xl px-4 hover:bg-muted/50 transition-colors"
        >
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </Button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Retention */}
        <Card className="relative overflow-hidden border/80 bg-card/60 backdrop-blur-md hover:shadow-md transition-shadow rounded-2xl">
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Engagement</span>
              <CardTitle className="text-2xl font-bold font-sans mt-1">
                {activeRate}%
              </CardTitle>
            </div>
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <UserCheck className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${activeRate}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center justify-between">
              <span>{stats?.activeMembers} active members</span>
              <span className="font-medium">{stats?.totalMembers} total</span>
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Analysis Scan Coverage */}
        <Card className="relative overflow-hidden border/80 bg-card/60 backdrop-blur-md hover:shadow-md transition-shadow rounded-2xl">
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Scan Coverage</span>
              <CardTitle className={cn("text-2xl font-bold font-sans mt-1", scanCoverage < 50 ? "text-rose-500" : "text-emerald-500")}>
                {scanCoverage}%
              </CardTitle>
            </div>
            <div className={cn("p-2.5 rounded-xl", scanCoverage < 50 ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500")}>
              <Activity className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className={cn("h-1.5 rounded-full transition-all duration-500", scanCoverage < 50 ? "bg-rose-500" : "bg-emerald-500")}
                style={{ width: `${Math.min(100, scanCoverage)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center justify-between">
              <span>{stats?.monthlyAnalyses} scans this month</span>
              <span className="font-semibold text-[10px] uppercase">{scanCoverage < 50 ? "⚠️ Scan coverage low" : "Optimal"}</span>
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Gym Success Rate */}
        <Card className="relative overflow-hidden border/80 bg-card/60 backdrop-blur-md hover:shadow-md transition-shadow rounded-2xl">
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Gym Success Rate</span>
              <CardTitle className="text-2xl font-bold font-sans mt-1 text-primary">
                {gymSuccessRate}%
              </CardTitle>
            </div>
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Award className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${gymSuccessRate}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center justify-between">
              <span>{normalBmiCount} normal BMI members</span>
              <span className="font-medium">{totalBmiRecords} mapped</span>
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Staff Coverage */}
        <Card className="relative overflow-hidden border/80 bg-card/60 backdrop-blur-md hover:shadow-md transition-shadow rounded-2xl">
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Staff Ratio</span>
              <CardTitle className="text-2xl font-bold font-sans mt-1">
                {staffRatio || "—"}:1
              </CardTitle>
            </div>
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <UserCog className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (staffRatio / 50) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center justify-between">
              <span>{stats?.totalStaff} active trainers</span>
              <span className="font-medium">Avg workload</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Insights Alerts Panel */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          <span>Operational Insights & System Recommendations</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {getInsights().map((insight, idx) => (
            <div
              key={idx}
              className={cn(
                "p-4 rounded-2xl border flex gap-3 text-sm transition-all duration-300 hover:-translate-y-0.5",
                insight.color
              )}
            >
              <div className="mt-0.5">
                <insight.icon className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="font-bold">{insight.title}</p>
                <p className="text-xs leading-relaxed opacity-90">{insight.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weight Loss Trends Area Chart */}
        <Card className="lg:col-span-2 border/80 bg-card/60 backdrop-blur-md rounded-2xl">
          <CardHeader className="flex flex-row justify-between items-start p-6 pb-2">
            <div>
              <CardTitle className="text-lg font-bold">Gym-Wide Weight Trends</CardTitle>
              <CardDescription className="text-xs">
                Average member weight trajectories over selected timeline.
              </CardDescription>
            </div>
            <div className="flex items-center gap-1 bg-muted p-1 rounded-xl">
              {[
                { label: "7d", val: 7 },
                { label: "30d", val: 30 },
                { label: "90d", val: 90 },
                { label: "180d", val: 180 },
              ].map((t) => (
                <button
                  key={t.val}
                  onClick={() => setTimeframe(t.val)}
                  className={cn(
                    "text-xs px-2.5 py-1 rounded-lg font-medium transition-colors",
                    timeframe === t.val ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-4">
            <WeightTrendChart data={weightTrends} />
          </CardContent>
        </Card>

        {/* BMI Distribution Donut */}
        <Card className="border/80 bg-card/60 backdrop-blur-md rounded-2xl">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-lg font-bold">BMI Group Statistics</CardTitle>
            <CardDescription className="text-xs">
              Current members distribution by body composition records.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            <BMIDistributionChart data={bmiDist} />
            <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] text-muted-foreground pt-4 border-t">
              {bmiDist.map((item, index) => {
                const pct = totalBmiRecords > 0 ? Math.round((item.count / totalBmiRecords) * 100) : 0;
                return (
                  <div key={index} className="flex items-center justify-between bg-muted/30 p-1.5 rounded-lg border border-border/40">
                    <span className="capitalize truncate font-medium max-w-[70px]">{item.category}</span>
                    <span className="font-bold text-foreground">{item.count} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Member Growth & Trainer Distribution Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Sign-Ups Growth Bar Chart */}
        <Card className="border/80 bg-card/60 backdrop-blur-md rounded-2xl">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-lg font-bold">Monthly Sign-ups Growth</CardTitle>
            <CardDescription className="text-xs">
              Enrolled accounts count per month trajectory.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-4">
            <MemberGrowthChart data={memberGrowth} />
          </CardContent>
        </Card>

        {/* Trainer Workload Performance Table */}
        <Card className="lg:col-span-2 border/80 bg-card/60 backdrop-blur-md rounded-2xl overflow-hidden">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-lg font-bold">Trainer Workload & Distribution Hub</CardTitle>
            <CardDescription className="text-xs">
              Allocated client ratios, active specialties, and load statuses.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse text-left">
                <thead>
                  <tr className="border-y bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                    <th className="py-3 px-6">Trainer Name</th>
                    <th className="py-3 px-6">Specialty</th>
                    <th className="py-3 px-6">Email / Contact</th>
                    <th className="py-3 px-6 text-center">Active Clients</th>
                    <th className="py-3 px-6 text-right">Load Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {trainerWorkloads.map((t) => (
                    <tr key={t._id} className="hover:bg-muted/10 transition-colors">
                      <td className="py-3 px-6 font-bold text-foreground">{t.name}</td>
                      <td className="py-3 px-6">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {t.specialization || "General Trainer"}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-xs text-muted-foreground">{t.email || "No email"}</td>
                      <td className="py-3 px-6 text-center font-semibold font-sans">{t.count}</td>
                      <td className="py-3 px-6 text-right">
                        <span className={cn("text-[10px] font-bold px-2 py-1 rounded-lg border", t.statusClass)}>
                          {t.statusLabel}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {trainerWorkloads.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground text-xs">
                        No trainers registered in your system. Navigate to Settings &gt; Trainers to add.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
