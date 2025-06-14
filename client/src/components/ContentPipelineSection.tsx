import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { format } from "date-fns";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  BarChart3,
  Target,
  TrendingUp,
  Sparkles,
  Wand2,
  Lightbulb,
  FileText,
  Image,
  Video,
  Mic,
  Send,
  ArrowRight,
  Filter,
  Search,
  MoreVertical
} from "lucide-react";

interface ContentIdea {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  status: 'ideation' | 'research' | 'outline' | 'draft' | 'review' | 'approved' | 'scheduled' | 'published';
  createdDate: string;
  targetDate?: string;
  assignedTo?: string;
  miniGameBlockId?: number;
  contentType: 'post' | 'video' | 'audio' | 'carousel' | 'story' | 'reel';
  platform: string[];
  estimatedHours: number;
  actualHours?: number;
  notes: string;
}

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  icon: any;
  description: string;
}

interface ContentPipelineSectionProps {
  isReadOnly?: boolean;
}

export default function ContentPipelineSection({ isReadOnly = false }: ContentPipelineSectionProps) {
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>([]);
  const [isAddingContent, setIsAddingContent] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'calendar'>('kanban');

  const pipelineStages: PipelineStage[] = [
    { id: 'ideation', name: 'Ideation', color: '#8B5CF6', icon: Lightbulb, description: 'Initial content ideas and concepts' },
    { id: 'research', name: 'Research', color: '#06B6D4', icon: Search, description: 'Content research and fact-checking' },
    { id: 'outline', name: 'Outline', color: '#F59E0B', icon: FileText, description: 'Content structure and planning' },
    { id: 'draft', name: 'Draft', color: '#10B981', icon: Edit, description: 'Content creation and writing' },
    { id: 'review', name: 'Review', color: '#F97316', icon: Eye, description: 'Content review and feedback' },
    { id: 'approved', name: 'Approved', color: '#84CC16', icon: CheckCircle, description: 'Content approved for publishing' },
    { id: 'scheduled', name: 'Scheduled', color: '#6366F1', icon: Clock, description: 'Content scheduled for publication' },
    { id: 'published', name: 'Published', color: '#22C55E', icon: Send, description: 'Content live and published' }
  ];

  const contentTypes = [
    { value: 'post', label: 'Social Post', icon: FileText },
    { value: 'video', label: 'Video', icon: Video },
    { value: 'audio', label: 'Audio/Podcast', icon: Mic },
    { value: 'carousel', label: 'Carousel', icon: Image },
    { value: 'story', label: 'Story', icon: Sparkles },
    { value: 'reel', label: 'Reel', icon: TrendingUp }
  ];

  const platforms = [
    'Instagram', 'TikTok', 'YouTube', 'Twitter', 'LinkedIn', 'Facebook', 'Pinterest', 'Blog'
  ];

  const categories = [
    'Beauty & Skincare', 'Fashion & Style', 'Lifestyle', 'Wellness', 'DIY & Crafts', 
    'Travel', 'Food & Recipes', 'Home Decor', 'Productivity', 'Self Care'
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: '#6B7280' },
    { value: 'medium', label: 'Medium', color: '#F59E0B' },
    { value: 'high', label: 'High', color: '#EF4444' }
  ];

  // Load content ideas from API
  useEffect(() => {
    // TODO: Replace with actual API call to fetch content ideas
    setContentIdeas([]);
  }, []);

  const getStatusColor = (status: string) => {
    const stage = pipelineStages.find(s => s.id === status);
    return stage?.color || '#6B7280';
  };

  const getStatusIcon = (status: string) => {
    const stage = pipelineStages.find(s => s.id === status);
    return stage?.icon || AlertCircle;
  };

  const getPriorityColor = (priority: string) => {
    const p = priorities.find(pr => pr.value === priority);
    return p?.color || '#6B7280';
  };

  const getContentTypeIcon = (type: string) => {
    const ct = contentTypes.find(t => t.value === type);
    return ct?.icon || FileText;
  };

  const filteredContent = contentIdeas.filter(content => {
    const matchesStage = selectedStage === 'all' || content.status === selectedStage;
    const matchesSearch = content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         content.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         content.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStage && matchesSearch;
  });

  const getContentByStatus = (status: string) => {
    return filteredContent.filter(content => content.status === status);
  };

  const renderKanbanView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {pipelineStages.map(stage => {
        const stageContent = getContentByStatus(stage.id);
        const StageIcon = stage.icon;
        
        return (
          <div key={stage.id} className="space-y-4">
            {/* Stage Header */}
            <div className="flex items-center justify-between p-4 rounded-lg border-2 border-dashed" 
                 style={{ borderColor: stage.color + '40', backgroundColor: stage.color + '10' }}>
              <div className="flex items-center space-x-2">
                <StageIcon className="w-5 h-5" style={{ color: stage.color }} />
                <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                <Badge variant="secondary">{stageContent.length}</Badge>
              </div>
            </div>

            {/* Stage Content */}
            <div className="space-y-3 min-h-[400px]">
              {stageContent.map(content => {
                const ContentTypeIcon = getContentTypeIcon(content.contentType);
                
                return (
                  <Card key={content.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <ContentTypeIcon className="w-4 h-4 text-gray-500" />
                          <Badge variant="outline" style={{ color: getPriorityColor(content.priority) }}>
                            {content.priority}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <h4 className="font-semibold text-sm text-gray-900 mb-2 line-clamp-2">
                        {content.title}
                      </h4>
                      
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {content.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {content.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{content.platform.join(', ')}</span>
                        <span>{content.estimatedHours}h</span>
                      </div>
                      
                      {content.targetDate && (
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <CalendarIcon className="w-3 h-3 mr-1" />
                          {format(new Date(content.targetDate), 'MMM dd')}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {filteredContent.map(content => {
        const StatusIcon = getStatusIcon(content.status);
        const ContentTypeIcon = getContentTypeIcon(content.contentType);
        
        return (
          <Card key={content.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <ContentTypeIcon className="w-6 h-6 text-gray-500" />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{content.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{content.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <StatusIcon className="w-4 h-4 mr-1" style={{ color: getStatusColor(content.status) }} />
                        {pipelineStages.find(s => s.id === content.status)?.name}
                      </span>
                      <span>{content.category}</span>
                      <span>{content.platform.join(', ')}</span>
                      <span>{content.estimatedHours}h estimated</span>
                      {content.targetDate && (
                        <span className="flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-1" />
                          {format(new Date(content.targetDate), 'MMM dd, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" style={{ color: getPriorityColor(content.priority) }}>
                    {content.priority}
                  </Badge>
                  
                  <div className="flex flex-wrap gap-1">
                    {content.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    disabled={isReadOnly}
                    className={isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Content Pipeline ✨
          </h2>
          <p className="text-gray-600 mt-1">Manage your content from idea to publication</p>
        </div>
        
        <Dialog open={isAddingContent} onOpenChange={!isReadOnly ? setIsAddingContent : undefined}>
          <DialogTrigger asChild>
            <Button 
              disabled={isReadOnly}
              className={`bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90 ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Content
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Content Idea</DialogTitle>
              <DialogDescription>
                Create a new content idea and add it to your pipeline
              </DialogDescription>
            </DialogHeader>
            {/* Add content form would go here */}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingContent(false)}>
                Cancel
              </Button>
              <Button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                Add to Pipeline
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Ideas</p>
                <p className="text-2xl font-bold text-purple-900">{contentIdeas.length}</p>
              </div>
              <Lightbulb className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">In Progress</p>
                <p className="text-2xl font-bold text-green-900">
                  {contentIdeas.filter(c => ['research', 'outline', 'draft', 'review'].includes(c.status)).length}
                </p>
              </div>
              <Edit className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Scheduled</p>
                <p className="text-2xl font-bold text-blue-900">
                  {contentIdeas.filter(c => c.status === 'scheduled').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pink-600">Published</p>
                <p className="text-2xl font-bold text-pink-900">
                  {contentIdeas.filter(c => c.status === 'published').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
          </div>
          
          <Select value={selectedStage} onValueChange={setSelectedStage}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              {pipelineStages.map(stage => (
                <SelectItem key={stage.id} value={stage.id}>
                  {stage.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)} className="w-auto">
          <TabsList>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content Views */}
      {viewMode === 'kanban' && renderKanbanView()}
      {viewMode === 'list' && renderListView()}
    </div>
  );
}