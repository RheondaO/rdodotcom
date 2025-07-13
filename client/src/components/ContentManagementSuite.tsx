import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
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
  Circle,
  BarChart,
  PieChart,
  Activity,
  DollarSign,
  Save
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../hooks/useAuth";

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
  const [showNewBlockForm, setShowNewBlockForm] = useState(false);
  const [showAnalyticsForm, setShowAnalyticsForm] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  // Form state for new Mini Game Block
  const [newBlock, setNewBlock] = useState({
    name: "",
    description: "",
    frequency: "weekly",
    frequencyValue: 52,
    color: "#8B5CF6",
    category: "engagement"
  });

  // Form state for analytics data
  const [newAnalytics, setNewAnalytics] = useState({
    miniGameBlockId: "",
    platform: "instagram",
    dayOfWeek: "monday",
    timeSlot: "morning",
    postType: "image",
    avgImpressions: 0,
    avgReach: 0,
    avgLikes: 0,
    avgComments: 0,
    avgShares: 0,
    avgEngagementRate: 0,
    totalPosts: 0
  });

  // Sample data for mini game blocks
  const displayBlocks = [
    {
      id: 1,
      title: "Morning Motivation Series",
      description: "Daily inspiring quotes and affirmations",
      category: "wellness",
      totalPosts: 45,
      scheduledPosts: 12,
      publishedPosts: 33,
      engagement: 85,
      lastUpdated: "2025-06-15",
      status: "active" as "active" | "paused" | "completed",
      color: "#6B7280",
      icon: "🌅"
    },
    {
      id: 2,
      title: "Astro Insights",
      description: "Weekly astrological readings and moon phases",
      category: "astrological",
      totalPosts: 32,
      scheduledPosts: 8,
      publishedPosts: 24,
      engagement: 92,
      lastUpdated: "2025-06-14",
      status: "active" as "active" | "paused" | "completed",
      color: "#6B7280",
      icon: "🌙"
    },
    {
      id: 3,
      title: "Creative Experiments",
      description: "Innovative content formats and media tests",
      category: "creative",
      totalPosts: 28,
      scheduledPosts: 6,
      publishedPosts: 22,
      engagement: 78,
      lastUpdated: "2025-06-13",
      status: "active" as "active" | "paused" | "completed",
      color: "#6B7280",
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
      status: "active" as "active" | "paused" | "completed",
      color: "#6B7280",
      icon: "✨"
    },
    {
      id: 5,
      title: "Community Challenges",
      description: "Interactive games and community engagement",
      category: "engagement",
      totalPosts: 24,
      scheduledPosts: 7,
      publishedPosts: 17,
      engagement: 88,
      lastUpdated: "2025-06-11",
      status: "active" as "active" | "paused" | "completed",
      color: "#6B7280",
      icon: "🎯"
    },
    {
      id: 6,
      title: "Tutorial Tuesdays",
      description: "Educational content and how-to guides",
      category: "educational",
      totalPosts: 16,
      scheduledPosts: 3,
      publishedPosts: 13,
      engagement: 74,
      lastUpdated: "2025-06-10",
      status: "paused" as "active" | "paused" | "completed",
      color: "#6B7280",
      icon: "📚"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
      case "paused": return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
      case "completed": return "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500";
      default: return "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const totalStats = {
    totalBlocks: displayBlocks.length,
    activeBlocks: displayBlocks.filter(b => b.status === "active").length,
    totalPosts: displayBlocks.reduce((sum, b) => sum + b.totalPosts, 0),
    scheduledPosts: displayBlocks.reduce((sum, b) => sum + b.scheduledPosts, 0),
    publishedPosts: displayBlocks.reduce((sum, b) => sum + b.publishedPosts, 0),
    avgEngagement: Math.round(displayBlocks.reduce((sum, b) => sum + b.engagement, 0) / displayBlocks.length)
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-4">
      {/* Compact Header Section */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  rotationONLY Content Studio
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Mini Game Blocks & Professional Content Management</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={activeView === "overview" ? "default" : "outline"}
                onClick={() => setActiveView("overview")}
                size="sm"
              >
                Overview
              </Button>
              <Button
                variant={activeView === "create" ? "default" : "outline"}
                onClick={() => setActiveView("create")}
                size="sm"
              >
                Create
              </Button>
              <Button
                variant={activeView === "analytics" ? "default" : "outline"}
                onClick={() => setActiveView("analytics")}
                size="sm"
              >
                Analytics
              </Button>
              <Button
                variant={activeView === "progress" ? "default" : "outline"}
                onClick={() => setActiveView("progress")}
                size="sm"
              >
                Progress
              </Button>
            </div>
          </div>

          {/* Brand Tabs */}
          <div className="flex flex-wrap gap-2 pb-2 mt-4">
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-md text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600">
              <span>📰</span>
              <span>@rotationonly.mag</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-md text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600">
              <span>💰</span>
              <span>@rotationonly.econ</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-md text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600">
              <span>🔥</span>
              <span>@rotationonly.xxx</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-md text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600">
              <span>🌐</span>
              <span>@rotationonly.ext</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-md text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600">
              <span>🔬</span>
              <span>@rotationonly.stem</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-md text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600">
              <span>🎵</span>
              <span>@rotationonly.music</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-md text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600">
              <span>💼</span>
              <span>@rotationonly.ceo</span>
            </div>
          </div>
        </div>

        {/* Mini-Game Block Studio Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Mini-Game Block Studio
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Create and manage content blocks with workflow tracking</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowNewBlockForm(true)}
                disabled={isReadOnly}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Block
              </Button>
              <Button
                onClick={() => setShowAnalyticsForm(true)}
                disabled={isReadOnly}
                size="sm"
              >
                Add Analytics
              </Button>
            </div>
          </div>

          {activeView === "overview" && (
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Blocks</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalStats.totalBlocks}</p>
                      </div>
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                        <Layout className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Blocks</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalStats.activeBlocks}</p>
                      </div>
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                        <Activity className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Published Posts</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalStats.publishedPosts}</p>
                      </div>
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Engagement</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalStats.avgEngagement}%</p>
                      </div>
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Content Blocks Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayBlocks.map((block) => (
                  <Card key={block.id} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 rounded-3xl overflow-hidden">
                    <CardHeader className="pb-4 border-b border-gray-200/50 dark:border-gray-700/50" style={{ background: `linear-gradient(135deg, ${block.color}15 0%, ${block.color}08 100%)` }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg text-2xl" style={{ background: `linear-gradient(135deg, ${block.color} 0%, ${block.color}CC 100%)` }}>
                            {block.icon}
                          </div>
                          <div>
                            <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-200">{block.title}</CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{block.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <Badge className={getStatusColor(block.status)}>{block.status}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-5">
                        <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Last updated: {block.lastUpdated}</span>
                        </div>
                        
                        <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Content Progress</span>
                            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{block.publishedPosts}/{block.totalPosts}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Engagement Rate</span>
                            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{block.engagement}%</span>
                          </div>
                        </div>
                        
                        {/* Enhanced Progress Bar */}
                        <div className="relative">
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-1000 shadow-sm"
                              style={{ 
                                width: `${(block.publishedPosts / block.totalPosts) * 100}%`,
                                background: `linear-gradient(90deg, ${block.color} 0%, ${block.color}CC 100%)`
                              }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                            <span>Published: {block.publishedPosts}</span>
                            <span>Scheduled: {block.scheduledPosts}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeView === "create" && (
            <div className="space-y-6">
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg rounded-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-200">Create New Content Block</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="blockName">Block Name</Label>
                      <Input 
                        id="blockName"
                        placeholder="Enter block name"
                        value={newBlock.name}
                        onChange={(e) => setNewBlock({...newBlock, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={newBlock.category} onValueChange={(value) => setNewBlock({...newBlock, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="engagement">🎯 Engagement</SelectItem>
                          <SelectItem value="astrological">🌙 Astrological</SelectItem>
                          <SelectItem value="wellness">🌅 Wellness</SelectItem>
                          <SelectItem value="educational">📚 Educational</SelectItem>
                          <SelectItem value="personal">✨ Personal</SelectItem>
                          <SelectItem value="creative">🧪 Creative</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description"
                      placeholder="Describe the content block"
                      value={newBlock.description}
                      onChange={(e) => setNewBlock({...newBlock, description: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select value={newBlock.frequency} onValueChange={(value) => setNewBlock({...newBlock, frequency: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="color">Color</Label>
                      <Input 
                        id="color"
                        type="color"
                        value={newBlock.color}
                        onChange={(e) => setNewBlock({...newBlock, color: e.target.value})}
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={() => {
                      toast({ title: "Block created successfully!" });
                      setNewBlock({
                        name: "",
                        description: "",
                        frequency: "weekly",
                        frequencyValue: 52,
                        color: "#8B5CF6",
                        category: "engagement"
                      });
                    }}
                    disabled={!newBlock.name}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                  >
                    Create Block
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeView === "analytics" && (
            <div className="space-y-6">
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg rounded-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-200">Analytics Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BarChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Analytics dashboard coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeView === "progress" && (
            <div className="space-y-6">
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg rounded-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-200">Progress Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <PieChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Progress tracking coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}