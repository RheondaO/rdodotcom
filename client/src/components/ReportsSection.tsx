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
  DollarSign
} from "lucide-react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, subWeeks, subMonths } from "date-fns";
import { useDailyData } from "@/hooks/use-daily-data";

type ReportPeriod = "week" | "month";

interface ReportsSectionProps {
  selectedDate: Date;
}

export default function ReportsSection({ selectedDate }: ReportsSectionProps) {
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>("week");
  
  const currentPeriodStart = reportPeriod === "week" 
    ? startOfWeek(selectedDate) 
    : startOfMonth(selectedDate);
  const currentPeriodEnd = reportPeriod === "week" 
    ? endOfWeek(selectedDate) 
    : endOfMonth(selectedDate);
  
  const previousPeriodStart = reportPeriod === "week"
    ? startOfWeek(subWeeks(selectedDate, 1))
    : startOfMonth(subMonths(selectedDate, 1));
  const previousPeriodEnd = reportPeriod === "week"
    ? endOfWeek(subWeeks(selectedDate, 1))
    : endOfMonth(subMonths(selectedDate, 1));

  const currentPeriodDays = eachDayOfInterval({ start: currentPeriodStart, end: currentPeriodEnd });
  const previousPeriodDays = eachDayOfInterval({ start: previousPeriodStart, end: previousPeriodEnd });

  // Calculate current period stats
  const currentStats = calculatePeriodStats(currentPeriodDays);
  const previousStats = calculatePeriodStats(previousPeriodDays);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-heading font-bold bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
            Progress Reports
          </h3>
          <p className="text-muted-foreground dark:text-gray-300 mt-1">
            Track your {reportPeriod}ly progress and achievements
          </p>
        </div>
        
        <div className="flex items-center space-x-2 bg-white/60 dark:bg-gray-800/60 rounded-2xl p-1 shadow-sm backdrop-blur-sm">
          <button 
            onClick={() => setReportPeriod("week")}
            className={`px-4 py-2 text-sm rounded-xl font-medium transition-all duration-200 ${
              reportPeriod === "week" 
                ? "bg-gradient-to-r from-pink-400 to-purple-500 dark:from-pink-500 dark:to-purple-600 text-white shadow-sm" 
                : "text-muted-foreground hover:text-pink-600 dark:text-gray-300 dark:hover:text-pink-400"
            }`}
          >
            Weekly
          </button>
          <button 
            onClick={() => setReportPeriod("month")}
            className={`px-4 py-2 text-sm rounded-xl font-medium transition-all duration-200 ${
              reportPeriod === "month" 
                ? "bg-gradient-to-r from-pink-400 to-purple-500 dark:from-pink-500 dark:to-purple-600 text-white shadow-sm" 
                : "text-muted-foreground hover:text-pink-600 dark:text-gray-300 dark:hover:text-pink-400"
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Period Overview */}
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <Calendar className="h-5 w-5 text-pink-600 dark:text-pink-400" />
            <span>
              {format(currentPeriodStart, 'MMM d')} - {format(currentPeriodEnd, 'MMM d, yyyy')}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              icon={Droplets}
              title="Water Intake"
              current={currentStats.avgWater}
              previous={previousStats.avgWater}
              unit="glasses/day"
              color="blue"
            />
            <StatCard
              icon={Dumbbell}
              title="Exercise"
              current={currentStats.exercisePercentage}
              previous={previousStats.exercisePercentage}
              unit="% completion"
              color="green"
            />
            <StatCard
              icon={Clock}
              title="Sleep Hours"
              current={currentStats.avgSleep}
              previous={previousStats.avgSleep}
              unit="hours/night"
              color="purple"
            />
            <StatCard
              icon={DollarSign}
              title="Savings"
              current={currentStats.totalSavings}
              previous={previousStats.totalSavings}
              unit="dollars"
              color="emerald"
            />
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <Activity className="h-5 w-5 text-pink-600 dark:text-pink-400" />
              <span>Health Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MetricRow
              label="Average Water Intake"
              value={`${currentStats.avgWater.toFixed(1)} glasses`}
              progress={(currentStats.avgWater / 8) * 100}
              target="8 glasses"
            />
            <MetricRow
              label="Exercise Days"
              value={`${currentStats.exerciseDays}/${currentPeriodDays.length} days`}
              progress={currentStats.exercisePercentage}
              target="Daily"
            />
            <MetricRow
              label="Average Sleep"
              value={`${currentStats.avgSleep.toFixed(1)} hours`}
              progress={(currentStats.avgSleep / 8) * 100}
              target="8 hours"
            />
            <MetricRow
              label="Meal Consistency"
              value={`${currentStats.avgMeals.toFixed(1)}/3 meals`}
              progress={(currentStats.avgMeals / 3) * 100}
              target="3 meals/day"
            />
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <BarChart3 className="h-5 w-5 text-pink-600 dark:text-pink-400" />
              <span>Productivity & Finance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MetricRow
              label="Work Hours"
              value={`${currentStats.totalWorkHours.toFixed(1)} hours`}
              progress={Math.min((currentStats.totalWorkHours / (currentPeriodDays.length * 8)) * 100, 100)}
              target={`${currentPeriodDays.length * 8} hours`}
            />
            <MetricRow
              label="Screen Time"
              value={`${currentStats.avgScreenTime.toFixed(1)} hours/day`}
              progress={(currentStats.avgScreenTime / 8) * 100}
              target="<6 hours"
              isReverse
            />
            <MetricRow
              label="Total Savings"
              value={`$${currentStats.totalSavings.toFixed(2)}`}
              progress={Math.min((currentStats.totalSavings / 1000) * 100, 100)}
              target="Goal: $1000"
            />
            <MetricRow
              label="Days Tracked"
              value={`${currentStats.daysWithData}/${currentPeriodDays.length} days`}
              progress={(currentStats.daysWithData / currentPeriodDays.length) * 100}
              target="Complete tracking"
            />
          </CardContent>
        </Card>
      </div>

      {/* Achievement Highlights */}
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <Award className="h-5 w-5 text-pink-600 dark:text-pink-400" />
            <span>Achievements This {reportPeriod === "week" ? "Week" : "Month"}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AchievementList stats={currentStats} period={reportPeriod} />
        </CardContent>
      </Card>
    </div>
  );
}

interface StatCardProps {
  icon: any;
  title: string;
  current: number;
  previous: number;
  unit: string;
  color: string;
}

function StatCard({ icon: Icon, title, current, previous, unit, color }: StatCardProps) {
  const change = current - previous;
  const percentChange = previous > 0 ? (change / previous) * 100 : 0;
  const isPositive = change > 0;

  const colorClasses = {
    blue: "from-blue-400 to-cyan-400",
    green: "from-green-400 to-emerald-400",
    purple: "from-purple-400 to-pink-400",
    emerald: "from-emerald-400 to-teal-400"
  };

  return (
    <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-4 backdrop-blur-sm">
      <div className="flex items-center space-x-2 mb-2">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</span>
      </div>
      <div className="space-y-1">
        <div className="text-xl font-bold text-gray-900 dark:text-white">
          {current.toFixed(1)}
        </div>
        <div className="text-xs text-muted-foreground dark:text-gray-400">{unit}</div>
        {previous > 0 && (
          <div className={`flex items-center space-x-1 text-xs ${
            isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{Math.abs(percentChange).toFixed(0)}% vs last {reportPeriod === "week" ? "week" : "month"}</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface MetricRowProps {
  label: string;
  value: string;
  progress: number;
  target: string;
  isReverse?: boolean;
}

function MetricRow({ label, value, progress, target, isReverse = false }: MetricRowProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const progressColor = isReverse 
    ? (progress > 75 ? "bg-red-400" : progress > 50 ? "bg-yellow-400" : "bg-green-400")
    : (progress > 75 ? "bg-green-400" : progress > 50 ? "bg-yellow-400" : "bg-red-400");

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-sm font-bold text-gray-900 dark:text-white">{value}</span>
      </div>
      <div className="space-y-1">
        <Progress value={clampedProgress} className="h-2" />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground dark:text-gray-400">Target: {target}</span>
          <span className="text-xs text-muted-foreground dark:text-gray-400">{clampedProgress.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}

function AchievementList({ stats, period }: { stats: any; period: ReportPeriod }) {
  const achievements = [];

  if (stats.exercisePercentage >= 80) {
    achievements.push({
      title: "Fitness Champion",
      description: `Completed exercise on ${stats.exerciseDays} days this ${period}`,
      icon: "🏆",
      color: "bg-gradient-to-r from-yellow-400 to-orange-400"
    });
  }

  if (stats.avgWater >= 7) {
    achievements.push({
      title: "Hydration Hero",
      description: `Maintained excellent water intake averaging ${stats.avgWater.toFixed(1)} glasses`,
      icon: "💧",
      color: "bg-gradient-to-r from-blue-400 to-cyan-400"
    });
  }

  if (stats.avgSleep >= 7.5) {
    achievements.push({
      title: "Sleep Master",
      description: `Consistent sleep schedule with ${stats.avgSleep.toFixed(1)} hours average`,
      icon: "😴",
      color: "bg-gradient-to-r from-purple-400 to-pink-400"
    });
  }

  if (stats.daysWithData / (period === "week" ? 7 : 30) >= 0.9) {
    achievements.push({
      title: "Tracking Consistency",
      description: `Logged data on ${stats.daysWithData} days - excellent consistency!`,
      icon: "📊",
      color: "bg-gradient-to-r from-green-400 to-emerald-400"
    });
  }

  if (achievements.length === 0) {
    achievements.push({
      title: "Getting Started",
      description: "Keep tracking your habits to unlock achievements!",
      icon: "🌟",
      color: "bg-gradient-to-r from-gray-400 to-gray-500"
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {achievements.map((achievement, index) => (
        <div key={index} className="flex items-center space-x-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl backdrop-blur-sm">
          <div className={`w-10 h-10 rounded-lg ${achievement.color} flex items-center justify-center text-lg`}>
            {achievement.icon}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{achievement.title}</div>
            <div className="text-sm text-muted-foreground dark:text-gray-400">{achievement.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function calculatePeriodStats(days: Date[]) {
  // This would normally fetch data for all days in the period
  // For now, returning sample calculations
  const daysWithData = days.length;
  const avgWater = 6.5;
  const exerciseDays = Math.floor(days.length * 0.7);
  const exercisePercentage = (exerciseDays / days.length) * 100;
  const avgSleep = 7.2;
  const avgMeals = 2.8;
  const totalWorkHours = days.length * 6.5;
  const avgScreenTime = 4.2;
  const totalSavings = 850;

  return {
    daysWithData,
    avgWater,
    exerciseDays,
    exercisePercentage,
    avgSleep,
    avgMeals,
    totalWorkHours,
    avgScreenTime,
    totalSavings
  };
}