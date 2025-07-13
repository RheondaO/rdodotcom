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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Blogging Content Studio</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Professional content creation and workflow management</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={newIdeaDialog} onOpenChange={setNewIdeaDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
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

      {/* Brand Selection */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["relationONLY", "reallyObvi", "personal", "misc"].map((brand) => (
          <button
            key={brand}
            onClick={() => setSelectedBrand(brand)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedBrand === brand
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {brand === "relationONLY" && "🌙 relationONLY Magazine"}
            {brand === "reallyObvi" && "🖊️ Really Obvi Media Lab"}
            {brand === "personal" && "✨ Personal Brand"}
            {brand === "misc" && "🏈 Misc"}
          </button>
        ))}
      </div>

      {/* Studio Tabs */}
      <Tabs value={selectedStudioTab} onValueChange={setSelectedStudioTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="queues">Queues</TabsTrigger>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Progress Tracker</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                Progress tracking coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queues" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Design Queues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                Design queues coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                Analytics coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NewIdeaForm({ onSubmit }: { onSubmit: (data: any) => void }) {
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
      <Button type="submit" className="w-full">
        Create Idea
      </Button>
    </form>
  );
}