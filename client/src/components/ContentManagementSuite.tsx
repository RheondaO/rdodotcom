import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  PenTool, 
  Plus, 
  Calendar, 
  Clock, 
  Star,
  CheckCircle,
  Circle,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Target,
  Palette,
  TrendingUp,
  Zap,
  FileText,
  Video,
  Mic,
  Image,
  Hash,
  Users,
  Globe,
  PlayCircle,
  Pause,
  Settings,
  Filter,
  Search
} from "lucide-react";
import { format, addDays, addWeeks, startOfWeek, endOfWeek } from "date-fns";

interface ContentCategory {
  id: number;
  name: string;
  description: string;
  color: string;
  icon: string;
  brand?: string;
  isActive: boolean;
  createdAt: string;
}

interface ContentType {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  estimatedDuration: number; // in minutes
  defaultPlatforms: string[];
  templateContent: string;
  isActive: boolean;
  createdAt: string;
}

interface ContentPiece {
  id: number;
  contentTypeId: number;
  title: string;
  description: string;
  status: "idea" | "planning" | "draft" | "review" | "approved" | "scheduled" | "published" | "archived";
  targetDate: string | null;
  scheduledDate: string | null;
  publishedDate: string | null;
  platforms: string[];
  tags: string[];
  notes: string;
  estimatedDuration: number | null;
  actualDuration: number | null;
  assignee: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ContentProgress {
  id: number;
  contentPieceId: number;
  phase: "ideation" | "research" | "creation" | "editing" | "review" | "approval" | "scheduling" | "publishing";
  isCompleted: boolean;
  completedAt: string | null;
  notes: string;
  timeSpent: number; // in minutes
  createdAt: string;
}

interface ContentManagementSuiteProps {
  selectedDate: Date;
}

export default function ContentManagementSuite({ selectedDate }: ContentManagementSuiteProps) {
  const [activeView, setActiveView] = useState<"overview" | "categories" | "content" | "calendar" | "analytics">("overview");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewContentDialog, setShowNewContentDialog] = useState(false);
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string>("all");

  // Brand definitions matching ContentCreationSection
  const brands = [
    { id: "rotationONLY", name: "𝔯𝔬𝔱𝔞𝔱𝔦𝔬𝔫𝐎𝐍𝐋𝐘 Magazine", icon: "🌙", color: "#8B5CF6" },
    { id: "reallyObvi", name: "Really Obvi Media Lab", icon: "🧪", color: "#3B82F6" },
    { id: "personal", name: "Personal Brand", icon: "✨", color: "#EC4899" },
    { id: "misc", name: "Misc", icon: "📦", color: "#10B981" }
  ];

  // Mock data - in real app would come from API
  const [categories, setCategories] = useState<ContentCategory[]>([
    {
      id: 1,
      name: "Mini-Game Blocks",
      description: "Interactive social media games and prompts",
      color: "#8B5CF6",
      icon: "🎮",
      brand: "rotationONLY",
      isActive: true,
      createdAt: "2025-06-01"
    },
    {
      id: 2,
      name: "Astrological Content",
      description: "Moon phases, sun signs, and cosmic insights",
      color: "#3B82F6",
      icon: "🌙",
      brand: "rotationONLY",
      isActive: true,
      createdAt: "2025-06-01"
    },
    {
      id: 3,
      name: "Media Experiments",
      description: "Creative projects and experimental content",
      color: "#EF4444",
      icon: "🧪",
      brand: "reallyObvi",
      isActive: true,
      createdAt: "2025-06-01"
    },
    {
      id: 4,
      name: "Personal Insights",
      description: "Thought leadership and personal experiences",
      color: "#EC4899",
      icon: "✨",
      brand: "personal",
      isActive: true,
      createdAt: "2025-06-01"
    },
    {
      id: 5,
      name: "Collaborations",
      description: "Partnership content and miscellaneous projects",
      color: "#10B981",
      icon: "📦",
      brand: "misc",
      isActive: true,
      createdAt: "2025-06-01"
    }
  ]);

  const [contentTypes, setContentTypes] = useState<ContentType[]>([
    {
      id: 1,
      categoryId: 1,
      name: "How-to Guide",
      description: "Step-by-step tutorial posts",
      estimatedDuration: 180,
      defaultPlatforms: ["website", "pinterest"],
      templateContent: "Introduction\n\nWhat you'll need:\n\nStep 1:\n\nStep 2:\n\nConclusion",
      isActive: true,
      createdAt: "2025-06-01"
    },
    {
      id: 2,
      categoryId: 2,
      name: "Instagram Post",
      description: "Single image Instagram posts",
      estimatedDuration: 45,
      defaultPlatforms: ["instagram"],
      templateContent: "Caption text\n\n#hashtag1 #hashtag2",
      isActive: true,
      createdAt: "2025-06-01"
    },
    {
      id: 3,
      categoryId: 3,
      name: "YouTube Tutorial",
      description: "Educational video content",
      estimatedDuration: 240,
      defaultPlatforms: ["youtube"],
      templateContent: "Video outline:\n1. Introduction\n2. Main content\n3. Call to action",
      isActive: true,
      createdAt: "2025-06-01"
    }
  ]);

  const [contentPieces, setContentPieces] = useState<ContentPiece[]>([
    {
      id: 1,
      contentTypeId: 1,
      title: "Ultimate Guide to Content Planning",
      description: "Comprehensive guide on planning content calendars",
      status: "draft",
      targetDate: "2025-06-10",
      scheduledDate: null,
      publishedDate: null,
      platforms: ["website", "pinterest"],
      tags: ["content planning", "strategy", "productivity"],
      notes: "Need to add more examples and case studies",
      estimatedDuration: 180,
      actualDuration: 120,
      assignee: "You",
      createdAt: "2025-06-01",
      updatedAt: "2025-06-03"
    },
    {
      id: 2,
      contentTypeId: 2,
      title: "Morning Motivation Monday",
      description: "Inspirational quote post for Monday motivation",
      status: "scheduled",
      targetDate: "2025-06-09",
      scheduledDate: "2025-06-09T09:00:00",
      publishedDate: null,
      platforms: ["instagram", "twitter"],
      tags: ["motivation", "monday", "quotes"],
      notes: "Image designed and approved",
      estimatedDuration: 45,
      actualDuration: 30,
      assignee: "You",
      createdAt: "2025-06-02",
      updatedAt: "2025-06-03"
    },
    {
      id: 3,
      contentTypeId: 3,
      title: "Content Creation Workflow Tutorial",
      description: "Video showing my content creation process",
      status: "planning",
      targetDate: "2025-06-15",
      scheduledDate: null,
      publishedDate: null,
      platforms: ["youtube", "instagram reels"],
      tags: ["tutorial", "workflow", "behind the scenes"],
      notes: "Script outline ready, need to record",
      estimatedDuration: 240,
      actualDuration: null,
      assignee: "You",
      createdAt: "2025-06-03",
      updatedAt: "2025-06-03"
    }
  ]);

  const [newContent, setNewContent] = useState({
    contentTypeId: "",
    title: "",
    description: "",
    targetDate: "",
    platforms: [] as string[]
  });

  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
    icon: "📝"
  });

  // Filter content based on selected filters
  const filteredContent = contentPieces.filter(content => {
    const matchesCategory = !selectedCategory || 
      contentTypes.find(type => type.id === content.contentTypeId)?.categoryId === selectedCategory;
    const matchesStatus = !selectedStatus || content.status === selectedStatus;
    const matchesSearch = !searchQuery || 
      content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      idea: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      planning: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      review: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      scheduled: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      published: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
      archived: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    };
    return colors[status as keyof typeof colors] || colors.idea;
  };



  const createContent = () => {
    const content: ContentPiece = {
      id: contentPieces.length + 1,
      contentTypeId: Number(newContent.contentTypeId),
      title: newContent.title,
      description: newContent.description,
      status: "idea",
      targetDate: newContent.targetDate || null,
      scheduledDate: null,
      publishedDate: null,
      platforms: newContent.platforms,
      tags: [],
      notes: "",
      estimatedDuration: contentTypes.find(type => type.id === Number(newContent.contentTypeId))?.estimatedDuration || null,
      actualDuration: null,
      assignee: "You",
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      updatedAt: format(new Date(), 'yyyy-MM-dd')
    };

    setContentPieces([...contentPieces, content]);
    setNewContent({
      contentTypeId: "",
      title: "",
      description: "",
      targetDate: "",
      platforms: []
    });
    setShowNewContentDialog(false);
  };

  const createCategory = () => {
    const category: ContentCategory = {
      id: categories.length + 1,
      name: newCategory.name,
      description: newCategory.description,
      color: newCategory.color,
      icon: newCategory.icon,
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    };

    setCategories([...categories, category]);
    setNewCategory({
      name: "",
      description: "",
      color: "#3B82F6",
      icon: "📝"
    });
    setShowNewCategoryDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-heading font-bold bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
            Content Management Suite
          </h3>
          <p className="text-muted-foreground dark:text-gray-300 mt-1">
            Organize, plan, and track your content creation workflow
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Dialog open={showNewContentDialog} onOpenChange={setShowNewContentDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-xl">
                <Plus className="mr-2 h-4 w-4" />
                New Content
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-gray-900 border-0 rounded-2xl max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-white">Create New Content</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Content Type</Label>
                  <Select value={newContent.contentTypeId} onValueChange={(value) => setNewContent({...newContent, contentTypeId: value})}>
                    <SelectTrigger className="dark:bg-gray-800 dark:text-white">
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                    <SelectContent>
                      {contentTypes.map(type => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name} - {categories.find(cat => cat.id === type.categoryId)?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Title</Label>
                  <Input
                    value={newContent.title}
                    onChange={(e) => setNewContent({...newContent, title: e.target.value})}
                    placeholder="Content title"
                    className="dark:bg-gray-800 dark:text-white"
                  />
                </div>
                
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newContent.description}
                    onChange={(e) => setNewContent({...newContent, description: e.target.value})}
                    placeholder="Brief description"
                    className="dark:bg-gray-800 dark:text-white"
                  />
                </div>
                
                <div>
                  <Label>Target Date</Label>
                  <Input
                    type="date"
                    value={newContent.targetDate}
                    onChange={(e) => setNewContent({...newContent, targetDate: e.target.value})}
                    className="dark:bg-gray-800 dark:text-white"
                  />
                </div>
                

                
                <Button onClick={createContent} className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white">
                  Create Content
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { key: "overview", label: "Overview", icon: BarChart3 },
            { key: "categories", label: "Categories", icon: Palette },
            { key: "content", label: "Content Pipeline", icon: PenTool },
            { key: "calendar", label: "Content Calendar", icon: Calendar },
            { key: "analytics", label: "Analytics", icon: TrendingUp }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveView(key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeView === key
                  ? 'border-pink-500 text-pink-600 dark:text-pink-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview */}
      {activeView === "overview" && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-blue-100 dark:border-blue-800 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">Total Content</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {contentPieces.length}
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-100 dark:border-yellow-800 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">In Progress</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {contentPieces.filter(c => ['planning', 'draft', 'review'].includes(c.status)).length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-100 dark:border-green-800 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">Published</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {contentPieces.filter(c => c.status === 'published').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-100 dark:border-purple-800 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">Scheduled</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {contentPieces.filter(c => c.status === 'scheduled').length}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Content */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                Recent Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contentPieces.slice(0, 5).map(content => (
                  <div key={content.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{content.title}</h4>
                      <p className="text-sm text-muted-foreground dark:text-gray-400">
                        {contentTypes.find(type => type.id === content.contentTypeId)?.name} • 
                        {categories.find(cat => cat.id === contentTypes.find(type => type.id === content.contentTypeId)?.categoryId)?.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(content.status)}>
                        {content.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Categories */}
      {activeView === "categories" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold">Content Categories</h4>
            <Dialog open={showNewCategoryDialog} onOpenChange={setShowNewCategoryDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="rounded-xl">
                  <Plus className="mr-2 h-4 w-4" />
                  New Category
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white dark:bg-gray-900 border-0 rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-gray-900 dark:text-white">Create New Category</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                      placeholder="Category name"
                      className="dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                      placeholder="Category description"
                      className="dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Color</Label>
                      <Input
                        type="color"
                        value={newCategory.color}
                        onChange={(e) => setNewCategory({...newCategory, color: e.target.value})}
                        className="dark:bg-gray-800 dark:text-white h-10"
                      />
                    </div>
                    
                    <div>
                      <Label>Icon</Label>
                      <Input
                        value={newCategory.icon}
                        onChange={(e) => setNewCategory({...newCategory, icon: e.target.value})}
                        placeholder="📝"
                        className="dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <Button onClick={createCategory} className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white">
                    Create Category
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(category => (
              <Card key={category.id} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: category.color }}
                    >
                      <span className="text-lg">{category.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{category.name}</h3>
                      <p className="text-sm text-muted-foreground dark:text-gray-400">
                        {contentTypes.filter(type => type.categoryId === category.id).length} types
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {category.description}
                  </p>
                  
                  <div className="space-y-2">
                    {contentTypes.filter(type => type.categoryId === category.id).map(type => (
                      <div key={type.id} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{type.name}</span>
                        <span className="text-xs text-muted-foreground">{type.estimatedDuration}min</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Content Pipeline */}
      {activeView === "content" && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger className="w-56 dark:bg-gray-700 dark:text-white">
                <SelectValue placeholder="All Brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map(brand => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.icon} {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedCategory?.toString() || ""} onValueChange={(value) => setSelectedCategory(value ? Number(value) : null)}>
              <SelectTrigger className="w-48 dark:bg-gray-700 dark:text-white">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories
                  .filter(category => selectedBrand === "all" || category.brand === selectedBrand)
                  .map(category => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedStatus || ""} onValueChange={(value) => setSelectedStatus(value || null)}>
              <SelectTrigger className="w-48 dark:bg-gray-700 dark:text-white">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="idea">Idea</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Content List */}
          <div className="space-y-4">
            {filteredContent.map(content => (
              <Card key={content.id} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{content.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{content.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground dark:text-gray-400">
                        <span>
                          {contentTypes.find(type => type.id === content.contentTypeId)?.name} • 
                          {categories.find(cat => cat.id === contentTypes.find(type => type.id === content.contentTypeId)?.categoryId)?.name}
                        </span>
                        {content.targetDate && (
                          <span>Due: {format(new Date(content.targetDate), 'MMM dd')}</span>
                        )}
                        {content.estimatedDuration && (
                          <span>Est: {content.estimatedDuration}min</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(content.status)}>
                        {content.status}
                      </Badge>

                    </div>
                  </div>
                  
                  {content.tags.length > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <Hash className="h-4 w-4 text-gray-400" />
                      <div className="flex flex-wrap gap-1">
                        {content.tags.map(tag => (
                          <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {content.platforms.map(platform => (
                        <span key={platform} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
                          {platform}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Content Calendar */}
      {activeView === "calendar" && (
        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                Content Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center font-semibold text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }, (_, i) => {
                  const date = addDays(startOfWeek(selectedDate), i);
                  const dayContent = contentPieces.filter(content => 
                    content.targetDate === format(date, 'yyyy-MM-dd') ||
                    content.scheduledDate?.startsWith(format(date, 'yyyy-MM-dd'))
                  );
                  
                  return (
                    <div key={i} className="min-h-24 p-2 border border-gray-200 dark:border-gray-700 rounded">
                      <div className="text-sm font-medium mb-1">{format(date, 'd')}</div>
                      <div className="space-y-1">
                        {dayContent.map(content => (
                          <div 
                            key={content.id}
                            className="text-xs p-1 rounded bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-300 truncate"
                          >
                            {content.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics */}
      {activeView === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Content by Status */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Content by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['idea', 'planning', 'draft', 'review', 'approved', 'scheduled', 'published'].map(status => {
                    const count = contentPieces.filter(c => c.status === status).length;
                    const percentage = contentPieces.length ? (count / contentPieces.length) * 100 : 0;
                    
                    return (
                      <div key={status}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize">{status}</span>
                          <span>{count}</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Content by Category */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Content by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categories.map(category => {
                    const count = contentPieces.filter(content => 
                      contentTypes.find(type => type.id === content.contentTypeId)?.categoryId === category.id
                    ).length;
                    const percentage = contentPieces.length ? (count / contentPieces.length) * 100 : 0;
                    
                    return (
                      <div key={category.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{category.icon} {category.name}</span>
                          <span>{count}</span>
                        </div>
                        <Progress value={percentage} className="h-2" style={{ backgroundColor: category.color + '20' }} />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Productivity Metrics */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Productivity Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round((contentPieces.filter(c => c.status === 'published').length / Math.max(contentPieces.length, 1)) * 100)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Completion Rate</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(contentPieces.reduce((sum, content) => sum + (content.actualDuration || 0), 0) / 60)}h
                    </div>
                    <div className="text-sm text-muted-foreground">Time Invested</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {contentPieces.filter(c => c.targetDate && new Date(c.targetDate) < new Date() && c.status !== 'published').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Overdue Items</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}