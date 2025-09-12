import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Apple, Target } from 'lucide-react';

interface AIInsightsPanelProps {
  selectedDate: Date;
  workouts: any[];
  nutritionEntries: any[];
  bodyWeights: any[];
}


export default function AIInsightsPanel({ 
  selectedDate, 
  workouts, 
  nutritionEntries, 
  bodyWeights 
}: AIInsightsPanelProps) {
  // Calculate workout consistency
  const workoutConsistency = workouts.length > 0 ? 75 : 25; // Simple calculation based on data
  
  // Calculate daily calories estimate
  const dailyCalories = nutritionEntries.reduce((total, entry) => total + (entry.calories || 0), 0) || 1800;
  
  // Age-based recommendations (using a default)
  const baseCalories = 2000;
  
  // Active goals count (simulate checking for goals)
  const activeGoalsCount = workouts.length > 1 ? 2 : 0;

  return (
    <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
      <CardHeader>
        <CardTitle>AI Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Workout Recommendation - Blue theme */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Workout Recommendation</span>
            </div>
            <p className="text-sm text-gray-600">
              {workoutConsistency < 50 
                ? "Consider starting with 3 shorter workouts per week to build consistency."
                : workoutConsistency < 80
                ? "Great progress! Try adding one more workout day to reach optimal frequency."
                : "Excellent consistency! Focus on progressive overload and recovery."
              }
            </p>
          </div>

          {/* Nutrition Insight - Green theme */}
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Apple className="h-5 w-5 text-green-600" />
              <span className="font-medium">Nutrition Insight</span>
            </div>
            <p className="text-sm text-gray-600">
              {dailyCalories < baseCalories * 0.8
                ? "Your calorie intake seems low. Consider adding healthy snacks."
                : dailyCalories > baseCalories * 1.2
                ? "Your calorie intake is high. Focus on nutrient-dense, lower-calorie foods."
                : "Your calorie intake looks balanced for your goals."
              }
            </p>
          </div>

          {/* Goal Progress - Purple theme */}
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Goal Progress</span>
            </div>
            <p className="text-sm text-gray-600">
              {activeGoalsCount === 0
                ? "Set specific, measurable goals to track your fitness journey effectively."
                : `You have ${activeGoalsCount} active goals. Stay focused and track progress regularly.`
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}