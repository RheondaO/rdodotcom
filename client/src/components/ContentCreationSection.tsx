import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Star, 
  TrendingUp, 
  Eye, 
  CheckCircle, 
  AlertCircle, 
  Pause, 
  Play,
  Edit,
  Trash2,
  BarChart3,
  FileText,
  Palette,
  Target,
  Users,
  MessageSquare,
  Heart,
  Share2,
  Bookmark
} from 'lucide-react';
import { format, addDays, startOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

interface MiniGameBlock {
  id: number;
  name: string;
  dateOfPost: string;
  astrologicalSign: string;
  frequency: string;
  frequencyValue: number; // How many times per year
  color: string;
  category: string;
  isActive: boolean;
  createdAt: string;
}

interface MiniGameDesign {
  id: number;
  miniGameBlockId: number;
  title: string;
  description: string;
  designNotes: string;
  status: string; // designed, reviewed, approved, archived
  targetDate: string | null;
  designedDate: string | null;
  reviewedDate: string | null;
  approvedDate: string | null;
  version: number;
  isTemplate: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ContentCreationSectionProps {
  selectedDate: Date;
}

export default function ContentCreationSection({ selectedDate }: ContentCreationSectionProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isCreatingMiniGame, setIsCreatingMiniGame] = useState(false);
  const [isCreatingDesign, setIsCreatingDesign] = useState(false);
  const [editingMiniGame, setEditingMiniGame] = useState<MiniGameBlock | null>(null);
  const [editingDesign, setEditingDesign] = useState<MiniGameDesign | null>(null);
  const [calendarView, setCalendarView] = useState<'month' | 'week'>('month');
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Mock data for demonstration
  const [miniGameBlocks, setMiniGameBlocks] = useState<MiniGameBlock[]>([
    {
      id: 1,
      name: "Cosmic Connection Quiz",
      dateOfPost: "2024-06-15",
      astrologicalSign: "Gemini",
      frequency: "weekly",
      frequencyValue: 52,
      color: "#FF6B9D",
      category: "Interactive",
      isActive: true,
      createdAt: "2024-06-01T10:00:00Z"
    },
    {
      id: 2,
      name: "Manifestation Monday",
      dateOfPost: "2024-06-17",
      astrologicalSign: "Cancer",
      frequency: "weekly",
      frequencyValue: 52,
      color: "#4ECDC4",
      category: "Motivational",
      isActive: true,
      createdAt: "2024-06-02T14:30:00Z"
    }
  ]);

  const [miniGameDesigns, setMiniGameDesigns] = useState<MiniGameDesign[]>([
    {
      id: 1,
      miniGameBlockId: 1,
      title: "Gemini Connection Quiz V2",
      description: "Interactive quiz about Gemini traits and compatibility",
      designNotes: "Focus on duality theme, use air element colors",
      status: "designed",
      targetDate: "2024-06-20",
      designedDate: "2024-06-10",
      reviewedDate: null,
      approvedDate: null,
      version: 2,
      isTemplate: false,
      createdAt: "2024-06-10T09:00:00Z",
      updatedAt: "2024-06-10T09:00:00Z"
    },
    {
      id: 2,
      miniGameBlockId: 2,
      title: "Cancer New Moon Manifestation",
      description: "Guided manifestation exercise for Cancer season",
      designNotes: "Incorporate water imagery, moon phases",
      status: "approved",
      targetDate: "2024-06-21",
      designedDate: "2024-06-05",
      reviewedDate: "2024-06-12",
      approvedDate: "2024-06-15",
      version: 1,
      isTemplate: true,
      createdAt: "2024-06-05T16:00:00Z",
      updatedAt: "2024-06-15T11:00:00Z"
    }
  ]);

  const startEditingMiniGame = (miniGame: MiniGameBlock) => {
    setEditingMiniGame(miniGame);
    setIsCreatingMiniGame(true);
  };

  const startEditingDesign = (design: MiniGameDesign) => {
    setEditingDesign(design);
    setIsCreatingDesign(true);
  };

  // Filter functions for search and filtering
  const filteredMiniGameBlocks = miniGameBlocks.filter(block => {
    const matchesSearch = block.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         block.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || block.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredDesigns = miniGameDesigns.filter(design => {
    const matchesSearch = design.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         design.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || design.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calendar helper functions
  const getMonthCalendarDates = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return eachDayOfInterval({ start, end });
  };

  const getWeekCalendarDates = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const getDesignsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return miniGameDesigns.filter(design => design.targetDate === dateStr);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'designed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'reviewed': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'archived': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Content Creation Studio
          </h2>
          <p className="text-gray-600">Design and manage your mini-game content pipeline</p>
        </div>
        
        <div className="flex gap-3">
          <Dialog open={isCreatingMiniGame} onOpenChange={setIsCreatingMiniGame}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                New Mini-Game Block
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingMiniGame ? 'Edit Mini-Game Block' : 'Create New Mini-Game Block'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Mini-Game Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Cosmic Connection Quiz"
                    defaultValue={editingMiniGame?.name || ''}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select defaultValue={editingMiniGame?.category || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Interactive">Interactive</SelectItem>
                      <SelectItem value="Motivational">Motivational</SelectItem>
                      <SelectItem value="Educational">Educational</SelectItem>
                      <SelectItem value="Entertainment">Entertainment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="astrological-sign">Astrological Sign</Label>
                  <Select defaultValue={editingMiniGame?.astrologicalSign || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sign" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aries">Aries</SelectItem>
                      <SelectItem value="Taurus">Taurus</SelectItem>
                      <SelectItem value="Gemini">Gemini</SelectItem>
                      <SelectItem value="Cancer">Cancer</SelectItem>
                      <SelectItem value="Leo">Leo</SelectItem>
                      <SelectItem value="Virgo">Virgo</SelectItem>
                      <SelectItem value="Libra">Libra</SelectItem>
                      <SelectItem value="Scorpio">Scorpio</SelectItem>
                      <SelectItem value="Sagittarius">Sagittarius</SelectItem>
                      <SelectItem value="Capricorn">Capricorn</SelectItem>
                      <SelectItem value="Aquarius">Aquarius</SelectItem>
                      <SelectItem value="Pisces">Pisces</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select defaultValue={editingMiniGame?.frequency || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="seasonal">Seasonal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="color">Theme Color</Label>
                  <Input
                    id="color"
                    type="color"
                    defaultValue={editingMiniGame?.color || '#FF6B9D'}
                    className="h-10"
                  />
                </div>
                <Button
                  onClick={() => {
                    // Handle form submission here
                    setIsCreatingMiniGame(false);
                    setEditingMiniGame(null);
                  }}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {editingMiniGame ? 'Update Mini-Game Block' : 'Create Mini-Game Block'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-6">
        {/* Search and Filter Controls */}
        <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg border">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search mini-games, designs, or categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="designed">Designed</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Interactive">Interactive</SelectItem>
              <SelectItem value="Motivational">Motivational</SelectItem>
              <SelectItem value="Educational">Educational</SelectItem>
              <SelectItem value="Entertainment">Entertainment</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
            <TabsTrigger value="progress" className="rounded-lg">Progress Tracker</TabsTrigger>
            <TabsTrigger value="designs" className="rounded-lg">Design Queue</TabsTrigger>
            <TabsTrigger value="calendar" className="rounded-lg">Content Calendar</TabsTrigger>
            <TabsTrigger value="pipeline" className="rounded-lg">Content Pipeline</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg">Analytics</TabsTrigger>
            <TabsTrigger value="social" className="rounded-lg">Social Media</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Mini-Games</p>
                      <p className="text-2xl font-bold text-purple-600">{miniGameBlocks.length}</p>
                    </div>
                    <Target className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Designs</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {miniGameDesigns.filter(d => d.status !== 'archived').length}
                      </p>
                    </div>
                    <Palette className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Approved</p>
                      <p className="text-2xl font-bold text-green-600">
                        {miniGameDesigns.filter(d => d.status === 'approved').length}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">In Review</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {miniGameDesigns.filter(d => d.status === 'reviewed').length}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {miniGameDesigns.slice(0, 5).map((design) => (
                    <div key={design.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          design.status === 'approved' ? 'bg-green-500' :
                          design.status === 'reviewed' ? 'bg-yellow-500' :
                          design.status === 'designed' ? 'bg-blue-500' : 'bg-gray-500'
                        }`} />
                        <div>
                          <p className="font-medium">{design.title}</p>
                          <p className="text-sm text-gray-600">
                            {design.status === 'approved' ? 'Approved and ready' :
                             design.status === 'reviewed' ? 'Under review' :
                             design.status === 'designed' ? 'Design completed' : 'Archived'}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(design.status)}>
                        {design.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Progress Tracker
                  </span>
                  <Badge variant="outline">{filteredDesigns.length} designs</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredDesigns.map((design) => {
                    const miniGame = miniGameBlocks.find(mg => mg.id === design.miniGameBlockId);
                    const progress = design.status === 'approved' ? 100 : 
                                   design.status === 'reviewed' ? 75 :
                                   design.status === 'designed' ? 50 : 25;
                    
                    return (
                      <div key={design.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: miniGame?.color || '#gray' }}
                            />
                            <div>
                              <h4 className="font-medium">{design.title}</h4>
                              <p className="text-sm text-gray-600">{miniGame?.name}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(design.status)}>
                              {design.status}
                            </Badge>
                            <Button variant="ghost" size="sm" onClick={() => startEditingDesign(design)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                        
                        {design.targetDate && (
                          <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Target: {format(new Date(design.targetDate), 'MMM dd, yyyy')}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              Updated: {format(new Date(design.updatedAt), 'MMM dd')}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="designs" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Palette className="h-5 w-5 mr-2" />
                    Design Queue
                  </CardTitle>
                  <Dialog open={isCreatingDesign} onOpenChange={setIsCreatingDesign}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        New Design
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>{editingDesign ? 'Edit Design' : 'Create New Design'}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="design-title">Design Title</Label>
                          <Input
                            id="design-title"
                            placeholder="e.g., Gemini Connection Quiz V2"
                            defaultValue={editingDesign?.title || ''}
                          />
                        </div>
                        <div>
                          <Label htmlFor="mini-game-block">Mini-Game Block</Label>
                          <Select defaultValue={editingDesign?.miniGameBlockId.toString() || ''}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select mini-game block" />
                            </SelectTrigger>
                            <SelectContent>
                              {miniGameBlocks.map(block => (
                                <SelectItem key={block.id} value={block.id.toString()}>
                                  {block.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Input
                            id="description"
                            placeholder="Brief description of the design"
                            defaultValue={editingDesign?.description || ''}
                          />
                        </div>
                        <div>
                          <Label htmlFor="target-date">Target Date</Label>
                          <Input
                            id="target-date"
                            type="date"
                            defaultValue={editingDesign?.targetDate || ''}
                          />
                        </div>
                        <div>
                          <Label htmlFor="design-notes">Design Notes</Label>
                          <Input
                            id="design-notes"
                            placeholder="Design requirements, notes, etc."
                            defaultValue={editingDesign?.designNotes || ''}
                          />
                        </div>
                        <Button
                          onClick={() => {
                            setIsCreatingDesign(false);
                            setEditingDesign(null);
                          }}
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                          {editingDesign ? 'Update Design' : 'Create Design'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {filteredDesigns.map((design) => {
                    const miniGame = miniGameBlocks.find(mg => mg.id === design.miniGameBlockId);
                    
                    return (
                      <div key={design.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: miniGame?.color || '#gray' }}
                              />
                              <h3 className="font-semibold">{design.title}</h3>
                              <Badge className={getStatusColor(design.status)}>
                                {design.status}
                              </Badge>
                              {design.isTemplate && (
                                <Badge variant="secondary">Template</Badge>
                              )}
                            </div>
                            
                            <p className="text-gray-600 mb-2">{design.description}</p>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Target className="h-4 w-4 mr-1" />
                                {miniGame?.name}
                              </span>
                              {design.targetDate && (
                                <span className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {format(new Date(design.targetDate), 'MMM dd, yyyy')}
                                </span>
                              )}
                              <span className="flex items-center">
                                <FileText className="h-4 w-4 mr-1" />
                                v{design.version}
                              </span>
                            </div>
                            
                            {design.designNotes && (
                              <p className="text-sm text-gray-600 mt-2 italic">
                                "{design.designNotes}"
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <Button variant="ghost" size="sm" onClick={() => startEditingDesign(design)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Content Calendar
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant={calendarView === 'month' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCalendarView('month')}
                    >
                      Month
                    </Button>
                    <Button 
                      variant={calendarView === 'week' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCalendarView('week')}
                    >
                      Week
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2" style={{
                  gridTemplateColumns: calendarView === 'month' ? 'repeat(7, 1fr)' : 'repeat(7, 1fr)'
                }}>
                  {/* Calendar Headers */}
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="p-2 text-center font-medium text-gray-600 border-b">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar Dates */}
                  {(calendarView === 'month' ? getMonthCalendarDates(selectedDate) : getWeekCalendarDates(selectedDate)).map(date => {
                    const designs = getDesignsForDate(date);
                    const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                    
                    return (
                      <div 
                        key={format(date, 'yyyy-MM-dd')} 
                        className={`min-h-[120px] p-2 border rounded-lg ${
                          isToday ? 'bg-purple-50 border-purple-200' : 'bg-white'
                        }`}
                      >
                        <div className={`text-sm font-medium mb-2 ${
                          isToday ? 'text-purple-600' : 'text-gray-600'
                        }`}>
                          {format(date, 'd')}
                        </div>
                        
                        <div className="space-y-1">
                          {designs.map(design => {
                            const miniGame = miniGameBlocks.find(mg => mg.id === design.miniGameBlockId);
                            return (
                              <div 
                                key={design.id}
                                className="text-xs p-1 rounded text-white truncate"
                                style={{ backgroundColor: miniGame?.color || '#gray' }}
                                title={design.title}
                              >
                                {design.title}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pipeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Content Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Designed */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-blue-600">Designed</h3>
                      <Badge variant="secondary">
                        {miniGameDesigns.filter(d => d.status === 'designed').length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {miniGameDesigns.filter(d => d.status === 'designed').map(design => {
                        const miniGame = miniGameBlocks.find(mg => mg.id === design.miniGameBlockId);
                        return (
                          <div key={design.id} className="p-3 border rounded-lg bg-blue-50 border-blue-200">
                            <h4 className="font-medium text-sm">{design.title}</h4>
                            <p className="text-xs text-gray-600">{miniGame?.name}</p>
                            {design.targetDate && (
                              <p className="text-xs text-blue-600 mt-1">
                                {format(new Date(design.targetDate), 'MMM dd')}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Under Review */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-yellow-600">Under Review</h3>
                      <Badge variant="secondary">
                        {miniGameDesigns.filter(d => d.status === 'reviewed').length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {miniGameDesigns.filter(d => d.status === 'reviewed').map(design => {
                        const miniGame = miniGameBlocks.find(mg => mg.id === design.miniGameBlockId);
                        return (
                          <div key={design.id} className="p-3 border rounded-lg bg-yellow-50 border-yellow-200">
                            <h4 className="font-medium text-sm">{design.title}</h4>
                            <p className="text-xs text-gray-600">{miniGame?.name}</p>
                            {design.reviewedDate && (
                              <p className="text-xs text-yellow-600 mt-1">
                                Reviewed {format(new Date(design.reviewedDate), 'MMM dd')}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Approved */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-green-600">Approved</h3>
                      <Badge variant="secondary">
                        {miniGameDesigns.filter(d => d.status === 'approved').length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {miniGameDesigns.filter(d => d.status === 'approved').map(design => {
                        const miniGame = miniGameBlocks.find(mg => mg.id === design.miniGameBlockId);
                        return (
                          <div key={design.id} className="p-3 border rounded-lg bg-green-50 border-green-200">
                            <h4 className="font-medium text-sm">{design.title}</h4>
                            <p className="text-xs text-gray-600">{miniGame?.name}</p>
                            {design.approvedDate && (
                              <p className="text-xs text-green-600 mt-1">
                                Approved {format(new Date(design.approvedDate), 'MMM dd')}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Archived */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-600">Archived</h3>
                      <Badge variant="secondary">
                        {miniGameDesigns.filter(d => d.status === 'archived').length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {miniGameDesigns.filter(d => d.status === 'archived').map(design => {
                        const miniGame = miniGameBlocks.find(mg => mg.id === design.miniGameBlockId);
                        return (
                          <div key={design.id} className="p-3 border rounded-lg bg-gray-50 border-gray-200">
                            <h4 className="font-medium text-sm">{design.title}</h4>
                            <p className="text-xs text-gray-600">{miniGame?.name}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {activeTab === 'pipeline' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Mini-Game Blocks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {filteredMiniGameBlocks.map((miniGame) => {
                    const relatedDesigns = miniGameDesigns.filter(d => d.miniGameBlockId === miniGame.id);
                    
                    return (
                      <div key={miniGame.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div 
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: miniGame.color }}
                              />
                              <h3 className="font-semibold">{miniGame.name}</h3>
                              <Badge variant="outline">{miniGame.category}</Badge>
                              <Badge variant="secondary">{miniGame.astrologicalSign}</Badge>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {miniGame.frequency} ({miniGame.frequencyValue}/year)
                              </span>
                              <span className="flex items-center">
                                <Palette className="h-4 w-4 mr-1" />
                                {relatedDesigns.length} designs
                              </span>
                            </div>
                            
                            {relatedDesigns.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {relatedDesigns.map(design => (
                                  <Badge 
                                    key={design.id} 
                                    className={getStatusColor(design.status)}
                                    variant="outline"
                                  >
                                    {design.title} ({design.status})
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => startEditingMiniGame(miniGame)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setMiniGameBlocks(blocks => 
                                  blocks.map(b => 
                                    b.id === miniGame.id 
                                      ? { ...b, isActive: !b.isActive }
                                      : b
                                  )
                                );
                              }}
                            >
                              {miniGame.isActive ? (
                                <Pause className="h-4 w-4 text-yellow-500" />
                              ) : (
                                <Play className="h-4 w-4 text-green-500" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <TabsContent value="analytics" className="space-y-6">
            <div className="text-center py-12 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">Performance Analytics</h3>
              <p className="text-sm">Track engagement and reach metrics</p>
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">Social Media Analytics</h3>
              <p className="text-sm">Track which mini-game styles and posting schedules perform best</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}