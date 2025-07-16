import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Calendar, 
  Target,
  FileText,
  Zap,
  Globe,
  Tag,
  BookOpen,
  Clock,
  Share2,
  ChevronDown,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  List,
  ListOrdered,
  Quote,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Heading1,
  Heading2,
  Heading3
} from 'lucide-react';

interface BlogPost {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  type: string;
  platform: string;
  tags?: string;
  publishedDate?: string;
  scheduledDate?: string;
  priority: 'low' | 'medium' | 'high';
  wordCount?: number;
  readingTime?: number;
  seoTitle?: string;
  seoDescription?: string;
  isAiGenerated?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BlogEditorProps {
  postId?: number;
  onClose: () => void;
  isReadOnly?: boolean;
}

const BlogEditor: React.FC<BlogEditorProps> = ({ postId, onClose, isReadOnly = false }) => {
  const [activeTab, setActiveTab] = useState("content");
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    status: 'draft',
    type: 'blog',
    platform: 'personal_blog',
    tags: '',
    publishedDate: '',
    scheduledDate: '',
    priority: 'medium',
    seoTitle: '',
    seoDescription: '',
    isAiGenerated: false
  });

  const queryClient = useQueryClient();
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null);

  // Rich text formatting functions
  const insertFormatting = (prefix: string, suffix: string = '') => {
    if (!textareaRef) return;
    
    const start = textareaRef.selectionStart;
    const end = textareaRef.selectionEnd;
    const selectedText = textareaRef.value.substring(start, end);
    const beforeText = textareaRef.value.substring(0, start);
    const afterText = textareaRef.value.substring(end);
    
    const newText = beforeText + prefix + selectedText + suffix + afterText;
    
    setFormData(prev => ({ ...prev, content: newText }));
    
    // Set cursor position after formatting
    setTimeout(() => {
      textareaRef.focus();
      textareaRef.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  const formatText = (type: string) => {
    switch (type) {
      case 'bold':
        insertFormatting('**', '**');
        break;
      case 'italic':
        insertFormatting('*', '*');
        break;
      case 'underline':
        insertFormatting('<u>', '</u>');
        break;
      case 'strikethrough':
        insertFormatting('~~', '~~');
        break;
      case 'code':
        insertFormatting('`', '`');
        break;
      case 'link':
        insertFormatting('[', '](url)');
        break;
      case 'h1':
        insertFormatting('# ');
        break;
      case 'h2':
        insertFormatting('## ');
        break;
      case 'h3':
        insertFormatting('### ');
        break;
      case 'quote':
        insertFormatting('> ');
        break;
      case 'unordered-list':
        insertFormatting('- ');
        break;
      case 'ordered-list':
        insertFormatting('1. ');
        break;
      default:
        break;
    }
  };

  // Fetch existing post if editing
  const { data: post, isLoading } = useQuery<BlogPost>({
    queryKey: ['/api/blog/posts', postId],
    enabled: !!postId,
  });

  // Update form when post data is loaded
  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        content: post.content || '',
        excerpt: post.excerpt || '',
        status: post.status,
        type: post.type,
        platform: post.platform,
        tags: post.tags || '',
        publishedDate: post.publishedDate || '',
        scheduledDate: post.scheduledDate || '',
        priority: post.priority,
        seoTitle: post.seoTitle || '',
        seoDescription: post.seoDescription || '',
        isAiGenerated: post.isAiGenerated || false
      });
    }
  }, [post]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = postId ? `/api/blog/posts/${postId}` : '/api/blog/posts';
      const method = postId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/blog/workflow-status'] });
      onClose();
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Calculate word count and reading time
    const wordCount = formData.content.split(' ').filter(word => word.trim().length > 0).length;
    const readingTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute

    const dataToSave = {
      ...formData,
      wordCount,
      readingTime,
      tags: formData.tags ? JSON.stringify(formData.tags.split(',').map(tag => tag.trim())) : JSON.stringify([])
    };

    saveMutation.mutate(dataToSave);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 dark:[background-color:var(--custom-dark)] dark:text-gray-200';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200';
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200';
      case 'archived': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:[background-color:var(--custom-dark)] dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:[background-color:var(--custom-dark)] dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading post...</p>
        </div>
      </div>
    );
  }

  if (showPreview) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Preview Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(false)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Editor
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Preview</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(formData.status)}>
              {formData.status}
            </Badge>
            <Badge className={getPriorityColor(formData.priority)}>
              {formData.priority}
            </Badge>
          </div>
        </div>

        {/* Preview Content */}
        <Card>
          <CardContent className="p-8">
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <h1 className="text-3xl font-bold mb-4">{formData.title || 'Untitled Post'}</h1>
              
              {formData.excerpt && (
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-6 italic border-l-4 border-purple-500 pl-4">
                  {formData.excerpt}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formData.publishedDate || 'Not published'}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {Math.ceil(formData.content.split(' ').filter(word => word.trim().length > 0).length / 200)} min read
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  {formData.platform}
                </div>
              </div>

              <div className="whitespace-pre-wrap">
                {formData.content || 'No content yet...'}
              </div>

              {formData.tags && (
                <div className="mt-8 pt-6 border-t">
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.split(',').map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200">
                        #{tag.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Editor Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Studio
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {postId ? 'Edit Post' : 'New Post'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending || isReadOnly}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saveMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Editor Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="publish" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Publish
          </TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Content Editor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter post title..."
                  className="text-lg"
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  placeholder="Brief summary of the post..."
                  rows={3}
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                
                {/* Rich Text Editor Toolbar */}
                {!isReadOnly && (
                <div className="border rounded-t-lg p-3 bg-gray-50 dark:[background-color:var(--custom-dark)] border-b-0">
                  <div className="flex flex-wrap gap-1">
                    {/* Heading buttons */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => formatText('h1')}
                      className="h-8 px-2"
                      title="Heading 1"
                    >
                      <Heading1 className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => formatText('h2')}
                      className="h-8 px-2"
                      title="Heading 2"
                    >
                      <Heading2 className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => formatText('h3')}
                      className="h-8 px-2"
                      title="Heading 3"
                    >
                      <Heading3 className="h-4 w-4" />
                    </Button>
                    
                    <Separator orientation="vertical" className="mx-1 h-8" />
                    
                    {/* Text formatting buttons */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => formatText('bold')}
                      className="h-8 px-2"
                      title="Bold"
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => formatText('italic')}
                      className="h-8 px-2"
                      title="Italic"
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => formatText('underline')}
                      className="h-8 px-2"
                      title="Underline"
                    >
                      <Underline className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => formatText('strikethrough')}
                      className="h-8 px-2"
                      title="Strikethrough"
                    >
                      <Strikethrough className="h-4 w-4" />
                    </Button>
                    
                    <Separator orientation="vertical" className="mx-1 h-8" />
                    
                    {/* List buttons */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => formatText('unordered-list')}
                      className="h-8 px-2"
                      title="Bullet List"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => formatText('ordered-list')}
                      className="h-8 px-2"
                      title="Numbered List"
                    >
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                    
                    <Separator orientation="vertical" className="mx-1 h-8" />
                    
                    {/* Quote and Code buttons */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => formatText('quote')}
                      className="h-8 px-2"
                      title="Quote"
                    >
                      <Quote className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => formatText('code')}
                      className="h-8 px-2"
                      title="Inline Code"
                    >
                      <Code className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => formatText('link')}
                      className="h-8 px-2"
                      title="Link"
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                )}
                
                <Textarea
                  id="content"
                  ref={setTextareaRef}
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Write your post content here..."
                  rows={20}
                  className={`font-mono ${isReadOnly ? 'rounded-lg' : 'rounded-t-none border-t-0'} focus:ring-0 focus:ring-offset-0 resize-none`}
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  placeholder="productivity, remote work, tips (comma separated)"
                  disabled={isReadOnly}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Post Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)} disabled={isReadOnly}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blog">Blog Post</SelectItem>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="tutorial">Tutorial</SelectItem>
                      <SelectItem value="guide">Guide</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select value={formData.platform} onValueChange={(value) => handleInputChange('platform', value)} disabled={isReadOnly}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal_blog">Personal Blog</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="dev_to">Dev.to</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="substack">Substack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)} disabled={isReadOnly}>
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:[background-color:var(--custom-dark)]/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {formData.content.split(' ').filter(word => word.trim().length > 0).length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Words</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:[background-color:var(--custom-dark)]/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.ceil(formData.content.split(' ').filter(word => word.trim().length > 0).length / 200)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Min Read</div>
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:[background-color:var(--custom-dark)]/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {formData.content.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Characters</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                SEO Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  value={formData.seoTitle}
                  onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                  placeholder="Optimized title for search engines..."
                  maxLength={60}
                  disabled={isReadOnly}
                />
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {formData.seoTitle.length}/60 characters
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoDescription">SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  value={formData.seoDescription}
                  onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                  placeholder="Meta description for search results..."
                  rows={4}
                  maxLength={160}
                  disabled={isReadOnly}
                />
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {formData.seoDescription.length}/160 characters
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:[background-color:var(--custom-dark)] rounded-lg">
                <h4 className="font-medium mb-2">Search Preview</h4>
                <div className="space-y-1">
                  <div className="text-blue-600 text-lg">
                    {formData.seoTitle || formData.title || 'Untitled Post'}
                  </div>
                  <div className="text-green-600 text-sm">
                    example.com/blog/{formData.title?.toLowerCase().replace(/\s+/g, '-') || 'untitled'}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {formData.seoDescription || formData.excerpt || 'No description available.'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Publish Tab */}
        <TabsContent value="publish" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Publishing Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)} disabled={isReadOnly}>
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

              {formData.status === 'scheduled' && (
                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Scheduled Date</Label>
                  <Input
                    id="scheduledDate"
                    type="datetime-local"
                    value={formData.scheduledDate}
                    onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                    disabled={isReadOnly}
                  />
                </div>
              )}

              {formData.status === 'published' && (
                <div className="space-y-2">
                  <Label htmlFor="publishedDate">Published Date</Label>
                  <Input
                    id="publishedDate"
                    type="datetime-local"
                    value={formData.publishedDate}
                    onChange={(e) => handleInputChange('publishedDate', e.target.value)}
                    disabled={isReadOnly}
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isAiGenerated"
                  checked={formData.isAiGenerated}
                  onChange={(e) => handleInputChange('isAiGenerated', e.target.checked)}
                  className="rounded border-gray-300"
                  disabled={isReadOnly}
                />
                <Label htmlFor="isAiGenerated" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  AI Generated Content
                </Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlogEditor;