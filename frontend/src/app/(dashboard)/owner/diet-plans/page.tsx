"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Edit2, Trash2, ArrowLeft, Loader2, Utensils, Check, Droplet, Leaf, HelpCircle, X } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Pagination } from "@/components/ui/pagination";
import { Pagination as PaginationType } from "@/types";

interface MealItem {
  name: string;
  items: string[];
}

interface DietPlan {
  _id: string;
  name: string;
  description?: string;
  isTemplate: boolean;
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
  isActive: boolean;
}

export default function DietPlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<DietPlan[]>([]);
  const [search, setSearch] = useState("");
  const [filterVeg, setFilterVeg] = useState<"all" | "veg" | "non-veg">("all");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<DietPlan | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationType | null>(null);

  // Form state
  const [selectedPlan, setSelectedPlan] = useState<DietPlan | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isVegetarian, setIsVegetarian] = useState(true);
  const [isNonVegetarian, setIsNonVegetarian] = useState(false);
  const [waterIntakeGoal, setWaterIntakeGoal] = useState("3-4 litres per day");

  // Meal items form state (comma separated text)
  const [earlyMorningItems, setEarlyMorningItems] = useState("");
  const [breakfastItems, setBreakfastItems] = useState("");
  const [midSnackItems, setMidSnackItems] = useState("");
  const [lunchItems, setLunchItems] = useState("");
  const [eveningSnackItems, setEveningSnackItems] = useState("");
  const [dinnerItems, setDinnerItems] = useState("");

  useEffect(() => {
    if (isModalOpen || isDeleteConfirmOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen, isDeleteConfirmOpen]);

  const fetchPlans = () => {
    setLoading(true);
    const queryParams = [];
    queryParams.push("isTemplate=true");
    queryParams.push("isActive=true");
    queryParams.push(`page=${page}`);
    queryParams.push(`limit=6`);
    if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
    if (filterVeg === "veg") queryParams.push("isVegetarian=true");
    if (filterVeg === "non-veg") queryParams.push("isNonVegetarian=true");

    const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";

    api
      .get<DietPlan[]>(`/diet-plans${queryString}`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setPlans(res.data);
          setPagination(res.pagination || null);
        } else {
          setPlans([]);
          setPagination(null);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to fetch diet templates");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setPage(1);
  }, [search, filterVeg]);

  useEffect(() => {
    fetchPlans();
  }, [page, search, filterVeg]);

  const openAddModal = () => {
    setSelectedPlan(null);
    setName("");
    setDescription("");
    setIsVegetarian(true);
    setIsNonVegetarian(false);
    setWaterIntakeGoal("3-4 litres per day");

    setEarlyMorningItems("");
    setBreakfastItems("");
    setMidSnackItems("");
    setLunchItems("");
    setEveningSnackItems("");
    setDinnerItems("");

    setIsModalOpen(true);
  };

  const openEditModal = (plan: DietPlan) => {
    setSelectedPlan(plan);
    setName(plan.name);
    setDescription(plan.description || "");
    setIsVegetarian(plan.isVegetarian);
    setIsNonVegetarian(plan.isNonVegetarian);
    setWaterIntakeGoal(plan.waterIntakeGoal);

    // Helpers to convert meal array to comma-separated text
    const getItemsString = (mealsList?: MealItem[]) => {
      if (!mealsList || mealsList.length === 0) return "";
      return mealsList[0].items.join(", ");
    };

    setEarlyMorningItems(getItemsString(plan.meals.earlyMorning));
    setBreakfastItems(getItemsString(plan.meals.breakfast));
    setMidSnackItems(getItemsString(plan.meals.midSnack));
    setLunchItems(getItemsString(plan.meals.lunch));
    setEveningSnackItems(getItemsString(plan.meals.eveningSnack));
    setDinnerItems(getItemsString(plan.meals.dinner));

    setIsModalOpen(true);
  };

  const handleDeleteClick = (plan: DietPlan) => {
    setPlanToDelete(plan);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!planToDelete) return;
    try {
      await api.delete(`/diet-plans/${planToDelete._id}`);
      toast.success("Diet template deleted");
      fetchPlans();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete template");
    } finally {
      setIsDeleteConfirmOpen(false);
      setPlanToDelete(null);
    }
  };

  const parseMealInput = (name: string, input: string): MealItem[] => {
    if (!input.trim()) return [];
    const items = input
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i.length > 0);
    return items.length > 0 ? [{ name, items }] : [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);

    const payload = {
      name,
      description: description || undefined,
      isTemplate: true,
      isVegetarian,
      isNonVegetarian,
      waterIntakeGoal,
      meals: {
        earlyMorning: parseMealInput("Early Morning", earlyMorningItems),
        breakfast: parseMealInput("Breakfast", breakfastItems),
        midSnack: parseMealInput("Mid Snack", midSnackItems),
        lunch: parseMealInput("Lunch", lunchItems),
        eveningSnack: parseMealInput("Evening Snack", eveningSnackItems),
        dinner: parseMealInput("Dinner", dinnerItems),
      },
    };

    try {
      if (selectedPlan) {
        await api.put(`/diet-plans/${selectedPlan._id}`, payload);
        toast.success("Diet template updated successfully");
      } else {
        await api.post("/diet-plans", payload);
        toast.success("Diet template created successfully");
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to save template");
    } finally {
      setSubmitLoading(false);
    }
  };



  return (
    <div className="space-y-4 pb-12">
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm pt-2 pb-4 border-b border-border -mx-4 px-4 md:-mx-6 md:px-6">
        <div className="flex items-center gap-2 mb-2">
          <Button variant="ghost" size="sm" onClick={() => router.push("/owner/settings")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Settings
          </Button>
        </div>

        <PageHeader
          title="Diet Templates"
          subtitle={`${pagination?.total ?? plans.length} templates configured`}
          actions={
            <Button onClick={openAddModal} size="sm">
              <Plus className="h-4 w-4 mr-2" /> Add Diet Template
            </Button>
          }
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates by name..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 bg-muted p-1 rounded-md shrink-0">
          <button
            onClick={() => setFilterVeg("all")}
            className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-all ${filterVeg === "all" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterVeg("veg")}
            className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-all flex items-center gap-1 ${filterVeg === "veg" ? "bg-background shadow text-green-600 font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Leaf className="h-3 w-3" /> Veg
          </button>
          <button
            onClick={() => setFilterVeg("non-veg")}
            className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-all flex items-center gap-1 ${filterVeg === "non-veg" ? "bg-background shadow text-red-600 font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Non-Veg
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((p) => (
            <Card key={p._id} className="overflow-hidden hover:shadow-md transition-shadow relative">
              <CardContent className="p-4 flex flex-col justify-between h-full gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                        <Utensils className="h-4 w-4 text-primary shrink-0" />
                        {p.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description || "No description provided."}</p>
                    </div>

                    <div className="flex flex-col gap-1 shrink-0 items-end">
                      {p.isVegetarian && (
                        <span className="flex items-center gap-0.5 text-[10px] text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                          <Leaf className="h-3 w-3" /> Veg
                        </span>
                      )}
                      {p.isNonVegetarian && (
                        <span className="flex items-center gap-0.5 text-[10px] text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                          Non-Veg
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    <p className="flex items-center gap-1"><Droplet className="h-3.5 w-3.5 text-blue-500" /> <strong>Water:</strong> {p.waterIntakeGoal}</p>

                    <div className="mt-2 grid grid-cols-2 gap-2 bg-muted/30 p-2 rounded-lg border border-border/50">
                      <div>
                        <span className="font-medium text-foreground text-[10px] block">Breakfast</span>
                        <span className="text-[10px] truncate block">{p.meals.breakfast?.[0]?.items?.join(", ") || "—"}</span>
                      </div>
                      <div>
                        <span className="font-medium text-foreground text-[10px] block">Lunch</span>
                        <span className="text-[10px] truncate block">{p.meals.lunch?.[0]?.items?.join(", ") || "—"}</span>
                      </div>
                      <div>
                        <span className="font-medium text-foreground text-[10px] block">Dinner</span>
                        <span className="text-[10px] truncate block">{p.meals.dinner?.[0]?.items?.join(", ") || "—"}</span>
                      </div>
                      <div>
                        <span className="font-medium text-foreground text-[10px] block">Snacks</span>
                        <span className="text-[10px] truncate block">{(p.meals.eveningSnack?.[0]?.items || p.meals.midSnack?.[0]?.items)?.join(", ") || "—"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end border-t pt-3">
                  <Button variant="outline" size="sm" onClick={() => openEditModal(p)}>
                    <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(p)}>
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {plans.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-12">
              <p>No diet templates found. Click &quot;Add Diet Template&quot; to create one.</p>
            </div>
          )}
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={pagination.pages}
          onPageChange={setPage}
          totalItems={pagination.total}
          limit={pagination.limit}
          label="diet templates"
        />
      )}

      {/* Editor Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-background rounded-lg border shadow-lg max-w-lg w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b shrink-0 flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Utensils className="h-5 w-5 text-primary" />
                {selectedPlan ? "Edit Diet Template" : "Add Diet Template"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 pb-10 scroll-pb-10">
              <div className="space-y-1.5">
                <Label htmlFor="plan-name">Template Name *</Label>
                <Input
                  id="plan-name"
                  required
                  placeholder="e.g. Ketogenic Plan, Weight Loss Veg"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitLoading}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="plan-desc">Description</Label>
                <Input
                  id="plan-desc"
                  placeholder="Brief description of the template goals"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={submitLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="water-intake">Water Intake Goal</Label>
                  <Input
                    id="water-intake"
                    placeholder="e.g. 3-4 litres per day"
                    value={waterIntakeGoal}
                    onChange={(e) => setWaterIntakeGoal(e.target.value)}
                    disabled={submitLoading}
                  />
                </div>

                <div className="flex flex-col gap-2 justify-center pt-5">
                  <div className="flex items-center gap-2">
                    <input
                      id="plan-veg"
                      type="checkbox"
                      checked={isVegetarian}
                      onChange={(e) => setIsVegetarian(e.target.checked)}
                      disabled={submitLoading}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="plan-veg" className="cursor-pointer text-xs">Vegetarian</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="plan-nonveg"
                      type="checkbox"
                      checked={isNonVegetarian}
                      onChange={(e) => setIsNonVegetarian(e.target.checked)}
                      disabled={submitLoading}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="plan-nonveg" className="cursor-pointer text-xs">Non-Vegetarian</Label>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <h4 className="font-semibold text-sm text-primary flex items-center gap-1.5">
                  Meal Composition
                  <span className="text-[10px] font-normal text-muted-foreground">(Enter food items separated by commas)</span>
                </h4>

                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="early-morning" className="text-xs">Early Morning</Label>
                    <Input
                      id="early-morning"
                      placeholder="e.g. Green Tea, Lemon Water, Almonds"
                      value={earlyMorningItems}
                      onChange={(e) => setEarlyMorningItems(e.target.value)}
                      disabled={submitLoading}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="breakfast" className="text-xs">Breakfast *</Label>
                    <Input
                      id="breakfast"
                      placeholder="e.g. Oatmeal, Milk, Boiled Eggs"
                      value={breakfastItems}
                      onChange={(e) => setBreakfastItems(e.target.value)}
                      disabled={submitLoading}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="mid-snack" className="text-xs">Mid Snack</Label>
                    <Input
                      id="mid-snack"
                      placeholder="e.g. Apple, Green Tea, Walnuts"
                      value={midSnackItems}
                      onChange={(e) => setMidSnackItems(e.target.value)}
                      disabled={submitLoading}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="lunch" className="text-xs">Lunch *</Label>
                    <Input
                      id="lunch"
                      placeholder="e.g. Roti, Paneer Sabji, Brown Rice, Salad"
                      value={lunchItems}
                      onChange={(e) => setLunchItems(e.target.value)}
                      disabled={submitLoading}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="evening-snack" className="text-xs">Evening Snack</Label>
                    <Input
                      id="evening-snack"
                      placeholder="e.g. Roasted Chana, Green Tea"
                      value={eveningSnackItems}
                      onChange={(e) => setEveningSnackItems(e.target.value)}
                      disabled={submitLoading}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="dinner" className="text-xs">Dinner *</Label>
                    <Input
                      id="dinner"
                      placeholder="e.g. Chicken Breast, Soup, Salad, Roti"
                      value={dinnerItems}
                      onChange={(e) => setDinnerItems(e.target.value)}
                      disabled={submitLoading}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4 shrink-0">
                <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)} disabled={submitLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitLoading}>
                  {submitLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Template"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-150">
          <div className="bg-background rounded-lg border shadow-lg max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Delete Diet Template</h2>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete the diet template <strong className="text-foreground">"{planToDelete?.name}"</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsDeleteConfirmOpen(false);
                    setPlanToDelete(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteConfirm}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
