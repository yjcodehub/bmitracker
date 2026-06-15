"use client";

import { useEffect, useState, useRef } from "react";
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
  trunkMuscleMass: z.coerce.number().min(0),
  armMuscleMass: z.coerce.number().min(0),
  legMuscleMass: z.coerce.number().min(0),
  trainerNotes: z.string().optional(),
});

type BMIForm = z.infer<typeof bmiSchema>;

export default function NewBMIPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedMemberId = searchParams.get("memberId") || "";

  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<BMIForm>({
    resolver: zodResolver(bmiSchema),
    defaultValues: {
      memberId: preselectedMemberId,
    },
  });

  const watchedWeight = watch("weight");
  let calculatedBmi = 0;
  if (selectedMember && watchedWeight) {
    const heightInMeters = selectedMember.height / 100;
    if (heightInMeters > 0) {
      calculatedBmi = parseFloat((Number(watchedWeight) / (heightInMeters * heightInMeters)).toFixed(1));
    }
  }

  useEffect(() => {
    api
      .get<Member[]>("/members?status=active")
      .then((res) => {
        if (Array.isArray(res.data)) {
          const sorted = [...res.data].sort((a, b) => {
            const aIsStaff = a.userId?.roleId?.slug === 'staff' ? 1 : 0;
            const bIsStaff = b.userId?.roleId?.slug === 'staff' ? 1 : 0;
            if (aIsStaff !== bIsStaff) {
              return bIsStaff - aIsStaff;
            }
            return a.fullName.localeCompare(b.fullName);
          });
          setMembers(sorted);
        }
      })
      .catch((err) => console.error("Failed to load active members:", err))
      .finally(() => setMembersLoading(false));
  }, []);

  const filteredMembers = members.filter((m) => {
    const search = searchTerm.toLowerCase();
    return (
      m.fullName.toLowerCase().includes(search) ||
      m.membershipNumber.toLowerCase().includes(search)
    );
  });

  useEffect(() => {
    if (preselectedMemberId) {
      setValue("memberId", preselectedMemberId);
    }
  }, [preselectedMemberId, setValue]);

  useEffect(() => {
    if (preselectedMemberId && members.length > 0) {
      const found = members.find((m) => m._id === preselectedMemberId);
      if (found) {
        setSelectedMember(found);
        if (found.currentWeight) {
          setValue("weight", found.currentWeight, { shouldValidate: true });
        }
      }
    }
  }, [preselectedMemberId, members, setValue]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectMember = (member: Member) => {
    setSelectedMember(member);
    setValue("memberId", member._id, { shouldValidate: true });
    if (member.currentWeight) {
      setValue("weight", member.currentWeight, { shouldValidate: true });
    }
    setIsOpen(false);
  };

  const handleClearSelection = () => {
    setSelectedMember(null);
    setValue("memberId", "", { shouldValidate: true });
    setIsOpen(false);
  };

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
                <div className="relative" ref={dropdownRef}>
                  <input type="hidden" {...register("memberId")} />
                  <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-md bg-background text-sm text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50"
                    disabled={loading}
                  >
                    {selectedMember ? (
                      <span className="flex items-center gap-2">
                        {selectedMember.userId?.roleId?.slug === "staff" && (
                          <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0">
                            Staff
                          </span>
                        )}
                        <span className="font-medium text-foreground truncate">{selectedMember.fullName}</span>
                        <span className="text-xs text-muted-foreground font-mono shrink-0">({selectedMember.membershipNumber})</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-- Choose Member --</span>
                    )}
                    <span className="ml-2 text-muted-foreground text-xs">▼</span>
                  </button>

                  {isOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="p-2 border-b">
                        <Input
                          type="text"
                          placeholder="Search member by name or code..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="h-9 w-full"
                          autoFocus
                          disabled={loading}
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto py-1">
                        <button
                          type="button"
                          onClick={handleClearSelection}
                          className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          disabled={loading}
                        >
                          -- Choose Member --
                        </button>
                        {filteredMembers.map((m) => (
                          <button
                            key={m._id}
                            type="button"
                            onClick={() => handleSelectMember(m)}
                            className="flex items-center justify-between w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors border-b last:border-0 border-muted/10"
                            disabled={loading}
                          >
                            <span className="flex items-center gap-2 truncate">
                              {m.userId?.roleId?.slug === "staff" && (
                                <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0">
                                  Staff
                                </span>
                              )}
                              <span className="font-medium truncate">{m.fullName}</span>
                            </span>
                            <span className="text-xs text-muted-foreground font-mono shrink-0 ml-2">{m.membershipNumber}</span>
                          </button>
                        ))}
                        {filteredMembers.length === 0 && (
                          <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                            No matching members found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
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
                <Label htmlFor="calculatedBmi">Calculated BMI</Label>
                <Input
                  id="calculatedBmi"
                  type="number"
                  value={calculatedBmi || ""}
                  readOnly
                  disabled={loading}
                  className="bg-muted text-muted-foreground font-semibold"
                  placeholder="Calculated automatically"
                />
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
                <Label htmlFor="muscleMass">Total Muscle Mass (kg) *</Label>
                <Input id="muscleMass" type="number" step="0.1" {...register("muscleMass")} disabled={loading} />
                {errors.muscleMass && <p className="text-sm text-destructive">{errors.muscleMass.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="trunkMuscleMass">Trunk Muscle Mass (kg) *</Label>
                <Input id="trunkMuscleMass" type="number" step="0.1" {...register("trunkMuscleMass")} disabled={loading} />
                {errors.trunkMuscleMass && <p className="text-sm text-destructive">{errors.trunkMuscleMass.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="armMuscleMass">Arms Muscle Mass (kg) *</Label>
                <Input id="armMuscleMass" type="number" step="0.1" {...register("armMuscleMass")} disabled={loading} />
                {errors.armMuscleMass && <p className="text-sm text-destructive">{errors.armMuscleMass.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="legMuscleMass">Legs Muscle Mass (kg) *</Label>
                <Input id="legMuscleMass" type="number" step="0.1" {...register("legMuscleMass")} disabled={loading} />
                {errors.legMuscleMass && <p className="text-sm text-destructive">{errors.legMuscleMass.message}</p>}
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
