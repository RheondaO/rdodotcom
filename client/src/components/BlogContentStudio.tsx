import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, Eye, Edit, Trash2, Plus, Lightbulb, BookOpen, FileText, CheckCircle, AlertCircle, Calendar as CalendarIcon, PenTool, Zap } from "lucide-react";
import { format } from "date-fns";
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
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("workflow");
  const [newPostDialog, setNewPostDialog] = useState(false);
  const [newIdeaDialog, setNewIdeaDialog] = useState(false);
  const [newCalendarDialog, setNewCalendarDialog] = useState(false);
  const [editingPost, setEditingPost] = useState<number | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  
  // Filters and sorting
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch workflow status
  const { data: workflowStatus } = useQuery<WorkflowStatus>({
    queryKey: ["/api/blog/workflow-status"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch blog posts
  const { data: blogPosts } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog/posts"],
  });

  // Fetch blog ideas
  const { data: blogIdeas } = useQuery<BlogIdea[]>({
    queryKey: ["/api/blog/ideas"],
  });

  // Fetch calendar events
  const { data: calendarEvents } = useQuery<BlogCalendar[]>({
    queryKey: ["/api/blog/calendar"],
  });

  // Mutations
  const createPostMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/blog/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog/workflow-status"] });
      setNewPostDialog(false);
    },
  });

  const createIdeaMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/blog/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog/ideas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog/workflow-status"] });
      setNewIdeaDialog(false);
    },
  });

  const updatePostStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await fetch(`/api/blog/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog/workflow-status"] });
    },
  });

  const generateAIContentMutation = useMutation({
    mutationFn: async (ideaId: number) => {
      const response = await fetch(`/api/blog/ideas/${ideaId}/generate-ai-content`, {
        method: "POST",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog/ideas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog/workflow-status"] });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "idea":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-orange-100 text-orange-800";
      case "scheduled":
        return "bg-purple-100 text-purple-800";
      case "published":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getWorkflowProgress = () => {
    if (!workflowStatus) return 0;
    const total = workflowStatus.workflow.ideaStage + workflowStatus.workflow.research + 
                  workflowStatus.workflow.drafting + workflowStatus.workflow.review + 
                  workflowStatus.workflow.published;
    return total > 0 ? (workflowStatus.workflow.published / total) * 100 : 0;
  };

  // Filter and sort posts
  const filteredAndSortedPosts = blogPosts?.filter(post => {
    if (statusFilter !== "all" && post.status !== statusFilter) return false;
    if (platformFilter !== "all" && post.platform !== platformFilter) return false;
    if (priorityFilter !== "all" && post.priority !== priorityFilter) return false;
    if (searchQuery && !post.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    let aValue = a[sortBy as keyof BlogPost];
    let bValue = b[sortBy as keyof BlogPost];
    
    if (sortBy === "updatedAt" || sortBy === "createdAt") {
      aValue = new Date(aValue as string).getTime();
      bValue = new Date(bValue as string).getTime();
    }
    
    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Filter and sort ideas
  const filteredAndSortedIdeas = blogIdeas?.filter(idea => {
    if (statusFilter !== "all" && idea.status !== statusFilter) return false;
    if (platformFilter !== "all" && idea.platform !== platformFilter) return false;
    if (priorityFilter !== "all" && idea.priority !== priorityFilter) return false;
    if (searchQuery && !idea.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !idea.description?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    let aValue = a[sortBy as keyof BlogIdea];
    let bValue = b[sortBy as keyof BlogIdea];
    
    if (sortBy === "updatedAt" || sortBy === "createdAt") {
      aValue = new Date(aValue as string).getTime();
      bValue = new Date(bValue as string).getTime();
    }
    
    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Blogging Content Studio</h1>
        <div className="flex gap-2">
          <Dialog open={newIdeaDialog} onOpenChange={setNewIdeaDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Lightbulb className="h-4 w-4 mr-2" />
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
            size="sm"
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

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="ideas">Ideas</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="workflow" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Ideas Stage */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">Ideas</CardTitle>
                  </div>
                  <Eye className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">52 designs/year</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Annual Progress</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{workflowStatus?.workflow.ideaStage || 0}/52</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Completion Rate</span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{Math.round(((workflowStatus?.workflow.ideaStage || 0) / 52) * 100)}%</span>
                  </div>
                  
                  {/* Vertical Progress Bar */}
                  <div className="relative h-32 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                      style={{ height: `${Math.min(((workflowStatus?.workflow.ideaStage || 0) / 52) * 100, 100)}%` }}
                    ></div>
                    
                    {/* Progress markers */}
                    <div className="absolute inset-0 flex flex-col justify-between items-center py-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                      <div className="w-2 h-2 bg-blue-200 rounded-full"></div>
                      <div className="w-2 h-2 bg-blue-100 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Status indicators */}
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mb-1"></div>
                      <span className="text-blue-600 dark:text-blue-400 font-medium">{Math.floor((workflowStatus?.workflow.ideaStage || 0) * 0.2)}</span>
                      <span className="text-gray-500 dark:text-gray-400">Designed</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mb-1"></div>
                      <span className="text-yellow-600 dark:text-yellow-400 font-medium">{Math.floor((workflowStatus?.workflow.ideaStage || 0) * 0.3)}</span>
                      <span className="text-gray-500 dark:text-gray-400">Reviewed</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mb-1"></div>
                      <span className="text-green-600 dark:text-green-400 font-medium">{Math.floor((workflowStatus?.workflow.ideaStage || 0) * 0.5)}</span>
                      <span className="text-gray-500 dark:text-gray-400">Approved</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Research Stage */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">Research</CardTitle>
                  </div>
                  <Eye className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">52 designs/year</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Annual Progress</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{workflowStatus?.workflow.research || 0}/52</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Completion Rate</span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{Math.round(((workflowStatus?.workflow.research || 0) / 52) * 100)}%</span>
                  </div>
                  
                  {/* Vertical Progress Bar */}
                  <div className="relative h-32 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-full transition-all duration-500"
                      style={{ height: `${Math.min(((workflowStatus?.workflow.research || 0) / 52) * 100, 100)}%` }}
                    ></div>
                    
                    {/* Progress markers */}
                    <div className="absolute inset-0 flex flex-col justify-between items-center py-2">
                      <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
                      <div className="w-2 h-2 bg-yellow-200 rounded-full"></div>
                      <div className="w-2 h-2 bg-yellow-100 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Status indicators */}
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mb-1"></div>
                      <span className="text-blue-600 dark:text-blue-400 font-medium">{Math.floor((workflowStatus?.workflow.research || 0) * 0.2)}</span>
                      <span className="text-gray-500 dark:text-gray-400">Designed</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mb-1"></div>
                      <span className="text-yellow-600 dark:text-yellow-400 font-medium">{Math.floor((workflowStatus?.workflow.research || 0) * 0.3)}</span>
                      <span className="text-gray-500 dark:text-gray-400">Reviewed</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mb-1"></div>
                      <span className="text-green-600 dark:text-green-400 font-medium">{Math.floor((workflowStatus?.workflow.research || 0) * 0.5)}</span>
                      <span className="text-gray-500 dark:text-gray-400">Approved</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Drafting Stage */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Edit className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">Drafting</CardTitle>
                  </div>
                  <Eye className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">52 designs/year</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Annual Progress</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{workflowStatus?.workflow.drafting || 0}/52</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Completion Rate</span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{Math.round(((workflowStatus?.workflow.drafting || 0) / 52) * 100)}%</span>
                  </div>
                  
                  {/* Vertical Progress Bar */}
                  <div className="relative h-32 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-full transition-all duration-500"
                      style={{ height: `${Math.min(((workflowStatus?.workflow.drafting || 0) / 52) * 100, 100)}%` }}
                    ></div>
                    
                    {/* Progress markers */}
                    <div className="absolute inset-0 flex flex-col justify-between items-center py-2">
                      <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-orange-300 rounded-full"></div>
                      <div className="w-2 h-2 bg-orange-200 rounded-full"></div>
                      <div className="w-2 h-2 bg-orange-100 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Status indicators */}
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mb-1"></div>
                      <span className="text-blue-600 dark:text-blue-400 font-medium">{Math.floor((workflowStatus?.workflow.drafting || 0) * 0.2)}</span>
                      <span className="text-gray-500 dark:text-gray-400">Designed</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mb-1"></div>
                      <span className="text-yellow-600 dark:text-yellow-400 font-medium">{Math.floor((workflowStatus?.workflow.drafting || 0) * 0.3)}</span>
                      <span className="text-gray-500 dark:text-gray-400">Reviewed</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mb-1"></div>
                      <span className="text-green-600 dark:text-green-400 font-medium">{Math.floor((workflowStatus?.workflow.drafting || 0) * 0.5)}</span>
                      <span className="text-gray-500 dark:text-gray-400">Approved</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Review Stage */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">Review</CardTitle>
                  </div>
                  <Eye className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">52 designs/year</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Annual Progress</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{workflowStatus?.workflow.review || 0}/52</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Completion Rate</span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{Math.round(((workflowStatus?.workflow.review || 0) / 52) * 100)}%</span>
                  </div>
                  
                  {/* Vertical Progress Bar */}
                  <div className="relative h-32 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-full transition-all duration-500"
                      style={{ height: `${Math.min(((workflowStatus?.workflow.review || 0) / 52) * 100, 100)}%` }}
                    ></div>
                    
                    {/* Progress markers */}
                    <div className="absolute inset-0 flex flex-col justify-between items-center py-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
                      <div className="w-2 h-2 bg-purple-200 rounded-full"></div>
                      <div className="w-2 h-2 bg-purple-100 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Status indicators */}
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mb-1"></div>
                      <span className="text-blue-600 dark:text-blue-400 font-medium">{Math.floor((workflowStatus?.workflow.review || 0) * 0.2)}</span>
                      <span className="text-gray-500 dark:text-gray-400">Designed</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mb-1"></div>
                      <span className="text-yellow-600 dark:text-yellow-400 font-medium">{Math.floor((workflowStatus?.workflow.review || 0) * 0.3)}</span>
                      <span className="text-gray-500 dark:text-gray-400">Reviewed</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mb-1"></div>
                      <span className="text-green-600 dark:text-green-400 font-medium">{Math.floor((workflowStatus?.workflow.review || 0) * 0.5)}</span>
                      <span className="text-gray-500 dark:text-gray-400">Approved</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Published Stage */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">Published</CardTitle>
                  </div>
                  <Eye className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">52 designs/year</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Annual Progress</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{workflowStatus?.workflow.published || 0}/52</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Completion Rate</span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{Math.round(((workflowStatus?.workflow.published || 0) / 52) * 100)}%</span>
                  </div>
                  
                  {/* Vertical Progress Bar */}
                  <div className="relative h-32 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-green-500 to-green-400 rounded-full transition-all duration-500"
                      style={{ height: `${Math.min(((workflowStatus?.workflow.published || 0) / 52) * 100, 100)}%` }}
                    ></div>
                    
                    {/* Progress markers */}
                    <div className="absolute inset-0 flex flex-col justify-between items-center py-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                      <div className="w-2 h-2 bg-green-200 rounded-full"></div>
                      <div className="w-2 h-2 bg-green-100 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Status indicators */}
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mb-1"></div>
                      <span className="text-blue-600 dark:text-blue-400 font-medium">{Math.floor((workflowStatus?.workflow.published || 0) * 0.2)}</span>
                      <span className="text-gray-500 dark:text-gray-400">Designed</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mb-1"></div>
                      <span className="text-yellow-600 dark:text-yellow-400 font-medium">{Math.floor((workflowStatus?.workflow.published || 0) * 0.3)}</span>
                      <span className="text-gray-500 dark:text-gray-400">Reviewed</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mb-1"></div>
                      <span className="text-green-600 dark:text-green-400 font-medium">{Math.floor((workflowStatus?.workflow.published || 0) * 0.5)}</span>
                      <span className="text-gray-500 dark:text-gray-400">Approved</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Content Pipeline Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{Math.round(getWorkflowProgress())}%</span>
                </div>
                <Progress value={getWorkflowProgress()} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {workflowStatus?.workflow.published || 0} of {(workflowStatus?.workflow.ideaStage || 0) + (workflowStatus?.workflow.research || 0) + (workflowStatus?.workflow.drafting || 0) + (workflowStatus?.workflow.review || 0) + (workflowStatus?.workflow.published || 0)} pieces published
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Upcoming Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workflowStatus?.calendar.upcoming.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {event.platform} • {format(new Date(event.date), "MMM d, yyyy")}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {event.type}
                      </Badge>
                    </div>
                  )) || <p className="text-sm text-muted-foreground">No upcoming deadlines</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                  Overdue Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workflowStatus?.calendar.overdue.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {event.platform} • {format(new Date(event.date), "MMM d, yyyy")}
                        </p>
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        Overdue
                      </Badge>
                    </div>
                  )) || <p className="text-sm text-muted-foreground">No overdue tasks</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          <div className="grid gap-4">
            {blogPosts?.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{post.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{post.excerpt}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(post.status)}>
                        {post.status}
                      </Badge>
                      <Badge className={getPriorityColor(post.priority || "medium")}>
                        {post.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{post.platform}</span>
                      <span>{post.wordCount} words</span>
                      <span>{post.readingTime} min read</span>
                      {post.isAiGenerated && <span className="text-blue-600">AI Generated</span>}
                    </div>
                    <div className="flex gap-2">
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
                      <Select
                        value={post.status}
                        onValueChange={(status) => updatePostStatusMutation.mutate({ id: post.id, status })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ideas" className="space-y-4">
          <div className="grid gap-4">
            {blogIdeas?.map((idea) => (
              <Card key={idea.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{idea.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{idea.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(idea.status)}>
                        {idea.status}
                      </Badge>
                      <Badge className={getPriorityColor(idea.priority || "medium")}>
                        {idea.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{idea.platform}</span>
                      <span>{idea.category}</span>
                      <span>{idea.estimatedReadTime} min read</span>
                      <span>{idea.targetAudience}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => generateAIContentMutation.mutate(idea.id)}
                        disabled={generateAIContentMutation.isPending}
                      >
                        Generate AI Content
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <div className="grid gap-4">
            {calendarEvents?.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{event.notes}</p>
                    </div>
                    <Badge className={getStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{event.platform}</span>
                      <span>{event.type}</span>
                      <span>{format(new Date(event.date), "MMM d, yyyy")}</span>
                      {event.time && <span>{event.time}</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle>Filters & Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <div>
                  <Input
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="idea">Ideas</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={platformFilter} onValueChange={setPlatformFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      <SelectItem value="personal_blog">Personal Blog</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="substack">Substack</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="hashnode">Hashnode</SelectItem>
                      <SelectItem value="dev_to">Dev.to</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="updatedAt">Updated</SelectItem>
                      <SelectItem value="createdAt">Created</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="platform">Platform</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as "asc" | "desc")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Newest First</SelectItem>
                      <SelectItem value="asc">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posts Table */}
          <Card>
            <CardHeader>
              <CardTitle>Blog Posts ({filteredAndSortedPosts?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Title</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Platform</th>
                      <th className="text-left p-3 font-medium">Priority</th>
                      <th className="text-left p-3 font-medium">Words</th>
                      <th className="text-left p-3 font-medium">Updated</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedPosts?.map((post) => (
                      <tr key={post.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{post.title}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                              {post.excerpt}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge className={getStatusColor(post.status)}>
                            {post.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <span className="text-sm">{post.platform}</span>
                        </td>
                        <td className="p-3">
                          <Badge className={getPriorityColor(post.priority || "medium")}>
                            {post.priority}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <span className="text-sm">{post.wordCount || 0}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-sm">
                            {post.updatedAt ? format(new Date(post.updatedAt), "MMM d, yyyy") : "N/A"}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
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
                            <Select
                              value={post.status}
                              onValueChange={(status) => updatePostStatusMutation.mutate({ id: post.id, status })}
                            >
                              <SelectTrigger className="w-28">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!filteredAndSortedPosts || filteredAndSortedPosts.length === 0) && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No posts found matching your criteria.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ideas Table */}
          <Card>
            <CardHeader>
              <CardTitle>Blog Ideas ({filteredAndSortedIdeas?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Title</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Platform</th>
                      <th className="text-left p-3 font-medium">Priority</th>
                      <th className="text-left p-3 font-medium">Category</th>
                      <th className="text-left p-3 font-medium">Updated</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedIdeas?.map((idea) => (
                      <tr key={idea.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{idea.title}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                              {idea.description}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge className={getStatusColor(idea.status)}>
                            {idea.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <span className="text-sm">{idea.platform}</span>
                        </td>
                        <td className="p-3">
                          <Badge className={getPriorityColor(idea.priority || "medium")}>
                            {idea.priority}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <span className="text-sm">{idea.category}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-sm">
                            {idea.updatedAt ? format(new Date(idea.updatedAt), "MMM d, yyyy") : "N/A"}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => generateAIContentMutation.mutate(idea.id)}
                              disabled={generateAIContentMutation.isPending}
                            >
                              <Zap className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!filteredAndSortedIdeas || filteredAndSortedIdeas.length === 0) && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No ideas found matching your criteria.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NewPostForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    platform: "",
    priority: "medium",
    type: "blog",
    status: "draft",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          placeholder="Post title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      <div>
        <Textarea
          placeholder="Brief excerpt"
          value={formData.excerpt}
          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
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
        <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full">Create Post</Button>
    </form>
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