'use client';

import { useEffect, useState } from 'react';
import { Scale, Activity, Target, TrendingDown, Droplet, Plus, RotateCcw, Flame, Info, Trophy } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';
import { BMIRecord } from '@/types';

export default function MemberDashboard() {
  const user = useAuthStore((s) => s.user);
  const [latest, setLatest] = useState<BMIRecord | null>(null);
  const [records, setRecords] = useState<BMIRecord[]>([]);
  const [waterIntake, setWaterIntake] = useState(0);
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [showCongrats, setShowCongrats] = useState(false);

  const memberId = user?.memberId?._id;

  // Helper to parse water goal from string (e.g. "3-4 litres" -> 4000ml, "3.5L" -> 3500ml)
  const parseWaterGoal = (goalString?: string): number => {
    if (!goalString) return 4000;
    const matches = goalString.match(/\d+(\.\d+)?/g);
    if (!matches || matches.length === 0) return 4000;
    const values = matches.map(Number);
    const maxVal = Math.max(...values);
    if (/litre|liter|l/i.test(goalString)) {
      return maxVal * 1000;
    }
    if (/ml/i.test(goalString)) {
      return maxVal;
    }
    return maxVal > 10 ? maxVal : maxVal * 1000;
  };

  const waterGoal = latest?.dietPlanId ? parseWaterGoal((latest.dietPlanId as any).waterIntakeGoal) : 4000;

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

  // Load and save daily water intake
  useEffect(() => {
    if (!memberId) return;
    const todayKey = `water_intake_${memberId}_${new Date().toDateString()}`;
    const saved = localStorage.getItem(todayKey);
    if (saved) {
      setWaterIntake(parseInt(saved, 10));
    } else {
      setWaterIntake(0);
    }
  }, [memberId]);

  const addWater = (amount: number) => {
    if (!memberId) return;
    const todayKey = `water_intake_${memberId}_${new Date().toDateString()}`;
    const newAmount = Math.min(6000, waterIntake + amount);
    
    // Trigger congratulations if just reaching or crossing the waterGoal
    if (waterIntake < waterGoal && newAmount >= waterGoal) {
      setShowCongrats(true);
    }

    setWaterIntake(newAmount);
    localStorage.setItem(todayKey, String(newAmount));
  };

  const resetWater = () => {
    if (!memberId) return;
    const todayKey = `water_intake_${memberId}_${new Date().toDateString()}`;
    setWaterIntake(0);
    localStorage.setItem(todayKey, '0');
  };

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

  // Calorie Calculation Logic (Mifflin-St Jeor Equation)
  const getCalorieBudget = () => {
    const w = latest?.weight || user?.memberId?.currentWeight || 0;
    const h = latest?.height || user?.memberId?.height || 0;
    const age = user?.memberId?.age || 25;
    const gender = user?.memberId?.gender || 'male';

    if (!w || !h) return { bmr: 0, tdee: 0, deficit: 0, surplus: 0 };

    let bmr = 0;
    if (gender === 'male') {
      bmr = 10 * w + 6.25 * h - 5 * age + 5;
    } else {
      bmr = 10 * w + 6.25 * h - 5 * age - 161;
    }

    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
    };

    const multiplier = activityMultipliers[activityLevel] || 1.2;
    const tdee = bmr * multiplier;

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      deficit: Math.max(1200, Math.round(tdee - 500)), // Safe floor of 1200 kcal
      surplus: Math.round(tdee + 300),
    };
  };

  const calories = getCalorieBudget();
  const waterPct = Math.min(100, Math.round((waterIntake / waterGoal) * 100));

  return (
    <div className="space-y-6 pb-20">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes wave-front {
          0% { transform: translate3d(0, 50%, 0); }
          100% { transform: translate3d(-50%, 50%, 0); }
        }
        @keyframes wave-back {
          0% { transform: translate3d(-50%, 50%, 0); }
          100% { transform: translate3d(0, 50%, 0); }
        }
        .water-wave-front {
          animation: wave-front 4s linear infinite;
        }
        .water-wave-back {
          animation: wave-back 6s linear infinite;
        }
      `}} />
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

      {/* Interactive Dashboard Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        
        {/* Water Intake Tracker */}
        <Card className="border border-border shadow-sm bg-card hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Droplet className="h-5 w-5 text-blue-500 fill-blue-500" /> Daily Water Tracker
            </CardTitle>
            <CardDescription className="text-xs">
              Log your water intake to stay hydrated. Recommended: {waterGoal / 1000}L.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 flex flex-col sm:flex-row items-center gap-6">
            {/* Visual Glass/Cup fill */}
            <div className="relative h-28 w-28 rounded-full border-4 border-muted overflow-hidden flex items-center justify-center bg-muted/20 shrink-0 shadow-inner">
              <div 
                className="absolute bottom-0 left-0 right-0 bg-blue-500/35 transition-all duration-1000 ease-out"
                style={{ height: `${waterPct}%` }}
              >
                {/* Foreground Wave */}
                <div 
                  className="absolute bottom-full left-0 w-[200%] h-3 pointer-events-none water-wave-front"
                  style={{
                    opacity: waterPct === 0 ? 0 : 1,
                    transition: 'opacity 0.5s ease',
                  }}
                >
                  <svg className="w-full h-full fill-blue-500/35" viewBox="0 0 200 20" preserveAspectRatio="none">
                    <path d="M 0 10 Q 25 0, 50 10 T 100 10 T 150 10 T 200 10 L 200 20 L 0 20 Z" />
                  </svg>
                </div>
                {/* Background Wave */}
                <div 
                  className="absolute bottom-full left-0 w-[200%] h-3 pointer-events-none water-wave-back"
                  style={{
                    opacity: waterPct === 0 ? 0 : 0.6,
                    transition: 'opacity 0.5s ease',
                  }}
                >
                  <svg className="w-full h-full fill-blue-400/25" viewBox="0 0 200 20" preserveAspectRatio="none">
                    <path d="M 0 10 Q 25 20, 50 10 T 100 10 T 150 10 T 200 10 L 200 20 L 0 20 Z" />
                  </svg>
                </div>
              </div>
              <div className="relative z-10 flex flex-col items-center">
                <Droplet className="h-6 w-6 text-blue-500 fill-blue-500 animate-pulse" />
                <span className="text-sm font-extrabold text-foreground mt-1">{waterIntake} ml</span>
                <span className="text-[10px] text-muted-foreground font-semibold">Goal: {waterPct}%</span>
              </div>
            </div>

            {/* Quick buttons */}
            <div className="flex-1 w-full space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => addWater(250)}
                  className="flex items-center justify-center gap-1.5 h-10 text-xs rounded-xl"
                >
                  <Plus className="h-3.5 w-3.5" /> +250 ml
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => addWater(500)}
                  className="flex items-center justify-center gap-1.5 h-10 text-xs rounded-xl"
                >
                  <Plus className="h-3.5 w-3.5" /> +500 ml
                </Button>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium">Daily target: {waterGoal} ml</span>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm" 
                  onClick={resetWater}
                  className="text-muted-foreground hover:text-rose-500 h-8 px-2.5 rounded-lg flex items-center gap-1 text-[11px]"
                >
                  <RotateCcw className="h-3 w-3" /> Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calorie Intake Budget (TDEE Calculator Widget) */}
        <Card className="border border-border shadow-sm bg-card hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Flame className="h-5 w-5 text-primary fill-primary" /> Daily Calorie Budget
            </CardTitle>
            <CardDescription className="text-xs">
              Estimates based on your latest weight, height, and age parameters.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-1 space-y-4">
            {calories.bmr > 0 ? (
              <>
                {/* Activity Dropdown */}
                <div className="flex items-center justify-between gap-3 bg-muted/40 p-2.5 rounded-xl border border-border/60">
                  <Label htmlFor="activity-level" className="text-xs font-semibold flex items-center gap-1 shrink-0">
                    <Activity className="h-3.5 w-3.5 text-primary" /> Activity Level
                  </Label>
                  <select
                    id="activity-level"
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value)}
                    className="flex h-9 rounded-lg border border-input bg-background px-2.5 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="sedentary">Sedentary (Little or no exercise)</option>
                    <option value="light">Lightly Active (1-3 days/week)</option>
                    <option value="moderate">Moderately Active (3-5 days/week)</option>
                    <option value="active">Very Active (6-7 days/week)</option>
                  </select>
                </div>

                {/* Targets Grid */}
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <div className="p-2.5 bg-muted/30 border border-border/50 rounded-xl text-center">
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Weight Loss</span>
                    <p className="text-sm font-extrabold text-emerald-600 mt-1">{calories.deficit} kcal</p>
                  </div>
                  <div className="p-2.5 bg-muted/30 border border-border/50 rounded-xl text-center">
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Maintenance</span>
                    <p className="text-sm font-extrabold text-foreground mt-1">{calories.tdee} kcal</p>
                  </div>
                  <div className="p-2.5 bg-muted/30 border border-border/50 rounded-xl text-center">
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Muscle Gain</span>
                    <p className="text-sm font-extrabold text-primary mt-1">{calories.surplus} kcal</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-muted/20 border border-dashed rounded-xl text-xs text-muted-foreground">
                <Info className="h-4 w-4 shrink-0 text-amber-500" />
                Please register your weight and height in your profile details to calculate your custom calorie targets.
              </div>
            )}
          </CardContent>
        </Card>

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

      {/* Congratulations Modal */}
      {showCongrats && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes firework-burst {
              0% { transform: scale(0.1); opacity: 0; }
              50% { opacity: 1; }
              100% { transform: scale(1.8); opacity: 0; }
            }
            @keyframes float-ribbon {
              0% { transform: translateY(100px) rotate(0deg); opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { transform: translateY(-500px) rotate(720deg); opacity: 0; }
            }
            .firework {
              position: absolute;
              width: 12px;
              height: 12px;
              border-radius: 50%;
              animation: firework-burst 1.8s ease-out infinite;
            }
            .ribbon {
              position: absolute;
              width: 6px;
              height: 18px;
              opacity: 0;
              animation: float-ribbon 4s linear infinite;
            }
          `}} />

          {/* Confetti Container */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="firework bg-rose-500" style={{ left: '20%', top: '30%', animationDelay: '0.1s' }} />
            <div className="firework bg-amber-400" style={{ left: '80%', top: '25%', animationDelay: '0.6s' }} />
            <div className="firework bg-emerald-500" style={{ left: '15%', top: '70%', animationDelay: '1.2s' }} />
            <div className="firework bg-blue-500" style={{ left: '75%', top: '65%', animationDelay: '0.4s' }} />
            <div className="firework bg-purple-500" style={{ left: '50%', top: '20%', animationDelay: '0.9s' }} />

            <div className="ribbon bg-amber-400 rounded-sm" style={{ left: '10%', bottom: '0', animationDelay: '0s' }} />
            <div className="ribbon bg-rose-400 rounded-sm" style={{ left: '30%', bottom: '0', animationDelay: '0.7s' }} />
            <div className="ribbon bg-emerald-400 rounded-sm" style={{ left: '50%', bottom: '0', animationDelay: '1.5s' }} />
            <div className="ribbon bg-blue-400 rounded-sm" style={{ left: '70%', bottom: '0', animationDelay: '2.1s' }} />
            <div className="ribbon bg-purple-400 rounded-sm" style={{ left: '90%', bottom: '0', animationDelay: '1.1s' }} />
          </div>

          {/* Modal Card */}
          <div className="relative bg-background border border-primary/20 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <Trophy className="h-8 w-8 text-primary animate-bounce" />
            </div>
            <h3 className="text-2xl font-extrabold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              Goal Achieved! 🎉
            </h3>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              Congratulations! You've reached your daily hydration target of <span className="font-bold text-foreground">{(waterGoal / 1000).toFixed(1)}L</span> today.
            </p>
            <p className="text-[11px] text-muted-foreground/75 mt-1 italic">
              Proper hydration supports metabolic rate, muscle recovery, and energy balance.
            </p>
            <Button 
              type="button" 
              onClick={() => setShowCongrats(false)}
              className="mt-6 w-full h-11 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-md"
            >
              Keep it up!
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
