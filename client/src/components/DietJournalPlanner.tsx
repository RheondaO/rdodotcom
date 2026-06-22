import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  format,
  addDays,
  subDays,
  startOfDay,
  isToday,
  isBefore,
  isAfter,
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import {
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Utensils,
  Coffee,
  Sun,
  Moon,
  Apple,
  Target,
  TrendingUp,
  Edit2,
  Trash2,
  Clock,
  Search,
  BookOpen,
  PieChart,
} from "lucide-react";

interface DietJournalPlannerProps {
  selectedDate: Date;
  isReadOnly?: boolean;
}

interface MealPlan {
  id: number;
  date: string;
  mealType: string;
  plannedFood: string;
  plannedCalories?: number;
  plannedProtein?: number;
  plannedCarbs?: number;
  plannedFat?: number;
  notes?: string;
  isCompleted?: boolean;
  createdAt?: string;
}

interface DietGoal {
  id: number;
  name: string;
  description?: string;
  targetCalories?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFat?: number;
  targetFiber?: number;
  targetWater?: number;
  isActive?: boolean;
}

const mealTypeIcons = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
  snack: Apple,
};

const mealTypeColors = {
  breakfast:
    "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200",
  lunch:
    "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200",
  dinner:
    "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200",
  snack: "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200",
};

export default function DietJournalPlanner({
  selectedDate,
  isReadOnly = false,
}: DietJournalPlannerProps) {
  const queryClient = useQueryClient();

  // State management
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    // Calculate start date for 11-day view (5 days before selected date)
    return subDays(selectedDate, 5);
  });

  const [showModal, setShowModal] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<MealPlan | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Generate 11-day date range
  const calendarDates = Array.from({ length: 11 }, (_, index) =>
    addDays(currentWeekStart, index),
  );

  const startDateStr = format(currentWeekStart, "yyyy-MM-dd");
  const endDateStr = format(addDays(currentWeekStart, 10), "yyyy-MM-dd");

  // Form states
  const [mealPlanForm, setMealPlanForm] = useState({
    date: format(selectedDate, "yyyy-MM-dd"),
    mealType: "breakfast",
    plannedFood: "",
    plannedCalories: "",
    plannedProtein: "",
    plannedCarbs: "",
    plannedFat: "",
    notes: "",
  });

  const [dietGoalForm, setDietGoalForm] = useState({
    name: "",
    description: "",
    targetCalories: "",
    targetProtein: "",
    targetCarbs: "",
    targetFat: "",
    targetFiber: "",
    targetWater: "",
  });

  // Queries
  const { data: mealPlans = [], isLoading: mealPlansLoading } = useQuery({
    queryKey: [
      "/api/fitness/meal-plans",
      { startDate: startDateStr, endDate: endDateStr },
    ],
    queryFn: async () => {
      const response = await fetch(
        `/api/fitness/meal-plans?startDate=${startDateStr}&endDate=${endDateStr}`,
      );
      if (!response.ok) throw new Error("Failed to fetch meal plans");
      return response.json();
    },
  });

  const { data: dietGoals = [] } = useQuery({
    queryKey: ["/api/fitness/diet-goals"],
    queryFn: async () => {
      const response = await fetch("/api/fitness/diet-goals");
      if (!response.ok) throw new Error("Failed to fetch diet goals");
      return response.json();
    },
  });

  const { data: foodDatabase = [] } = useQuery({
    queryKey: ["/api/fitness/food-database", { search: searchTerm }],
    queryFn: async () => {
      const url = searchTerm
        ? `/api/fitness/food-database?search=${encodeURIComponent(searchTerm)}`
        : "/api/fitness/food-database";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch food database");
      return response.json();
    },
    enabled: searchTerm.length > 0,
  });

  // Mutations
  const createMealPlanMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/fitness/meal-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create meal plan");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fitness/meal-plans"] });
      setShowModal(null);
      resetMealPlanForm();
    },
  });

  const updateMealPlanMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await fetch(`/api/fitness/meal-plans/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update meal plan");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fitness/meal-plans"] });
      setShowModal(null);
      setEditingPlan(null);
      resetMealPlanForm();
    },
  });

  const deleteMealPlanMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/fitness/meal-plans/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete meal plan");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fitness/meal-plans"] });
    },
  });

  const createDietGoalMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/fitness/diet-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create diet goal");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fitness/diet-goals"] });
      setShowModal(null);
      resetDietGoalForm();
    },
  });

  // Helper functions
  const resetMealPlanForm = () => {
    setMealPlanForm({
      date: format(selectedDate, "yyyy-MM-dd"),
      mealType: "breakfast",
      plannedFood: "",
      plannedCalories: "",
      plannedProtein: "",
      plannedCarbs: "",
      plannedFat: "",
      notes: "",
    });
  };

  const resetDietGoalForm = () => {
    setDietGoalForm({
      name: "",
      description: "",
      targetCalories: "",
      targetProtein: "",
      targetCarbs: "",
      targetFat: "",
      targetFiber: "",
      targetWater: "",
    });
  };

  const getMealPlansForDate = (date: Date): MealPlan[] => {
    const dateStr = format(date, "yyyy-MM-dd");
    return mealPlans.filter((plan: MealPlan) => plan.date === dateStr);
  };

  const getMealPlansForMealType = (
    date: Date,
    mealType: string,
  ): MealPlan[] => {
    return getMealPlansForDate(date).filter(
      (plan: MealPlan) => plan.mealType === mealType,
    );
  };

  const calculateDayTotals = (date: Date) => {
    const dayPlans = getMealPlansForDate(date);
    return dayPlans.reduce(
      (totals, plan) => ({
        calories: totals.calories + (plan.plannedCalories || 0),
        protein: totals.protein + (plan.plannedProtein || 0),
        carbs: totals.carbs + (plan.plannedCarbs || 0),
        fat: totals.fat + (plan.plannedFat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );
  };

  const handleCreateMealPlan = () => {
    const numericData = {
      ...mealPlanForm,
      plannedCalories: mealPlanForm.plannedCalories
        ? parseFloat(mealPlanForm.plannedCalories)
        : undefined,
      plannedProtein: mealPlanForm.plannedProtein
        ? parseFloat(mealPlanForm.plannedProtein)
        : undefined,
      plannedCarbs: mealPlanForm.plannedCarbs
        ? parseFloat(mealPlanForm.plannedCarbs)
        : undefined,
      plannedFat: mealPlanForm.plannedFat
        ? parseFloat(mealPlanForm.plannedFat)
        : undefined,
    };

    if (editingPlan) {
      updateMealPlanMutation.mutate({ ...numericData, id: editingPlan.id });
    } else {
      createMealPlanMutation.mutate(numericData);
    }
  };

  const handleEditPlan = (plan: MealPlan) => {
    setEditingPlan(plan);
    setMealPlanForm({
      date: plan.date,
      mealType: plan.mealType,
      plannedFood: plan.plannedFood,
      plannedCalories: plan.plannedCalories?.toString() || "",
      plannedProtein: plan.plannedProtein?.toString() || "",
      plannedCarbs: plan.plannedCarbs?.toString() || "",
      plannedFat: plan.plannedFat?.toString() || "",
      notes: plan.notes || "",
    });
    setShowModal("meal-plan");
  };

  const handleCreateDietGoal = () => {
    const numericData = {
      ...dietGoalForm,
      targetCalories: dietGoalForm.targetCalories
        ? parseFloat(dietGoalForm.targetCalories)
        : undefined,
      targetProtein: dietGoalForm.targetProtein
        ? parseFloat(dietGoalForm.targetProtein)
        : undefined,
      targetCarbs: dietGoalForm.targetCarbs
        ? parseFloat(dietGoalForm.targetCarbs)
        : undefined,
      targetFat: dietGoalForm.targetFat
        ? parseFloat(dietGoalForm.targetFat)
        : undefined,
      targetFiber: dietGoalForm.targetFiber
        ? parseFloat(dietGoalForm.targetFiber)
        : undefined,
      targetWater: dietGoalForm.targetWater
        ? parseFloat(dietGoalForm.targetWater)
        : undefined,
    };

    createDietGoalMutation.mutate(numericData);
  };

  const handleFoodSelect = (food: {
    name: string;
    caloriesPerServing?: number;
    proteinPerServing?: number;
    carbsPerServing?: number;
    fatPerServing?: number;
  }) => {
    setMealPlanForm((prev) => ({
      ...prev,
      plannedFood: food.name,
      plannedCalories: food.caloriesPerServing?.toString() || "",
      plannedProtein: food.proteinPerServing?.toString() || "",
      plannedCarbs: food.carbsPerServing?.toString() || "",
      plannedFat: food.fatPerServing?.toString() || "",
    }));
    setSearchTerm("");
  };

  // Navigation functions
  const navigatePrevious = () => {
    setCurrentWeekStart((prev) => subDays(prev, 7));
  };

  const navigateNext = () => {
    setCurrentWeekStart((prev) => addDays(prev, 7));
  };

  const navigateToToday = () => {
    setCurrentWeekStart(subDays(new Date(), 5));
  };

  const activeDietGoal = dietGoals.find((goal: DietGoal) => goal.isActive);

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Diet Journal & Planner
          </h2>
          <Button variant="outline" size="sm" onClick={navigateToToday}>
            Today
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={navigatePrevious}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium min-w-[200px] text-center">
            {format(currentWeekStart, "MMM d")} -{" "}
            {format(addDays(currentWeekStart, 10), "MMM d, yyyy")}
          </span>
          <Button variant="outline" size="sm" onClick={navigateNext}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        {!isReadOnly && (
          <div className="flex gap-2">
            <Button
              onClick={() => setShowModal("diet-goal")}
              size="sm"
              variant="outline"
            >
              <Target className="w-4 h-4 mr-2" />
              Set Diet Goals
            </Button>
            <Button
              onClick={() => {
                setEditingPlan(null);
                resetMealPlanForm();
                setShowModal("meal-plan");
              }}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Plan Meal
            </Button>
          </div>
        )}
      </div>

      {/* Active Diet Goals */}
      {activeDietGoal && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5" />
              Active Diet Goal: {activeDietGoal.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {activeDietGoal.targetCalories && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {activeDietGoal.targetCalories}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Calories
                  </div>
                </div>
              )}
              {activeDietGoal.targetProtein && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {activeDietGoal.targetProtein}g
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Protein
                  </div>
                </div>
              )}
              {activeDietGoal.targetCarbs && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {activeDietGoal.targetCarbs}g
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Carbs
                  </div>
                </div>
              )}
              {activeDietGoal.targetFat && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {activeDietGoal.targetFat}g
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Fat
                  </div>
                </div>
              )}
              {activeDietGoal.targetWater && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-600">
                    {activeDietGoal.targetWater}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Glasses Water
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 11-Day Calendar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {calendarDates.map((date) => {
          const dayPlans = getMealPlansForDate(date);
          const dayTotals = calculateDayTotals(date);
          const isPast = isBefore(date, startOfDay(new Date()));
          const isCurrentDay = isToday(date);

          return (
            <Card
              key={format(date, "yyyy-MM-dd")}
              className={`${isCurrentDay ? "ring-2 ring-blue-500" : ""} ${isPast ? "opacity-75" : ""}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm text-gray-600 dark:text-gray-400">
                      {format(date, "EEE")}
                    </div>
                    <div className="text-lg font-bold">
                      {format(date, "MMM d")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Total</div>
                    <div className="text-sm font-medium">
                      {dayTotals.calories} cal
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* Meal Types */}
                {["breakfast", "lunch", "dinner", "snack"].map((mealType) => {
                  const mealPlans = getMealPlansForMealType(date, mealType);
                  const MealIcon =
                    mealTypeIcons[mealType as keyof typeof mealTypeIcons];

                  return (
                    <div key={mealType} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MealIcon className="w-3 h-3" />
                          <span className="text-xs font-medium capitalize">
                            {mealType}
                          </span>
                        </div>
                        {!isReadOnly && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0"
                            onClick={() => {
                              setMealPlanForm((prev) => ({
                                ...prev,
                                date: format(date, "yyyy-MM-dd"),
                                mealType,
                              }));
                              setEditingPlan(null);
                              setShowModal("meal-plan");
                            }}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        )}
                      </div>

                      {mealPlans.length > 0 ? (
                        <div className="space-y-1">
                          {mealPlans.map((plan: MealPlan) => (
                            <div
                              key={plan.id}
                              className="flex items-center justify-between p-1 rounded text-xs bg-gray-50 dark:bg-gray-800"
                            >
                              <div className="flex items-center gap-1">
                                {plan.isCompleted ? (
                                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                                ) : (
                                  <Circle className="w-3 h-3 text-gray-400" />
                                )}
                                <span className="truncate flex-1">
                                  {plan.plannedFood}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-xs">
                                  {plan.plannedCalories || 0}
                                </span>
                                {!isReadOnly && (
                                  <div className="flex">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-4 w-4 p-0"
                                      onClick={() => handleEditPlan(plan)}
                                    >
                                      <Edit2 className="w-2 h-2" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-4 w-4 p-0 text-red-500"
                                      onClick={() =>
                                        deleteMealPlanMutation.mutate(plan.id)
                                      }
                                    >
                                      <Trash2 className="w-2 h-2" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 italic">
                          No plans
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Progress against goals */}
                {activeDietGoal &&
                  activeDietGoal.targetCalories &&
                  dayTotals.calories > 0 && (
                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Goal Progress</span>
                        <span>
                          {Math.round(
                            (dayTotals.calories /
                              activeDietGoal.targetCalories) *
                              100,
                          )}
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          (dayTotals.calories / activeDietGoal.targetCalories) *
                          100
                        }
                        className="h-1"
                      />
                    </div>
                  )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Meal Plan Modal */}
      <Dialog
        open={showModal === "meal-plan"}
        onOpenChange={() => setShowModal(null)}
      >
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? "Edit Meal Plan" : "Plan Meal"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={mealPlanForm.date}
                  onChange={(e) =>
                    setMealPlanForm((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Meal Type</Label>
                <Select
                  value={mealPlanForm.mealType}
                  onValueChange={(value) =>
                    setMealPlanForm((prev) => ({ ...prev, mealType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Food Search</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Search foods..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline" size="icon">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              {searchTerm && foodDatabase.length > 0 && (
                <ScrollArea className="h-32 w-full border rounded mt-2">
                  <div className="p-2 space-y-1">
                    {foodDatabase
                      .slice(0, 10)
                      .map(
                        (food: {
                          id: number;
                          name: string;
                          caloriesPerServing?: number;
                          category: string;
                        }) => (
                          <Button
                            key={food.id}
                            variant="ghost"
                            className="w-full justify-start text-left"
                            onClick={() => handleFoodSelect(food)}
                          >
                            <div>
                              <div className="font-medium">{food.name}</div>
                              <div className="text-xs text-gray-500">
                                {food.caloriesPerServing} cal • {food.category}
                              </div>
                            </div>
                          </Button>
                        ),
                      )}
                  </div>
                </ScrollArea>
              )}
            </div>

            <div>
              <Label>Planned Food</Label>
              <Input
                placeholder="e.g., Grilled chicken breast with vegetables"
                value={mealPlanForm.plannedFood}
                onChange={(e) =>
                  setMealPlanForm((prev) => ({
                    ...prev,
                    plannedFood: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Calories</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={mealPlanForm.plannedCalories}
                  onChange={(e) =>
                    setMealPlanForm((prev) => ({
                      ...prev,
                      plannedCalories: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Protein (g)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={mealPlanForm.plannedProtein}
                  onChange={(e) =>
                    setMealPlanForm((prev) => ({
                      ...prev,
                      plannedProtein: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Carbs (g)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={mealPlanForm.plannedCarbs}
                  onChange={(e) =>
                    setMealPlanForm((prev) => ({
                      ...prev,
                      plannedCarbs: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Fat (g)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={mealPlanForm.plannedFat}
                  onChange={(e) =>
                    setMealPlanForm((prev) => ({
                      ...prev,
                      plannedFat: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                placeholder="Preparation notes, portion size, etc."
                value={mealPlanForm.notes}
                onChange={(e) =>
                  setMealPlanForm((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => setShowModal(null)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateMealPlan}
                disabled={
                  !mealPlanForm.plannedFood.trim() ||
                  createMealPlanMutation.isPending ||
                  updateMealPlanMutation.isPending
                }
                className="flex-1"
              >
                {editingPlan ? "Update" : "Create"} Plan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diet Goal Modal */}
      <Dialog
        open={showModal === "diet-goal"}
        onOpenChange={() => setShowModal(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Diet Goals</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Goal Name</Label>
              <Input
                placeholder="e.g., Weight Loss Diet, Muscle Building Plan"
                value={dietGoalForm.name}
                onChange={(e) =>
                  setDietGoalForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Describe your diet goals and approach"
                value={dietGoalForm.description}
                onChange={(e) =>
                  setDietGoalForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Daily Calories</Label>
                <Input
                  type="number"
                  placeholder="2000"
                  value={dietGoalForm.targetCalories}
                  onChange={(e) =>
                    setDietGoalForm((prev) => ({
                      ...prev,
                      targetCalories: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Protein (g)</Label>
                <Input
                  type="number"
                  placeholder="150"
                  value={dietGoalForm.targetProtein}
                  onChange={(e) =>
                    setDietGoalForm((prev) => ({
                      ...prev,
                      targetProtein: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Carbs (g)</Label>
                <Input
                  type="number"
                  placeholder="200"
                  value={dietGoalForm.targetCarbs}
                  onChange={(e) =>
                    setDietGoalForm((prev) => ({
                      ...prev,
                      targetCarbs: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Fat (g)</Label>
                <Input
                  type="number"
                  placeholder="70"
                  value={dietGoalForm.targetFat}
                  onChange={(e) =>
                    setDietGoalForm((prev) => ({
                      ...prev,
                      targetFat: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fiber (g)</Label>
                <Input
                  type="number"
                  placeholder="25"
                  value={dietGoalForm.targetFiber}
                  onChange={(e) =>
                    setDietGoalForm((prev) => ({
                      ...prev,
                      targetFiber: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Water (glasses)</Label>
                <Input
                  type="number"
                  placeholder="8"
                  value={dietGoalForm.targetWater}
                  onChange={(e) =>
                    setDietGoalForm((prev) => ({
                      ...prev,
                      targetWater: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => setShowModal(null)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateDietGoal}
                disabled={
                  !dietGoalForm.name.trim() || createDietGoalMutation.isPending
                }
                className="flex-1"
              >
                Set Goals
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
