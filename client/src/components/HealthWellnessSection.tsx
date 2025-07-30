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
import { apiRequest } from '@/lib/queryClient';
// Import removed - will add hooks later
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
  Scale
} from 'lucide-react';
import WaterIntakeCard from './WaterIntakeCard';

interface HealthWellnessSectionProps {
  selectedDate: Date;
  isReadOnly?: boolean;
}

export default function HealthWellnessSection({ selectedDate, isReadOnly = false }: HealthWellnessSectionProps) {
  const queryClient = useQueryClient();
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  // const { data: dailyEntry } = useDailyData(dateString); // Will add later
  const dailyEntry = null; // Placeholder
  
  // State for modals and forms
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showFitnessGoalModal, setShowFitnessGoalModal] = useState(false);
  const [showNutritionModal, setShowNutritionModal] = useState(false);

  // Form states
  const [workoutForm, setWorkoutForm] = useState({
    name: '',
    duration: '',
    notes: '',
    calories: '',
    difficulty: 3
  });

  const [weightForm, setWeightForm] = useState({
    weight: '',
    bodyFat: '',
    notes: ''
  });

  const [fitnessGoalForm, setFitnessGoalForm] = useState({
    type: 'weight_loss',
    title: '',
    description: '',
    targetValue: '',
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
    fat: ''
  });

  const getDateLabel = () => {
    if (isToday(selectedDate)) return "Today";
    if (isYesterday(selectedDate)) return "Yesterday";
    if (isTomorrow(selectedDate)) return "Tomorrow";
    return format(selectedDate, 'EEEE');
  };

  // Check if the selected date is editable (today or yesterday only) AND not in read-only mode
  const isEditable = !isReadOnly && (isToday(selectedDate) || isYesterday(selectedDate));

  // API Queries - typed for fitness data
  const { data: workouts = [] } = useQuery<any[]>({
    queryKey: ['/api/workouts', dateString],
    enabled: !!dateString
  });

  const { data: bodyWeights = [] } = useQuery<any[]>({
    queryKey: ['/api/body-weights'],
    enabled: true
  });

  const { data: fitnessGoals = [] } = useQuery<any[]>({
    queryKey: ['/api/fitness-goals'],
    enabled: true
  });

  const { data: nutritionEntries = [] } = useQuery<any[]>({
    queryKey: ['/api/nutrition', dateString],
    enabled: !!dateString
  });

  // Mutations
  const createWorkoutMutation = useMutation({
    mutationFn: async (data: any) => await apiRequest('/api/workouts', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workouts'] });
      setShowWorkoutModal(false);
      setWorkoutForm({ name: '', duration: '', notes: '', calories: '', difficulty: 3 });
    }
  });

  const createWeightMutation = useMutation({
    mutationFn: async (data: any) => await apiRequest('/api/body-weights', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/body-weights'] });
      setShowWeightModal(false);
      setWeightForm({ weight: '', bodyFat: '', notes: '' });
    }
  });

  const createFitnessGoalMutation = useMutation({
    mutationFn: async (data: any) => await apiRequest('/api/fitness-goals', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fitness-goals'] });
      setShowFitnessGoalModal(false);
      setFitnessGoalForm({
        type: 'weight_loss',
        title: '',
        description: '',
        targetValue: '',
        unit: 'lbs',
        targetDate: '',
        priority: 'medium'
      });
    }
  });

  const createNutritionMutation = useMutation({
    mutationFn: async (data: any) => await apiRequest('/api/nutrition', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/nutrition'] });
      setShowNutritionModal(false);
      setNutritionForm({
        mealType: 'breakfast',
        food: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: ''
      });
    }
  });

  const handleWorkoutSubmit = () => {
    createWorkoutMutation.mutate({
      ...workoutForm,
      date: dateString,
      duration: workoutForm.duration ? parseInt(workoutForm.duration) : undefined,
      calories: workoutForm.calories ? parseInt(workoutForm.calories) : undefined,
      isCompleted: true
    });
  };

  const handleWeightSubmit = () => {
    createWeightMutation.mutate({
      ...weightForm,
      date: dateString,
      weight: parseFloat(weightForm.weight),
      bodyFat: weightForm.bodyFat ? parseFloat(weightForm.bodyFat) : undefined
    });
  };

  const handleFitnessGoalSubmit = () => {
    createFitnessGoalMutation.mutate({
      ...fitnessGoalForm,
      targetValue: parseFloat(fitnessGoalForm.targetValue)
    });
  };

  const handleNutritionSubmit = () => {
    createNutritionMutation.mutate({
      ...nutritionForm,
      date: dateString,
      calories: nutritionForm.calories ? parseInt(nutritionForm.calories) : undefined,
      protein: nutritionForm.protein ? parseFloat(nutritionForm.protein) : undefined,
      carbs: nutritionForm.carbs ? parseFloat(nutritionForm.carbs) : undefined,
      fat: nutritionForm.fat ? parseFloat(nutritionForm.fat) : undefined
    });
  };

  // Get latest weight entry
  const latestWeight = bodyWeights && bodyWeights.length > 0 ? bodyWeights[0] : null;
  
  // Calculate daily nutrition totals
  const dailyNutrition = nutritionEntries.reduce((totals: any, entry: any) => ({
    calories: totals.calories + (entry.calories || 0),
    protein: totals.protein + (entry.protein || 0),
    carbs: totals.carbs + (entry.carbs || 0),
    fat: totals.fat + (entry.fat || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-heading font-bold bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
            Health & Wellness
          </h3>
          <p className="text-muted-foreground dark:text-gray-300 mt-1">
            Track your fitness, nutrition, and wellness journey with AI insights
          </p>
        </div>
      </div>

      {/* Main Health & Wellness Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Water Intake Card */}
        <WaterIntakeCard selectedDate={selectedDate} isEditable={isEditable} />

        {/* Daily Exercise Card */}
        <Card className={`bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl overflow-hidden ${
          !isEditable ? 'opacity-60' : ''
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full shadow-sm"></div>
                <h4 className="font-heading font-semibold text-gray-800 dark:text-white">Exercise</h4>
              </div>
              {isEditable && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowWorkoutModal(true)}
                  className="h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-900/20"
                >
                  <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />
                </Button>
              )}
            </div>
            
            <div className="text-center mb-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg ${
                workouts.length > 0
                  ? 'bg-gradient-to-r from-green-400 to-emerald-400' 
                  : 'bg-gradient-to-r from-gray-200 to-gray-300'
              }`}>
                <Dumbbell className={`h-8 w-8 ${workouts.length > 0 ? 'text-white' : 'text-gray-500'}`} />
              </div>
              <div className={`text-sm font-medium ${
                workouts.length > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {workouts.length > 0 ? `${workouts.length} workout${workouts.length > 1 ? 's' : ''}` : 'No workouts'}
              </div>
              {workouts.length > 0 && (
                <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  {workouts.reduce((total: number, w: any) => total + (w.duration || 0), 0)} min total
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Weight Tracking Card */}
        <Card className={`bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl overflow-hidden ${
          !isEditable ? 'opacity-60' : ''
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full shadow-sm"></div>
                <h4 className="font-heading font-semibold text-gray-800 dark:text-white">Weight</h4>
              </div>
              {isEditable && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowWeightModal(true)}
                  className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                >
                  <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </Button>
              )}
            </div>
            
            <div className="text-center mb-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg bg-gradient-to-r from-blue-400 to-indigo-400">
                <Scale className="h-8 w-8 text-white" />
              </div>
              {latestWeight ? (
                <div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {latestWeight.weight} lbs
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    {format(new Date(latestWeight.date), 'MMM d')}
                  </div>
                </div>
              ) : (
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  No weight recorded
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Nutrition Card */}
        <Card className={`bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl overflow-hidden ${
          !isEditable ? 'opacity-60' : ''
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-red-400 rounded-full shadow-sm"></div>
                <h4 className="font-heading font-semibold text-gray-800 dark:text-white">Nutrition</h4>
              </div>
              {isEditable && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowNutritionModal(true)}
                  className="h-8 w-8 p-0 hover:bg-orange-100 dark:hover:bg-orange-900/20"
                >
                  <Plus className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </Button>
              )}
            </div>
            
            <div className="text-center mb-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg bg-gradient-to-r from-orange-400 to-red-400">
                <Apple className="h-8 w-8 text-white" />
              </div>
              <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {dailyNutrition.calories} cal
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                <div>P: {dailyNutrition.protein.toFixed(1)}g</div>
                <div>C: {dailyNutrition.carbs.toFixed(1)}g • F: {dailyNutrition.fat.toFixed(1)}g</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fitness Goals Section */}
      <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span>Fitness Goals</span>
            </CardTitle>
            {isEditable && (
              <Button
                size="sm"
                onClick={() => setShowFitnessGoalModal(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {fitnessGoals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fitnessGoals.map((goal: any) => (
                <div key={goal.id} className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={goal.priority === 'high' ? 'destructive' : goal.priority === 'medium' ? 'default' : 'secondary'}>
                      {goal.priority}
                    </Badge>
                    <Badge variant={goal.isCompleted ? 'default' : 'outline'}>
                      {goal.isCompleted ? 'Complete' : 'In Progress'}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{goal.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{goal.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-600 dark:text-purple-400">
                      {goal.currentValue || 0} / {goal.targetValue} {goal.unit}
                    </span>
                    {goal.targetDate && (
                      <span className="text-gray-500 dark:text-gray-400">
                        Due: {format(new Date(goal.targetDate), 'MMM d')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No fitness goals set yet</p>
              {isEditable && (
                <Button
                  onClick={() => setShowFitnessGoalModal(true)}
                  variant="outline"
                  className="mt-3"
                >
                  Set Your First Goal
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workout Modal */}
      <Dialog open={showWorkoutModal} onOpenChange={setShowWorkoutModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log Workout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="workout-name">Workout Name</Label>
              <Input
                id="workout-name"
                placeholder="e.g., Morning Run, Strength Training"
                value={workoutForm.name}
                onChange={(e) => setWorkoutForm({ ...workoutForm, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workout-duration">Duration (minutes)</Label>
                <Input
                  id="workout-duration"
                  type="number"
                  placeholder="30"
                  value={workoutForm.duration}
                  onChange={(e) => setWorkoutForm({ ...workoutForm, duration: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="workout-calories">Calories Burned</Label>
                <Input
                  id="workout-calories"
                  type="number"
                  placeholder="250"
                  value={workoutForm.calories}
                  onChange={(e) => setWorkoutForm({ ...workoutForm, calories: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="workout-difficulty">Difficulty (1-5)</Label>
              <Select value={workoutForm.difficulty.toString()} onValueChange={(value) => setWorkoutForm({ ...workoutForm, difficulty: parseInt(value) })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Very Easy</SelectItem>
                  <SelectItem value="2">2 - Easy</SelectItem>
                  <SelectItem value="3">3 - Moderate</SelectItem>
                  <SelectItem value="4">4 - Hard</SelectItem>
                  <SelectItem value="5">5 - Very Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="workout-notes">Notes</Label>
              <Textarea
                id="workout-notes"
                placeholder="How did it go? Any observations..."
                value={workoutForm.notes}
                onChange={(e) => setWorkoutForm({ ...workoutForm, notes: e.target.value })}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowWorkoutModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleWorkoutSubmit}
                disabled={!workoutForm.name || createWorkoutMutation.isPending}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                {createWorkoutMutation.isPending ? 'Saving...' : 'Log Workout'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Weight Modal */}
      <Dialog open={showWeightModal} onOpenChange={setShowWeightModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Weight</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="weight">Weight (lbs)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="150.5"
                value={weightForm.weight}
                onChange={(e) => setWeightForm({ ...weightForm, weight: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="body-fat">Body Fat % (optional)</Label>
              <Input
                id="body-fat"
                type="number"
                step="0.1"
                placeholder="15.5"
                value={weightForm.bodyFat}
                onChange={(e) => setWeightForm({ ...weightForm, bodyFat: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="weight-notes">Notes</Label>
              <Textarea
                id="weight-notes"
                placeholder="Morning weight, after workout, etc..."
                value={weightForm.notes}
                onChange={(e) => setWeightForm({ ...weightForm, notes: e.target.value })}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowWeightModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleWeightSubmit}
                disabled={!weightForm.weight || createWeightMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                {createWeightMutation.isPending ? 'Saving...' : 'Record Weight'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fitness Goal Modal */}
      <Dialog open={showFitnessGoalModal} onOpenChange={setShowFitnessGoalModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Fitness Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="goal-type">Goal Type</Label>
              <Select value={fitnessGoalForm.type} onValueChange={(value) => setFitnessGoalForm({ ...fitnessGoalForm, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight_loss">Weight Loss</SelectItem>
                  <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                  <SelectItem value="strength">Strength</SelectItem>
                  <SelectItem value="endurance">Endurance</SelectItem>
                  <SelectItem value="flexibility">Flexibility</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="goal-title">Title</Label>
              <Input
                id="goal-title"
                placeholder="e.g., Lose 10 pounds, Run 5K"
                value={fitnessGoalForm.title}
                onChange={(e) => setFitnessGoalForm({ ...fitnessGoalForm, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="goal-description">Description</Label>
              <Textarea
                id="goal-description"
                placeholder="Describe your goal and motivation..."
                value={fitnessGoalForm.description}
                onChange={(e) => setFitnessGoalForm({ ...fitnessGoalForm, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="goal-target">Target Value</Label>
                <Input
                  id="goal-target"
                  type="number"
                  placeholder="10"
                  value={fitnessGoalForm.targetValue}
                  onChange={(e) => setFitnessGoalForm({ ...fitnessGoalForm, targetValue: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="goal-unit">Unit</Label>
                <Select value={fitnessGoalForm.unit} onValueChange={(value) => setFitnessGoalForm({ ...fitnessGoalForm, unit: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lbs">lbs</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="reps">reps</SelectItem>
                    <SelectItem value="minutes">minutes</SelectItem>
                    <SelectItem value="miles">miles</SelectItem>
                    <SelectItem value="km">km</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="goal-date">Target Date</Label>
                <Input
                  id="goal-date"
                  type="date"
                  value={fitnessGoalForm.targetDate}
                  onChange={(e) => setFitnessGoalForm({ ...fitnessGoalForm, targetDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="goal-priority">Priority</Label>
                <Select value={fitnessGoalForm.priority} onValueChange={(value) => setFitnessGoalForm({ ...fitnessGoalForm, priority: value })}>
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
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowFitnessGoalModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleFitnessGoalSubmit}
                disabled={!fitnessGoalForm.title || !fitnessGoalForm.targetValue || createFitnessGoalMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                {createFitnessGoalMutation.isPending ? 'Creating...' : 'Create Goal'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Nutrition Modal */}
      <Dialog open={showNutritionModal} onOpenChange={setShowNutritionModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log Nutrition</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="meal-type">Meal Type</Label>
              <Select value={nutritionForm.mealType} onValueChange={(value) => setNutritionForm({ ...nutritionForm, mealType: value })}>
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
              <Label htmlFor="food">Food</Label>
              <Input
                id="food"
                placeholder="e.g., Grilled chicken salad"
                value={nutritionForm.food}
                onChange={(e) => setNutritionForm({ ...nutritionForm, food: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="calories">Calories</Label>
                <Input
                  id="calories"
                  type="number"
                  placeholder="350"
                  value={nutritionForm.calories}
                  onChange={(e) => setNutritionForm({ ...nutritionForm, calories: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="protein">Protein (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  step="0.1"
                  placeholder="25.5"
                  value={nutritionForm.protein}
                  onChange={(e) => setNutritionForm({ ...nutritionForm, protein: e.target.value })}
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
                  placeholder="15.0"
                  value={nutritionForm.carbs}
                  onChange={(e) => setNutritionForm({ ...nutritionForm, carbs: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="fat">Fat (g)</Label>
                <Input
                  id="fat"
                  type="number"
                  step="0.1"
                  placeholder="12.5"
                  value={nutritionForm.fat}
                  onChange={(e) => setNutritionForm({ ...nutritionForm, fat: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowNutritionModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleNutritionSubmit}
                disabled={!nutritionForm.food || createNutritionMutation.isPending}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
              >
                {createNutritionMutation.isPending ? 'Logging...' : 'Log Food'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}