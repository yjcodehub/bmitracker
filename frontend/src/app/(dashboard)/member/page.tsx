'use client';

import { useEffect, useState } from 'react';
import { Scale, Activity, Target, TrendingDown } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MemberProgressCharts } from '@/components/charts/MemberProgressCharts';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';
import { BMIRecord } from '@/types';

export default function MemberDashboard() {
  const user = useAuthStore((s) => s.user);
  const [latest, setLatest] = useState<BMIRecord | null>(null);
  const [records, setRecords] = useState<BMIRecord[]>([]);

  const memberId = user?.memberId?._id;

  useEffect(() => {
    if (!memberId) return;

    api.get<BMIRecord[]>(`/bmi/member/${memberId}?limit=30`)
      .then((res) => {
        const historyRecords = res.data;
        if (historyRecords.length > 0) setLatest(historyRecords[0]);
        setRecords(Array.isArray(historyRecords) ? historyRecords : []);
      })
      .catch(console.error);
  }, [memberId]);

  const getGoalProgress = () => {
    const m = user?.memberId;
    if (!m) return "—";
    
    const ideal = m.idealWeight;
    const current = latest ? latest.weight : m.currentWeight;
    
    if (ideal) {
      if (current <= ideal) {
        return "Goal Achieved! 🎉";
      }
      const diff = current - ideal;
      return `${diff.toFixed(1)} kg remaining`;
    }
    
    if (m.weightLossGoal) {
      return `Goal: Lose ${m.weightLossGoal} kg`;
    }
    
    return "No goal set";
  };

  const goalProgress = getGoalProgress();

  return (
    <div>
      <PageHeader
        title={`Hello, ${user?.memberId?.fullName || 'Member'}`}
        subtitle="Your progress at a glance"
      />

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard title="Current Weight" value={latest ? `${latest.weight} kg` : '—'} icon={Scale} />
        <StatCard title="Current BMI" value={latest?.bmi ?? '—'} icon={Activity} />
        <StatCard title="BMI Category" value={latest?.bmiCategory ?? '—'} icon={TrendingDown} />
        <StatCard title="Goal Progress" value={goalProgress} icon={Target} />
      </div>

      <div className="mb-6 animate-in fade-in duration-300">
        <MemberProgressCharts records={records} />
      </div>

      {latest && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Latest Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Body Fat</span>
              <span>{latest.bodyComposition.bodyFatPercent}% ({latest.bodyComposition.bodyFatStatus})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Muscle Mass</span>
              <span>{latest.bodyComposition.muscleMass} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Visceral Fat</span>
              <span>{latest.bodyComposition.visceralFat} ({latest.bodyComposition.visceralFatStatus})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">BMR</span>
              <span>{latest.bodyComposition.bmr} kcal</span>
            </div>
            <p className="pt-2 text-muted-foreground">{latest.suggestedAction}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
