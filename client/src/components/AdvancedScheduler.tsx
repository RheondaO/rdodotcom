import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Clock, 
  Moon,
  Repeat,
  Play,
  Pause,
  Settings,
  ChevronDown,
  Save,
  X,
  RefreshCw
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";

interface ScheduleTemplate {
  id: number;
  name: string;
  description?: string;
  type: string;
  platform: string;
  recurrenceType: 'weekly' | 'nth_weekday' | 'quarterly' | 'monthly_day' | 'moon_phase';
  recurrenceConfig: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ScheduleOccurrence {
  date: Date;
  title: string;
  description?: string;
}

interface AdvancedSchedulerProps {
  selectedDate: Date;
  onContentScheduled?: (items: any[]) => void;
}

export default function AdvancedScheduler({ selectedDate, onContentScheduled }: AdvancedSchedulerProps) {
  const [activeTab, setActiveTab] = useState<"templates" | "scheduled" | "calendar">("templates");
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ScheduleTemplate | null>(null);
  const [previewOccurrences, setPreviewOccurrences] = useState<ScheduleOccurrence[]>([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewConfirmData, setPreviewConfirmData] = useState<any>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartDate, setDragStartDate] = useState<Date | null>(null);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [miniGameTitle, setMiniGameTitle] = useState<string>("");
  const [selectedMoonPhase, setSelectedMoonPhase] = useState<string>("None");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Form state for new template
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    type: "",
    platform: "",
    recurrenceType: "weekly" as 'weekly' | 'nth_weekday' | 'quarterly' | 'monthly_day' | 'moon_phase',
    config: {
      // Weekly config
      dayOfWeek: 1, // Monday
      time: "09:00",
      // Nth weekday config
      weekNumber: 1,
      // Quarterly config
      monthInQuarter: 1,
      dayOfMonth: 1,
      // Moon phase config
      phaseTypes: ['full_moon'],
      offsetDays: 0
    }
  });

  // Fetch schedule templates
  const { data: templates = [], isLoading: templatesLoading, refetch: refetchTemplates } = useQuery({
    queryKey: ['/api/schedule-templates'],
    select: (data: ScheduleTemplate[]) => data || []
  });

  // Fetch scheduled content items
  const { data: scheduledItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['/api/scheduled-content-items'],
    select: (data: any[]) => data || []
  });

  // Fetch moon phases
  const { data: moonPhases = [] } = useQuery({
    queryKey: ['/api/moon-phases'],
    select: (data: any[]) => data || []
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: any) => {
      const response = await fetch('/api/schedule-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateData)
      });
      if (!response.ok) {
        throw new Error('Failed to create template');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Schedule template created successfully!" });
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['/api/schedule-templates'] });
    },
    onError: (error: any) => {
      toast({ title: "Error creating template", description: error.message, variant: "destructive" });
    }
  });

  // Preview template mutation
  const previewMutation = useMutation({
    mutationFn: async ({ templateId, fromDate }: { templateId: number; fromDate: Date }) => {
      const response = await fetch(`/api/schedule-templates/${templateId}/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fromDate: fromDate.toISOString(), maxOccurrences: 10 })
      });
      if (!response.ok) {
        throw new Error('Failed to generate preview');
      }
      return response.json();
    },
    onSuccess: (data: any) => {
      setPreviewOccurrences(data.occurrences || []);
      setShowPreview(true);
    },
    onError: (error: any) => {
      toast({ title: "Error generating preview", description: error.message, variant: "destructive" });
    }
  });

  // Save selected dates mutation
  const saveSelectedDatesMutation = useMutation({
    mutationFn: async (dates: Date[]) => {
      const response = await fetch('/api/calendar-selections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dates: dates.map(d => d.toISOString()) })
      });
      if (!response.ok) {
        throw new Error('Failed to save selected dates');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: `Successfully saved ${data.created} calendar selections!`,
        description: "Each selected date has been saved as a unique Notion record."
      });
      setSelectedDates([]);
      queryClient.invalidateQueries({ queryKey: ['/api/calendar-selections'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error saving calendar selections", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  // Generate content items mutation
  const generateItemsMutation = useMutation({
    mutationFn: async ({ templateId, fromDate, toDate, title, description }: any) => {
      const response = await fetch(`/api/scheduled-content-items/generate-from-template/${templateId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fromDate, toDate, title, description })
      });
      if (!response.ok) {
        throw new Error('Failed to generate content items');
      }
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({ 
        title: `Generated ${data.generated_count} scheduled items!`,
        description: `Created content schedule from template: ${data.template.name}`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/scheduled-content-items'] });
      if (onContentScheduled) {
        onContentScheduled(data.items);
      }
    },
    onError: (error: any) => {
      toast({ title: "Error generating content", description: error.message, variant: "destructive" });
    }
  });

  // Helper functions for date range selection
  const getDatesInRange = (start: Date, end: Date): Date[] => {
    const dates: Date[] = [];
    const startDate = new Date(Math.min(start.getTime(), end.getTime()));
    const endDate = new Date(Math.max(start.getTime(), end.getTime()));
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }
    return dates;
  };

  const isDateInRange = (date: Date, start: Date, end: Date): boolean => {
    const dateTime = date.getTime();
    const startTime = Math.min(start.getTime(), end.getTime());
    const endTime = Math.max(start.getTime(), end.getTime());
    return dateTime >= startTime && dateTime <= endTime;
  };

  const handleSaveSelectedDates = () => {
    if (selectedDates.length > 0) {
      saveSelectedDatesMutation.mutate(selectedDates);
    }
  };

  // Helper function to get week number in month (1-5)
  const getWeekNumberInMonth = (date: Date): number => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const firstWeekday = firstDay.getDay();
    const dateNumber = date.getDate();
    return Math.ceil((dateNumber + firstWeekday) / 7);
  };

  // Generate name preview for mini-game
  const generateNamePreview = (title: string, date: Date, dates: Date[], moonPhase?: string): string => {
    if (!title) return "";
    
    const monthYear = format(date, 'MMMM yyyy');
    const sameMonthDates = dates.filter(d => 
      d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear()
    ).sort((a, b) => a.getTime() - b.getTime());
    
    let baseName = "";
    if (sameMonthDates.length <= 1) {
      baseName = `${title} - ${monthYear}`;
    } else {
      const dateIndex = sameMonthDates.findIndex(d => d.getTime() === date.getTime());
      const weekNumber = dateIndex + 1;
      baseName = `${title} - ${weekNumber} - ${monthYear}`;
    }
    
    // Add moon phase if selected and not "None"
    if (moonPhase && moonPhase !== "None") {
      baseName += ` - ${moonPhase}`;
    }
    
    return baseName;
  };

  // Navigate to specific date on calendar
  const navigateToDate = (date: Date) => {
    setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    // Switch to calendar tab if not already there
    setActiveTab("calendar");
  };

  // Available mini-game titles from the system
  const miniGameTitles = [
    "Morning Motivation Series",
    "Astro Insights",
    "Creative Experiments", 
    "Personal Stories",
    "Community Challenges",
    "Tutorial Tuesdays"
  ];

  // Moon phase options
  const moonPhaseOptions = [
    "None",
    "New Moon",
    "Waxing Crescent", 
    "First Quarter",
    "Waxing Gibbous",
    "Full Moon",
    "Waning Gibbous",
    "Third Quarter",
    "Waning Crescent"
  ];

  const resetForm = () => {
    setNewTemplate({
      name: "",
      description: "",
      type: "",
      platform: "",
      recurrenceType: "weekly",
      config: {
        dayOfWeek: 1,
        time: "09:00",
        weekNumber: 1,
        monthInQuarter: 1,
        dayOfMonth: 1,
        phaseTypes: ['full_moon'],
        offsetDays: 0
      }
    });
  };

  const handleCreateTemplate = () => {
    let recurrenceConfig: any = {};

    switch (newTemplate.recurrenceType) {
      case 'weekly':
        recurrenceConfig = {
          dayOfWeek: newTemplate.config.dayOfWeek,
          time: newTemplate.config.time
        };
        break;
      case 'nth_weekday':
        recurrenceConfig = {
          weekNumber: newTemplate.config.weekNumber,
          dayOfWeek: newTemplate.config.dayOfWeek,
          time: newTemplate.config.time
        };
        break;
      case 'quarterly':
        recurrenceConfig = {
          monthInQuarter: newTemplate.config.monthInQuarter,
          dayOfMonth: newTemplate.config.dayOfMonth,
          time: newTemplate.config.time
        };
        break;
      case 'monthly_day':
        recurrenceConfig = {
          dayOfMonth: newTemplate.config.dayOfMonth,
          time: newTemplate.config.time
        };
        break;
      case 'moon_phase':
        recurrenceConfig = {
          phaseTypes: newTemplate.config.phaseTypes,
          offsetDays: newTemplate.config.offsetDays,
          time: newTemplate.config.time
        };
        break;
    }

    createTemplateMutation.mutate({
      name: newTemplate.name,
      description: newTemplate.description,
      type: newTemplate.type,
      platform: newTemplate.platform,
      recurrenceType: newTemplate.recurrenceType,
      recurrenceConfig
    });
  };

  // Generate standardized Notion record names
  const generateStandardizedName = (type: string, date: Date, index?: number): string => {
    const monthYear = format(date, 'MMMM yyyy');
    if (index !== undefined && index > 0) {
      return `${type} - ${index + 1} - ${monthYear}`;
    }
    return `${type} - ${monthYear}`;
  };

  // Enhanced preview handler with confirmation modal
  const handlePreviewTemplate = async (template: ScheduleTemplate) => {
    setSelectedTemplate(template);
    
    try {
      const response = await fetch(`/api/schedule-templates/${template.id}/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          fromDate: selectedDate.toISOString(), 
          maxOccurrences: 50 // Show more occurrences for better preview
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate preview');
      }
      
      const previewData = await response.json();
      
      // Generate standardized names for each occurrence
      const occurrencesWithNames = previewData.occurrences.map((occurrence: any, index: number) => {
        const occurrenceDate = new Date(occurrence.date);
        const monthYearKey = format(occurrenceDate, 'yyyy-MM');
        
        // Count how many occurrences are in the same month
        const monthOccurrences = previewData.occurrences.filter((occ: any) => 
          format(new Date(occ.date), 'yyyy-MM') === monthYearKey
        );
        
        const monthIndex = monthOccurrences.findIndex((occ: any) => occ.date === occurrence.date);
        
        return {
          ...occurrence,
          standardizedName: generateStandardizedName(
            template.type || template.name, 
            occurrenceDate, 
            monthOccurrences.length > 1 ? monthIndex : undefined
          )
        };
      });
      
      setPreviewConfirmData({
        ...previewData,
        template,
        occurrences: occurrencesWithNames
      });
      setShowPreviewModal(true);
      
    } catch (error: any) {
      toast({ 
        title: "Error generating preview", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  const getDayName = (dayNumber: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber];
  };

  const getRecurrenceDescription = (template: ScheduleTemplate) => {
    try {
      const config = JSON.parse(template.recurrenceConfig);
      
      switch (template.recurrenceType) {
        case 'weekly':
          return `Every ${getDayName(config.dayOfWeek)}${config.time ? ` at ${config.time}` : ''}`;
        case 'nth_weekday':
          const weekText = config.weekNumber === -1 ? 'Last' : 
                          config.weekNumber === 1 ? '1st' :
                          config.weekNumber === 2 ? '2nd' :
                          config.weekNumber === 3 ? '3rd' : '4th';
          return `${weekText} ${getDayName(config.dayOfWeek)} of each month${config.time ? ` at ${config.time}` : ''}`;
        case 'quarterly':
          const monthNames = ['first', 'second', 'third'];
          return `Day ${config.dayOfMonth} of the ${monthNames[config.monthInQuarter - 1]} month each quarter${config.time ? ` at ${config.time}` : ''}`;
        case 'monthly_day':
          return `${config.dayOfMonth}${config.dayOfMonth === 1 ? 'st' : config.dayOfMonth === 2 ? 'nd' : config.dayOfMonth === 3 ? 'rd' : 'th'} day of each month${config.time ? ` at ${config.time}` : ''}`;
        case 'moon_phase':
          const phaseNames = config.phaseTypes.map((phase: string) => 
            phase.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
          ).join(', ');
          const offsetText = config.offsetDays ? ` (${config.offsetDays > 0 ? '+' : ''}${config.offsetDays} days)` : '';
          return `${phaseNames}${offsetText}${config.time ? ` at ${config.time}` : ''}`;
        default:
          return 'Unknown recurrence type';
      }
    } catch (error) {
      return 'Invalid configuration';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'created': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'published': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6" data-testid="advanced-scheduler">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5" />
            Advanced Content Scheduler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="templates" data-testid="tab-templates">Templates</TabsTrigger>
              <TabsTrigger value="scheduled" data-testid="tab-scheduled">Scheduled Items</TabsTrigger>
              <TabsTrigger value="calendar" data-testid="tab-calendar">Calendar View</TabsTrigger>
            </TabsList>

            {/* Templates Tab */}
            <TabsContent value="templates" className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">Create New Mini-Game</h3>
                <p className="text-gray-600 dark:text-gray-400">Name your mini-game and set the schedule. This will create multiple Notion records (12 for monthly, 54 for weekly, etc.)</p>
              </div>

              {/* Inline Create Form */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Mini-Game Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="template-name">Template Name</Label>
                          <Input
                            id="template-name"
                            data-testid="input-template-name"
                            value={newTemplate.name}
                            onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Weekly Monday Posts"
                          />
                        </div>
                        <div>
                          <Label htmlFor="recurrence-type">Recurrence Type</Label>
                          <Select 
                            value={newTemplate.recurrenceType} 
                            onValueChange={(value: 'weekly' | 'nth_weekday' | 'quarterly' | 'monthly_day' | 'moon_phase') => setNewTemplate(prev => ({ ...prev, recurrenceType: value }))}
                          >
                            <SelectTrigger data-testid="select-recurrence-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="weekly">Weekly (Every Monday, Tuesday, etc.)</SelectItem>
                              <SelectItem value="nth_weekday">Nth Weekday (2nd Monday, 4th Sunday, etc.)</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="monthly_day">Monthly Day (1st, 2nd, 7th, 14th of month)</SelectItem>
                              <SelectItem value="moon_phase">Moon Phase</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="template-description">Description (Optional)</Label>
                        <Textarea
                          id="template-description"
                          data-testid="textarea-template-description"
                          value={newTemplate.description}
                          onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe when and how this content should be scheduled..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="template-type">Content Type</Label>
                          <Input 
                            id="template-type"
                            placeholder="e.g., Personal Stories, Creative Experiments"
                            value={newTemplate.type}
                            onChange={(e) => setNewTemplate(prev => ({ ...prev, type: e.target.value }))}
                            data-testid="input-type"
                          />
                        </div>
                        <div>
                          <Label htmlFor="template-platform">Platform</Label>
                          <Select 
                            value={newTemplate.platform} 
                            onValueChange={(value: string) => setNewTemplate(prev => ({ ...prev, platform: value }))}
                          >
                            <SelectTrigger data-testid="select-platform">
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Instagram">Instagram</SelectItem>
                              <SelectItem value="TikTok">TikTok</SelectItem>
                              <SelectItem value="YouTube">YouTube</SelectItem>
                              <SelectItem value="Blog">Blog</SelectItem>
                              <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                              <SelectItem value="Twitter">Twitter</SelectItem>
                              <SelectItem value="Facebook">Facebook</SelectItem>
                              <SelectItem value="Pinterest">Pinterest</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Configuration based on recurrence type */}
                      <div className="border rounded-lg p-4 space-y-4">
                        <h4 className="font-semibold">Recurrence Configuration</h4>

                        {newTemplate.recurrenceType === 'weekly' && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Day of Week</Label>
                              <Select 
                                value={newTemplate.config.dayOfWeek.toString()} 
                                onValueChange={(value) => setNewTemplate(prev => ({ 
                                  ...prev, 
                                  config: { ...prev.config, dayOfWeek: parseInt(value) }
                                }))}
                              >
                                <SelectTrigger data-testid="select-day-of-week">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">Sunday</SelectItem>
                                  <SelectItem value="1">Monday</SelectItem>
                                  <SelectItem value="2">Tuesday</SelectItem>
                                  <SelectItem value="3">Wednesday</SelectItem>
                                  <SelectItem value="4">Thursday</SelectItem>
                                  <SelectItem value="5">Friday</SelectItem>
                                  <SelectItem value="6">Saturday</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Time (Optional)</Label>
                              <Input
                                type="time"
                                data-testid="input-time"
                                value={newTemplate.config.time}
                                onChange={(e) => setNewTemplate(prev => ({ 
                                  ...prev, 
                                  config: { ...prev.config, time: e.target.value }
                                }))}
                              />
                            </div>
                          </div>
                        )}

                        {(newTemplate.recurrenceType as string) === 'nth_weekday' && (
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label>Week Number</Label>
                              <Select 
                                value={newTemplate.config.weekNumber.toString()} 
                                onValueChange={(value) => setNewTemplate(prev => ({ 
                                  ...prev, 
                                  config: { ...prev.config, weekNumber: parseInt(value) }
                                }))}
                              >
                                <SelectTrigger data-testid="select-week-number">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">1st</SelectItem>
                                  <SelectItem value="2">2nd</SelectItem>
                                  <SelectItem value="3">3rd</SelectItem>
                                  <SelectItem value="4">4th</SelectItem>
                                  <SelectItem value="-1">Last</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Day of Week</Label>
                              <Select 
                                value={newTemplate.config.dayOfWeek.toString()} 
                                onValueChange={(value) => setNewTemplate(prev => ({ 
                                  ...prev, 
                                  config: { ...prev.config, dayOfWeek: parseInt(value) }
                                }))}
                              >
                                <SelectTrigger data-testid="select-nth-day-of-week">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">Sunday</SelectItem>
                                  <SelectItem value="1">Monday</SelectItem>
                                  <SelectItem value="2">Tuesday</SelectItem>
                                  <SelectItem value="3">Wednesday</SelectItem>
                                  <SelectItem value="4">Thursday</SelectItem>
                                  <SelectItem value="5">Friday</SelectItem>
                                  <SelectItem value="6">Saturday</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Time (Optional)</Label>
                              <Input
                                type="time"
                                data-testid="input-nth-time"
                                value={newTemplate.config.time}
                                onChange={(e) => setNewTemplate(prev => ({ 
                                  ...prev, 
                                  config: { ...prev.config, time: e.target.value }
                                }))}
                              />
                            </div>
                          </div>
                        )}

                        {(newTemplate.recurrenceType as string) === 'moon_phase' && (
                          <div className="space-y-4">
                            <div>
                              <Label>Moon Phases</Label>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                {[
                                  { value: 'new_moon', label: 'New Moon' },
                                  { value: 'first_quarter', label: 'First Quarter' },
                                  { value: 'full_moon', label: 'Full Moon' },
                                  { value: 'last_quarter', label: 'Last Quarter' },
                                  { value: 'waxing_crescent', label: 'Waxing Crescent' },
                                  { value: 'waxing_gibbous', label: 'Waxing Gibbous' },
                                  { value: 'waning_gibbous', label: 'Waning Gibbous' },
                                  { value: 'waning_crescent', label: 'Waning Crescent' }
                                ].map((phase) => (
                                  <label key={phase.value} className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      data-testid={`checkbox-phase-${phase.value}`}
                                      checked={newTemplate.config.phaseTypes.includes(phase.value)}
                                      onChange={(e) => {
                                        const updatedPhases = e.target.checked 
                                          ? [...newTemplate.config.phaseTypes, phase.value]
                                          : newTemplate.config.phaseTypes.filter(p => p !== phase.value);
                                        setNewTemplate(prev => ({ 
                                          ...prev, 
                                          config: { ...prev.config, phaseTypes: updatedPhases }
                                        }));
                                      }}
                                    />
                                    <span className="text-sm">{phase.label}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Offset Days</Label>
                                <Input
                                  type="number"
                                  data-testid="input-offset-days"
                                  value={newTemplate.config.offsetDays}
                                  onChange={(e) => setNewTemplate(prev => ({ 
                                    ...prev, 
                                    config: { ...prev.config, offsetDays: parseInt(e.target.value) || 0 }
                                  }))}
                                  placeholder="0"
                                  min="-30"
                                  max="30"
                                />
                                <p className="text-xs text-gray-500 mt-1">Days before (-) or after (+) the moon phase</p>
                              </div>
                              <div>
                                <Label>Time (Optional)</Label>
                                <Input
                                  type="time"
                                  data-testid="input-moon-time"
                                  value={newTemplate.config.time}
                                  onChange={(e) => setNewTemplate(prev => ({ 
                                    ...prev, 
                                    config: { ...prev.config, time: e.target.value }
                                  }))}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {((newTemplate.recurrenceType as string) === 'quarterly' || (newTemplate.recurrenceType as string) === 'monthly_day') && (
                          <div className="grid grid-cols-2 gap-4">
                            {(newTemplate.recurrenceType as string) === 'quarterly' && (
                              <div>
                                <Label>Month in Quarter</Label>
                                <Select 
                                  value={newTemplate.config.monthInQuarter.toString()} 
                                  onValueChange={(value) => setNewTemplate(prev => ({ 
                                    ...prev, 
                                    config: { ...prev.config, monthInQuarter: parseInt(value) }
                                  }))}
                                >
                                  <SelectTrigger data-testid="select-month-in-quarter">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="1">1st month</SelectItem>
                                    <SelectItem value="2">2nd month</SelectItem>
                                    <SelectItem value="3">3rd month</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                            <div>
                              <Label>Day of Month</Label>
                              <Input
                                type="number"
                                data-testid="input-day-of-month"
                                value={newTemplate.config.dayOfMonth}
                                onChange={(e) => setNewTemplate(prev => ({ 
                                  ...prev, 
                                  config: { ...prev.config, dayOfMonth: parseInt(e.target.value) || 1 }
                                }))}
                                min="1"
                                max="31"
                              />
                            </div>
                            <div>
                              <Label>Time (Optional)</Label>
                              <Input
                                type="time"
                                data-testid="input-quarterly-time"
                                value={newTemplate.config.time}
                                onChange={(e) => setNewTemplate(prev => ({ 
                                  ...prev, 
                                  config: { ...prev.config, time: e.target.value }
                                }))}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                  <div className="flex justify-center pt-4">
                    <Button 
                      onClick={handleCreateTemplate}
                      disabled={!newTemplate.name || !newTemplate.type || !newTemplate.platform || createTemplateMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
                      data-testid="button-save-template"
                    >
                      {createTemplateMutation.isPending ? 'Creating Mini-Game...' : 'Create Mini-Game Schedule'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Existing Templates */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Your Created Mini-Games</h4>
                {templatesLoading ? (
                  <div className="text-center py-8">Loading mini-games...</div>
                ) : templates.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No mini-games created yet. Fill out the form above to get started.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {templates.map((template) => (
                    <Card key={template.id} data-testid={`template-card-${template.id}`}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{template.name}</h4>
                            {template.description && (
                              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                {template.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {template.recurrenceType.replace('_', ' ')}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {getRecurrenceDescription(template)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handlePreviewTemplate(template)}
                              disabled={previewMutation.isPending}
                              data-testid={`button-preview-${template.id}`}
                            >
                              <Eye className="h-4 w-4" />
                              Preview
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => {
                                const fromDate = new Date();
                                const toDate = new Date();
                                toDate.setMonth(toDate.getMonth() + 3); // 3 months ahead
                                generateItemsMutation.mutate({
                                  templateId: template.id,
                                  fromDate: fromDate.toISOString(),
                                  toDate: toDate.toISOString(),
                                  title: `Auto-generated from ${template.name}`,
                                  description: template.description
                                });
                              }}
                              disabled={generateItemsMutation.isPending}
                              data-testid={`button-generate-${template.id}`}
                            >
                              <Play className="h-4 w-4" />
                              Generate
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Scheduled Items Tab */}
            <TabsContent value="scheduled" className="space-y-4">
              <h3 className="text-lg font-semibold">Scheduled Content Items</h3>
              
              {itemsLoading ? (
                <div className="text-center py-8">Loading scheduled items...</div>
              ) : scheduledItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No scheduled content items yet. Generate some from your templates!
                </div>
              ) : (
                <div className="grid gap-4">
                  {scheduledItems.map((item: any) => (
                    <Card key={item.id} data-testid={`scheduled-item-${item.id}`}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">{item.title}</h4>
                            {item.description && (
                              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                {item.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className={getStatusColor(item.status)}>
                                {item.status}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                Scheduled for {format(parseISO(item.scheduledDate), 'MMM d, yyyy h:mm a')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Calendar View Tab */}
            <TabsContent value="calendar" className="space-y-4">
              <h3 className="text-lg font-semibold">Date Selection Calendar</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Click dates to select them, or drag to select consecutive dates. Selected dates will be saved as individual Notion records.
              </p>
              
              <div className="flex gap-6">
                {/* Calendar */}
                <div className="flex-1">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-5 w-5" />
                          Select Dates
                        </div>
                        {/* Interactive Month/Year Selector */}
                        <div className="flex items-center gap-2">
                          <Select 
                            value={calendarMonth.getMonth().toString()}
                            onValueChange={(value) => setCalendarMonth(new Date(calendarMonth.getFullYear(), parseInt(value), 1))}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 12 }, (_, i) => (
                                <SelectItem key={i} value={i.toString()}>
                                  {format(new Date(2000, i, 1), 'MMMM')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select 
                            value={calendarMonth.getFullYear().toString()}
                            onValueChange={(value) => setCalendarMonth(new Date(parseInt(value), calendarMonth.getMonth(), 1))}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 10 }, (_, i) => {
                                const year = new Date().getFullYear() + i;
                                return (
                                  <SelectItem key={year} value={year.toString()}>
                                    {year}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DayPicker
                        mode="multiple"
                        selected={selectedDates}
                        onSelect={(dates) => setSelectedDates(dates || [])}
                        month={calendarMonth}
                        onMonthChange={setCalendarMonth}
                        className="rdp"
                        classNames={{
                          day_selected: "bg-blue-600 text-white hover:bg-blue-700",
                          day: "hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer",
                          day_today: "font-bold text-blue-600"
                        }}
                        data-testid="calendar-date-picker"
                      />
                      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                        <p><strong>How to use:</strong></p>
                        <p>• Click individual dates to select/deselect them</p>
                        <p>• Hold Shift and click to select a range of dates</p>
                        <p>• Use the month/year dropdowns above to navigate quickly</p>
                        <p>• Click on selected dates in the sidebar to navigate to them</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Selected Dates Sidebar */}
                <div className="w-96">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Selected Dates ({selectedDates.length})</span>
                        {selectedDates.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedDates([])}
                            data-testid="button-clear-dates"
                          >
                            <X className="h-4 w-4" />
                            Clear All
                          </Button>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedDates.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No dates selected. Click on calendar dates to select them.
                        </div>
                      ) : (
                        <>
                          {/* Mini-Game Title and Moon Phase Fields */}
                          <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <Label htmlFor="mini-game-title" className="text-sm font-medium">
                                Mini-Game Title
                              </Label>
                              <Select 
                                value={miniGameTitle} 
                                onValueChange={setMiniGameTitle}
                              >
                                <SelectTrigger className="mt-1" data-testid="select-mini-game-title">
                                  <SelectValue placeholder="Select mini-game..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {miniGameTitles.map((title) => (
                                    <SelectItem key={title} value={title}>
                                      {title}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="moon-phase" className="text-sm font-medium">
                                Moon Phase (Optional)
                              </Label>
                              <Select 
                                value={selectedMoonPhase} 
                                onValueChange={setSelectedMoonPhase}
                              >
                                <SelectTrigger className="mt-1" data-testid="select-moon-phase">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {moonPhaseOptions.map((phase) => (
                                    <SelectItem key={phase} value={phase}>
                                      {phase}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Name Preview */}
                          {miniGameTitle && (
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <Label className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                Name Preview:
                              </Label>
                              <div className="mt-1 text-sm text-blue-700 dark:text-blue-300 font-mono">
                                {selectedDates.length > 0 && generateNamePreview(miniGameTitle, selectedDates[0], selectedDates, selectedMoonPhase)}
                                {selectedDates.length > 1 && (
                                  <div className="mt-1 text-xs opacity-75">
                                    (Example for first date - each date gets unique numbering)
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Selected Dates List */}
                          <div className="max-h-64 overflow-y-auto space-y-2">
                            {selectedDates
                              .sort((a, b) => a.getTime() - b.getTime())
                              .map((date, index) => (
                                <div
                                  key={index}
                                  className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                                  data-testid={`selected-date-${index}`}
                                  onClick={() => navigateToDate(date)}
                                >
                                  <div className="flex-1">
                                    <div className="text-sm font-semibold">
                                      {format(date, 'EEEE MMM d, yyyy')}
                                    </div>
                                    {miniGameTitle && (
                                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        {generateNamePreview(miniGameTitle, date, selectedDates, selectedMoonPhase)}
                                      </div>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedDates(prev => 
                                        prev.filter(d => d.getTime() !== date.getTime())
                                      );
                                    }}
                                    data-testid={`button-remove-date-${index}`}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))
                            }
                          </div>
                          
                          <div className="pt-4 border-t">
                            <Button
                              onClick={handleSaveSelectedDates}
                              disabled={saveSelectedDatesMutation.isPending || !miniGameTitle.trim()}
                              className="w-full bg-green-600 hover:bg-green-700 text-white"
                              data-testid="button-save-selected-dates"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              {saveSelectedDatesMutation.isPending ? 'Saving...' : `Save ${selectedDates.length} Date${selectedDates.length === 1 ? '' : 's'} to Notion`}
                            </Button>
                            {!miniGameTitle.trim() && selectedDates.length > 0 && (
                              <p className="text-xs text-red-500 mt-1">
                                Mini-Game title is required to save dates
                              </p>
                            )}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Preview Dialog */}
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  Schedule Preview: {selectedTemplate?.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {previewMutation.isPending ? (
                  <div className="text-center py-8">Generating preview...</div>
                ) : previewOccurrences.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No upcoming occurrences found for this schedule.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Next 10 Occurrences:</h4>
                    {previewOccurrences.map((occurrence, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <div className="font-medium">{occurrence.title}</div>
                          {occurrence.description && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {occurrence.description}
                            </div>
                          )}
                        </div>
                        <div className="text-sm font-mono">
                          {format(new Date(occurrence.date), 'MMM d, yyyy h:mm a')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-end">
                  <Button onClick={() => setShowPreview(false)}>Close</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Preview Confirmation Modal */}
          <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
            <DialogContent className="max-w-4xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Schedule Preview Confirmation
                </DialogTitle>
              </DialogHeader>
              
              {previewConfirmData && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Template</p>
                      <p className="font-semibold">{previewConfirmData.template.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Content Type</p>
                      <p className="font-semibold">{previewConfirmData.template.type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Platform</p>
                      <p className="font-semibold">{previewConfirmData.template.platform}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Occurrences</p>
                      <p className="font-semibold">{previewConfirmData.occurrences?.length || 0}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Scheduled Dates & Names:</h4>
                    <ScrollArea className="h-64 w-full border rounded-lg p-4">
                      <div className="space-y-2">
                        {previewConfirmData.occurrences?.map((occurrence: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-white dark:bg-gray-700 rounded border">
                            <div>
                              <p className="font-medium text-blue-600 dark:text-blue-400">
                                {occurrence.standardizedName}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {format(new Date(occurrence.date), 'EEEE, MMMM d, yyyy')}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {format(new Date(occurrence.date), 'MMM yyyy')}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                      📋 What happens when you confirm:
                    </h5>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Creates {previewConfirmData.occurrences?.length} scheduled content items</li>
                      <li>• Each item will be named with the standardized format shown above</li>
                      <li>• Content will be scheduled to sync with Notion on each date</li>
                      <li>• You can manage and edit these items in the "Scheduled Items" tab</li>
                    </ul>
                  </div>
                </div>
              )}
              
              <DialogFooter className="gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPreviewModal(false)}
                  data-testid="button-cancel-preview"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (previewConfirmData) {
                      // Generate the content items with standardized names
                      const itemsToCreate = previewConfirmData.occurrences.map((occurrence: any) => ({
                        templateId: previewConfirmData.template.id,
                        title: occurrence.standardizedName,
                        description: previewConfirmData.template.description,
                        scheduledDate: occurrence.date,
                        notionPageId: null,
                        status: 'scheduled'
                      }));
                      
                      // Create each scheduled item individually with standardized names
                      Promise.all(itemsToCreate.map((item: any) => 
                        fetch('/api/scheduled-content-items', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(item)
                        })
                      )).then(() => {
                        toast({ 
                          title: `Created ${itemsToCreate.length} scheduled items!`,
                          description: "Content has been scheduled with standardized names."
                        });
                        queryClient.invalidateQueries({ queryKey: ['/api/scheduled-content-items'] });
                        if (onContentScheduled) {
                          onContentScheduled(itemsToCreate);
                        }
                      }).catch((error) => {
                        toast({ 
                          title: "Error creating scheduled items", 
                          description: error.message, 
                          variant: "destructive" 
                        });
                      });
                      
                      setShowPreviewModal(false);
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="button-confirm-schedule"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Confirm & Create Schedule
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}