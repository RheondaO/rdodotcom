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
        <CardTitle>AI Insights</CardTitle>
        <div className="flex justify-end">
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
      <CardContent>
        <div className="space-y-4">
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
            <>
              {/* Summary - Blue theme */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Daily Summary</span>
                </div>
                <p className="text-sm text-gray-600">
                  {insights.summary}
                </p>
              </div>

              {/* Recommendations - Green theme */}
              {insights.recommendations.length > 0 && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Recommendations</span>
                  </div>
                  <div className="space-y-1">
                    {insights.recommendations.map((rec, index) => (
                      <p key={index} className="text-sm text-gray-600">
                        • {rec}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Highlights - Purple theme */}
              {insights.highlights.length > 0 && (
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">Highlights</span>
                  </div>
                  <div className="space-y-1">
                    {insights.highlights.map((highlight, index) => (
                      <p key={index} className="text-sm text-gray-600">
                        • {highlight}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Concerns - Amber theme */}
              {insights.concerns.length > 0 && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <span className="font-medium">Areas to Watch</span>
                  </div>
                  <div className="space-y-1">
                    {insights.concerns.map((concern, index) => (
                      <p key={index} className="text-sm text-gray-600">
                        • {concern}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}