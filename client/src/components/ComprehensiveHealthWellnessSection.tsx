import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format, isToday, isYesterday, isTomorrow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { 
  Droplets, 
  Dumbbell, 
  Weight, 
  Target, 
  TrendingUp, 
  Calendar,
  Plus,
  Activity,
  Timer,
  Zap,
  Heart,
  Apple,
  Scale,
  BarChart3,
  PieChart as PieChartIcon,
  Users,
  Ruler,
  Calculator,
  TrendingDown,
  Clock,
  Utensils,
  Moon,
  Brain,
  Shield,
  AlertCircle,
  CheckCircle2,
  Edit2,
  Trash2
} from 'lucide-react';
import WaterIntakeCard from './WaterIntakeCard';
import DietJournalPlanner from './DietJournalPlanner';
import TodayWorkoutsCard from './TodayWorkoutsCard';

interface ComprehensiveHealthWellnessSectionProps {
  selectedDate: Date;
  isReadOnly?: boolean;
}

// Performance indicator colors
const performanceColors = {
  excellent: '#10b981',
  good: '#3b82f6', 
  fair: '#f59e0b',
  poor: '#ef4444'
};

export default function ComprehensiveHealthWellnessSection({ selectedDate, isReadOnly = false }: ComprehensiveHealthWellnessSectionProps) {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState<string | null>(null);
  
  // Form states
  const [workoutForm, setWorkoutForm] = useState({
    name: '',
    duration: '',
    notes: '',
    calories: '',
    difficulty: 3,
    type: 'strength'
  });

  const [weightForm, setWeightForm] = useState({
    weight: '',
    bodyFat: '',
    muscleMass: '',
    waterWeight: '',
    notes: ''
  });

  const [measurementForm, setMeasurementForm] = useState({
    neck: '',
    chest: '',
    waist: '',
    hips: '',
    bicep: '',
    thigh: '',
    notes: ''
  });

  const [fitnessGoalForm, setFitnessGoalForm] = useState({
    type: 'weight_loss',
    title: '',
    description: '',
    targetValue: '',
    currentValue: '',
    unit: 'lbs',
    targetDate: '',
    priority: 'medium'
  });

  const [nutritionForm, setNutritionForm] = useState({
    mealType: 'breakfast',
    food: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    sodium: ''
  });

  // Utility functions
  const getDateLabel = () => {
    if (isToday(selectedDate)) return "Today";
    if (isYesterday(selectedDate)) return "Yesterday";
    if (isTomorrow(selectedDate)) return "Tomorrow";
    return format(selectedDate, 'EEEE');
  };

  const isEditable = !isReadOnly && (isToday(selectedDate) || isYesterday(selectedDate));

  // API Queries with comprehensive fitness data
  const { data: workouts = [] } = useQuery<any[]>({
    queryKey: ['/api/workouts', dateString],
    enabled: !!dateString,
    refetchOnWindowFocus: true
  });

  const { data: bodyWeights = [] } = useQuery<any[]>({
    queryKey: ['/api/body-weights'],
    enabled: true,
    refetchOnWindowFocus: true
  });

  const { data: bodyMeasurements = [] } = useQuery<any[]>({
    queryKey: ['/api/body-measurements'],
    enabled: true,
    refetchOnWindowFocus: true
  });

  const { data: fitnessGoals = [] } = useQuery<any[]>({
    queryKey: ['/api/fitness-goals'],
    enabled: true,
    refetchOnWindowFocus: true
  });

  const { data: nutritionEntries = [] } = useQuery<any[]>({
    queryKey: ['/api/nutrition', dateString],
    enabled: !!dateString,
    refetchOnWindowFocus: true
  });

  const { data: fitnessAnalytics } = useQuery({
    queryKey: ['/api/fitness-analytics'],
    enabled: true,
    refetchOnWindowFocus: true
  });

  // Calculate performance indicators
  const calculatePerformanceIndicators = () => {
    const recentWeights = bodyWeights.slice(-30); // Last 30 entries
    const recentWorkouts = workouts.slice(-7); // Last 7 days
    const todayNutrition = nutritionEntries.filter(entry => entry.date === dateString);
    
    // Weight trend analysis
    const weightTrend = recentWeights.length >= 2 ? 
      recentWeights[recentWeights.length - 1]?.weight - recentWeights[0]?.weight : 0;
    
    // Workout consistency (last 7 days)
    const workoutConsistency = (recentWorkouts.length / 7) * 100;
    
    // Nutrition quality score
    const dailyCalories = todayNutrition.reduce((sum, entry) => sum + (entry.calories || 0), 0);
    const dailyProtein = todayNutrition.reduce((sum, entry) => sum + (entry.protein || 0), 0);
    
    return {
      weightTrend,
      workoutConsistency,
      dailyCalories,
      dailyProtein,
      totalWorkouts: workouts.length,
      currentWeight: recentWeights[recentWeights.length - 1]?.weight || 0,
      bodyFatPercentage: recentWeights[recentWeights.length - 1]?.bodyFat || 0
    };
  };

  const performanceData = calculatePerformanceIndicators();

  // Age-based nutrition recommendations
  const getAgeBasedRecommendations = (age: number = 30) => {
    const baseCalories = age < 30 ? 2200 : age < 50 ? 2000 : 1800;
    const protein = Math.round(baseCalories * 0.15 / 4); // 15% of calories from protein
    const carbs = Math.round(baseCalories * 0.45 / 4); // 45% from carbs
    const fat = Math.round(baseCalories * 0.30 / 9); // 30% from fat
    
    return { baseCalories, protein, carbs, fat };
  };

  const ageRecommendations = getAgeBasedRecommendations();

  // Mutations
  const createWorkoutMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!isAdmin) {
        throw new Error("Admin authentication required");
      }
      return await apiRequest('/api/workouts', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workouts'] });
      setShowModal(null);
      setWorkoutForm({ name: '', duration: '', notes: '', calories: '', difficulty: 3, type: 'strength' });
    },
    onError: () => {
      toast({ 
        description: "Records can only be created when logged in as the admin. Please log in to continue.",
        variant: "destructive"
      });
    }
  });

  const createWeightMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!isAdmin) {
        throw new Error("Admin authentication required");
      }
      return await apiRequest('/api/body-weights', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/body-weights'] });
      setShowModal(null);
      setWeightForm({ weight: '', bodyFat: '', muscleMass: '', waterWeight: '', notes: '' });
    },
    onError: () => {
      toast({ 
        description: "Records can only be created when logged in as the admin. Please log in to continue.",
        variant: "destructive"
      });
    }
  });

  const createMeasurementMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!isAdmin) {
        throw new Error("Admin authentication required");
      }
      return await apiRequest('/api/body-measurements', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/body-measurements'] });
      setShowModal(null);
      setMeasurementForm({ neck: '', chest: '', waist: '', hips: '', bicep: '', thigh: '', notes: '' });
    },
    onError: () => {
      toast({ 
        description: "Records can only be created when logged in as the admin. Please log in to continue.",
        variant: "destructive"
      });
    }
  });

  const createFitnessGoalMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!isAdmin) {
        throw new Error("Admin authentication required");
      }
      return await apiRequest('/api/fitness-goals', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fitness-goals'] });
      setShowModal(null);
      setFitnessGoalForm({
        type: 'weight_loss',
        title: '',
        description: '',
        targetValue: '',
        currentValue: '',
        unit: 'lbs',
        targetDate: '',
        priority: 'medium'
      });
    },
    onError: () => {
      toast({ 
        description: "Records can only be created when logged in as the admin. Please log in to continue.",
        variant: "destructive"
      });
    }
  });

  const createNutritionMutation = useMutation({
    mutationFn: async (data: any) => await apiRequest('/api/nutrition', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/nutrition'] });
      setShowModal(null);
      setNutritionForm({
        mealType: 'breakfast',
        food: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        fiber: '',
        sodium: ''
      });
    }
  });

  // Chart data preparation
  const weightChartData = bodyWeights.slice(-30).map((entry, index) => ({
    date: entry.date,
    weight: entry.weight,
    bodyFat: entry.bodyFat,
    day: index + 1
  }));

  const nutritionChartData = [
    { name: 'Protein', value: performanceData.dailyProtein, color: '#10b981' },
    { name: 'Carbs', value: nutritionEntries.reduce((sum, entry) => sum + (entry.carbs || 0), 0), color: '#3b82f6' },
    { name: 'Fat', value: nutritionEntries.reduce((sum, entry) => sum + (entry.fat || 0), 0), color: '#f59e0b' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-heading font-bold bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent flex items-center gap-3">
                <Heart className="h-8 w-8 text-primary" />
                Health & Wellness Tracking
              </h1>
              <p className="text-muted-foreground mt-2">
                Comprehensive fitness tracking and performance analytics for {getDateLabel()}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="px-3 py-1">
                <Activity className="h-4 w-4 mr-1" />
                {performanceData.totalWorkouts} Total Workouts
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                <Weight className="h-4 w-4 mr-1" />
                {performanceData.currentWeight} lbs Current
              </Badge>
            </div>
          </div>

          {/* Performance Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Weight Trend (30d)</p>
                    <p className="text-2xl font-bold text-foreground">
                      {performanceData.weightTrend > 0 ? '+' : ''}{performanceData.weightTrend.toFixed(1)} lbs
                    </p>
                  </div>
                  <div className={`p-2 rounded-full ${performanceData.weightTrend < 0 ? 'bg-success/20' : 'bg-destructive/20'}`}>
                    {performanceData.weightTrend < 0 ? 
                      <TrendingDown className="h-5 w-5 text-success" /> :
                      <TrendingUp className="h-5 w-5 text-destructive" />
                    }
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Workout Consistency</p>
                    <p className="text-2xl font-bold text-foreground">
                      {performanceData.workoutConsistency.toFixed(0)}%
                    </p>
                  </div>
                  <div className="p-2 rounded-full bg-primary/20">
                    <Dumbbell className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <Progress 
                  value={performanceData.workoutConsistency} 
                  className="mt-2 h-2"
                />
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Daily Calories</p>
                    <p className="text-2xl font-bold text-foreground">
                      {performanceData.dailyCalories}
                    </p>
                    <p className="text-xs text-muted-foreground">Target: {ageRecommendations.baseCalories}</p>
                  </div>
                  <div className="p-2 rounded-full bg-accent/20">
                    <Apple className="h-5 w-5 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Body Fat %</p>
                    <p className="text-2xl font-bold text-foreground">
                      {performanceData.bodyFatPercentage.toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-2 rounded-full bg-secondary/20">
                    <Scale className="h-5 w-5 text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Tabs Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="workouts">Workouts</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="diet-planner">Diet Planner</TabsTrigger>
            <TabsTrigger value="body">Body Metrics</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weight Tracking Chart */}
              <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Weight className="h-5 w-5" />
                    Weight Progress (Last 30 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={weightChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="bodyFat" stroke="#ef4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Nutrition Breakdown */}
              <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Today's Nutrition Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={nutritionChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}g`}
                      >
                        {nutritionChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl cursor-pointer hover:shadow-xl transition-shadow"
                    onClick={() => setShowModal('workout')}>
                <CardContent className="p-6 text-center">
                  <Dumbbell className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold mb-2 text-foreground">Log Workout</h3>
                  <p className="text-sm text-muted-foreground">Record your exercise session</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl cursor-pointer hover:shadow-xl transition-shadow"
                    onClick={() => setShowModal('weight')}>
                <CardContent className="p-6 text-center">
                  <Scale className="h-8 w-8 mx-auto mb-2 text-secondary" />
                  <h3 className="font-semibold mb-2 text-foreground">Record Weight</h3>
                  <p className="text-sm text-muted-foreground">Track body composition</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl cursor-pointer hover:shadow-xl transition-shadow"
                    onClick={() => setShowModal('nutrition')}>
                <CardContent className="p-6 text-center">
                  <Apple className="h-8 w-8 mx-auto mb-2 text-accent" />
                  <h3 className="font-semibold mb-2 text-foreground">Log Meal</h3>
                  <p className="text-sm text-muted-foreground">Track nutrition intake</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl cursor-pointer hover:shadow-xl transition-shadow"
                    onClick={() => setShowModal('goal')}>
                <CardContent className="p-6 text-center">
                  <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold mb-2 text-foreground">Set Goal</h3>
                  <p className="text-sm text-muted-foreground">Define fitness targets</p>
                </CardContent>
              </Card>
            </div>

            {/* Water Intake Integration */}
            <WaterIntakeCard 
              selectedDate={selectedDate} 
            />
          </TabsContent>

          {/* Workouts Tab */}
          <TabsContent value="workouts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Workout Management</h2>
              {isEditable && (
                <Button onClick={() => setShowModal('workout')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Log Workout
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Today's Workouts - Integrated with Notion TODAYSWORKOUT database */}
              <TodayWorkoutsCard 
                selectedDate={selectedDate} 
                isReadOnly={isReadOnly} 
              />

              <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                <CardHeader>
                  <CardTitle>Workout Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Workouts</span>
                      <span className="font-bold">{workouts.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Minutes</span>
                      <span className="font-bold">
                        {workouts.reduce((sum, w) => sum + (w.duration || 0), 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Calories Burned</span>
                      <span className="font-bold">
                        {workouts.reduce((sum, w) => sum + (w.calories || 0), 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Difficulty</span>
                      <span className="font-bold">
                        {workouts.length > 0 ? 
                          (workouts.reduce((sum, w) => sum + w.difficulty, 0) / workouts.length).toFixed(1) : 
                          '0'
                        }/5
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                <CardHeader>
                  <CardTitle>Weekly Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Progress value={performanceData.workoutConsistency} className="h-3" />
                    <div className="text-center text-sm">
                      <span className="font-bold">{performanceData.workoutConsistency.toFixed(0)}%</span> consistency this week
                    </div>
                    <div className="text-xs text-gray-500 text-center">
                      Target: 5 workouts per week
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Nutrition Tab */}
          <TabsContent value="nutrition" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Nutrition Tracking</h2>
              {isEditable && (
                <Button onClick={() => setShowModal('nutrition')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Log Meal
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                <CardHeader>
                  <CardTitle>Today's Nutrition</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{performanceData.dailyCalories}</div>
                        <div className="text-sm text-gray-600">Calories</div>
                        <div className="text-xs text-gray-500">Goal: {ageRecommendations.baseCalories}</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{performanceData.dailyProtein}g</div>
                        <div className="text-sm text-gray-600">Protein</div>
                        <div className="text-xs text-gray-500">Goal: {ageRecommendations.protein}g</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Today's Meals</h4>
                      {nutritionEntries.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No meals logged today</p>
                      ) : (
                        nutritionEntries.map((entry, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <div className="font-medium">{entry.food}</div>
                              <div className="text-sm text-gray-500 capitalize">{entry.mealType}</div>
                            </div>
                            <div className="text-sm">
                              <div>{entry.calories} cal</div>
                              <div className="text-gray-500">{entry.protein}g protein</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                <CardHeader>
                  <CardTitle>Age-Based Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600 mb-4">Based on average adult nutritional needs:</div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Daily Calories</span>
                        <span className="font-bold">{ageRecommendations.baseCalories}</span>
                      </div>
                      <Progress 
                        value={Math.min((performanceData.dailyCalories / ageRecommendations.baseCalories) * 100, 100)} 
                        className="h-2"
                      />
                      
                      <div className="flex justify-between items-center">
                        <span>Protein (g)</span>
                        <span className="font-bold">{ageRecommendations.protein}g</span>
                      </div>
                      <Progress 
                        value={Math.min((performanceData.dailyProtein / ageRecommendations.protein) * 100, 100)} 
                        className="h-2"
                      />
                      
                      <div className="flex justify-between items-center">
                        <span>Carbs (g)</span>
                        <span className="font-bold">{ageRecommendations.carbs}g</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span>Fat (g)</span>
                        <span className="font-bold">{ageRecommendations.fat}g</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Diet Planner Tab */}
          <TabsContent value="diet-planner" className="space-y-6">
            <DietJournalPlanner 
              selectedDate={selectedDate}
              isReadOnly={isReadOnly}
            />
          </TabsContent>

          {/* Body Metrics Tab */}
          <TabsContent value="body" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Body Metrics</h2>
              <div className="flex gap-2">
                {isEditable && (
                  <>
                    <Button variant="outline" onClick={() => setShowModal('weight')}>
                      <Scale className="h-4 w-4 mr-2" />
                      Record Weight
                    </Button>
                    <Button variant="outline" onClick={() => setShowModal('measurement')}>
                      <Ruler className="h-4 w-4 mr-2" />
                      Body Measurements
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                <CardHeader>
                  <CardTitle>Weight History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bodyWeights.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Weight className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No weight entries recorded</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="text-2xl font-bold">{performanceData.currentWeight} lbs</div>
                            <div className="text-sm text-gray-600">Current Weight</div>
                          </div>
                          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <div className="text-2xl font-bold">{performanceData.bodyFatPercentage.toFixed(1)}%</div>
                            <div className="text-sm text-gray-600">Body Fat</div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium">Recent Entries</h4>
                          {bodyWeights.slice(-5).map((entry, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div>
                                <div className="font-medium">{entry.weight} lbs</div>
                                <div className="text-sm text-gray-500">{entry.date}</div>
                              </div>
                              <div className="text-sm">
                                {entry.bodyFat && <div>{entry.bodyFat}% BF</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                <CardHeader>
                  <CardTitle>Body Measurements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bodyMeasurements.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Ruler className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No measurements recorded</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {bodyMeasurements.slice(-1).map((measurement, index) => (
                          <div key={index} className="space-y-2">
                            <h4 className="font-medium">Latest Measurements ({measurement.date})</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {measurement.neck && <div>Neck: {measurement.neck}"</div>}
                              {measurement.chest && <div>Chest: {measurement.chest}"</div>}
                              {measurement.waist && <div>Waist: {measurement.waist}"</div>}
                              {measurement.hips && <div>Hips: {measurement.hips}"</div>}
                              {measurement.bicep && <div>Bicep: {measurement.bicep}"</div>}
                              {measurement.thigh && <div>Thigh: {measurement.thigh}"</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Fitness Goals</h2>
              {isEditable && (
                <Button onClick={() => setShowModal('goal')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Set Goal
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                <CardHeader>
                  <CardTitle>Active Goals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {fitnessGoals.filter(goal => goal.isActive).length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No active goals set</p>
                      </div>
                    ) : (
                      fitnessGoals.filter(goal => goal.isActive).map((goal, index) => (
                        <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{goal.title}</h4>
                            <Badge variant={goal.priority === 'high' ? 'destructive' : goal.priority === 'medium' ? 'default' : 'secondary'}>
                              {goal.priority}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <div>Type: {goal.type.replace('_', ' ')}</div>
                            <div>Target: {goal.targetValue} {goal.unit}</div>
                            <div>Due: {goal.targetDate}</div>
                          </div>
                          {goal.description && (
                            <p className="text-sm text-gray-500 mt-2">{goal.description}</p>
                          )}
                          {goal.currentValue && (
                            <div className="mt-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>{goal.currentValue}/{goal.targetValue} {goal.unit}</span>
                              </div>
                              <Progress 
                                value={Math.min((goal.currentValue / goal.targetValue) * 100, 100)} 
                                className="h-2"
                              />
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                <CardHeader>
                  <CardTitle>Goal Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['weight_loss', 'weight_gain', 'muscle_gain', 'strength', 'endurance'].map(type => {
                      const count = fitnessGoals.filter(g => g.type === type && g.isActive).length;
                      return (
                        <div key={type} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="capitalize">{type.replace('_', ' ')}</span>
                          <Badge variant="outline">{count} active</Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Fitness Analytics</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-xl font-bold text-green-600">
                          {performanceData.workoutConsistency.toFixed(0)}%
                        </div>
                        <div className="text-sm text-gray-600">Workout Consistency</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-xl font-bold text-blue-600">
                          {performanceData.weightTrend > 0 ? '+' : ''}{performanceData.weightTrend.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600">Weight Change (lbs)</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Key Metrics</h4>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Workouts</span>
                          <span className="font-bold">{performanceData.totalWorkouts}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Current Weight</span>
                          <span className="font-bold">{performanceData.currentWeight} lbs</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Body Fat %</span>
                          <span className="font-bold">{performanceData.bodyFatPercentage.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Daily Calories</span>
                          <span className="font-bold">{performanceData.dailyCalories}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                <CardHeader>
                  <CardTitle>AI Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">Workout Recommendation</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {performanceData.workoutConsistency < 50 
                          ? "Consider starting with 3 shorter workouts per week to build consistency."
                          : performanceData.workoutConsistency < 80
                          ? "Great progress! Try adding one more workout day to reach optimal frequency."
                          : "Excellent consistency! Focus on progressive overload and recovery."
                        }
                      </p>
                    </div>

                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Apple className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Nutrition Insight</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {performanceData.dailyCalories < ageRecommendations.baseCalories * 0.8
                          ? "Your calorie intake seems low. Consider adding healthy snacks."
                          : performanceData.dailyCalories > ageRecommendations.baseCalories * 1.2
                          ? "Your calorie intake is high. Focus on nutrient-dense, lower-calorie foods."
                          : "Your calorie intake looks balanced for your goals."
                        }
                      </p>
                    </div>

                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-5 w-5 text-purple-600" />
                        <span className="font-medium">Goal Progress</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {fitnessGoals.filter(g => g.isActive).length === 0
                          ? "Set specific, measurable goals to track your fitness journey effectively."
                          : `You have ${fitnessGoals.filter(g => g.isActive).length} active goals. Stay focused and track progress regularly.`
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>

        {/* Modals for data entry */}
        {/* Workout Modal */}
        <Dialog open={showModal === 'workout'} onOpenChange={() => setShowModal(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Log Workout</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="workout-name">Workout Name</Label>
                <Input
                  id="workout-name"
                  value={workoutForm.name}
                  onChange={(e) => setWorkoutForm({...workoutForm, name: e.target.value})}
                  placeholder="e.g., Morning Run, Chest & Back"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (min)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={workoutForm.duration}
                    onChange={(e) => setWorkoutForm({...workoutForm, duration: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="calories">Calories Burned</Label>
                  <Input
                    id="calories"
                    type="number"
                    value={workoutForm.calories}
                    onChange={(e) => setWorkoutForm({...workoutForm, calories: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="workout-type">Workout Type</Label>
                <Select value={workoutForm.type} onValueChange={(value) => setWorkoutForm({...workoutForm, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strength">Strength Training</SelectItem>
                    <SelectItem value="cardio">Cardio</SelectItem>
                    <SelectItem value="flexibility">Flexibility</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="difficulty">Difficulty (1-5)</Label>
                <Input
                  id="difficulty"
                  type="number"
                  min="1"
                  max="5"
                  value={workoutForm.difficulty}
                  onChange={(e) => setWorkoutForm({...workoutForm, difficulty: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={workoutForm.notes}
                  onChange={(e) => setWorkoutForm({...workoutForm, notes: e.target.value})}
                  placeholder="How did it feel? Any observations?"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={() => setShowModal(null)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={() => createWorkoutMutation.mutate({
                    ...workoutForm,
                    date: dateString,
                    duration: workoutForm.duration ? parseInt(workoutForm.duration) : undefined,
                    calories: workoutForm.calories ? parseInt(workoutForm.calories) : undefined,
                    isCompleted: true
                  })}
                  className="flex-1"
                  disabled={!workoutForm.name || createWorkoutMutation.isPending}
                >
                  {createWorkoutMutation.isPending ? 'Saving...' : 'Save Workout'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Weight Modal */}
        <Dialog open={showModal === 'weight'} onOpenChange={() => setShowModal(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Record Weight & Body Composition</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="weight">Weight (lbs) *</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={weightForm.weight}
                  onChange={(e) => setWeightForm({...weightForm, weight: e.target.value})}
                  placeholder="e.g., 150.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="body-fat">Body Fat %</Label>
                  <Input
                    id="body-fat"
                    type="number"
                    step="0.1"
                    value={weightForm.bodyFat}
                    onChange={(e) => setWeightForm({...weightForm, bodyFat: e.target.value})}
                    placeholder="e.g., 15.2"
                  />
                </div>
                <div>
                  <Label htmlFor="muscle-mass">Muscle Mass (lbs)</Label>
                  <Input
                    id="muscle-mass"
                    type="number"
                    step="0.1"
                    value={weightForm.muscleMass}
                    onChange={(e) => setWeightForm({...weightForm, muscleMass: e.target.value})}
                    placeholder="e.g., 120.0"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="water-weight">Water Weight %</Label>
                <Input
                  id="water-weight"
                  type="number"
                  step="0.1"
                  value={weightForm.waterWeight}
                  onChange={(e) => setWeightForm({...weightForm, waterWeight: e.target.value})}
                  placeholder="e.g., 60.5"
                />
              </div>
              <div>
                <Label htmlFor="weight-notes">Notes</Label>
                <Textarea
                  id="weight-notes"
                  value={weightForm.notes}
                  onChange={(e) => setWeightForm({...weightForm, notes: e.target.value})}
                  placeholder="Time of day, conditions, etc."
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={() => setShowModal(null)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={() => createWeightMutation.mutate({
                    ...weightForm,
                    date: dateString,
                    weight: parseFloat(weightForm.weight),
                    bodyFat: weightForm.bodyFat ? parseFloat(weightForm.bodyFat) : undefined,
                    muscleMass: weightForm.muscleMass ? parseFloat(weightForm.muscleMass) : undefined,
                    waterWeight: weightForm.waterWeight ? parseFloat(weightForm.waterWeight) : undefined
                  })}
                  className="flex-1"
                  disabled={!weightForm.weight || createWeightMutation.isPending}
                >
                  {createWeightMutation.isPending ? 'Saving...' : 'Save Weight'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Body Measurements Modal */}
        <Dialog open={showModal === 'measurement'} onOpenChange={() => setShowModal(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Record Body Measurements</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="neck">Neck (inches)</Label>
                  <Input
                    id="neck"
                    type="number"
                    step="0.1"
                    value={measurementForm.neck}
                    onChange={(e) => setMeasurementForm({...measurementForm, neck: e.target.value})}
                    placeholder="e.g., 15.5"
                  />
                </div>
                <div>
                  <Label htmlFor="chest">Chest (inches)</Label>
                  <Input
                    id="chest"
                    type="number"
                    step="0.1"
                    value={measurementForm.chest}
                    onChange={(e) => setMeasurementForm({...measurementForm, chest: e.target.value})}
                    placeholder="e.g., 40.0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="waist">Waist (inches)</Label>
                  <Input
                    id="waist"
                    type="number"
                    step="0.1"
                    value={measurementForm.waist}
                    onChange={(e) => setMeasurementForm({...measurementForm, waist: e.target.value})}
                    placeholder="e.g., 32.0"
                  />
                </div>
                <div>
                  <Label htmlFor="hips">Hips (inches)</Label>
                  <Input
                    id="hips"
                    type="number"
                    step="0.1"
                    value={measurementForm.hips}
                    onChange={(e) => setMeasurementForm({...measurementForm, hips: e.target.value})}
                    placeholder="e.g., 38.0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bicep">Bicep (inches)</Label>
                  <Input
                    id="bicep"
                    type="number"
                    step="0.1"
                    value={measurementForm.bicep}
                    onChange={(e) => setMeasurementForm({...measurementForm, bicep: e.target.value})}
                    placeholder="e.g., 14.0"
                  />
                </div>
                <div>
                  <Label htmlFor="thigh">Thigh (inches)</Label>
                  <Input
                    id="thigh"
                    type="number"
                    step="0.1"
                    value={measurementForm.thigh}
                    onChange={(e) => setMeasurementForm({...measurementForm, thigh: e.target.value})}
                    placeholder="e.g., 22.0"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="measurement-notes">Notes</Label>
                <Textarea
                  id="measurement-notes"
                  value={measurementForm.notes}
                  onChange={(e) => setMeasurementForm({...measurementForm, notes: e.target.value})}
                  placeholder="Any observations or conditions"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={() => setShowModal(null)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={() => createMeasurementMutation.mutate({
                    ...measurementForm,
                    date: dateString,
                    neck: measurementForm.neck ? parseFloat(measurementForm.neck) : undefined,
                    chest: measurementForm.chest ? parseFloat(measurementForm.chest) : undefined,
                    waist: measurementForm.waist ? parseFloat(measurementForm.waist) : undefined,
                    hips: measurementForm.hips ? parseFloat(measurementForm.hips) : undefined,
                    bicep: measurementForm.bicep ? parseFloat(measurementForm.bicep) : undefined,
                    thigh: measurementForm.thigh ? parseFloat(measurementForm.thigh) : undefined
                  })}
                  className="flex-1"
                  disabled={createMeasurementMutation.isPending}
                >
                  {createMeasurementMutation.isPending ? 'Saving...' : 'Save Measurements'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Fitness Goal Modal */}
        <Dialog open={showModal === 'goal'} onOpenChange={() => setShowModal(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Set Fitness Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="goal-type">Goal Type *</Label>
                <Select value={fitnessGoalForm.type} onValueChange={(value) => setFitnessGoalForm({...fitnessGoalForm, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight_loss">Weight Loss</SelectItem>
                    <SelectItem value="weight_gain">Weight Gain</SelectItem>
                    <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                    <SelectItem value="strength">Strength</SelectItem>
                    <SelectItem value="endurance">Endurance</SelectItem>
                    <SelectItem value="flexibility">Flexibility</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="goal-title">Goal Title *</Label>
                <Input
                  id="goal-title"
                  value={fitnessGoalForm.title}
                  onChange={(e) => setFitnessGoalForm({...fitnessGoalForm, title: e.target.value})}
                  placeholder="e.g., Lose 10 pounds"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="current-value">Current Value</Label>
                  <Input
                    id="current-value"
                    type="number"
                    step="0.1"
                    value={fitnessGoalForm.currentValue}
                    onChange={(e) => setFitnessGoalForm({...fitnessGoalForm, currentValue: e.target.value})}
                    placeholder="e.g., 150"
                  />
                </div>
                <div>
                  <Label htmlFor="target-value">Target Value *</Label>
                  <Input
                    id="target-value"
                    type="number"
                    step="0.1"
                    value={fitnessGoalForm.targetValue}
                    onChange={(e) => setFitnessGoalForm({...fitnessGoalForm, targetValue: e.target.value})}
                    placeholder="e.g., 140"
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unit *</Label>
                  <Select value={fitnessGoalForm.unit} onValueChange={(value) => setFitnessGoalForm({...fitnessGoalForm, unit: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lbs">lbs</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="reps">reps</SelectItem>
                      <SelectItem value="minutes">minutes</SelectItem>
                      <SelectItem value="miles">miles</SelectItem>
                      <SelectItem value="inches">inches</SelectItem>
                      <SelectItem value="percent">%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target-date">Target Date *</Label>
                  <Input
                    id="target-date"
                    type="date"
                    value={fitnessGoalForm.targetDate}
                    onChange={(e) => setFitnessGoalForm({...fitnessGoalForm, targetDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={fitnessGoalForm.priority} onValueChange={(value) => setFitnessGoalForm({...fitnessGoalForm, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="goal-description">Description</Label>
                <Textarea
                  id="goal-description"
                  value={fitnessGoalForm.description}
                  onChange={(e) => setFitnessGoalForm({...fitnessGoalForm, description: e.target.value})}
                  placeholder="Why is this goal important to you?"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={() => setShowModal(null)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={() => createFitnessGoalMutation.mutate({
                    ...fitnessGoalForm,
                    targetValue: parseFloat(fitnessGoalForm.targetValue),
                    currentValue: fitnessGoalForm.currentValue ? parseFloat(fitnessGoalForm.currentValue) : undefined,
                    isActive: true
                  })}
                  className="flex-1"
                  disabled={!fitnessGoalForm.title || !fitnessGoalForm.targetValue || createFitnessGoalMutation.isPending}
                >
                  {createFitnessGoalMutation.isPending ? 'Saving...' : 'Save Goal'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Nutrition Modal */}
        <Dialog open={showModal === 'nutrition'} onOpenChange={() => setShowModal(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Log Meal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="meal-type">Meal Type *</Label>
                <Select value={nutritionForm.mealType} onValueChange={(value) => setNutritionForm({...nutritionForm, mealType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="food">Food/Meal *</Label>
                <Input
                  id="food"
                  value={nutritionForm.food}
                  onChange={(e) => setNutritionForm({...nutritionForm, food: e.target.value})}
                  placeholder="e.g., Grilled chicken salad"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nutrition-calories">Calories *</Label>
                  <Input
                    id="nutrition-calories"
                    type="number"
                    value={nutritionForm.calories}
                    onChange={(e) => setNutritionForm({...nutritionForm, calories: e.target.value})}
                    placeholder="e.g., 450"
                  />
                </div>
                <div>
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input
                    id="protein"
                    type="number"
                    step="0.1"
                    value={nutritionForm.protein}
                    onChange={(e) => setNutritionForm({...nutritionForm, protein: e.target.value})}
                    placeholder="e.g., 35"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="carbs">Carbs (g)</Label>
                  <Input
                    id="carbs"
                    type="number"
                    step="0.1"
                    value={nutritionForm.carbs}
                    onChange={(e) => setNutritionForm({...nutritionForm, carbs: e.target.value})}
                    placeholder="e.g., 20"
                  />
                </div>
                <div>
                  <Label htmlFor="fat">Fat (g)</Label>
                  <Input
                    id="fat"
                    type="number"
                    step="0.1"
                    value={nutritionForm.fat}
                    onChange={(e) => setNutritionForm({...nutritionForm, fat: e.target.value})}
                    placeholder="e.g., 15"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fiber">Fiber (g)</Label>
                  <Input
                    id="fiber"
                    type="number"
                    step="0.1"
                    value={nutritionForm.fiber}
                    onChange={(e) => setNutritionForm({...nutritionForm, fiber: e.target.value})}
                    placeholder="e.g., 8"
                  />
                </div>
                <div>
                  <Label htmlFor="sodium">Sodium (mg)</Label>
                  <Input
                    id="sodium"
                    type="number"
                    value={nutritionForm.sodium}
                    onChange={(e) => setNutritionForm({...nutritionForm, sodium: e.target.value})}
                    placeholder="e.g., 650"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={() => setShowModal(null)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={() => createNutritionMutation.mutate({
                    ...nutritionForm,
                    date: dateString,
                    calories: nutritionForm.calories ? parseInt(nutritionForm.calories) : undefined,
                    protein: nutritionForm.protein ? parseFloat(nutritionForm.protein) : undefined,
                    carbs: nutritionForm.carbs ? parseFloat(nutritionForm.carbs) : undefined,
                    fat: nutritionForm.fat ? parseFloat(nutritionForm.fat) : undefined,
                    fiber: nutritionForm.fiber ? parseFloat(nutritionForm.fiber) : undefined,
                    sodium: nutritionForm.sodium ? parseInt(nutritionForm.sodium) : undefined
                  })}
                  className="flex-1"
                  disabled={!nutritionForm.food || !nutritionForm.calories || createNutritionMutation.isPending}
                >
                  {createNutritionMutation.isPending ? 'Saving...' : 'Save Meal'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
      </div>
    </div>
  );
}