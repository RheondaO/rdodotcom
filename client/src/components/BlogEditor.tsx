import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { 
  Save, 
  Eye, 
  Send, 
  Calendar, 
  Tag, 
  Image, 
  Link, 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Plus,
  FileText,
  Settings,
  Clock,
  Target,
  Zap,
  BookOpen,
  PenTool,
  Users,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
  Archive
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

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

interface BlogEditorProps {
  postId?: number;
  onClose?: () => void;
}

export default function BlogEditor({ postId, onClose }: BlogEditorProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [post, setPost] = useState<Partial<BlogPost>>({
    title: "",
    content: "",
    excerpt: "",
    status: "draft",
    type: "blog",
    platform: "personal_blog",
    priority: "medium",
    tags: "[]",
    seoTitle: "",
    seoDescription: "",
    featuredImage: "",
    isAiGenerated: false
  });
  
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);

  // Fetch existing post if editing
  const { data: existingPost, isLoading } = useQuery<BlogPost>({
    queryKey: ["/api/blog/posts", postId],
    enabled: !!postId,
  });

  // Load existing post data
  useEffect(() => {
    if (existingPost) {
      setPost(existingPost);
    }
  }, [existingPost]);

  // Calculate word count and reading time
  useEffect(() => {
    const content = post.content || "";
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const readTime = Math.ceil(words / 200); // Average reading speed
    
    setWordCount(words);
    setReadingTime(readTime);
    
    // Update post state
    setPost(prev => ({
      ...prev,
      wordCount: words,
      readingTime: readTime
    }));
  }, [post.content]);

  // Auto-save mutation
  const autoSaveMutation = useMutation({
    mutationFn: async (data: Partial<BlogPost>) => {
      const url = postId ? `/api/blog/posts/${postId}` : "/api/blog/posts";
      const method = postId ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      setLastSaved(new Date());
      queryClient.invalidateQueries({ queryKey: ["/api/blog/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog/workflow-status"] });
    },
  });

  // Manual save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<BlogPost>) => {
      const url = postId ? `/api/blog/posts/${postId}` : "/api/blog/posts";
      const method = postId ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Post saved successfully",
        description: "Your blog post has been saved.",
      });
      setLastSaved(new Date());
      queryClient.invalidateQueries({ queryKey: ["/api/blog/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog/workflow-status"] });
    },
    onError: () => {
      toast({
        title: "Error saving post",
        description: "There was an error saving your post. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && post.title && post.content) {
      const timer = setTimeout(() => {
        autoSaveMutation.mutate(post);
      }, 3000); // Auto-save after 3 seconds of inactivity
      
      return () => clearTimeout(timer);
    }
  }, [post, autoSave]);

  const handleSave = () => {
    saveMutation.mutate(post);
  };

  const handlePublish = () => {
    saveMutation.mutate({
      ...post,
      status: "published",
      publishedDate: format(new Date(), "yyyy-MM-dd")
    });
  };

  const handleSchedule = () => {
    saveMutation.mutate({
      ...post,
      status: "scheduled"
    });
  };

  const insertFormatting = (before: string, after: string = "") => {
    const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    const newText = before + selectedText + after;
    const newContent = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
    
    setPost(prev => ({ ...prev, content: newContent }));
    
    // Set cursor position after formatting
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800";
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "published": return "bg-green-100 text-green-800";
      case "archived": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-800">
                {postId ? "Edit Post" : "New Blog Post"}
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(post.status || "draft")}>
                {post.status || "draft"}
              </Badge>
              <Badge className={getPriorityColor(post.priority || "medium")}>
                {post.priority || "medium"}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {lastSaved && (
              <span className="text-sm text-gray-500">
                Last saved: {format(lastSaved, "HH:mm:ss")}
              </span>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="h-4 w-4" />
              {showPreview ? "Edit" : "Preview"}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={saveMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSchedule}
              disabled={saveMutation.isPending}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
            
            <Button
              size="sm"
              onClick={handlePublish}
              disabled={saveMutation.isPending}
            >
              <Send className="h-4 w-4 mr-2" />
              Publish
            </Button>
            
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <XCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main Editor */}
        <div className={`flex-1 ${showSettings ? 'border-r' : ''}`}>
          {!showPreview ? (
            <div className="p-6 space-y-6">
              {/* Title */}
              <div>
                <Input
                  placeholder="Post title..."
                  value={post.title || ""}
                  onChange={(e) => setPost(prev => ({ ...prev, title: e.target.value }))}
                  className="text-2xl font-bold border-none px-0 focus:ring-0 placeholder:text-gray-400"
                />
              </div>

              {/* Excerpt */}
              <div>
                <Textarea
                  placeholder="Write a brief excerpt..."
                  value={post.excerpt || ""}
                  onChange={(e) => setPost(prev => ({ ...prev, excerpt: e.target.value }))}
                  className="resize-none border-none px-0 focus:ring-0 placeholder:text-gray-400"
                  rows={2}
                />
              </div>

              <Separator />

              {/* Formatting Toolbar */}
              <div className="border-b pb-4">
                <div className="flex items-center space-x-2 flex-wrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertFormatting("# ", "")}
                    title="Heading 1"
                  >
                    <Heading1 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertFormatting("## ", "")}
                    title="Heading 2"
                  >
                    <Heading2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertFormatting("### ", "")}
                    title="Heading 3"
                  >
                    <Heading3 className="h-4 w-4" />
                  </Button>
                  
                  <Separator orientation="vertical" className="h-6" />
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertFormatting("**", "**")}
                    title="Bold"
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertFormatting("*", "*")}
                    title="Italic"
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertFormatting("`", "`")}
                    title="Code"
                  >
                    <Code className="h-4 w-4" />
                  </Button>
                  
                  <Separator orientation="vertical" className="h-6" />
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertFormatting("- ", "")}
                    title="Bullet List"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertFormatting("1. ", "")}
                    title="Numbered List"
                  >
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertFormatting("> ", "")}
                    title="Quote"
                  >
                    <Quote className="h-4 w-4" />
                  </Button>
                  
                  <Separator orientation="vertical" className="h-6" />
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertFormatting("[Link text](", ")")}
                    title="Link"
                  >
                    <Link className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertFormatting("![Alt text](", ")")}
                    title="Image"
                  >
                    <Image className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Content Editor */}
              <div className="relative">
                <Textarea
                  name="content"
                  placeholder="Start writing your post..."
                  value={post.content || ""}
                  onChange={(e) => setPost(prev => ({ ...prev, content: e.target.value }))}
                  className="min-h-96 border-none px-0 focus:ring-0 placeholder:text-gray-400 resize-none"
                  style={{ fontSize: '16px', lineHeight: '1.6' }}
                />
              </div>

              {/* Status Bar */}
              <div className="flex items-center justify-between pt-4 border-t text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    {wordCount} words
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {readingTime} min read
                  </span>
                  <span className="flex items-center">
                    <Target className="h-4 w-4 mr-1" />
                    {post.platform}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Label className="text-xs">Auto-save</Label>
                  <input
                    type="checkbox"
                    checked={autoSave}
                    onChange={(e) => setAutoSave(e.target.checked)}
                    className="rounded"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Preview Mode */
            <div className="p-6 prose prose-lg max-w-none">
              <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
              {post.excerpt && (
                <p className="text-lg text-gray-600 mb-6 italic">{post.excerpt}</p>
              )}
              <div className="whitespace-pre-wrap">
                {post.content?.split('\n').map((paragraph, index) => {
                  // Basic markdown parsing for preview
                  let content = paragraph;
                  
                  // Headers
                  if (content.startsWith('# ')) {
                    return <h1 key={index} className="text-2xl font-bold mt-6 mb-3">{content.substring(2)}</h1>;
                  }
                  if (content.startsWith('## ')) {
                    return <h2 key={index} className="text-xl font-bold mt-5 mb-2">{content.substring(3)}</h2>;
                  }
                  if (content.startsWith('### ')) {
                    return <h3 key={index} className="text-lg font-bold mt-4 mb-2">{content.substring(4)}</h3>;
                  }
                  
                  // Bold and italic
                  content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                  content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
                  content = content.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>');
                  
                  // Lists
                  if (content.startsWith('- ')) {
                    return <li key={index} className="ml-4">{content.substring(2)}</li>;
                  }
                  if (content.match(/^\d+\. /)) {
                    return <li key={index} className="ml-4">{content.replace(/^\d+\. /, '')}</li>;
                  }
                  
                  // Quote
                  if (content.startsWith('> ')) {
                    return <blockquote key={index} className="border-l-4 border-gray-300 pl-4 italic">{content.substring(2)}</blockquote>;
                  }
                  
                  return content ? <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: content }} /> : <br key={index} />;
                })}
              </div>
            </div>
          )}
        </div>

        {/* Settings Sidebar */}
        {showSettings && (
          <div className="w-80 bg-gray-50 p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Post Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={post.status}
                    onValueChange={(value) => setPost(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
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

                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <Select
                    value={post.platform}
                    onValueChange={(value) => setPost(prev => ({ ...prev, platform: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={post.priority}
                    onValueChange={(value) => setPost(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="scheduledDate">Scheduled Date</Label>
                  <Input
                    type="date"
                    value={post.scheduledDate || ""}
                    onChange={(e) => setPost(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    placeholder="productivity, tips, guide"
                    value={post.tags ? JSON.parse(post.tags).join(', ') : ""}
                    onChange={(e) => setPost(prev => ({ 
                      ...prev, 
                      tags: JSON.stringify(e.target.value.split(',').map(t => t.trim()).filter(t => t))
                    }))}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="seoTitle">SEO Title</Label>
                  <Input
                    placeholder="SEO-optimized title"
                    value={post.seoTitle || ""}
                    onChange={(e) => setPost(prev => ({ ...prev, seoTitle: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="seoDescription">SEO Description</Label>
                  <Textarea
                    placeholder="Meta description for search engines"
                    value={post.seoDescription || ""}
                    onChange={(e) => setPost(prev => ({ ...prev, seoDescription: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="featuredImage">Featured Image URL</Label>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={post.featuredImage || ""}
                    onChange={(e) => setPost(prev => ({ ...prev, featuredImage: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Statistics</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Words</span>
                  <span className="font-medium">{wordCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Reading Time</span>
                  <span className="font-medium">{readingTime} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Characters</span>
                  <span className="font-medium">{post.content?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">AI Generated</span>
                  <input
                    type="checkbox"
                    checked={post.isAiGenerated || false}
                    onChange={(e) => setPost(prev => ({ ...prev, isAiGenerated: e.target.checked }))}
                    className="rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}