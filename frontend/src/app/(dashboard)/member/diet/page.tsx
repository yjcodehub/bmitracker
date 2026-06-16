"use client";

import { useEffect, useState } from "react";
import { Loader2, Utensils, Droplet, Leaf, HelpCircle, ArrowLeft, Calendar, Info } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface MealItem {
  name: string;
  items: string[];
}

interface DietPlan {
  _id: string;
  name: string;
  description?: string;
  isVegetarian: boolean;
  isNonVegetarian: boolean;
  waterIntakeGoal: string;
  meals: {
    earlyMorning: MealItem[];
    breakfast: MealItem[];
    midSnack: MealItem[];
    lunch: MealItem[];
    eveningSnack: MealItem[];
    dinner: MealItem[];
  };
}

interface BMIRecord {
  _id: string;
  analysisDate: string;
  dietPlanId?: DietPlan;
}

export default function MemberDietPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const memberId = user?.memberId?._id;

  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [analysisDate, setAnalysisDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!memberId) return;

    setLoading(true);
    api
      .get<BMIRecord[]>(`/bmi/member/${memberId}?limit=1`)
      .then((res) => {
        const records = res.data;
        if (records.length > 0 && records[0].dietPlanId) {
          setDietPlan(records[0].dietPlanId);
          setAnalysisDate(records[0].analysisDate);
        } else {
          setDietPlan(null);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load diet plan");
      })
      .finally(() => setLoading(false));
  }, [memberId]);

  return (
    <div className="space-y-4 pb-12">
      <div className="flex items-center gap-2 mb-2">
        <Button variant="ghost" size="sm" onClick={() => router.push("/member")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Home
        </Button>
      </div>

      <PageHeader
        title="My Diet Plan"
        subtitle="Your personalized nutrition schedule"
      />

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : dietPlan ? (
        <div className="space-y-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-primary" />
                  {dietPlan.name}
                </h3>
                {dietPlan.description && <p className="text-sm text-muted-foreground mt-1">{dietPlan.description}</p>}
                {analysisDate && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Assigned on: {formatDate(analysisDate)}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                {dietPlan.isVegetarian && (
                  <span className="flex items-center gap-1 text-xs text-green-600 font-semibold bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                    <Leaf className="h-3 w-3" /> Veg
                  </span>
                )}
                {dietPlan.isNonVegetarian && (
                  <span className="flex items-center gap-1 text-xs text-red-600 font-semibold bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                    Non-Veg
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-blue-600 font-semibold bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  <Droplet className="h-3 w-3" /> {dietPlan.waterIntakeGoal}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Early Morning */}
            {dietPlan.meals.earlyMorning?.[0] && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-primary uppercase tracking-wider font-semibold">
                    🌅 Early Morning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {dietPlan.meals.earlyMorning[0].items.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Breakfast */}
            {dietPlan.meals.breakfast?.[0] && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-primary uppercase tracking-wider font-semibold">
                    🍳 Breakfast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {dietPlan.meals.breakfast[0].items.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Mid Snack */}
            {dietPlan.meals.midSnack?.[0] && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-primary uppercase tracking-wider font-semibold">
                    🍎 Mid Snack
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {dietPlan.meals.midSnack[0].items.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Lunch */}
            {dietPlan.meals.lunch?.[0] && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-primary uppercase tracking-wider font-semibold">
                    🥗 Lunch
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {dietPlan.meals.lunch[0].items.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Evening Snack */}
            {dietPlan.meals.eveningSnack?.[0] && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-primary uppercase tracking-wider font-semibold">
                    ☕ Evening Snack
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {dietPlan.meals.eveningSnack[0].items.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Dinner */}
            {dietPlan.meals.dinner?.[0] && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-primary uppercase tracking-wider font-semibold">
                    🍽️ Dinner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {dietPlan.meals.dinner[0].items.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-16 bg-card rounded-lg border border-dashed p-6">
          <Info className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-medium text-sm text-foreground">No active diet plan assigned</p>
          <p className="text-xs text-muted-foreground mt-1">
            Please request your trainer or staff member to assign a diet plan template for your BMI session.
          </p>
        </div>
      )}
    </div>
  );
}
