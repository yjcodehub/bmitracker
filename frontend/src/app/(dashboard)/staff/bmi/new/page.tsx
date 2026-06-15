"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Member } from "@/types";
import { Loader2 } from "lucide-react";

const bmiSchema = z.object({
  memberId: z.string().min(1, "Member selection required"),
  weight: z.coerce.number().min(20).max(500),
  bodyFatPercent: z.coerce.number().min(0).max(100),
  visceralFat: z.coerce.number().min(0),
  bmr: z.coerce.number().min(0),
  bodyAge: z.coerce.number().min(0),
  totalBodyFat: z.coerce.number().min(0),
  trunkFat: z.coerce.number().min(0),
  armFat: z.coerce.number().min(0),
  legFat: z.coerce.number().min(0),
  muscleMass: z.coerce.number().min(0),
  trainerNotes: z.string().optional(),
});

type BMIForm = z.infer<typeof bmiSchema>;

export default function NewBMIPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedMemberId = searchParams.get("memberId") || "";

  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(true);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<BMIForm>({
    resolver: zodResolver(bmiSchema),
    defaultValues: {
      memberId: preselectedMemberId,
    },
  });

  useEffect(() => {
    api
      .get<Member[]>("/members?status=active")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setMembers(res.data);
        }
      })
      .catch((err) => console.error("Failed to load active members:", err))
      .finally(() => setMembersLoading(false));
  }, []);

  useEffect(() => {
    if (preselectedMemberId) {
      setValue("memberId", preselectedMemberId);
    }
  }, [preselectedMemberId, setValue]);

  const onSubmit = async (data: BMIForm) => {
    setLoading(true);
    setError("");
    try {
      await api.post("/bmi", data);
      router.push("/staff");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save analysis");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="New BMI Analysis" subtitle="Record body composition data" />

      <Card>
        <CardContent className="p-4 pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="memberId">Select Gym Member *</Label>
              {membersLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Loading active members list...
                </div>
              ) : (
                <select
                  id="memberId"
                  {...register("memberId")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-background text-sm"
                  disabled={loading}
                >
                  <option value="">-- Choose Member --</option>
                  {members.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.fullName} ({m.membershipNumber})
                    </option>
                  ))}
                </select>
              )}
              {errors.memberId && <p className="text-sm text-destructive">{errors.memberId.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg) *</Label>
                <Input id="weight" type="number" step="0.1" {...register("weight")} disabled={loading} />
                {errors.weight && <p className="text-sm text-destructive">{errors.weight.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="bodyFatPercent">Body Fat % *</Label>
                <Input id="bodyFatPercent" type="number" step="0.1" {...register("bodyFatPercent")} disabled={loading} />
                {errors.bodyFatPercent && <p className="text-sm text-destructive">{errors.bodyFatPercent.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="visceralFat">Visceral Fat *</Label>
                <Input id="visceralFat" type="number" step="0.1" {...register("visceralFat")} disabled={loading} />
                {errors.visceralFat && <p className="text-sm text-destructive">{errors.visceralFat.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="bmr">BMR (kcal) *</Label>
                <Input id="bmr" type="number" {...register("bmr")} disabled={loading} />
                {errors.bmr && <p className="text-sm text-destructive">{errors.bmr.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="bodyAge">Body Age *</Label>
                <Input id="bodyAge" type="number" {...register("bodyAge")} disabled={loading} />
                {errors.bodyAge && <p className="text-sm text-destructive">{errors.bodyAge.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="muscleMass">Muscle Mass (kg) *</Label>
                <Input id="muscleMass" type="number" step="0.1" {...register("muscleMass")} disabled={loading} />
                {errors.muscleMass && <p className="text-sm text-destructive">{errors.muscleMass.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalBodyFat">Total Body Fat *</Label>
                <Input id="totalBodyFat" type="number" step="0.1" {...register("totalBodyFat")} disabled={loading} />
                {errors.totalBodyFat && <p className="text-sm text-destructive">{errors.totalBodyFat.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="trunkFat">Trunk Fat *</Label>
                <Input id="trunkFat" type="number" step="0.1" {...register("trunkFat")} disabled={loading} />
                {errors.trunkFat && <p className="text-sm text-destructive">{errors.trunkFat.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="armFat">Arm Fat *</Label>
                <Input id="armFat" type="number" step="0.1" {...register("armFat")} disabled={loading} />
                {errors.armFat && <p className="text-sm text-destructive">{errors.armFat.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="legFat">Leg Fat *</Label>
                <Input id="legFat" type="number" step="0.1" {...register("legFat")} disabled={loading} />
                {errors.legFat && <p className="text-sm text-destructive">{errors.legFat.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trainerNotes">Trainer Notes</Label>
              <Input id="trainerNotes" {...register("trainerNotes")} disabled={loading} />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Saving..." : "Save Analysis"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
