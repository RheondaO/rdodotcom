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
import { format, addMinutes, differenceInMinutes } from "date-fns";

interface Todo {
  id: number;
  title: string;
  description: string;
  category: string;
  dueDate: string | null;
  isCompleted: boolean;
  estimatedDuration: number;
  actualDuration: number | null;
  createdAt: string;
}

interface TimeBlock {
  id: number;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  category: string;
  todoId: number | null;
  createdAt: string;
}

interface FocusSession {
  id: number;
  date: string;
  startTime: Date;
  endTime: Date | null;
  plannedDuration: number;
  actualDuration: number | null;
  taskDescription: string;
  wasSuccessful: boolean | null;
  notes: string;
  isActive: boolean;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  type: string;
  targetValue: number;
  currentValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isCompleted: boolean;
}

interface ProductivitySectionProps {
  selectedDate: Date;
}

export default function ProductivitySection({ selectedDate }: ProductivitySectionProps) {
  // Time tracking state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [activeTask, setActiveTask] = useState<string>("");
  const [timeEntries, setTimeEntries] = useState<Array<{
    id: number;
    taskDescription: string;
    startTime: Date;
    endTime: Date;
    duration: number; // in minutes
    date: string;
    category: string;
  }>>([]);

  const [todos, setTodos] = useState<Todo[]>([
    {
      id: 1,
      title: "Complete project proposal",
      description: "Finalize the Q3 project proposal document",
      category: "work",
      dueDate: "2025-06-05",
      isCompleted: false,
      estimatedDuration: 120,
      actualDuration: null,
      createdAt: "2025-06-03"
    },
    {
      id: 2,
      title: "Review team feedback",
      description: "Go through the feedback from last week's presentation",
      category: "work",
      dueDate: "2025-06-04",
      isCompleted: true,
      estimatedDuration: 45,
      actualDuration: 50,
      createdAt: "2025-06-02"
    },
    {
      id: 3,
      title: "Plan weekend trip",
      description: "Research and book accommodation for the weekend getaway",
      category: "personal",
      dueDate: "2025-06-10",
      isCompleted: false,
      estimatedDuration: 60,
      actualDuration: null,
      createdAt: "2025-06-03"
    }
  ]);

  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([
    {
      id: 1,
      title: "Morning Deep Work",
      description: "Focus time for important tasks",
      date: "2025-06-03",
      startTime: "09:00",
      endTime: "11:00",
      category: "work",
      todoId: 1,
      createdAt: "2025-06-03"
    },
    {
      id: 2,
      title: "Team Meeting",
      description: "Weekly sync with the development team",
      date: "2025-06-03",
      startTime: "14:00",
      endTime: "15:00",
      category: "meeting",
      todoId: null,
      createdAt: "2025-06-03"
    }
  ]);

  const [focusSession, setFocusSession] = useState<FocusSession | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: 1,
      title: "25 Pomodoro Sessions",
      description: "Complete 25 focused work sessions this week",
      type: "weekly",
      targetValue: 25,
      currentValue: 18,
      startDate: "2025-06-01",
      endDate: "2025-06-07",
      isActive: true,
      isCompleted: false
    },
    {
      id: 2,
      title: "No Phone During Work",
      description: "Avoid phone usage during designated work hours",
      type: "daily",
      targetValue: 8,
      currentValue: 6,
      startDate: "2025-06-03",
      endDate: "2025-06-03",
      isActive: true,
      isCompleted: false
    }
  ]);

  const [showTodoDialog, setShowTodoDialog] = useState(false);
  const [showTimeBlockDialog, setShowTimeBlockDialog] = useState(false);
  const [showChallengeDialog, setShowChallengeDialog] = useState(false);

  const [newTodo, setNewTodo] = useState({
    title: "",
    description: "",
    priority: "medium",
    category: "work",
    dueDate: "",
    estimatedDuration: 60
  });

  const [newTimeBlock, setNewTimeBlock] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    category: "work",
    todoId: null as number | null
  });

  const [newChallenge, setNewChallenge] = useState({
    title: "",
    description: "",
    type: "weekly",
    targetValue: 10,
    endDate: ""
  });

  const priorities = [
    { value: "low", label: "Low", color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300" },
    { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
    { value: "high", label: "High", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
    { value: "urgent", label: "Urgent", color: "bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-200" }
  ];

  const categories = [
    { value: "work", label: "Work", icon: "💼" },
    { value: "personal", label: "Personal", icon: "🏠" },
    { value: "health", label: "Health", icon: "💪" },
    { value: "learning", label: "Learning", icon: "📚" },
    { value: "meeting", label: "Meeting", icon: "👥" }
  ];

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, startTime]);

  // Timer functions
  const startTimer = (taskDescription: string = "", category: string = "work") => {
    setStartTime(new Date());
    setIsTimerRunning(true);
    setActiveTask(taskDescription);
    setElapsedTime(0);
  };

  const stopTimer = () => {
    if (startTime && isTimerRunning) {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 60000); // minutes
      
      const newEntry = {
        id: timeEntries.length + 1,
        taskDescription: activeTask,
        startTime,
        endTime,
        duration,
        date: format(selectedDate, 'yyyy-MM-dd'),
        category: 'work'
      };
      
      setTimeEntries([...timeEntries, newEntry]);
    }
    
    setIsTimerRunning(false);
    setStartTime(null);
    setElapsedTime(0);
    setActiveTask("");
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const todaysTodos = todos.filter(todo => !todo.isCompleted);
  const completedTodos = todos.filter(todo => todo.isCompleted);
  const todaysTimeBlocks = timeBlocks.filter(block => block.date === format(selectedDate, 'yyyy-MM-dd'));
  const activeChallenges = challenges.filter(challenge => challenge.isActive);

  const startFocusSession = (duration: number, task: string) => {
    const session: FocusSession = {
      id: Date.now(),
      date: format(selectedDate, 'yyyy-MM-dd'),
      startTime: new Date(),
      endTime: null,
      plannedDuration: duration,
      actualDuration: null,
      taskDescription: task,
      wasSuccessful: null,
      notes: "",
      isActive: true
    };
    setFocusSession(session);
    startTimer(task, "focus");
  };

  const endFocusSession = (successful: boolean, notes: string = "") => {
    if (!focusSession) return;
    
    const endTime = new Date();
    const actualDuration = differenceInMinutes(endTime, focusSession.startTime);
    
    setFocusSession({
      ...focusSession,
      endTime,
      actualDuration,
      wasSuccessful: successful,
      notes,
      isActive: false
    });
    stopTimer();

    // Update challenge progress
    if (successful) {
      setChallenges(challenges.map(challenge => {
        if (challenge.type === "weekly" && challenge.isActive) {
          const newValue = challenge.currentValue + 1;
          return {
            ...challenge,
            currentValue: newValue,
            isCompleted: newValue >= challenge.targetValue
          };
        }
        return challenge;
      }));
    }
  };

  const createTodo = () => {
    if (!newTodo.title) return;
    
    const todo: Todo = {
      id: Date.now(),
      ...newTodo,
      isCompleted: false,
      actualDuration: null,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    };
    
    setTodos([...todos, todo]);
    setNewTodo({
      title: "",
      description: "",
      priority: "medium",
      category: "work",
      dueDate: "",
      estimatedDuration: 60
    });
    setShowTodoDialog(false);
  };

  const createTimeBlock = () => {
    if (!newTimeBlock.title || !newTimeBlock.startTime || !newTimeBlock.endTime) return;
    
    const timeBlock: TimeBlock = {
      id: Date.now(),
      ...newTimeBlock,
      date: format(selectedDate, 'yyyy-MM-dd'),
      createdAt: format(new Date(), 'yyyy-MM-dd')
    };
    
    setTimeBlocks([...timeBlocks, timeBlock]);
    setNewTimeBlock({
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      category: "work",
      todoId: null
    });
    setShowTimeBlockDialog(false);
  };

  const toggleTodo = (todoId: number) => {
    setTodos(todos.map(todo => 
      todo.id === todoId ? { ...todo, isCompleted: !todo.isCompleted } : todo
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-heading font-bold bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
            Productivity & Focus
          </h3>
          <p className="text-muted-foreground dark:text-gray-300 mt-1">
            Manage tasks, time blocks, and focus sessions
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
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
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Priority</Label>
                    <Select value={newTodo.priority} onValueChange={(value) => setNewTodo({ ...newTodo, priority: value })}>
                      <SelectTrigger className="dark:bg-gray-800 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map(p => (
                          <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Due Date</Label>
                    <Input
                      type="date"
                      value={newTodo.dueDate}
                      onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
                      className="dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <Label>Estimated Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={newTodo.estimatedDuration}
                      onChange={(e) => setNewTodo({ ...newTodo, estimatedDuration: Number(e.target.value) })}
                      className="dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>
                
                <Button onClick={createTodo} className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white">
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showTimeBlockDialog} onOpenChange={setShowTimeBlockDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-xl">
                <Clock className="mr-2 h-4 w-4" />
                Time Block
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-gray-900 border-0 rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-white">Create Time Block</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={newTimeBlock.title}
                    onChange={(e) => setNewTimeBlock({ ...newTimeBlock, title: e.target.value })}
                    placeholder="e.g., Deep Work Session"
                    className="dark:bg-gray-800 dark:text-white"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={newTimeBlock.startTime}
                      onChange={(e) => setNewTimeBlock({ ...newTimeBlock, startTime: e.target.value })}
                      className="dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={newTimeBlock.endTime}
                      onChange={(e) => setNewTimeBlock({ ...newTimeBlock, endTime: e.target.value })}
                      className="dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>
                
                <Button onClick={createTimeBlock} className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white">
                  Create Time Block
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Focus Session */}
      {focusSession && focusSession.isActive && (
        <Card className="bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg border-0 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-lg font-semibold mb-1">Focus Session Active</h4>
                <p className="text-pink-100 mb-2">{focusSession.taskDescription}</p>
                <div className="text-center">
                  <div className="text-4xl font-mono font-bold text-white mb-2">
                    {formatTime(elapsedTime)}
                  </div>
                  <p className="text-pink-200 text-sm">
                    Target: {focusSession.plannedDuration} minutes | 
                    Started: {format(focusSession.startTime, 'HH:mm')}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-2 ml-4">
                <Button
                  onClick={() => endFocusSession(true)}
                  className="bg-white/20 hover:bg-white/30 text-white"
                >
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Complete
                </Button>
                <Button
                  onClick={() => endFocusSession(false)}
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  <Square className="mr-2 h-4 w-4" />
                  End Session
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      {(!focusSession || !focusSession.isActive) && (
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <Focus className="h-5 w-5 text-pink-600 dark:text-pink-400" />
              <span>Start Focus Session</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => startFocusSession(25, "Pomodoro Session")}
                className="h-16 bg-gradient-to-r from-red-400 to-pink-400 hover:from-red-500 hover:to-pink-500 text-white rounded-xl"
              >
                <div className="text-center">
                  <Timer className="h-6 w-6 mx-auto mb-1" />
                  <div className="text-sm font-medium">25 min Pomodoro</div>
                </div>
              </Button>
              
              <Button
                onClick={() => startFocusSession(50, "Deep Work Session")}
                className="h-16 bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl"
              >
                <div className="text-center">
                  <Zap className="h-6 w-6 mx-auto mb-1" />
                  <div className="text-sm font-medium">50 min Deep Work</div>
                </div>
              </Button>
              
              <Button
                onClick={() => startFocusSession(90, "Flow State Session")}
                className="h-16 bg-gradient-to-r from-purple-400 to-indigo-400 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl"
              >
                <div className="text-center">
                  <Target className="h-6 w-6 mx-auto mb-1" />
                  <div className="text-sm font-medium">90 min Flow</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>Active Challenges</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeChallenges.map(challenge => (
                <div key={challenge.id} className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{challenge.title}</h4>
                    <Badge className={`${challenge.type === 'daily' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'} border-0`}>
                      {challenge.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{challenge.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {challenge.currentValue}/{challenge.targetValue}
                      </span>
                    </div>
                    <Progress value={(challenge.currentValue / challenge.targetValue) * 100} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <CheckSquare className="h-5 w-5 text-pink-600 dark:text-pink-400" />
              <span>Today's Tasks ({todaysTodos.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todaysTodos.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No pending tasks for today
              </div>
            ) : (
              <div className="space-y-3">
                {todaysTodos.map(todo => (
                  <TodoCard key={todo.id} todo={todo} onToggle={toggleTodo} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <Clock className="h-5 w-5 text-pink-600 dark:text-pink-400" />
              <span>Today's Schedule ({todaysTimeBlocks.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todaysTimeBlocks.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No time blocks scheduled
              </div>
            ) : (
              <div className="space-y-3">
                {todaysTimeBlocks.map(block => (
                  <TimeBlockCard key={block.id} timeBlock={block} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Time Entries */}
        {timeEntries.length > 0 && (
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span>Today's Time Tracking</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {timeEntries.map((entry) => (
                  <div key={entry.id} className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {entry.taskDescription || "Unnamed task"}
                        </h4>
                        <p className="text-sm text-muted-foreground dark:text-gray-400 capitalize">
                          {entry.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600 dark:text-green-400">
                          {entry.duration}m
                        </div>
                        <div className="text-xs text-muted-foreground dark:text-gray-400">
                          {format(entry.startTime, 'HH:mm')} - {format(entry.endTime, 'HH:mm')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <div className="font-semibold text-green-700 dark:text-green-400">
                    Total today: {timeEntries.reduce((sum, entry) => sum + entry.duration, 0)} minutes
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function TodoCard({ todo, onToggle }: { todo: Todo; onToggle: (id: number) => void }) {
  return (
    <div className="p-3 rounded-lg border-l-4 border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h5 className="font-medium text-gray-900 dark:text-white">{todo.title}</h5>
          </div>
          {todo.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{todo.description}</p>
          )}
          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <span>📁 {todo.category}</span>
            <span>⏱️ {todo.estimatedDuration}min</span>
            {todo.dueDate && <span>📅 {format(new Date(todo.dueDate), 'MMM d')}</span>}
          </div>
        </div>
        <Button
          onClick={() => onToggle(todo.id)}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
        >
          <CheckSquare className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function TimeBlockCard({ timeBlock }: { timeBlock: TimeBlock }) {
  return (
    <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-1">
        <h5 className="font-medium text-gray-900 dark:text-white">{timeBlock.title}</h5>
        <Badge variant="outline" className="text-xs">
          {timeBlock.startTime} - {timeBlock.endTime}
        </Badge>
      </div>
      {timeBlock.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{timeBlock.description}</p>
      )}
      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
        <span>📁 {timeBlock.category}</span>
        <span>⏱️ {
          Math.round(
            (new Date(`2000-01-01T${timeBlock.endTime}`).getTime() - 
             new Date(`2000-01-01T${timeBlock.startTime}`).getTime()) / (1000 * 60)
          )
        } minutes</span>
      </div>
    </div>
  );
}