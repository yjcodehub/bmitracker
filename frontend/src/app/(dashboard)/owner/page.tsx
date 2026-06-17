'use client';

import { useEffect, useState } from 'react';
import { Users, UserCheck, Activity, Calendar, UserCog, UserPlus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BMIDistributionChart } from '@/components/charts/BMIDistributionChart';
import { WeightTrendChart } from '@/components/charts/WeightTrendChart';
import { MemberGrowthChart } from '@/components/charts/MemberGrowthChart';
import { api } from '@/lib/api';
import { DashboardStats } from '@/types';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function OwnerDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bmiDist, setBmiDist] = useState<{ category: string; count: number }[]>([]);
  const [weightTrends, setWeightTrends] = useState<{ date: string; avgWeight: number }[]>([]);
  const [memberGrowth, setMemberGrowth] = useState<{ _id: { year: number; month: number }; count: number }[]>([]);

  // Confirmation Modal States
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [memberToApprove, setMemberToApprove] = useState<string | null>(null);

  const fetchDashboardStats = () => {
    Promise.all([
      api.get<DashboardStats>('/analytics/dashboard'),
      api.get<{ category: string; count: number }[]>('/analytics/bmi-distribution'),
      api.get<{ date: string; avgWeight: number }[]>('/analytics/weight-trends'),
      api.get<{ _id: { year: number; month: number }; count: number }[]>('/analytics/member-growth'),
    ]).then(([dash, dist, trends, growth]) => {
      setStats(dash.data);
      setBmiDist(dist.data);
      setWeightTrends(trends.data);
      setMemberGrowth(growth.data || []);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleApproveClick = (id: string) => {
    setMemberToApprove(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!memberToApprove) return;
    try {
      await api.post(`/members/${memberToApprove}/approve`);
      fetchDashboardStats();
    } catch (err) {
      console.error("Failed to approve member:", err);
    } finally {
      setIsConfirmOpen(false);
      setMemberToApprove(null);
    }
  };

  return (
    <div>
      <PageHeader title="Owner Dashboard" subtitle="Gym overview and analytics" />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <StatCard title="Total Members" value={stats?.totalMembers ?? '—'} icon={Users} />
        <StatCard title="Active Members" value={stats?.activeMembers ?? '—'} icon={UserCheck} />
        <StatCard title="Today's Analyses" value={stats?.todayAnalyses ?? '—'} icon={Activity} />
        <StatCard title="Monthly Analyses" value={stats?.monthlyAnalyses ?? '—'} icon={Calendar} />
        <StatCard title="Total Staff" value={stats?.totalStaff ?? '—'} icon={UserCog} />
        <StatCard title="New Registrations" value={stats?.recentRegistrations?.length ?? '—'} icon={UserPlus} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">BMI Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <BMIDistributionChart data={bmiDist} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weight Loss Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <WeightTrendChart data={weightTrends} />
          </CardContent>
        </Card>
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Member Growth (Monthly)</CardTitle>
          </CardHeader>
          <CardContent>
            <MemberGrowthChart data={memberGrowth} />
          </CardContent>
        </Card>
      </div>

      {stats?.recentRegistrations && stats.recentRegistrations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Registrations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recentRegistrations.map((m) => (
              <div key={m._id} className="flex justify-between items-center py-2 border-b last:border-0">
                <div>
                  <p className="font-medium">{m.fullName}</p>
                  <p className="text-xs text-muted-foreground">{m.membershipNumber}</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">{formatDate(m.registrationDate)}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">{m.status.replace('_', ' ')}</span>
                  </div>
                  {m.status === "pending_approval" && (
                    <Button
                      size="sm"
                      onClick={() => handleApproveClick(m._id)}
                      className="bg-green-600 hover:bg-green-700 text-white text-[10px] h-7 px-2 rounded-lg font-bold"
                    >
                      Approve
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-background rounded-2xl border border-border/80 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-foreground">Approve Member Registration</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Are you sure you want to approve this member? This will activate their account and grant them access to the gym portal.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsConfirmOpen(false);
                    setMemberToApprove(null);
                  }}
                  className="rounded-xl h-9 px-4 font-semibold text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirmApprove}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl h-9 px-4 text-xs"
                >
                  Approve Member
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
