
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
  const [activeBrand, setActiveBrand] = useState<string>("rotationONLY");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMiniGame, setSelectedMiniGame] = useState<number | null>(null);
  const [showCreateMiniGameDialog, setShowCreateMiniGameDialog] = useState(false);
  const [showCreateDesignDialog, setShowCreateDesignDialog] = useState(false);

  // Brand definitions
  const brands = [
    {
      id: "rotationONLY",
      name: "𝔯𝔬𝔱𝔞𝔱𝔦𝔬𝔫𝐎𝐍𝐋𝐘 Magazine",
      icon: "🌙",
      color: "#8B5CF6",
      description: "Astrological content and mini-game blocks",
      hasMiniGames: true
    },
    {
      id: "reallyObvi",
      name: "Really Obvi Media Lab",
      icon: "🧪",
      color: "#3B82F6",
      description: "Media experiments and creative projects",
      hasMiniGames: false
    },
    {
      id: "personal",
      name: "Personal Brand",
      icon: "✨",
      color: "#EC4899",
      description: "Personal content and thought leadership",
      hasMiniGames: false
    },
    {
      id: "misc",
      name: "Misc",
      icon: "📦",
      color: "#10B981",
      description: "Miscellaneous content and collaborations",
      hasMiniGames: false
    }
  ];

  // Mini-Game Block types for 𝔯𝔬𝔱𝔞𝔱𝔦𝔬𝔫𝐎𝐍𝐋𝐘 Magazine
  const [miniGameBlocks, setMiniGameBlocks] = useState<MiniGameBlock[]>([
    {
      id: 1,
      name: "Vibe Check-In",
      dateOfPost: "2025-06-06",
      astrologicalSign: "gemini",
      frequency: "every_friday",
      frequencyValue: 52, // 52 Fridays per year
      color: "#8B5CF6",
      category: "engagement",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 2,
      name: "Written Realms",
      dateOfPost: "2025-06-11",
      astrologicalSign: "cancer",
      frequency: "every_2nd_wednesday",
      frequencyValue: 12, // 12 Second Wednesdays per year
      color: "#3B82F6",
      category: "definition_introductions",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 3,
      name: "Sun Sign Spotlight",
      dateOfPost: "2025-06-07",
      astrologicalSign: "leo",
      frequency: "every_1st_friday",
      frequencyValue: 12, // 12 First Fridays per year
      color: "#F59E0B",
      category: "apple_music",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    }
  ]);

  // Content for other brands (without mini-games)
  const [brandContent, setBrandContent] = useState({
    reallyObvi: [],
    personal: [],
    misc: []
  });

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
    dateOfPost: "",
    astrologicalSign: "",
    frequency: "every_friday",
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
    { value: "every_friday", label: "Every Friday (52/year)", count: 52 },
    { value: "every_1st_friday", label: "Every 1st Friday (12/year)", count: 12 },
    { value: "every_2nd_wednesday", label: "Every 2nd Wednesday (12/year)", count: 12 }
  ];

  const categoryOptions = [
    { value: "administration", label: "Administration", icon: "⚙️", color: "#6B7280" },
    { value: "definition_introductions", label: "Definition & Introductions", icon: "📖", color: "#3B82F6" },
    { value: "engagement", label: "Engagement", icon: "💬", color: "#8B5CF6" },
    { value: "apple_music", label: "Apple Music", icon: "🎵", color: "#F59E0B" },
    { value: "other", label: "Other", icon: "📦", color: "#10B981" }
  ];

  const astrologicalSignOptions = [
    { value: "", label: "None" },
    { value: "aries", label: "Aries ♈" },
    { value: "taurus", label: "Taurus ♉" },
    { value: "gemini", label: "Gemini ♊" },
    { value: "cancer", label: "Cancer ♋" },
    { value: "leo", label: "Leo ♌" },
    { value: "virgo", label: "Virgo ♍" },
    { value: "libra", label: "Libra ♎" },
    { value: "scorpio", label: "Scorpio ♏" },
    { value: "sagittarius", label: "Sagittarius ♐" },
    { value: "capricorn", label: "Capricorn ♑" },
    { value: "aquarius", label: "Aquarius ♒" },
    { value: "pisces", label: "Pisces ♓" }
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
    if (!miniGame) return { progress: 0, completed: 0, total: 0, remaining: 0 };
    
    const approvedDesigns = designs.filter(d => d.status === 'approved').length;
    const totalNeeded = miniGame.frequencyValue;
    const remaining = Math.max(0, totalNeeded - approvedDesigns);
    
    // Each approved design represents one unit of progress
    // Progress = (approved designs / total needed) * 100
    const progress = totalNeeded > 0 ? (approvedDesigns / totalNeeded) * 100 : 0;
    
    return {
      progress: Math.min(Math.round(progress), 100), // Cap at 100%
      completed: approvedDesigns,
      total: totalNeeded,
      remaining: remaining
    };
  };

  const getStatusCountForMiniGame = (miniGameId: number, status: string) => {
    return getDesignsByMiniGame(miniGameId).filter(d => d.status === status).length;
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categoryOptions.find(cat => cat.value === category);
    return categoryData?.icon || "🎮";
  };

  const currentBrand = brands.find(b => b.id === activeBrand);

  return (
    <section className="mb-8">
      {/* Brand Selection */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-heading font-bold bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent flex items-center">
            <Briefcase className="text-purple-500 mr-3 h-6 w-6" />
            Content Management Suite
          </h3>
          <p className="text-muted-foreground dark:text-gray-300 mt-1">
            Manage content across all your brands
          </p>
        </div>
      </div>

      {/* Brand Navigation */}
      <div className="mb-6">
        <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          {brands.map(brand => (
            <button
              key={brand.id}
              onClick={() => setActiveBrand(brand.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeBrand === brand.id
                  ? 'bg-white dark:bg-gray-700 shadow-md text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span className="text-lg">{brand.icon}</span>
              <span className="font-medium text-sm">{brand.name}</span>
            </button>
          ))}
        </div>
        
        {currentBrand && (
          <div className="mt-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl">
            <div className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: currentBrand.color }}
              />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">{currentBrand.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{currentBrand.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content Based on Selected Brand */}
      {activeBrand === "rotationONLY" ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xl font-heading font-bold text-purple-600 flex items-center">
              <Gamepad2 className="text-purple-500 mr-3 h-5 w-5" />
              Mini-Game Block Studio ✨
            </h4>
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
                  <Label htmlFor="dateOfPost">Date of Post</Label>
                  <Input
                    id="dateOfPost"
                    type="date"
                    value={newMiniGame.dateOfPost}
                    onChange={(e) => setNewMiniGame({...newMiniGame, dateOfPost: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="astrologicalSign">Astrological Sign</Label>
                  <Select 
                    value={newMiniGame.astrologicalSign} 
                    onValueChange={(value) => setNewMiniGame({...newMiniGame, astrologicalSign: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select astrological sign" />
                    </SelectTrigger>
                    <SelectContent>
                      {astrologicalSignOptions.map(sign => (
                        <SelectItem key={sign.value} value={sign.value}>
                          {sign.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      dateOfPost: "",
                      astrologicalSign: "",
                      frequency: "every_friday",
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
              const progressData = getProgressForMiniGame(miniGame.id);
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
                    <div className="text-gray-600 text-sm mb-4 space-y-1">
                      <div>📅 {miniGame.dateOfPost && format(new Date(miniGame.dateOfPost), 'MMMM d, yyyy')}</div>
                      {miniGame.astrologicalSign && (
                        <div>✨ {astrologicalSignOptions.find(sign => sign.value === miniGame.astrologicalSign)?.label}</div>
                      )}
                      <div>🔄 {frequencyOptions.find(freq => freq.value === miniGame.frequency)?.label}</div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Annual Progress</span>
                          <span className="font-medium">{progressData.completed}/{progressData.total}</span>
                        </div>
                        <div className="flex justify-between text-xs mb-2 text-gray-500">
                          <span>Completion Rate</span>
                          <span>{progressData.progress}%</span>
                        </div>
                        <Progress value={progressData.progress} className="h-3" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Designed:</span>
                          <span className="font-medium">{getStatusCountForMiniGame(miniGame.id, 'designed')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Remaining:</span>
                          <span className="font-medium text-orange-600">{progressData.remaining}</span>
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
                  const progressData = getProgressForMiniGame(miniGame.id);
                  
                  return (
                    <div key={miniGame.id} className="text-center">
                      <div className="mb-3">
                        <h4 className="font-medium text-sm text-gray-800 mb-1">{miniGame.name}</h4>
                        <p className="text-xs text-gray-500">
                          {progressData.completed}/{progressData.total} designs
                        </p>
                      </div>
                      
                      {/* Vertical Progress Bar with Individual Design Notches */}
                      <div className="relative mx-auto w-12 h-48 bg-gray-200 rounded-full overflow-hidden border-2 border-gray-300">
                        {/* Progress Fill */}
                        <div 
                          className="absolute bottom-0 w-full transition-all duration-700 ease-in-out"
                          style={{ 
                            height: `${progressData.progress}%`,
                            background: `linear-gradient(to top, ${miniGame.color}, ${miniGame.color}99)`
                          }}
                        />
                        
                        {/* Individual Design Notches - Each represents one design needed */}
                        {Array.from({ length: progressData.total }, (_, i) => {
                          const notchPosition = ((i + 1) / progressData.total) * 100;
                          const isCompleted = i < progressData.completed;
                          
                          return (
                            <div
                              key={i}
                              className={`absolute w-full h-0.5 transition-all duration-300 ${
                                isCompleted 
                                  ? 'bg-white/60 shadow-sm' 
                                  : 'bg-gray-400/60'
                              }`}
                              style={{ bottom: `${notchPosition}%` }}
                            />
                          );
                        })}
                        
                        {/* Quarter markers for visual reference */}
                        {[25, 50, 75].map(quarter => (
                          <div
                            key={quarter}
                            className="absolute w-full h-1 bg-gray-300/80"
                            style={{ bottom: `${quarter}%` }}
                          />
                        ))}
                        
                        {/* Progress Text */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-xs font-bold text-white drop-shadow-lg">
                              {progressData.completed}
                            </div>
                            <div className="text-xs text-white/80 drop-shadow-lg">
                              of {progressData.total}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 space-y-2">
                        <div className="text-xs text-gray-600 font-medium">
                          {progressData.remaining} remaining
                        </div>
                        <div className="text-xs text-gray-500">
                          {progressData.progress}% complete
                        </div>
                        <Badge 
                          className="text-xs" 
                          style={{ backgroundColor: miniGame.color + '20', color: miniGame.color }}
                        >
                          {getCategoryIcon(miniGame.category)} {miniGame.category}
                        </Badge>
                        
                        {/* Quick Action Button */}
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="w-full text-xs h-7"
                          onClick={() => {
                            setNewDesign({
                              ...newDesign,
                              miniGameBlockId: miniGame.id
                            });
                            setShowCreateDesignDialog(true);
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Design
                        </Button>
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
                          {design.status === 'designed' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                const updatedDesigns = miniGameDesigns.map(d => 
                                  d.id === design.id 
                                    ? { ...d, status: 'approved', approvedDate: format(new Date(), 'yyyy-MM-dd') }
                                    : d
                                );
                                setMiniGameDesigns(updatedDesigns);
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          )}
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
                  const designedNotApproved = categoryDesigns.filter(d => d.status === 'designed').length;
                  const progress = totalNeeded > 0 ? Math.round((approvedDesigns / totalNeeded) * 100) : 0;
                  
                  if (categoryMiniGames.length === 0) return null;
                  
                  return (
                    <div key={category.value} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{category.icon}</span>
                        <div>
                          <h4 className="font-medium">{category.label}</h4>
                          <p className="text-sm text-gray-600">
                            {categoryMiniGames.length} mini-games • {approvedDesigns}/{totalNeeded} approved
                          </p>
                          {designedNotApproved > 0 && (
                            <p className="text-xs text-orange-600">
                              {designedNotApproved} awaiting approval
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold" style={{ color: category.color }}>
                          {progress}%
                        </div>
                        <Progress value={progress} className="w-24 h-3" />
                        <div className="text-xs text-gray-500 mt-1">
                          {totalNeeded - approvedDesigns} remaining
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </>
      ) : (
        <div className="space-y-6">
          {/* Other Brand Content Management */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="text-2xl">{currentBrand?.icon}</span>
                <div>
                  <h4 className="text-lg">{currentBrand?.name}</h4>
                  <p className="text-sm text-muted-foreground font-normal">Content Pipeline & Strategy</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-4 rounded-xl">
                  <TabsTrigger value="content" className="rounded-lg">Content Pipeline</TabsTrigger>
                  <TabsTrigger value="calendar" className="rounded-lg">Content Calendar</TabsTrigger>
                  <TabsTrigger value="strategy" className="rounded-lg">Strategy & Goals</TabsTrigger>
                  <TabsTrigger value="analytics" className="rounded-lg">Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="mt-6">
                  <div className="text-center py-12 text-gray-500">
                    <PenTool className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">Content Pipeline Coming Soon</h3>
                    <p className="text-sm">Traditional content management for {currentBrand?.name}</p>
                    <Button className="mt-4" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Content Piece
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="calendar" className="mt-6">
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">Editorial Calendar</h3>
                    <p className="text-sm">Schedule and plan content releases</p>
                  </div>
                </TabsContent>

                <TabsContent value="strategy" className="mt-6">
                  <div className="text-center py-12 text-gray-500">
                    <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">Content Strategy</h3>
                    <p className="text-sm">Define goals and messaging for {currentBrand?.name}</p>
                  </div>
                </TabsContent>

                <TabsContent value="analytics" className="mt-6">
                  <div className="text-center py-12 text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">Performance Analytics</h3>
                    <p className="text-sm">Track engagement and reach metrics</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  );
}
