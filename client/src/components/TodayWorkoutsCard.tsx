import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subDays, addDays, isToday, isYesterday, isTomorrow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  Dumbbell, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCcw,
  Clock,
  Target,
  Zap
} from 'lucide-react';

interface TodayWorkoutsCardProps {
  selectedDate: Date;
  isReadOnly?: boolean;
  onChangeDate?: (date: Date) => void;
}

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  type: 'strength' | 'cardio' | 'flexibility' | 'sports';
  completed: boolean;
  notes?: string;
}

interface WorkoutResponse {
  date: string;
  exercises: Exercise[];
  totalDuration: number;
  caloriesBurned: number;
  completed: boolean;
}

export default function TodayWorkoutsCard({ selectedDate, isReadOnly = false, onChangeDate }: TodayWorkoutsCardProps) {
  const { toast } = useToast();
  const dateString = format(selectedDate, 'yyyy-MM-dd');

  // Utility functions for date navigation
  const getDateLabel = () => {
    if (isToday(selectedDate)) return "Today";
    if (isYesterday(selectedDate)) return "Yesterday";
    if (isTomorrow(selectedDate)) return "Tomorrow";
    return format(selectedDate, 'EEEE, MMM d');
  };

  const goToPreviousDay = () => {
    if (!isReadOnly && onChangeDate) {
      onChangeDate(subDays(selectedDate, 1));
    }
  };

  const goToNextDay = () => {
    if (!isReadOnly && onChangeDate) {
      onChangeDate(addDays(selectedDate, 1));
    }
  };

  const goToToday = () => {
    if (!isReadOnly && onChangeDate) {
      onChangeDate(new Date());
    }
  };

  // API Query for workout data
  const { 
    data: workoutData, 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = useQuery<WorkoutResponse>({
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

  const exercises = workoutData?.exercises || [];
  const completedExercises = exercises.filter(ex => ex.completed).length;
  const totalExercises = exercises.length;
  const progressPercentage = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  const getExerciseIcon = (type: string) => {
    switch (type) {
      case 'strength':
        return <Dumbbell className="h-4 w-4" />;
      case 'cardio':
        return <Zap className="h-4 w-4" />;
      case 'flexibility':
        return <Target className="h-4 w-4" />;
      default:
        return <Dumbbell className="h-4 w-4" />;
    }
  };

  const getExerciseTypeColor = (type: string) => {
    switch (type) {
      case 'strength':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'cardio':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'flexibility':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'sports':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-heading font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            <Dumbbell className="h-5 w-5 text-primary" />
            Today's Workouts
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching || isReadOnly}
              data-testid="button-refresh"
              className="hover:bg-primary/10 rounded-xl"
            >
              <RefreshCcw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPreviousDay}
              disabled={isReadOnly || !onChangeDate}
              data-testid="button-yesterday"
              className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              onClick={goToToday}
              disabled={isReadOnly || !onChangeDate}
              data-testid="button-today"
              className="rounded-xl border-pink-200 hover:bg-pink-50 dark:border-pink-800 dark:hover:bg-pink-900/30 px-4"
            >
              <Clock className="h-4 w-4 mr-2" />
              {getDateLabel()}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={goToNextDay}
              disabled={isReadOnly || !onChangeDate}
              data-testid="button-tomorrow"
              className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Badge */}
          {totalExercises > 0 && (
            <Badge variant="secondary" className="px-3 py-1">
              {completedExercises}/{totalExercises} Complete
            </Badge>
          )}
        </div>
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

        {/* Exercises List */}
        {!isLoading && !error && (
          <div data-testid="list-exercises">
            {exercises.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground" data-testid="text-empty-state">
                <Dumbbell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium mb-1">No workouts scheduled</p>
                <p className="text-sm">Take a rest day or add a new workout to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Workout Summary */}
                {workoutData && (
                  <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{workoutData.totalDuration}min</div>
                      <div className="text-xs text-muted-foreground">Duration</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-secondary">{workoutData.caloriesBurned}</div>
                      <div className="text-xs text-muted-foreground">Calories</div>
                    </div>
                  </div>
                )}

                {/* Progress Bar */}
                {totalExercises > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {progressPercentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div 
                        className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Exercise Items */}
                {exercises.map((exercise) => (
                  <div 
                    key={exercise.id}
                    className={`p-4 rounded-lg border transition-all duration-200 ${
                      exercise.completed 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          exercise.completed ? 'bg-green-500/20' : 'bg-primary/20'
                        }`}>
                          {getExerciseIcon(exercise.type)}
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{exercise.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getExerciseTypeColor(exercise.type)}`}
                            >
                              {exercise.type}
                            </Badge>
                            {exercise.completed && (
                              <Badge variant="default" className="text-xs bg-green-500 hover:bg-green-600">
                                ✓ Completed
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div className="text-center">
                        <div className="font-medium text-foreground">{exercise.sets}</div>
                        <div>Sets</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-foreground">{exercise.reps}</div>
                        <div>Reps</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-foreground">
                          {exercise.weight ? `${exercise.weight}lbs` : exercise.duration ? `${exercise.duration}min` : '-'}
                        </div>
                        <div>{exercise.weight ? 'Weight' : exercise.duration ? 'Duration' : 'N/A'}</div>
                      </div>
                    </div>

                    {exercise.notes && (
                      <div className="mt-3 text-sm text-muted-foreground bg-gray-100 dark:bg-gray-800 p-2 rounded">
                        {exercise.notes}
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