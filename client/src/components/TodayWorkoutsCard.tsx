import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, isToday } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  Dumbbell, 
  RefreshCcw
} from 'lucide-react';

interface TodayWorkoutsCardProps {
  selectedDate: Date;
  isReadOnly?: boolean;
}

interface WorkoutResponse {
  date: string;
  exercises: string;
  totalDuration?: number;
  caloriesBurned?: number;
}

export default function TodayWorkoutsCard({ selectedDate, isReadOnly = false }: TodayWorkoutsCardProps) {
  const { toast } = useToast();
  const dateString = format(selectedDate, 'yyyy-MM-dd');

  // Format date for display
  const getDateLabel = () => {
    if (isToday(selectedDate)) return "Today's Workouts";
    return `Workouts for ${format(selectedDate, 'EEEE, MMM d')}`;
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

  const exercises = workoutData?.exercises || '';

  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-heading font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            <Dumbbell className="h-5 w-5 text-primary" />
            {getDateLabel()}
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
            {!exercises || exercises.trim() === '' ? (
              <div className="text-center py-8 text-muted-foreground" data-testid="text-empty-state">
                <Dumbbell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium mb-1">No workouts scheduled</p>
                <p className="text-sm">Take a rest day or add a new workout to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Workout Summary */}
                {workoutData && (workoutData.totalDuration || workoutData.caloriesBurned) && (
                  <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg">
                    {workoutData.totalDuration && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{workoutData.totalDuration}min</div>
                        <div className="text-xs text-muted-foreground">Duration</div>
                      </div>
                    )}
                    {workoutData.caloriesBurned && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-secondary">{workoutData.caloriesBurned}</div>
                        <div className="text-xs text-muted-foreground">Calories</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Raw Exercise Text */}
                <div className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                  <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                    {exercises}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}