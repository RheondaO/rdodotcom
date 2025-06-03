
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Moon,
  Sun,
  Sparkles,
  Briefcase,
  Building
} from "lucide-react";
import { format, addDays, isBefore, isAfter } from "date-fns";

interface ContentCategory {
  id: number;
  name: string;
  description: string;
  color: string;
  isActive: boolean;
  createdAt: string;
}

interface ContentType {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  frequency: string;
  targetCount: number;
  isRecurring: boolean;
  createdAt: string;
}

interface ContentPiece {
  id: number;
  contentTypeId: number;
  title: string;
  description: string;
  status: string;
  targetDate: string | null;
  scheduledDate: string | null;
  publishedDate: string | null;
  notes: string;
  priority: string;
  estimatedDuration: number | null;
  actualDuration: number | null;
  createdAt: string;
  updatedAt: string;
}

interface ContentProgress {
  id: number;
  contentPieceId: number;
  phase: string;
  isCompleted: boolean;
  completedAt: string | null;
  notes: string;
  createdAt: string;
}

export default function ContentCreationSection() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showCreateContentDialog, setShowCreateContentDialog] = useState(false);
  const [showCreateCategoryDialog, setShowCreateCategoryDialog] = useState(false);

  // Default categories for your content types
  const [categories, setCategories] = useState<ContentCategory[]>([
    {
      id: 1,
      name: "Astrological Content",
      description: "Moon phases, sun signs, and astrological events",
      color: "#8B5CF6",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 2,
      name: "Professional Content",
      description: "Industry insights and professional writing",
      color: "#3B82F6",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 3,
      name: "Brand Content",
      description: "Multi-brand content and campaigns",
      color: "#EF4444",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    }
  ]);

  // Default content types for astrological content
  const [contentTypes, setContentTypes] = useState<ContentType[]>([
    {
      id: 1,
      categoryId: 1,
      name: "Full Moon Articles",
      description: "Monthly full moon energy and guidance",
      frequency: "monthly",
      targetCount: 12,
      isRecurring: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 2,
      categoryId: 1,
      name: "New Moon Articles",
      description: "Monthly new moon intentions and rituals",
      frequency: "monthly",
      targetCount: 12,
      isRecurring: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 3,
      categoryId: 1,
      name: "Sun Sign Monthly",
      description: "Monthly horoscopes for each zodiac sign",
      frequency: "monthly",
      targetCount: 12,
      isRecurring: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    }
  ]);

  const [contentPieces, setContentPieces] = useState<ContentPiece[]>([]);
  const [contentProgress, setContentProgress] = useState<ContentProgress[]>([]);

  const [newContent, setNewContent] = useState({
    contentTypeId: 0,
    title: "",
    description: "",
    targetDate: "",
    priority: "medium",
    estimatedDuration: 60
  });

  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    color: "#8B5CF6"
  });

  const getContentTypesByCategory = (categoryId: number) => {
    return contentTypes.filter(type => type.categoryId === categoryId);
  };

  const getContentPiecesByType = (contentTypeId: number) => {
    return contentPieces.filter(piece => piece.contentTypeId === contentTypeId);
  };

  const getContentByStatus = (status: string) => {
    return contentPieces.filter(piece => piece.status === status);
  };

  const getCategoryProgress = (categoryId: number) => {
    const categoryTypes = getContentTypesByCategory(categoryId);
    const totalTarget = categoryTypes.reduce((sum, type) => sum + type.targetCount, 0);
    const completedPieces = categoryTypes.reduce((sum, type) => {
      return sum + getContentPiecesByType(type.id).filter(piece => piece.status === 'published').length;
    }, 0);
    return totalTarget > 0 ? Math.round((completedPieces / totalTarget) * 100) : 0;
  };

  const statusColors = {
    draft: "bg-gray-100 text-gray-800",
    review: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    scheduled: "bg-blue-100 text-blue-800",
    published: "bg-purple-100 text-purple-800"
  };

  const priorityColors = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-blue-100 text-blue-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800"
  };

  const phases = ["research", "draft", "edit", "review", "final"];

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-heading font-bold text-purple-600 flex items-center">
          <PenTool className="text-purple-500 mr-3 h-6 w-6" />
          Content Creation Hub ✨
        </h3>
        <div className="flex gap-2">
          <Dialog open={showCreateCategoryDialog} onOpenChange={setShowCreateCategoryDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-xl">
                <Building className="h-4 w-4 mr-2" />
                New Category
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Create Content Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input
                    id="categoryName"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                    placeholder="e.g., Brand Content"
                  />
                </div>
                <div>
                  <Label htmlFor="categoryDescription">Description</Label>
                  <Textarea
                    id="categoryDescription"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                    placeholder="Describe this content category..."
                  />
                </div>
                <div>
                  <Label htmlFor="categoryColor">Theme Color</Label>
                  <Input
                    id="categoryColor"
                    type="color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({...newCategory, color: e.target.value})}
                  />
                </div>
                <Button 
                  onClick={() => {
                    const category: ContentCategory = {
                      id: Date.now(),
                      ...newCategory,
                      isActive: true,
                      createdAt: format(new Date(), 'yyyy-MM-dd')
                    };
                    setCategories([...categories, category]);
                    setNewCategory({ name: "", description: "", color: "#8B5CF6" });
                    setShowCreateCategoryDialog(false);
                  }}
                  className="w-full rounded-xl"
                >
                  Create Category
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateContentDialog} onOpenChange={setShowCreateContentDialog}>
            <DialogTrigger asChild>
              <Button className="rounded-xl">
                <Plus className="h-4 w-4 mr-2" />
                New Content
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Create New Content Piece</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="contentType">Content Type</Label>
                  <Select value={newContent.contentTypeId.toString()} onValueChange={(value) => setNewContent({...newContent, contentTypeId: parseInt(value)})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                    <SelectContent>
                      {contentTypes.map(type => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="contentTitle">Title</Label>
                  <Input
                    id="contentTitle"
                    value={newContent.title}
                    onChange={(e) => setNewContent({...newContent, title: e.target.value})}
                    placeholder="Content piece title..."
                  />
                </div>
                <div>
                  <Label htmlFor="contentDescription">Description</Label>
                  <Textarea
                    id="contentDescription"
                    value={newContent.description}
                    onChange={(e) => setNewContent({...newContent, description: e.target.value})}
                    placeholder="Brief description of the content..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="targetDate">Target Date</Label>
                    <Input
                      id="targetDate"
                      type="date"
                      value={newContent.targetDate}
                      onChange={(e) => setNewContent({...newContent, targetDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={newContent.priority} onValueChange={(value) => setNewContent({...newContent, priority: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  onClick={() => {
                    const content: ContentPiece = {
                      id: Date.now(),
                      ...newContent,
                      status: "draft",
                      scheduledDate: null,
                      publishedDate: null,
                      notes: "",
                      actualDuration: null,
                      createdAt: format(new Date(), 'yyyy-MM-dd'),
                      updatedAt: format(new Date(), 'yyyy-MM-dd')
                    };
                    setContentPieces([...contentPieces, content]);
                    setNewContent({
                      contentTypeId: 0,
                      title: "",
                      description: "",
                      targetDate: "",
                      priority: "medium",
                      estimatedDuration: 60
                    });
                    setShowCreateContentDialog(false);
                  }}
                  className="w-full rounded-xl"
                >
                  Create Content
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
          <TabsTrigger value="categories" className="rounded-lg">Categories</TabsTrigger>
          <TabsTrigger value="calendar" className="rounded-lg">Calendar</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-lg">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.entries(statusColors).map(([status, colorClass]) => {
              const count = getContentByStatus(status).length;
              return (
                <Card key={status} className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                  <CardContent className="p-4 text-center">
                    <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium mb-2 ${colorClass}`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{count}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Recent Content */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-purple-500" />
                Recent Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contentPieces.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No content pieces yet. Create your first content piece to get started!
                </div>
              ) : (
                <div className="space-y-3">
                  {contentPieces.slice(0, 5).map(content => {
                    const contentType = contentTypes.find(type => type.id === content.contentTypeId);
                    const category = categories.find(cat => cat.id === contentType?.categoryId);
                    return (
                      <div key={content.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{content.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`text-xs ${statusColors[content.status as keyof typeof statusColors]}`}>
                              {content.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {category?.name}
                            </Badge>
                            {content.targetDate && (
                              <span className="text-xs text-gray-500">
                                Due: {format(new Date(content.targetDate), 'MMM dd')}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map(category => {
              const categoryTypes = getContentTypesByCategory(category.id);
              const progress = getCategoryProgress(category.id);
              
              return (
                <Card key={category.id} className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl overflow-hidden">
                  <div 
                    className="h-2 w-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        {category.name === "Astrological Content" && <Moon className="h-5 w-5 mr-2" style={{ color: category.color }} />}
                        {category.name === "Professional Content" && <Briefcase className="h-5 w-5 mr-2" style={{ color: category.color }} />}
                        {category.name === "Brand Content" && <Building className="h-5 w-5 mr-2" style={{ color: category.color }} />}
                        {!["Astrological Content", "Professional Content", "Brand Content"].includes(category.name) && <Star className="h-5 w-5 mr-2" style={{ color: category.color }} />}
                        {category.name}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{category.description}</p>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <div>{categoryTypes.length} content types</div>
                        <div>{categoryTypes.reduce((sum, type) => sum + getContentPiecesByType(type.id).length, 0)} pieces</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-purple-500" />
                Content Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Calendar view coming soon! Will show scheduled content and deadlines.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-purple-500" />
                Content Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Analytics dashboard coming soon! Will show productivity metrics and content performance.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}
