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
  Target,
  Edit,
  CalendarDays,
  ChevronLeft,
  ChevronRight
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
      description: "",
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
    personal: []
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
    },
    {
      id: 2,
      miniGameBlockId: 2,
      title: "Sagittarius New Moon Ritual",
      description: "New moon intention setting guide for Sagittarius season",
      designNotes: "Include crystal recommendations and journal prompts",
      status: "approved",
      targetDate: "2025-06-06",
      designedDate: "2025-05-28",
      reviewedDate: "2025-05-30",
      approvedDate: "2025-06-01",
      version: 1,
      isTemplate: false,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      updatedAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 3,
      miniGameBlockId: 3,
      title: "Weekend Wellness Check",
      description: "Self-care and wellness reminder post",
      designNotes: "Focus on mental health and mindful practices",
      status: "approved",
      targetDate: "2025-06-08",
      designedDate: "2025-06-02",
      reviewedDate: "2025-06-03",
      approvedDate: "2025-06-04",
      version: 1,
      isTemplate: true,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      updatedAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 4,
      miniGameBlockId: 4,
      title: "Mercury Retrograde Survival Guide",
      description: "Tips for navigating Mercury retrograde energy",
      designNotes: "Include communication and technology tips",
      status: "approved",
      targetDate: "2025-06-10",
      designedDate: "2025-06-01",
      reviewedDate: "2025-06-02",
      approvedDate: "2025-06-03",
      version: 1,
      isTemplate: false,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      updatedAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 5,
      miniGameBlockId: 1,
      title: "Monthly Content Planning",
      description: "Administrative overview of upcoming content themes",
      designNotes: "Include key dates and collaboration schedules",
      status: "approved",
      targetDate: "2025-06-14",
      designedDate: "2025-06-05",
      reviewedDate: "2025-06-06",
      approvedDate: "2025-06-07",
      version: 1,
      isTemplate: true,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      updatedAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 6,
      miniGameBlockId: 5,
      title: "Full Moon in Gemini Reflection",
      description: "Guided reflection for the Gemini full moon",
      designNotes: "Focus on communication and duality themes",
      status: "approved",
      targetDate: "2025-06-12",
      designedDate: "2025-06-03",
      reviewedDate: "2025-06-04",
      approvedDate: "2025-06-05",
      version: 1,
      isTemplate: false,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      updatedAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 7,
      miniGameBlockId: 6,
      title: "Creative Flow State Tutorial",
      description: "Guide to accessing and maintaining creative flow",
      designNotes: "Include practical exercises and environmental tips",
      status: "approved",
      targetDate: "2025-06-15",
      designedDate: "2025-06-07",
      reviewedDate: "2025-06-08",
      approvedDate: "2025-06-09",
      version: 1,
      isTemplate: true,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      updatedAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 8,
      miniGameBlockId: 7,
      title: "Community Spotlight Feature",
      description: "Highlighting community member achievements",
      designNotes: "Include interview questions and photo guidelines",
      status: "approved",
      targetDate: "2025-06-18",
      designedDate: "2025-06-10",
      reviewedDate: "2025-06-11",
      approvedDate: "2025-06-12",
      version: 1,
      isTemplate: true,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      updatedAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 9,
      miniGameBlockId: 8,
      title: "Behind the Scenes: Content Creation",
      description: "Transparent look at content creation process",
      designNotes: "Show tools, inspiration, and creative challenges",
      status: "approved",
      targetDate: "2025-06-20",
      designedDate: "2025-06-12",
      reviewedDate: "2025-06-13",
      approvedDate: "2025-06-14",
      version: 1,
      isTemplate: false,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      updatedAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 10,
      miniGameBlockId: 2,
      title: "Cancer Season Self-Care",
      description: "Nurturing practices for Cancer season energy",
      designNotes: "Focus on home, family, and emotional wellness",
      status: "approved",
      targetDate: "2025-06-22",
      designedDate: "2025-06-14",
      reviewedDate: "2025-06-15",
      approvedDate: "2025-06-16",
      version: 1,
      isTemplate: false,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      updatedAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 11,
      miniGameBlockId: 9,
      title: "Educational Deep Dive: Moon Phases",
      description: "Comprehensive guide to understanding moon phases",
      designNotes: "Include scientific and spiritual perspectives",
      status: "approved",
      targetDate: "2025-06-25",
      designedDate: "2025-06-17",
      reviewedDate: "2025-06-18",
      approvedDate: "2025-06-19",
      version: 1,
      isTemplate: true,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      updatedAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 12,
      miniGameBlockId: 1,
      title: "End of Month Reflection",
      description: "Administrative wrap-up and planning ahead",
      designNotes: "Include analytics review and goal setting",
      status: "approved",
      targetDate: "2025-06-28",
      designedDate: "2025-06-20",
      reviewedDate: "2025-06-21",
      approvedDate: "2025-06-22",
      version: 1,
      isTemplate: true,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      updatedAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 13,
      miniGameBlockId: 2,
      title: "Word of the Week: Synergy",
      description: "Exploring the power of collaborative energy",
      designNotes: "Include etymology and practical applications",
      status: "approved",
      targetDate: "2025-06-09",
      designedDate: "2025-06-01",
      reviewedDate: "2025-06-02",
      approvedDate: "2025-06-03",
      version: 1,
      isTemplate: true,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      updatedAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 14,
      miniGameBlockId: 3,
      title: "Lucky && Blessed: Gratitude Practice",
      description: "Cultivating appreciation for life's abundance",
      designNotes: "Include guided gratitude meditation",
      status: "approved",
      targetDate: "2025-06-11",
      designedDate: "2025-06-03",
      reviewedDate: "2025-06-04",
      approvedDate: "2025-06-05",
      version: 1,
      isTemplate: false,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      updatedAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 15,
      miniGameBlockId: 5,
      title: "Positive Affirmations: I Am Worthy",
      description: "Daily affirmations for self-worth and confidence",
      designNotes: "Include mirror work techniques",
      status: "approved",
      targetDate: "2025-06-13",
      designedDate: "2025-06-05",
      reviewedDate: "2025-06-06",
      approvedDate: "2025-06-07",
      version: 1,
      isTemplate: true,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      updatedAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 16,
      miniGameBlockId: 6,
      title: "Energetic Portals: Summer Solstice",
      description: "Harnessing the peak solar energy of summer",
      designNotes: "Include ritual suggestions and crystals",
      status: "approved",
      targetDate: "2025-06-21",
      designedDate: "2025-06-13",
      reviewedDate: "2025-06-14",
      approvedDate: "2025-06-15",
      version: 1,
      isTemplate: false,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      updatedAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 17,
      miniGameBlockId: 7,
      title: "Laws of Maat: Truth and Justice",
      description: "Ancient Egyptian principles for modern living",
      designNotes: "Connect to contemporary social justice themes",
      status: "approved",
      targetDate: "2025-06-16",
      designedDate: "2025-06-08",
      reviewedDate: "2025-06-09",
      approvedDate: "2025-06-10",
      version: 1,
      isTemplate: true,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      updatedAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 18,
      miniGameBlockId: 8,
      title: "She Stays On My Mind: Musical Healing",
      description: "How music connects us to divine feminine energy",
      designNotes: "Include Apple Music playlist integration",
      status: "approved",
      targetDate: "2025-06-17",
      designedDate: "2025-06-09",
      reviewedDate: "2025-06-10",
      approvedDate: "2025-06-11",
      version: 1,
      isTemplate: false,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      updatedAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 19,
      miniGameBlockId: 9,
      title: "The Way He Makes Me Feel: Love Energy",
      description: "Exploring romantic connection and emotional resonance",
      designNotes: "Include relationship wisdom and self-love tips",
      status: "approved",
      targetDate: "2025-06-19",
      designedDate: "2025-06-11",
      reviewedDate: "2025-06-12",
      approvedDate: "2025-06-13",
      version: 1,
      isTemplate: true,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      updatedAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 20,
      miniGameBlockId: 2,
      title: "Word of the Week: Resilience",
      description: "The art of bouncing back stronger",
      designNotes: "Include practical resilience-building exercises",
      status: "approved",
      targetDate: "2025-06-23",
      designedDate: "2025-06-15",
      reviewedDate: "2025-06-16",
      approvedDate: "2025-06-17",
      version: 1,
      isTemplate: true,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      updatedAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 21,
      miniGameBlockId: 4,
      title: "Definitions: Sacred Geometry",
      description: "Understanding the mathematical patterns in nature",
      designNotes: "Include visual examples and meditation practices",
      status: "approved",
      targetDate: "2025-06-24",
      designedDate: "2025-06-16",
      reviewedDate: "2025-06-17",
      approvedDate: "2025-06-18",
      version: 1,
      isTemplate: false,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      updatedAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 22,
      miniGameBlockId: 3,
      title: "Lucky && Blessed: Abundance Mindset",
      description: "Shifting from scarcity to abundance thinking",
      designNotes: "Include abundance journaling prompts",
      status: "approved",
      targetDate: "2025-06-26",
      designedDate: "2025-06-18",
      reviewedDate: "2025-06-19",
      approvedDate: "2025-06-20",
      version: 1,
      isTemplate: true,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      updatedAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 23,
      miniGameBlockId: 5,
      title: "Positive Affirmations: Creative Power",
      description: "Activating your innate creative abilities",
      designNotes: "Include visualization techniques",
      status: "approved",
      targetDate: "2025-06-27",
      designedDate: "2025-06-19",
      reviewedDate: "2025-06-20",
      approvedDate: "2025-06-21",
      version: 1,
      isTemplate: false,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      updatedAt: format(new Date(), 'yyyy-MM-dd')
    },
    {
      id: 24,
      miniGameBlockId: 1,
      title: "July Content Preview",
      description: "Sneak peek at upcoming content themes",
      designNotes: "Include community feedback integration",
      status: "approved",
      targetDate: "2025-06-30",
      designedDate: "2025-06-22",
      reviewedDate: "2025-06-23",
      approvedDate: "2025-06-24",
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
  const [newDesign, setNewDesign] = useState<{
    miniGameBlockId: number;
    title: string;
    description: string;
    designNotes: string;
    targetDate: string;
    astrologicalSign: string;
    moonPhase: string;
    fullMoonName: string;
  }>({
    miniGameBlockId: 0,
    title: "",
    description: "",
    designNotes: "",
    targetDate: "",
    astrologicalSign: "none",
    moonPhase: "none",
    fullMoonName: "none"
  });

  // Edit mini-game state
  const [editingMiniGame, setEditingMiniGame] = useState<number | null>(null);
  const [editMiniGameData, setEditMiniGameData] = useState<{
    name: string;
    frequency: string;
    frequencyValue: number;
    category: string;
  }>({
    name: "",
    frequency: "",
    frequencyValue: 0,
    category: ""
  });

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<'month' | 'week'>('month');
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  // Content Calendar helper functions
  const getApprovedDesigns = () => {
    return miniGameDesigns.filter(design => design.status === 'approved');
  };

  const getDesignsByDate = (designs: MiniGameDesign[]) => {
    const designsByDate: { [date: string]: MiniGameDesign[] } = {};
    designs.forEach(design => {
      if (design.targetDate) {
        if (!designsByDate[design.targetDate]) {
          designsByDate[design.targetDate] = [];
        }
        designsByDate[design.targetDate].push(design);
      }
    });
    return designsByDate;
  };

  const getDateRange = (days = 30) => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(format(date, 'yyyy-MM-dd'));
    }
    return dates;
  };

  // Calendar helper functions
  const getMonthCalendarDates = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from the beginning of the week that contains the first day
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    // End at the end of the week that contains the last day
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    const dates = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };

  const getWeekCalendarDates = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      dates.push(day);
    }
    
    return dates;
  };

  const navigateCalendar = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (calendarView === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    }
    setCurrentDate(newDate);
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
              className={`flex-1 flex items-center justify-center px-2 sm:px-4 py-3 rounded-lg transition-all duration-200 ${
                activeBrand === brand.id
                  ? 'bg-white dark:bg-gray-700 shadow-md text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
            >
              <span className="text-lg mr-1 sm:mr-2">{brand.icon}</span>
              <span className="text-xs sm:text-sm font-medium hidden sm:block whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] lg:max-w-none">{brand.name}</span>
              <span className="text-xs font-medium sm:hidden">{brand.id === "rotationONLY" ? "rotation" : brand.name}</span>
            </button>
          ))}
        </div>
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
                  
                  <div className="space-y-6 py-4">
                    {/* Mini-Game Selection - Moved to Top */}
                    <div className="space-y-2">
                      <Label htmlFor="designMiniGame" className="text-sm font-semibold text-gray-900 dark:text-white">
                        Mini-Game Block *
                      </Label>
                      <Select 
                        value={newDesign.miniGameBlockId.toString()} 
                        onValueChange={(value) => setNewDesign({...newDesign, miniGameBlockId: parseInt(value)})}
                      >
                        <SelectTrigger className="rounded-xl border-2 hover:border-purple-300 focus:border-purple-500 transition-colors">
                          <SelectValue placeholder="Choose a mini-game block..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {miniGameBlocks.map(mg => (
                            <SelectItem key={mg.id} value={mg.id.toString()} className="rounded-lg">
                              <div className="flex items-center">
                                <span className="mr-2">{getCategoryIcon(mg.category)}</span>
                                <span>{mg.name}</span>
                                <span className="ml-2 text-xs text-gray-500">({mg.frequencyValue}/year)</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Zodiac Sign and Moon Phase - Conditional Display */}
                    {(() => {
                      const selectedMiniGame = miniGameBlocks.find(mg => mg.id === newDesign.miniGameBlockId);
                      const showAstrologicalFields = selectedMiniGame && [
                        'Positive Affirmations',
                        'She Stays On My Mind', 
                        'The Way He Makes Me Feel',
                        'Written Realms',
                        'Sun Signs',
                        'Moon Cycle'
                      ].includes(selectedMiniGame.name);
                      
                      if (!showAstrologicalFields) return null;
                      
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Zodiac Sign */}
                          <div className="space-y-2">
                            <Label htmlFor="designAstrologicalSign" className="text-sm font-semibold text-gray-900 dark:text-white">
                              Zodiac Sign
                            </Label>
                            <Select 
                              value={newDesign.astrologicalSign} 
                              onValueChange={(value) => setNewDesign({...newDesign, astrologicalSign: value})}
                            >
                              <SelectTrigger className="rounded-xl border-2 hover:border-purple-300 focus:border-purple-500 transition-colors">
                                <SelectValue placeholder="Select zodiac sign..." />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                <SelectItem value="none" className="rounded-lg">None</SelectItem>
                                <SelectItem value="aquarius" className="rounded-lg">Aquarius ♒</SelectItem>
                                <SelectItem value="aries" className="rounded-lg">Aries ♈</SelectItem>
                                <SelectItem value="cancer" className="rounded-lg">Cancer ♋</SelectItem>
                                <SelectItem value="capricorn" className="rounded-lg">Capricorn ♑</SelectItem>
                                <SelectItem value="gemini" className="rounded-lg">Gemini ♊</SelectItem>
                                <SelectItem value="leo" className="rounded-lg">Leo ♌</SelectItem>
                                <SelectItem value="libra" className="rounded-lg">Libra ♎</SelectItem>
                                <SelectItem value="pisces" className="rounded-lg">Pisces ♓</SelectItem>
                                <SelectItem value="sagittarius" className="rounded-lg">Sagittarius ♐</SelectItem>
                                <SelectItem value="scorpio" className="rounded-lg">Scorpio ♏</SelectItem>
                                <SelectItem value="taurus" className="rounded-lg">Taurus ♉</SelectItem>
                                <SelectItem value="virgo" className="rounded-lg">Virgo ♍</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Moon Phase */}
                          <div className="space-y-2">
                            <Label htmlFor="designMoonPhase" className="text-sm font-semibold text-gray-900 dark:text-white">
                              Moon Phase
                            </Label>
                            <Select 
                              value={newDesign.moonPhase} 
                              onValueChange={(value) => setNewDesign({...newDesign, moonPhase: value})}
                            >
                              <SelectTrigger className="rounded-xl border-2 hover:border-purple-300 focus:border-purple-500 transition-colors">
                                <SelectValue placeholder="Select moon phase..." />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                <SelectItem value="none" className="rounded-lg">None</SelectItem>
                                <SelectItem value="new_moon" className="rounded-lg">New Moon 🌑</SelectItem>
                                <SelectItem value="waxing_crescent" className="rounded-lg">Waxing Crescent 🌒</SelectItem>
                                <SelectItem value="first_quarter" className="rounded-lg">First Quarter 🌓</SelectItem>
                                <SelectItem value="waxing_gibbous" className="rounded-lg">Waxing Gibbous 🌔</SelectItem>
                                <SelectItem value="full_moon" className="rounded-lg">Full Moon 🌕</SelectItem>
                                <SelectItem value="waning_gibbous" className="rounded-lg">Waning Gibbous 🌖</SelectItem>
                                <SelectItem value="third_quarter" className="rounded-lg">Third Quarter 🌗</SelectItem>
                                <SelectItem value="waning_crescent" className="rounded-lg">Waning Crescent 🌘</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Traditional Full Moon Name - Only show when Full Moon is selected */}
                          {newDesign.moonPhase === "full_moon" && (
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="fullMoonName" className="text-sm font-semibold text-gray-900 dark:text-white">
                                Traditional Full Moon Name
                              </Label>
                              <Select 
                                value={newDesign.fullMoonName} 
                                onValueChange={(value) => setNewDesign({...newDesign, fullMoonName: value})}
                              >
                                <SelectTrigger className="rounded-xl border-2 hover:border-purple-300 focus:border-purple-500 transition-colors">
                                  <SelectValue placeholder="Select traditional full moon name..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                  <SelectItem value="none" className="rounded-lg">None</SelectItem>
                                  <SelectItem value="wolf_moon" className="rounded-lg">Wolf Moon (January)</SelectItem>
                                  <SelectItem value="snow_moon" className="rounded-lg">Snow Moon (February)</SelectItem>
                                  <SelectItem value="worm_moon" className="rounded-lg">Worm Moon (March)</SelectItem>
                                  <SelectItem value="pink_moon" className="rounded-lg">Pink Moon (April)</SelectItem>
                                  <SelectItem value="flower_moon" className="rounded-lg">Flower Moon (May)</SelectItem>
                                  <SelectItem value="strawberry_moon" className="rounded-lg">Strawberry Moon (June)</SelectItem>
                                  <SelectItem value="buck_moon" className="rounded-lg">Buck Moon (July)</SelectItem>
                                  <SelectItem value="sturgeon_moon" className="rounded-lg">Sturgeon Moon (August)</SelectItem>
                                  <SelectItem value="harvest_moon" className="rounded-lg">Harvest Moon (September)</SelectItem>
                                  <SelectItem value="hunters_moon" className="rounded-lg">Hunter's Moon (October)</SelectItem>
                                  <SelectItem value="beaver_moon" className="rounded-lg">Beaver Moon (November)</SelectItem>
                                  <SelectItem value="cold_moon" className="rounded-lg">Cold Moon (December)</SelectItem>
                                  <SelectItem value="blue_moon" className="rounded-lg">Blue Moon (Second full moon in a month)</SelectItem>
                                  <SelectItem value="blood_moon" className="rounded-lg">Blood Moon (Lunar eclipse)</SelectItem>
                                  <SelectItem value="supermoon" className="rounded-lg">Supermoon (Closest to Earth)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Design Title Preview */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-900 dark:text-white">
                        Design Title Preview
                      </Label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-600">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          {(() => {
                            const selectedMiniGame = miniGameBlocks.find(mg => mg.id === newDesign.miniGameBlockId);
                            const selectedSign = astrologicalSignOptions.find(sign => sign.value === newDesign.astrologicalSign);
                            const moonPhaseOptions = [
                              { value: "none", label: "None" },
                              { value: "new_moon", label: "New Moon" },
                              { value: "waxing_crescent", label: "Waxing Crescent" },
                              { value: "first_quarter", label: "First Quarter" },
                              { value: "waxing_gibbous", label: "Waxing Gibbous" },
                              { value: "full_moon", label: "Full Moon" },
                              { value: "waning_gibbous", label: "Waning Gibbous" },
                              { value: "third_quarter", label: "Third Quarter" },
                              { value: "waning_crescent", label: "Waning Crescent" }
                            ];
                            const fullMoonNameOptions = [
                              { value: "none", label: "None" },
                              { value: "wolf_moon", label: "Wolf Moon" },
                              { value: "snow_moon", label: "Snow Moon" },
                              { value: "worm_moon", label: "Worm Moon" },
                              { value: "pink_moon", label: "Pink Moon" },
                              { value: "flower_moon", label: "Flower Moon" },
                              { value: "strawberry_moon", label: "Strawberry Moon" },
                              { value: "buck_moon", label: "Buck Moon" },
                              { value: "sturgeon_moon", label: "Sturgeon Moon" },
                              { value: "harvest_moon", label: "Harvest Moon" },
                              { value: "hunters_moon", label: "Hunter's Moon" },
                              { value: "beaver_moon", label: "Beaver Moon" },
                              { value: "cold_moon", label: "Cold Moon" },
                              { value: "blue_moon", label: "Blue Moon" },
                              { value: "blood_moon", label: "Blood Moon" },
                              { value: "supermoon", label: "Supermoon" }
                            ];
                            const selectedMoonPhase = moonPhaseOptions.find(phase => phase.value === newDesign.moonPhase);
                            const selectedFullMoonName = fullMoonNameOptions.find(name => name.value === newDesign.fullMoonName);
                            
                            if (!selectedMiniGame) {
                              return <span className="text-gray-400">Select a mini-game block to see preview</span>;
                            }
                            
                            let title = selectedMiniGame.name;
                            
                            // Add moon phase (with traditional name if it's a full moon)
                            if (newDesign.moonPhase !== "none" && selectedMoonPhase) {
                              if (newDesign.moonPhase === "full_moon" && newDesign.fullMoonName !== "none" && selectedFullMoonName) {
                                title += ` On ${selectedFullMoonName.label}`;
                              } else {
                                title += ` On ${selectedMoonPhase.label}`;
                              }
                            }
                            
                            if (newDesign.astrologicalSign !== "none" && selectedSign) {
                              title += ` in ${selectedSign.label}`;
                            }
                            
                            return title;
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Design Description */}
                    <div className="space-y-2">
                      <Label htmlFor="designDescription" className="text-sm font-semibold text-gray-900 dark:text-white">
                        Content Description
                      </Label>
                      <Textarea
                        id="designDescription"
                        value={newDesign.description}
                        onChange={(e) => setNewDesign({...newDesign, description: e.target.value})}
                        placeholder="Describe the main content and theme of this design..."
                        className="rounded-xl border-2 hover:border-purple-300 focus:border-purple-500 transition-colors min-h-[100px]"
                        rows={4}
                      />
                    </div>

                    {/* Design Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="designNotes" className="text-sm font-semibold text-gray-900 dark:text-white">
                        Design Notes & Requirements
                      </Label>
                      <Textarea
                        id="designNotes"
                        value={newDesign.designNotes}
                        onChange={(e) => setNewDesign({...newDesign, designNotes: e.target.value})}
                        placeholder="Visual elements, colors, fonts, special requirements..."
                        className="rounded-xl border-2 hover:border-purple-300 focus:border-purple-500 transition-colors min-h-[80px]"
                        rows={3}
                      />
                    </div>

                    {/* Target Date */}
                    <div className="space-y-2">
                      <Label htmlFor="targetDate" className="text-sm font-semibold text-gray-900 dark:text-white">
                        Target Completion Date
                      </Label>
                      <Input
                        id="targetDate"
                        type="date"
                        value={newDesign.targetDate}
                        onChange={(e) => setNewDesign({...newDesign, targetDate: e.target.value})}
                        className="rounded-xl border-2 hover:border-purple-300 focus:border-purple-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCreateDesignDialog(false)}
                      className="flex-1 rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => {
                        const selectedMiniGame = miniGameBlocks.find(mg => mg.id === newDesign.miniGameBlockId);
                        const selectedSign = astrologicalSignOptions.find(sign => sign.value === newDesign.astrologicalSign);
                        const moonPhaseOptions = [
                          { value: "none", label: "None" },
                          { value: "new_moon", label: "New Moon" },
                          { value: "waxing_crescent", label: "Waxing Crescent" },
                          { value: "first_quarter", label: "First Quarter" },
                          { value: "waxing_gibbous", label: "Waxing Gibbous" },
                          { value: "full_moon", label: "Full Moon" },
                          { value: "waning_gibbous", label: "Waning Gibbous" },
                          { value: "third_quarter", label: "Third Quarter" },
                          { value: "waning_crescent", label: "Waning Crescent" }
                        ];
                        const fullMoonNameOptions = [
                          { value: "none", label: "None" },
                          { value: "wolf_moon", label: "Wolf Moon" },
                          { value: "snow_moon", label: "Snow Moon" },
                          { value: "worm_moon", label: "Worm Moon" },
                          { value: "pink_moon", label: "Pink Moon" },
                          { value: "flower_moon", label: "Flower Moon" },
                          { value: "strawberry_moon", label: "Strawberry Moon" },
                          { value: "buck_moon", label: "Buck Moon" },
                          { value: "sturgeon_moon", label: "Sturgeon Moon" },
                          { value: "harvest_moon", label: "Harvest Moon" },
                          { value: "hunters_moon", label: "Hunter's Moon" },
                          { value: "beaver_moon", label: "Beaver Moon" },
                          { value: "cold_moon", label: "Cold Moon" },
                          { value: "blue_moon", label: "Blue Moon" },
                          { value: "blood_moon", label: "Blood Moon" },
                          { value: "supermoon", label: "Supermoon" }
                        ];
                        const selectedMoonPhase = moonPhaseOptions.find(phase => phase.value === newDesign.moonPhase);
                        const selectedFullMoonName = fullMoonNameOptions.find(name => name.value === newDesign.fullMoonName);
                        
                        let generatedTitle = selectedMiniGame?.name || "";
                        if (newDesign.moonPhase !== "none" && selectedMoonPhase) {
                          if (newDesign.moonPhase === "full_moon" && newDesign.fullMoonName !== "none" && selectedFullMoonName) {
                            generatedTitle += ` On ${selectedFullMoonName.label}`;
                          } else {
                            generatedTitle += ` On ${selectedMoonPhase.label}`;
                          }
                        }
                        if (newDesign.astrologicalSign !== "none" && selectedSign) {
                          generatedTitle += ` in ${selectedSign.label}`;
                        }
                        
                        const design: MiniGameDesign = {
                          id: Date.now(),
                          ...newDesign,
                          title: generatedTitle,
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
                          targetDate: "",
                          astrologicalSign: "none",
                          moonPhase: "none",
                          fullMoonName: "none"
                        });
                        setShowCreateDesignDialog(false);
                      }}
                      className="flex-1 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                      disabled={!newDesign.miniGameBlockId}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Create Design Block
                    </Button>
                  </div>
                </DialogContent>
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



          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 rounded-xl">
              <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
              <TabsTrigger value="progress" className="rounded-lg">Progress Tracker</TabsTrigger>
              <TabsTrigger value="designs" className="rounded-lg">Design Queue</TabsTrigger>
              <TabsTrigger value="calendar" className="rounded-lg">Content Calendar</TabsTrigger>
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
                            onClick={() => startEditingMiniGame(miniGame)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-gray-600 text-sm mb-4 space-y-1">
                          <div>🔄 {frequencyOptions.find(freq => freq.value === miniGame.frequency)?.label}</div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Totality Progress</span>
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
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Edit Mini Game Block Dialog */}
              <Dialog open={editingMiniGame !== null} onOpenChange={(open) => !open && cancelEditingMiniGame()}>
                <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-900 border-0 shadow-2xl rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                      Edit Mini Game Block
                    </DialogTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Update the mini game block details
                    </p>
                  </DialogHeader>
                  
                  <div className="space-y-6 py-4">
                    {/* Title */}
                    <div className="space-y-2">
                      <Label htmlFor="editTitle" className="text-sm font-semibold text-gray-900 dark:text-white">
                        Title *
                      </Label>
                      <Input 
                        id="editTitle"
                        value={editMiniGameData.name}
                        onChange={(e) => setEditMiniGameData({...editMiniGameData, name: e.target.value})}
                        className="rounded-xl border-2 hover:border-purple-300 focus:border-purple-500 transition-colors"
                        placeholder="Enter mini game block title..."
                      />
                    </div>

                    {/* Frequency */}
                    <div className="space-y-2">
                      <Label htmlFor="editFrequency" className="text-sm font-semibold text-gray-900 dark:text-white">
                        Frequency *
                      </Label>
                      <Select 
                        value={editMiniGameData.frequency} 
                        onValueChange={(value) => {
                          const freq = frequencyOptions.find(f => f.value === value);
                          setEditMiniGameData({
                            ...editMiniGameData, 
                            frequency: value,
                            frequencyValue: freq?.count || 52
                          });
                        }}
                      >
                        <SelectTrigger className="rounded-xl border-2 hover:border-purple-300 focus:border-purple-500 transition-colors">
                          <SelectValue placeholder="Select frequency..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {frequencyOptions.map(freq => (
                            <SelectItem key={freq.value} value={freq.value} className="rounded-lg">
                              {freq.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Number of Blocks/Year */}
                    <div className="space-y-2">
                      <Label htmlFor="editFrequencyValue" className="text-sm font-semibold text-gray-900 dark:text-white">
                        Number of Blocks/Year *
                      </Label>
                      <Input 
                        id="editFrequencyValue"
                        type="number"
                        value={editMiniGameData.frequencyValue}
                        onChange={(e) => setEditMiniGameData({...editMiniGameData, frequencyValue: parseInt(e.target.value) || 0})}
                        className="rounded-xl border-2 hover:border-purple-300 focus:border-purple-500 transition-colors"
                        placeholder="Enter number of blocks per year..."
                        min="1"
                        max="365"
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <Label htmlFor="editCategory" className="text-sm font-semibold text-gray-900 dark:text-white">
                        Category *
                      </Label>
                      <Select 
                        value={editMiniGameData.category} 
                        onValueChange={(value) => setEditMiniGameData({...editMiniGameData, category: value})}
                      >
                        <SelectTrigger className="rounded-xl border-2 hover:border-purple-300 focus:border-purple-500 transition-colors">
                          <SelectValue placeholder="Select category..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {categoryOptions.map(cat => (
                            <SelectItem key={cat.value} value={cat.value} className="rounded-lg">
                              <div className="flex items-center">
                                <span className="mr-2">{cat.icon}</span>
                                {cat.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={cancelEditingMiniGame}
                      className="rounded-xl border-2 border-gray-300 hover:border-gray-400"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={saveEditedMiniGame}
                      className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                      disabled={!editMiniGameData.name || !editMiniGameData.frequency || !editMiniGameData.category || editMiniGameData.frequencyValue <= 0}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
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

                  {/* Individual Mini Game Block Progress Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {miniGameBlocks.map(miniGame => {
                      const progressData = getProgressForMiniGame(miniGame.id);
                      const category = categoryOptions.find(cat => cat.value === miniGame.category);
                      
                      return (
                        <div key={miniGame.id} className="bg-gradient-to-b from-white to-gray-50 p-6 rounded-xl border shadow-sm">
                          {/* Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                              <span className="text-lg mr-2">{getCategoryIcon(miniGame.category)}</span>
                              <div>
                                <h4 className="font-semibold text-sm text-gray-900">{miniGame.name}</h4>
                                <p className="text-xs text-gray-500">{miniGame.frequencyValue} designs/year</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold" style={{ color: miniGame.color }}>
                                {progressData.progress}%
                              </div>
                              <div className="text-xs text-gray-500">
                                {progressData.completed}/{progressData.total}
                              </div>
                            </div>
                          </div>
                          
                          {/* Individual Vertical Progress Bar */}
                          <div className="flex justify-center mb-4">
                            <div className="relative w-8 h-32 bg-gray-200 rounded-full p-1">
                              <div className="relative w-full h-full flex flex-col-reverse">
                                {Array.from({ length: Math.min(miniGame.frequencyValue, 20) }, (_, index) => {
                                  const unitIndex = index + 1;
                                  const isCompleted = unitIndex <= progressData.completed;
                                  const segmentHeight = miniGame.frequencyValue > 0 ? Math.max(100 / Math.min(miniGame.frequencyValue, 20), 3) : 5;
                                  
                                  return (
                                    <div
                                      key={index}
                                      className="relative transition-all duration-300"
                                      style={{ 
                                        height: `${segmentHeight}%`,
                                        marginBottom: index < Math.min(miniGame.frequencyValue, 20) - 1 ? '1px' : '0'
                                      }}
                                    >
                                      <div 
                                        className={`w-full h-full rounded-sm transition-all duration-500 ${
                                          isCompleted 
                                            ? 'opacity-100 transform scale-100' 
                                            : 'opacity-30 transform scale-95'
                                        }`}
                                        style={{ 
                                          backgroundColor: isCompleted ? miniGame.color : '#E5E7EB',
                                          boxShadow: isCompleted ? `0 0 6px ${miniGame.color}30` : 'none'
                                        }}
                                      />
                                      {/* Line marker separator */}
                                      {index < Math.min(miniGame.frequencyValue, 20) - 1 && (
                                        <div className="absolute -top-0.5 left-0 w-full h-0.5 bg-white rounded-full" />
                                      )}
                                    </div>
                                  );
                                })}
                                {/* Show overflow indicator if more than 20 units */}
                                {miniGame.frequencyValue > 20 && (
                                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                                    <div className="text-xs font-medium text-gray-500 bg-white px-1 py-0.5 rounded shadow">
                                      +{miniGame.frequencyValue - 20}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Status Breakdown */}
                          <div className="grid grid-cols-3 gap-1 text-xs">
                            <div className="text-center p-1.5 bg-blue-50 rounded">
                              <div className="font-semibold text-blue-600">{getStatusCountForMiniGame(miniGame.id, 'designed')}</div>
                              <div className="text-blue-500 text-xs">Designed</div>
                            </div>
                            <div className="text-center p-1.5 bg-yellow-50 rounded">
                              <div className="font-semibold text-yellow-600">{getStatusCountForMiniGame(miniGame.id, 'reviewed')}</div>
                              <div className="text-yellow-500 text-xs">Reviewed</div>
                            </div>
                            <div className="text-center p-1.5 bg-green-50 rounded">
                              <div className="font-semibold text-green-600">{getStatusCountForMiniGame(miniGame.id, 'approved')}</div>
                              <div className="text-green-500 text-xs">Approved</div>
                            </div>
                          </div>
                          
                          {/* Frequency Info */}
                          <div className="mt-3 text-center">
                            <div className="text-xs text-gray-500">
                              {frequencyOptions.find(freq => freq.value === miniGame.frequency)?.label.split('(')[0]}
                            </div>
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

            <TabsContent value="calendar" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CalendarDays className="text-purple-500 mr-3 h-5 w-5" />
                    Content Calendar - Approved Designs
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Schedule and manage approved content designs from all brands
                  </p>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const approvedDesigns = miniGameDesigns.filter(d => d.status === 'approved');
                    const designsByDate = approvedDesigns.reduce((acc: Record<string, any[]>, design) => {
                      if (design.targetDate) {
                        const date = design.targetDate;
                        if (!acc[date]) acc[date] = [];
                        acc[date].push(design);
                      }
                      return acc;
                    }, {});
                    const calendarDates = calendarView === 'month' 
                      ? getMonthCalendarDates(currentDate) 
                      : getWeekCalendarDates(currentDate);
                    
                    return (
                      <div className="space-y-4">
                        {/* Calendar Navigation */}
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigateCalendar('prev')}
                                className="h-8 w-8 p-0"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigateCalendar('next')}
                                className="h-8 w-8 p-0"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <Button
                              variant="ghost"
                              onClick={() => setShowDatePicker(!showDatePicker)}
                              className="text-lg font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-1 h-auto"
                            >
                              {calendarView === 'month' 
                                ? format(currentDate, 'MMMM yyyy')
                                : `${format(getWeekCalendarDates(currentDate)[0], 'MMM d')} - ${format(getWeekCalendarDates(currentDate)[6], 'MMM d, yyyy')}`
                              }
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentDate(new Date())}
                              className="text-xs"
                            >
                              Today
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              {approvedDesigns.length} Approved
                            </Badge>
                            
                            <div className="flex bg-white dark:bg-gray-700 rounded-lg p-1">
                              <Button
                                variant={calendarView === 'month' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setCalendarView('month')}
                                className="text-xs px-3 py-1"
                              >
                                Month
                              </Button>
                              <Button
                                variant={calendarView === 'week' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setCalendarView('week')}
                                className="text-xs px-3 py-1"
                              >
                                Week
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Month Year Selector */}
                        {showDatePicker && (
                          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-lg">
                            <div className="grid grid-cols-2 gap-4">
                              {/* Month Selector */}
                              <div>
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                  Month
                                </Label>
                                <Select 
                                  value={currentDate.getMonth().toString()}
                                  onValueChange={(value) => {
                                    const newDate = new Date(currentDate);
                                    newDate.setMonth(parseInt(value));
                                    setCurrentDate(newDate);
                                  }}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Array.from({ length: 12 }, (_, i) => (
                                      <SelectItem key={i} value={i.toString()}>
                                        {format(new Date(2024, i, 1), 'MMMM')}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Year Selector */}
                              <div>
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                  Year
                                </Label>
                                <Select 
                                  value={currentDate.getFullYear().toString()}
                                  onValueChange={(value) => {
                                    const newDate = new Date(currentDate);
                                    newDate.setFullYear(parseInt(value));
                                    setCurrentDate(newDate);
                                  }}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Array.from({ length: 10 }, (_, i) => {
                                      const year = new Date().getFullYear() - 2 + i;
                                      return (
                                        <SelectItem key={year} value={year.toString()}>
                                          {year}
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowDatePicker(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => setShowDatePicker(false)}
                                className="bg-purple-500 hover:bg-purple-600 text-white"
                              >
                                Apply
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Calendar Grid */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                          {/* Week Days Header */}
                          <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-800">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                              <div key={day} className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                                {day}
                              </div>
                            ))}
                          </div>

                          {/* Calendar Dates */}
                          <div className={`grid grid-cols-7 ${calendarView === 'week' ? 'min-h-[400px]' : ''}`}>
                            {calendarDates.map((date, index) => {
                              const dateStr = format(date, 'yyyy-MM-dd');
                              const designs = designsByDate[dateStr] || [];
                              const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');
                              const isCurrentMonth = calendarView === 'week' || date.getMonth() === currentDate.getMonth();
                              const hasContent = designs.length > 0;
                              
                              return (
                                <div
                                  key={index}
                                  className={`${calendarView === 'week' ? 'min-h-[350px]' : 'min-h-[140px]'} p-2 border-r border-b border-gray-200 dark:border-gray-700 last:border-r-0 ${
                                    calendarView === 'month' && index >= calendarDates.length - 7 ? 'border-b-0' : ''
                                  } ${!isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'} hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className={`text-sm font-medium ${
                                      isToday 
                                        ? 'bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center' 
                                        : isCurrentMonth 
                                          ? 'text-gray-900 dark:text-white' 
                                          : 'text-gray-400'
                                    }`}>
                                      {date.getDate()}
                                    </span>
                                    {hasContent && (
                                      <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
                                        {designs.length}
                                      </span>
                                    )}
                                  </div>
                                  
                                  {/* Content Items */}
                                  <div className="space-y-1.5">
                                    {designs.slice(0, calendarView === 'week' ? 15 : 4).map((design) => {
                                      const miniGame = miniGameBlocks.find(mg => mg.id === design.miniGameBlockId);
                                      return (
                                        <div
                                          key={design.id}
                                          className={`calendar-content-bubble ${calendarView === 'week' ? 'text-sm p-2' : 'text-xs p-1.5'} rounded-md border-l-3 bg-green-50 dark:bg-green-900/20 border-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 cursor-pointer transition-colors`}
                                          style={{
                                            borderLeftColor: miniGame?.color || '#10B981'
                                          }}
                                          title={`${design.title} - ${miniGame?.name || 'Content'}\n${design.description}`}
                                        >
                                          <div className={`calendar-content-title font-medium text-gray-900 dark:text-white ${calendarView === 'week' ? 'line-clamp-3' : 'line-clamp-2'}`}>
                                            {design.title}
                                          </div>
                                          {calendarView === 'week' && (
                                            <div className="text-gray-500 text-xs mt-1 line-clamp-1">
                                              {miniGame?.name}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                    
                                    {designs.length > (calendarView === 'week' ? 15 : 4) && (
                                      <div className="text-xs text-gray-500 p-1 text-center">
                                        +{designs.length - (calendarView === 'week' ? 15 : 4)} more
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {approvedDesigns.length === 0 && (
                          <div className="text-center py-12 text-gray-500">
                            <CalendarDays className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <h3 className="text-lg font-medium mb-2">No Approved Designs</h3>
                            <p className="text-sm">Approved designs from all brands will appear here</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
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
                  Content Planning for {brands.find(b => b.id === activeBrand)?.name || 'Selected Brand'}
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