import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Gamepad2, 
  Target, 
  TrendingUp, 
  Edit,
  Plus,
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  BarChart3
} from "lucide-react";
import { format } from "date-fns";

// Types
interface MiniGameBlock {
  id: number;
  name: string;
  frequency: string;
  frequencyValue: number;
  category: string;
  createdAt: string;
}

interface MiniGameDesign {
  id: number;
  miniGameId: number;
  designTitle: string;
  miniGameType: string;
  zodiacSign?: string;
  moonPhase?: string;
  traditionalFullMoonName?: string;
  contentDescription: string;
  designNotes: string;
  targetDate?: string;
  status: 'planned' | 'designed' | 'reviewed' | 'approved';
  createdAt: string;
}

export default function ContentCreationSection() {
  // State management
  const [editingMiniGame, setEditingMiniGame] = useState<number | null>(null);
  const [editMiniGameData, setEditMiniGameData] = useState({
    name: "",
    frequency: "",
    frequencyValue: 0,
    category: ""
  });
  const [selectedMiniGame, setSelectedMiniGame] = useState<number | null>(null);
  const [showCreateMiniGameDialog, setShowCreateMiniGameDialog] = useState(false);
  const [showCreateDesignDialog, setShowCreateDesignDialog] = useState(false);

  // Mini-Game Block types for rotationONLY Magazine
  const [miniGameBlocks, setMiniGameBlocks] = useState<MiniGameBlock[]>([
    {
      id: 1,
      name: "Positive Affirmations",
      frequency: "every_friday",
      frequencyValue: 52,
      category: "self_love",
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 2,
      name: "She Stays On My Mind",
      frequency: "every_friday", 
      frequencyValue: 52,
      category: "relationships",
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 3,
      name: "The Way He Makes Me Feel",
      frequency: "every_friday",
      frequencyValue: 52,
      category: "relationships",
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 4,
      name: "Written Realms",
      frequency: "every_friday",
      frequencyValue: 52,
      category: "creative_writing",
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 5,
      name: "Sun Signs",
      frequency: "monthly",
      frequencyValue: 12,
      category: "astrology",
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 6,
      name: "Moon Cycle",
      frequency: "monthly",
      frequencyValue: 12,
      category: "astrology",
      createdAt: format(new Date(), 'yyyy-MM-dd')
    }
  ]);

  // Sample mini-game designs
  const [miniGameDesigns, setMiniGameDesigns] = useState<MiniGameDesign[]>([
    {
      id: 1,
      miniGameId: 1,
      designTitle: "Self-Love Sunday On New Moon in Pisces",
      miniGameType: "Positive Affirmations",
      zodiacSign: "Pisces",
      moonPhase: "New Moon",
      contentDescription: "Weekly affirmations focused on self-compassion and inner peace.",
      designNotes: "Use soft, flowing typography with celestial elements.",
      targetDate: "2025-06-08",
      status: 'approved',
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 2,
      miniGameId: 4,
      designTitle: "Mystical Adventures On Waxing Crescent in Leo",
      miniGameType: "Written Realms", 
      zodiacSign: "Leo",
      moonPhase: "Waxing Crescent",
      contentDescription: "Creative writing prompts for fantasy and magical realism.",
      designNotes: "Bold, dramatic fonts with golden accents.",
      targetDate: "2025-06-15",
      status: 'designed',
      createdAt: format(new Date(), 'yyyy-MM-dd')
    }
  ]);

  // Frequency options
  const frequencyOptions = [
    { value: "every_friday", label: "Every Friday (52/year)", count: 52 },
    { value: "bi_weekly", label: "Bi-weekly (26/year)", count: 26 },
    { value: "monthly", label: "Monthly (12/year)", count: 12 },
    { value: "quarterly", label: "Quarterly (4/year)", count: 4 },
    { value: "seasonal", label: "Seasonal (4/year)", count: 4 },
    { value: "annual", label: "Annual (1/year)", count: 1 }
  ];

  // Category options
  const categoryOptions = [
    { value: "self_love", label: "Self Love & Wellness", icon: "💕", color: "#EC4899" },
    { value: "relationships", label: "Relationships", icon: "💖", color: "#F97316" },
    { value: "creative_writing", label: "Creative Writing", icon: "✍️", color: "#8B5CF6" },
    { value: "astrology", label: "Astrology & Spirituality", icon: "🌙", color: "#06B6D4" },
    { value: "lifestyle", label: "Lifestyle & Fashion", icon: "✨", color: "#10B981" },
    { value: "career", label: "Career & Growth", icon: "🚀", color: "#F59E0B" }
  ];

  // Progress calculation functions
  const getDesignsByMiniGame = (miniGameId: number) => {
    return miniGameDesigns.filter(design => design.miniGameId === miniGameId);
  };

  const getProgressForMiniGame = (miniGameId: number) => {
    const miniGame = miniGameBlocks.find(mg => mg.id === miniGameId);
    if (!miniGame) return { progress: 0, completed: 0, total: 0, remaining: 0 };
    
    const designs = getDesignsByMiniGame(miniGameId);
    const approvedDesigns = designs.filter(d => d.status === 'approved').length;
    const totalNeeded = miniGame.frequencyValue;
    const remaining = Math.max(0, totalNeeded - approvedDesigns);
    const progress = totalNeeded > 0 ? (approvedDesigns / totalNeeded) * 100 : 0;
    
    return {
      progress: Math.min(Math.round(progress), 100),
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

  // Edit mini-game functions
  const startEditingMiniGame = (miniGame: MiniGameBlock) => {
    setEditingMiniGame(miniGame.id);
    setEditMiniGameData({
      name: miniGame.name,
      frequency: miniGame.frequency,
      frequencyValue: miniGame.frequencyValue,
      category: miniGame.category
    });
  };

  const saveEditedMiniGame = () => {
    if (!editingMiniGame) return;
    
    setMiniGameBlocks(prevBlocks => 
      prevBlocks.map(block => 
        block.id === editingMiniGame 
          ? { ...block, ...editMiniGameData }
          : block
      )
    );
    
    setEditingMiniGame(null);
    setEditMiniGameData({
      name: "",
      frequency: "",
      frequencyValue: 0,
      category: ""
    });
  };

  const cancelEditingMiniGame = () => {
    setEditingMiniGame(null);
    setEditMiniGameData({
      name: "",
      frequency: "",
      frequencyValue: 0,
      category: ""
    });
  };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-xl font-heading font-bold text-purple-600 flex items-center">
          <Gamepad2 className="text-purple-500 mr-3 h-5 w-5" />
          rotationONLY Magazine ✨
        </h4>
        <div className="flex gap-2">
          <Dialog open={showCreateDesignDialog} onOpenChange={setShowCreateDesignDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-xl">
                <Target className="h-4 w-4 mr-2" />
                New Block
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="pb-4 border-b border-gray-100 dark:border-gray-700">
                <DialogTitle className="text-xl font-heading bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent flex items-center">
                  <Target className="h-5 w-5 text-purple-500 mr-2" />
                  Create New Design Block
                </DialogTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Design a new content piece for your selected mini-game block
                </p>
              </DialogHeader>
              {/* Add create design form content here */}
            </DialogContent>
          </Dialog>
          
          <Dialog open={showCreateMiniGameDialog} onOpenChange={setShowCreateMiniGameDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-xl">
                <Plus className="h-4 w-4 mr-2" />
                New Mini-Game
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-heading bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  Create New Mini-Game Block
                </DialogTitle>
              </DialogHeader>
              {/* Add create mini-game form content here */}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-6">
        <Tabs defaultValue="blocks" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="blocks" className="rounded-lg">Mini-Game Blocks</TabsTrigger>
            <TabsTrigger value="designs" className="rounded-lg">Design Library</TabsTrigger>
            <TabsTrigger value="progress" className="rounded-lg">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="blocks" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {miniGameBlocks.map(miniGame => {
                const progress = getProgressForMiniGame(miniGame.id);
                return (
                  <Card key={miniGame.id} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-200 rounded-2xl overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {editingMiniGame === miniGame.id ? (
                            <Input
                              value={editMiniGameData.name}
                              onChange={(e) => setEditMiniGameData(prev => ({...prev, name: e.target.value}))}
                              className="text-lg font-bold mb-2"
                              placeholder="Mini-Game Name"
                            />
                          ) : (
                            <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                              <span className="text-2xl mr-3">{getCategoryIcon(miniGame.category)}</span>
                              {miniGame.name}
                            </CardTitle>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditingMiniGame(miniGame)}
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span className="font-medium">{progress.completed}/{progress.total}</span>
                        </div>
                        <Progress value={progress.progress} className="h-2" />
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="font-bold text-green-600 dark:text-green-400">
                              {getStatusCountForMiniGame(miniGame.id, 'approved')}
                            </div>
                            <div className="text-green-600/70 dark:text-green-400/70">Approved</div>
                          </div>
                          <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <div className="font-bold text-yellow-600 dark:text-yellow-400">
                              {getStatusCountForMiniGame(miniGame.id, 'designed') + getStatusCountForMiniGame(miniGame.id, 'reviewed')}
                            </div>
                            <div className="text-yellow-600/70 dark:text-yellow-400/70">In Progress</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="font-bold text-gray-600 dark:text-gray-400">
                              {progress.remaining}
                            </div>
                            <div className="text-gray-500 dark:text-gray-500">Remaining</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="designs" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {miniGameDesigns.map(design => {
                const miniGame = miniGameBlocks.find(mg => mg.id === design.miniGameId);
                return (
                  <Card key={design.id} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-200 rounded-2xl">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                            {design.designTitle}
                          </CardTitle>
                          <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                            {miniGame?.name}
                          </p>
                        </div>
                        <Badge 
                          variant={design.status === 'approved' ? 'default' : 'secondary'}
                          className={`${
                            design.status === 'approved' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' 
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200'
                          }`}
                        >
                          {design.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                          {design.contentDescription}
                        </p>
                        {design.targetDate && (
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Calendar className="h-4 w-4 mr-2" />
                            {format(new Date(design.targetDate), 'MMM d, yyyy')}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="text-purple-500 mr-3 h-5 w-5" />
                  Progress Tracking Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border">
                  <h4 className="text-lg font-semibold mb-4 text-purple-800">Annual Content Overview</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {miniGameBlocks.reduce((sum, mg) => sum + mg.frequencyValue, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Total Designs Needed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {miniGameBlocks.reduce((sum, mg) => {
                          const progress = getProgressForMiniGame(mg.id);
                          return sum + progress.completed;
                        }, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {miniGameBlocks.reduce((sum, mg) => {
                          return sum + getStatusCountForMiniGame(mg.id, 'designed') + getStatusCountForMiniGame(mg.id, 'reviewed');
                        }, 0)}
                      </div>
                      <div className="text-sm text-gray-600">In Progress</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {miniGameBlocks.reduce((sum, mg) => {
                          const progress = getProgressForMiniGame(mg.id);
                          return sum + progress.remaining;
                        }, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Remaining</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}