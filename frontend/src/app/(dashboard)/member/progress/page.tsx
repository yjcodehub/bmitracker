"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  ArrowLeft,
  Scale,
  Activity,
  Trophy,
  Award,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Flame,
  Heart,
  TrendingDown,
  Lock,
  CheckCircle2,
  Info
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MemberProgressCharts } from "@/components/charts/MemberProgressCharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import { BMIRecord } from "@/types";
import { FitnessLoader } from "@/components/ui/FitnessLoader";
import { formatDate } from "@/lib/utils";

interface Milestone {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: React.ReactNode;
}

export default function MemberProgressPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const memberId = user?.memberId?._id;

  const [records, setRecords] = useState<BMIRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);

  useEffect(() => {
    if (!memberId) return;

    setLoading(true);
    api.get<BMIRecord[]>(`/bmi/member/${memberId}?limit=100`)
      .then((res) => {
        setRecords(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Error fetching progress records:", err);
      })
      .finally(() => setLoading(false));
  }, [memberId]);

  const toggleExpandRecord = (id: string) => {
    setExpandedRecordId(expandedRecordId === id ? null : id);
  };

  // Helper calculations for Comparison
  const getProgressComparison = () => {
    if (records.length < 2) return null;

    // Sort chronologically ascending to find first and latest
    const sorted = [...records].sort((a, b) => new Date(a.analysisDate).getTime() - new Date(b.analysisDate).getTime());
    const first = sorted[0];
    const latest = sorted[sorted.length - 1];

    const weightDiff = latest.weight - first.weight;
    const bmiDiff = latest.bmi - first.bmi;

    const firstFat = first.bodyComposition?.bodyFatPercent || 0;
    const latestFat = latest.bodyComposition?.bodyFatPercent || 0;
    const fatDiff = latestFat - firstFat;

    const firstMuscle = first.bodyComposition?.muscleMass || 0;
    const latestMuscle = latest.bodyComposition?.muscleMass || 0;
    const muscleDiff = latestMuscle - firstMuscle;

    return {
      first,
      latest,
      weightDiff: parseFloat(weightDiff.toFixed(1)),
      bmiDiff: parseFloat(bmiDiff.toFixed(1)),
      fatDiff: parseFloat(fatDiff.toFixed(1)),
      muscleDiff: parseFloat(muscleDiff.toFixed(1)),
    };
  };

  const comparison = getProgressComparison();

  // Dynamic Milestones Checking
  const getMilestones = (): Milestone[] => {
    const totalSessions = records.length;
    const latest = records[0]; // records from API is usually sorted descending
    const member = user?.memberId;

    const unlockedFirst = totalSessions >= 1;
    const unlockedConsistency = totalSessions >= 3;

    let unlockedNormalBMI = false;
    if (latest) {
      unlockedNormalBMI = latest.bmi >= 18.5 && latest.bmi < 25;
    }

    let unlockedGoal = false;
    if (member && latest) {
      const ideal = member.idealWeight;
      const current = latest.weight;
      const initial = member.currentWeight; // registration weight

      if (ideal) {
        if (initial > ideal) {
          // Weight loss goal
          unlockedGoal = current <= ideal;
        } else if (initial < ideal) {
          // Weight gain goal
          unlockedGoal = current >= ideal;
        }
      }
    }

    return [
      {
        id: "first-step",
        title: "First Diagnostic Check",
        description: "Completed your initial body composition analysis.",
        unlocked: unlockedFirst,
        icon: <Flame className="h-5 w-5" />,
      },
      {
        id: "consistency",
        title: "Consistency Champion",
        description: "Completed at least 3 analysis checkups to track trends.",
        unlocked: unlockedConsistency,
        icon: <Clock className="h-5 w-5" />,
      },
      {
        id: "ideal-range",
        title: "Normal BMI Target",
        description: "Achieved a balanced body mass index (18.5 - 24.9).",
        unlocked: unlockedNormalBMI,
        icon: <Heart className="h-5 w-5" />,
      },
      {
        id: "ultimate-goal",
        title: "Ultimate Weight Goal",
        description: "Successfully reached your target weight objective.",
        unlocked: unlockedGoal,
        icon: <Trophy className="h-5 w-5" />,
      },
    ];
  };

  // const milestones = getMilestones();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50/50 to-white">
        <FitnessLoader label="Loading progress history..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Back navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/member")}
          className="hover:bg-primary/5 hover:text-primary transition-colors rounded-lg h-9"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
        </Button>
      </div>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader
          title="Progress Insights"
          subtitle="Explore your detailed trend history, body compositions, and unlocked fitness milestones"
        />
        {records.length > 0 && (
          <div className="bg-primary/10 text-primary border border-primary/20 px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0 self-start md:self-auto shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            {records.length} Sessions Logged
          </div>
        )}
      </div>

      {/* Main Charts Component */}
      <div className="bg-card/40 backdrop-blur-md border rounded-2xl p-5 shadow-sm">
        <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" /> Chronological Metric Curves
        </h3>
        <MemberProgressCharts records={records} />
      </div>

      {/* Comparison and Achievements Section */}
      {records.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Progress Breakdown Cards */}
          <Card className="md:col-span-2 border border-border shadow-sm bg-card overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 font-bold">
                <Scale className="h-5 w-5 text-primary" /> Initial vs. Latest Comparison
              </CardTitle>
              <CardDescription className="text-xs">
                {comparison
                  ? `Comparing changes between your first diagnosis (${formatDate(comparison.first.analysisDate)}) and current session.`
                  : "Complete at least two checkups to generate a comparison matrix."}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {comparison ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Weight Compare */}
                  <div className="flex flex-col p-4 bg-muted/40 rounded-xl border border-border/50 transition-all hover:scale-[1.02] duration-300">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Weight Change</span>
                    <span className="text-lg font-bold text-foreground mt-1.5">{comparison.latest.weight} kg</span>
                    <div className="flex items-center gap-1 mt-2 text-xs font-semibold">
                      {comparison.weightDiff < 0 ? (
                        <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <TrendingDown className="h-3 w-3" /> {comparison.weightDiff} kg
                        </span>
                      ) : comparison.weightDiff > 0 ? (
                        <span className="text-rose-600 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <TrendingUp className="h-3 w-3" /> +{comparison.weightDiff} kg
                        </span>
                      ) : (
                        <span className="text-muted-foreground bg-muted px-2 py-0.5 rounded-full">No Change</span>
                      )}
                    </div>
                  </div>

                  {/* BMI Compare */}
                  <div className="flex flex-col p-4 bg-muted/40 rounded-xl border border-border/50 transition-all hover:scale-[1.02] duration-300">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">BMI Index</span>
                    <span className="text-lg font-bold text-foreground mt-1.5">{comparison.latest.bmi}</span>
                    <div className="flex items-center gap-1 mt-2 text-xs font-semibold">
                      {comparison.bmiDiff < 0 ? (
                        <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <TrendingDown className="h-3 w-3" /> {comparison.bmiDiff}
                        </span>
                      ) : comparison.bmiDiff > 0 ? (
                        <span className="text-rose-600 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <TrendingUp className="h-3 w-3" /> +{comparison.bmiDiff}
                        </span>
                      ) : (
                        <span className="text-muted-foreground bg-muted px-2 py-0.5 rounded-full">No Change</span>
                      )}
                    </div>
                  </div>

                  {/* Body Fat Compare */}
                  <div className="flex flex-col p-4 bg-muted/40 rounded-xl border border-border/50 transition-all hover:scale-[1.02] duration-300">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Body Fat</span>
                    <span className="text-lg font-bold text-foreground mt-1.5">
                      {comparison.latest.bodyComposition?.bodyFatPercent || "0"}%
                    </span>
                    <div className="flex items-center gap-1 mt-2 text-xs font-semibold">
                      {comparison.fatDiff < 0 ? (
                        <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <TrendingDown className="h-3 w-3" /> {comparison.fatDiff}%
                        </span>
                      ) : comparison.fatDiff > 0 ? (
                        <span className="text-rose-600 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <TrendingUp className="h-3 w-3" /> +{comparison.fatDiff}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground bg-muted px-2 py-0.5 rounded-full">No Change</span>
                      )}
                    </div>
                  </div>

                  {/* Muscle Mass Compare */}
                  <div className="flex flex-col p-4 bg-muted/40 rounded-xl border border-border/50 transition-all hover:scale-[1.02] duration-300">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Muscle Mass</span>
                    <span className="text-lg font-bold text-foreground mt-1.5">
                      {comparison.latest.bodyComposition?.muscleMass || "0"} kg
                    </span>
                    <div className="flex items-center gap-1 mt-2 text-xs font-semibold">
                      {comparison.muscleDiff > 0 ? (
                        <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <TrendingUp className="h-3 w-3" /> +{comparison.muscleDiff} kg
                        </span>
                      ) : comparison.muscleDiff < 0 ? (
                        <span className="text-rose-600 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <TrendingDown className="h-3 w-3" /> {comparison.muscleDiff} kg
                        </span>
                      ) : (
                        <span className="text-muted-foreground bg-muted px-2 py-0.5 rounded-full">No Change</span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-muted/20 border border-dashed rounded-xl text-center">
                  <Info className="h-8 w-8 text-primary/65 mb-2" />
                  <h4 className="font-bold text-sm">Awaiting Second Session Data</h4>
                  <p className="text-xs text-muted-foreground max-w-[280px] mt-1">
                    Once your trainer registers an additional diagnosis session, dynamic comparative charts will render automatically.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Milestones Cards */}
          <Card className="border border-border shadow-sm bg-card relative overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2 font-bold">
                  <Award className="h-5 w-5 text-primary animate-pulse" /> Milestones & Badges
                </CardTitle>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full animate-pulse">
                  Coming Soon
                </span>
              </div>
              <CardDescription className="text-xs">
                This will help member to check their levels.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              {/* Skeleton/Placeholder items */}
              <div className="space-y-3 opacity-60 pointer-events-none select-none">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 p-2.5 rounded-xl border border-border/50 bg-muted/5 text-left animate-pulse"
                  >
                    <div className="p-2 rounded-lg bg-muted text-muted-foreground/40 shrink-0">
                      <Lock className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-2 py-0.5">
                      <div className="h-3 bg-muted rounded-full w-24"></div>
                      <div className="h-2 bg-muted rounded-full w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* History log drawer listing */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2 pb-1 border-b">
          <Clock className="h-5 w-5 text-primary" /> Analysis Diagnostic History
        </h3>

        {records.length > 0 ? (
          <div className="space-y-3">
            {records.map((r) => {
              const isExpanded = expandedRecordId === r._id;

              // Define BMI Category styles
              const getBmiBadge = (category: string) => {
                const map: Record<string, string> = {
                  "Underweight": "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/40",
                  "Normal Weight": "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/40",
                  "Normal": "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/40",
                  "Overweight": "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/40",
                  "Obese": "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/40",
                };
                const style = map[category] || "bg-muted text-muted-foreground border-border";
                return `text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${style}`;
              };

              return (
                <div
                  key={r._id}
                  className="bg-card border border-border rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20"
                >
                  {/* Collapsed Header Bar */}
                  <button
                    onClick={() => toggleExpandRecord(r._id)}
                    className="w-full p-4 flex items-center justify-between text-left gap-4"
                  >
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                      <div className="flex items-center gap-2 text-sm text-foreground font-semibold">
                        <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                        {formatDate(r.analysisDate)}
                      </div>

                      <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                        <div>
                          Weight: <span className="font-bold text-foreground">{r.weight} kg</span>
                        </div>
                        <div>
                          BMI: <span className="font-bold text-foreground">{r.bmi}</span>
                        </div>
                        <div>
                          Category: <span className={getBmiBadge(r.bmiCategory)}>{r.bmiCategory}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-muted-foreground p-1 hover:text-foreground transition-colors shrink-0">
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </button>

                  {/* Expanded Body details (collapsible) */}
                  {isExpanded && (
                    <div className="px-4 pb-5 border-t pt-4 bg-muted/15 space-y-4 animate-in slide-in-from-top duration-300">
                      {/* Body Composition Details Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="p-3 bg-card rounded-lg border text-center shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                          <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Body Fat %</span>
                          <p className="text-lg font-bold mt-1 text-foreground">
                            {r.bodyComposition?.bodyFatPercent ? `${r.bodyComposition.bodyFatPercent}%` : "N/A"}
                          </p>
                          <span className="text-[9px] text-muted-foreground capitalize">({r.bodyComposition?.bodyFatStatus || "N/A"})</span>
                        </div>

                        <div className="p-3 bg-card rounded-lg border text-center shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                          <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Visceral Fat</span>
                          <p className="text-lg font-bold mt-1 text-foreground">
                            {r.bodyComposition?.visceralFat || "N/A"}
                          </p>
                          <span className="text-[9px] text-muted-foreground capitalize">({r.bodyComposition?.visceralFatStatus || "N/A"})</span>
                        </div>

                        <div className="p-3 bg-card rounded-lg border text-center shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                          <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Muscle Mass</span>
                          <p className="text-lg font-bold mt-1 text-foreground">
                            {r.bodyComposition?.muscleMass ? `${r.bodyComposition.muscleMass} kg` : "N/A"}
                          </p>
                        </div>

                        <div className="p-3 bg-card rounded-lg border text-center shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                          <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Metabolic BMR</span>
                          <p className="text-lg font-bold mt-1 text-foreground">
                            {r.bodyComposition?.bmr ? `${r.bodyComposition.bmr} kcal` : "N/A"}
                          </p>
                        </div>

                        <div className="p-3 bg-card rounded-lg border text-center shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                          <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Body Age</span>
                          <p className="text-lg font-bold mt-1 text-foreground">
                            {r.bodyComposition?.bodyAge ? `${r.bodyComposition.bodyAge} yrs` : "N/A"}
                          </p>
                        </div>

                        <div className="p-3 bg-card rounded-lg border text-center shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                          <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Trunk Fat %</span>
                          <p className="text-lg font-bold mt-1 text-foreground">
                            {r.bodyComposition?.trunkFat ? `${r.bodyComposition.trunkFat}%` : "N/A"}
                          </p>
                          <span className="text-[9px] text-muted-foreground capitalize">({r.bodyComposition?.trunkFatStatus || "N/A"})</span>
                        </div>

                        <div className="p-3 bg-card rounded-lg border text-center shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                          <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Arm / Leg Fat</span>
                          <p className="text-xs font-bold mt-2 text-foreground">
                            A: {r.bodyComposition?.armFat ? `${r.bodyComposition.armFat}%` : "N/A"} | L: {r.bodyComposition?.legFat ? `${r.bodyComposition.legFat}%` : "N/A"}
                          </p>
                        </div>

                        <div className="p-3 bg-card rounded-lg border text-center shadow-[0_1px_3px_rgba(0,0,0,0.02)] bg-gradient-to-br from-primary/5 to-transparent">
                          <span className="text-[9px] uppercase tracking-wider font-bold text-primary flex items-center justify-center gap-1">
                            <Flame className="h-3 w-3" /> Height Index
                          </span>
                          <p className="text-lg font-extrabold mt-1 text-foreground">
                            {r.height || "N/A"} cm
                          </p>
                        </div>
                      </div>

                      {/* Trainer Comments */}
                      {r.trainerNotes && (
                        <div className="p-3 bg-card rounded-lg border border-primary/10 shadow-[0_1px_3px_rgba(0,0,0,0.01)] text-xs text-foreground leading-relaxed">
                          <span className="font-bold text-primary uppercase text-[9px] tracking-wider block mb-1">Trainer Session Notes</span>
                          {r.trainerNotes}
                        </div>
                      )}

                      {/* Suggested actions */}
                      {r.suggestedAction && (
                        <div className="p-3 bg-primary/5 border border-primary/10 text-primary rounded-lg text-xs leading-relaxed">
                          <span className="font-bold uppercase text-[9px] tracking-wider block mb-1">Recommended Directives</span>
                          {r.suggestedAction}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-16 bg-card rounded-2xl border border-dashed p-6 shadow-sm">
            <TrendingUp className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-bold text-sm text-foreground">No Diagnostic Data Logged Yet</p>
            <p className="text-xs text-muted-foreground max-w-[280px] mx-auto mt-1">
              Your weight, fat %, and body curves history will appear here once your trainer conducts your initial diagnostic checkup.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
