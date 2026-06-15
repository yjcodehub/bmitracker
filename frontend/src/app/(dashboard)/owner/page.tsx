'use client';

import { useEffect, useState } from 'react';
import { Users, UserCheck, Activity, Calendar, UserCog, UserPlus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BMIDistributionChart } from '@/components/charts/BMIDistributionChart';
import { WeightTrendChart } from '@/components/charts/WeightTrendChart';
import { api } from '@/lib/api';
import { DashboardStats } from '@/types';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function OwnerDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bmiDist, setBmiDist] = useState<{ category: string; count: number }[]>([]);
  const [weightTrends, setWeightTrends] = useState<{ date: string; avgWeight: number }[]>([]);

  const fetchDashboardStats = () => {
    Promise.all([
      api.get<DashboardStats>('/analytics/dashboard'),
      api.get<{ category: string; count: number }[]>('/analytics/bmi-distribution'),
      api.get<{ date: string; avgWeight: number }[]>('/analytics/weight-trends'),
    ]).then(([dash, dist, trends]) => {
      setStats(dash.data);
      setBmiDist(dist.data);
      setWeightTrends(trends.data);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleApprove = async (id: string) => {
    if (!confirm("Are you sure you want to approve this member?")) return;
    try {
      await api.post(`/members/${id}/approve`);
      fetchDashboardStats();
    } catch (err) {
      console.error("Failed to approve member:", err);
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

      <div className="grid md:grid-cols-2 gap-4 mb-6">
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
                      onClick={() => handleApprove(m._id)}
                      className="bg-green-600 hover:bg-green-700 text-white text-[10px] h-7 px-2"
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
    </div>
  );
}
