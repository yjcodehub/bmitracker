"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  Scale,
  Activity,
  Target,
  Lock,
  Camera,
  Loader2,
  Check,
  AlertTriangle,
  Heart,
  Shield,
  Trash2,
  Eye,
  EyeOff,
  LogOut
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import { User, BMIRecord } from "@/types";
import { ProfileHeader } from "@/components/profile";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageEditorDialog } from "@/components/profile/ImageEditorDialog";
import { FitnessLoader } from "@/components/ui/FitnessLoader";

type ActiveTab = "personal" | "fitness" | "security";

const getPasswordStrength = (password: string) => {
  if (!password) return { score: 0, label: '', color: 'bg-gray-200', textColor: 'text-muted-foreground', width: 'w-0' };

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>_+\-*\/[\]\\`~';]/.test(password)) score++;

  if (score <= 2) {
    return { score, label: 'Weak', color: 'bg-red-500', textColor: 'text-red-500', width: 'w-1/3' };
  } else if (score <= 4) {
    return { score, label: 'Good', color: 'bg-amber-500', textColor: 'text-amber-500', width: 'w-2/3' };
  } else {
    return { score, label: 'Best', color: 'bg-green-500', textColor: 'text-green-500', width: 'w-full' };
  }
};

export default function MemberProfilePage() {
  const router = useRouter();
  const { user, fetchUser, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>("personal");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [bmiRecords, setBmiRecords] = useState<BMIRecord[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Photo Upload State
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  // Personal Info Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState<number | string>("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [height, setHeight] = useState<number | string>("");
  const [currentWeight, setCurrentWeight] = useState<number | string>("");

  // Fitness Goals Form State
  const [idealWeight, setIdealWeight] = useState<number | string>("");
  const [weightLossGoal, setWeightLossGoal] = useState<number | string>("");

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const strength = getPasswordStrength(newPassword);
  const isConfirmPasswordMismatched = confirmPassword !== "" && newPassword !== confirmPassword;

  useEffect(() => {
    if (user?.memberId) {
      const member = user.memberId;
      setFullName(member.fullName || "");
      setPhone(member.contactNumber || "");
      setAge(member.age || "");
      setGender(member.gender || "male");
      setHeight(member.height || "");
      setCurrentWeight(member.currentWeight || "");
      setIdealWeight(member.idealWeight || "");
      setWeightLossGoal(member.weightLossGoal || "");
    }
  }, [user]);

  useEffect(() => {
    const fetchBmiHistory = async () => {
      if (!user?.memberId?._id) return;
      try {
        const res = await api.get<BMIRecord[]>(`/bmi/member/${user.memberId._id}?limit=100`);
        setBmiRecords(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching BMI history:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBmiHistory();
  }, [user]);

  // Handle Dialog Body Scroll Lock
  useEffect(() => {
    if (editorOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [editorOpen]);

  const handleSavePersonalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.memberId?._id) return;

    setIsSaving(true);
    try {
      const payload = {
        fullName,
        contactNumber: phone,
        age: Number(age),
        gender,
        height: Number(height),
        currentWeight: Number(currentWeight),
      };

      await api.put(`/members/${user.memberId._id}`, payload);
      toast.success("Personal information updated successfully");
      await fetchUser();
    } catch (error) {
      console.error("Failed to update personal details:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update details");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveFitnessGoals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.memberId?._id) return;

    setIsSaving(true);
    try {
      const payload = {
        idealWeight: idealWeight ? Number(idealWeight) : undefined,
        weightLossGoal: weightLossGoal ? Number(weightLossGoal) : undefined,
      };

      await api.put(`/members/${user.memberId._id}`, payload);
      toast.success("Fitness goals updated successfully");
      await fetchUser();
    } catch (error) {
      console.error("Failed to update fitness goals:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update goals");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_+\-*\/[\]\\`~';])/;
    if (!passwordRegex.test(newPassword)) {
      toast.error("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character");
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      console.error("Failed to change password:", error);
      toast.error(error instanceof Error ? error.message : "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      toast.error("Failed to log out");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image file size must be less than 2MB");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setEditorOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSavePhoto = async (croppedBase64: string) => {
    if (!user?.memberId?._id) return;
    setEditorOpen(false);
    setIsSaving(true);
    try {
      await api.put(`/members/${user.memberId._id}`, { profilePhoto: croppedBase64 });
      toast.success("Profile photo updated successfully");
      await fetchUser();
    } catch (err) {
      toast.error("Failed to upload image");
    } finally {
      setIsSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // BMI Helper Calculations
  const calculateBMI = () => {
    const h = Number(height) / 100; // in meters
    const w = Number(currentWeight);
    if (!h || !w) return 0;
    return parseFloat((w / (h * h)).toFixed(1));
  };

  const getBMICategory = (bmiValue: number) => {
    if (bmiValue === 0) return { name: "N/A", color: "text-muted-foreground", bg: "bg-muted", pct: 0, desc: "" };
    if (bmiValue < 18.5) return { name: "Underweight", color: "text-blue-500", bg: "bg-blue-500/10", pct: 15, desc: "You are below the healthy weight range. Consider consulting a nutritionist." };
    if (bmiValue < 25) return { name: "Normal Weight", color: "text-emerald-500", bg: "bg-emerald-500/10", pct: 45, desc: "Great job! You are in the ideal healthy weight range. Keep maintaining your routine." };
    if (bmiValue < 30) return { name: "Overweight", color: "text-amber-500", bg: "bg-amber-500/10", pct: 75, desc: "You are slightly above the healthy weight range. Focus on active routines and portion controls." };
    return { name: "Obese", color: "text-rose-500", bg: "bg-rose-500/10", pct: 95, desc: "You are in the obesity range. We highly recommend a structured training plan and calorie control." };
  };

  const bmi = calculateBMI();
  const bmiCat = getBMICategory(bmi);

  // Goal Weight Calculations
  const startingWeight = bmiRecords.length > 0 ? bmiRecords[bmiRecords.length - 1].weight : Number(currentWeight);
  const targetWeight = Number(idealWeight);
  const currentW = Number(currentWeight);

  const getGoalProgressPct = () => {
    if (!targetWeight || !startingWeight) return 0;
    if (startingWeight === targetWeight) return 100;

    // Check if goal is weight loss
    if (startingWeight > targetWeight) {
      if (currentW <= targetWeight) return 100;
      const totalToLose = startingWeight - targetWeight;
      const lostSoFar = startingWeight - currentW;
      return Math.max(0, Math.min(100, Math.round((lostSoFar / totalToLose) * 100)));
    } else {
      // Goal is weight gain
      if (currentW >= targetWeight) return 100;
      const totalToGain = targetWeight - startingWeight;
      const gainedSoFar = currentW - startingWeight;
      return Math.max(0, Math.min(100, Math.round((gainedSoFar / totalToGain) * 100)));
    }
  };

  const progressPct = getGoalProgressPct();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50/50 to-white">
        <FitnessLoader label="Loading your profile..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-orange-50/10 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center shrink-0">
          <h1 className="text-3xl font-bold mb-1 tracking-tight">My Profile</h1>
          <p className="text-muted-foreground text-sm">
            Manage your personal metrics, weight loss goals, and account settings
          </p>
        </div>

        {/* Reusable Profile Header */}
        <ProfileHeader
          user={user || undefined}
          gymName="FitZone Member"
          joinDate={user?.createdAt}
          onEditPhoto={() => fileInputRef.current?.click()}
        />

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
        />

        {/* Tabs Bar */}
        <div className="flex border-b border-border bg-card/65 backdrop-blur-sm rounded-t-xl overflow-x-auto scrollbar-none shadow-sm">
          <button
            onClick={() => setActiveTab("personal")}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 font-semibold text-sm transition-all duration-200 shrink-0 ${activeTab === "personal"
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
          >
            <UserIcon className="h-4 w-4" />
            Personal Details
          </button>
          <button
            onClick={() => setActiveTab("fitness")}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 font-semibold text-sm transition-all duration-200 shrink-0 ${activeTab === "fitness"
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
          >
            <Activity className="h-4 w-4" />
            Goals & BMI Analysis
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 font-semibold text-sm transition-all duration-200 shrink-0 ${activeTab === "security"
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
          >
            <Lock className="h-4 w-4" />
            Account Security
          </button>
        </div>

        {/* Tab Contents */}
        <div className="bg-card border border-t-0 rounded-b-xl shadow-sm p-6">
          {activeTab === "personal" && (
            <form onSubmit={handleSavePersonalInfo} className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">Personal Details</h3>
                <p className="text-xs text-muted-foreground">
                  Update your contact details, height and weight to ensure your trainer can track your BMI accurately.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isSaving}
                    placeholder="Enter your full name"
                    className="h-11 rounded-lg"
                  />
                </div>

                {/* Email (Disabled) */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="flex items-center gap-1.5 text-muted-foreground">
                    Email Address <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded uppercase">Locked</span>
                  </Label>
                  <Input
                    id="email"
                    value={user?.email || ""}
                    disabled
                    className="h-11 rounded-lg bg-muted text-muted-foreground cursor-not-allowed border-muted/50"
                  />
                </div>

                {/* Contact Number */}
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Contact Number</Label>
                  <Input
                    id="phone"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isSaving}
                    placeholder="Enter phone number"
                    className="h-11 rounded-lg"
                  />
                </div>

                {/* Age */}
                <div className="space-y-1.5">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    disabled={isSaving}
                    placeholder="Enter your age"
                    className="h-11 rounded-lg"
                  />
                </div>

                {/* Gender */}
                <div className="space-y-1.5">
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    disabled={isSaving}
                    className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Height */}
                <div className="space-y-1.5">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    required
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    disabled={isSaving}
                    placeholder="e.g. 175"
                    className="h-11 rounded-lg"
                  />
                </div>

                {/* Current Weight */}
                <div className="space-y-1.5">
                  <Label htmlFor="currentWeight">Current Weight (kg)</Label>
                  <Input
                    id="currentWeight"
                    type="number"
                    step="0.1"
                    required
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(e.target.value)}
                    disabled={isSaving}
                    placeholder="e.g. 70.5"
                    className="h-11 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button type="submit" disabled={isSaving} className="h-11 px-6 rounded-lg font-semibold min-w-[120px]">
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Details"
                  )}
                </Button>
              </div>
            </form>
          )}

          {activeTab === "fitness" && (
            <div className="space-y-8">
              {/* BMI Card Display */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Numeric BMI Score */}
                <Card className="shadow-none border border-border bg-gradient-to-br from-primary/5 to-transparent flex flex-col justify-between overflow-hidden relative">
                  <div className="absolute right-0 top-0 h-16 w-16 bg-primary/10 rounded-bl-full pointer-events-none" />
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5 text-primary" /> Real-time BMI
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold text-foreground tracking-tight">{bmi || "—"}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bmiCat.bg} ${bmiCat.color}`}>
                        {bmiCat.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2">
                      Calculated on-the-fly using your current height ({height || "0"}cm) and weight ({currentWeight || "0"}kg).
                    </p>
                  </CardContent>
                </Card>

                {/* BMI Scale Details */}
                <Card className="shadow-none border border-border md:col-span-2">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Heart className="h-3.5 w-3.5 text-rose-500" /> Health Insight & Recommendation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex flex-col justify-center h-full min-h-[90px]">
                    {bmi > 0 ? (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-foreground leading-snug">
                          {bmiCat.desc}
                        </p>
                        {/* Interactive gauge bar */}
                        <div className="relative pt-2">
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
                            <div className="h-full w-[18.5%] bg-blue-400" />
                            <div className="h-full w-[6.5%] bg-emerald-400" />
                            <div className="h-full w-[5%] bg-amber-400" />
                            <div className="h-full w-[70%] bg-rose-400" />
                          </div>
                          {/* Selector Pin */}
                          <div
                            className="absolute -top-0.5 h-3 w-3 rounded-full border-2 border-background shadow bg-foreground transition-all duration-500"
                            style={{ left: `${bmiCat.pct}%`, transform: 'translateX(-50%)' }}
                          />
                          <div className="flex justify-between text-[9px] text-muted-foreground font-mono mt-1">
                            <span>15.0</span>
                            <span>18.5</span>
                            <span>25.0</span>
                            <span>30.0</span>
                            <span>40.0+</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Please update your weight and height in the Personal Details tab to see your BMI analysis.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Edit Goals and Progress Bar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Save Goals Form */}
                <Card className="shadow-none border border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold">Fitness Goals</CardTitle>
                    <CardDescription className="text-xs">
                      Set target parameters to generate automated progress trackers.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSaveFitnessGoals} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="idealWeight">Ideal Target Weight (kg)</Label>
                        <Input
                          id="idealWeight"
                          type="number"
                          step="0.1"
                          value={idealWeight}
                          onChange={(e) => setIdealWeight(e.target.value)}
                          disabled={isSaving}
                          placeholder="e.g. 65"
                          className="h-11 rounded-lg"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="weightLossGoal">Target Weight Change Amount (kg)</Label>
                        <Input
                          id="weightLossGoal"
                          type="number"
                          step="0.1"
                          value={weightLossGoal}
                          onChange={(e) => setWeightLossGoal(e.target.value)}
                          disabled={isSaving}
                          placeholder="e.g. 5"
                          className="h-11 rounded-lg"
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={isSaving} className="h-11 px-6 rounded-lg font-semibold">
                          {isSaving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                            </>
                          ) : (
                            "Save Goals"
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* Progress bar Visual Card */}
                <Card className="shadow-none border border-border bg-gradient-to-br from-orange-500/[0.02] to-transparent flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-1.5">
                      <Target className="h-5 w-5 text-primary animate-pulse" /> Weight Goal Progress
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Visual tracker comparing your initial, current and ideal target weights.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-center">
                    {idealWeight ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <span className="text-sm font-semibold text-primary">{progressPct}% completed</span>
                          <span className="text-xs text-muted-foreground font-mono">
                            {currentW === targetWeight ? (
                              "Goal achieved! 🎉"
                            ) : currentW > targetWeight ? (
                              `${(currentW - targetWeight).toFixed(1)} kg left to lose`
                            ) : (
                              `${(targetWeight - currentW).toFixed(1)} kg left to gain`
                            )}
                          </span>
                        </div>
                        {/* Visual Progress Bar */}
                        <div className="h-3 w-full bg-muted rounded-full overflow-hidden border">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-1000"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>

                        {/* Weight Indicators */}
                        <div className="flex justify-between items-center text-xs pt-1">
                          <div className="flex flex-col">
                            <span className="text-muted-foreground uppercase text-[9px] tracking-wider">Start</span>
                            <span className="font-bold text-foreground">{startingWeight} kg</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-primary uppercase text-[9px] tracking-wider font-semibold">Current</span>
                            <span className="font-extrabold text-foreground bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full mt-0.5">
                              {currentW} kg
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-muted-foreground uppercase text-[9px] tracking-wider">Goal</span>
                            <span className="font-bold text-foreground text-primary">{targetWeight} kg</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-xl bg-muted/20 text-center">
                        <AlertTriangle className="h-8 w-8 text-amber-500/70 mb-2" />
                        <h4 className="font-bold text-sm text-foreground mb-1">No Goal Weight Set</h4>
                        <p className="text-xs text-muted-foreground max-w-[220px]">
                          Enter your ideal target weight in the goals form to activate the visual tracker.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">Account Security</h3>
                <p className="text-xs text-muted-foreground">
                  Secure your personal account metrics by updating your password regularly.
                </p>
              </div>

              <div className="max-w-md space-y-4">
                {/* Current Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      disabled={isChangingPassword}
                      placeholder="••••••••"
                      className="h-11 rounded-lg pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isChangingPassword}
                      placeholder="Minimum 8 characters"
                      className="h-11 rounded-lg pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {newPassword && (
                    <div className="space-y-1.5 mt-1.5">
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 text-[10px] font-semibold">
                        <p className={`uppercase tracking-wide ${strength.textColor}`}>
                          Password Strength: {strength.label}
                        </p>
                        <span className="text-muted-foreground font-normal normal-case">
                          Must contain uppercase, lowercase, number & special char
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isChangingPassword}
                      placeholder="••••••••"
                      className={`h-11 rounded-lg pr-10 ${isConfirmPasswordMismatched ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {isConfirmPasswordMismatched && (
                    <p className="text-xs text-red-500 font-semibold mt-1">
                      Passwords do not match
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button type="submit" disabled={isChangingPassword} className="h-11 px-6 rounded-lg font-semibold">
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Modern Logout Button at the bottom center */}
        <div className="flex justify-center pt-8">
          <Button 
            type="button" 
            variant="outline"
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 h-11 px-8 rounded-xl font-extrabold text-rose-600 hover:text-white border-rose-200 hover:border-rose-600 bg-rose-50/30 hover:bg-rose-600 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </div>

      {/* Image Editor Dialog (Cropper, Adjustments) */}
      <ImageEditorDialog
        isOpen={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }}
        imageSrc={selectedImage}
        onSave={handleSavePhoto}
      />
    </div>
  );
}
