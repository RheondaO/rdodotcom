import { Heart, Plus, Edit, Moon, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import WaterIntakeCard from "./WaterIntakeCard";
import { useDailyData } from "@/hooks/use-daily-data";
import { format } from "date-fns";

interface HealthSectionProps {
  selectedDate: Date;
}

export default function HealthSection({ selectedDate }: HealthSectionProps) {
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const { data: dailyEntry } = useDailyData(dateString);

  return (
    <section className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <Heart className="text-secondary mr-3 h-5 w-5" />
        Health & Wellness
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Water Intake Card */}
        <WaterIntakeCard selectedDate={selectedDate} />

        {/* Exercise Card */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <h4 className="font-medium text-gray-900">Exercise</h4>
              </div>
            </div>
            
            <div className="text-center mb-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                dailyEntry?.exerciseCompleted 
                  ? 'bg-success bg-opacity-10' 
                  : 'bg-gray-100'
              }`}>
                {dailyEntry?.exerciseCompleted ? (
                  <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                ) : (
                  <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                )}
              </div>
              <div className={`text-sm font-medium ${
                dailyEntry?.exerciseCompleted ? 'text-success' : 'text-gray-400'
              }`}>
                {dailyEntry?.exerciseCompleted ? 'Completed' : 'Not done'}
              </div>
            </div>
            
            {dailyEntry?.exerciseNotes && (
              <div className="text-xs text-neutral-cool bg-gray-50 rounded-lg p-3">
                {dailyEntry.exerciseNotes}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sleep Card */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Moon className="text-primary h-4 w-4" />
                <h4 className="font-medium text-gray-900">Sleep</h4>
              </div>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {dailyEntry?.sleepHours ? `${dailyEntry.sleepHours}h` : '--'}
              </div>
              {dailyEntry?.wakeUpTime && (
                <>
                  <div className="text-sm text-neutral-cool mb-3">
                    Wake: {dailyEntry.wakeUpTime}
                  </div>
                </>
              )}
              {!dailyEntry?.sleepHours && (
                <div className="text-sm text-neutral-cool">
                  No sleep data
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Meals Card */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Utensils className="text-primary h-4 w-4" />
                <h4 className="font-medium text-gray-900">Meals</h4>
              </div>
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-700">Breakfast</span>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  dailyEntry?.breakfastCompleted ? 'bg-success' : 'border-2 border-gray-300'
                }`}>
                  {dailyEntry?.breakfastCompleted && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-700">Lunch</span>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  dailyEntry?.lunchCompleted ? 'bg-success' : 'border-2 border-gray-300'
                }`}>
                  {dailyEntry?.lunchCompleted && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-700">Dinner</span>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  dailyEntry?.dinnerCompleted ? 'bg-success' : 'border-2 border-gray-300'
                }`}>
                  {dailyEntry?.dinnerCompleted && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
