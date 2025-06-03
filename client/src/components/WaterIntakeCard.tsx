import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDailyData, useUpdateDailyEntry } from "@/hooks/use-daily-data";
import { format } from "date-fns";

interface WaterIntakeCardProps {
  selectedDate: Date;
}

export default function WaterIntakeCard({ selectedDate }: WaterIntakeCardProps) {
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
    <Card className="bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-secondary rounded-full"></div>
            <h4 className="font-medium text-gray-900">Water Intake</h4>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleAddWater}
            disabled={waterIntake >= waterGoal || updateDailyEntry.isPending}
          >
            <Plus className="h-4 w-4" />
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
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {waterIntake * 8}oz
          </div>
          <div className="text-sm text-neutral-cool">
            Goal: {waterGoal * 8}oz
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
