import React, { useState } from 'react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import ContentPipelineSection from './ContentPipelineSection';
import SocialMediaAnalytics from './SocialMediaAnalytics';
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
  ChevronRight,
  Workflow,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  NotebookPen,
  Plus,
  X,
  Trash2
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
  status: "designed" | "reviewed" | "approved" | "archived";
  targetDate: string;
  designedDate: string;
  reviewedDate: string;
  approvedDate: string;
  version: number;
  isTemplate: boolean;
  createdAt: string;
  updatedAt: string;
}

// Notepad Item type
interface NotepadItem {
  id: number;
  content: string;
  linkedBlockId: number | null; // Links to MiniGameBlock ID
  linkedBlockName?: string; // Display name of linked block
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ContentCreationSectionProps {
  selectedDate: Date;
  isReadOnly?: boolean;
}

export default function ContentCreationSection({ selectedDate, isReadOnly = false }: ContentCreationSectionProps) {
  const [activeBrand, setActiveBrand] = useState<string>("rotationONLY");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMiniGame, setSelectedMiniGame] = useState<number | null>(null);
  const [showCreateMiniGameDialog, setShowCreateMiniGameDialog] = useState(false);
  const [showCreateDesignDialog, setShowCreateDesignDialog] = useState(false);
  
  // Notepad States
  const [notepadItems, setNotepadItems] = useState<NotepadItem[]>([]);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [selectedBlockForNote, setSelectedBlockForNote] = useState<number | null>(null);
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'category' | 'frequency' | 'title' | 'status' | 'targetDate' | 'version'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

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

  // Fetch mini-game blocks from API
  const { data: miniGameBlocks = [], isLoading: miniGameBlocksLoading } = useQuery({
    queryKey: ['/api/mini-game-blocks'],
    select: (data: any[]) => data || []
  });

  // Fetch mini-game designs from API
  const { data: miniGameDesigns = [], isLoading: miniGameDesignsLoading } = useQuery({
    queryKey: ['/api/mini-game-designs'],
    select: (data: any[]) => data || []
  });

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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Content Creation Hub
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            {miniGameBlocksLoading ? "Loading content..." : "No content available. Connect to database to see content creation data."}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}