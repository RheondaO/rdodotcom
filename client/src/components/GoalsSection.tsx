import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Target, 
  Plus, 
  Trophy, 
  Calendar, 
  TrendingUp,
  CheckCircle,
  Clock,
  Flag,
  Edit,
  Trash2,
  Star
} from "lucide-react";
import { format, differenceInDays, isAfter, isBefore, isToday, isYesterday, isTomorrow } from "date-fns";

interface Goal {
  id: number;
  title: string;
  description: string;
  category: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  targetDate: string;
  isCompleted: boolean;
  createdAt: string;
}

interface GoalsSectionProps {
  selectedDate: Date;
}

export default function GoalsSection({ selectedDate }: GoalsSectionProps) {
  const getDateLabel = () => {
    if (isToday(selectedDate)) return "Today";
    if (isYesterday(selectedDate)) return "Yesterday";
    if (isTomorrow(selectedDate)) return "Tomorrow";
    return format(selectedDate, 'EEEE');
  };

  const [goals, setGoals] = useState<Goal[]>([
    {
      id: 1,
      title: "Drink 8 Glasses of Water Daily",
      description: "Maintain proper hydration for better health",
      category: "health",
      targetValue: 240,
      currentValue: 180,
      unit: "glasses",
      targetDate: "2025-07-01",
      isCompleted: false,
      createdAt: "2025-06-01"
    },
    {
      id: 2,
      title: "Save $5000 Emergency Fund",
      description: "Build financial security with emergency savings",
      category: "finance",
      targetValue: 5000,
      currentValue: 3200,
      unit: "dollars",
      targetDate: "2025-12-31",
      isCompleted: false,
      createdAt: "2025-01-01"
    },
    {
      id: 3,
      title: "Exercise 30 Days Streak",
      description: "Build a consistent exercise habit",
      category: "health",
      targetValue: 30,
      currentValue: 30,
      unit: "days",
      targetDate: "2025-06-30",
      isCompleted: true,
      createdAt: "2025-05-01"
    }
  ]);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "health",
    targetValue: 0,
    unit: "",
    targetDate: ""
  });

  const categories = [
    { value: "health", label: "Health & Wellness", color: "bg-gradient-to-r from-green-400 to-emerald-400" },
    { value: "finance", label: "Finance", color: "bg-gradient-to-r from-emerald-400 to-teal-400" },
    { value: "work", label: "Work & Career", color: "bg-gradient-to-r from-blue-400 to-cyan-400" },
    { value: "personal", label: "Personal Growth", color: "bg-gradient-to-r from-purple-400 to-pink-400" }
  ];

  const activeGoals = goals.filter(goal => !goal.isCompleted);
  const completedGoals = goals.filter(goal => goal.isCompleted);

  const handleCreateGoal = () => {
    if (!newGoal.title || !newGoal.targetDate) return;

    const goal: Goal = {
      id: Date.now(),
      ...newGoal,
      currentValue: 0,
      isCompleted: false,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    };

    setGoals([...goals, goal]);
    setNewGoal({
      title: "",
      description: "",
      category: "health",
      targetValue: 0,
      unit: "",
      targetDate: ""
    });
    setShowCreateDialog(false);
  };

  const updateGoalProgress = (goalId: number, newValue: number) => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        const isCompleted = newValue >= goal.targetValue;
        return { ...goal, currentValue: newValue, isCompleted };
      }
      return goal;
    }));
  };

  const deleteGoal = (goalId: number) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-heading font-bold bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
            Goals & Achievements
          </h3>
          <p className="text-muted-foreground dark:text-gray-300 mt-1">
            Set meaningful goals and track your progress
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white font-medium rounded-xl shadow-lg">
              <Plus className="mr-2 h-4 w-4" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-gray-900 border-0 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">Create New Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-gray-700 dark:text-gray-300">Goal Title</Label>
                <Input
                  id="title"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="e.g., Read 12 books this year"
                  className="dark:bg-gray-800 dark:text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">Description</Label>
                <Textarea
                  id="description"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Why is this goal important to you?"
                  className="dark:bg-gray-800 dark:text-white"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category" className="text-gray-700 dark:text-gray-300">Category</Label>
                  <Select value={newGoal.category} onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}>
                    <SelectTrigger className="dark:bg-gray-800 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="targetDate" className="text-gray-700 dark:text-gray-300">Target Date</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                    className="dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="targetValue" className="text-gray-700 dark:text-gray-300">Target Value</Label>
                  <Input
                    id="targetValue"
                    type="number"
                    value={newGoal.targetValue || ""}
                    onChange={(e) => setNewGoal({ ...newGoal, targetValue: Number(e.target.value) })}
                    placeholder="e.g., 12"
                    className="dark:bg-gray-800 dark:text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="unit" className="text-gray-700 dark:text-gray-300">Unit</Label>
                  <Input
                    id="unit"
                    value={newGoal.unit}
                    onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                    placeholder="e.g., books, dollars, hours"
                    className="dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
              
              <Button onClick={handleCreateGoal} className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white">
                Create Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Goals */}
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <Target className="h-5 w-5 text-pink-600 dark:text-pink-400" />
            <span>Active Goals ({activeGoals.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeGoals.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No active goals. Create your first goal to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeGoals.map(goal => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onUpdateProgress={updateGoalProgress}
                  onDelete={deleteGoal}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>Completed Goals ({completedGoals.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {completedGoals.map(goal => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onUpdateProgress={updateGoalProgress}
                  onDelete={deleteGoal}
                  isCompleted
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface GoalCardProps {
  goal: Goal;
  onUpdateProgress: (goalId: number, newValue: number) => void;
  onDelete: (goalId: number) => void;
  isCompleted?: boolean;
}

function GoalCard({ goal, onUpdateProgress, onDelete, isCompleted = false }: GoalCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(goal.currentValue);
  
  const progress = (goal.currentValue / goal.targetValue) * 100;
  const daysRemaining = differenceInDays(new Date(goal.targetDate), new Date());
  const isOverdue = daysRemaining < 0;
  
  const categoryColors = {
    health: "bg-gradient-to-r from-green-400 to-emerald-400",
    finance: "bg-gradient-to-r from-emerald-400 to-teal-400",
    work: "bg-gradient-to-r from-blue-400 to-cyan-400",
    personal: "bg-gradient-to-r from-purple-400 to-pink-400"
  };

  const handleSaveProgress = () => {
    onUpdateProgress(goal.id, editValue);
    setIsEditing(false);
  };

  return (
    <div className={`bg-white/60 dark:bg-gray-800/60 rounded-xl p-4 backdrop-blur-sm border-l-4 ${
      isCompleted ? 'border-yellow-400' : 'border-pink-400'
    }`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <Badge className={`${categoryColors[goal.category]} text-white border-0`}>
                {goal.category}
              </Badge>
              {isCompleted && <Star className="h-4 w-4 text-yellow-500" />}
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white">{goal.title}</h4>
            {goal.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{goal.description}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(goal.id)}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {goal.currentValue} / {goal.targetValue} {goal.unit}
            </span>
          </div>
          <Progress value={Math.min(progress, 100)} className="h-2" />
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground dark:text-gray-400">
              {Math.round(progress)}% complete
            </span>
            {!isCompleted && (
              <span className={`flex items-center space-x-1 ${
                isOverdue ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
              }`}>
                <Calendar className="h-3 w-3" />
                <span>
                  {isOverdue 
                    ? `${Math.abs(daysRemaining)} days overdue`
                    : `${daysRemaining} days left`
                  }
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Edit Progress */}
        {isEditing && !isCompleted && (
          <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Update Progress
            </Label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(Number(e.target.value))}
                className="flex-1 dark:bg-gray-800 dark:text-white"
                min="0"
                max={goal.targetValue}
              />
              <Button
                onClick={handleSaveProgress}
                size="sm"
                className="bg-gradient-to-r from-pink-400 to-purple-500 text-white"
              >
                Save
              </Button>
              <Button
                onClick={() => setIsEditing(false)}
                size="sm"
                variant="outline"
                className="dark:border-gray-600 dark:text-gray-300"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Goal Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Created {format(new Date(goal.createdAt), 'MMM d, yyyy')}</span>
          <span>Due {format(new Date(goal.targetDate), 'MMM d, yyyy')}</span>
        </div>
      </div>
    </div>
  );
}