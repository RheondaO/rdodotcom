import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, isToday, isYesterday, isTomorrow, parseISO } from "date-fns";
import { apiRequest } from "../lib/queryClient";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { toast } from "../hooks/use-toast";
import {
  Plus,
  Clock,
  Calendar,
  CheckCircle2,
  Circle,
  AlertCircle,
  Filter,
  Edit2,
  Trash2
} from "lucide-react";

interface ProductivityTask {
  notionId: string;
  title: string;
  description: string;
  category: string;
  section: string;
  isCompleted: boolean;
  dueDate: Date | null;
  createdDate: Date | null;
  completedAt: Date | null;
  priority: string | null;
  status: string | null;
  estimatedDuration: number | null;
}

interface ProductivityTasksProps {
  selectedDate: Date;
  isReadOnly?: boolean;
}

export default function ProductivityTasks({ selectedDate, isReadOnly = false }: ProductivityTasksProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<ProductivityTask | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: "Personal",
    priority: "Medium",
    estimatedDuration: 30,
    dueDate: selectedDate.toISOString().split('T')[0]
  });

  const queryClient = useQueryClient();

  // Fetch tasks filtered by the selected date
  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['/api/notion/tasks', selectedDate.toISOString().split('T')[0]],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/notion/tasks?date=${selectedDate.toISOString().split('T')[0]}&view=day`);
        const data = await response.json();
        console.log('Fetched tasks data:', data);
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Error fetching tasks:', error);
        return [];
      }
    },
    retry: 3,
    retryDelay: 1000,
  });

  // Create task mutation
  const createTask = useMutation({
    mutationFn: (task: typeof newTask) => 
      apiRequest('POST', '/api/notion/tasks', {
        ...task,
        dueDate: new Date(task.dueDate)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notion/tasks'] });
      setIsAddingTask(false);
      setNewTask({
        title: "",
        description: "",
        category: "Personal",
        priority: "Medium",
        estimatedDuration: 30,
        dueDate: selectedDate.toISOString().split('T')[0]
      });
      toast({ title: "Task created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create task", variant: "destructive" });
    }
  });

  // Update task mutation
  const updateTask = useMutation({
    mutationFn: ({ taskId, updates }: { taskId: string; updates: Partial<ProductivityTask> }) =>
      apiRequest('PATCH', `/api/notion/tasks/${taskId}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notion/tasks'] });
      setEditingTask(null);
      toast({ title: "Task updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update task", variant: "destructive" });
    }
  });

  // Delete task mutation
  const deleteTask = useMutation({
    mutationFn: (taskId: string) =>
      apiRequest('DELETE', `/api/notion/tasks/${taskId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notion/tasks'] });
      toast({ title: "Task deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete task", variant: "destructive" });
    }
  });

  const toggleTaskCompletion = (task: ProductivityTask) => {
    updateTask.mutate({
      taskId: task.notionId,
      updates: {
        isCompleted: !task.isCompleted,
        status: !task.isCompleted ? "Done" : "To Do"
      }
    });
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d, yyyy");
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800 dark:[background-color:var(--custom-dark)] dark:text-red-200";
      case "Medium": return "bg-yellow-100 text-yellow-800 dark:[background-color:var(--custom-dark)] dark:text-yellow-200";
      case "Low": return "bg-green-100 text-green-800 dark:[background-color:var(--custom-dark)] dark:text-green-200";
      default: return "bg-gray-100 text-gray-800 dark:[background-color:var(--custom-dark)] dark:text-gray-200";
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "Done": return "bg-green-100 text-green-800 dark:[background-color:var(--custom-dark)] dark:text-green-200";
      case "In Progress": return "bg-blue-100 text-blue-800 dark:[background-color:var(--custom-dark)] dark:text-blue-200";
      case "Blocked": return "bg-red-100 text-red-800 dark:[background-color:var(--custom-dark)] dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:[background-color:var(--custom-dark)] dark:text-gray-200";
    }
  };

  const filteredTasks = Array.isArray(tasks) ? tasks.filter(task => {
    if (filterStatus === "all") return true;
    if (filterStatus === "completed") return task.isCompleted;
    if (filterStatus === "pending") return !task.isCompleted;
    return task.status === filterStatus;
  }) : [];

  const totalEstimatedTime = filteredTasks.reduce((sum, task) => sum + (task.estimatedDuration || 0), 0);
  const completedTasks = filteredTasks.filter(task => task.isCompleted);
  const completedTime = completedTasks.reduce((sum, task) => sum + (task.estimatedDuration || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h3 className="text-lg font-semibold mb-2">Connection Failed</h3>
          <p className="text-muted-foreground mb-4">
            Unable to connect to Notion. Please check your integration settings.
          </p>
          <p className="text-sm text-muted-foreground">
            Verify NOTION_INTEGRATION_SECRET is configured in production environment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tasks for {getDateLabel(selectedDate)}</h2>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              {completedTasks.length} / {filteredTasks.length} completed
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {completedTime} / {totalEstimatedTime} minutes
            </span>
          </div>
        </div>
        {!isReadOnly && (
          <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Enter task title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Enter task description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select value={newTask.category} onValueChange={(value) => setNewTask({ ...newTask, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Personal">Personal</SelectItem>
                        <SelectItem value="Work">Work</SelectItem>
                        <SelectItem value="Health">Health</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Content">Content</SelectItem>
                        <SelectItem value="Learning">Learning</SelectItem>
                        <SelectItem value="Projects">Projects</SelectItem>
                        <SelectItem value="Habits">Habits</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Estimated Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newTask.estimatedDuration}
                      onChange={(e) => setNewTask({ ...newTask, estimatedDuration: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => createTask.mutate(newTask)} disabled={!newTask.title || createTask.isPending}>
                    {createTask.isPending ? "Creating..." : "Create Task"}
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddingTask(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <Label>Filter:</Label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="To Do">To Do</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Done">Done</SelectItem>
              <SelectItem value="Blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No tasks for {getDateLabel(selectedDate)}</h3>
              <p className="text-muted-foreground mb-4">
                {isReadOnly ? "No tasks are scheduled for this date" : "Start by adding your first task"}
              </p>
              {!isReadOnly && (
                <Button onClick={() => setIsAddingTask(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card key={task.notionId} className={`transition-all ${task.isCompleted ? 'opacity-75' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={task.isCompleted}
                    onCheckedChange={() => !isReadOnly && toggleTaskCompletion(task)}
                    disabled={isReadOnly}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`font-semibold ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </h3>
                      <Badge variant="secondary" className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Badge variant="outline">{task.category}</Badge>
                      </span>
                      {task.estimatedDuration && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {task.estimatedDuration} min
                        </span>
                      )}
                      {task.dueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(parseISO(task.dueDate.toString()), "MMM d")}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {!isReadOnly && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingTask(task)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTask.mutate(task.notionId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}