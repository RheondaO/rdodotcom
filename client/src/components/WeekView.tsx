import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay } from "date-fns";
import { useDailyData } from "../hooks/use-daily-data";

interface WeekViewProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function WeekView({ selectedDate, onDateChange }: WeekViewProps) {
  const [currentWeek, setCurrentWeek] = useState(() => startOfWeek(selectedDate));
  
  const weekStart = startOfWeek(currentWeek);
  const weekEnd = endOfWeek(currentWeek);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const goToPreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentWeek(startOfWeek(today));
    onDateChange(today);
  };

  return (
    <div className="space-y-6">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-heading font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Week Overview
          </h2>
          <p className="text-muted-foreground mt-1 font-medium">
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousWeek}
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
            onClick={goToNextWeek}
            className="rounded-xl border-pink-200 hover:bg-pink-50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((day) => (
          <DayCard
            key={day.toISOString()}
            date={day}
            isSelected={isSameDay(day, selectedDate)}
            onSelect={() => onDateChange(day)}
          />
        ))}
      </div>
    </div>
  );
}

interface DayCardProps {
  date: Date;
  isSelected: boolean;
  onSelect: () => void;
}

function DayCard({ date, isSelected, onSelect }: DayCardProps) {
  const dateString = format(date, 'yyyy-MM-dd');
  const { data: dailyEntry } = useDailyData(dateString);
  
  const waterProgress = dailyEntry?.waterIntake ? (dailyEntry.waterIntake / 8) * 100 : 0;
  const mealCount = [
    dailyEntry?.breakfastCompleted,
    dailyEntry?.lunchCompleted,
    dailyEntry?.dinnerCompleted
  ].filter(Boolean).length;

  const isToday = isSameDay(date, new Date());
  
  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
        isSelected 
          ? 'bg-gradient-to-br from-pink-100 to-purple-100 border-pink-300 shadow-lg' 
          : 'bg-white/80 backdrop-blur-sm border-0 shadow-md'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="text-center mb-3">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {format(date, 'EEE')}
          </div>
          <div className={`text-2xl font-heading font-bold mt-1 ${
            isToday 
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent' 
              : isSelected
                ? 'text-purple-700'
                : 'text-gray-800'
          }`}>
            {format(date, 'd')}
          </div>
          {isToday && (
            <div className="text-xs text-pink-600 font-medium mt-1">Today</div>
          )}
        </div>

        {/* Progress Indicators */}
        <div className="space-y-2">
          {/* Water Progress */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Water</span>
            <div className="flex items-center space-x-1">
              <div className="w-8 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-300"
                  style={{ width: `${Math.min(waterProgress, 100)}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{dailyEntry?.waterIntake || 0}</span>
            </div>
          </div>

          {/* Exercise */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Exercise</span>
            <div className={`w-3 h-3 rounded-full ${
              dailyEntry?.exerciseCompleted 
                ? 'bg-gradient-to-r from-green-400 to-emerald-400' 
                : 'bg-gray-200'
            }`} />
          </div>

          {/* Meals */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Meals</span>
            <div className="flex space-x-1">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index < mealCount 
                      ? 'bg-gradient-to-r from-orange-400 to-pink-400' 
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Work Hours */}
          {dailyEntry?.workHours && parseFloat(dailyEntry.workHours) > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Work</span>
              <span className="text-xs font-medium text-purple-600">
                {parseFloat(dailyEntry.workHours).toFixed(1)}h
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}