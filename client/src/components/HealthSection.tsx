import { Heart, Plus, Edit, Moon, Utensils, Dumbbell } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { useDailyData } from "../hooks/use-daily-data";
import { format, isToday, isYesterday, isTomorrow } from "date-fns";
import { useQuery } from '@tanstack/react-query';

interface HealthSectionProps {
  selectedDate: Date;
  isReadOnly?: boolean;
}

interface WorkoutResponse {
  id: string;
  date: string;
  exercises: string;
  notes?: string;
}

export default function HealthSection({ selectedDate, isReadOnly = false }: HealthSectionProps) {
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const { data: dailyEntry } = useDailyData(dateString);

  // Fetch workout data from Notion database
  const { data: workoutData = [] } = useQuery<WorkoutResponse[]>({
    queryKey: ['/api/todays-workouts', dateString],
    queryFn: async () => {
      const response = await fetch(`/api/todays-workouts?date=${dateString}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        return [];
      }
      
      return response.json();
    },
    staleTime: 30000
  });

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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Workout Card - Enhanced with Notion data */}
        <Card className={`bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl overflow-hidden ${
          !isEditable ? 'opacity-60' : ''
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Dumbbell className="h-4 w-4 text-pink-500" />
                <h4 className="font-heading font-semibold text-gray-800 dark:text-white">Workout</h4>
              </div>
            </div>
            
            <div className="text-center mb-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg ${
                workoutData.length > 0 || dailyEntry?.exerciseCompleted
                  ? 'bg-gradient-to-r from-green-400 to-emerald-400' 
                  : 'bg-gradient-to-r from-gray-200 to-gray-300'
              }`}>
                {(workoutData.length > 0 || dailyEntry?.exerciseCompleted) ? (
                  <Dumbbell className="h-8 w-8 text-white" />
                ) : (
                  <Dumbbell className="h-8 w-8 text-gray-500" />
                )}
              </div>
              <div className={`text-sm font-medium ${
                workoutData.length > 0 || dailyEntry?.exerciseCompleted
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {workoutData.length > 0 
                  ? `${workoutData.length} workout${workoutData.length > 1 ? 's' : ''} scheduled` 
                  : dailyEntry?.exerciseCompleted 
                    ? '✨ Exercise completed!' 
                    : 'No workout scheduled'
                }
              </div>
            </div>
            
            {/* Preview of workout exercises */}
            {workoutData.length > 0 && (
              <div className="text-xs text-gray-600 dark:text-gray-300 bg-pink-50 dark:bg-[#17111d] rounded-xl p-3 border border-pink-100 dark:border-gray-600">
                <div className="space-y-1">
                  {workoutData[0].exercises.split('\n').slice(0, 2).map((exercise, index) => {
                    const trimmedExercise = exercise.trim();
                    if (!trimmedExercise) return null;
                    const exerciseText = trimmedExercise.startsWith('☐') || trimmedExercise.startsWith('☑') 
                      ? trimmedExercise.substring(1).trim() 
                      : trimmedExercise;
                    return (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                        <span className="truncate">{exerciseText}</span>
                      </div>
                    );
                  })}
                  {workoutData[0].exercises.split('\n').filter(e => e.trim()).length > 2 && (
                    <div className="text-pink-500 font-medium">
                      +{workoutData[0].exercises.split('\n').filter(e => e.trim()).length - 2} more exercises
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Fallback to exercise notes if no workout data */}
            {workoutData.length === 0 && dailyEntry?.exerciseNotes && (
              <div className="text-xs text-gray-600 dark:text-gray-300 bg-pink-50 dark:bg-[#17111d] rounded-xl p-3 border border-pink-100 dark:border-gray-600">
                {dailyEntry.exerciseNotes}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sleep Card */}
        <Card className={`bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl overflow-hidden ${
          !isEditable ? 'opacity-60' : ''
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Moon className="text-purple-500 h-5 w-5" />
                <h4 className="font-heading font-semibold text-gray-800 dark:text-white">Sleep</h4>
              </div>
              {isEditable && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  disabled={!isEditable}
                  className={`rounded-xl ${!isEditable ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-50 dark:hover:bg-purple-900/30'}`}
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
                  <div className="text-sm text-muted-foreground mb-3 bg-purple-50 dark:bg-[#17111d]/30 rounded-lg px-3 py-1">
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
        <Card className={`bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl overflow-hidden ${
          !isEditable ? 'opacity-60' : ''
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Utensils className="text-orange-500 h-5 w-5" />
                <h4 className="font-heading font-semibold text-gray-800 dark:text-white">Meals</h4>
              </div>
              {isEditable && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  disabled={!isEditable}
                  className={`rounded-xl ${!isEditable ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-50 dark:hover:bg-orange-900/30'}`}
                >
                  <Plus className="h-4 w-4 text-orange-500" />
                </Button>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 px-3 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-xl">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Breakfast</span>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm ${
                  dailyEntry?.breakfastCompleted ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-[#17111d]'
                }`}>
                  {dailyEntry?.breakfastCompleted && (
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between py-3 px-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 rounded-xl">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Lunch</span>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm ${
                  dailyEntry?.lunchCompleted ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-[#17111d]'
                }`}>
                  {dailyEntry?.lunchCompleted && (
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between py-3 px-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Dinner</span>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm ${
                  dailyEntry?.dinnerCompleted ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-[#17111d]'
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