
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
  Building,
  Gamepad2,
  Palette,
  TrendingUp,
  Zap
} from "lucide-react";
import { format, addDays, addWeeks, isBefore, isAfter, startOfYear, endOfYear } from "date-fns";

interface MiniGameBlock {
  id: number;
  name: string;
  description: string;
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

export default function ContentCreationSection() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMiniGame, setSelectedMiniGame] = useState<number | null>(null);
  const [showCreateMiniGameDialog, setShowCreateMiniGameDialog] = useState(false);
  const [showCreateDesignDialog, setShowCreateDesignDialog] = useState(false);

  // Mini-Game Block types based on your social media platform
  const [miniGameBlocks, setMiniGameBlocks] = useState<MiniGameBlock[]>([
    {
      id: 1,
      name: "Vibe Check-In",
      description: "Weekly Friday mood and energy assessment",
      frequency: "weekly",
      frequencyValue: 52, // 52 Fridays per year
      color: "#8B5CF6",
      category: "engagement",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 2,
      name: "Written Realms",
      description: "Waning Crescent creative writing prompts",
      frequency: "lunar_waning_crescent",
      frequencyValue: 12, // 12 Waning Crescents per year
      color: "#3B82F6",
      category: "astrological",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 3,
      name: "Sun Sign Spotlight",
      description: "Monthly zodiac sign deep dive",
      frequency: "monthly",
      frequencyValue: 12, // 12 months per year
      color: "#F59E0B",
      category: "astrological",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 4,
      name: "Full Moon Rituals",
      description: "Full moon ceremonial content",
      frequency: "lunar_full",
      frequencyValue: 12, // 12 Full Moons per year
      color: "#EC4899",
      category: "astrological",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 5,
      name: "New Moon Intentions",
      description: "New moon manifestation prompts",
      frequency: "lunar_new",
      frequencyValue: 12, // 12 New Moons per year
      color: "#10B981",
      category: "astrological",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    }
  ]);

  const [miniGameDesigns, setMiniGameDesigns] = useState<MiniGameDesign[]>([
    // Sample designs for Vibe Check-In
    {
      id: 1,
      miniGameBlockId: 1,
      title: "Vibe Check #1 - Energy Levels",
      description: "Rate your energy on a scale of 1-10",
      designNotes: "Use gradient backgrounds, include emoji reactions",
      status: "approved",
      targetDate: format(new Date(), 'yyyy-MM-dd'),
      designedDate: format(new Date(), 'yyyy-MM-dd'),
      reviewedDate: format(new Date(), 'yyyy-MM-dd'),
      approvedDate: format(new Date(), 'yyyy-MM-dd'),
      version: 1,
      isTemplate: false,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      updatedAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 2,
      miniGameBlockId: 1,
      title: "Vibe Check #2 - Mood Colors",
      description: "What color represents your current mood?",
      designNotes: "Color palette selection interface",
      status: "designed",
      targetDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
      designedDate: format(new Date(), 'yyyy-MM-dd'),
      reviewedDate: null,
      approvedDate: null,
      version: 1,
      isTemplate: false,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      updatedAt: format(new Date(), 'yyyy-MM-dd')
    }
  ]);

  const [newMiniGame, setNewMiniGame] = useState({
    name: "",
    description: "",
    frequency: "weekly",
    frequencyValue: 52,
    color: "#8B5CF6",
    category: "engagement"
  });

  const [newDesign, setNewDesign] = useState({
    miniGameBlockId: 0,
    title: "",
    description: "",
    designNotes: "",
    targetDate: ""
  });

  const frequencyOptions = [
    { value: "weekly", label: "Weekly (52/year)", count: 52 },
    { value: "monthly", label: "Monthly (12/year)", count: 12 },
    { value: "lunar_full", label: "Full Moon (12/year)", count: 12 },
    { value: "lunar_new", label: "New Moon (12/year)", count: 12 },
    { value: "lunar_waning_crescent", label: "Waning Crescent (12/year)", count: 12 },
    { value: "lunar_waxing_crescent", label: "Waxing Crescent (12/year)", count: 12 },
    { value: "seasonal", label: "Seasonal (4/year)", count: 4 },
    { value: "bi_weekly", label: "Bi-weekly (26/year)", count: 26 },
    { value: "custom", label: "Custom Frequency", count: 0 }
  ];

  const categoryOptions = [
    { value: "engagement", label: "Engagement", icon: "💬", color: "#8B5CF6" },
    { value: "astrological", label: "Astrological", icon: "🌙", color: "#3B82F6" },
    { value: "wellness", label: "Wellness", icon: "🧘", color: "#10B981" },
    { value: "creative", label: "Creative", icon: "🎨", color: "#F59E0B" },
    { value: "educational", label: "Educational", icon: "📚", color: "#EF4444" }
  ];

  const statusColors = {
    designed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    reviewed: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    archived: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
  };

  const getDesignsByMiniGame = (miniGameId: number) => {
    return miniGameDesigns.filter(design => design.miniGameBlockId === miniGameId);
  };

  const getProgressForMiniGame = (miniGameId: number) => {
    const designs = getDesignsByMiniGame(miniGameId);
    const miniGame = miniGameBlocks.find(mg => mg.id === miniGameId);
    if (!miniGame) return 0;
    
    const approvedDesigns = designs.filter(d => d.status === 'approved').length;
    return Math.round((approvedDesigns / miniGame.frequencyValue) * 100);
  };

  const getStatusCountForMiniGame = (miniGameId: number, status: string) => {
    return getDesignsByMiniGame(miniGameId).filter(d => d.status === status).length;
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categoryOptions.find(cat => cat.value === category);
    return categoryData?.icon || "🎮";
  };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-heading font-bold text-purple-600 flex items-center">
          <Gamepad2 className="text-purple-500 mr-3 h-6 w-6" />
          Mini-Game Block Studio ✨
        </h3>
        <div className="flex gap-2">
          <Dialog open={showCreateMiniGameDialog} onOpenChange={setShowCreateMiniGameDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-xl">
                <Sparkles className="h-4 w-4 mr-2" />
                New Mini-Game
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl max-w-md">
              <DialogHeader>
                <DialogTitle>Create Mini-Game Block</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="miniGameName">Mini-Game Name</Label>
                  <Input
                    id="miniGameName"
                    value={newMiniGame.name}
                    onChange={(e) => setNewMiniGame({...newMiniGame, name: e.target.value})}
                    placeholder="e.g., Vibe Check-In"
                  />
                </div>
                <div>
                  <Label htmlFor="miniGameDescription">Description</Label>
                  <Textarea
                    id="miniGameDescription"
                    value={newMiniGame.description}
                    onChange={(e) => setNewMiniGame({...newMiniGame, description: e.target.value})}
                    placeholder="Describe this mini-game..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select 
                      value={newMiniGame.frequency} 
                      onValueChange={(value) => {
                        const freq = frequencyOptions.find(f => f.value === value);
                        setNewMiniGame({
                          ...newMiniGame, 
                          frequency: value,
                          frequencyValue: freq?.count || 0
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {frequencyOptions.map(freq => (
                          <SelectItem key={freq.value} value={freq.value}>
                            {freq.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newMiniGame.category} onValueChange={(value) => setNewMiniGame({...newMiniGame, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.icon} {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {newMiniGame.frequency === "custom" && (
                  <div>
                    <Label htmlFor="customFrequency">Custom Frequency (per year)</Label>
                    <Input
                      id="customFrequency"
                      type="number"
                      value={newMiniGame.frequencyValue}
                      onChange={(e) => setNewMiniGame({...newMiniGame, frequencyValue: parseInt(e.target.value) || 0})}
                      placeholder="Enter number per year"
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="miniGameColor">Theme Color</Label>
                  <Input
                    id="miniGameColor"
                    type="color"
                    value={newMiniGame.color}
                    onChange={(e) => setNewMiniGame({...newMiniGame, color: e.target.value})}
                  />
                </div>
                <Button 
                  onClick={() => {
                    const miniGame: MiniGameBlock = {
                      id: Date.now(),
                      ...newMiniGame,
                      isActive: true,
                      createdAt: format(new Date(), 'yyyy-MM-dd')
                    };
                    setMiniGameBlocks([...miniGameBlocks, miniGame]);
                    setNewMiniGame({
                      name: "",
                      description: "",
                      frequency: "weekly",
                      frequencyValue: 52,
                      color: "#8B5CF6",
                      category: "engagement"
                    });
                    setShowCreateMiniGameDialog(false);
                  }}
                  className="w-full rounded-xl"
                >
                  Create Mini-Game Block
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateDesignDialog} onOpenChange={setShowCreateDesignDialog}>
            <DialogTrigger asChild>
              <Button className="rounded-xl">
                <Palette className="h-4 w-4 mr-2" />
                New Design
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Create Design</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="designMiniGame">Mini-Game Block</Label>
                  <Select value={newDesign.miniGameBlockId.toString()} onValueChange={(value) => setNewDesign({...newDesign, miniGameBlockId: parseInt(value)})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mini-game block" />
                    </SelectTrigger>
                    <SelectContent>
                      {miniGameBlocks.map(mg => (
                        <SelectItem key={mg.id} value={mg.id.toString()}>
                          {getCategoryIcon(mg.category)} {mg.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="designTitle">Design Title</Label>
                  <Input
                    id="designTitle"
                    value={newDesign.title}
                    onChange={(e) => setNewDesign({...newDesign, title: e.target.value})}
                    placeholder="Design title..."
                  />
                </div>
                <div>
                  <Label htmlFor="designDescription">Description</Label>
                  <Textarea
                    id="designDescription"
                    value={newDesign.description}
                    onChange={(e) => setNewDesign({...newDesign, description: e.target.value})}
                    placeholder="What does this design do?"
                  />
                </div>
                <div>
                  <Label htmlFor="designNotes">Design Notes</Label>
                  <Textarea
                    id="designNotes"
                    value={newDesign.designNotes}
                    onChange={(e) => setNewDesign({...newDesign, designNotes: e.target.value})}
                    placeholder="Visual elements, colors, interactions..."
                  />
                </div>
                <div>
                  <Label htmlFor="designTargetDate">Target Date</Label>
                  <Input
                    id="designTargetDate"
                    type="date"
                    value={newDesign.targetDate}
                    onChange={(e) => setNewDesign({...newDesign, targetDate: e.target.value})}
                  />
                </div>
                <Button 
                  onClick={() => {
                    const design: MiniGameDesign = {
                      id: Date.now(),
                      ...newDesign,
                      status: "designed",
                      designedDate: format(new Date(), 'yyyy-MM-dd'),
                      reviewedDate: null,
                      approvedDate: null,
                      version: 1,
                      isTemplate: false,
                      createdAt: format(new Date(), 'yyyy-MM-dd'),
                      updatedAt: format(new Date(), 'yyyy-MM-dd')
                    };
                    setMiniGameDesigns([...miniGameDesigns, design]);
                    setNewDesign({
                      miniGameBlockId: 0,
                      title: "",
                      description: "",
                      designNotes: "",
                      targetDate: ""
                    });
                    setShowCreateDesignDialog(false);
                  }}
                  className="w-full rounded-xl"
                >
                  Create Design
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
          <TabsTrigger value="progress" className="rounded-lg">Progress Tracker</TabsTrigger>
          <TabsTrigger value="designs" className="rounded-lg">Design Queue</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-lg">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Mini-Game Blocks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {miniGameBlocks.map(miniGame => {
              const progress = getProgressForMiniGame(miniGame.id);
              const designs = getDesignsByMiniGame(miniGame.id);
              
              return (
                <Card key={miniGame.id} className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl overflow-hidden">
                  <div 
                    className="h-3 w-full"
                    style={{ backgroundColor: miniGame.color }}
                  />
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">{getCategoryIcon(miniGame.category)}</span>
                        <div>
                          <h4 className="font-bold">{miniGame.name}</h4>
                          <p className="text-xs text-gray-500 font-normal">
                            {miniGame.frequencyValue} designs/year
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedMiniGame(miniGame.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">{miniGame.description}</p>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Annual Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Designed:</span>
                          <span className="font-medium">{getStatusCountForMiniGame(miniGame.id, 'designed')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Approved:</span>
                          <span className="font-medium">{getStatusCountForMiniGame(miniGame.id, 'approved')}</span>
                        </div>
                      </div>
                      
                      <Badge variant="outline" className="text-xs">
                        {frequencyOptions.find(f => f.value === miniGame.frequency)?.label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          {/* Vertical Progress Bars like ContentAiCompanion */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-purple-500" />
                Annual Design Progress Tracker
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {miniGameBlocks.map(miniGame => {
                  const progress = getProgressForMiniGame(miniGame.id);
                  const approvedCount = getStatusCountForMiniGame(miniGame.id, 'approved');
                  const targetCount = miniGame.frequencyValue;
                  
                  return (
                    <div key={miniGame.id} className="text-center">
                      <div className="mb-3">
                        <h4 className="font-medium text-sm text-gray-800 mb-1">{miniGame.name}</h4>
                        <p className="text-xs text-gray-500">
                          {approvedCount}/{targetCount} designs
                        </p>
                      </div>
                      
                      {/* Vertical Progress Bar */}
                      <div className="relative mx-auto w-8 h-48 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="absolute bottom-0 w-full rounded-full transition-all duration-300 ease-in-out"
                          style={{ 
                            height: `${progress}%`,
                            backgroundColor: miniGame.color
                          }}
                        />
                        <div className="absolute inset-0 flex items-end justify-center pb-2">
                          <span className="text-xs font-bold text-white drop-shadow-lg">
                            {progress}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-3 space-y-1">
                        <div className="text-xs text-gray-600">
                          Remaining: {targetCount - approvedCount}
                        </div>
                        <Badge 
                          className="text-xs" 
                          style={{ backgroundColor: miniGame.color + '20', color: miniGame.color }}
                        >
                          {getCategoryIcon(miniGame.category)} {miniGame.category}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="designs" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2 text-purple-500" />
                Design Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              {miniGameDesigns.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No designs yet. Create your first design to get started!
                </div>
              ) : (
                <div className="space-y-3">
                  {miniGameDesigns.map(design => {
                    const miniGame = miniGameBlocks.find(mg => mg.id === design.miniGameBlockId);
                    return (
                      <div key={design.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{getCategoryIcon(miniGame?.category || 'engagement')}</span>
                            <h4 className="font-medium text-gray-800">{design.title}</h4>
                            <Badge className={`text-xs ${statusColors[design.status as keyof typeof statusColors]}`}>
                              {design.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{design.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Mini-Game: {miniGame?.name}</span>
                            {design.targetDate && (
                              <span>Target: {format(new Date(design.targetDate), 'MMM dd')}</span>
                            )}
                            <span>v{design.version}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-400 to-cyan-500 text-white shadow-lg border-0 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Mini-Games</p>
                    <p className="text-3xl font-bold">{miniGameBlocks.length}</p>
                  </div>
                  <Gamepad2 className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg border-0 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Designs Created</p>
                    <p className="text-3xl font-bold">{miniGameDesigns.length}</p>
                  </div>
                  <Palette className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-400 to-pink-500 text-white shadow-lg border-0 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Approved Designs</p>
                    <p className="text-3xl font-bold">{miniGameDesigns.filter(d => d.status === 'approved').length}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-purple-500" />
                Category Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryOptions.map(category => {
                  const categoryMiniGames = miniGameBlocks.filter(mg => mg.category === category.value);
                  const categoryDesigns = miniGameDesigns.filter(d => 
                    categoryMiniGames.some(mg => mg.id === d.miniGameBlockId)
                  );
                  const approvedDesigns = categoryDesigns.filter(d => d.status === 'approved').length;
                  const totalNeeded = categoryMiniGames.reduce((sum, mg) => sum + mg.frequencyValue, 0);
                  const progress = totalNeeded > 0 ? Math.round((approvedDesigns / totalNeeded) * 100) : 0;
                  
                  return (
                    <div key={category.value} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{category.icon}</span>
                        <div>
                          <h4 className="font-medium">{category.label}</h4>
                          <p className="text-sm text-gray-600">
                            {categoryMiniGames.length} mini-games, {approvedDesigns}/{totalNeeded} designs
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold" style={{ color: category.color }}>
                          {progress}%
                        </div>
                        <Progress value={progress} className="w-20 h-2" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}
