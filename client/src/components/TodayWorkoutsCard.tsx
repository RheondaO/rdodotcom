import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, isToday, isYesterday, isTomorrow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Dumbbell } from 'lucide-react';

interface TodayWorkoutsCardProps {
  selectedDate: Date;
  isReadOnly?: boolean;
}

interface WorkoutResponse {
  id: string;
  date: string;
  exercises: string;
  notes?: string;
}

export default function TodayWorkoutsCard({ selectedDate, isReadOnly = false }: TodayWorkoutsCardProps) {
  const { toast } = useToast();
  const dateString = format(selectedDate, 'yyyy-MM-dd');

  // Dynamic title based on selected date
  const getDateLabel = () => {
    if (isToday(selectedDate)) return "Today's Workout";
    if (isYesterday(selectedDate)) return "Yesterday's Workout";
    if (isTomorrow(selectedDate)) return "Tomorrow's Workout";
    return `${format(selectedDate, 'EEEE')}'s Workout`;
  };

  // API Query for workout data
  const { 
    data: workoutData, 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = useQuery<WorkoutResponse[]>({
    queryKey: ['/api/todays-workouts', dateString],
    queryFn: async () => {
      const response = await fetch(`/api/todays-workouts?date=${dateString}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch today\'s workouts');
      }
      
      return response.json();
    },
    refetchOnWindowFocus: true,
    refetchInterval: isToday(selectedDate) ? 30000 : false, // Only poll for today's date
    retry: 2,
    staleTime: 30000
  });

  // Handle query errors with useEffect to prevent repeated toasts
  useEffect(() => {
    if (error) {
      toast({
        title: "Error Loading Workouts",
        description: "Failed to load today's workout data. Please try refreshing.",
        variant: "destructive"
      });
    }
  }, [error, toast]);

  const workouts = workoutData || [];
  const hasWorkouts = workouts.length > 0;

  return (
    <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5" />
          {getDateLabel()}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3" data-testid="loading-skeleton">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            <Dumbbell className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Failed to load workout data</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Exercise Content */}
        {!isLoading && !error && (
          <div data-testid="list-exercises">
            {!hasWorkouts ? (
              <div className="text-center py-8 text-muted-foreground" data-testid="text-empty-state">
                <Dumbbell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium mb-1">No workouts scheduled</p>
                <p className="text-sm">Take a rest day or add a new workout to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Workout Checklists */}
                {workouts.map((workout, index) => (
                  <div 
                    key={workout.id} 
                    className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                  >
                    
                    {/* Exercise Checklist */}
                    <div className="space-y-2">
                      {workout.exercises.split('\n').map((exercise, exerciseIndex) => {
                        const trimmedExercise = exercise.trim();
                        if (!trimmedExercise) return null;
                        
                        // Check if it's a checkbox item
                        const isCheckboxItem = trimmedExercise.startsWith('☐') || trimmedExercise.startsWith('☑');
                        const exerciseText = isCheckboxItem ? trimmedExercise.substring(1).trim() : trimmedExercise;
                        
                        return (
                          <div 
                            key={`${workout.id}-${exerciseIndex}`}
                            className="flex items-start gap-3 py-1"
                            data-testid={`exercise-${exerciseIndex}`}
                          >
                            {isCheckboxItem && (
                              <div className="mt-0.5">
                                <div className="w-4 h-4 border-2 border-gray-400 dark:border-gray-500 rounded-sm flex items-center justify-center bg-white dark:bg-gray-700">
                                  {trimmedExercise.startsWith('☑') && (
                                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                            )}
                            <span className="text-foreground leading-relaxed flex-1">
                              {exerciseText}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Notes if available */}
                    {workout.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="text-sm text-muted-foreground">
                          <strong>Notes:</strong> {workout.notes}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}