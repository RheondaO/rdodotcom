import React, { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Briefcase, 
  Gamepad2, 
  Sparkles, 
  Eye, 
  Calendar,
  TrendingUp,
  BarChart3,
  Clock,
  Target
} from 'lucide-react';

// Mini-Game Block type with new structure
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

// Mini-Game Design type
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
      name: "Administration",
      dateOfPost: "2025-06-01",
      astrologicalSign: "aries",
      frequency: "every_friday",
      frequencyValue: 52,
      color: "#6B7280",
      category: "administration",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 2,
      name: "Word of the Week",
      dateOfPost: "2025-06-02",
      astrologicalSign: "taurus",
      frequency: "every_friday",
      frequencyValue: 52,
      color: "#10B981",
      category: "definition_introductions",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 3,
      name: "Lucky && Blessed",
      dateOfPost: "2025-06-03",
      astrologicalSign: "gemini",
      frequency: "every_friday",
      frequencyValue: 52,
      color: "#F59E0B",
      category: "engagement",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 4,
      name: "Definitions & Introductions",
      dateOfPost: "2025-06-04",
      astrologicalSign: "cancer",
      frequency: "every_friday",
      frequencyValue: 52,
      color: "#3B82F6",
      category: "definition_introductions",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 5,
      name: "Positive Affirmations",
      dateOfPost: "2025-06-05",
      astrologicalSign: "leo",
      frequency: "every_friday",
      frequencyValue: 52,
      color: "#8B5CF6",
      category: "engagement",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 6,
      name: "Energetic Portals",
      dateOfPost: "2025-06-06",
      astrologicalSign: "virgo",
      frequency: "every_friday",
      frequencyValue: 52,
      color: "#EC4899",
      category: "engagement",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 7,
      name: "4x2 Laws of Maat",
      dateOfPost: "2025-06-07",
      astrologicalSign: "libra",
      frequency: "every_friday",
      frequencyValue: 52,
      color: "#EF4444",
      category: "definition_introductions",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 8,
      name: "She Stays On My Mind",
      dateOfPost: "2025-06-08",
      astrologicalSign: "scorpio",
      frequency: "every_friday",
      frequencyValue: 52,
      color: "#F97316",
      category: "apple_music",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 9,
      name: "The Way He Makes Me Feel",
      dateOfPost: "2025-06-09",
      astrologicalSign: "sagittarius",
      frequency: "every_friday",
      frequencyValue: 52,
      color: "#84CC16",
      category: "apple_music",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 10,
      name: "Written Realms",
      dateOfPost: "2025-06-10",
      astrologicalSign: "capricorn",
      frequency: "every_2nd_wednesday",
      frequencyValue: 12,
      color: "#06B6D4",
      category: "definition_introductions",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 11,
      name: "Angel Numbers",
      dateOfPost: "2025-06-11",
      astrologicalSign: "aquarius",
      frequency: "every_friday",
      frequencyValue: 52,
      color: "#8B5CF6",
      category: "engagement",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 12,
      name: "Moon Cycle",
      dateOfPost: "2025-06-12",
      astrologicalSign: "pisces",
      frequency: "every_friday",
      frequencyValue: 52,
      color: "#A855F7",
      category: "engagement",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 13,
      name: "Rock Talk (Let's Talk About Rocks Baby)",
      dateOfPost: "2025-06-13",
      astrologicalSign: "aries",
      frequency: "every_friday",
      frequencyValue: 52,
      color: "#F59E0B",
      category: "definition_introductions",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 14,
      name: "Intent Quest (Vibe Check-In)",
      dateOfPost: "2025-06-14",
      astrologicalSign: "taurus",
      frequency: "every_friday",
      frequencyValue: 52,
      color: "#10B981",
      category: "engagement",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 15,
      name: "Backchannel: Unfiltered, Unposted",
      dateOfPost: "2025-06-15",
      astrologicalSign: "gemini",
      frequency: "every_friday",
      frequencyValue: 52,
      color: "#EF4444",
      category: "other",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 16,
      name: "Quarterly Seasons - Solstice + Equinox",
      dateOfPost: "2025-06-21",
      astrologicalSign: "cancer",
      frequency: "every_1st_friday",
      frequencyValue: 4,
      color: "#8B5CF6",
      category: "engagement",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 17,
      name: "Sun Signs",
      dateOfPost: "2025-06-17",
      astrologicalSign: "leo",
      frequency: "every_friday",
      frequencyValue: 52,
      color: "#F97316",
      category: "engagement",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 18,
      name: "Safe Sex Saturdaze",
      dateOfPost: "2025-06-18",
      astrologicalSign: "virgo",
      frequency: "every_friday",
      frequencyValue: 52,
      color: "#EC4899",
      category: "other",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 19,
      name: "FreekyFridazeLive (Live Streams)",
      dateOfPost: "2025-06-19",
      astrologicalSign: "libra",
      frequency: "every_friday",
      frequencyValue: 52,
      color: "#8B5CF6",
      category: "other",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 20,
      name: "ThirstyThursdaze (Recipes)",
      dateOfPost: "2025-06-20",
      astrologicalSign: "scorpio",
      frequency: "every_friday",
      frequencyValue: 52,
      color: "#06B6D4",
      category: "other",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 21,
      name: "Numerology + Year Number",
      dateOfPost: "2025-06-21",
      astrologicalSign: "sagittarius",
      frequency: "every_friday",
      frequencyValue: 52,
      color: "#84CC16",
      category: "engagement",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 22,
      name: "Glow Mode (My Beauty Secrets)",
      dateOfPost: "2025-06-22",
      astrologicalSign: "capricorn",
      frequency: "every_friday",
      frequencyValue: 52,
      color: "#F59E0B",
      category: "other",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 23,
      name: "The Elevated Edit - Editorials; Op-Eds; The CEO Speaks",
      dateOfPost: "2025-06-23",
      astrologicalSign: "aquarius",
      frequency: "every_friday",
      frequencyValue: 52,
      color: "#A855F7",
      category: "other",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 24,
      name: "The Booth Report (Microphone)",
      dateOfPost: "2025-06-24",
      astrologicalSign: "pisces",
      frequency: "every_friday",
      frequencyValue: 52,
      color: "#EF4444",
      category: "other",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 25,
      name: "@SEXDotEdu",
      dateOfPost: "2025-06-25",
      astrologicalSign: "aries",
      frequency: "every_friday",
      frequencyValue: 52,
      color: "#EC4899",
      category: "other",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 26,
      name: "ThiccFitt - Workout Plans \\ Weekly + Monthly Challenges",
      dateOfPost: "2025-06-26",
      astrologicalSign: "taurus",
      frequency: "every_friday",
      frequencyValue: 52,
      color: "#10B981",
      category: "other",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 27,
      name: "The Guide (Monthly Schedule + Weekly Schedule)",
      dateOfPost: "2025-06-27",
      astrologicalSign: "gemini",
      frequency: "every_friday",
      frequencyValue: 52,
      color: "#3B82F6",
      category: "administration",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 28,
      name: "The Wealth Portal - Quarterly",
      dateOfPost: "2025-06-28",
      astrologicalSign: "cancer",
      frequency: "every_1st_friday",
      frequencyValue: 4,
      color: "#F59E0B",
      category: "other",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 29,
      name: "Cha-CHiNG! (Economics) - Quarterly",
      dateOfPost: "2025-06-29",
      astrologicalSign: "leo",
      frequency: "every_1st_friday",
      frequencyValue: 4,
      color: "#8B5CF6",
      category: "other",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 30,
      name: "OkieMaps",
      dateOfPost: "2025-06-30",
      astrologicalSign: "virgo",
      frequency: "every_friday",
      frequencyValue: 52,
      color: "#06B6D4",
      category: "other",
      isActive: true,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 31,
      name: "FearFactor",
      dateOfPost: "2025-07-01",
      astrologicalSign: "libra",
      frequency: "every_friday",
      frequencyValue: 52,
      color: "#84CC16",
      category: "engagement",
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

  // Sample mini-game designs
  const [miniGameDesigns, setMiniGameDesigns] = useState<MiniGameDesign[]>([
    {
      id: 1,
      miniGameBlockId: 1,
      title: "Weekly Admin Review",
      description: "Administrative check-in post template",
      designNotes: "Include progress updates and upcoming content",
      status: "approved",
      targetDate: "2025-06-07",
      designedDate: "2025-06-01",
      reviewedDate: "2025-06-02",
      approvedDate: "2025-06-03",
      version: 1,
      isTemplate: true,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      updatedAt: format(new Date(), 'yyyy-MM-dd')
    }
  ]);

  // New mini-game form state
  const [newMiniGame, setNewMiniGame] = useState({
    name: "",
    dateOfPost: "",
    astrologicalSign: "",
    frequency: "every_friday",
    frequencyValue: 52,
    color: "#8B5CF6",
    category: "engagement"
  });

  // New design form state
  const [newDesign, setNewDesign] = useState({
    miniGameBlockId: 0,
    title: "",
    description: "",
    designNotes: "",
    targetDate: ""
  });

  // Frequency options
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
              className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg transition-all duration-200 ${
                activeBrand === brand.id
                  ? 'bg-white dark:bg-gray-700 shadow-md text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
            >
              <span className="text-lg mr-2">{brand.icon}</span>
              <span className="text-sm font-medium hidden sm:block">{brand.name}</span>
            </button>
          ))}
        </div>
        
        {/* Brand Description */}
        {currentBrand && (
          <div className="mt-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border">
            <div className="flex items-center">
              <span className="text-2xl mr-3">{currentBrand.icon}</span>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">{currentBrand.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{currentBrand.description}</p>
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
              <Dialog open={showCreateDesignDialog} onOpenChange={setShowCreateDesignDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-xl">
                    <Target className="h-4 w-4 mr-2" />
                    New Design
                  </Button>
                </DialogTrigger>
              </Dialog>
              
              <Dialog open={showCreateMiniGameDialog} onOpenChange={setShowCreateMiniGameDialog}>
                <DialogTrigger asChild>
                  <Button className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                    <Sparkles className="h-4 w-4 mr-2" />
                    New Mini-Game
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>

          <Dialog open={showCreateMiniGameDialog} onOpenChange={setShowCreateMiniGameDialog}>
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
                          frequencyValue: freq?.count || 52
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
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
                    <Select 
                      value={newMiniGame.category} 
                      onValueChange={(value) => setNewMiniGame({...newMiniGame, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <span className="flex items-center">
                              <span className="mr-2">{cat.icon}</span>
                              {cat.label}
                            </span>
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
              <Button variant="outline" size="sm" className="rounded-xl">
                <Target className="h-4 w-4 mr-2" />
                New Design
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl max-w-md">
              <DialogHeader>
                <DialogTitle>Create Design Entry</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="designMiniGame">Mini-Game Block</Label>
                  <Select 
                    value={newDesign.miniGameBlockId.toString()} 
                    onValueChange={(value) => setNewDesign({...newDesign, miniGameBlockId: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select mini-game" />
                    </SelectTrigger>
                    <SelectContent>
                      {miniGameBlocks.map(mg => (
                        <SelectItem key={mg.id} value={mg.id.toString()}>
                          {mg.name}
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
                    placeholder="Enter design title"
                  />
                </div>
                <div>
                  <Label htmlFor="designDescription">Description</Label>
                  <Textarea
                    id="designDescription"
                    value={newDesign.description}
                    onChange={(e) => setNewDesign({...newDesign, description: e.target.value})}
                    placeholder="Describe the design concept"
                  />
                </div>
                <div>
                  <Label htmlFor="designNotes">Design Notes</Label>
                  <Textarea
                    id="designNotes"
                    value={newDesign.designNotes}
                    onChange={(e) => setNewDesign({...newDesign, designNotes: e.target.value})}
                    placeholder="Additional notes and requirements"
                  />
                </div>
                <div>
                  <Label htmlFor="targetDate">Target Date</Label>
                  <Input
                    id="targetDate"
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
                            onClick={() => setSelectedMiniGame(selectedMiniGame === miniGame.id ? null : miniGame.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-gray-600 text-sm mb-4 space-y-1">
                          <div>📅 {miniGame.dateOfPost && format(new Date(miniGame.dateOfPost), 'MMMM d, yyyy')}</div>
                          {miniGame.astrologicalSign && (
                            <div>✨ {miniGame.name} during {astrologicalSignOptions.find(sign => sign.value === miniGame.astrologicalSign)?.label}</div>
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
                          
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center p-2 bg-blue-50 rounded-lg">
                              <div className="font-semibold text-blue-600">{getStatusCountForMiniGame(miniGame.id, 'designed')}</div>
                              <div className="text-blue-500">Designed</div>
                            </div>
                            <div className="text-center p-2 bg-yellow-50 rounded-lg">
                              <div className="font-semibold text-yellow-600">{getStatusCountForMiniGame(miniGame.id, 'reviewed')}</div>
                              <div className="text-yellow-500">Reviewed</div>
                            </div>
                            <div className="text-center p-2 bg-green-50 rounded-lg">
                              <div className="font-semibold text-green-600">{getStatusCountForMiniGame(miniGame.id, 'approved')}</div>
                              <div className="text-green-500">Approved</div>
                            </div>
                          </div>

                          {selectedMiniGame === miniGame.id && (
                            <div className="mt-4 pt-4 border-t space-y-2">
                              <h5 className="font-semibold text-sm">Recent Designs:</h5>
                              {designs.length > 0 ? (
                                designs.slice(0, 3).map(design => (
                                  <div key={design.id} className="flex items-center justify-between text-xs">
                                    <span className="truncate">{design.title}</span>
                                    <Badge variant="secondary" className={statusColors[design.status as keyof typeof statusColors]}>
                                      {design.status}
                                    </Badge>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-gray-500">No designs yet</p>
                              )}
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
                  {/* Overall Progress Summary - Moved to Top */}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Category Progress Bars */}
                    {categoryOptions.map(category => {
                      const categoryBlocks = miniGameBlocks.filter(mg => mg.category === category.value);
                      const totalDesigns = categoryBlocks.reduce((sum, mg) => sum + mg.frequencyValue, 0);
                      const completedDesigns = categoryBlocks.reduce((sum, mg) => {
                        const progress = getProgressForMiniGame(mg.id);
                        return sum + progress.completed;
                      }, 0);
                      const progressPercentage = totalDesigns > 0 ? (completedDesigns / totalDesigns) * 100 : 0;

                      return (
                        <div key={category.value} className="bg-gradient-to-b from-white to-gray-50 p-6 rounded-xl border">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">{category.icon}</span>
                              <div>
                                <h4 className="font-semibold text-sm">{category.label}</h4>
                                <p className="text-xs text-gray-500">{categoryBlocks.length} blocks</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold" style={{ color: category.color }}>
                                {Math.round(progressPercentage)}%
                              </div>
                              <div className="text-xs text-gray-500">
                                {completedDesigns}/{totalDesigns}
                              </div>
                            </div>
                          </div>
                          
                          {/* Vertical Progress Bar */}
                          <div className="flex justify-center">
                            <div className="relative w-8 h-32 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="absolute bottom-0 w-full rounded-full transition-all duration-500"
                                style={{ 
                                  height: `${progressPercentage}%`,
                                  backgroundColor: category.color,
                                  boxShadow: `0 0 10px ${category.color}40`
                                }}
                              />
                            </div>
                          </div>
                          
                          {/* Individual Block Breakdown */}
                          <div className="mt-4 space-y-2">
                            {categoryBlocks.slice(0, 3).map(block => {
                              const blockProgress = getProgressForMiniGame(block.id);
                              return (
                                <div key={block.id} className="flex items-center justify-between text-xs">
                                  <span className="truncate">{block.name}</span>
                                  <span className="font-medium">{blockProgress.completed}/{blockProgress.total}</span>
                                </div>
                              );
                            })}
                            {categoryBlocks.length > 3 && (
                              <div className="text-xs text-gray-500 text-center">
                                +{categoryBlocks.length - 3} more blocks
                              </div>
                            )}
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
                    <Target className="text-purple-500 mr-3 h-5 w-5" />
                    Design Queue Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {miniGameDesigns.map(design => {
                      const miniGame = miniGameBlocks.find(mg => mg.id === design.miniGameBlockId);
                      return (
                        <div key={design.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div>
                            <h4 className="font-semibold">{design.title}</h4>
                            <p className="text-sm text-gray-600">{miniGame?.name}</p>
                            <p className="text-xs text-gray-500">{design.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={statusColors[design.status as keyof typeof statusColors]}>
                              {design.status}
                            </Badge>
                            {design.targetDate && (
                              <div className="text-xs text-gray-500">
                                Due: {format(new Date(design.targetDate), 'MMM d')}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="text-purple-500 mr-3 h-5 w-5" />
                    Content Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">Performance Analytics</h3>
                    <p className="text-sm">Track engagement and reach metrics</p>
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
              <CardTitle className="flex items-center">
                <Calendar className="text-purple-500 mr-3 h-5 w-5" />
                Content Planning for {currentBrand?.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-3 rounded-xl">
                  <TabsTrigger value="content" className="rounded-lg">Content Library</TabsTrigger>
                  <TabsTrigger value="schedule" className="rounded-lg">Publishing Schedule</TabsTrigger>
                  <TabsTrigger value="analytics" className="rounded-lg">Analytics</TabsTrigger>
                </TabsList>
                
                <TabsContent value="content" className="space-y-4">
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">Content Library</h3>
                    <p className="text-sm">Manage your content pieces and drafts</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="schedule" className="space-y-4">
                  <div className="text-center py-12 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">Publishing Schedule</h3>
                    <p className="text-sm">Plan and schedule your content releases</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="analytics" className="space-y-4">
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