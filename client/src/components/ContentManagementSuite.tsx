import React, { useState, useEffect } from "react";
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
  Save,
  Moon
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../hooks/useAuth";
import AdvancedScheduler from "./AdvancedScheduler";
import { apiRequest } from "../lib/queryClient";

import { MiniGameBlock } from "@shared/schema";
import { PAGE_OPTIONS } from "@shared/dropdown-constants";

interface ContentManagementSuiteProps {
  selectedDate: Date;
  isReadOnly?: boolean;
}

export default function ContentManagementSuite({ selectedDate, isReadOnly = false }: ContentManagementSuiteProps) {
  const [activeView, setActiveView] = useState<"overview" | "scheduler" | "analytics" | "progress">("overview");
  const [showNewBlockForm, setShowNewBlockForm] = useState(false);
  const [showAnalyticsForm, setShowAnalyticsForm] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
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

  // Get mini game blocks from API
  const { data: allBlocks = [], isLoading: blocksLoading } = useQuery<MiniGameBlock[]>({
    queryKey: ['/api/mini-game-blocks'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create dynamic mapping from blocks data
  const tagToBlockMapping: Record<string, string[]> = React.useMemo(() => {
    const mapping: Record<string, string[]> = {};
    allBlocks.forEach((block: MiniGameBlock) => {
      block.rotationOnlyTags?.forEach((tag: string) => {
        if (!mapping[tag]) mapping[tag] = [];
        mapping[tag].push(block.title);
      });
    });
    return mapping;
  }, [allBlocks]);

  // Filter blocks based on selected @rotationonly tag
  const displayBlocks = selectedFilter 
    ? allBlocks.filter((block: MiniGameBlock) => tagToBlockMapping[selectedFilter]?.includes(block.title))
    : allBlocks;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-gray-100 text-gray-700 dark:bg-[#17111d] dark:text-gray-300";
      case "paused": return "bg-gray-100 text-gray-600 dark:bg-[#17111d] dark:text-gray-400";
      case "completed": return "bg-gray-100 text-gray-500 dark:bg-[#17111d] dark:text-gray-500";
      default: return "bg-gray-100 text-gray-500 dark:bg-[#17111d] dark:text-gray-400";
    }
  }

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'rotationonly.mag':
        return 'bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800 border border-pink-300 dark:from-pink-900 dark:to-pink-800 dark:text-pink-200 dark:border-pink-600';
      case 'rotationonly.econ':
        return 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300 dark:from-purple-900 dark:to-purple-800 dark:text-purple-200 dark:border-purple-600';
      case 'rotationonly.xxx':
        return 'bg-gradient-to-r from-rose-100 to-rose-200 text-rose-800 border border-rose-300 dark:from-rose-900 dark:to-rose-800 dark:text-rose-200 dark:border-rose-600';
      case 'rotationonly.ext':
        return 'bg-gradient-to-r from-fuchsia-100 to-fuchsia-200 text-fuchsia-800 border border-fuchsia-300 dark:from-fuchsia-900 dark:to-fuchsia-800 dark:text-fuchsia-200 dark:border-fuchsia-600';
      case 'rotationonly.stem':
        return 'bg-gradient-to-r from-violet-100 to-violet-200 text-violet-800 border border-violet-300 dark:from-violet-900 dark:to-violet-800 dark:text-violet-200 dark:border-violet-600';
      case 'rotationonly.music':
        return 'bg-gradient-to-r from-pink-200 to-pink-300 text-pink-800 border border-pink-400 dark:from-pink-800 dark:to-pink-700 dark:text-pink-200 dark:border-pink-500';
      case 'rotationonly.ceo':
        return 'bg-gradient-to-r from-purple-200 to-purple-300 text-purple-800 border border-purple-400 dark:from-purple-800 dark:to-purple-700 dark:text-purple-200 dark:border-purple-500';
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300 dark:from-gray-700 dark:to-gray-600 dark:text-gray-200 dark:border-gray-500';
    }
  };

  const totalStats = {
    totalBlocks: displayBlocks.length,
    activeBlocks: displayBlocks.filter((b: MiniGameBlock) => b.status === "active").length,
    totalPosts: displayBlocks.reduce((sum: number, b: MiniGameBlock) => sum + b.totalPosts, 0),
    scheduledPosts: displayBlocks.reduce((sum: number, b: MiniGameBlock) => sum + b.scheduledPosts, 0),
    publishedPosts: displayBlocks.reduce((sum: number, b: MiniGameBlock) => sum + b.publishedPosts, 0),
    avgEngagement: displayBlocks.length > 0 ? Math.round(displayBlocks.reduce((sum: number, b: MiniGameBlock) => sum + b.engagement, 0) / displayBlocks.length) : 0
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#17111d] p-4">
      {/* Compact Header Section */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white dark:bg-[#17111d] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-heading font-bold bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
                  𝔯𝔬𝔱𝔞𝔱𝔦𝔬𝔫𝐎𝐍𝐋𝐘 Content Studio
                </h3>
                <p className="text-muted-foreground dark:text-gray-300 mt-1">
                  Mini Game Blocks & Professional Content Management
                </p>
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
                variant={activeView === "scheduler" ? "default" : "outline"}
                onClick={() => setActiveView("scheduler")}
                size="sm"
                data-testid="button-create-schedule"
              >
                <Clock className="h-4 w-4 mr-1" />
                Create Schedule
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
          <div className="flex flex-wrap justify-center gap-2 pb-2 mt-4">
            <div 
              className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm cursor-pointer transition-colors ${
                selectedFilter === null 
                  ? 'bg-gray-200 dark:bg-[#17111d] text-gray-900 dark:text-gray-100' 
                  : 'bg-gray-100 dark:bg-[#17111d] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:[background-color:var(--custom-dark)]'
              }`}
              onClick={() => setSelectedFilter(null)}
            >
              <span>All</span>
            </div>
            {Object.keys(tagToBlockMapping).map((tag) => (
              <div 
                key={tag}
                className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm cursor-pointer transition-all duration-200 ${
                  selectedFilter === tag 
                    ? `bg-white dark:bg-white text-gray-800 dark:text-gray-800 border border-gray-300 dark:border-gray-400 shadow-md transform scale-105` 
                    : `${getTagColor(tag)} opacity-75 hover:opacity-100 hover:shadow-sm hover:transform hover:scale-102`
                }`}
                onClick={() => setSelectedFilter(tag)}
              >
                <span>@{tag}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mini-Game Block Studio Section */}
        <div className="bg-white dark:bg-[#17111d] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
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
              {/* Hidden until designed later */}
              {false && (
                <>
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
                </>
              )}
            </div>
          </div>

          {activeView === "overview" && (
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white/70 dark:bg-[#0c0910] backdrop-blur-sm border border-pink-200/50 dark:border-pink-800/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
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
                
                <Card className="bg-white/70 dark:bg-[#0c0910] backdrop-blur-sm border border-pink-200/50 dark:border-pink-800/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
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

                <Card className="bg-white/70 dark:bg-[#0c0910] backdrop-blur-sm border border-pink-200/50 dark:border-pink-800/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
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

                <Card className="bg-white/70 dark:bg-[#0c0910] backdrop-blur-sm border border-pink-200/50 dark:border-pink-800/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
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
                {displayBlocks.map((block: MiniGameBlock) => (
                  <Card key={block.id} className="bg-white/70 dark:bg-[#0c0910] backdrop-blur-sm border border-pink-200/50 dark:border-pink-800/50 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 rounded-3xl overflow-hidden">
                    <CardHeader className="pb-4 border-b border-gray-200/50 dark:border-gray-700/50" style={{ background: `linear-gradient(135deg, ${block.color}15 0%, ${block.color}08 100%)` }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div>
                            <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-200">{block.title}</CardTitle>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-5">
                        
                        <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-[var(--custom-dark)] dark:to-[var(--custom-dark)] rounded-xl p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Annual Progress</span>
                            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{Math.round((block.publishedPosts / block.totalPosts) * 100)}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Engagement Rate</span>
                            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{block.engagement}%</span>
                          </div>
                        </div>
                        
                        {/* Designed/Reviewed/Approved Counts */}
                        <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-[var(--custom-dark)] dark:to-[var(--custom-dark)] rounded-xl p-4">
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{block.designedPosts}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Designed</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{block.reviewedPosts}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Reviewed</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{block.approvedPosts}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Approved</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Enhanced Progress Bar */}
                        <div className="relative">
                          <div className="h-2 bg-gray-200 dark:bg-[#17111d] rounded-full overflow-hidden">
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
                        
                        {/* Status indicator at bottom left */}
                        <div className="flex items-center gap-2 mt-4">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <Badge className={getStatusColor(block.status)}>{block.status}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {false && (
            <div className="space-y-6">
              <Card className="bg-white/70 dark:bg-[#0c0910] backdrop-blur-sm border border-pink-200/50 dark:border-pink-800/50 shadow-lg rounded-xl">
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
                        disabled={isReadOnly}
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={newBlock.category} onValueChange={(value) => setNewBlock({...newBlock, category: value})} disabled={isReadOnly}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="engagement">Engagement</SelectItem>
                          <SelectItem value="astrological">Astrological</SelectItem>
                          <SelectItem value="wellness">Wellness</SelectItem>
                          <SelectItem value="educational">Educational</SelectItem>
                          <SelectItem value="personal">Personal</SelectItem>
                          <SelectItem value="creative">Creative</SelectItem>
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
                      disabled={isReadOnly}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select value={newBlock.frequency} onValueChange={(value) => setNewBlock({...newBlock, frequency: value})} disabled={isReadOnly}>
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
                        disabled={isReadOnly}
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
                    disabled={isReadOnly || !newBlock.name}
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
              <Card className="bg-white/70 dark:bg-[#0c0910] backdrop-blur-sm border border-pink-200/50 dark:border-pink-800/50 shadow-lg rounded-xl">
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
              <Card className="bg-white/70 dark:bg-[#0c0910] backdrop-blur-sm border border-pink-200/50 dark:border-pink-800/50 shadow-lg rounded-xl">
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

          {activeView === "scheduler" && (
            <div className="space-y-6">
              <AdvancedScheduler 
                selectedDate={selectedDate}
                onContentScheduled={(items) => {
                  toast({ 
                    title: `Generated ${items.length} scheduled content items!`,
                    description: "Content has been scheduled successfully."
                  });
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}