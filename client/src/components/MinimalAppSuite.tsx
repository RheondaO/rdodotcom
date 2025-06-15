import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus,
  FolderOpen,
  CheckCircle2,
  Circle,
  Clock,
  Search,
  MoreHorizontal,
  Edit,
  Trash2
} from "lucide-react";
import { z } from "zod";

// Schemas for form validation
const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().min(1, "Description is required"),
});

const taskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().min(1, "Description is required"),
  projectId: z.number(),
  status: z.enum(["todo", "in_progress", "done"]).default("todo"),
});

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  createdAt: string;
}

interface Task {
  id: number;
  projectId: number;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  createdAt: string;
}

export default function MinimalAppSuite() {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const { toast } = useToast();

  // Queries
  const { data: projects = [], isLoading: projectsLoading, error: projectsError } = useQuery<Project[]>({
    queryKey: ['/api/app-projects'],
    queryFn: async () => {
      const response = await fetch('/api/app-projects');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    staleTime: 0,
    refetchOnMount: true
  });

  const { data: allTasks = [], isLoading: tasksLoading, error: tasksError } = useQuery<Task[]>({
    queryKey: ['/api/app-tasks'],
    queryFn: async () => {
      const response = await fetch('/api/app-tasks');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    staleTime: 0,
    refetchOnMount: true
  });



  // Filter tasks based on selected project
  const tasks = selectedProject 
    ? allTasks.filter((task: Task) => task.projectId === selectedProject)
    : allTasks;

  // Filter tasks by search and status
  const filteredTasks = tasks.filter((task: Task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Mutations
  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/app-projects', data);
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Project created successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/app-projects'] });
      queryClient.refetchQueries({ queryKey: ['/api/app-projects'] });
      setIsProjectDialogOpen(false);
      projectForm.reset();
      toast({ title: "Project created successfully" });
    },
    onError: (error: any) => {
      console.error('Project creation error:', error);
      toast({ 
        title: "Failed to create project", 
        description: error.message || "Please try again",
        variant: "destructive" 
      });
    }
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await apiRequest('PUT', `/api/app-projects/${id}`, data);
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Project updated successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/app-projects'] });
      queryClient.refetchQueries({ queryKey: ['/api/app-projects'] });
      setEditingProject(null);
      setIsProjectDialogOpen(false);
      toast({ title: "Project updated successfully" });
    },
    onError: (error: any) => {
      console.error('Project update error:', error);
      toast({ 
        title: "Failed to update project", 
        description: error.message || "Please try again",
        variant: "destructive" 
      });
    }
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/app-projects/${id}`);
      return response.json();
    },
    onSuccess: (data, variables) => {
      console.log('Project deleted successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/app-projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/app-tasks'] });
      queryClient.refetchQueries({ queryKey: ['/api/app-projects'] });
      queryClient.refetchQueries({ queryKey: ['/api/app-tasks'] });
      if (selectedProject === variables) setSelectedProject(null);
      toast({ title: "Project deleted successfully" });
    },
    onError: (error: any) => {
      console.error('Project delete error:', error);
      toast({ 
        title: "Failed to delete project", 
        description: error.message || "Please try again",
        variant: "destructive" 
      });
    }
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/app-tasks', data);
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Task created successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/app-tasks'] });
      queryClient.refetchQueries({ queryKey: ['/api/app-tasks'] });
      setIsTaskDialogOpen(false);
      taskForm.reset();
      toast({ title: "Task created successfully" });
    },
    onError: (error: any) => {
      console.error('Task creation error:', error);
      toast({ 
        title: "Failed to create task", 
        description: error.message || "Please try again",
        variant: "destructive" 
      });
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await apiRequest('PUT', `/api/app-tasks/${id}`, data);
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Task updated successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/app-tasks'] });
      queryClient.refetchQueries({ queryKey: ['/api/app-tasks'] });
      setEditingTask(null);
      setIsTaskDialogOpen(false);
      toast({ title: "Task updated successfully" });
    },
    onError: (error: any) => {
      console.error('Task update error:', error);
      toast({ 
        title: "Failed to update task", 
        description: error.message || "Please try again",
        variant: "destructive" 
      });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/app-tasks/${id}`);
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Task deleted successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/app-tasks'] });
      queryClient.refetchQueries({ queryKey: ['/api/app-tasks'] });
      toast({ title: "Task deleted successfully" });
    },
    onError: (error: any) => {
      console.error('Task delete error:', error);
      toast({ 
        title: "Failed to delete task", 
        description: error.message || "Please try again",
        variant: "destructive" 
      });
    }
  });

  // Forms
  const projectForm = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
    }
  });

  const taskForm = useForm<{
    title: string;
    description: string;
    projectId: number;
    status: "todo" | "in_progress" | "done";
  }>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      projectId: selectedProject || 0,
      status: "todo",
    }
  });

  // Form handlers
  const onProjectSubmit = (data: any) => {
    console.log('Form submitted with data:', data);
    console.log('Form errors:', projectForm.formState.errors);
    
    if (editingProject) {
      updateProjectMutation.mutate({ id: editingProject.id, ...data });
    } else {
      console.log('Creating new project...');
      createProjectMutation.mutate(data);
    }
  };

  const onTaskSubmit = (data: any) => {
    if (editingTask) {
      updateTaskMutation.mutate({ id: editingTask.id, ...data });
    } else {
      createTaskMutation.mutate(data);
    }
  };

  // Status badge styling
  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      todo: "secondary",
      in_progress: "default",
      done: "default"
    };
    const colors = {
      todo: "text-gray-600",
      in_progress: "text-blue-600",
      done: "text-green-600"
    };
    return { variant: variants[status] || "secondary", className: colors[status as keyof typeof colors] || "text-gray-600" };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const selectedProjectData = projects.find((p: Project) => p.id === selectedProject);
  const taskStats = {
    total: tasks.length,
    todo: tasks.filter((t: Task) => t.status === "todo").length,
    inProgress: tasks.filter((t: Task) => t.status === "in_progress").length,
    done: tasks.filter((t: Task) => t.status === "done").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            App Development Suite
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage your development projects and tasks
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingProject(null);
                projectForm.reset();
              }}>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingProject ? "Edit Project" : "Create New Project"}
                </DialogTitle>
                <DialogDescription>
                  {editingProject ? "Update your project details" : "Add a new development project to track"}
                </DialogDescription>
              </DialogHeader>
              <Form {...projectForm}>
                <form onSubmit={projectForm.handleSubmit(onProjectSubmit)} className="space-y-4">
                  <FormField
                    control={projectForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter project name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={projectForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe your project" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsProjectDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createProjectMutation.isPending || updateProjectMutation.isPending}>
                      {editingProject ? "Update" : "Create"} Project
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Projects Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedProject(null)}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    selectedProject === null ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500' : ''
                  }`}
                >
                  <div className="font-medium">All Projects</div>
                  <div className="text-sm text-gray-500">{projects.length} projects</div>
                </button>
                {projectsLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="px-4 py-2 animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  ))
                ) : (
                  projects.map((project: Project) => (
                    <div key={project.id} className="relative group">
                      <button
                        onClick={() => setSelectedProject(project.id)}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                          selectedProject === project.id ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500' : ''
                        }`}
                      >
                        <div className="font-medium truncate pr-8">{project.name}</div>
                        <div className="text-sm text-gray-500 truncate">{project.description}</div>
                      </button>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingProject(project);
                              projectForm.setValue('name', project.name);
                              projectForm.setValue('description', project.description);
                              setIsProjectDialogOpen(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Delete this project and all its tasks?')) {
                                deleteProjectMutation.mutate(project.id);
                              }
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Main Area */}
        <div className="lg:col-span-3">
          {/* Task Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{taskStats.total}</div>
                <div className="text-sm text-gray-600">Total Tasks</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-gray-600">{taskStats.todo}</div>
                <div className="text-sm text-gray-600">Not Started</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">{taskStats.inProgress}</div>
                <div className="text-sm text-gray-600">In Progress</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{taskStats.done}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="todo">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => {
                    setEditingTask(null);
                    taskForm.reset();
                    taskForm.setValue('projectId', selectedProject || 0);
                  }}
                  disabled={!selectedProject && projects.length === 0}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingTask ? "Edit Task" : "Create New Task"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingTask ? "Update task details and status" : "Add a new task to your project"}
                  </DialogDescription>
                </DialogHeader>
                <Form {...taskForm}>
                  <form onSubmit={taskForm.handleSubmit(onTaskSubmit)} className="space-y-4">
                    <FormField
                      control={taskForm.control}
                      name="projectId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project</FormLabel>
                          <FormControl>
                            <Select 
                              value={field.value?.toString()} 
                              onValueChange={(value) => field.onChange(parseInt(value))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a project" />
                              </SelectTrigger>
                              <SelectContent>
                                {projects.map((project: Project) => (
                                  <SelectItem key={project.id} value={project.id.toString()}>
                                    {project.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={taskForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Task Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter task title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={taskForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Describe the task" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={taskForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="todo">Not Started</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="done">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createTaskMutation.isPending || updateTaskMutation.isPending}>
                        {editingTask ? "Update" : "Create"} Task
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Current Project Header */}
          {selectedProjectData && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                {selectedProjectData.name}
              </h2>
              <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                {selectedProjectData.description}
              </p>
            </div>
          )}

          {/* Tasks List */}
          <div className="space-y-3">
            {tasksLoading ? (
              [...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                      <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredTasks.length > 0 ? (
              filteredTasks.map((task: Task) => {
                const project = projects.find((p: Project) => p.id === task.projectId);
                return (
                  <Card key={task.id} className="hover:shadow-md transition-shadow group">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getStatusIcon(task.status)}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {task.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {task.description}
                            </p>
                            {!selectedProject && project && (
                              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                                {project.name}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={getStatusBadge(task.status).variant}
                            className={getStatusBadge(task.status).className}
                          >
                            {task.status === "todo" ? "Not Started" :
                             task.status === "in_progress" ? "In Progress" : "Completed"}
                          </Badge>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingTask(task);
                                taskForm.setValue('title', task.title);
                                taskForm.setValue('description', task.description);
                                taskForm.setValue('projectId', task.projectId);
                                taskForm.setValue('status', task.status);
                                setIsTaskDialogOpen(true);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (confirm('Delete this task?')) {
                                  deleteTaskMutation.mutate(task.id);
                                }
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {searchTerm || statusFilter !== "all" ? "No tasks match your filters" : "No tasks yet"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {searchTerm || statusFilter !== "all" 
                      ? "Try adjusting your search or filter criteria"
                      : selectedProject 
                        ? "Create your first task for this project"
                        : "Create a project and start adding tasks"
                    }
                  </p>
                  {!searchTerm && statusFilter === "all" && selectedProject && (
                    <Button onClick={() => setIsTaskDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Task
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}