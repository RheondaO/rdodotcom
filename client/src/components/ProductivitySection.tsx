import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { 
  CheckSquare, 
  Plus, 
  Clock, 
  Play, 
  Pause, 
  Square,
  Timer,
  Target,
  Calendar,
  AlertCircle,
  Flag,
  Zap,
  Trophy,
  BarChart3,
  Focus
} from "lucide-react";
import { format, addMinutes, differenceInMinutes, isToday, isYesterday, isTomorrow } from "date-fns";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import ProductivityTasks from "./ProductivityTasks";

interface ProductivitySectionProps {
  selectedDate: Date;
  isReadOnly?: boolean;
}

export default function ProductivitySection({ selectedDate, isReadOnly = false }: ProductivitySectionProps) {
  const getDateLabel = () => {
    if (isToday(selectedDate)) return "Today";
    if (isYesterday(selectedDate)) return "Yesterday";
    if (isTomorrow(selectedDate)) return "Tomorrow";
    return format(selectedDate, 'EEEE');
  };

  const dateString = format(selectedDate, 'yyyy-MM-dd');
  
  // Fetch real data from API
  const { data: todos = [] } = useQuery({
    queryKey: ['/api/todos', dateString],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/todos/${dateString}`);
      return response.json();
    },
  });

  const { data: timeBlocks = [] } = useQuery({
    queryKey: ['/api/time-blocks', dateString],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/time-blocks/${dateString}`);
      return response.json();
    },
  });

  // Mutations for data updates
  const todoMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/todos', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/todos', dateString] });
    }
  });

  const updateTodoMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await apiRequest('PATCH', `/api/todos/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/todos', dateString] });
    }
  });

  // Time block mutations
  const timeBlockMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/time-blocks', data);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate time blocks for the specific date
      queryClient.invalidateQueries({ queryKey: ['/api/time-blocks', dateString] });
      // Also invalidate any other time block queries that might be cached
      queryClient.invalidateQueries({ queryKey: ['/api/time-blocks'] });
      // Force refetch to ensure immediate update
      queryClient.refetchQueries({ queryKey: ['/api/time-blocks', dateString] });
    }
  });

  // State for UI
  const [showTodoDialog, setShowTodoDialog] = useState(false);
  const [showTimeBlockDialog, setShowTimeBlockDialog] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [activeTask, setActiveTask] = useState<string>("");

  // State for new todo form
  const [newTodo, setNewTodo] = useState({
    title: "",
    description: "",
    category: "Work",
    estimatedDuration: 60
  });

  // State for new time block form
  const [newTimeBlock, setNewTimeBlock] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    category: "Work"
  });

  // Categories for tasks - using proper case to match Notion's capitalization
  const categories = [
    { value: "Work", label: "Work", icon: "💼" },
    { value: "Personal", label: "Personal", icon: "🏠" },
    { value: "Health", label: "Health", icon: "💪" },
    { value: "Learning", label: "Learning", icon: "📚" },
    { value: "Creative", label: "Creative", icon: "🎨" }
  ];

  // Handle todo completion toggle with strikethrough styling
  const toggleTodoCompletion = (todoId: number) => {
    if (Array.isArray(todos)) {
      const todo = todos.find((t: any) => t.id === todoId);
      if (todo) {
        updateTodoMutation.mutate({
          id: todoId,
          isCompleted: !todo.isCompleted
        });
      }
    }
  };

  // Handle new todo creation
  const handleCreateTodo = () => {
    if (newTodo.title.trim()) {
      todoMutation.mutate({
        title: newTodo.title,
        description: newTodo.description,
        category: newTodo.category,
        estimatedDuration: newTodo.estimatedDuration,
        dueDate: dateString,
        isCompleted: false
      });
      setNewTodo({
        title: "",
        description: "",
        category: "Work",
        estimatedDuration: 60
      });
      setShowTodoDialog(false);
    }
  };

  // Handle new time block creation
  const handleCreateTimeBlock = () => {
    if (newTimeBlock.title.trim() && newTimeBlock.startTime && newTimeBlock.endTime) {
      // Validate that end time is after start time
      const start = new Date(`2000-01-01T${newTimeBlock.startTime}`);
      const end = new Date(`2000-01-01T${newTimeBlock.endTime}`);
      
      if (end <= start) {
        alert('End time must be after start time');
        return;
      }

      timeBlockMutation.mutate({
        title: newTimeBlock.title,
        description: newTimeBlock.description,
        startTime: newTimeBlock.startTime,
        endTime: newTimeBlock.endTime,
        category: newTimeBlock.category,
        date: dateString
      });
      
      setNewTimeBlock({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        category: "Work"
      });
      setShowTimeBlockDialog(false);
    }
  };

  // Generate suggested time slots based on existing blocks (EST/EDT timezone)
  const getSuggestedTimeSlots = () => {
    if (!Array.isArray(timeBlocks)) return [];
    
    const slots = [];
    // Working hours in EST/EDT (9 AM - 5 PM)
    const workingHours = [
      '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
    ];
    
    // Filter available slots that don't conflict with existing blocks
    for (const hour of workingHours) {
      const endHour = String(parseInt(hour.split(':')[0]) + 1).padStart(2, '0') + ':00';
      const conflicts = timeBlocks.some((block: any) => {
        const blockStart = block.startTime;
        const blockEnd = block.endTime;
        // Compare times as strings in HH:MM format (all should be in EST/EDT)
        return (hour >= blockStart && hour < blockEnd) || (endHour > blockStart && endHour <= blockEnd);
      });
      
      if (!conflicts) {
        slots.push({ start: hour, end: endHour });
      }
    }
    
    return slots.slice(0, 3); // Show top 3 suggestions
  };

  // Timer functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && startTime) {
      interval = setInterval(() => {
        setElapsedTime(differenceInMinutes(new Date(), startTime));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, startTime]);

  const startTimer = () => {
    setStartTime(new Date());
    setIsTimerRunning(true);
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
    setStartTime(null);
    setElapsedTime(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-heading font-bold bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
            {getDateLabel()}'s Productivity & Tasks
          </h3>
          <p className="text-muted-foreground dark:text-gray-300 mt-1">
            Stay focused and productive with organized task management
          </p>
        </div>
      </div>

      {/* Quick Timer */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Timer className="h-5 w-5 text-blue-600" />
            <span>Focus Timer</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Input
              placeholder="What are you working on?"
              value={activeTask}
              onChange={(e) => !isReadOnly && setActiveTask(e.target.value)}
              disabled={isReadOnly}
              className={`flex-1 ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            <div className="text-2xl font-mono font-bold text-blue-600">
              {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
            </div>
            <Button
              onClick={!isReadOnly ? (isTimerRunning ? stopTimer : startTimer) : undefined}
              variant={isTimerRunning ? "destructive" : "default"}
              disabled={isReadOnly}
              className={`rounded-xl ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notion Tasks Integration */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-t-lg">
          <CardTitle className="flex items-center space-x-2">
            <CheckSquare className="h-5 w-5 text-pink-600" />
            <span>{getDateLabel()}'s Tasks</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ProductivityTasks selectedDate={selectedDate} isReadOnly={isReadOnly} />
        </CardContent>
      </Card>



      {/* Time Blocks Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>{getDateLabel()}'s Schedule</span>
            </CardTitle>
            <Dialog open={showTimeBlockDialog} onOpenChange={setShowTimeBlockDialog}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  disabled={isReadOnly}
                  className={`rounded-xl ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Time Block
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <span>Create New Time Block</span>
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  {/* Quick Date Selection */}
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm font-medium">Schedule for:</Label>
                    <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
                      {getDateLabel()} ({format(selectedDate, 'MMM dd')})
                    </Badge>
                  </div>

                  {/* Suggested Time Slots */}
                  {getSuggestedTimeSlots().length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Suggested Available Slots:</Label>
                      <div className="flex flex-wrap gap-2">
                        {getSuggestedTimeSlots().map((slot, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setNewTimeBlock(prev => ({
                                ...prev,
                                startTime: slot.start,
                                endTime: slot.end
                              }));
                            }}
                            className="text-xs h-8 px-3"
                          >
                            {slot.start} - {slot.end}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="timeblock-title">Title *</Label>
                    <Input
                      id="timeblock-title"
                      placeholder="e.g., Team Meeting, Deep Work, Client Call"
                      value={newTimeBlock.title}
                      onChange={(e) => setNewTimeBlock(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="timeblock-description">Description</Label>
                    <Textarea
                      id="timeblock-description"
                      placeholder="Optional details about this time block..."
                      value={newTimeBlock.description}
                      onChange={(e) => setNewTimeBlock(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                    />
                  </div>

                  {/* Time Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="timeblock-start">Start Time *</Label>
                      <Input
                        id="timeblock-start"
                        type="time"
                        value={newTimeBlock.startTime}
                        onChange={(e) => setNewTimeBlock(prev => ({ ...prev, startTime: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timeblock-end">End Time *</Label>
                      <Input
                        id="timeblock-end"
                        type="time"
                        value={newTimeBlock.endTime}
                        onChange={(e) => setNewTimeBlock(prev => ({ ...prev, endTime: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Duration Display */}
                  {newTimeBlock.startTime && newTimeBlock.endTime && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-[#17111d] p-3 rounded-lg">
                      <Clock className="inline h-4 w-4 mr-1" />
                      Duration: {(() => {
                        const start = new Date(`2000-01-01T${newTimeBlock.startTime}`);
                        const end = new Date(`2000-01-01T${newTimeBlock.endTime}`);
                        const diffMinutes = Math.abs(end.getTime() - start.getTime()) / (1000 * 60);
                        const hours = Math.floor(diffMinutes / 60);
                        const minutes = diffMinutes % 60;
                        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
                      })()}
                    </div>
                  )}

                  {/* Category Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="timeblock-category">Category</Label>
                    <Select 
                      value={newTimeBlock.category} 
                      onValueChange={(value) => setNewTimeBlock(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            <span className="flex items-center">
                              <span className="mr-2">{category.icon}</span>
                              {category.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowTimeBlockDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateTimeBlock}
                      disabled={!newTimeBlock.title.trim() || !newTimeBlock.startTime || !newTimeBlock.endTime || timeBlockMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {timeBlockMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Time Block
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-6">
          {Array.isArray(timeBlocks) && timeBlocks.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-1 font-serif">No scheduled blocks for {getDateLabel().toLowerCase()}</p>
              <p className="text-sm mb-4 font-serif">
                {isReadOnly ? "No time blocks are scheduled for this date" : "Plan your day with time blocks!"}
              </p>
              {!isReadOnly && (
                <Button onClick={() => setShowTimeBlockDialog(true)} className="bg-blue-500 hover:bg-blue-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Time Block
                </Button>
              )}
            </div>
          ) : (
            Array.isArray(timeBlocks) && 
            // Sort time blocks chronologically by start time
            [...timeBlocks].sort((a: any, b: any) => {
              return a.startTime.localeCompare(b.startTime);
            }).map((block: any) => {
              const categoryInfo = categories.find(cat => cat.value.toLowerCase() === block.category.toLowerCase()) || categories[0];
              const startTime = new Date(`2000-01-01T${block.startTime}`);
              const endTime = new Date(`2000-01-01T${block.endTime}`);
              const durationMinutes = Math.abs(endTime.getTime() - startTime.getTime()) / (1000 * 60);
              const hours = Math.floor(durationMinutes / 60);
              const minutes = durationMinutes % 60;
              const duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
              
              // Determine status based on current time and date
              const now = new Date();
              const isCurrentDate = format(selectedDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
              const currentTime = format(now, 'HH:mm');
              let status = 'upcoming';
              
              if (isCurrentDate) {
                if (currentTime >= block.startTime && currentTime <= block.endTime) {
                  status = 'active';
                } else if (currentTime > block.endTime) {
                  status = 'completed';
                }
              } else if (selectedDate < now) {
                status = 'completed';
              }

              const getStatusColor = (status: string) => {
                switch (status) {
                  case 'active': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
                  case 'completed': return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
                  default: return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
                }
              };

              return (
                <div 
                  key={block.notionId || block.id} 
                  className={`group relative p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                    status === 'active' 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-green-200 dark:border-green-800' 
                      : 'bg-white dark:bg-[#17111d] border-gray-100 dark:border-gray-700'
                  }`}
                >
                  {/* Status indicator */}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                    {status === 'active' ? '🟢 Active' : status === 'completed' ? '✅ Done' : '⏳ Upcoming'}
                  </div>

                  <div className="flex items-start space-x-4 pr-20">
                    {/* Time and Duration */}
                    <div className="flex-shrink-0 text-center min-w-[80px]">
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {format(new Date(`2000-01-01T${block.startTime}`), 'h:mm')}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {format(new Date(`2000-01-01T${block.startTime}`), 'a')}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {duration}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">{categoryInfo.icon}</span>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-base truncate">
                          {block.title}
                        </h4>
                      </div>
                      
                      {block.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                          {block.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {block.startTime} - {block.endTime}
                        </div>
                        <Badge variant="outline" className="text-xs px-2 py-0.5">
                          {categoryInfo.label}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions (visible on hover) */}
                  {!isReadOnly && (
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="flex space-x-1">
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600">
                          <Focus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>


    </div>
  );
}