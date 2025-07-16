import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Target, TrendingUp, BookOpen, Calendar, ExternalLink, LogIn, Sparkles, Heart } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import AdminLoginForm from "../components/AdminLoginForm";
import SEOHead from "../components/SEOHead";
import { generateWebsiteStructuredData, generateOrganizationStructuredData, BELLE_JOURNAL_WEBSITE_DATA } from "../utils/structuredData";

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
      window.location.href = '/admin';
    } else {
      setShowLoginForm(true);
    }
  };

  const handleFollowJourneyClick = () => {
    window.location.href = '/dashboard';
  };

  const handleLoginSuccess = () => {
    setShowLoginForm(false);
    window.location.href = '/admin';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      <SEOHead 
        title="Rheonda Ogletree - Digital Wellness & Productivity Expert | Belle Journal"
        description="Rheonda Ogletree is a leading digital wellness and productivity expert. Discover Belle Journal - your comprehensive platform for personal growth, habit tracking, and life optimization."
        keywords={["Rheonda Ogletree", "Rheonda D Ogletree", "Rheonda", "digital wellness", "productivity expert", "Belle Journal", "personal development", "habit tracking", "life coach", "wellness consultant", "Entrepreneurship", "Vibe Coding", "Replit", "Web App", "Prompt Engineer", "Prompt Engineering", "AI", "Artificial Intelligence", "Blogging", "Journal", "habit trackers", "girl boss", "business", "really obvious media lab", "really obvi media lab", "rotationonly", "rotationonly.mag", "rotationonly magazine", "rotationonly digital magazine", "really obvi media", "@rotationonly on apple music", "RODML"]}
        structuredData={generateWebsiteStructuredData(BELLE_JOURNAL_WEBSITE_DATA)}
      />
      
      {/* Header */}
      <header className="bg-white/80 dark:[background-color:var(--custom-dark)]/80 backdrop-blur-md border-b border-purple-100 dark:border-purple-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white text-lg">✨</span>
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

      {/* Inspirational Quote - Hero */}
      <section className="py-8">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="relative bg-white/60 dark:[background-color:var(--custom-dark)]/40 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-pink-200/50 dark:border-pink-800/50">
            <div className="absolute top-4 left-6 text-pink-300 dark:text-pink-400">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>
              </svg>
            </div>
            <div className="absolute top-4 right-6 text-purple-300 dark:text-purple-400">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"/>
              </svg>
            </div>
            <blockquote className="relative">
              <div className="text-5xl text-pink-200/50 dark:text-pink-700/50 absolute -top-1 -left-1 font-serif italic">"</div>
              <p className="text-lg md:text-xl font-light text-gray-700 dark:text-gray-200 leading-relaxed px-8 relative z-10" style={{ fontFamily: 'cursive' }}>
                What gets measured gets improved
              </p>
              <div className="text-5xl text-pink-200/50 dark:text-pink-700/50 absolute -bottom-2 -right-1 font-serif italic">"</div>
            </blockquote>
            <footer className="mt-4">
              <cite className="text-sm text-pink-600 dark:text-pink-400 font-medium tracking-wide">
                — Peter Drucker
              </cite>
            </footer>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              <div className="w-2 h-2 bg-pink-300 dark:bg-pink-600 rounded-full"></div>
              <div className="w-2 h-2 bg-purple-300 dark:bg-purple-600 rounded-full"></div>
              <div className="w-2 h-2 bg-rose-300 dark:bg-rose-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-6">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 leading-relaxed py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
            Building My Productivity Journey
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Welcome to my personal productivity dashboard where I track goals, habits, content creation, 
            and share my journey of building better systems for life, work, and play.
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
        <div className="text-center bg-white/50 dark:[background-color:var(--custom-dark)]/50 rounded-2xl p-12 backdrop-blur-sm mb-16">
          <h2 className="text-3xl font-bold mb-6">About This Journey</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8">
            This is my personal productivity dashboard where I track my daily habits, work towards meaningful goals, 
            and create content about building better systems. I believe in building in public and sharing the journey 
            of continuous improvement. This dashboard helps me stay accountable and motivated while providing 
            transparency into my personal development process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => window.location.href = '/about'}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Heart className="mr-2 h-4 w-4" />
              Meet the Admin
            </Button>
            <Button 
              onClick={() => window.location.href = '/blog'}
              variant="outline"
              className="border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Read the Blog
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 dark:[background-color:var(--custom-dark)]/80 backdrop-blur-md border-t border-purple-100 dark:border-purple-800 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Built with transparency and accountability in mind. 
            <span className="text-purple-600 font-medium"> Building in public, one day at a time.</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            © 2025 Really Obvious Media Lab. All rights reserved.
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