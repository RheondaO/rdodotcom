import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Lightbulb, 
  PenTool, 
  Eye, 
  Edit,
  Calendar,
  AlertCircle,
  Plus,
  Zap,
  BookOpen,
  Users,
  CheckCircle
} from "lucide-react";
import BlogEditor from "./BlogEditor";

interface BlogPost {
  id: number;
  title: string;
  content?: string;
  excerpt?: string;
  status: string;
  type: string;
  platform: string;
  tags?: string;
  scheduledDate?: string;
  publishedDate?: string;
  reviewDate?: string;
  priority?: string;
  wordCount?: number;
  readingTime?: number;
  seoTitle?: string;
  seoDescription?: string;
  featuredImage?: string;
  isAiGenerated?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BlogIdea {
  id: number;
  title: string;
  description?: string;
  category: string;
  platform: string;
  tags?: string;
  priority?: string;
  aiPrompt?: string;
  aiGeneratedContent?: string;
  status: string;
  estimatedReadTime?: number;
  targetAudience?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BlogCalendar {
  id: number;
  postId?: number;
  ideaId?: number;
  title: string;
  type: string;
  platform: string;
  date: string;
  time?: string;
  status: string;
  notes?: string;
  createdAt?: Date;
}

interface WorkflowStatus {
  ideas: {
    total: number;
    byStatus: Record<string, number>;
    items: Array<{
      id: number;
      title: string;
      status: string;
      platform: string;
      priority: string;
      createdAt?: Date;
    }>;
  };
  posts: {
    total: number;
    byStatus: Record<string, number>;
    items: Array<{
      id: number;
      title: string;
      status: string;
      platform: string;
      priority: string;
      scheduledDate?: string;
      publishedDate?: string;
      createdAt?: Date;
    }>;
  };
  calendar: {
    upcoming: BlogCalendar[];
    overdue: BlogCalendar[];
  };
  workflow: {
    ideaStage: number;
    research: number;
    drafting: number;
    review: number;
    published: number;
  };
}

export default function BlogContentStudio() {
  const [selectedBrand, setSelectedBrand] = useState("relationONLY");
  const [selectedStudioTab, setSelectedStudioTab] = useState("overview");
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<number | null>(null);
  const [newIdeaDialog, setNewIdeaDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const queryClient = useQueryClient();

  const { data: blogPosts, isLoading: postsLoading } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog/posts'],
  });

  const { data: blogIdeas, isLoading: ideasLoading } = useQuery<BlogIdea[]>({
    queryKey: ['/api/blog/ideas'],
  });

  const { data: workflowStatus, isLoading: statusLoading } = useQuery<WorkflowStatus>({
    queryKey: ['/api/blog/workflow-status'],
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/blog/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/blog/workflow-status'] });
    },
  });

  const createIdeaMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/blog/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/ideas'] });
      queryClient.invalidateQueries({ queryKey: ['/api/blog/workflow-status'] });
      setNewIdeaDialog(false);
    },
  });

  const updatePostStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await fetch(`/api/blog/posts/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/blog/workflow-status'] });
    },
  });

  const createPostFromIdeaMutation = useMutation({
    mutationFn: async (ideaId: number) => {
      const response = await fetch('/api/blog/ideas/${ideaId}/create-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/blog/workflow-status'] });
    },
  });

  const generateAIContentMutation = useMutation({
    mutationFn: async (ideaId: number) => {
      const response = await fetch('/api/blog/ideas/${ideaId}/generate-ai-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/ideas'] });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200';
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200';
      case 'archived': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  if (showEditor) {
    return (
      <BlogEditor 
        postId={editingPost || undefined}
        onClose={() => {
          setShowEditor(false);
          setEditingPost(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 p-6">
      {/* Enhanced Header Section */}
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-8">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Content Management Suite
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">Professional content creation and workflow management</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Dialog open={newIdeaDialog} onOpenChange={setNewIdeaDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="hover:bg-yellow-50 dark:hover:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                    <Lightbulb className="h-4 w-4 mr-2 text-yellow-600" />
                    New Idea
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Blog Idea</DialogTitle>
                  </DialogHeader>
                  <NewIdeaForm onSubmit={createIdeaMutation.mutate} />
                </DialogContent>
              </Dialog>
              
              <Button
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
                onClick={() => {
                  setEditingPost(null);
                  setShowEditor(true);
                }}
              >
                <PenTool className="h-4 w-4 mr-2" />
                Write Post
              </Button>
            </div>
          </div>

          {/* Enhanced Brand Tabs */}
          <div className="flex gap-3 overflow-x-auto pb-2 mt-8">
            <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-shadow cursor-pointer">
              <span className="text-lg">🌙</span>
              <span className="font-semibold">relationONLY Magazine</span>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-green-400 to-emerald-400 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-shadow cursor-pointer">
              <span className="text-lg">🖊️</span>
              <span className="font-semibold">Really Obvi Media Lab</span>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-400 to-cyan-400 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-shadow cursor-pointer">
              <span className="text-lg">✨</span>
              <span className="font-semibold">Personal Brand</span>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-orange-400 to-red-400 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-shadow cursor-pointer">
              <span className="text-lg">🏈</span>
              <span className="font-semibold">Misc</span>
            </div>
          </div>
        </div>

        {/* Enhanced Mini-Game Block Studio Section */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Mini-Game Block Studio
                </h2>
                <p className="text-gray-600 dark:text-gray-400">Create and manage content blocks with workflow tracking</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="hover:bg-gray-50 dark:hover:bg-gray-700/50 border-gray-200 dark:border-gray-700">
                <Plus className="h-4 w-4 mr-2" />
                New Block
              </Button>
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg">
                <span className="text-lg mr-2">✨</span>
                New Mini-Game
              </Button>
            </div>
          </div>

        <Tabs value={selectedStudioTab} onValueChange={setSelectedStudioTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="progress">Progress Tracker</TabsTrigger>
            <TabsTrigger value="queues">Design Queues</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Administration Block - Enhanced */}
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 rounded-3xl overflow-hidden">
                <CardHeader className="pb-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-200">Administration</CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">52 designs/year</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-5">
                    <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">May 31, 2025</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3">
                      <span className="text-purple-600 dark:text-purple-400 text-lg">♈</span>
                      <span className="font-medium">Administration during Aries</span>
                      <span className="text-purple-600 dark:text-purple-400 text-lg">♉</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
                      <Calendar className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Every Friday (52/year)</span>
                    </div>
                    
                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Annual Progress</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">1/52</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Completion Rate</span>
                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400">2%</span>
                      </div>
                    </div>
                    
                    {/* Enhanced Vertical Progress Bar */}
                    <div className="relative h-40 bg-gradient-to-t from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl overflow-hidden shadow-inner">
                      <div 
                        className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-slate-600 via-slate-500 to-slate-400 rounded-2xl transition-all duration-1000 shadow-lg"
                        style={{ height: '4%' }}
                      ></div>
                      
                      {/* Enhanced Progress markers */}
                      <div className="absolute inset-0 flex flex-col justify-between items-center py-3">
                        <div className="w-3 h-3 bg-slate-700 rounded-full shadow-md"></div>
                        <div className="w-3 h-3 bg-slate-500 rounded-full shadow-md"></div>
                        <div className="w-3 h-3 bg-slate-300 rounded-full shadow-md"></div>
                        <div className="w-3 h-3 bg-slate-200 rounded-full shadow-md"></div>
                        <div className="w-3 h-3 bg-slate-100 rounded-full shadow-md"></div>
                      </div>
                    </div>
                    
                    {/* Enhanced Status indicators */}
                    <div className="flex justify-between items-center text-xs bg-white/50 dark:bg-gray-800/50 rounded-xl p-3 backdrop-blur-sm">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-blue-600 rounded-full mb-2 shadow-lg"></div>
                        <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">0</span>
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Designed</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mb-2 shadow-lg"></div>
                        <span className="text-yellow-600 dark:text-yellow-400 font-bold text-sm">0</span>
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Reviewed</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mb-2 shadow-lg"></div>
                        <span className="text-green-600 dark:text-green-400 font-bold text-sm">1</span>
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Approved</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Word of the Week Block - Enhanced */}
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 rounded-3xl overflow-hidden">
                <CardHeader className="pb-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-green-800 dark:to-emerald-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-200">Word of the Week</CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">52 designs/year</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-5">
                    <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">June 1, 2025</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3">
                      <span className="text-purple-600 dark:text-purple-400 text-lg">♉</span>
                      <span className="font-medium">Word learning during Taurus</span>
                      <span className="text-purple-600 dark:text-purple-400 text-lg">♊</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
                      <Calendar className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Every Sunday (52/year)</span>
                    </div>
                    
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-green-800 dark:to-emerald-700 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Annual Progress</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">22/52</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Completion Rate</span>
                        <span className="text-xs font-bold text-green-600 dark:text-green-400">42%</span>
                      </div>
                    </div>
                    
                    {/* Enhanced Vertical Progress Bar */}
                    <div className="relative h-40 bg-gradient-to-t from-emerald-200 to-green-100 dark:from-green-700 dark:to-emerald-600 rounded-2xl overflow-hidden shadow-inner">
                      <div 
                        className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-green-600 via-emerald-500 to-green-400 rounded-2xl transition-all duration-1000 shadow-lg"
                        style={{ height: '42%' }}
                      ></div>
                      
                      {/* Enhanced Progress markers */}
                      <div className="absolute inset-0 flex flex-col justify-between items-center py-3">
                        <div className="w-3 h-3 bg-green-700 rounded-full shadow-md"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full shadow-md"></div>
                        <div className="w-3 h-3 bg-green-300 rounded-full shadow-md"></div>
                        <div className="w-3 h-3 bg-green-200 rounded-full shadow-md"></div>
                        <div className="w-3 h-3 bg-green-100 rounded-full shadow-md"></div>
                      </div>
                    </div>
                    
                    {/* Enhanced Status indicators */}
                    <div className="flex justify-between items-center text-xs bg-white/50 dark:bg-gray-800/50 rounded-xl p-3 backdrop-blur-sm">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-blue-600 rounded-full mb-2 shadow-lg"></div>
                        <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">15</span>
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Designed</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mb-2 shadow-lg"></div>
                        <span className="text-yellow-600 dark:text-yellow-400 font-bold text-sm">5</span>
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Reviewed</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mb-2 shadow-lg"></div>
                        <span className="text-green-600 dark:text-green-400 font-bold text-sm">22</span>
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Approved</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Social Media Posts Block - Enhanced */}
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 rounded-3xl overflow-hidden">
                <CardHeader className="pb-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-800 dark:to-cyan-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <AlertCircle className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-200">Social Media Posts</CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">365 posts/year</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-5">
                    <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Daily Posts</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3">
                      <span className="text-purple-600 dark:text-purple-400 text-lg">📱</span>
                      <span className="font-medium">Multi-platform content</span>
                      <span className="text-purple-600 dark:text-purple-400 text-lg">🌐</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
                      <Calendar className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Automated scheduling</span>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-800 dark:to-cyan-700 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Annual Progress</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">193/365</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Completion Rate</span>
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">53%</span>
                      </div>
                    </div>
                    
                    {/* Enhanced Vertical Progress Bar */}
                    <div className="relative h-40 bg-gradient-to-t from-blue-200 to-cyan-100 dark:from-blue-700 dark:to-cyan-600 rounded-2xl overflow-hidden shadow-inner">
                      <div 
                        className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-blue-600 via-cyan-500 to-blue-400 rounded-2xl transition-all duration-1000 shadow-lg"
                        style={{ height: '53%' }}
                      ></div>
                      
                      {/* Enhanced Progress markers */}
                      <div className="absolute inset-0 flex flex-col justify-between items-center py-3">
                        <div className="w-3 h-3 bg-blue-700 rounded-full shadow-md"></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full shadow-md"></div>
                        <div className="w-3 h-3 bg-blue-300 rounded-full shadow-md"></div>
                        <div className="w-3 h-3 bg-blue-200 rounded-full shadow-md"></div>
                        <div className="w-3 h-3 bg-blue-100 rounded-full shadow-md"></div>
                      </div>
                    </div>
                    
                    {/* Enhanced Status indicators */}
                    <div className="flex justify-between items-center text-xs bg-white/50 dark:bg-gray-800/50 rounded-xl p-3 backdrop-blur-sm">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-blue-600 rounded-full mb-2 shadow-lg"></div>
                        <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">125</span>
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Designed</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mb-2 shadow-lg"></div>
                        <span className="text-yellow-600 dark:text-yellow-400 font-bold text-sm">68</span>
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Reviewed</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mb-2 shadow-lg"></div>
                        <span className="text-green-600 dark:text-green-400 font-bold text-sm">193</span>
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Approved</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Progress Tracker coming soon...
            </div>
          </TabsContent>

          <TabsContent value="queues" className="space-y-6">
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Design Queues coming soon...
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Analytics coming soon...
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  );
}

function NewIdeaForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    platform: "",
    priority: "medium",
    targetAudience: "",
    estimatedReadTime: 5,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          placeholder="Idea title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      <div>
        <Textarea
          placeholder="Idea description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          placeholder="Category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          required
        />
        <Select value={formData.platform} onValueChange={(value) => setFormData({ ...formData, platform: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="personal_blog">Personal Blog</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="substack">Substack</SelectItem>
            <SelectItem value="linkedin">LinkedIn</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Input
          placeholder="Target audience"
          value={formData.targetAudience}
          onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
        />
      </div>
      <Button type="submit" className="w-full">Create Idea</Button>
    </form>
  );
}