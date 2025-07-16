import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { useDailyData, useUpdateDailyEntry } from "../hooks/use-daily-data";
import { format } from "date-fns";

interface WaterIntakeCardProps {
  selectedDate: Date;
  isEditable?: boolean;
}

export default function WaterIntakeCard({ selectedDate, isEditable = true }: WaterIntakeCardProps) {
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const { data: dailyEntry } = useDailyData(dateString);
  const updateDailyEntry = useUpdateDailyEntry();

  const waterIntake = dailyEntry?.waterIntake || 0;
  const waterGoal = 8;
  const progress = (waterIntake / waterGoal) * 100;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const handleAddWater = () => {
    if (waterIntake < waterGoal) {
      updateDailyEntry.mutate({
        date: dateString,
        waterIntake: waterIntake + 1,
      });
    }
  };

  return (
    <Card className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl overflow-hidden ${
      !isEditable ? 'opacity-60' : ''
    }`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full shadow-sm"></div>
            <h4 className="font-heading font-semibold text-gray-800 dark:text-white">Water Intake</h4>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={isEditable ? handleAddWater : undefined}
            disabled={!isEditable || waterIntake >= waterGoal || updateDailyEntry.isPending}
            className={`hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Plus className="h-4 w-4 text-blue-500" />
          </Button>
        </div>

        {/* Water Progress Ring */}
        <div className="relative w-20 h-20 mx-auto mb-4">
          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
            <circle 
              cx="50" 
              cy="50" 
              r="40" 
              stroke="#E5E7EB" 
              strokeWidth="8" 
              fill="none"
              className="dark:stroke-gray-700"
            />
            <circle 
              cx="50" 
              cy="50" 
              r="40" 
              stroke="hsl(var(--secondary))" 
              strokeWidth="8" 
              fill="none" 
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-secondary">{waterIntake}</span>
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-heading font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-1">
            {waterIntake * 8}oz
          </div>
          <div className="text-sm text-muted-foreground">
            Goal: {waterGoal * 8}oz 💧
          </div>
        </div>
      </CardContent>
    </Card>
  );
}