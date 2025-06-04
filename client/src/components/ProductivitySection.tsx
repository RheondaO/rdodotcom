import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ProductivitySectionProps {
  selectedDate: Date;
}

export default function ProductivitySection({ selectedDate }: ProductivitySectionProps) {
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
    queryFn: () => apiRequest(`/api/todos/${dateString}`, 'GET'),
  });

  const { data: timeBlocks = [] } = useQuery({
    queryKey: ['/api/time-blocks', dateString],
    queryFn: () => apiRequest(`/api/time-blocks/${dateString}`, 'GET'),
  });

  // Mutations for data updates
  const todoMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/todos', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/todos', dateString] });
    }
  });

  const updateTodoMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest(`/api/todos/${id}`, 'PATCH', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/todos', dateString] });
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
    category: "work",
    estimatedDuration: 60
  });

  // Categories for tasks
  const categories = [
    { value: "work", label: "Work", icon: "💼" },
    { value: "personal", label: "Personal", icon: "🏠" },
    { value: "health", label: "Health", icon: "💪" },
    { value: "learning", label: "Learning", icon: "📚" },
    { value: "creative", label: "Creative", icon: "🎨" }
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
        category: "work",
        estimatedDuration: 60
      });
      setShowTodoDialog(false);
    }
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
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">
          {getDateLabel()}'s Tasks & Schedule
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Stay focused and productive with organized task management
        </p>
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
              onChange={(e) => setActiveTask(e.target.value)}
              className="flex-1"
            />
            <div className="text-2xl font-mono font-bold text-blue-600">
              {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
            </div>
            <Button
              onClick={isTimerRunning ? stopTimer : startTimer}
              variant={isTimerRunning ? "destructive" : "default"}
              className="rounded-xl"
            >
              {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <CheckSquare className="h-5 w-5 text-pink-600" />
              <span>{getDateLabel()}'s Tasks</span>
            </CardTitle>
            <Dialog open={showTodoDialog} onOpenChange={setShowTodoDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="rounded-xl">
                  <Plus className="mr-2 h-4 w-4" />
                  Task
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white dark:bg-gray-900 border-0 rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-gray-900 dark:text-white">Create New Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="todoTitle">Task Title</Label>
                    <Input
                      id="todoTitle"
                      value={newTodo.title}
                      onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                      placeholder="What needs to be done?"
                      className="dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="todoDescription">Description</Label>
                    <Textarea
                      id="todoDescription"
                      value={newTodo.description}
                      onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                      placeholder="Additional details..."
                      className="dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <Label>Category</Label>
                    <Select value={newTodo.category} onValueChange={(value) => setNewTodo({ ...newTodo, category: value })}>
                      <SelectTrigger className="dark:bg-gray-800 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(c => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.icon} {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="estimatedDuration">Estimated Duration (minutes)</Label>
                    <Input
                      id="estimatedDuration"
                      type="number"
                      value={newTodo.estimatedDuration}
                      onChange={(e) => setNewTodo({ ...newTodo, estimatedDuration: parseInt(e.target.value) })}
                      className="dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  
                  <Button onClick={handleCreateTodo} className="w-full rounded-xl">
                    Create Task
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-6">
          {Array.isArray(todos) && todos.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No tasks for {getDateLabel().toLowerCase()}</p>
              <p className="text-sm">Add a task to get started!</p>
            </div>
          ) : (
            Array.isArray(todos) && todos.map((todo: any) => (
              <div key={todo.id} className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => toggleTodoCompletion(todo.id)}
                  className={`p-1 rounded-full ${todo.isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                >
                  <CheckSquare className="h-4 w-4" />
                </button>
                
                <div className="flex-1">
                  <h4 className={`font-medium ${todo.isCompleted ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                    {todo.title}
                  </h4>
                  {todo.description && (
                    <p className={`text-sm ${todo.isCompleted ? 'line-through text-gray-400' : 'text-gray-600 dark:text-gray-400'}`}>
                      {todo.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {categories.find(c => c.value === todo.category)?.icon} {todo.category}
                  </Badge>
                  {todo.estimatedDuration && (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {todo.estimatedDuration}m
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
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
            <Button variant="outline" className="rounded-xl">
              <Plus className="mr-2 h-4 w-4" />
              Time Block
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-6">
          {Array.isArray(timeBlocks) && timeBlocks.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No scheduled blocks for {getDateLabel().toLowerCase()}</p>
              <p className="text-sm">Plan your day with time blocks!</p>
            </div>
          ) : (
            Array.isArray(timeBlocks) && timeBlocks.map((block: any) => (
              <div key={block.id} className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="flex-shrink-0 text-center">
                  <div className="text-sm font-medium text-blue-600">{block.startTime}</div>
                  <div className="text-xs text-gray-500">{block.endTime}</div>
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{block.title}</h4>
                  {block.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{block.description}</p>
                  )}
                </div>
                
                <Badge variant="outline" className="text-xs">
                  {block.category}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}