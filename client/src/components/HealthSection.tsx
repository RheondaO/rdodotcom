import { Heart, Plus, Edit, Moon, Utensils } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import WaterIntakeCard from "./WaterIntakeCard";
import { useDailyData } from "../hooks/use-daily-data";
import { format, isToday, isYesterday, isTomorrow } from "date-fns";

interface HealthSectionProps {
  selectedDate: Date;
  isReadOnly?: boolean;
}

export default function HealthSection({ selectedDate, isReadOnly = false }: HealthSectionProps) {
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const { data: dailyEntry } = useDailyData(dateString);

  const getDateLabel = () => {
    if (isToday(selectedDate)) return "Today";
    if (isYesterday(selectedDate)) return "Yesterday";
    if (isTomorrow(selectedDate)) return "Tomorrow";
    return format(selectedDate, 'EEEE');
  };

  // Check if the selected date is editable (today or yesterday only) AND not in read-only mode
  const isEditable = !isReadOnly && (isToday(selectedDate) || isYesterday(selectedDate));

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-heading font-bold bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
            Health & Wellness Tracking
          </h3>
          <p className="text-muted-foreground dark:text-gray-300 mt-1">
            Monitor your daily health metrics and wellness progress
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Water Intake Card */}
        <WaterIntakeCard selectedDate={selectedDate} isEditable={isEditable} />

        {/* Exercise Card */}
        <Card className={`bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl overflow-hidden ${
          !isEditable ? 'opacity-60' : ''
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full shadow-sm"></div>
                <h4 className="font-heading font-semibold text-gray-800">Exercise</h4>
              </div>
            </div>
            
            <div className="text-center mb-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg ${
                dailyEntry?.exerciseCompleted 
                  ? 'bg-gradient-to-r from-green-400 to-emerald-400' 
                  : 'bg-gradient-to-r from-gray-200 to-gray-300'
              }`}>
                {dailyEntry?.exerciseCompleted ? (
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"></div>
                  </div>
                ) : (
                  <div className="w-8 h-8 border-3 border-white rounded-full"></div>
                )}
              </div>
              <div className={`text-sm font-medium ${
                dailyEntry?.exerciseCompleted ? 'text-green-600' : 'text-gray-500'
              }`}>
                {dailyEntry?.exerciseCompleted ? '✨ Completed!' : 'Not done yet'}
              </div>
            </div>
            
            {dailyEntry?.exerciseNotes && (
              <div className="text-xs text-gray-600 bg-pink-50 rounded-xl p-3 border border-pink-100">
                {dailyEntry.exerciseNotes}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sleep Card */}
        <Card className={`bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl overflow-hidden ${
          !isEditable ? 'opacity-60' : ''
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Moon className="text-purple-500 h-5 w-5" />
                <h4 className="font-heading font-semibold text-gray-800">Sleep</h4>
              </div>
              {isEditable && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  disabled={!isEditable}
                  className={`rounded-xl ${!isEditable ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-50'}`}
                >
                  <Edit className="h-4 w-4 text-purple-500" />
                </Button>
              )}
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-heading font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                {dailyEntry?.sleepHours ? `${dailyEntry.sleepHours}h` : '--'}
              </div>
              {dailyEntry?.wakeUpTime && (
                <>
                  <div className="text-sm text-muted-foreground mb-3 bg-purple-50 rounded-lg px-3 py-1">
                    Wake: {dailyEntry.wakeUpTime}
                  </div>
                </>
              )}
              {!dailyEntry?.sleepHours && (
                <div className="text-sm text-muted-foreground">
                  No sleep data yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Meals Card */}
        <Card className={`bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl overflow-hidden ${
          !isEditable ? 'opacity-60' : ''
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Utensils className="text-orange-500 h-5 w-5" />
                <h4 className="font-heading font-semibold text-gray-800">Meals</h4>
              </div>
              {isEditable && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  disabled={!isEditable}
                  className={`rounded-xl ${!isEditable ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-50'}`}
                >
                  <Plus className="h-4 w-4 text-orange-500" />
                </Button>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 px-3 bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">Breakfast</span>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm ${
                  dailyEntry?.breakfastCompleted ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'border-2 border-gray-300 bg-white'
                }`}>
                  {dailyEntry?.breakfastCompleted && (
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between py-3 px-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">Lunch</span>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm ${
                  dailyEntry?.lunchCompleted ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'border-2 border-gray-300 bg-white'
                }`}>
                  {dailyEntry?.lunchCompleted && (
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between py-3 px-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">Dinner</span>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm ${
                  dailyEntry?.dinnerCompleted ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'border-2 border-gray-300 bg-white'
                }`}>
                  {dailyEntry?.dinnerCompleted && (
                    <div className="w-3 h-3 bg-white rounded-full"></div>
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