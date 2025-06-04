import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Flame, 
  Plus, 
  Check, 
  X,
  TrendingUp,
  Calendar,
  Target,
  Award,
  Smile,
  Meh,
  Frown,
  Battery,
  Zap,
  AlertCircle,
  Coffee,
  Moon
} from "lucide-react";
import { format, isToday, isYesterday, isTomorrow, differenceInDays, startOfDay } from "date-fns";
import { useDailyData } from "@/hooks/use-daily-data";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Habit {
  id: number;
  name: string;
  description: string;
  category: string;
  targetFrequency: number;
  currentStreak: number;
  longestStreak: number;
  isActive: boolean;
  createdAt: string;
  completedToday: boolean;
}

interface DailyMood {
  mood: string;
  energyLevel: number;
  stressLevel: number;
}

interface HabitsSectionProps {
  selectedDate: Date;
}

export default function HabitsSection({ selectedDate }: HabitsSectionProps) {
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const { data: dailyEntry } = useDailyData(dateString);
  const queryClient = useQueryClient();

  const getDateLabel = () => {
    if (isToday(selectedDate)) return "Today";
    if (isYesterday(selectedDate)) return "Yesterday";
    if (isTomorrow(selectedDate)) return "Tomorrow";
    return format(selectedDate, 'EEEE');
  };

  const [habits, setHabits] = useState<Habit[]>([
    {
      id: 1,
      name: "Morning Meditation",
      description: "10 minutes of mindfulness meditation",
      category: "wellness",
      targetFrequency: 1,
      currentStreak: 7,
      longestStreak: 21,
      isActive: true,
      createdAt: "2025-05-01",
      completedToday: false
    },
    {
      id: 2,
      name: "Read for 30 Minutes",
      description: "Read books or educational content",
      category: "personal",
      targetFrequency: 1,
      currentStreak: 12,
      longestStreak: 18,
      isActive: true,
      createdAt: "2025-04-15",
      completedToday: false
    },
    {
      id: 3,
      name: "Daily Exercise",
      description: "Any form of physical activity",
      category: "health",
      targetFrequency: 1,
      currentStreak: 3,
      longestStreak: 15,
      isActive: true,
      createdAt: "2025-05-20",
      completedToday: false
    }
  ]);

  // Parse habit completions from daily entry
  const completedHabitIds = dailyEntry?.habitCompletions 
    ? JSON.parse(dailyEntry.habitCompletions) 
    : [];

  // Update habits with completion status based on selected date
  const habitsWithCompletion = habits.map(habit => ({
    ...habit,
    completedToday: completedHabitIds.includes(habit.id)
  }));

  const [dailyMood, setDailyMood] = useState<DailyMood>({
    mood: dailyEntry?.mood || "happy",
    energyLevel: dailyEntry?.energyLevel || 4,
    stressLevel: dailyEntry?.stressLevel || 2
  });

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: "",
    description: "",
    category: "health",
    targetFrequency: 1
  });

  const categories = [
    { value: "health", label: "Health & Fitness", icon: "💪", color: "bg-gradient-to-r from-green-400 to-emerald-400" },
    { value: "wellness", label: "Mental Wellness", icon: "🧘", color: "bg-gradient-to-r from-purple-400 to-pink-400" },
    { value: "personal", label: "Personal Growth", icon: "📚", color: "bg-gradient-to-r from-blue-400 to-cyan-400" },
    { value: "productivity", label: "Productivity", icon: "⚡", color: "bg-gradient-to-r from-yellow-400 to-orange-400" }
  ];

  const moods = [
    { value: "excited", label: "Excited", icon: "🤩", color: "text-yellow-500" },
    { value: "happy", label: "Happy", icon: "😊", color: "text-green-500" },
    { value: "neutral", label: "Neutral", icon: "😐", color: "text-gray-500" },
    { value: "sad", label: "Sad", icon: "😢", color: "text-blue-500" },
    { value: "anxious", label: "Anxious", icon: "😰", color: "text-red-500" },
    { value: "tired", label: "Tired", icon: "😴", color: "text-purple-500" }
  ];

  const handleCreateHabit = () => {
    if (!newHabit.name) return;

    const habit: Habit = {
      id: Date.now(),
      ...newHabit,
      currentStreak: 0,
      longestStreak: 0,
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      completedToday: false
    };

    setHabits([...habits, habit]);
    setNewHabit({
      name: "",
      description: "",
      category: "health",
      targetFrequency: 1
    });
    setShowCreateDialog(false);
  };

  const updateDailyEntry = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/daily-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update daily entry');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/daily-entry', dateString] });
    }
  });

  const toggleHabitCompletion = (habitId: number) => {
    const currentCompletions = dailyEntry?.habitCompletions 
      ? JSON.parse(dailyEntry.habitCompletions) 
      : [];
    
    const isCompleted = currentCompletions.includes(habitId);
    const newCompletions = isCompleted
      ? currentCompletions.filter((id: number) => id !== habitId)
      : [...currentCompletions, habitId];

    const updatedEntry = {
      date: dateString,
      habitCompletions: JSON.stringify(newCompletions),
      ...dailyEntry
    };

    updateDailyEntry.mutate(updatedEntry);
  };

  const activeHabits = habitsWithCompletion.filter(h => h.isActive);
  const todayCompletedCount = activeHabits.filter(h => h.completedToday).length;
  const totalStreakDays = activeHabits.reduce((sum, h) => sum + h.currentStreak, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-heading font-bold bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
            Habits & Mood Tracking
          </h3>
          <p className="text-muted-foreground dark:text-gray-300 mt-1">
            Build positive habits and track your daily mood
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white font-medium rounded-xl shadow-lg">
              <Plus className="mr-2 h-4 w-4" />
              New Habit
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-gray-900 border-0 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">Create New Habit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="habitName" className="text-gray-700 dark:text-gray-300">Habit Name</Label>
                <Input
                  id="habitName"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                  placeholder="e.g., Morning walk"
                  className="dark:bg-gray-800 dark:text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="habitDescription" className="text-gray-700 dark:text-gray-300">Description</Label>
                <Textarea
                  id="habitDescription"
                  value={newHabit.description}
                  onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                  placeholder="Brief description of the habit"
                  className="dark:bg-gray-800 dark:text-white"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="habitCategory" className="text-gray-700 dark:text-gray-300">Category</Label>
                  <Select value={newHabit.category} onValueChange={(value) => setNewHabit({ ...newHabit, category: value })}>
                    <SelectTrigger className="dark:bg-gray-800 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="frequency" className="text-gray-700 dark:text-gray-300">Daily Target</Label>
                  <Input
                    id="frequency"
                    type="number"
                    value={newHabit.targetFrequency}
                    onChange={(e) => setNewHabit({ ...newHabit, targetFrequency: Number(e.target.value) })}
                    min="1"
                    className="dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
              
              <Button onClick={handleCreateHabit} className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white">
                Create Habit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Daily Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl flex items-center justify-center">
                <Check className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {todayCompletedCount}/{activeHabits.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Habits Completed Today</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl flex items-center justify-center">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalStreakDays}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Streak Days</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round((todayCompletedCount / Math.max(activeHabits.length, 1)) * 100)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mood Tracking */}
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <Smile className="h-5 w-5 text-pink-600 dark:text-pink-400" />
            <span>{getDateLabel()}'s Mood & Energy</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Mood Selection */}
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                How are you feeling?
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {moods.map(mood => (
                  <button
                    key={mood.value}
                    onClick={() => setDailyMood({ ...dailyMood, mood: mood.value })}
                    className={`p-3 rounded-xl text-center transition-all duration-200 ${
                      dailyMood.mood === mood.value
                        ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-white shadow-lg scale-105'
                        : 'bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="text-2xl mb-1">{mood.icon}</div>
                    <div className="text-xs font-medium">{mood.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Energy Level */}
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                Energy Level (1-5)
              </Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Battery className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Energy: {dailyMood.energyLevel}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={dailyMood.energyLevel}
                  onChange={(e) => setDailyMood({ ...dailyMood, energyLevel: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            </div>

            {/* Stress Level */}
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                Stress Level (1-5)
              </Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Stress: {dailyMood.stressLevel}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={dailyMood.stressLevel}
                  onChange={(e) => setDailyMood({ ...dailyMood, stressLevel: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Habits */}
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <Target className="h-5 w-5 text-pink-600 dark:text-pink-400" />
            <span>Today's Habits ({activeHabits.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeHabits.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No active habits. Create your first habit to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeHabits.map(habit => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onToggle={toggleHabitCompletion}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface HabitCardProps {
  habit: Habit;
  onToggle: (habitId: number) => void;
}

function HabitCard({ habit, onToggle }: HabitCardProps) {
  const categoryInfo = {
    health: { icon: "💪", color: "bg-gradient-to-r from-green-400 to-emerald-400" },
    wellness: { icon: "🧘", color: "bg-gradient-to-r from-purple-400 to-pink-400" },
    personal: { icon: "📚", color: "bg-gradient-to-r from-blue-400 to-cyan-400" },
    productivity: { icon: "⚡", color: "bg-gradient-to-r from-yellow-400 to-orange-400" }
  };

  const category = categoryInfo[habit.category as keyof typeof categoryInfo] || categoryInfo.health;

  return (
    <div className={`bg-white/60 dark:bg-gray-800/60 rounded-xl p-4 backdrop-blur-sm border-l-4 ${
      habit.completedToday ? 'border-green-400' : 'border-gray-300 dark:border-gray-600'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`w-8 h-8 rounded-lg ${category.color} flex items-center justify-center text-sm`}>
              {category.icon}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">{habit.name}</h4>
              {habit.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{habit.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-gray-600 dark:text-gray-400">
                {habit.currentStreak} day streak
              </span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Award className="h-4 w-4 text-yellow-500" />
              <span className="text-gray-600 dark:text-gray-400">
                Best: {habit.longestStreak} days
              </span>
            </div>
            
            <Badge variant="outline" className="text-xs">
              {habit.targetFrequency}x daily
            </Badge>
          </div>
        </div>
        
        <Button
          onClick={() => onToggle(habit.id)}
          variant={habit.completedToday ? "default" : "outline"}
          size="sm"
          className={`w-12 h-12 rounded-xl ${
            habit.completedToday
              ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white'
              : 'border-gray-300 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-green-900'
          }`}
        >
          {habit.completedToday ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
}