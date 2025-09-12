import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Dumbbell, Target, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface WorkoutStatsData {
  totalWorkouts: number;
  totalMinutes: number;
  caloriesBurned: number;
  avgDifficulty: number;
}

interface WorkoutStatsProps {
  selectedDate: Date;
  isReadOnly?: boolean;
}

export default function WorkoutStats({ selectedDate, isReadOnly = false }: WorkoutStatsProps) {
  // Query to fetch workout statistics from Notion WORKOUTSTATS database
  const { 
    data: workoutStats, 
    isLoading, 
    error 
  } = useQuery<WorkoutStatsData>({
    queryKey: ['/api/workout-stats'],
    queryFn: async () => {
      const response = await fetch('/api/workout-stats', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch workout stats');
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refresh every 30 seconds for real-time updates
  });

  if (isLoading) {
    return (
      <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Workout Stats
          </CardTitle>
          <p className="text-sm text-muted-foreground">Statistics from your workout history</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !workoutStats) {
    return (
      <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Workout Stats
          </CardTitle>
          <p className="text-sm text-muted-foreground">Statistics from your workout history</p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">
            Unable to load workout statistics
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Workout Stats
        </CardTitle>
        <p className="text-sm text-muted-foreground">Statistics from your workout history</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-blue-600" />
              <span>Total Workouts</span>
            </div>
            <span className="font-bold text-blue-600">{workoutStats.totalWorkouts}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span>Total Minutes</span>
            </div>
            <span className="font-bold text-green-600">{workoutStats.totalMinutes?.toLocaleString() || 0}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-600" />
              <span>Calories Burned</span>
            </div>
            <span className="font-bold text-purple-600">{workoutStats.caloriesBurned?.toLocaleString() || 0}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-orange-600" />
              <span>Avg Difficulty</span>
            </div>
            <span className="font-bold text-orange-600">{workoutStats.avgDifficulty}/5.0</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}