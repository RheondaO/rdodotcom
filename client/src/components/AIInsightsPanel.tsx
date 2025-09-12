import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Apple, Target, Lightbulb, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface AIInsightsPanelProps {
  selectedDate: Date;
  workouts: any[];
  nutritionEntries: any[];
  bodyWeights: any[];
}

interface FitnessInsights {
  summary: string;
  recommendations: string[];
  progress: {
    workoutsThisWeek: number;
    weightTrend: string;
    goalProgress: string;
    mealPlanAdherence: number;
  };
  insights: {
    strengths: string[];
    areasForImprovement: string[];
    nutritionAnalysis: string;
    workoutEffectiveness: string;
  };
}

export default function AIInsightsPanel({ 
  selectedDate, 
  workouts, 
  nutritionEntries, 
  bodyWeights 
}: AIInsightsPanelProps) {
  // Fetch AI insights from Gemini
  const { data: aiInsights, isLoading, error } = useQuery<FitnessInsights>({
    queryKey: ['/api/fitness-insights'],
    queryFn: async () => {
      const response = await fetch('/api/fitness-insights', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch AI insights');
      }
      
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  // Loading state
  if (isLoading) {
    return (
      <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl" data-testid="ai-insights-loading">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm text-muted-foreground">Analyzing your fitness data...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error || !aiInsights) {
    return (
      <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl" data-testid="ai-insights-error">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 py-4">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <span className="text-sm text-muted-foreground">
              Unable to generate AI insights. Please try again later.
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl" data-testid="ai-insights-panel">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Insights
        </CardTitle>
        <p className="text-sm text-muted-foreground">{aiInsights.summary}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Key Recommendations */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg" data-testid="recommendations-section">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Key Recommendations</span>
            </div>
            <ul className="space-y-1">
              {aiInsights.recommendations.slice(0, 3).map((recommendation, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Strengths */}
          {aiInsights.insights.strengths.length > 0 && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg" data-testid="strengths-section">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="font-medium">Strengths</span>
              </div>
              <ul className="space-y-1">
                {aiInsights.insights.strengths.slice(0, 2).map((strength, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Areas for Improvement */}
          {aiInsights.insights.areasForImprovement.length > 0 && (
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg" data-testid="improvements-section">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-orange-600" />
                <span className="font-medium">Areas to Focus On</span>
              </div>
              <ul className="space-y-1">
                {aiInsights.insights.areasForImprovement.slice(0, 2).map((area, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Nutrition Analysis */}
          {aiInsights.insights.nutritionAnalysis && (
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg" data-testid="nutrition-analysis-section">
              <div className="flex items-center gap-2 mb-2">
                <Apple className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Nutrition Analysis</span>
              </div>
              <p className="text-sm text-gray-600">{aiInsights.insights.nutritionAnalysis}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}