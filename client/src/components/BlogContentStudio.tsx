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
  const [selectedTab, setSelectedTab] = useState("workflow");
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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-purple-600 dark:text-purple-400 flex items-center gap-2">
              <FileText className="h-8 w-8" />
              Content Management Suite
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage content across all your brands</p>
          </div>
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

        {/* Brand Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800 flex items-center gap-1 px-3 py-1">
            <span className="text-lg">🌙</span>
            relationONLY Magazine
          </Badge>
          <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 flex items-center gap-1 px-3 py-1">
            <span className="text-lg">🖊️</span>
            Really Obvi Media Lab
          </Badge>
          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 flex items-center gap-1 px-3 py-1">
            <span className="text-lg">✨</span>
            Personal Brand
          </Badge>
          <Badge variant="outline" className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800 flex items-center gap-1 px-3 py-1">
            <span className="text-lg">🏈</span>
            Misc
          </Badge>
        </div>
      </div>

      {/* Mini-Game Block Studio Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-purple-600 dark:text-purple-400">Mini-Game Block Studio</h2>
            <Plus className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-800 dark:bg-gray-200 rounded-full"></div>
              New Block
            </Button>
            <Button variant="outline" size="sm" className="bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2">
              <span className="text-lg">✨</span>
              New Mini-Game
            </Button>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="workflow">Overview</TabsTrigger>
            <TabsTrigger value="progress">Progress Tracker</TabsTrigger>
            <TabsTrigger value="queues">Design Queues</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="workflow" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Administration Block */}
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-600 dark:bg-gray-500 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">Administration</CardTitle>
                    </div>
                    <Eye className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">52 designs/year</p>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>May 31, 2025</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-purple-600 dark:text-purple-400">♈</span>
                      <span>Administration during Aries</span>
                      <span className="text-purple-600 dark:text-purple-400">♉</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>Every Friday (52/year)</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Annual Progress</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">1/52</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Completion Rate</span>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">2%</span>
                    </div>
                    
                    {/* Vertical Progress Bar */}
                    <div className="relative h-32 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-gray-500 to-gray-400 rounded-full transition-all duration-500"
                        style={{ height: '4%' }}
                      ></div>
                      
                      {/* Progress markers */}
                      <div className="absolute inset-0 flex flex-col justify-between items-center py-2">
                        <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-100 rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* Status indicators */}
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mb-1"></div>
                        <span className="text-blue-600 dark:text-blue-400 font-medium">0</span>
                        <span className="text-gray-500 dark:text-gray-400">Designed</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mb-1"></div>
                        <span className="text-yellow-600 dark:text-yellow-400 font-medium">0</span>
                        <span className="text-gray-500 dark:text-gray-400">Reviewed</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mb-1"></div>
                        <span className="text-green-600 dark:text-green-400 font-medium">1</span>
                        <span className="text-gray-500 dark:text-gray-400">Approved</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Other content blocks follow the same pattern */}
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-white" />
                      </div>
                      <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">Word of the Week</CardTitle>
                    </div>
                    <Eye className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">52 designs/year</p>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>June 1, 2025</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-purple-600 dark:text-purple-400">♉</span>
                      <span>Word of the Week during Taurus</span>
                      <span className="text-purple-600 dark:text-purple-400">♊</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>Every Friday (52/year)</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Annual Progress</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">0/52</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Completion Rate</span>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">0%</span>
                    </div>
                    
                    {/* Vertical Progress Bar */}
                    <div className="relative h-32 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-green-500 to-green-400 rounded-full transition-all duration-500"
                        style={{ height: '0%' }}
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
                        <span className="text-blue-600 dark:text-blue-400 font-medium">0</span>
                        <span className="text-gray-500 dark:text-gray-400">Designed</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mb-1"></div>
                        <span className="text-yellow-600 dark:text-yellow-400 font-medium">0</span>
                        <span className="text-gray-500 dark:text-gray-400">Reviewed</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mb-1"></div>
                        <span className="text-green-600 dark:text-green-400 font-medium">0</span>
                        <span className="text-gray-500 dark:text-gray-400">Approved</span>
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