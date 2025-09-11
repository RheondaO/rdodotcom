import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
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
import { apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../hooks/useAuth";
import type { Goal, InsertGoal } from "@shared/schema";



interface GoalsSectionProps {
  selectedDate: Date;
}

export default function GoalsSection({ selectedDate }: GoalsSectionProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  
  
  const getDateLabel = () => {
    if (isToday(selectedDate)) return "Today";
    if (isYesterday(selectedDate)) return "Yesterday";
    if (isTomorrow(selectedDate)) return "Tomorrow";
    return format(selectedDate, 'EEEE');
  };

  // Fetch goals from database
  const { data: goals = [], isLoading, error, isError } = useQuery<Goal[]>({
    queryKey: ['/api/goals'],
  });

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: async (goalData: InsertGoal) => {
      return apiRequest('POST', '/api/goals', goalData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      setShowCreateDialog(false);
      setNewGoal({
        title: "",
        description: "",
        category: "health",
        targetValue: "0",
        unit: "",
        targetDate: ""
      });
      toast({
        title: "Goal Created",
        description: "Your goal has been successfully created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update goal mutation
  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string | number; updates: Partial<Goal> }) => {
      return apiRequest('PATCH', `/api/goals/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
    },
  });

  // Delete goal mutation
  const deleteGoalMutation = useMutation({
    mutationFn: async (id: string | number) => {
      return apiRequest('DELETE', `/api/goals/${id}`);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      toast({
        title: "Goal Deleted",
        description: "Your goal has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "health",
    targetValue: "0",
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
    
    if (!isAdmin) {
      toast({
        title: "Authentication Required",
        description: "Records can only be created when logged in as the admin. Please log in to continue.",
        variant: "destructive",
      });
      return;
    }
    
    if (!newGoal.title || !newGoal.targetDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in the goal title and target date.",
        variant: "destructive",
      });
      return;
    }

    // Check if user has reached the maximum goal limit (5 goals)
    if (goals.length >= 5) {
      toast({
        title: "Goal Limit Reached",
        description: "You can only have a maximum of 5 goals at a time. Delete an existing goal to create a new one.",
        variant: "destructive",
      });
      return;
    }
    createGoalMutation.mutate({
      title: newGoal.title,
      description: newGoal.description || undefined,
      category: newGoal.category,
      targetValue: newGoal.targetValue.toString(),
      currentValue: "0",
      unit: newGoal.unit || undefined,
      targetDate: newGoal.targetDate,
      isCompleted: false
    });
  };

  const updateGoalProgress = (goalId: string | number, newValue: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    
    const targetVal = parseFloat(goal.targetValue || "0");
    const currentVal = parseFloat(newValue);
    const isCompleted = currentVal >= targetVal;
    
    updateGoalMutation.mutate({
      id: goalId,
      updates: {
        currentValue: newValue,
        isCompleted
      }
    });
  };

  const deleteGoal = (goalId: string | number) => {
    deleteGoalMutation.mutate(goalId);
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
            <Button 
              disabled={goals.length >= 5}
              className={`bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white font-medium rounded-xl shadow-lg ${goals.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Goal {goals.length >= 5 ? "(5/5)" : `(${goals.length}/5)`}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-[#17111d] border-0 rounded-2xl">
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
                  className="dark:bg-[#17111d] dark:text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">Description</Label>
                <Textarea
                  id="description"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Why is this goal important to you?"
                  className="dark:bg-[#17111d] dark:text-white"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category" className="text-gray-700 dark:text-gray-300">Category</Label>
                  <Select value={newGoal.category} onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}>
                    <SelectTrigger className="dark:bg-[#17111d] dark:text-white">
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
                    className="dark:bg-[#17111d] dark:text-white"
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
                    onChange={(e) => setNewGoal({ ...newGoal, targetValue: e.target.value })}
                    placeholder="e.g., 12"
                    className="dark:bg-[#17111d] dark:text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="unit" className="text-gray-700 dark:text-gray-300">Unit</Label>
                  <Input
                    id="unit"
                    value={newGoal.unit}
                    onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                    placeholder="e.g., books, dollars, hours"
                    className="dark:bg-[#17111d] dark:text-white"
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleCreateGoal} 
                disabled={createGoalMutation.isPending || !newGoal.title || !newGoal.targetDate}
                className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white disabled:opacity-50"
              >
                {createGoalMutation.isPending ? "Creating..." : "Create Goal"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Goals */}
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg border border-pink-200/50 dark:border-pink-800/50 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <Target className="h-5 w-5 text-pink-600 dark:text-pink-400" />
            <span>Active Goals ({activeGoals.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading goals...</p>
            </div>
          ) : activeGoals.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No active goals. Create your first goal to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="active-goals-container">
              {activeGoals.map(goal => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onUpdateProgress={updateGoalProgress}
                  onDelete={deleteGoal}
                  data-testid={`goal-card-${goal.id}`}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg border border-pink-200/50 dark:border-pink-800/50 rounded-2xl">
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
  onUpdateProgress: (goalId: string | number, newValue: string) => void;
  onDelete: (goalId: string | number) => void;
  isCompleted?: boolean;
  'data-testid'?: string;
}

function GoalCard({ goal, onUpdateProgress, onDelete, isCompleted = false, 'data-testid': testId }: GoalCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(goal.currentValue || "0");
  
  const currentVal = parseFloat(goal.currentValue || "0");
  const targetVal = parseFloat(goal.targetValue || "0");
  const progress = targetVal > 0 ? (currentVal / targetVal) * 100 : 0;
  const daysRemaining = goal.targetDate ? differenceInDays(new Date(goal.targetDate), new Date()) : 0;
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
    <div 
      className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border-l-4 ${
        isCompleted ? 'border-yellow-400' : 'border-pink-400'
      }`}
      data-testid={testId}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <Badge className={`${categoryColors[goal.category as keyof typeof categoryColors] || 'bg-gray-500'} text-white border-0`}>
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
          <div className="space-y-2 p-3 bg-gray-50 dark:bg-[#17111d] rounded-lg">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Update Progress
            </Label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={editValue || ""}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-1 dark:bg-[#17111d] dark:text-white"
                min="0"
                max={goal.targetValue || undefined}
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
          <span>Created {goal.createdAt ? format(goal.createdAt, 'MMM d, yyyy') : 'Unknown'}</span>
          <span>Due {goal.targetDate ? format(goal.targetDate, 'MMM d, yyyy') : 'No date set'}</span>
        </div>
      </div>
    </div>
  );
}