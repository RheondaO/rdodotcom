import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, BookOpen, Calendar, ExternalLink, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import AdminLoginForm from "@/components/AdminLoginForm";

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
  const [showLoginForm, setShowLoginForm] = useState(false);
  const { isAuthenticated, isAdmin } = useAuth();

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

  const handleAdminLoginClick = () => {
    if (isAuthenticated && isAdmin) {
      window.location.href = '/dashboard';
    } else {
      setShowLoginForm(true);
    }
  };

  const handleFollowJourneyClick = () => {
    if (isAuthenticated && isAdmin) {
      window.location.href = '/dashboard';
    } else {
      setShowLoginForm(true);
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginForm(false);
    window.location.href = '/dashboard';
  };

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
              onClick={handleAdminLoginClick}
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            >
              <LogIn className="mr-2 h-4 w-4" />
              {isAuthenticated && isAdmin ? 'Go to Dashboard' : 'Admin Login'}
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
              onClick={handleFollowJourneyClick}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              {isAuthenticated && isAdmin ? 'Go to Dashboard' : 'Follow My Journey'}
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <Card className="border-purple-100 dark:border-purple-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
                <Target className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalGoals}</div>
                <p className="text-xs text-green-600">
                  {stats.completedGoals} completed ({stats.completionRate}%)
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-100 dark:border-purple-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Habits</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeHabits}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  of {stats.totalHabits} total habits
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-100 dark:border-purple-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Content Published</CardTitle>
                <BookOpen className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.publishedContent}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  of {stats.totalContent} total pieces
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-100 dark:border-purple-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <Calendar className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completionRate}%</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  goal completion rate
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Content */}
        {recentContent && recentContent.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Recent Published Content</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentContent.map((content) => (
                <Card key={content.id} className="hover:shadow-lg transition-shadow border-purple-100 dark:border-purple-800">
                  <CardHeader>
                    <CardTitle className="text-lg">{content.title}</CardTitle>
                    <CardDescription>{content.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">Published</Badge>
                      <span className="text-sm text-gray-500">
                        {content.publishedDate ? new Date(content.publishedDate).toLocaleDateString() : 'Recently'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

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

      {/* Admin Login Form Modal */}
      {showLoginForm && (
        <AdminLoginForm
          onClose={() => setShowLoginForm(false)}
          onSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}