import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Code2, 
  Monitor, 
  Smartphone, 
  Database, 
  Globe,
  GitBranch,
  Clock,
  CheckSquare,
  AlertCircle,
  Play,
  Pause,
  Square,
  Plus,
  Calendar,
  Target,
  Zap,
  Users,
  FileText,
  Link,
  Settings,
  BarChart3,
  Timer,
  Bug,
  Lightbulb,
  Wrench
} from "lucide-react";
import { format } from "date-fns";

// Form Schemas
const newProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  status: z.enum(["planning", "in_progress", "testing", "deployed", "on_hold"]),
  projectType: z.enum(["web", "mobile", "desktop", "api"]),
  repositoryUrl: z.string().optional(),
  deploymentUrl: z.string().optional(),
  targetDate: z.string().optional(),
  estimatedHours: z.string().optional(),
  techStack: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional()
});

const newTaskSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "review", "testing", "done"]),
  category: z.enum(["feature", "bug", "improvement", "documentation"]),
  assignee: z.string().optional(),
  estimatedHours: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional()
});

const testItemSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  title: z.string().min(1, "Test item title is required"),
  description: z.string().optional(),
  testType: z.enum(["unit", "integration", "ui", "performance", "security", "manual"]),
  priority: z.enum(["low", "medium", "high", "critical"]),
  expectedResult: z.string().optional(),
  testSteps: z.string().optional(),
  automatedTest: z.boolean().optional()
});

type NewProjectForm = z.infer<typeof newProjectSchema>;
type NewTaskForm = z.infer<typeof newTaskSchema>;
type TestItemForm = z.infer<typeof testItemSchema>;

interface AppProject {
  id: number;
  name: string;
  description: string;
  status: "planning" | "in_progress" | "testing" | "deployed" | "on_hold";
  projectType: "web" | "mobile" | "desktop" | "api";
  repositoryUrl?: string;
  deploymentUrl?: string;
  targetDate?: string;
  startDate?: string;
  completedDate?: string;
  progress: number;
  estimatedHours?: number;
  actualHours: number;
  techStack: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AppTask {
  id: number;
  projectId: number;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "review" | "testing" | "done";
  category: "feature" | "bug" | "improvement" | "documentation";
  assignee?: string;
  estimatedHours?: number;
  actualHours: number;
  dueDate?: string;
  completedDate?: string;
  dependencies: string[];
  attachments: string[];
  comments: string;
  createdAt: string;
  updatedAt: string;
}

interface AppDevelopmentSectionProps {
  selectedDate: Date;
  isReadOnly?: boolean;
}

export default function AppDevelopmentSection({ selectedDate, isReadOnly = false }: AppDevelopmentSectionProps) {
  const [activeView, setActiveView] = useState<"overview" | "projects" | "tasks" | "testing" | "time">("overview");
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [showTestItemForm, setShowTestItemForm] = useState(false);
  const { toast } = useToast();
  
  // Time tracking state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [activeTask, setActiveTask] = useState<string>("");
  const [timeEntries, setTimeEntries] = useState<Array<{
    id: number;
    projectId: number;
    taskDescription: string;
    startTime: Date;
    endTime: Date;
    duration: number; // in minutes
    date: string;
  }>>([]);

  // Fetch real project data from API
  const { data: projects = [] } = useQuery({
    queryKey: ['/api/app-projects'],
    select: (data: any[]) => data || []
  });

  // Fetch real task data from API
  const { data: tasks = [] } = useQuery({
    queryKey: ['/api/app-tasks'],
    select: (data: any[]) => data || []
  });

  // Mutations
  const createProjectMutation = useMutation({
    mutationFn: (data: NewProjectForm) => 
      apiRequest('/api/app-projects', 'POST', {
        ...data,
        progress: 0,
        actualHours: 0,
        isActive: true,
        techStack: data.techStack ? data.techStack.split(',').map(s => s.trim()) : [],
        estimatedHours: data.estimatedHours ? parseInt(data.estimatedHours) : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/app-projects'] });
      toast({ title: "Success", description: "Project created successfully" });
      setShowNewProjectForm(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create project", variant: "destructive" });
    }
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: NewTaskForm) => 
      apiRequest('/api/app-tasks', 'POST', {
        ...data,
        projectId: parseInt(data.projectId),
        actualHours: 0,
        dependencies: [],
        attachments: [],
        comments: '',
        estimatedHours: data.estimatedHours ? parseInt(data.estimatedHours) : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/app-tasks'] });
      toast({ title: "Success", description: "Task created successfully" });
      setShowNewTaskForm(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create task", variant: "destructive" });
    }
  });

  // Form instances
  const projectForm = useForm<NewProjectForm>({
    resolver: zodResolver(newProjectSchema),
    defaultValues: {
      status: "planning",
      projectType: "web",
      priority: "medium"
    }
  });

  const taskForm = useForm<NewTaskForm>({
    resolver: zodResolver(newTaskSchema),
    defaultValues: {
      status: "todo",
      category: "feature",
      priority: "medium"
    }
  });

  const testForm = useForm<TestItemForm>({
    resolver: zodResolver(testItemSchema),
    defaultValues: {
      testType: "manual",
      priority: "medium",
      automatedTest: false
    }
  });

  // Form handlers
  const onSubmitProject = (data: NewProjectForm) => {
    createProjectMutation.mutate(data);
  };

  const onSubmitTask = (data: NewTaskForm) => {
    createTaskMutation.mutate(data);
  };

  const onSubmitTestItem = (data: TestItemForm) => {
    // For now, create as a task with testing category
    const taskData: NewTaskForm = {
      projectId: data.projectId,
      title: data.title,
      description: `[${data.testType.toUpperCase()} TEST] ${data.description || ''}`,
      status: "todo",
      category: "feature",
      priority: data.priority === "critical" ? "high" : data.priority,
    };
    createTaskMutation.mutate(taskData);
    setShowTestItemForm(false);
    toast({ title: "Success", description: "Test item added as task" });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      planning: "bg-blue-100 text-blue-800 dark:bg-[#17111d]/30 dark:text-blue-400",
      in_progress: "bg-yellow-100 text-yellow-800 dark:bg-[#17111d]/30 dark:text-yellow-400",
      testing: "bg-purple-100 text-purple-800 dark:bg-[#17111d]/30 dark:text-purple-400",
      deployed: "bg-green-100 text-green-800 dark:bg-[#17111d]/30 dark:text-green-400",
      on_hold: "bg-gray-100 text-gray-800 dark:bg-[#17111d]/30 dark:text-gray-400",
      todo: "bg-gray-100 text-gray-800 dark:bg-[#17111d]/30 dark:text-gray-400",
      review: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      done: "bg-green-100 text-green-800 dark:bg-[#17111d]/30 dark:text-green-400"
    };
    return colors[status as keyof typeof colors] || colors.planning;
  };



  const getProjectIcon = (type: string) => {
    const icons = {
      web: Globe,
      mobile: Smartphone,
      desktop: Monitor,
      api: Database
    };
    const Icon = icons[type as keyof typeof icons] || Globe;
    return <Icon className="h-4 w-4" />;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      feature: Lightbulb,
      bug: Bug,
      improvement: Wrench,
      documentation: FileText
    };
    const Icon = icons[category as keyof typeof icons] || Lightbulb;
    return <Icon className="h-4 w-4" />;
  };

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
  const startTimer = (taskDescription: string = "") => {
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
        projectId: selectedProject || 1,
        taskDescription: activeTask,
        startTime,
        endTime,
        duration,
        date: format(selectedDate, 'yyyy-MM-dd')
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

  const activeProjects = projects.filter(p => p.isActive);
  const projectTasks = selectedProject ? tasks.filter(t => t.projectId === selectedProject) : tasks;
  const testingTasks = tasks.filter(t => t.status === 'testing');

  // Testing Template for AI Development Projects
  const testingTemplate = {
    designGaps: [
      {
        id: 1,
        area: "User Experience",
        issue: "Navigation flow unclear on mobile devices",
        severity: "medium",
        project: "Professional Portfolio",
        status: "identified",
        dateFound: "2025-06-03",
        resolution: "",
        testSteps: ["Navigate on mobile", "Check menu accessibility", "Verify responsive design"]
      }
    ],
    oversights: [
      {
        id: 1,
        category: "Performance",
        description: "Image optimization not implemented",
        impact: "Slow page load times",
        project: "Professional Portfolio",
        priority: "high",
        discoveredDuring: "Manual testing",
        solution: "Implement next/image or similar optimization"
      }
    ],
    testChecklist: []
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-heading font-bold bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
            AI App Development & Coding
          </h3>
          <p className="text-muted-foreground dark:text-gray-300 mt-1">
            Manage your development projects with professional project management tools
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-2 bg-white/60 dark:[background-color:#0c0910] rounded-2xl p-1 shadow-sm backdrop-blur-sm border border-pink-200/50 dark:border-pink-800/50">
          {[
            { key: "overview", label: "Overview", icon: BarChart3 },
            { key: "projects", label: "Projects", icon: Code2 },
            { key: "tasks", label: "Tasks", icon: CheckSquare },
            { key: "testing", label: "Testing & QA", icon: AlertCircle },
            { key: "time", label: "Time Tracking", icon: Timer }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveView(tab.key as any)}
                className={`px-4 py-2 text-sm rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                  activeView === tab.key
                    ? "bg-gradient-to-r from-purple-400 to-indigo-500 text-white shadow-sm"
                    : "text-[#4b5563] hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview */}
      {activeView === "overview" && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-purple-100 dark:border-purple-800 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">Active Projects</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {activeProjects.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center">
                    <Code2 className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-100 dark:border-blue-800 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">Open Tasks</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {tasks.filter(t => t.status !== 'done').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center">
                    <CheckSquare className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-100 dark:border-green-800 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">Hours Logged</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {projects.reduce((sum, p) => sum + p.actualHours, 0)}h
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-100 dark:border-orange-800 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">Avg Progress</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {Math.round(activeProjects.reduce((sum, p) => sum + p.progress, 0) / activeProjects.length)}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-amber-500 rounded-xl flex items-center justify-center">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Projects */}
          <Card className="border-purple-100 dark:border-purple-800 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                <Code2 className="h-5 w-5" />
                Active Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeProjects.map((project) => (
                  <div key={project.id} className="p-4 bg-white/60 dark:bg-[#17111d]/60 rounded-xl">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-lg flex items-center justify-center">
                          {getProjectIcon(project.projectType)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{project.name}</h4>
                          <p className="text-sm text-muted-foreground dark:text-gray-400">{project.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.replace('_', ' ')}
                        </Badge>

                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground dark:text-gray-400">Progress</span>
                          <span className="font-medium">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground dark:text-gray-400">Hours:</span>
                          <span className="ml-1 font-medium">{project.actualHours}/{project.estimatedHours || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground dark:text-gray-400">Tasks:</span>
                          <span className="ml-1 font-medium">{tasks.filter(t => t.projectId === project.id).length}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground dark:text-gray-400">Type:</span>
                          <span className="ml-1 font-medium capitalize">{project.projectType}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground dark:text-gray-400">Target:</span>
                          <span className="ml-1 font-medium">
                            {project.targetDate ? format(new Date(project.targetDate), 'MMM dd') : 'TBD'}
                          </span>
                        </div>
                      </div>

                      {project.techStack.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.techStack.map((tech: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() => setSelectedProject(project.id)}
                          disabled={isReadOnly}
                          className={`bg-gradient-to-r from-purple-400 to-indigo-500 text-white ${
                            isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          View Details
                        </Button>
                        {project.repositoryUrl && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            disabled={isReadOnly}
                            className={isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}
                          >
                            <GitBranch className="h-4 w-4 mr-1" />
                            Repository
                          </Button>
                        )}
                        {project.deploymentUrl && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            disabled={isReadOnly}
                            className={isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}
                          >
                            <Link className="h-4 w-4 mr-1" />
                            Live Site
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Projects View */}
      {activeView === "projects" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#4b5563] dark:text-white">Projects</h2>
            <Button 
              onClick={() => setShowNewProjectForm(true)}
              disabled={isReadOnly}
              className={`bg-gradient-to-r from-purple-400 to-indigo-500 text-white ${
                isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="border-purple-100 dark:border-purple-800 shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-lg flex items-center justify-center">
                        {getProjectIcon(project.projectType)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <p className="text-sm text-muted-foreground dark:text-gray-400">{project.projectType}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground dark:text-gray-400">{project.description}</p>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground dark:text-gray-400">Hours:</span>
                      <span className="ml-1 font-medium">{project.actualHours}/{project.estimatedHours || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground dark:text-gray-400">Type:</span>
                      <Badge variant="outline" className="ml-1 capitalize">
                        {project.projectType}
                      </Badge>
                    </div>
                  </div>

                  {project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.techStack.slice(0, 3).map((tech: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                      {project.techStack.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{project.techStack.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => setSelectedProject(project.id)}
                      disabled={isReadOnly}
                      className={`bg-gradient-to-r from-purple-400 to-indigo-500 text-white ${
                        isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      Manage
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      disabled={isReadOnly}
                      className={isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tasks View */}
      {activeView === "tasks" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-[#4b5563] dark:text-white">Tasks</h2>
              {selectedProject && (
                <Badge variant="outline" className="text-sm">
                  {projects.find(p => p.id === selectedProject)?.name}
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <select
                value={selectedProject || ""}
                onChange={(e) => setSelectedProject(e.target.value ? Number(e.target.value) : null)}
                className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-[#17111d]"
              >
                <option value="">All Projects</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <Button 
                onClick={() => setShowNewTaskForm(true)}
                disabled={isReadOnly}
                className={`bg-gradient-to-r from-purple-400 to-indigo-500 text-white ${
                  isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {projectTasks.map((task) => (
              <Card key={task.id} className="border-blue-100 dark:border-blue-800 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
                        {getCategoryIcon(task.category)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{task.title}</h4>
                        <p className="text-sm text-muted-foreground dark:text-gray-400">{task.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {task.category}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground dark:text-gray-400">Category:</span>
                      <span className="ml-1 font-medium capitalize">{task.category}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground dark:text-gray-400">Hours:</span>
                      <span className="ml-1 font-medium">{task.actualHours}/{task.estimatedHours || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground dark:text-gray-400">Project:</span>
                      <span className="ml-1 font-medium">
                        {projects.find(p => p.id === task.projectId)?.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground dark:text-gray-400">Due:</span>
                      <span className="ml-1 font-medium">
                        {task.dueDate ? format(new Date(task.dueDate), 'MMM dd') : 'No due date'}
                      </span>
                    </div>
                  </div>

                  {task.comments && (
                    <div className="mt-3 p-2 bg-gray-50 dark:bg-[#17111d]/50 rounded text-sm">
                      <span className="text-muted-foreground dark:text-gray-400">Notes:</span>
                      <span className="ml-1">{task.comments}</span>
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    <Button 
                      size="sm" 
                      variant="outline"
                      disabled={isReadOnly}
                      className={isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      disabled={isReadOnly}
                      className={isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                      <Timer className="h-4 w-4 mr-1" />
                      Log Time
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Testing & QA View */}
      {activeView === "testing" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#4b5563] dark:text-white">Testing & Quality Assurance</h2>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowTestItemForm(true)}
                disabled={isReadOnly}
                className={`bg-gradient-to-r from-red-400 to-orange-500 text-white ${
                  isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Test Item
              </Button>
              <Button 
                variant="outline"
                disabled={isReadOnly}
                className={isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Run All Tests
              </Button>
            </div>
          </div>

          {/* Tasks in Testing Status */}
          {testingTasks.length > 0 && (
            <Card className="border-orange-100 dark:border-orange-800 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-orange-600 dark:text-orange-400">
                  <AlertCircle className="h-5 w-5" />
                  Tasks Currently in Testing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testingTasks.map((task) => (
                    <div key={task.id} className="p-4 bg-white/60 dark:bg-[#17111d]/60 rounded-xl border-l-4 border-orange-400">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{task.title}</h4>
                          <p className="text-sm text-muted-foreground dark:text-gray-400">{task.description}</p>
                          <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
                            {projects.find(p => p.id === task.projectId)?.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {task.category}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground dark:text-gray-400">Category:</span>
                          <span className="ml-1 font-medium capitalize">{task.category}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground dark:text-gray-400">Time Spent:</span>
                          <span className="ml-1 font-medium">{task.actualHours}h / {task.estimatedHours}h</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground dark:text-gray-400">Due Date:</span>
                          <span className="ml-1 font-medium">
                            {task.dueDate ? format(new Date(task.dueDate), 'MMM dd') : 'No due date'}
                          </span>
                        </div>
                      </div>

                      {task.comments && (
                        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/30 rounded text-sm">
                          <span className="text-blue-600 dark:text-blue-400 font-medium">Testing Notes:</span>
                          <span className="ml-1">{task.comments}</span>
                        </div>
                      )}

                      <div className="flex gap-2 mt-3">
                        <Button 
                          size="sm" 
                          variant="outline"
                          disabled={isReadOnly}
                          className={isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}
                        >
                          Pass Test
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          disabled={isReadOnly}
                          className={isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}
                        >
                          Fail Test
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          disabled={isReadOnly}
                          className={isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}
                        >
                          Add Notes
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Simple Test Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Portfolio Testing */}
            <Card className="border-blue-100 dark:border-blue-800 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                  <Globe className="h-5 w-5" />
                  Professional Portfolio Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <CheckSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No test items yet. Click "Add Test Item" to start.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Media Lab Testing */}
            <Card className="border-purple-100 dark:border-purple-800 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <Globe className="h-5 w-5" />
                  Really Obvious Media Lab Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <CheckSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No test items yet. Click "Add Test Item" to start.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>


        </div>
      )}

      {/* Time Tracking View */}
      {activeView === "time" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#4b5563] dark:text-white">Time Tracking</h2>
            {!isTimerRunning && (
              <Button 
                onClick={() => !isReadOnly && startTimer()}
                disabled={isReadOnly}
                className={`bg-gradient-to-r from-green-400 to-emerald-500 text-white ${
                  isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Play className="h-4 w-4 mr-2" />
                Start Timer
              </Button>
            )}
          </div>

          <Card className="border-green-100 dark:border-green-800 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-green-600 dark:text-green-400">
                <Timer className="h-5 w-5" />
                Time Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div key={project.id} className="p-4 bg-white/60 dark:bg-[#17111d]/60 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                        {getProjectIcon(project.projectType)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{project.name}</h4>
                        <p className="text-sm text-muted-foreground dark:text-gray-400">
                          {project.actualHours}h logged
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground dark:text-gray-400">Progress</span>
                        <span className="font-medium">
                          {project.estimatedHours ? 
                            `${Math.round((project.actualHours / project.estimatedHours) * 100)}%` : 
                            'No estimate'
                          }
                        </span>
                      </div>
                      {project.estimatedHours && (
                        <Progress value={(project.actualHours / project.estimatedHours) * 100} className="h-2" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Timer */}
          <Card className="border-blue-100 dark:border-blue-800 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                <Clock className="h-5 w-5" />
                Active Session
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isTimerRunning ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Task Description</label>
                    <input
                      type="text"
                      placeholder="What are you working on?"
                      className={`w-full p-3 border rounded-lg dark:bg-[#17111d] dark:border-gray-600 ${
                        isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      value={activeTask}
                      onChange={(e) => setActiveTask(e.target.value)}
                      disabled={isReadOnly}
                      readOnly={isReadOnly}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Project</label>
                    <select
                      className={`w-full p-3 border rounded-lg dark:bg-[#17111d] dark:border-gray-600 ${
                        isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      value={selectedProject || ""}
                      onChange={(e) => setSelectedProject(Number(e.target.value))}
                      disabled={isReadOnly}
                    >
                      <option value="">Select a project</option>
                      {activeProjects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button 
                    onClick={() => !isReadOnly && startTimer(activeTask)}
                    disabled={isReadOnly}
                    className={`w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white ${
                      isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Session
                  </Button>
                </div>
              ) : (
                <div className="text-center p-8">
                  <div className="text-6xl font-mono font-bold text-green-600 dark:text-green-400 mb-4">
                    {formatTime(elapsedTime)}
                  </div>
                  <div className="space-y-2 mb-6">
                    <p className="text-gray-900 dark:text-white font-medium">
                      {activeTask || "Unnamed task"}
                    </p>
                    <p className="text-muted-foreground dark:text-gray-400">
                      {projects.find(p => p.id === selectedProject)?.name || "No project selected"}
                    </p>
                  </div>
                  <Button 
                    onClick={stopTimer}
                    disabled={isReadOnly}
                    variant="destructive"
                    className={`bg-red-500 hover:bg-red-600 ${
                      isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Stop Session
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Time Entries */}
          {timeEntries.length > 0 && (
            <Card className="border-purple-100 dark:border-purple-800 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <BarChart3 className="h-5 w-5" />
                  Today's Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {timeEntries.map((entry) => (
                    <div key={entry.id} className="p-4 bg-white/60 dark:bg-[#17111d]/60 rounded-xl border">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {entry.taskDescription || "Unnamed task"}
                          </h4>
                          <p className="text-sm text-muted-foreground dark:text-gray-400">
                            {projects.find(p => p.id === entry.projectId)?.name || "No project"}
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
      )}

      {/* New Project Form Modal */}
      <Dialog open={showNewProjectForm} onOpenChange={setShowNewProjectForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-purple-600 dark:text-purple-400">Create New Project</DialogTitle>
          </DialogHeader>
          <Form {...projectForm}>
            <form onSubmit={projectForm.handleSubmit(onSubmitProject)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={projectForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My Awesome Project" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={projectForm.control}
                  name="projectType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="web">Web Application</SelectItem>
                          <SelectItem value="mobile">Mobile App</SelectItem>
                          <SelectItem value="desktop">Desktop App</SelectItem>
                          <SelectItem value="api">API/Backend</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={projectForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Brief description of the project..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={projectForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="planning">Planning</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="testing">Testing</SelectItem>
                          <SelectItem value="deployed">Deployed</SelectItem>
                          <SelectItem value="on_hold">On Hold</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={projectForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={projectForm.control}
                  name="estimatedHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Hours</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="40" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={projectForm.control}
                  name="targetDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={projectForm.control}
                name="techStack"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tech Stack (comma-separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="React, TypeScript, Tailwind CSS" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={projectForm.control}
                  name="repositoryUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repository URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://github.com/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={projectForm.control}
                  name="deploymentUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deployment URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://myproject.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={createProjectMutation.isPending}
                  className="bg-gradient-to-r from-purple-400 to-indigo-500 text-white"
                >
                  {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowNewProjectForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* New Task Form Modal */}
      <Dialog open={showNewTaskForm} onOpenChange={setShowNewTaskForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-blue-600 dark:text-blue-400">Create New Task</DialogTitle>
          </DialogHeader>
          <Form {...taskForm}>
            <form onSubmit={taskForm.handleSubmit(onSubmitTask)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={taskForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Implement user authentication" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={taskForm.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {projects.map(project => (
                            <SelectItem key={project.id} value={project.id.toString()}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={taskForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Detailed description of the task..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={taskForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="feature">Feature</SelectItem>
                          <SelectItem value="bug">Bug Fix</SelectItem>
                          <SelectItem value="improvement">Improvement</SelectItem>
                          <SelectItem value="documentation">Documentation</SelectItem>
                        </SelectContent>
                      </Select>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="review">Review</SelectItem>
                          <SelectItem value="testing">Testing</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={taskForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={taskForm.control}
                  name="estimatedHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Hours</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="8" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={taskForm.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={taskForm.control}
                name="assignee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={createTaskMutation.isPending}
                  className="bg-gradient-to-r from-blue-400 to-cyan-500 text-white"
                >
                  {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowNewTaskForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Test Item Form Modal */}
      <Dialog open={showTestItemForm} onOpenChange={setShowTestItemForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-orange-600 dark:text-orange-400">Add Test Item</DialogTitle>
          </DialogHeader>
          <Form {...testForm}>
            <form onSubmit={testForm.handleSubmit(onSubmitTestItem)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={testForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Test Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Login functionality test" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={testForm.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {projects.map(project => (
                            <SelectItem key={project.id} value={project.id.toString()}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={testForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Detailed description of what needs to be tested..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={testForm.control}
                  name="testType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Test Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select test type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="unit">Unit Test</SelectItem>
                          <SelectItem value="integration">Integration Test</SelectItem>
                          <SelectItem value="ui">UI Test</SelectItem>
                          <SelectItem value="performance">Performance Test</SelectItem>
                          <SelectItem value="security">Security Test</SelectItem>
                          <SelectItem value="manual">Manual Test</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={testForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={testForm.control}
                name="expectedResult"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Result</FormLabel>
                    <FormControl>
                      <Textarea placeholder="What should happen when the test passes..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={testForm.control}
                name="testSteps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Steps</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Step-by-step instructions for testing..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={createTaskMutation.isPending}
                  className="bg-gradient-to-r from-orange-400 to-red-500 text-white"
                >
                  {createTaskMutation.isPending ? "Adding..." : "Add Test Item"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowTestItemForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}