import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, RefreshCw, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';

interface AIInsightsPanelProps {
  selectedDate: Date;
  workouts: any[];
  nutritionEntries: any[];
  bodyWeights: any[];
}

interface InsightData {
  summary: string;
  recommendations: string[];
  highlights: string[];
  concerns: string[];
}

export default function AIInsightsPanel({ 
  selectedDate, 
  workouts, 
  nutritionEntries, 
  bodyWeights 
}: AIInsightsPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const dateString = format(selectedDate, 'yyyy-MM-dd');

  // Query to fetch AI insights
  const { 
    data: insights, 
    isLoading, 
    error, 
    refetch 
  } = useQuery<InsightData>({
    queryKey: ['/api/ai-insights', dateString],
    queryFn: async () => {
      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          credentials: 'include',
        },
        body: JSON.stringify({
          date: dateString,
          workouts,
          nutritionEntries,
          bodyWeights
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate AI insights');
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: false // Only fetch when manually triggered
  });

  const handleGenerateInsights = async () => {
    setIsGenerating(true);
    try {
      await refetch();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI Health Insights
          </span>
        </CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Personalized health analysis for {format(selectedDate, 'EEEE, MMM d')}
          </p>
          <Button
            onClick={handleGenerateInsights}
            disabled={isGenerating || isLoading}
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
          >
            {isGenerating || isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isGenerating || isLoading ? 'Analyzing...' : 'Generate Insights'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!insights && !isLoading && !error && (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Click "Generate Insights" to get personalized health analysis based on your data.
            </p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <AlertTriangle className="h-8 w-8 mx-auto text-red-500 mb-2" />
            <p className="text-red-600 dark:text-red-400 text-sm">
              Failed to generate insights. Please try again.
            </p>
          </div>
        )}

        {(isLoading || isGenerating) && (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 mx-auto text-purple-500 animate-spin mb-4" />
            <p className="text-purple-600 dark:text-purple-400">
              Analyzing your health data...
            </p>
          </div>
        )}

        {insights && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4">
              <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Daily Summary
              </h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {insights.summary}
              </p>
            </div>

            {/* Highlights */}
            {insights.highlights.length > 0 && (
              <div>
                <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Highlights
                </h4>
                <ul className="space-y-1">
                  {insights.highlights.map((highlight, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {insights.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Recommendations
                </h4>
                <ul className="space-y-1">
                  {insights.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Concerns */}
            {insights.concerns.length > 0 && (
              <div>
                <h4 className="font-semibold text-amber-700 dark:text-amber-300 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Areas to Watch
                </h4>
                <ul className="space-y-1">
                  {insights.concerns.map((concern, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <span className="text-amber-500 mt-1">•</span>
                      <span>{concern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}