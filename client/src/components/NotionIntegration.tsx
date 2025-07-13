import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Database, 
  CheckCircle, 
  Circle, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Flag,
  BookOpen,
  Users,
  Target,
  FileText,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Loader2
} from "lucide-react";

interface NotionTask {
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

interface NotionDatabase {
  id: string;
  title: string;
}

interface NotionSetupStatus {
  isSetup: boolean;
  databases: NotionDatabase[];
}

export default function NotionIntegration() {
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<NotionTask | null>(null);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const queryClient = useQueryClient();

  // Setup status check
  const { data: setupStatus, isLoading: isSetupLoading } = useQuery<NotionSetupStatus>({
    queryKey: ["/api/notion/setup"],
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get databases
  const { data: databases = [], isLoading: isDatabasesLoading } = useQuery<NotionDatabase[]>({
    queryKey: ["/api/notion/databases"],
    enabled: setupStatus?.isSetup === true,
    retry: 1,
  });

  // Get tasks
  const { data: tasks = [], isLoading: isTasksLoading } = useQuery<NotionTask[]>({
    queryKey: ["/api/notion/tasks"],
    enabled: setupStatus?.isSetup === true,
    retry: 1,
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (taskData: {
      title: string;
      description?: string;
      section?: string;
      priority?: string;
      dueDate?: Date;
    }) => apiRequest("/api/notion/tasks", "POST", taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notion/tasks"] });
      setIsCreateTaskOpen(false);
      toast({
        title: "Task created",
        description: "Your task has been added to Notion successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create task in Notion",
        variant: "destructive",
      });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ pageId, updates }: { pageId: string; updates: Partial<NotionTask> }) =>
      apiRequest(`/api/notion/tasks/${pageId}`, "PATCH", updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notion/tasks"] });
      setIsEditTaskOpen(false);
      setSelectedTask(null);
      toast({
        title: "Task updated",
        description: "Your task has been updated in Notion successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update task in Notion",
        variant: "destructive",
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (pageId: string) => apiRequest(`/api/notion/tasks/${pageId}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notion/tasks"] });
      toast({
        title: "Task deleted",
        description: "Your task has been removed from Notion successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete task from Notion",
        variant: "destructive",
      });
    },
  });

  // Toggle task completion
  const toggleTaskCompletion = (task: NotionTask) => {
    updateTaskMutation.mutate({
      pageId: task.notionId,
      updates: { isCompleted: !task.isCompleted },
    });
  };

  // Handle task creation
  const handleCreateTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const taskData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      section: formData.get("section") as string,
      priority: formData.get("priority") as string,
      dueDate: formData.get("dueDate") ? new Date(formData.get("dueDate") as string) : undefined,
    };

    createTaskMutation.mutate(taskData);
  };

  // Handle task editing
  const handleEditTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTask) return;

    const formData = new FormData(event.currentTarget);
    
    const updates = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      section: formData.get("section") as string,
      priority: formData.get("priority") as string,
      dueDate: formData.get("dueDate") ? new Date(formData.get("dueDate") as string) : undefined,
    };

    updateTaskMutation.mutate({
      pageId: selectedTask.notionId,
      updates,
    });
  };

  // Run setup if needed
  const runSetupMutation = useMutation({
    mutationFn: () => apiRequest("/api/notion/setup-run", "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notion/setup"] });
      toast({
        title: "Setup completed",
        description: "Notion databases have been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Setup failed",
        description: error.message || "Failed to set up Notion databases",
        variant: "destructive",
      });
    },
  });

  if (isSetupLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Notion Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Checking Notion setup...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!setupStatus?.isSetup) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Notion Integration Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="w-4 h-4" />
            <span>Notion databases need to be set up first.</span>
          </div>
          
          <p className="text-sm text-muted-foreground">
            To use the Notion integration, you need to run the setup script to create the required databases in your Notion workspace.
          </p>
          
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Setup Instructions:</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Make sure you have provided your Notion credentials</li>
              <li>Run the setup script: <code className="bg-background px-1 rounded">npm run setup-notion</code></li>
              <li>This will create the Belle Journal databases in your Notion workspace</li>
              <li>Refresh this page once setup is complete</li>
            </ol>
          </div>
          
          <Button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/notion/setup"] })}
            className="w-full"
          >
            Check Setup Status
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Notion Integration
            <Badge variant="outline" className="ml-auto">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Connected Databases</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {databases.map((db) => (
                  <div key={db.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm">{db.title}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Tasks</h4>
              <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateTask} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input id="title" name="title" required />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" name="description" />
                    </div>
                    <div>
                      <Label htmlFor="section">Section</Label>
                      <Select name="section">
                        <SelectTrigger>
                          <SelectValue placeholder="Select section" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Personal">Personal</SelectItem>
                          <SelectItem value="Work">Work</SelectItem>
                          <SelectItem value="Health">Health</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="Content">Content</SelectItem>
                          <SelectItem value="Learning">Learning</SelectItem>
                          <SelectItem value="Uncategorized">Uncategorized</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select name="priority">
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input id="dueDate" name="dueDate" type="date" />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsCreateTaskOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createTaskMutation.isPending}>
                        {createTaskMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create Task"
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tasks from Notion</CardTitle>
        </CardHeader>
        <CardContent>
          {isTasksLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading tasks...</span>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No tasks found in Notion</p>
              <p className="text-sm">Create your first task to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.notionId}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <button
                    onClick={() => toggleTaskCompletion(task)}
                    className="flex-shrink-0"
                    disabled={updateTaskMutation.isPending}
                  >
                    {task.isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-medium ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </h4>
                      {task.priority && (
                        <Badge
                          variant={task.priority === 'High' ? 'destructive' : 
                                 task.priority === 'Medium' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          <Flag className="w-3 h-3 mr-1" />
                          {task.priority}
                        </Badge>
                      )}
                      {task.section && (
                        <Badge variant="outline" className="text-xs">
                          {task.section}
                        </Badge>
                      )}
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {task.status && (
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {task.status}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedTask(task);
                        setIsEditTaskOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteTaskMutation.mutate(task.notionId)}
                      disabled={deleteTaskMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Task Dialog */}
      <Dialog open={isEditTaskOpen} onOpenChange={setIsEditTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <form onSubmit={handleEditTask} className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input 
                  id="edit-title" 
                  name="title" 
                  defaultValue={selectedTask.title}
                  required 
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea 
                  id="edit-description" 
                  name="description"
                  defaultValue={selectedTask.description}
                />
              </div>
              <div>
                <Label htmlFor="edit-section">Section</Label>
                <Select name="section" defaultValue={selectedTask.section}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Personal">Personal</SelectItem>
                    <SelectItem value="Work">Work</SelectItem>
                    <SelectItem value="Health">Health</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Content">Content</SelectItem>
                    <SelectItem value="Learning">Learning</SelectItem>
                    <SelectItem value="Uncategorized">Uncategorized</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-priority">Priority</Label>
                <Select name="priority" defaultValue={selectedTask.priority || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-dueDate">Due Date</Label>
                <Input 
                  id="edit-dueDate" 
                  name="dueDate" 
                  type="date"
                  defaultValue={selectedTask.dueDate 
                    ? new Date(selectedTask.dueDate).toISOString().split('T')[0]
                    : ""}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditTaskOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateTaskMutation.isPending}>
                  {updateTaskMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Task"
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}