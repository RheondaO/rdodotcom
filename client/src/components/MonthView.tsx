import { useState, useMemo } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ChevronLeft, ChevronRight, Calendar, Target, CheckSquare, Pill, Activity, Clock, Heart } from "lucide-react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  addMonths, 
  subMonths, 
  isSameDay, 
  isSameMonth,
  startOfWeek,
  endOfWeek,
  isToday,
  parseISO,
  isWithinInterval
} from "date-fns";
import { useDailyData } from "../hooks/use-daily-data";
import { useQuery } from "@tanstack/react-query";
import type { Goal, Todo, Medication, TimeBlock } from "@shared/schema";

interface MonthViewProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function MonthView({ selectedDate, onDateChange }: MonthViewProps) {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(selectedDate));
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(startOfMonth(today));
    onDateChange(today);
  };

  // Fetch real data from APIs
  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ['/api/goals'],
  });

  const { data: allTodos = [] } = useQuery<Todo[]>({
    queryKey: ['/api/todos'],
  });

  const { data: medications = [] } = useQuery<Medication[]>({
    queryKey: ['/api/medications'],
  });

  const { data: allTimeBlocks = [] } = useQuery<TimeBlock[]>({
    queryKey: ['/api/time-blocks'],
  });

  // Calculate month statistics
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const totalDays = monthDays.length;

  return (
    <div className="space-y-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-heading font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <p className="text-muted-foreground mt-1 font-medium">
            Monthly overview and progress tracking
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousMonth}
            className="rounded-xl border-pink-200 hover:bg-pink-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            onClick={goToToday}
            className="rounded-xl border-pink-200 hover:bg-pink-50 px-4"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Today
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextMonth}
            className="rounded-xl border-pink-200 hover:bg-pink-50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Monthly Statistics */}
      <MonthlyStats monthDays={monthDays} />

      {/* Calendar Grid */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center py-2">
                <span className="text-sm font-heading font-semibold text-muted-foreground uppercase tracking-wide">
                  {day}
                </span>
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day) => (
              <MonthDayCard
                key={day.toISOString()}
                date={day}
                isSelected={isSameDay(day, selectedDate)}
                isCurrentMonth={isSameMonth(day, currentMonth)}
                onSelect={() => onDateChange(day)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface MonthlyStatsProps {
  monthDays: Date[];
}

function MonthlyStats({ monthDays }: MonthlyStatsProps) {
  const totalDays = monthDays.length;
  
  // Create a query to fetch all daily entries for the month
  const monthDateStrings = useMemo(() => 
    monthDays.map(day => format(day, 'yyyy-MM-dd')),
    [monthDays]
  );

  const { data: monthlyData } = useQuery({
    queryKey: ['/api/daily-entries-bulk', monthDateStrings],
    queryFn: async () => {
      // Fetch all daily entries for the month in parallel
      const promises = monthDateStrings.map(async (dateString) => {
        try {
          const response = await fetch(`/api/daily-entry/${dateString}`);
          if (response.ok) {
            const data = await response.json();
            return data;
          }
          return null;
        } catch {
          return null;
        }
      });
      
      const results = await Promise.all(promises);
      return results.filter(Boolean);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Calculate statistics from the fetched data
  const dailyEntries = monthlyData || [];
  let totalWater = 0;
  let exerciseDays = 0;
  let totalMeals = 0;
  let totalWorkHours = 0;
  let daysWithData = 0;

  dailyEntries.forEach((entry: any) => {
    if (entry) {
      daysWithData++;
      totalWater += entry.waterIntake ?? 0;
      if (entry.exerciseCompleted) exerciseDays++;
      
      const meals = [
        entry.breakfastCompleted,
        entry.lunchCompleted,
        entry.dinnerCompleted
      ].filter(Boolean).length;
      totalMeals += meals;
      
      totalWorkHours += parseFloat(entry.workHours || "0");
    }
  });

  const averageWater = daysWithData > 0 ? (totalWater / daysWithData).toFixed(1) : "0";
  const exercisePercentage = daysWithData > 0 ? Math.round((exerciseDays / daysWithData) * 100) : 0;
  const averageMeals = daysWithData > 0 ? (totalMeals / daysWithData).toFixed(1) : "0";

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-heading font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-1">
            {averageWater}
          </div>
          <div className="text-sm text-muted-foreground">Avg Water/Day</div>
          <div className="text-xs text-blue-600 mt-1">glasses</div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-heading font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1">
            {exercisePercentage}%
          </div>
          <div className="text-sm text-muted-foreground">Exercise Days</div>
          <div className="text-xs text-green-600 mt-1">{exerciseDays}/{daysWithData} days</div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-heading font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-1">
            {averageMeals}
          </div>
          <div className="text-sm text-muted-foreground">Avg Meals/Day</div>
          <div className="text-xs text-orange-600 mt-1">out of 3</div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-heading font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
            {totalWorkHours.toFixed(0)}h
          </div>
          <div className="text-sm text-muted-foreground">Total Work</div>
          <div className="text-xs text-purple-600 mt-1">this month</div>
        </CardContent>
      </Card>
    </div>
  );
}

interface MonthDayCardProps {
  date: Date;
  isSelected: boolean;
  isCurrentMonth: boolean;
  onSelect: () => void;
}

function MonthDayCard({ date, isSelected, isCurrentMonth, onSelect }: MonthDayCardProps) {
  const dateString = format(date, 'yyyy-MM-dd');
  const { data: dailyEntry } = useDailyData(dateString);
  
  const waterProgress = dailyEntry?.waterIntake ? ((dailyEntry.waterIntake ?? 0) / 8) * 100 : 0;
  const mealCount = [
    dailyEntry?.breakfastCompleted,
    dailyEntry?.lunchCompleted,
    dailyEntry?.dinnerCompleted
  ].filter(Boolean).length;

  const isToday = isSameDay(date, new Date());
  const hasData = Boolean(dailyEntry && (
    (dailyEntry.waterIntake ?? 0) > 0 || 
    dailyEntry.exerciseCompleted || 
    mealCount > 0 || 
    parseFloat(dailyEntry.workHours || "0") > 0
  ));
  
  return (
    <div 
      className={`
        cursor-pointer transition-all duration-200 hover:scale-105 p-2 rounded-xl min-h-[80px] flex flex-col
        ${isSelected 
          ? 'bg-gradient-to-br from-pink-100 to-purple-100 shadow-md' 
          : isCurrentMonth
            ? 'hover:bg-gradient-to-br hover:from-pink-50 hover:to-purple-50'
            : 'opacity-40 hover:opacity-60'
        }
        ${isToday ? 'ring-2 ring-pink-400 ring-opacity-50' : ''}
      `}
      onClick={onSelect}
    >
      <div className="text-center mb-1">
        <div className={`text-sm font-medium ${
          isToday 
            ? 'bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent font-bold' 
            : isSelected
              ? 'text-purple-700'
              : isCurrentMonth
                ? 'text-gray-800'
                : 'text-gray-400'
        }`}>
          {format(date, 'd')}
        </div>
      </div>

      {isCurrentMonth && hasData && (
        <div className="flex-1 space-y-1">
          {/* Water indicator */}
          {(dailyEntry?.waterIntake ?? 0) > 0 && (
            <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-300"
                style={{ width: `${Math.min(waterProgress, 100)}%` }}
              />
            </div>
          )}

          {/* Exercise indicator */}
          {dailyEntry?.exerciseCompleted && (
            <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mx-auto" />
          )}

          {/* Meals indicator */}
          {mealCount > 0 && (
            <div className="flex justify-center space-x-0.5">
              {[0, 1, 2].slice(0, mealCount).map((index) => (
                <div
                  key={index}
                  className="w-1 h-1 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}