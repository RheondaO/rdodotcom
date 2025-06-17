import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  PenTool, 
  Plus, 
  Calendar, 
  Clock, 
  Eye,
  FileText,
  Video,
  Image,
  Layout,
  Target,
  TrendingUp,
  Users,
  Zap,
  Palette,
  CheckCircle,
  Circle
} from "lucide-react";
import { format } from "date-fns";

interface MiniGameBlock {
  id: number;
  title: string;
  description: string;
  category: string;
  totalPosts: number;
  scheduledPosts: number;
  publishedPosts: number;
  engagement: number;
  lastUpdated: string;
  status: "active" | "paused" | "completed";
  color: string;
  icon: string;
}

interface ContentManagementSuiteProps {
  selectedDate: Date;
  isReadOnly?: boolean;
}

export default function ContentManagementSuite({ selectedDate, isReadOnly = false }: ContentManagementSuiteProps) {
  const [activeView, setActiveView] = useState<"overview" | "create" | "analytics" | "progress">("overview");

  // Mini Game Blocks data
  const [miniGameBlocks] = useState<MiniGameBlock[]>([
    {
      id: 1,
      title: "Morning Motivation Series",
      description: "Daily inspiring quotes and affirmations",
      category: "rotationONLY",
      totalPosts: 45,
      scheduledPosts: 12,
      publishedPosts: 33,
      engagement: 85,
      lastUpdated: "2025-06-15",
      status: "active",
      color: "#8B5CF6",
      icon: "🌅"
    },
    {
      id: 2,
      title: "Astro Insights",
      description: "Weekly astrological readings and moon phases",
      category: "rotationONLY",
      totalPosts: 32,
      scheduledPosts: 8,
      publishedPosts: 24,
      engagement: 92,
      lastUpdated: "2025-06-14",
      status: "active",
      color: "#3B82F6",
      icon: "🌙"
    },
    {
      id: 3,
      title: "Creative Experiments",
      description: "Innovative content formats and media tests",
      category: "reallyObvi",
      totalPosts: 28,
      scheduledPosts: 6,
      publishedPosts: 22,
      engagement: 78,
      lastUpdated: "2025-06-13",
      status: "active",
      color: "#EF4444",
      icon: "🧪"
    },
    {
      id: 4,
      title: "Personal Stories",
      description: "Behind-the-scenes and personal insights",
      category: "personal",
      totalPosts: 19,
      scheduledPosts: 4,
      publishedPosts: 15,
      engagement: 96,
      lastUpdated: "2025-06-12",
      status: "active",
      color: "#EC4899",
      icon: "✨"
    },
    {
      id: 5,
      title: "Community Challenges",
      description: "Interactive games and community engagement",
      category: "rotationONLY",
      totalPosts: 24,
      scheduledPosts: 7,
      publishedPosts: 17,
      engagement: 88,
      lastUpdated: "2025-06-11",
      status: "active",
      color: "#10B981",
      icon: "🎮"
    },
    {
      id: 6,
      title: "Tutorial Tuesdays",
      description: "Educational content and how-to guides",
      category: "reallyObvi",
      totalPosts: 16,
      scheduledPosts: 3,
      publishedPosts: 13,
      engagement: 74,
      lastUpdated: "2025-06-10",
      status: "paused",
      color: "#F59E0B",
      icon: "📚"
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "paused": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "completed": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const totalStats = {
    totalBlocks: miniGameBlocks.length,
    activeBlocks: miniGameBlocks.filter(b => b.status === "active").length,
    totalPosts: miniGameBlocks.reduce((sum, b) => sum + b.totalPosts, 0),
    scheduledPosts: miniGameBlocks.reduce((sum, b) => sum + b.scheduledPosts, 0),
    publishedPosts: miniGameBlocks.reduce((sum, b) => sum + b.publishedPosts, 0),
    avgEngagement: Math.round(miniGameBlocks.reduce((sum, b) => sum + b.engagement, 0) / miniGameBlocks.length)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Content Studio</h2>
          <p className="text-gray-600 dark:text-gray-300">Mini Game Blocks & Content Management</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={activeView === "overview" ? "default" : "outline"}
            onClick={() => setActiveView("overview")}
            className="flex items-center space-x-2"
          >
            <Layout className="h-4 w-4" />
            <span>Overview</span>
          </Button>
          <Button
            variant={activeView === "create" ? "default" : "outline"}
            onClick={() => setActiveView("create")}
            className="flex items-center space-x-2"
          >
            <PenTool className="h-4 w-4" />
            <span>Create</span>
          </Button>
          <Button
            variant={activeView === "progress" ? "default" : "outline"}
            onClick={() => setActiveView("progress")}
            className="flex items-center space-x-2"
          >
            <Palette className="h-4 w-4" />
            <span>Design Progress</span>
          </Button>
          <Button
            variant={activeView === "analytics" ? "default" : "outline"}
            onClick={() => setActiveView("analytics")}
            className="flex items-center space-x-2"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Analytics</span>
          </Button>
        </div>
      </div>

      {/* Overview */}
      {activeView === "overview" && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 border-purple-200 dark:border-purple-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 dark:text-purple-300">Active Blocks</p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-200">{totalStats.activeBlocks}</p>
                  </div>
                  <Zap className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border-blue-200 dark:border-blue-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-300">Total Posts</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-200">{totalStats.totalPosts}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border-green-200 dark:border-green-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-300">Published</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-200">{totalStats.publishedPosts}</p>
                  </div>
                  <Eye className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-900 dark:to-pink-800 border-pink-200 dark:border-pink-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-pink-600 dark:text-pink-300">Avg Engagement</p>
                    <p className="text-2xl font-bold text-pink-700 dark:text-pink-200">{totalStats.avgEngagement}%</p>
                  </div>
                  <Users className="h-8 w-8 text-pink-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mini Game Blocks Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Mini Game Blocks</h3>
              {!isReadOnly && (
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>New Block</span>
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {miniGameBlocks.map((block) => (
                <Card key={block.id} className="hover:shadow-lg transition-shadow border-l-4" style={{ borderLeftColor: block.color }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{block.icon}</span>
                        <div>
                          <CardTitle className="text-base">{block.title}</CardTitle>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{block.category}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(block.status)}>{block.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">{block.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Total Posts</span>
                        <span className="font-semibold">{block.totalPosts}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Published</span>
                        <span className="font-semibold text-green-600">{block.publishedPosts}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Scheduled</span>
                        <span className="font-semibold text-blue-600">{block.scheduledPosts}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Engagement</span>
                        <span className="font-semibold" style={{ color: block.color }}>{block.engagement}%</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-500">Last updated: {block.lastUpdated}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Design Progress */}
      {activeView === "progress" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {miniGameBlocks.map((block) => (
              <Card key={block.id} className="hover:shadow-lg transition-shadow border-l-4" style={{ borderLeftColor: block.color }}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{block.icon}</span>
                      <div>
                        <CardTitle className="text-base">{block.title}</CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{block.category}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(block.status)}>{block.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {/* Design Progress Stages */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Concept</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Design</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Content Creation</span>
                        <Circle className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(85, (block.publishedPosts / block.totalPosts) * 100)}%` }}></div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Scheduling</span>
                        <Circle className="h-4 w-4 text-yellow-500" />
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(block.scheduledPosts / block.totalPosts) * 100}%` }}></div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Publishing</span>
                        <Circle className="h-4 w-4 text-purple-500" />
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(block.publishedPosts / block.totalPosts) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Overall Progress</span>
                      <span className="font-semibold" style={{ color: block.color }}>
                        {Math.round((block.publishedPosts / block.totalPosts) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                      <div 
                        className="h-3 rounded-full transition-all duration-500" 
                        style={{ 
                          width: `${(block.publishedPosts / block.totalPosts) * 100}%`,
                          backgroundColor: block.color 
                        }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Create New Block */}
      {activeView === "create" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Create New Mini Game Block</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <PenTool className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">Block creation form would be here</p>
              <p className="text-sm text-gray-500 mt-2">Connect to database to enable content creation</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics */}
      {activeView === "analytics" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Content Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">Detailed analytics would be displayed here</p>
              <p className="text-sm text-gray-500 mt-2">Performance metrics and engagement insights</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}