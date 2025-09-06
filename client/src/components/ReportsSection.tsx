import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Target, Award, Lightbulb, BarChart as BarChartIcon } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, subDays } from 'date-fns';

interface ReportsSectionProps {}

export default function ReportsSection({}: ReportsSectionProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    return {
      start: format(startOfWeek(now), 'yyyy-MM-dd'),
      end: format(endOfWeek(now), 'yyyy-MM-dd')
    };
  });

  // Update date range when period changes
  useEffect(() => {
    const now = new Date();
    let start, end;

    switch (selectedPeriod) {
      case 'weekly':
        start = startOfWeek(now);
        end = endOfWeek(now);
        break;
      case 'monthly':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'quarterly':
        start = startOfQuarter(now);
        end = endOfQuarter(now);
        break;
      default:
        start = startOfWeek(now);
        end = endOfWeek(now);
    }

    setDateRange({
      start: format(start, 'yyyy-MM-dd'),
      end: format(end, 'yyyy-MM-dd')
    });
  }, [selectedPeriod]);

  // API queries
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['reports-analytics', selectedPeriod, dateRange.start, dateRange.end],
    queryFn: async () => {
      const response = await fetch(`/api/reports/analytics/${selectedPeriod}?startDate=${dateRange.start}&endDate=${dateRange.end}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    }
  });

  const { data: habitsData, isLoading: habitsLoading } = useQuery({
    queryKey: ['reports-habits', dateRange.start, dateRange.end],
    queryFn: async () => {
      const response = await fetch(`/api/reports/habits/${selectedPeriod}?startDate=${dateRange.start}&endDate=${dateRange.end}`);
      if (!response.ok) throw new Error('Failed to fetch habits data');
      return response.json();
    }
  });

  const { data: goalsData, isLoading: goalsLoading } = useQuery({
    queryKey: ['reports-goals', selectedPeriod, dateRange.start, dateRange.end],
    queryFn: async () => {
      const response = await fetch(`/api/reports/goals/${selectedPeriod}?startDate=${dateRange.start}&endDate=${dateRange.end}`);
      if (!response.ok) throw new Error('Failed to fetch goals data');
      return response.json();
    }
  });

  const { data: healthData, isLoading: healthLoading } = useQuery({
    queryKey: ['reports-health', dateRange.start, dateRange.end],
    queryFn: async () => {
      const response = await fetch(`/api/reports/health/${selectedPeriod}?startDate=${dateRange.start}&endDate=${dateRange.end}`);
      if (!response.ok) throw new Error('Failed to fetch health data');
      return response.json();
    }
  });

  const { data: productivityData, isLoading: productivityLoading } = useQuery({
    queryKey: ['reports-productivity', dateRange.start, dateRange.end],
    queryFn: async () => {
      const response = await fetch(`/api/reports/productivity/${selectedPeriod}?startDate=${dateRange.start}&endDate=${dateRange.end}`);
      if (!response.ok) throw new Error('Failed to fetch productivity data');
      return response.json();
    }
  });

  const isLoading = analyticsLoading || habitsLoading || goalsLoading || healthLoading || productivityLoading;

  // Generate chart data based on period and real data
  const getChartData = () => {
    if (!analyticsData || !healthData || !productivityData) return [];

    if (selectedPeriod === 'weekly') {
      return [
        { day: 'Average', 
          habits: habitsData?.avgCompletionRate || 0, 
          water: healthData?.avgWaterIntake || 0, 
          work: productivityData?.avgWorkHours || 0,
          focus: productivityData?.avgFocusSessions || 0 
        }
      ];
    }

    return [
      { period: `${selectedPeriod} Average`, 
        habits: habitsData?.avgCompletionRate || 0, 
        water: healthData?.avgWaterIntake || 0, 
        work: productivityData?.avgWorkHours || 0,
        focus: productivityData?.avgFocusSessions || 0 
      }
    ];
  };

const COLORS = ['#8B5CF6', '#06D6A0', '#FFD23F', '#EE6C4D'];

  // AI Suggestions based on data trends
  const generateAISuggestions = () => {
    if (!analyticsData || !healthData || !productivityData || !habitsData) return [];

    const suggestions = [];

    if (healthData.avgWaterIntake < 8) {
      suggestions.push({
        icon: '💧',
        title: 'Hydration Improvement',
        description: `You're averaging ${healthData.avgWaterIntake} glasses of water. Try setting hourly reminders to reach 8+ glasses daily.`
      });
    }

    if (habitsData.avgCompletionRate < 70) {
      suggestions.push({
        icon: '🎯',
        title: 'Habit Optimization', 
        description: `Your habit completion rate is ${habitsData.avgCompletionRate}%. Consider reducing habit complexity or adding accountability partners.`
      });
    }

    if (productivityData.avgWorkHours > 8) {
      suggestions.push({
        icon: '⚖️',
        title: 'Work-Life Balance',
        description: `You're averaging ${productivityData.avgWorkHours} work hours. Consider time-blocking and setting strict boundaries.`
      });
    }

    if (healthData.exerciseFrequency < 50) {
      suggestions.push({
        icon: '🏃‍♀️',
        title: 'Exercise Consistency',
        description: `Exercise frequency is ${healthData.exerciseFrequency}%. Start with 15-minute daily walks to build momentum.`
      });
    }

    return suggestions.slice(0, 3); // Show top 3 suggestions
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-heading font-bold bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
              Reports & Analytics Dashboard
            </h3>
            <p className="text-muted-foreground dark:text-gray-300 mt-1">
              Comprehensive insights and progress tracking across all metrics
            </p>
          </div>
          <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-heading font-bold bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
            Reports & Analytics Dashboard
          </h3>
          <p className="text-muted-foreground dark:text-gray-300 mt-1">
            Comprehensive insights and progress tracking across all metrics
          </p>
        </div>
      </div>
      
      {/* Period Toggle */}
      <Tabs defaultValue="weekly" className="w-full">
        <TabsList>
          <TabsTrigger value="weekly" onClick={() => setSelectedPeriod('weekly')}>Weekly</TabsTrigger>
          <TabsTrigger value="monthly" onClick={() => setSelectedPeriod('monthly')}>Monthly</TabsTrigger>
          <TabsTrigger value="quarterly" onClick={() => setSelectedPeriod('quarterly')}>Quarterly</TabsTrigger>
        </TabsList>
        <TabsContent value="weekly">
          <div>Weekly Data</div>
        </TabsContent>
        <TabsContent value="monthly">
          <div>Monthly Data</div>
        </TabsContent>
        <TabsContent value="quarterly">
          <div>Quarterly Data</div>
        </TabsContent>
      </Tabs>

      {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Habits Completed</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData?.habitsCompleted || 0}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={`flex items-center ${analyticsData?.trends?.habitsImproving ? 'text-green-600' : 'text-red-600'}`}>
                    {analyticsData?.trends?.habitsImproving ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {analyticsData?.trends?.habitsImproving ? 'Improving trend' : 'Needs attention'}
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Goals Progress</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{goalsData?.summary?.onTrack || 0}/{goalsData?.summary?.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-blue-600 flex items-center">
                    <Target className="h-3 w-3 mr-1" />
                    {goalsData?.summary?.completed || 0} completed
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Health Score</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {healthData ? Math.round((
                    (healthData.trends?.hydrationGood ? 1 : 0) +
                    (healthData.trends?.sleepGood ? 1 : 0) +
                    (healthData.trends?.exerciseConsistent ? 1 : 0)
                  ) * 100 / 3) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className={`flex items-center ${Object.values(healthData?.trends || {}).filter(Boolean).length >= 2 ? 'text-green-600' : 'text-yellow-600'}`}>
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Overall wellness rating
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>

      <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={selectedPeriod === 'weekly' ? 'day' : 'period'} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="habits" fill="#8B5CF6" name="Habits %" />
                    <Bar dataKey="water" fill="#06D6A0" name="Water (glasses)" />
                    <Bar dataKey="work" fill="#FFD23F" name="Work (hours)" />
                    <Bar dataKey="focus" fill="#EE6C4D" name="Focus Sessions" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

      {/* Habits Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardHeader>
                <CardTitle>Habits Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {habitsData?.habits?.map((habit: any) => (
                    <div key={habit.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{habit.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{habit.currentStreak} day streak</Badge>
                          <span className="text-sm font-medium">{habit.completionRate}%</span>
                        </div>
                      </div>
                      <Progress value={habit.completionRate} className="h-2" />
                    </div>
                  )) || (
                    <div className="text-center text-gray-500 py-4">
                      No habit data available for this period
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI-Powered Insights */}
            <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  AI-Powered Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {generateAISuggestions().map((suggestion, index) => (
                    <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">
                        {suggestion.icon} {suggestion.title}
                      </h4>
                      <p className="text-sm text-blue-700">
                        {suggestion.description}
                      </p>
                    </div>
                  ))}

                  {generateAISuggestions().length === 0 && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-medium text-green-900 mb-2">🎉 Great Job!</h4>
                      <p className="text-sm text-green-700">
                        You're maintaining excellent habits across all areas. Keep up the fantastic work!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Development Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
            <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-[#4b5563] dark:text-white">
                  <BarChartIcon className="h-5 w-5" />
                  AI Development Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <Target className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-900 dark:text-blue-100">Project Health</span>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Projects with active development and deployment status
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <Calendar className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-900 dark:text-green-100">Development Velocity</span>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Average project completion time and development speed metrics
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <Target className="h-5 w-5 text-purple-600" />
                      <span className="font-medium text-purple-900 dark:text-purple-100">Focus Areas</span>
                    </div>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      Current development priorities and task distribution
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
    </div>
  );
}