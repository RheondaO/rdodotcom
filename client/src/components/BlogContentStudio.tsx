import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, isToday, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Target,
  Grid3X3,
  List
} from "lucide-react";
import BlogEditor from "./BlogEditor";
import { useAuth } from "../hooks/useAuth";

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
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const queryClient = useQueryClient();
  const { user, isAdmin, isAuthenticated } = useAuth();
  
  // Check if user has admin access for CRUD operations
  const isReadOnly = !isAuthenticated || !isAdmin;

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
      const response = await fetch(`/api/blog/ideas/${ideaId}/create-post`, {
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
      const response = await fetch(`/api/blog/ideas/${ideaId}/generate-ai-content`, {
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
        isReadOnly={isReadOnly}
      />
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-heading font-bold bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
            Blogging Content Studio
          </h3>
          <p className="text-muted-foreground dark:text-gray-300 mt-1">
            Professional content creation and workflow management
          </p>
        </div>
      </div>
      
      {/* Quick Actions Bar */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2">
            <PenTool className="h-5 w-5 text-purple-600" />
            <span 
              className={`text-sm font-medium ${isReadOnly ? 'text-gray-400 cursor-not-allowed' : 'text-purple-600 hover:text-purple-800 cursor-pointer'}`}
              onClick={() => {
                if (!isReadOnly) {
                  setEditingPost(null);
                  setShowEditor(true);
                }
              }}
            >
              Write New Post
            </span>
          </div>
          <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <span 
              className={`text-sm font-medium ${isReadOnly ? 'text-gray-400 cursor-not-allowed' : 'text-yellow-600 hover:text-yellow-800 cursor-pointer'}`}
              onClick={() => {
                if (!isReadOnly) {
                  setNewIdeaDialog(true);
                }
              }}
            >
              Add Idea
            </span>
          </div>
          <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
              Schedule Content
            </span>
          </div>
          <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
          <div className={`flex items-center gap-2 ${isReadOnly ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
            <Zap className={`h-5 w-5 ${isReadOnly ? 'text-gray-400' : 'text-green-600'}`} />
            <span className={`text-sm font-medium ${isReadOnly ? 'text-gray-400' : 'text-green-600 hover:text-green-800'}`}>
              AI Generate
            </span>
          </div>
        </div>

      {/* Hidden Dialogs */}
      <Dialog open={newIdeaDialog} onOpenChange={setNewIdeaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Blog Idea</DialogTitle>
          </DialogHeader>
          <NewIdeaForm onSubmit={createIdeaMutation.mutate} isReadOnly={isReadOnly} />
        </DialogContent>
      </Dialog>

      {/* Content Filter Bar */}
      <div className="flex items-center gap-4 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
          <select 
            value={selectedBrand} 
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-3 py-1 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Content</option>
            <option value="draft">Drafts</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort:</span>
          <select className="px-3 py-1 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500">
            <option value="recent">Most Recent</option>
            <option value="title">Title A-Z</option>
            <option value="status">Status</option>
            <option value="priority">Priority</option>
          </select>
        </div>
        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View:</span>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-md p-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 text-xs rounded flex items-center gap-1 ${
                viewMode === 'grid' 
                  ? 'bg-white dark:bg-gray-700 shadow-sm' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Grid3X3 className="h-3 w-3" />
              Grid
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-xs rounded flex items-center gap-1 ${
                viewMode === 'list' 
                  ? 'bg-white dark:bg-gray-700 shadow-sm' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <List className="h-3 w-3" />
              List
            </button>
          </div>
        </div>
      </div>

      {/* Studio Tabs */}
      <Tabs value={selectedStudioTab} onValueChange={setSelectedStudioTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="posts">Blog Posts</TabsTrigger>
          <TabsTrigger value="ideas">Ideas</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Workflow Status */}
          {workflowStatus && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Ideas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{workflowStatus.ideas.total}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {workflowStatus.ideas.byStatus.active || 0} active
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{workflowStatus.posts.total}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {workflowStatus.posts.byStatus.draft || 0} drafts
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Upcoming</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{workflowStatus.calendar.upcoming.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">scheduled</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Overdue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{workflowStatus.calendar.overdue.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">items</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recent Ideas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Recent Ideas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {blogIdeas && blogIdeas.slice(0, 3).map((idea) => (
                  <div key={idea.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <div className="font-medium">{idea.title}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{idea.category}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(idea.priority || 'medium')}>
                        {idea.priority || 'medium'}
                      </Badge>
                      <Badge className={getStatusColor(idea.status)}>
                        {idea.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Posts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {blogPosts && blogPosts.slice(0, 3).map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <div className="font-medium">{post.title}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{post.platform}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(post.status)}>
                        {post.status}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        disabled={isReadOnly}
                        onClick={() => {
                          if (!isReadOnly) {
                            setEditingPost(post.id);
                            setShowEditor(true);
                          }
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts" className="space-y-6">
          {/* Blog Posts List View */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Blog Posts Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {blogPosts && blogPosts.length > 0 ? (
                  viewMode === 'grid' ? (
                    // Grid View
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {blogPosts.map((post) => (
                        <div key={post.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="flex flex-col h-full">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg line-clamp-2 mb-2">{post.title}</h3>
                                <div className="flex flex-wrap gap-2 mb-2">
                                  <Badge className={getStatusColor(post.status)}>
                                    {post.status}
                                  </Badge>
                                  {post.priority && (
                                    <Badge className={getPriorityColor(post.priority)}>
                                      {post.priority}
                                    </Badge>
                                  )}
                                  {post.isAiGenerated && (
                                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200">
                                      <Zap className="h-3 w-3 mr-1" />
                                      AI
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {post.excerpt && (
                              <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-3 flex-1">{post.excerpt}</p>
                            )}
                            
                            <div className="flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span className="truncate">
                                  {post.publishedDate ? format(new Date(post.publishedDate), 'MMM dd, yyyy') : 
                                   post.scheduledDate ? `Scheduled ${format(new Date(post.scheduledDate), 'MMM dd')}` : 
                                   post.createdAt ? format(new Date(post.createdAt), 'MMM dd, yyyy') : 'No date'}
                                </span>
                              </div>
                              {post.platform && (
                                <div className="flex items-center gap-1">
                                  <BookOpen className="h-4 w-4" />
                                  <span className="truncate">{post.platform}</span>
                                </div>
                              )}
                              {post.wordCount && (
                                <div className="flex items-center gap-1">
                                  <FileText className="h-4 w-4" />
                                  <span>{post.wordCount} words</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  disabled={isReadOnly}
                                  onClick={() => {
                                    if (!isReadOnly) {
                                      setEditingPost(post.id);
                                      setShowEditor(true);
                                    }
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    // Preview functionality
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                              <select
                                value={post.status}
                                onChange={(e) => !isReadOnly && updatePostStatusMutation.mutate({ id: post.id, status: e.target.value })}
                                disabled={isReadOnly}
                                className={`px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 ${isReadOnly ? 'cursor-not-allowed opacity-50' : ''}`}
                              >
                                <option value="draft">Draft</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // List View
                    <div className="space-y-2">
                      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="col-span-4">Title</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-2">Platform</div>
                        <div className="col-span-2">Date</div>
                        <div className="col-span-1">Words</div>
                        <div className="col-span-1">Actions</div>
                      </div>
                      {blogPosts.map((post) => (
                        <div key={post.id} className="grid grid-cols-12 gap-4 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="col-span-4">
                            <div className="flex flex-col">
                              <h3 className="font-semibold text-base line-clamp-1">{post.title}</h3>
                              {post.excerpt && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">{post.excerpt}</p>
                              )}
                              <div className="flex gap-1 mt-2">
                                {post.priority && (
                                  <Badge className={getPriorityColor(post.priority)}>
                                    {post.priority}
                                  </Badge>
                                )}
                                {post.isAiGenerated && (
                                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200">
                                    <Zap className="h-3 w-3 mr-1" />
                                    AI
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <Badge className={getStatusColor(post.status)}>
                              {post.status}
                            </Badge>
                          </div>
                          <div className="col-span-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {post.platform || 'Not specified'}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {post.publishedDate ? format(new Date(post.publishedDate), 'MMM dd, yyyy') : 
                               post.scheduledDate ? format(new Date(post.scheduledDate), 'MMM dd, yyyy') : 
                               post.createdAt ? format(new Date(post.createdAt), 'MMM dd, yyyy') : 'No date'}
                            </span>
                          </div>
                          <div className="col-span-1">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {post.wordCount || 0}
                            </span>
                          </div>
                          <div className="col-span-1">
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                disabled={isReadOnly}
                                onClick={() => {
                                  if (!isReadOnly) {
                                    setEditingPost(post.id);
                                    setShowEditor(true);
                                  }
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  // Preview functionality
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <select
                                value={post.status}
                                onChange={(e) => !isReadOnly && updatePostStatusMutation.mutate({ id: post.id, status: e.target.value })}
                                disabled={isReadOnly}
                                className={`px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 ${isReadOnly ? 'cursor-not-allowed opacity-50' : ''}`}
                              >
                                <option value="draft">Draft</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No blog posts yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first blog post to get started</p>
                    <button
                      onClick={() => {
                        if (!isReadOnly) {
                          setEditingPost(null);
                          setShowEditor(true);
                        }
                      }}
                      disabled={isReadOnly}
                      className={`px-4 py-2 rounded-lg transition-colors ${isReadOnly ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                    >
                      Write Your First Post
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ideas" className="space-y-6">
          {/* Ideas Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Content Ideas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {blogIdeas && blogIdeas.length > 0 ? (
                  <div className="grid gap-4">
                    {blogIdeas.map((idea) => (
                      <div key={idea.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{idea.title}</h3>
                              <Badge className={getStatusColor(idea.status)}>
                                {idea.status}
                              </Badge>
                              {idea.priority && (
                                <Badge className={getPriorityColor(idea.priority)}>
                                  {idea.priority}
                                </Badge>
                              )}
                            </div>
                            
                            {idea.description && (
                              <p className="text-gray-600 dark:text-gray-400 mb-3">{idea.description}</p>
                            )}
                            
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <BookOpen className="h-4 w-4" />
                                {idea.category}
                              </div>
                              {idea.platform && (
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {idea.platform}
                                </div>
                              )}
                              {idea.estimatedReadTime && (
                                <div className="flex items-center gap-1">
                                  <AlertCircle className="h-4 w-4" />
                                  {idea.estimatedReadTime} min read
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => !isReadOnly && createPostFromIdeaMutation.mutate(idea.id)}
                              disabled={isReadOnly}
                              className={`p-2 rounded-lg transition-colors ${isReadOnly ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900'}`}
                            >
                              <PenTool className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => !isReadOnly && generateAIContentMutation.mutate(idea.id)}
                              disabled={isReadOnly}
                              className={`p-2 rounded-lg transition-colors ${isReadOnly ? 'text-gray-400 cursor-not-allowed' : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900'}`}
                            >
                              <Zap className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Lightbulb className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No ideas yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Add your first content idea to get started</p>
                    <button
                      onClick={() => !isReadOnly && setNewIdeaDialog(true)}
                      disabled={isReadOnly}
                      className={`px-4 py-2 rounded-lg transition-colors ${isReadOnly ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-yellow-600 text-white hover:bg-yellow-700'}`}
                    >
                      Add Your First Idea
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Content Calendar
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentCalendarDate(subMonths(currentCalendarDate, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium min-w-[120px] text-center">
                    {format(currentCalendarDate, 'MMMM yyyy')}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentCalendarDate(addMonths(currentCalendarDate, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
              <div className="space-y-4">
                {/* Calendar Header */}
                <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                  <div>Sun</div>
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {(() => {
                    const monthStart = startOfMonth(currentCalendarDate);
                    const monthEnd = endOfMonth(currentCalendarDate);
                    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
                    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
                    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

                    return days.map((day) => {
                      const dayPosts = (blogPosts || []).filter(post => {
                        const postDate = post.scheduledDate || post.publishedDate;
                        return postDate && isSameDay(parseISO(postDate), day);
                      });

                      const isCurrentMonth = isSameMonth(day, currentCalendarDate);
                      const isSelected = selectedDate && isSameDay(day, selectedDate);
                      const isToday_ = isToday(day);

                      return (
                        <div
                          key={day.toISOString()}
                          className={`
                            min-h-[80px] p-2 border rounded-lg cursor-pointer transition-all
                            ${isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}
                            ${isSelected ? 'ring-2 ring-purple-500' : ''}
                            ${isToday_ ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' : 'border-gray-200 dark:border-gray-700'}
                            hover:bg-gray-50 dark:hover:bg-gray-750
                          `}
                          onClick={() => setSelectedDate(day)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`
                              text-sm font-medium
                              ${isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}
                              ${isToday_ ? 'text-purple-600 dark:text-purple-400' : ''}
                            `}>
                              {format(day, 'd')}
                            </span>
                            {isToday_ && (
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            )}
                          </div>

                          {/* Posts for this day */}
                          <div className="space-y-1">
                            {dayPosts.slice(0, 2).map((post) => (
                              <div
                                key={post.id}
                                className={`
                                  px-2 py-1 rounded text-xs truncate
                                  ${post.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                                  ${post.status === 'scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                                  ${post.status === 'draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' : ''}
                                `}
                                title={post.title}
                              >
                                {post.title}
                              </div>
                            ))}
                            {dayPosts.length > 2 && (
                              <div className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
                                +{dayPosts.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Selected Date Details */}
                {selectedDate && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const dayPosts = (blogPosts || []).filter(post => {
                          const postDate = post.scheduledDate || post.publishedDate;
                          return postDate && isSameDay(parseISO(postDate), selectedDate);
                        });

                        if (dayPosts.length === 0) {
                          return (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                              <p>No content scheduled for this date</p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-3"
                                disabled={isReadOnly}
                                onClick={() => !isReadOnly && setShowEditor(true)}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Schedule Content
                              </Button>
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-4">
                            {dayPosts.map((post) => (
                              <div
                                key={post.id}
                                className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                              >
                                <div className="flex-shrink-0 mt-1">
                                  {post.status === 'published' && (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                  )}
                                  {post.status === 'scheduled' && (
                                    <Clock className="h-5 w-5 text-blue-500" />
                                  )}
                                  {post.status === 'draft' && (
                                    <FileText className="h-5 w-5 text-gray-400" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                      {post.title}
                                    </h4>
                                    <Badge variant="secondary" className="text-xs">
                                      {post.platform}
                                    </Badge>
                                  </div>
                                  {post.excerpt && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                      {post.excerpt}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {post.scheduledDate ? 
                                        format(parseISO(post.scheduledDate), 'h:mm a') : 
                                        'No time set'
                                      }
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Target className="h-3 w-3" />
                                      {post.priority || 'medium'}
                                    </div>
                                    {post.wordCount && (
                                      <div className="flex items-center gap-1">
                                        <FileText className="h-3 w-3" />
                                        {post.wordCount} words
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingPost(post.id);
                                      setShowEditor(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Content Analytics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Total Posts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{blogPosts?.length || 0}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {blogPosts?.filter(p => p.status === 'published').length || 0} published
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Active Ideas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{blogIdeas?.length || 0}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {blogIdeas?.filter(i => i.status === 'active').length || 0} active
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {blogPosts?.filter(p => p.publishedDate && 
                    new Date(p.publishedDate).getMonth() === new Date().getMonth()
                  ).length || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">posts published</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  AI Generated
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {blogPosts?.filter(p => p.isAiGenerated).length || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">posts with AI</div>
              </CardContent>
            </Card>
          </div>

          {/* Content Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Content Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">Average Word Count</h4>
                  <div className="text-2xl font-bold text-blue-600">
                    {blogPosts && blogPosts.length > 0 ? 
                      Math.round(blogPosts.reduce((sum, post) => sum + (post.wordCount || 0), 0) / blogPosts.length) : 0
                    }
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">words per post</div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">Average Reading Time</h4>
                  <div className="text-2xl font-bold text-green-600">
                    {blogPosts && blogPosts.length > 0 ? 
                      Math.round(blogPosts.reduce((sum, post) => sum + (post.readingTime || 0), 0) / blogPosts.length) : 0
                    }
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">minutes per post</div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">Publication Rate</h4>
                  <div className="text-2xl font-bold text-purple-600">
                    {blogPosts && blogPosts.length > 0 ? 
                      Math.round((blogPosts.filter(p => p.status === 'published').length / blogPosts.length) * 100) : 0
                    }%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">completion rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Categories and Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Popular Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {blogIdeas && blogIdeas.length > 0 ? (
                    Object.entries(
                      blogIdeas.reduce((acc, idea) => {
                        acc[idea.category] = (acc[idea.category] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    )
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span className="font-medium capitalize">{category}</span>
                        <Badge>{count}</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                      No categories yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Platform Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {blogPosts && blogPosts.length > 0 ? (
                    Object.entries(
                      blogPosts.reduce((acc, post) => {
                        acc[post.platform] = (acc[post.platform] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    )
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([platform, count]) => (
                      <div key={platform} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span className="font-medium capitalize">{platform}</span>
                        <Badge>{count}</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                      No platforms yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Content Status Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['draft', 'scheduled', 'published', 'archived'].map(status => (
                  <div key={status} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold mb-2">
                      {blogPosts?.filter(p => p.status === status).length || 0}
                    </div>
                    <div className="text-sm font-medium capitalize text-gray-600 dark:text-gray-400">
                      {status}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NewIdeaForm({ onSubmit, isReadOnly = false }: { onSubmit: (data: any) => void; isReadOnly?: boolean }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("medium");
  const [platform, setPlatform] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      category,
      priority,
      platform,
      status: "active"
    });
    setTitle("");
    setDescription("");
    setCategory("");
    setPriority("medium");
    setPlatform("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lifestyle">Lifestyle</SelectItem>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="platform">Platform</Label>
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger>
            <SelectValue placeholder="Select platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="blog">Blog</SelectItem>
            <SelectItem value="social">Social Media</SelectItem>
            <SelectItem value="newsletter">Newsletter</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full" disabled={isReadOnly}>
        Create Idea
      </Button>
    </form>
  );
}