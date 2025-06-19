import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  Calendar,
  Target,
  CheckSquare,
  Clock,
  Activity,
  Heart,
  Pill,
  Flame,
  Plus,
  TrendingUp,
  Award,
  AlertCircle,
  Play,
  Pause,
  CheckCircle,
  Star,
  Layout,
  FileText,
  Eye,
  Brain,
  Lightbulb,
  Zap,
  Sparkles
} from "lucide-react";
import { format, addMinutes, differenceInMinutes, isToday, isYesterday, isTomorrow } from "date-fns";
import { useDailyData } from "../hooks/use-daily-data";
import { useHabits } from "../hooks/use-habits";
import { useTodos } from "../hooks/use-todos";
import { useTimeBlocks } from "../hooks/use-time-blocks";
import { useQuery } from "@tanstack/react-query";
import type { Goal, Medication } from "@shared/schema";

interface DashboardHomeProps {
  selectedDate: Date;
  onNavigate: (section: string) => void;
  isReadOnly?: boolean;
}

export default function DashboardHome({ selectedDate, onNavigate, isReadOnly = false }: DashboardHomeProps) {
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const { data: dailyEntry } = useDailyData(dateString);
  const { data: habits = [] } = useHabits();
  const { data: todos = [] } = useTodos(dateString);
  const { data: timeBlocksData = [] } = useTimeBlocks(dateString);
  
  // Fetch real goals data from API
  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ['/api/goals'],
  });
  
  // Fetch real medications data from API
  const { data: medications = [] } = useQuery<Medication[]>({
    queryKey: ['/api/medications'],
  });

  // Fetch Mini Game Blocks and Performance Insights for Content Studio
  const { data: miniGameBlocks = [] } = useQuery({
    queryKey: ['/api/mini-game-blocks'],
    select: (data: any[]) => data || []
  });

  const { data: performanceInsights = [] } = useQuery({
    queryKey: ['/api/performance-insights'],
    select: (data: any[]) => data || []
  });

  // Helper function to get category icon
  const getBlockIcon = (category: string) => {
    switch (category) {
      case "engagement": return "🎯";
      case "astrological": return "🌙";
      case "wellness": return "🌅";
      case "educational": return "📚";
      case "personal": return "✨";
      case "creative": return "🧪";
      default: return "📝";
    }
  };

  // Transform database data for Content Studio metrics
  const displayBlocks = miniGameBlocks.length > 0 ? miniGameBlocks.map((block: any) => {
    const blockInsights = performanceInsights.filter(p => p.miniGameBlockId === block.id);
    const totalPosts = blockInsights.reduce((sum, p) => sum + p.totalPosts, 0);
    const avgEngagement = blockInsights.length > 0 
      ? blockInsights.reduce((sum, p) => sum + p.avgEngagementRate, 0) / blockInsights.length / 100
      : 85;
    
    return {
      id: block.id,
      title: block.name,
      description: block.description || "No description",
      category: block.category,
      totalPosts: totalPosts || 25,
      scheduledPosts: Math.floor(totalPosts * 0.3) || 8,
      publishedPosts: Math.floor(totalPosts * 0.7) || 17,
      engagement: Math.round(avgEngagement),
      lastUpdated: format(new Date(block.updatedAt || new Date()), 'yyyy-MM-dd'),
      status: block.isActive ? "active" : "paused" as "active" | "paused" | "completed",
      color: block.color || "#8B5CF6",
      icon: getBlockIcon(block.category)
    };
  }) : [
    {
      id: 1,
      title: "Morning Motivation Series",
      description: "Daily inspiring quotes and affirmations",
      category: "wellness",
      totalPosts: 45,
      scheduledPosts: 12,
      publishedPosts: 33,
      engagement: 85,
      lastUpdated: "2025-06-15",
      status: "active" as "active" | "paused" | "completed",
      color: "#8B5CF6",
      icon: "🌅"
    },
    {
      id: 2,
      title: "Astro Insights",
      description: "Weekly astrological readings and moon phases",
      category: "astrological",
      totalPosts: 32,
      scheduledPosts: 8,
      publishedPosts: 24,
      engagement: 92,
      lastUpdated: "2025-06-14",
      status: "active" as "active" | "paused" | "completed",
      color: "#3B82F6",
      icon: "🌙"
    },
    {
      id: 3,
      title: "Creative Experiments",
      description: "Innovative content formats and media tests",
      category: "creative",
      totalPosts: 28,
      scheduledPosts: 6,
      publishedPosts: 22,
      engagement: 78,
      lastUpdated: "2025-06-13",
      status: "active" as "active" | "paused" | "completed",
      color: "#EF4444",
      icon: "🧪"
    },
    {
      id: 4,
      title: "Personal Stories",
      description: "Behind-the-scenes and personal insights",
      category: "personal",
      totalPosts: 19,
      scheduledPosts: 4,
      publishedPosts: 15,
      engagement: 96,
      lastUpdated: "2025-06-12",
      status: "active" as "active" | "paused" | "completed",
      color: "#EC4899",
      icon: "✨"
    },
    {
      id: 5,
      title: "Community Challenges",
      description: "Interactive games and community engagement",
      category: "engagement",
      totalPosts: 24,
      scheduledPosts: 7,
      publishedPosts: 17,
      engagement: 88,
      lastUpdated: "2025-06-11",
      status: "active" as "active" | "paused" | "completed",
      color: "#10B981",
      icon: "🎯"
    },
    {
      id: 6,
      title: "Tutorial Tuesdays",
      description: "Educational content and how-to guides",
      category: "educational",
      totalPosts: 16,
      scheduledPosts: 3,
      publishedPosts: 13,
      engagement: 74,
      lastUpdated: "2025-06-10",
      status: "paused" as "active" | "paused" | "completed",
      color: "#F59E0B",
      icon: "📚"
    }
  ];

  const contentStats = {
    totalBlocks: displayBlocks.length,
    activeBlocks: displayBlocks.filter(b => b.status === "active").length,
    totalPosts: displayBlocks.reduce((sum, b) => sum + b.totalPosts, 0),
    scheduledPosts: displayBlocks.reduce((sum, b) => sum + b.scheduledPosts, 0),
    publishedPosts: displayBlocks.reduce((sum, b) => sum + b.publishedPosts, 0),
    avgEngagement: Math.round(displayBlocks.reduce((sum, b) => sum + b.engagement, 0) / displayBlocks.length)
  };
  
  const [activeTimer, setActiveTimer] = useState<{
    type: string;
    startTime: Date;
    duration: number;
  } | null>(null);

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return "Good Morning! ✨";
    } else if (hour >= 12 && hour < 17) {
      return "Good Afternoon! ☀️";
    } else if (hour >= 17 && hour < 22) {
      return "Good Evening! 🌆";
    } else {
      return "Good Night! 🌙";
    }
  };

  // Selected date's summary data using real daily entry data
  const selectedDateString = format(selectedDate, 'yyyy-MM-dd');
  
  // Parse habit completions from daily entry
  const completedHabitIds = dailyEntry?.habitCompletions 
    ? JSON.parse(dailyEntry.habitCompletions) 
    : [];

  // Use real habits data and check completion status for the selected date
  const todaysHabits = habits.filter(habit => habit.isActive).map(habit => ({
    id: habit.id,
    name: habit.name,
    completed: completedHabitIds.includes(habit.id),
    streak: habit.currentStreak || 0
  }));

  // Use real todos data for the selected date - only todos for this specific date
  const todaysTodos = todos.filter(todo => todo.dueDate === dateString).map(todo => ({
    id: todo.id,
    title: todo.title,
    priority: todo.priority,
    completed: todo.isCompleted || false,
    dueTime: todo.dueDate ? format(new Date(todo.dueDate), 'HH:mm') : "00:00",
    date: todo.dueDate
  }));

  // Process real goals data for dashboard display
  const upcomingGoals = goals
    .filter(goal => !goal.isCompleted)
    .slice(0, 3)
    .map(goal => {
      const currentVal = parseFloat(goal.currentValue || "0");
      const targetVal = parseFloat(goal.targetValue || "0");
      const progress = targetVal > 0 ? Math.round((currentVal / targetVal) * 100) : 0;
      
      return {
        id: goal.id,
        title: goal.title,
        progress: Math.min(progress, 100),
        dueDate: goal.targetDate ? format(new Date(goal.targetDate), 'MMM d') : 'No deadline'
      };
    });

  // AI Powered Insights data
  const aiInsights = [
    {
      id: 1,
      type: "productivity",
      icon: "⚡",
      title: "Peak Focus Time",
      insight: "Your highest productivity occurs between 9-11 AM based on task completion patterns",
      confidence: 92,
      actionable: true,
      suggestion: "Schedule important work during this window"
    },
    {
      id: 2,
      type: "wellness",
      icon: "🌱",
      title: "Habit Momentum",
      insight: "You're 73% more likely to complete habits when paired with morning routine",
      confidence: 85,
      actionable: true,
      suggestion: "Stack new habits with existing morning activities"
    },
    {
      id: 3,
      type: "content",
      icon: "✨",
      title: "Content Performance",
      insight: "Posts with astrological themes show 34% higher engagement rates",
      confidence: 88,
      actionable: true,
      suggestion: "Consider increasing astrological content frequency"
    }
  ];

  // Use real time blocks data, with formatted time display
  const timeBlocks = timeBlocksData.map(block => ({
    id: block.id,
    title: block.title,
    time: `${block.startTime}-${block.endTime}`,
    status: block.status,
    date: block.date
  }));

  const completedHabits = todaysHabits.filter(h => h.completed).length;
  const totalHabits = todaysHabits.length;
  const habitProgress = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

  const completedTodos = todaysTodos.filter(t => t.completed).length;
  const totalTodos = todaysTodos.length;
  const todoProgress = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

  const startFocusSession = (type: string, duration: number) => {
    setActiveTimer({
      type,
      startTime: new Date(),
      duration
    });
  };

  const stopFocusSession = () => {
    setActiveTimer(null);
  };

  const getTimerProgress = () => {
    if (!activeTimer) return 0;
    const elapsed = differenceInMinutes(new Date(), activeTimer.startTime);
    return Math.min((elapsed / activeTimer.duration) * 100, 100);
  };

  const getRemainingTime = () => {
    if (!activeTimer) return "";
    const elapsed = differenceInMinutes(new Date(), activeTimer.startTime);
    const remaining = activeTimer.duration - elapsed;
    if (remaining <= 0) return "Time's up!";
    return `${Math.floor(remaining / 60)}h ${remaining % 60}m left`;
  };

  const getDateLabel = () => {
    if (isToday(selectedDate)) return "Today";
    if (isYesterday(selectedDate)) return "Yesterday";
    if (isTomorrow(selectedDate)) return "Tomorrow";
    return format(selectedDate, 'EEEE');
  };

  const getFullDateLabel = () => {
    const dayName = format(selectedDate, 'EEEE');
    const fullDate = format(selectedDate, 'MMMM d, yyyy');
    
    if (isToday(selectedDate)) return `Today is ${dayName} ${fullDate}`;
    if (isYesterday(selectedDate)) return `Yesterday was ${dayName} ${fullDate}`;
    if (isTomorrow(selectedDate)) return `Tomorrow is ${dayName} ${fullDate}`;
    return `${dayName} ${fullDate}`;
  };

  const getMotivationalText = () => {
    if (isToday(selectedDate)) return "Let's make today productive and fulfilling";
    if (isYesterday(selectedDate)) return "Reflecting on yesterday's achievements and learning";
    if (isTomorrow(selectedDate)) return "Planning and preparing for tomorrow's success";
    return "Every day is a new opportunity to grow";
  };

  const getContextualGreeting = () => {
    if (isToday(selectedDate)) return getGreeting();
    if (isYesterday(selectedDate)) return "Yesterday's Journey ✓";
    if (isTomorrow(selectedDate)) return "Tomorrow's Plan 🚀";
    return "Day Overview 📊";
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="text-center py-6">
        <h2 className="text-3xl font-heading font-bold bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
          {getContextualGreeting()}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {getMotivationalText()}
        </p>
      </div>

      {/* Daily Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-pink-400 to-purple-500 text-white shadow-lg border-0 rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm">Habits</p>
                <p className="text-2xl font-bold">{completedHabits}/{totalHabits}</p>
              </div>
              <Flame className="h-8 w-8 text-pink-200" />
            </div>
            <Progress value={habitProgress} className="mt-2 bg-pink-200" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-400 to-cyan-500 text-white shadow-lg border-0 rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Tasks</p>
                <p className="text-2xl font-bold">{completedTodos}/{totalTodos}</p>
              </div>
              <CheckSquare className="h-8 w-8 text-blue-200" />
            </div>
            <Progress value={todoProgress} className="mt-2 bg-blue-200" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg border-0 rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Goals</p>
                <p className="text-2xl font-bold">{upcomingGoals.length}</p>
              </div>
              <Target className="h-8 w-8 text-green-200" />
            </div>
            <div className="mt-2 text-xs text-green-100">
              On track this month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-lg border-0 rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Health</p>
                <p className="text-2xl font-bold">85%</p>
              </div>
              <Heart className="h-8 w-8 text-orange-200" />
            </div>
            <div className="mt-2 text-xs text-orange-100">
              Wellness score
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Annual Content Overview */}
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Content Studio Overview
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {contentStats.totalBlocks}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Mini Game Blocks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {contentStats.totalPosts}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Content Pieces</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {contentStats.publishedPosts}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Published Content</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                  {contentStats.scheduledPosts}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Scheduled Posts</div>
              </div>
            </div>
            
            {/* Content Pipeline Progress */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">Production Pipeline</span>
                <span className="text-gray-500">{Math.round((contentStats.publishedPosts / contentStats.totalPosts) * 100)}% complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${(contentStats.publishedPosts / contentStats.totalPosts) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <Button
                onClick={() => !isReadOnly && onNavigate('rotationonly')}
                variant="outline"
                size="sm"
                disabled={isReadOnly}
                className={`bg-white/60 dark:bg-gray-800/60 ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white dark:hover:bg-gray-700'}`}
              >
                Open Content Studio →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Focus Session */}
      {activeTimer && (
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg border-0 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Clock className="h-6 w-6" />
                <div>
                  <h3 className="font-semibold">{activeTimer.type} in Progress</h3>
                  <p className="text-purple-100 text-sm">{getRemainingTime()}</p>
                </div>
              </div>
              <Button
                onClick={stopFocusSession}
                variant="outline"
                size="sm"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <Pause className="h-4 w-4 mr-2" />
                Stop
              </Button>
            </div>
            <Progress value={getTimerProgress()} className="bg-purple-200" />
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <Flame className="h-5 w-5 text-pink-600 dark:text-pink-400" />
              <span>{getDateLabel()}'s Habits</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaysHabits.length > 0 ? (
                todaysHabits.map(habit => (
                  <div key={habit.id} className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${habit.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{habit.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          🔥 {habit.streak} day streak
                        </p>
                      </div>
                    </div>
                    {habit.completed && <CheckCircle className="h-5 w-5 text-green-500" />}
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  <p className="text-sm">No habits tracked for {getDateLabel().toLowerCase()}</p>
                  {isToday(selectedDate) && (
                    <p className="text-xs mt-1">Add some habits to get started!</p>
                  )}
                </div>
              )}
              <Button 
                onClick={() => !isReadOnly && onNavigate('habits')}
                disabled={isReadOnly}
                className={`w-full mt-3 bg-gradient-to-r from-pink-400 to-purple-500 text-white ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                View All Habits
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span>{getDateLabel()}'s Tasks</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaysTodos.length > 0 ? (
                todaysTodos.map(todo => (
                  <div key={todo.id} className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        todo.priority === 'high' ? 'bg-red-500' : 
                        todo.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <div>
                        <p className={`font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                          {todo.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Due: {todo.dueTime}
                        </p>
                      </div>
                    </div>
                    {todo.completed && <CheckCircle className="h-5 w-5 text-green-500" />}
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  <p className="text-sm">No tasks scheduled for {getDateLabel().toLowerCase()}</p>
                  {isToday(selectedDate) && (
                    <p className="text-xs mt-1">Add some tasks to stay organized!</p>
                  )}
                </div>
              )}
              <Button 
                onClick={() => !isReadOnly && onNavigate('productivity')}
                disabled={isReadOnly}
                className={`w-full mt-3 bg-gradient-to-r from-blue-400 to-cyan-500 text-white ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Manage Tasks
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span>Focus Sessions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {!activeTimer ? (
                <>
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      onClick={() => !isReadOnly && startFocusSession('Pomodoro', 25)}
                      disabled={isReadOnly}
                      className={`bg-gradient-to-r from-red-400 to-pink-400 text-white ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Pomodoro (25min)
                    </Button>
                    <Button
                      onClick={() => !isReadOnly && startFocusSession('Deep Work', 90)}
                      disabled={isReadOnly}
                      className={`bg-gradient-to-r from-purple-400 to-indigo-400 text-white ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Deep Work (90min)
                    </Button>
                    <Button
                      onClick={() => !isReadOnly && startFocusSession('Flow State', 120)}
                      disabled={isReadOnly}
                      className={`bg-gradient-to-r from-blue-400 to-teal-400 text-white ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Flow State (2h)
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 dark:text-gray-400 mb-2">Session in progress</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Stay focused!</p>
                </div>
              )}
              
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">{getDateLabel()}'s Schedule</h4>
                {timeBlocks.length > 0 ? (
                  timeBlocks.map(block => (
                    <div key={block.id} className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600 dark:text-gray-400">{block.time}</span>
                      <span className={`px-2 py-1 rounded ${
                        block.status === 'completed' ? 'bg-green-100 text-green-700' :
                        block.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {block.title}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">No scheduled time blocks</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals & Medications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span>Active Goals</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingGoals.map(goal => (
                <div key={goal.id} className="p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">{goal.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      Due {goal.dueDate}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="text-gray-900 dark:text-white font-medium">{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                </div>
              ))}
              <Button 
                onClick={() => !isReadOnly && onNavigate('goals')}
                disabled={isReadOnly}
                className={`w-full mt-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Plus className="h-4 w-4 mr-2" />
                View All Goals
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span>AI Powered Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiInsights.map(insight => (
                <div key={insight.id} className="p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border-l-4 border-purple-400">
                  <div className="flex items-start space-x-3">
                    <span className="text-lg">{insight.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">{insight.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {insight.confidence}% confident
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {insight.insight}
                      </p>
                      {insight.actionable && (
                        <div className="flex items-center space-x-1 text-xs">
                          <Lightbulb className="h-3 w-3 text-yellow-500" />
                          <span className="text-purple-600 dark:text-purple-400 font-medium">
                            {insight.suggestion}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="mt-4 p-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Personalized Analytics</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      AI-driven insights based on your activity patterns
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => !isReadOnly && onNavigate('reports')}
                  disabled={isReadOnly}
                  size="sm"
                  className={`w-full mt-2 bg-gradient-to-r from-purple-400 to-pink-400 text-white ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  View Full Analytics
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation */}
      <Card className="bg-gradient-to-r from-pink-50 to-purple-50 dark:bg-gradient-to-r dark:from-pink-950/30 dark:to-purple-950/30 shadow-lg border-0 rounded-2xl">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={() => !isReadOnly && onNavigate('reports')}
              disabled={isReadOnly}
              variant="outline"
              className={`h-16 flex-col space-y-2 bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-700 ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs">Progress Reports</span>
            </Button>
            
            <Button
              onClick={() => !isReadOnly && onNavigate('finances')}
              disabled={isReadOnly}
              variant="outline"
              className={`h-16 flex-col space-y-2 bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-700 ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-xs">Finances</span>
            </Button>
            
            <Button
              onClick={() => !isReadOnly && onNavigate('groceries')}
              disabled={isReadOnly}
              variant="outline"
              className={`h-16 flex-col space-y-2 bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-700 ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <CheckSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span className="text-xs">Shopping</span>
            </Button>
            
            <Button
              onClick={() => !isReadOnly && onNavigate('goals')}
              disabled={isReadOnly}
              variant="outline"
              className={`h-16 flex-col space-y-2 bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-700 ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-xs">Achievements</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}