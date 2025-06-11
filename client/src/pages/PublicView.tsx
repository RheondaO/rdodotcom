import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogIn, Calendar, TrendingUp, Users, Star, Clock, Zap, Target, FileText } from "lucide-react";

interface PublicStats {
  totalGoals: number;
  completedGoals: number;
  totalHabits: number;
  activeHabits: number;
  totalContent: number;
  publishedContent: number;
  completionRate: number;
}

interface PublicContent {
  id: number;
  title: string;
  description: string;
  publishedDate: string;
  status: string;
}

export default function PublicView() {
  const { data: stats } = useQuery<PublicStats>({
    queryKey: ['/api/public/stats'],
    queryFn: async () => {
      const response = await fetch('/api/public/stats');
      return response.json();
    }
  });

  const { data: recentContent } = useQuery<PublicContent[]>({
    queryKey: ['/api/public/recent-content'],
    queryFn: async () => {
      const response = await fetch('/api/public/recent-content');
      return response.json();
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-purple-100 dark:border-purple-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BJ</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Belle Journal
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="text-purple-600 border-purple-200">
              Building in Public
            </Badge>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.location.href = '/dashboard'}
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Admin Login
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
            Building My Productivity Journey
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Welcome to my personal productivity dashboard where I track goals, habits, content creation, 
            and share my journey of building better systems for life and work.
          </p>
          <div className="flex justify-center space-x-4">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              onClick={() => window.location.href = '/dashboard'}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Follow My Journey
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-purple-100 dark:border-purple-800">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{stats?.totalGoals || 0}</div>
                <div className="text-gray-600 dark:text-gray-300">Total Goals</div>
                <div className="text-sm text-green-600 mt-1">{stats?.completedGoals || 0} completed</div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-pink-100 dark:border-pink-800">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-pink-600 mb-2">{stats?.activeHabits || 0}</div>
                <div className="text-gray-600 dark:text-gray-300">Active Habits</div>
                <div className="text-sm text-blue-600 mt-1">{stats?.totalHabits || 0} total</div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-orange-100 dark:border-orange-800">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">{stats?.publishedContent || 0}</div>
                <div className="text-gray-600 dark:text-gray-300">Published Content</div>
                <div className="text-sm text-purple-600 mt-1">{stats?.totalContent || 0} total pieces</div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-blue-100 dark:border-blue-800">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stats?.totalPosts || 0}</div>
                <div className="text-gray-600 dark:text-gray-300">Social Posts</div>
                <div className="text-sm text-teal-600 mt-1">{stats?.totalBlocks || 0} content blocks</div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-green-100 dark:border-green-800">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{stats?.streak || 0}</div>
                <div className="text-gray-600 dark:text-gray-300">Current Streak</div>
                <div className="text-sm text-indigo-600 mt-1">{stats?.completionRate || 0}% success</div>
              </CardContent>
            </Card>
          </div>

        {/* Recent Activity */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Recent Activity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentContent?.map((item) => (
                <div key={`${item.type}-${item.id}`} className="p-4 bg-white/40 dark:bg-gray-800/40 rounded-lg border border-purple-100 dark:border-purple-800">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                    {item.type === 'goal' ? (
                      <Target className="h-4 w-4 text-green-500 mt-1" />
                    ) : (
                      <FileText className="h-4 w-4 text-purple-500 mt-1" />
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <Badge 
                      variant="outline" 
                      className={`${
                        item.type === 'goal' 
                          ? 'text-green-600 border-green-200' 
                          : 'text-purple-600 border-purple-200'
                      }`}
                    >
                      {item.status}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  No recent activity available
                </div>
              )}
          </div>
        </div>

        {/* About Section */}
        <div className="text-center bg-white/50 dark:bg-gray-800/50 rounded-2xl p-12 backdrop-blur-sm">
          <h2 className="text-3xl font-bold mb-6">About This Journey</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            This is my personal productivity dashboard where I track my daily habits, work towards meaningful goals, 
            and create content about building better systems. I believe in building in public and sharing the journey 
            of continuous improvement. This dashboard helps me stay accountable and motivated while providing 
            transparency into my personal development process.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-purple-100 dark:border-purple-800 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Built with transparency and accountability in mind. 
            <span className="text-purple-600 font-semibold"> Building in public, one day at a time.</span>
          </p>
        </div>
      </footer>
    </div>
  );
}