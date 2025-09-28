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
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";
import { MOON_PHASE_OPTIONS, PAGE_OPTIONS, MINI_GAME_TITLES, MOON_PHASE_DISPLAY_TO_BACKEND, ZODIAC_SIGN_OPTIONS } from "@shared/dropdown-constants";

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
  const [activeTab, setActiveTab] = useState<"create-schedule" | "scheduled">("create-schedule");
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ScheduleTemplate | null>(null);
  const [previewOccurrences, setPreviewOccurrences] = useState<ScheduleOccurrence[]>([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewConfirmData, setPreviewConfirmData] = useState<any>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedDateTimes, setSelectedDateTimes] = useState<{ date: Date; time?: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartDate, setDragStartDate] = useState<Date | null>(null);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date(2026, 0, 1)); // Initialize to January 2026
  const [miniGameTitle, setMiniGameTitle] = useState<string>("");
  const [selectedMoonPhase, setSelectedMoonPhase] = useState<string>("None");
  const [selectedZodiac, setSelectedZodiac] = useState<string>("None");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Form state for new template
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    type: "",
    platform: "",
    page: "", // New field for page selection
    recurrenceType: "weekly" as 'weekly' | 'nth_weekday' | 'quarterly' | 'monthly_day' | 'moon_phase',
    config: {
      // Weekly config
      dayOfWeek: 1, // Monday
      time: "09:00",
      startDate: "2026-01-01", // Default start date
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

  // Initialize calendar month to match default start date
  useEffect(() => {
    if (newTemplate.config.startDate) {
      // Parse date string more explicitly to avoid timezone issues
      const [year, month, day] = newTemplate.config.startDate.split('-').map(Number);
      setCalendarMonth(new Date(year, month - 1, 1)); // month - 1 because JS months are 0-indexed
    }
  }, []); // Run only on component mount

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
        description: "Each selected date has been saved as a unique record."
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

  // Create bulk content items mutation
  const createBulkItemsMutation = useMutation({
    mutationFn: async (items: any[]) => {
      // Create items sequentially with proper error handling
      const results = [];
      const errors = [];
      
      for (const item of items) {
        try {
          const response = await fetch('/api/scheduled-content-items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
          });
          
          if (!response.ok) {
            const errorData = await response.text();
            throw new Error(errorData);
          }
          
          const result = await response.json();
          results.push(result);
        } catch (error: any) {
          errors.push({ item: item.title, error: error.message });
        }
      }
      
      if (errors.length > 0 && results.length === 0) {
        throw new Error(`Failed to create all items: ${errors.map(e => e.error).join('; ')}`);
      }
      
      return { results, errors };
    },
    onSuccess: ({ results, errors }) => {
      if (errors.length > 0) {
        toast({
          title: `Created ${results.length} items with ${errors.length} errors`,
          description: `Some items failed: ${errors.map(e => e.item).join(', ')}`,
          variant: "destructive"
        });
      } else {
        toast({ 
          title: `Created ${results.length} scheduled items!`,
          description: "Content has been successfully scheduled."
        });
      }
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/scheduled-content-items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mini-game-blocks'] });
      
      // Call callback if provided
      if (onContentScheduled && results.length > 0) {
        onContentScheduled(results);
      }
      
      // Clear form on successful creation
      if (results.length > 0) {
        setSelectedDates([]);
        setSelectedDateTimes([]);
        setMiniGameTitle('');
        setNewTemplate({ 
          name: '',
          description: '',
          type: 'mini-game-block',
          platform: '@rotationonly',
          page: '',
          recurrenceType: 'weekly', 
          config: {
            dayOfWeek: 0,
            time: '12:00',
            weekNumber: 1,
            monthInQuarter: 1,
            dayOfMonth: 1,
            phaseTypes: [],
            offsetDays: 0,
            startDate: format(new Date(), 'yyyy-MM-dd')
          }
        });
      }
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error creating scheduled items", 
        description: error.message, 
        variant: "destructive" 
      });
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
  const generateNamePreview = (title: string, date: Date, dates: Date[], moonPhase?: string, zodiac?: string): string => {
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
    
    // Add zodiac sign if selected and not "None"
    if (zodiac && zodiac !== "None") {
      baseName += ` - ${zodiac}`;
    }
    
    return baseName;
  };

  // Navigate to specific date on calendar
  const navigateToDate = (date: Date) => {
    setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    // Switch to create schedule tab if not already there
    setActiveTab("create-schedule");
  };

  // Use centralized constants for consistency
  const miniGameTitles = MINI_GAME_TITLES;
  const moonPhaseOptions = MOON_PHASE_OPTIONS;

  const resetForm = () => {
    setNewTemplate({
      name: "",
      description: "",
      type: "",
      platform: "",
      page: "",
      recurrenceType: "weekly",
      config: {
        dayOfWeek: 1,
        time: "09:00",
        weekNumber: 1,
        monthInQuarter: 1,
        dayOfMonth: 1,
        phaseTypes: ['full_moon'],
        offsetDays: 0,
        startDate: format(new Date(), 'yyyy-MM-dd')
      }
    });
    setSelectedMoonPhase("None");
    setSelectedZodiac("None");
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

  // Validate that generated dates match configuration settings
  const validateGeneratedDates = (dates: Date[], config: any, recurrenceType: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (dates.length === 0) {
      errors.push("No dates were generated");
      return { isValid: false, errors };
    }

    try {
      switch (recurrenceType) {
        case 'weekly':
          // Check that all dates are on the correct day of week
          const expectedDayOfWeek = config.dayOfWeek;
          const invalidWeeklyDates = dates.filter(date => date.getDay() !== expectedDayOfWeek);
          if (invalidWeeklyDates.length > 0) {
            errors.push(`${invalidWeeklyDates.length} dates are not on the configured day of week`);
          }
          
          // Check that dates are exactly 7 days apart
          for (let i = 1; i < dates.length; i++) {
            const daysDiff = Math.abs((dates[i].getTime() - dates[i-1].getTime()) / (1000 * 60 * 60 * 24));
            if (Math.abs(daysDiff - 7) > 0.1) { // Allow small floating point differences
              errors.push(`Dates are not exactly 7 days apart`);
              break;
            }
          }
          break;

        case 'nth_weekday':
          // Check that all dates are on the correct day of week and week number
          const expectedWeekNumber = config.weekNumber;
          const expectedNthDayOfWeek = config.dayOfWeek;
          
          dates.forEach((date, index) => {
            if (date.getDay() !== expectedNthDayOfWeek) {
              errors.push(`Date ${index + 1} is not on the configured day of week`);
            }
            
            // Calculate which week of the month this date falls in
            const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const weekOfMonth = Math.ceil((date.getDate() + firstDayOfMonth.getDay()) / 7);
            
            if (expectedWeekNumber === -1) {
              // Check if it's the last occurrence
              const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
              const isLastWeek = date.getDate() > lastDayOfMonth.getDate() - 7;
              if (!isLastWeek) {
                errors.push(`Date ${index + 1} is not the last occurrence of the day in the month`);
              }
            } else if (weekOfMonth !== expectedWeekNumber) {
              errors.push(`Date ${index + 1} is not in the ${expectedWeekNumber}th week of the month`);
            }
          });
          break;

        case 'monthly_day':
          // Check that all dates are on the correct day of month
          const expectedDayOfMonth = config.dayOfMonth;
          const invalidMonthlyDates = dates.filter(date => date.getDate() !== expectedDayOfMonth);
          if (invalidMonthlyDates.length > 0) {
            errors.push(`${invalidMonthlyDates.length} dates are not on the configured day of month`);
          }
          break;

        case 'quarterly':
          // Check that dates honor monthInQuarter and dayOfMonth configuration
          const expectedMonthInQuarter = config.monthInQuarter; // 1, 2, or 3
          const expectedQuarterlyDayOfMonth = config.dayOfMonth;
          
          dates.forEach((date, index) => {
            // Check day of month
            if (date.getDate() !== expectedQuarterlyDayOfMonth) {
              errors.push(`Date ${index + 1} is not on the configured day of month (${expectedQuarterlyDayOfMonth})`);
            }
            
            // Check month position within quarter
            const monthInQuarter = (date.getMonth() % 3) + 1; // 1, 2, or 3
            if (monthInQuarter !== expectedMonthInQuarter) {
              errors.push(`Date ${index + 1} is not in the configured month of quarter (${expectedMonthInQuarter})`);
            }
          });
          
          // Check that dates are approximately 3 months apart
          for (let i = 1; i < dates.length; i++) {
            const monthsDiff = (dates[i].getFullYear() - dates[i-1].getFullYear()) * 12 + 
                              (dates[i].getMonth() - dates[i-1].getMonth());
            if (Math.abs(monthsDiff - 3) > 0.1) {
              errors.push(`Dates are not exactly 3 months apart`);
              break;
            }
          }
          break;

        case 'moon_phase':
          // For moon phase, we can't easily validate without moon phase data
          // Just check that dates exist
          if (dates.length === 0) {
            errors.push("No moon phase dates generated");
          }
          break;

        default:
          errors.push(`Unknown recurrence type: ${recurrenceType}`);
      }
    } catch (error) {
      errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return { isValid: errors.length === 0, errors };
  };

  // Pure function to generate dates without side effects
  const generateDates = (config: any, recurrenceType: string, startDate: Date): { date: Date; time?: string }[] => {
    const dates: { date: Date; time?: string }[] = [];
    const endDate = new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate());
    endDate.setHours(12, 0, 0, 0);

    try {
      switch (recurrenceType) {
        case 'weekly':
          if (config.dayOfWeek !== undefined) {
            const dayOfWeek = config.dayOfWeek;
            const currentDate = new Date(startDate);
            
            // Find first occurrence of the day of week
            while (currentDate.getDay() !== dayOfWeek) {
              currentDate.setDate(currentDate.getDate() + 1);
            }
            
            // Generate weekly occurrences
            while (currentDate <= endDate && dates.length < 52) {
              const normalizedDate = new Date(currentDate);
              normalizedDate.setHours(12, 0, 0, 0);
              dates.push({
                date: normalizedDate,
                time: config.time
              });
              currentDate.setDate(currentDate.getDate() + 7);
            }
          }
          break;

        case 'nth_weekday':
          if (config.weekNumber !== undefined && config.dayOfWeek !== undefined) {
            const weekNumber = config.weekNumber;
            const dayOfWeek = config.dayOfWeek;
            
            // Generate for each month within the year range
            let currentMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
            while (currentMonth <= endDate) {
              let targetDate: Date;
              
              if (weekNumber === -1) { // Last occurrence
                const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
                targetDate = new Date(lastDayOfMonth);
                
                // Find the last occurrence of the day of week
                while (targetDate.getDay() !== dayOfWeek) {
                  targetDate.setDate(targetDate.getDate() - 1);
                }
              } else { // Nth occurrence
                const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
                targetDate = new Date(firstDayOfMonth);
                
                // Find first occurrence of the day of week
                while (targetDate.getDay() !== dayOfWeek) {
                  targetDate.setDate(targetDate.getDate() + 1);
                }
                
                // Add (n-1) weeks
                targetDate.setDate(targetDate.getDate() + (weekNumber - 1) * 7);
              }
              
              if (targetDate.getMonth() === currentMonth.getMonth() && targetDate >= startDate && targetDate <= endDate) {
                const normalizedDate = new Date(targetDate);
                normalizedDate.setHours(12, 0, 0, 0);
                dates.push({
                  date: normalizedDate,
                  time: config.time
                });
              }
              
              // Move to next month
              currentMonth.setMonth(currentMonth.getMonth() + 1);
            }
          }
          break;

        case 'monthly_day':
          if (config.dayOfMonth !== undefined) {
            const dayOfMonth = config.dayOfMonth;
            
            let currentMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
            while (currentMonth <= endDate) {
              const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
              if (dayOfMonth <= daysInMonth) {
                const targetDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayOfMonth);
                targetDate.setHours(12, 0, 0, 0);
                if (targetDate >= startDate && targetDate <= endDate) {
                  dates.push({
                    date: targetDate,
                    time: config.time
                  });
                }
              }
              
              // Move to next month
              currentMonth.setMonth(currentMonth.getMonth() + 1);
            }
          }
          break;

        case 'quarterly':
          if (config.monthInQuarter !== undefined && config.dayOfMonth !== undefined) {
            const monthInQuarter = config.monthInQuarter; // 1, 2, or 3
            const dayOfMonth = config.dayOfMonth;
            
            // Start from the current quarter
            const startQuarter = Math.floor(startDate.getMonth() / 3);
            const startYear = startDate.getFullYear();
            
            for (let i = 0; i < 8; i++) { // 8 quarters (2 years)
              const quarterIndex = startQuarter + i;
              const year = startYear + Math.floor(quarterIndex / 4);
              const quarterInYear = quarterIndex % 4;
              
              // Calculate the target month (0-based)
              const targetMonth = (quarterInYear * 3) + (monthInQuarter - 1);
              
              // Check if day exists in target month
              const daysInMonth = new Date(year, targetMonth + 1, 0).getDate();
              if (dayOfMonth <= daysInMonth) {
                const targetDate = new Date(year, targetMonth, dayOfMonth);
                targetDate.setHours(12, 0, 0, 0);
                
                if (targetDate >= startDate && targetDate <= endDate) {
                  dates.push({
                    date: targetDate,
                    time: config.time
                  });
                }
              }
            }
          }
          break;

        case 'moon_phase':
          // For moon phase, generate approximate monthly occurrences
          let currentMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
          while (currentMonth <= endDate) {
            const moonDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 15);
            moonDate.setHours(12, 0, 0, 0);
            if (moonDate >= startDate && moonDate <= endDate) {
              dates.push({
                date: moonDate,
                time: config.time
              });
            }
            
            // Move to next month
            currentMonth.setMonth(currentMonth.getMonth() + 1);
          }
          break;
      }
    } catch (error) {
      console.error('Error generating dates:', error);
    }

    return dates;
  };

  // Enhanced Generate Preview with Validation
  const handleGeneratePreviewWithValidation = () => {
    // First check if all required configuration is present
    if (!newTemplate.recurrenceType) {
      toast({
        title: "Missing Configuration",
        description: "Please select a recurrence type first.",
        variant: "destructive"
      });
      return;
    }

    // Get start date
    const configStartDate = newTemplate.config.startDate ? 
      new Date(newTemplate.config.startDate) : 
      new Date();
    configStartDate.setHours(12, 0, 0, 0);

    // Generate dates synchronously
    const generatedDates = generateDates(newTemplate.config, newTemplate.recurrenceType, configStartDate);
    
    if (generatedDates.length === 0) {
      toast({
        title: "No Dates Generated",
        description: "Check your configuration settings and try again.",
        variant: "destructive"
      });
      return;
    }

    // Validate the generated dates
    const dateObjects = generatedDates.map(d => d.date);
    const validation = validateGeneratedDates(dateObjects, newTemplate.config, newTemplate.recurrenceType);
    
    if (validation.isValid) {
      // Update state with validated dates
      setSelectedDates(dateObjects);
      setSelectedDateTimes(generatedDates);
      
      toast({
        title: "Preview Generated Successfully ✓",
        description: `Generated ${dateObjects.length} valid dates matching your configuration.`,
        variant: "default"
      });
    } else {
      toast({
        title: "Configuration Mismatch",
        description: `Validation errors: ${validation.errors.join(', ')}`,
        variant: "destructive"
      });
    }
  };

  // Auto-populate calendar dates based on recurrence type
  const handleAutoPopulateDates = (recurrenceType?: string) => {
    const activeRecurrenceType = recurrenceType || newTemplate.recurrenceType;
    if (!activeRecurrenceType) {
      // Clear selections if no recurrence type
      setSelectedDates([]);
      setSelectedDateTimes([]);
      setPreviewOccurrences([]); // Clear preview when config changes
      return;
    }

    // Clear preview when config changes to avoid stale data
    setPreviewOccurrences([]);

    // Use start date from config or default to today
    const configStartDate = newTemplate.config.startDate ? 
      new Date(newTemplate.config.startDate) : 
      new Date();
    configStartDate.setHours(12, 0, 0, 0); // Normalize to noon

    try {
      // Use the pure generation function
      const dates = generateDates(newTemplate.config, activeRecurrenceType, configStartDate);

      // Update both selectedDates and selectedDateTimes
      const generatedDates = dates.map(d => d.date);
      setSelectedDates(generatedDates);
      setSelectedDateTimes(dates);
      
      // Show success feedback if dates were generated
      if (dates.length > 0) {
        toast({
          title: "Schedule Auto-Generated",
          description: `Generated ${dates.length} dates for ${activeRecurrenceType} recurrence`,
          variant: "default"
        });
      }
      
    } catch (error) {
      console.error('Error auto-populating dates:', error);
      toast({ 
        title: "Error generating dates", 
        description: "Please check your recurrence configuration", 
        variant: "destructive" 
      });
    }
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
            Create Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create-schedule" data-testid="tab-create-schedule">Create Schedule</TabsTrigger>
              <TabsTrigger value="scheduled" data-testid="tab-scheduled">Scheduled Items</TabsTrigger>
            </TabsList>

            {/* Create Schedule Tab - Unified Interface */}
            <TabsContent value="create-schedule" className="space-y-6">
              <div className="text-center mb-6">
                {/* <h3 className="text-xl font-bold mb-2">Create Schedule</h3>
                <p className="text-gray-600 dark:text-gray-400">Configure your mini-game schedule settings and see the automatically generated dates and names</p> */}
              </div>

              {/* Unified Schedule Configuration */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Side - Configuration Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Schedule Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Mini-Game Title Selection */}
                    <div>
                      <Label htmlFor="mini-game-title-select">Mini-Game Name</Label>
                      <Select 
                        value={miniGameTitle} 
                        onValueChange={setMiniGameTitle}
                      >
                        <SelectTrigger data-testid="select-mini-game-title-main">
                          <SelectValue placeholder="greatness takes patience..." />
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

                    {/* Page Selection */}
                    <div>
                      <Label htmlFor="page-select">Page</Label>
                      <Select 
                        value={newTemplate.page || ''} 
                        onValueChange={(value) => {
                          setNewTemplate(prev => ({ ...prev, page: value }));
                        }}
                      >
                        <SelectTrigger data-testid="select-page">
                          <SelectValue placeholder="Select page..." />
                        </SelectTrigger>
                        <SelectContent>
                          {PAGE_OPTIONS.map((page) => (
                            <SelectItem key={page} value={page}>
                              {page}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Moon Phase Selection */}
                    <div>
                      <Label htmlFor="moon-phase-select">Moon Phase</Label>
                      <Select 
                        value={selectedMoonPhase} 
                        onValueChange={(value) => {
                          setSelectedMoonPhase(value);
                          // Reset zodiac when moon phase changes to None
                          if (value === "None") {
                            setSelectedZodiac("None");
                          }
                        }}
                      >
                        <SelectTrigger data-testid="select-moon-phase-main">
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

                    {/* Zodiac Sign Selection (conditional) */}
                    {selectedMoonPhase !== "None" && (
                      <div>
                        <Label htmlFor="zodiac-select">Zodiac Sign</Label>
                        <Select 
                          value={selectedZodiac} 
                          onValueChange={setSelectedZodiac}
                        >
                          <SelectTrigger data-testid="select-zodiac">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ZODIAC_SIGN_OPTIONS.map((zodiac) => (
                              <SelectItem key={zodiac} value={zodiac}>
                                {zodiac}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Template Name Preview (Read-only) */}
                    {miniGameTitle && (
                      <div>
                        <Label>Name Preview</Label>
                        <Input
                          value={miniGameTitle && selectedDates.length > 0 ? 
                            generateNamePreview(miniGameTitle, selectedDates[0], selectedDates, selectedMoonPhase,
selectedZodiac) : 
                            miniGameTitle}
                          readOnly
                          className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                          data-testid="input-generated-name"
                        />
                        <p className="text-xs text-gray-500 mt-1">This name will be used for the schedule template</p>
                      </div>
                    )}

                    {/* Start Date for Planning */}
                    <div>
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        type="date"
                        data-testid="input-start-date"
                        value={newTemplate.config.startDate || ''}
                        onChange={(e) => {
                          setNewTemplate(prev => ({ 
                            ...prev, 
                            config: { ...prev.config, startDate: e.target.value }
                          }));
                          // Update calendar month to match start date
                          if (e.target.value) {
                            // Parse date string more explicitly to avoid timezone issues
                            const [year, month, day] = e.target.value.split('-').map(Number);
                            setCalendarMonth(new Date(year, month - 1, 1)); // month - 1 because JS months are 0-indexed
                          }
                          handleAutoPopulateDates();
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">Schedule will start from this date</p>
                    </div>

                    {/* Recurrence Type */}
                    <div>
                      <Label htmlFor="recurrence-type">Cadence & Frequency</Label>
                      <Select 
                        value={newTemplate.recurrenceType} 
                        onValueChange={(value: 'weekly' | 'nth_weekday' | 'quarterly' | 'monthly_day' | 'moon_phase') => {
                          setNewTemplate(prev => ({ ...prev, recurrenceType: value }));
                          // Auto-populate calendar dates when recurrence type changes
                          handleAutoPopulateDates(value);
                        }}
                      >
                        <SelectTrigger data-testid="select-recurrence-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly (ex. Every Tuesday)</SelectItem>
                          
                          <SelectItem value="nth_weekday">Nth Weekday (ex. 4th Sunday)</SelectItem>
                          <SelectItem value="quarterly">Quarterly (ex. Spring Equinox)</SelectItem>
                          <SelectItem value="monthly_day">Monthly Day (ex. 7th of month)</SelectItem>
                          <SelectItem value="moon_phase">Moon Phase</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Additional Configuration based on recurrence type */}
                    {newTemplate.recurrenceType === 'weekly' && (
                      <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                        <div>
                          <Label>Day of Week</Label>
                          <Select 
                            value={newTemplate.config.dayOfWeek?.toString() || ''} 
                            onValueChange={(value) => {
                              setNewTemplate(prev => ({ 
                                ...prev, 
                                config: { ...prev.config, dayOfWeek: parseInt(value) }
                              }));
                              handleAutoPopulateDates();
                            }}
                          >
                            <SelectTrigger data-testid="select-day-of-week">
                              <SelectValue placeholder="Select day..." />
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
                            data-testid="input-weekly-time"
                            value={newTemplate.config.time || ''}
                            onChange={(e) => {
                              setNewTemplate(prev => ({ 
                                ...prev, 
                                config: { ...prev.config, time: e.target.value }
                              }));
                              handleAutoPopulateDates();
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {newTemplate.recurrenceType === 'nth_weekday' && (
                      <div className="grid grid-cols-3 gap-4 p-4 border rounded-lg">
                        <div>
                          <Label>Week Number</Label>
                          <Select 
                            value={newTemplate.config.weekNumber?.toString() || ''} 
                            onValueChange={(value) => {
                              setNewTemplate(prev => ({ 
                                ...prev, 
                                config: { ...prev.config, weekNumber: parseInt(value) }
                              }));
                              handleAutoPopulateDates();
                            }}
                          >
                            <SelectTrigger data-testid="select-week-number">
                              <SelectValue placeholder="Week..." />
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
                            value={newTemplate.config.dayOfWeek?.toString() || ''} 
                            onValueChange={(value) => {
                              setNewTemplate(prev => ({ 
                                ...prev, 
                                config: { ...prev.config, dayOfWeek: parseInt(value) }
                              }));
                              handleAutoPopulateDates();
                            }}
                          >
                            <SelectTrigger data-testid="select-nth-day-of-week">
                              <SelectValue placeholder="Day..." />
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
                            value={newTemplate.config.time || ''}
                            onChange={(e) => {
                              setNewTemplate(prev => ({ 
                                ...prev, 
                                config: { ...prev.config, time: e.target.value }
                              }));
                              handleAutoPopulateDates();
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {newTemplate.recurrenceType === 'monthly_day' && (
                      <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                        <div>
                          <Label>Day of Month</Label>
                          <Input
                            type="number"
                            min="1"
                            max="31"
                            data-testid="input-day-of-month"
                            value={newTemplate.config.dayOfMonth || ''}
                            onChange={(e) => {
                              setNewTemplate(prev => ({ 
                                ...prev, 
                                config: { ...prev.config, dayOfMonth: parseInt(e.target.value) }
                              }));
                              handleAutoPopulateDates();
                            }}
                            placeholder="1-31"
                          />
                        </div>
                        <div>
                          <Label>Time (Optional)</Label>
                          <Input
                            type="time"
                            data-testid="input-monthly-time"
                            value={newTemplate.config.time || ''}
                            onChange={(e) => {
                              setNewTemplate(prev => ({ 
                                ...prev, 
                                config: { ...prev.config, time: e.target.value }
                              }));
                              handleAutoPopulateDates();
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        onClick={() => {
                          if (miniGameTitle && selectedDates.length > 0) {
                            // Create scheduled content items using proper mutation
                            const itemsToCreate = selectedDates.map((date) => {
                              const dateTimeObj = selectedDateTimes.find(dt => dt.date.getTime() === date.getTime()) || { date, time: undefined };
                              
                              // Auto-populate the new fields
                              const monthName = format(date, 'MMMM'); // e.g., "March", "April"
                              const dayOfWeekName = format(date, 'EEEE'); // e.g., "Friday"
                              const moonPhaseValue = selectedMoonPhase ? MOON_PHASE_DISPLAY_TO_BACKEND[selectedMoonPhase] : null;
                              const zodiacValue = selectedMoonPhase !== "None" && selectedZodiac !== "None" ? selectedZodiac : null;
                              const squareTypeValue = miniGameTitle; // Mini Game Title becomes Square Type
                              const pageValue = newTemplate.page || null;
                              
                              return {
                                templateId: null, // This will be generated server-side
                                title: generateNamePreview(miniGameTitle, date, selectedDates, selectedMoonPhase, selectedZodiac),
                                description: `Generated from ${newTemplate.recurrenceType} recurrence pattern`,
                                scheduledDate: date.toISOString(),
                                notionPageId: null,
                                status: 'Scheduled',
                                // Auto-populated fields
                                page: pageValue,
                                month: monthName,
                                dayOfWeek: dayOfWeekName,
                                moonPhase: moonPhaseValue,
                                zodiac: zodiacValue,
                                squareType: squareTypeValue
                              };
                            });
                            
                            // Use the proper mutation
                            createBulkItemsMutation.mutate(itemsToCreate);
                          } else {
                            // Show helpful feedback when prerequisites aren't met
                            if (!miniGameTitle) {
                              toast({
                                title: "Missing Title",
                                description: "Please enter a mini-game title first.",
                                variant: "destructive"
                              });
                            } else if (selectedDates.length === 0) {
                              toast({
                                title: "No Dates Selected",
                                description: "Please select recurrence settings or choose dates manually.",
                                variant: "destructive"
                              });
                            }
                          }
                        }}
                        disabled={!miniGameTitle || selectedDates.length === 0 || createBulkItemsMutation.isPending}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        data-testid="button-create-in-notion"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {createBulkItemsMutation.isPending 
                          ? `Creating ${selectedDates.length} Items...` 
                          : `Create ${selectedDates.length || 0} Scheduled Items`
                        }
                      </Button>
                      
                      <Button
                        onClick={() => handleGeneratePreviewWithValidation()}
                        disabled={!newTemplate.recurrenceType}
                        size="icon"
                        variant="outline"
                        className="h-10 w-10"
                        data-testid="button-generate-preview"
                        title="Generate Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Right Side - Interactive Calendar & Selected Dates */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      Calendar & Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Interactive Calendar */}
                    <div className="border rounded-lg p-4 flex justify-center">
                      {/* <h4 className="font-semibold mb-3">Select Dates Directly:</h4> */}
                      <div className="flex flex-col items-center">
                        <Calendar
                          mode="multiple"
                          selected={selectedDates}
                          onSelect={(dates) => {
                            if (dates) {
                              const dateArray = Array.from(dates);
                              setSelectedDates(dateArray);
                              const dateObjects = dateArray.map(date => ({ 
                                date, 
                                time: newTemplate.config.time 
                              }));
                              setSelectedDateTimes(dateObjects);
                            } else {
                              setSelectedDates([]);
                              setSelectedDateTimes([]);
                            }
                          }}
                          month={calendarMonth}
                          onMonthChange={setCalendarMonth}
                          className="rounded-md border"
                          data-testid="interactive-calendar"
                        />
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          Click dates to select/deselect </p>
                      </div>
                    </div>

                    {/* Selected Dates Preview */}
                    <div className="border rounded-lg p-4">
                      {selectedDates.length > 0 ? (
                        <>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold">Selected Dates ({selectedDates.length})</h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedDates([]);
                                setSelectedDateTimes([]);
                              }}
                              data-testid="button-clear-dates"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Clear All
                            </Button>
                          </div>
                          <ScrollArea className="h-64 w-full">
                            <div className="space-y-2">
                              {selectedDates
                                .sort((a, b) => a.getTime() - b.getTime())
                                .slice(0, 20)
                                .map((date, index) => {
                                  const dateTimeObj = selectedDateTimes.find(dt => dt.date.getTime() === date.getTime()) || { date, time: undefined };
                                  return (
                                    <div key={index} className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border group">
                                      <div className="flex-1">
                                        <p className="font-medium text-blue-700 dark:text-blue-300">
                                          {miniGameTitle ? generateNamePreview(miniGameTitle, dateTimeObj.date, selectedDates, selectedMoonPhase, selectedZodiac) : 'greatness_name here'}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                          {format(date, 'EEEE, MMMM d, yyyy')}
                                          {dateTimeObj.time && ` at ${dateTimeObj.time}`}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">
                                          {format(date, 'MMM')}
                                        </Badge>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            const updatedDates = selectedDates.filter((_, i) => i !== index);
                                            const updatedDateTimes = selectedDateTimes.filter(dt => dt.date.getTime() !== date.getTime());
                                            setSelectedDates(updatedDates);
                                            setSelectedDateTimes(updatedDateTimes);
                                          }}
                                          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                                          data-testid={`button-remove-date-${index}`}
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </ScrollArea>
                          {selectedDates.length > 20 && (
                            <p className="text-sm text-gray-500 mt-2 text-center">
                              + {selectedDates.length - 20} more dates... (showing first 20)
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                           <p>No dates selected</p> 
                          {/* <p className="text-sm">Use the calendar above or auto-generate with recurrence settings</p> */}
                        </div>
                      )}
                    </div>

                    {/* Summary Info */}
                    {selectedDates.length > 0 && (
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <h5 className="font-medium text-green-800 dark:text-green-200 mb-2">
                      Summary:
                        </h5>
                        <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                          <li>• Total dates: {selectedDates.length}</li>
                          <li>• Period: {selectedDates.length > 0 ? 
                            `${format(selectedDates[0], 'MMM yyyy')} - ${format(selectedDates[selectedDates.length - 1], 'MMM yyyy')}` 
                            : 'N/A'}
                          </li>
                          {/*  <li>• Recurrence: {newTemplate.recurrenceType}</li> */}
                          {selectedMoonPhase && selectedMoonPhase !== 'none' && (
                            <li>• Moon phase: {selectedMoonPhase}</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Scheduled Items Tab */}
            <TabsContent value="scheduled" className="space-y-4">
              <h3 className="text-lg font-semibold">Scheduled Content Items</h3>
              
              {itemsLoading ? (
                <div className="text-center py-8">Loading scheduled items...</div>
              ) : scheduledItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No scheduled content items. 
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
                        status: 'Scheduled'
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
