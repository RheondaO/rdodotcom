import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Target, 
  Award,
  BarChart3,
  Activity,
  Droplets,
  Dumbbell,
  Clock,
  DollarSign,
  Heart,
  Zap,
  CheckSquare,
  ShoppingCart,
  Pill,
  Coffee,
  Moon,
  Flame,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, subWeeks, subMonths, isToday, isSameDay } from "date-fns";
import { useDailyData } from "@/hooks/use-daily-data";

type ReportPeriod = "week" | "month" | "quarter";

interface ReportsSectionProps {
  selectedDate: Date;
}

interface AnalyticsData {
  healthMetrics: {
    waterIntakeAvg: number;
    exerciseCompletionRate: number;
    sleepQualityAvg: number;
    mealCompletionRate: number;
  };
  productivityMetrics: {
    focusSessionsCompleted: number;
    totalFocusHours: number;
    taskCompletionRate: number;
    averageWorkHours: number;
  };
  habitMetrics: {
    totalHabitsTracked: number;
    overallCompletionRate: number;
    longestStreak: number;
    mostConsistentHabit: string;
  };
  goalMetrics: {
    goalsInProgress: number;
    goalsCompleted: number;
    averageProgress: number;
    onTrackGoals: number;
  };
  wellnessScore: number;
  productivityScore: number;
  trend: "up" | "down" | "stable";
}

export default function ReportsSection({ selectedDate }: ReportsSectionProps) {
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>("week");
  
  const currentPeriodStart = reportPeriod === "week" 
    ? startOfWeek(selectedDate) 
    : reportPeriod === "month"
    ? startOfMonth(selectedDate)
    : new Date(selectedDate.getFullYear(), Math.floor(selectedDate.getMonth() / 3) * 3, 1);
    
  const currentPeriodEnd = reportPeriod === "week" 
    ? endOfWeek(selectedDate) 
    : reportPeriod === "month"
    ? endOfMonth(selectedDate)
    : new Date(selectedDate.getFullYear(), Math.floor(selectedDate.getMonth() / 3) * 3 + 3, 0);

  // Mock analytics data - in real app would come from API
  const analyticsData: AnalyticsData = {
    healthMetrics: {
      waterIntakeAvg: 6.8,
      exerciseCompletionRate: 78,
      sleepQualityAvg: 7.2,
      mealCompletionRate: 89
    },
    productivityMetrics: {
      focusSessionsCompleted: 12,
      totalFocusHours: 24.5,
      taskCompletionRate: 85,
      averageWorkHours: 7.2
    },
    habitMetrics: {
      totalHabitsTracked: 8,
      overallCompletionRate: 76,
      longestStreak: 14,
      mostConsistentHabit: "Morning Meditation"
    },
    goalMetrics: {
      goalsInProgress: 5,
      goalsCompleted: 2,
      averageProgress: 68,
      onTrackGoals: 4
    },
    wellnessScore: 82,
    productivityScore: 77,
    trend: "up"
  };

  const weeklyHabitData = [
    { day: "Mon", completion: 85 },
    { day: "Tue", completion: 92 },
    { day: "Wed", completion: 78 },
    { day: "Thu", completion: 88 },
    { day: "Fri", completion: 75 },
    { day: "Sat", completion: 90 },
    { day: "Sun", completion: 82 }
  ];

  const monthlyGoalProgress = [
    { goal: "Read 4 Books", progress: 75, target: 100, category: "personal" },
    { goal: "Exercise 20 Days", progress: 85, target: 100, category: "health" },
    { goal: "Save $2000", progress: 60, target: 100, category: "finance" },
    { goal: "Learn Spanish", progress: 45, target: 100, category: "personal" },
    { goal: "Complete Project", progress: 90, target: 100, category: "work" }
  ];

  const getTrendIcon = (trend: string) => {
    switch(trend) {
      case "up": return <ArrowUp className="h-4 w-4 text-green-500" />;
      case "down": return <ArrowDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      health: "from-red-400 to-pink-500",
      personal: "from-blue-400 to-indigo-500", 
      finance: "from-green-400 to-emerald-500",
      work: "from-purple-400 to-violet-500"
    };
    return colors[category as keyof typeof colors] || "from-gray-400 to-gray-500";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
          <BarChart3 className="h-10 w-10 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent mb-2">
            Reports & Analytics
          </h1>
          <p className="text-lg text-muted-foreground dark:text-gray-300 max-w-2xl mx-auto">
            Track your progress across all areas of life with comprehensive analytics and insights.
          </p>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-2 bg-white/60 dark:bg-gray-800/60 rounded-2xl p-1 shadow-sm backdrop-blur-sm">
          {(["week", "month", "quarter"] as ReportPeriod[]).map((period) => (
            <button
              key={period}
              onClick={() => setReportPeriod(period)}
              className={`px-6 py-2 text-sm rounded-xl font-medium transition-all duration-200 capitalize ${
                reportPeriod === period
                  ? "bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-sm"
                  : "text-muted-foreground hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-blue-100 dark:border-blue-800 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Wellness Score</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {analyticsData.wellnessScore}%
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-pink-500 rounded-xl flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              {getTrendIcon(analyticsData.trend)}
              <span className="text-sm text-muted-foreground dark:text-gray-400 ml-1">
                vs last {reportPeriod}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-100 dark:border-purple-800 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Productivity Score</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {analyticsData.productivityScore}%
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-violet-500 rounded-xl flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              {getTrendIcon(analyticsData.trend)}
              <span className="text-sm text-muted-foreground dark:text-gray-400 ml-1">
                vs last {reportPeriod}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-100 dark:border-green-800 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Habit Consistency</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {analyticsData.habitMetrics.overallCompletionRate}%
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                <CheckSquare className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-muted-foreground dark:text-gray-400 ml-1">
                {analyticsData.habitMetrics.longestStreak} day streak
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-100 dark:border-orange-800 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Goals Progress</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {analyticsData.goalMetrics.averageProgress}%
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-amber-500 rounded-xl flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                {analyticsData.goalMetrics.onTrackGoals}/{analyticsData.goalMetrics.goalsInProgress} on track
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Health & Wellness Analytics */}
        <Card className="border-red-100 dark:border-red-800 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <Heart className="h-5 w-5" />
              Health & Wellness
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
                <Droplets className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground dark:text-gray-400">Water Intake</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {analyticsData.healthMetrics.waterIntakeAvg}/8 glasses
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/30 rounded-xl">
                <Dumbbell className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground dark:text-gray-400">Exercise Rate</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {analyticsData.healthMetrics.exerciseCompletionRate}%
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground dark:text-gray-400">Sleep Quality</span>
                  <span className="font-medium">{analyticsData.healthMetrics.sleepQualityAvg}/10</span>
                </div>
                <Progress value={analyticsData.healthMetrics.sleepQualityAvg * 10} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground dark:text-gray-400">Meal Completion</span>
                  <span className="font-medium">{analyticsData.healthMetrics.mealCompletionRate}%</span>
                </div>
                <Progress value={analyticsData.healthMetrics.mealCompletionRate} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Productivity Analytics */}
        <Card className="border-purple-100 dark:border-purple-800 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
              <Clock className="h-5 w-5" />
              Productivity & Focus
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/30 rounded-xl">
                <Clock className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground dark:text-gray-400">Focus Hours</p>
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {analyticsData.productivityMetrics.totalFocusHours}h
                </p>
              </div>
              <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl">
                <CheckSquare className="h-6 w-6 text-indigo-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground dark:text-gray-400">Task Rate</p>
                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  {analyticsData.productivityMetrics.taskCompletionRate}%
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground dark:text-gray-400">Focus Sessions</span>
                  <span className="font-medium">{analyticsData.productivityMetrics.focusSessionsCompleted} completed</span>
                </div>
                <Progress value={(analyticsData.productivityMetrics.focusSessionsCompleted / 20) * 100} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground dark:text-gray-400">Average Work Hours</span>
                  <span className="font-medium">{analyticsData.productivityMetrics.averageWorkHours}h/day</span>
                </div>
                <Progress value={(analyticsData.productivityMetrics.averageWorkHours / 10) * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Habit Completion Chart */}
      <Card className="border-green-100 dark:border-green-800 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-green-600 dark:text-green-400">
            <Activity className="h-5 w-5" />
            Weekly Habit Completion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-4">
            {weeklyHabitData.map((day, index) => (
              <div key={day.day} className="text-center">
                <p className="text-sm text-muted-foreground dark:text-gray-400 mb-2">{day.day}</p>
                <div className="relative">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-20 flex items-end justify-center">
                    <div 
                      className="bg-gradient-to-t from-green-400 to-emerald-500 rounded-full w-full transition-all duration-500"
                      style={{ height: `${day.completion}%` }}
                    />
                  </div>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                    {day.completion}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Goal Progress */}
      <Card className="border-orange-100 dark:border-orange-800 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-orange-600 dark:text-orange-400">
            <Target className="h-5 w-5" />
            Goal Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyGoalProgress.map((goal, index) => (
              <div key={index} className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{goal.goal}</h4>
                  <Badge 
                    variant="outline" 
                    className={`bg-gradient-to-r ${getCategoryColor(goal.category)} text-white border-0`}
                  >
                    {goal.category}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground dark:text-gray-400">Progress</span>
                    <span className="font-medium">{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights & Recommendations */}
      <Card className="border-blue-100 dark:border-blue-800 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
            <Award className="h-5 w-5" />
            AI Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <h4 className="font-medium text-green-600 dark:text-green-400">Strength</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Your exercise consistency has improved by 23% this month. Keep up the momentum!
              </p>
            </div>
            
            <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <h4 className="font-medium text-yellow-600 dark:text-yellow-400">Opportunity</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Consider increasing your water intake by 1-2 glasses daily to reach your hydration goals.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}