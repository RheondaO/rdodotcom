import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
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

// Form schema for new project
const newProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().min(1, "Description is required"),
  projectType: z.enum(["web", "mobile", "desktop", "api"]),
  status: z.enum(["planning", "in_progress", "testing", "deployed", "on_hold"]).default("planning"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  estimatedHours: z.number().min(0).optional(),
  repositoryUrl: z.string().url().optional().or(z.literal("")),
  deploymentUrl: z.string().url().optional().or(z.literal("")),
  targetDate: z.string().optional(),
  techStack: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([])
});

type NewProjectForm = z.infer<typeof newProjectSchema>;

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
  const [techStackInput, setTechStackInput] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  
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

  // Form setup
  const form = useForm<NewProjectForm>({
    resolver: zodResolver(newProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      projectType: "web",
      status: "planning",
      priority: "medium",
      techStack: [],
      tags: []
    }
  });

  // Fetch real project data from API
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/app-projects'],
    select: (data: any[]) => data || []
  });

  // Fetch real task data from API
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/app-tasks'],
    select: (data: any[]) => data || []
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (data: NewProjectForm) => {
      const projectData = {
        ...data,
        repositoryUrl: data.repositoryUrl || undefined,
        deploymentUrl: data.deploymentUrl || undefined,
        targetDate: data.targetDate ? new Date(data.targetDate).toISOString() : undefined,
        techStack: data.techStack.length > 0 ? data.techStack : [],
        tags: data.tags.length > 0 ? data.tags : []
      };
      return await fetch('/api/app-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/app-projects'] });
      setShowNewProjectForm(false);
      form.reset();
      setTechStackInput("");
      setTagsInput("");
      toast({
        title: "Success",
        description: "Project created successfully!"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Fetch real testing data from API
  const { data: testCases = [], isLoading: testCasesLoading } = useQuery({
    queryKey: ['/api/test-cases'],
    select: (data: any[]) => data || []
  });

  const { data: qualityIssues = [], isLoading: qualityIssuesLoading } = useQuery({
    queryKey: ['/api/quality-issues'],
    select: (data: any[]) => data || []
  });

  const getStatusColor = (status: string) => {
    const colors = {
      planning: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      testing: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      deployed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      on_hold: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      todo: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      review: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      done: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
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

  // Form submission handler
  const onSubmit = (data: NewProjectForm) => {
    const formData = {
      ...data,
      techStack: techStackInput ? techStackInput.split(',').map((s: string) => s.trim()).filter((s: string) => s) : [],
      tags: tagsInput ? tagsInput.split(',').map((s: string) => s.trim()).filter((s: string) => s) : []
    };
    createProjectMutation.mutate(formData);
  };

  // Helper function to add tech stack item
  const addTechStackItem = (item: string) => {
    if (item.trim()) {
      const currentStack = techStackInput ? techStackInput.split(',').map((s: string) => s.trim()) : [];
      if (!currentStack.includes(item.trim())) {
        setTechStackInput(currentStack.concat(item.trim()).join(', '));
      }
    }
  };

  // Helper function to add tag
  const addTag = (tag: string) => {
    if (tag.trim()) {
      const currentTags = tagsInput ? tagsInput.split(',').map((s: string) => s.trim()) : [];
      if (!currentTags.includes(tag.trim())) {
        setTagsInput(currentTags.concat(tag.trim()).join(', '));
      }
    }
  };

  const activeProjects = projects.filter(p => p.isActive);
  const projectTasks = selectedProject ? tasks.filter(t => t.projectId === selectedProject) : tasks;
  const testingTasks = tasks.filter(t => t.status === 'testing');

  // Calculate testing statistics from real data
  const getTestingStats = () => {
    const totalTests = testCases.length;
    const passedTests = testCases.filter(tc => tc.status === 'passed').length;
    const failedTests = testCases.filter(tc => tc.status === 'failed').length;
    const pendingTests = testCases.filter(tc => tc.status === 'pending').length;

    const totalIssues = qualityIssues.length;
    const openIssues = qualityIssues.filter(qi => qi.status === 'open').length;
    const criticalIssues = qualityIssues.filter(qi => qi.severity === 'critical').length;
    const highIssues = qualityIssues.filter(qi => qi.severity === 'high').length;

    return {
      totalTests,
      passedTests,
      failedTests,
      pendingTests,
      passRate: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0,
      totalIssues,
      openIssues,
      criticalIssues,
      highIssues
    };
  };

  const testingStats = getTestingStats();

    const triggerDeployment = (changeId: number) => {
        // Placeholder for deployment logic
        // Replace with your actual deployment trigger mechanism
        toast({
            title: "Deployment Triggered",
            description: `Deployment triggered for change ID: ${changeId}`,
        });
    };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
          <Code2 className="h-10 w-10 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent mb-2">
            App Development
          </h1>
          <p className="text-lg text-muted-foreground dark:text-gray-300 max-w-2xl mx-auto">
            Manage your development projects with professional project management tools similar to Asana and Jira.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-2 bg-white/60 dark:bg-gray-800/60 rounded-2xl p-1 shadow-sm backdrop-blur-sm">
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
                    : "text-muted-foreground hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400"
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
              {projectsLoading ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl animate-pulse">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                          <div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-2"></div>
                            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                          </div>
                        </div>
                        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                      </div>
                      <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-full mb-3"></div>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : activeProjects.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Code2 className="h-8 w-8 text-purple-400 dark:text-purple-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No Active Projects
                  </h3>
                  <p className="text-muted-foreground dark:text-gray-400 mb-4 max-w-sm mx-auto">
                    There are currently no active app projects in development. Create your first project to get started.
                  </p>
                  {!isReadOnly && (
                    <Button 
                      onClick={() => setShowNewProjectForm(true)}
                      size="sm"
                      className="bg-gradient-to-r from-purple-400 to-indigo-500 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Project
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {activeProjects.map((project) => (
                    <div key={project.id} className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl">
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
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Projects View */}
      {activeView === "projects" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h2>
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

          {/* Auto-detected Changes */}
          <Card className="border-green-100 dark:border-green-800 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-green-600 dark:text-green-400">
                <GitBranch className="h-5 w-5" />
                Detected Changes Requiring Testing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Example auto-detected changes - would be populated from actual analysis */}
                {[
                  {
                    id: 1,
                    type: "feature",
                    title: "Added compression middleware for performance optimization",
                    description: "Implemented gzip compression to reduce response sizes and improve load times",
                    files: ["server/index.ts"],
                    impact: "Performance improvement",
                    status: "pending_test",
                    priority: "medium",
                    detectedAt: new Date().toISOString()
                  },
                  {
                    id: 2,
                    type: "improvement",
                    title: "Optimized database queries with caching headers",
                    description: "Added response caching to reduce database load on public endpoints",
                    files: ["server/routes.ts"],
                    impact: "Performance improvement",
                    status: "pending_test",
                    priority: "high",
                    detectedAt: new Date().toISOString()
                  },
                  {
                    id: 3,
                    type: "feature",
                    title: "Enhanced deployment configuration",
                    description: "Updated build and run commands for better production deployment",
                    files: [".replit", "server/index.ts"],
                    impact: "Deployment optimization",
                    status: "needs_verification",
                    priority: "high",
                    detectedAt: new Date().toISOString()
                  }
                ].map((change) => (
                  <div key={change.id} className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border-l-4 border-green-400">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="capitalize">
                            {change.type}
                          </Badge>
                          <Badge className={
                            change.priority === 'high' ? 'bg-red-100 text-red-700' :
                            change.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }>
                            {change.priority} priority
                          </Badge>
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                          {change.title}
                        </h4>
                        <p className="text-sm text-muted-foreground dark:text-gray-400 mb-2">
                          {change.description}
                        </p>
                        <div className="text-xs text-muted-foreground dark:text-gray-500">
                          <span className="font-medium">Files:</span> {change.files.join(', ')}
                        </div>
                        <div className="text-xs text-muted-foreground dark:text-gray-500">
                          <span className="font-medium">Impact:</span> {change.impact}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className={
                          change.status === 'pending_test' ? 'bg-yellow-100 text-yellow-800' :
                          change.status === 'needs_verification' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {change.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button 
                        size="sm" 
                        variant="outline"
                        disabled={isReadOnly}
                        className={`text-green-600 border-green-300 hover:bg-green-50 ${
                          isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <CheckSquare className="h-4 w-4 mr-1" />
                        Mark as Tested
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        disabled={isReadOnly}
                        className={isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Add Notes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tasks View */}
      {activeView === "tasks" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h2>
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
                className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800"
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

          {/* Auto-detected Gaps */}
          <Card className="border-orange-100 dark:border-orange-800 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-orange-600 dark:text-orange-400">
                <AlertCircle className="h-5 w-5" />
                Identified Gaps & Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Example auto-detected gaps - would be populated from AI analysis */}
                {[
                  {
                    id: 1,
                    category: "Missing Functionality",
                    title: "RotationONLY Content Studio Suite not established",
                    description: "The content rotation system needs to be reestablished with proper scheduling and automation",
                    severity: "high",
                    estimatedEffort: "4-6 hours",
                    blockedFeatures: ["Content automation", "Scheduled publishing"],
                    suggestedSolution: "Implement content rotation pipeline with moon phase scheduling integration",
                    status: "identified"
                  },
                  {
                    id: 2,
                    category: "Performance Issue",
                    title: "App slower than anticipated in deployment",
                    description: "Deployment performance is below expected benchmarks, affecting user experience",
                    severity: "high",
                    estimatedEffort: "2-3 hours",
                    blockedFeatures: ["Fast user interactions", "Real-time updates"],
                    suggestedSolution: "Already implemented compression and caching - needs verification",
                    status: "in_progress"
                  },
                  {
                    id: 3,
                    category: "Integration Gap",
                    title: "Automated change tracking system missing",
                    description: "Need system to automatically list changes and updates for admin review",
                    severity: "medium",
                    estimatedEffort: "3-4 hours",
                    blockedFeatures: ["Auto-change detection", "Admin workflow"],
                    suggestedSolution: "Integrate git hooks and file monitoring for change detection",
                    status: "identified"
                  }
                ].map((gap) => (
                  <div key={gap.id} className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border-l-4 border-orange-400">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-orange-700 border-orange-300">
                            {gap.category}
                          </Badge>
                          <Badge className={
                            gap.severity === 'high' ? 'bg-red-100 text-red-700' :
                            gap.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }>
                            {gap.severity} priority
                          </Badge>
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                          {gap.title}
                        </h4>
                        <p className="text-sm text-muted-foreground dark:text-gray-400 mb-2">
                          {gap.description}
                        </p>
                        <div className="text-xs text-muted-foreground dark:text-gray-500 space-y-1">
                          <div><span className="font-medium">Estimated Effort:</span> {gap.estimatedEffort}</div>
                          <div><span className="font-medium">Blocked Features:</span> {gap.blockedFeatures.join(', ')}</div>
                          <div><span className="font-medium">Suggested Solution:</span> {gap.suggestedSolution}</div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className={
                          gap.status === 'identified' ? 'bg-red-100 text-red-800' :
                          gap.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                          gap.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {gap.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-orange-400 to-red-500 text-white"
                        disabled={isReadOnly}
                      >
                        <Wrench className="h-4 w-4 mr-1" />
                        Start Fixing
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        disabled={isReadOnly}
                        className={isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Assign
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        disabled={isReadOnly}
                        className={`text-green-600 border-green-300 hover:bg-green-50 ${
                          isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <CheckSquare className="h-4 w-4 mr-1" />
                        Mark Complete
                      </Button>
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h2>
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

          {projectsLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="border-purple-100 dark:border-purple-800 shadow-lg animate-pulse">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                        <div>
                          <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-2"></div>
                          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                        </div>
                      </div>
                      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Code2 className="h-10 w-10 text-purple-400 dark:text-purple-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Projects Yet
              </h3>
              <p className="text-muted-foreground dark:text-gray-400 mb-6 max-w-md mx-auto">
                There are currently no active app projects in development. Start by creating your first project to begin tracking your development work.
              </p>
              {!isReadOnly && (
                <Button 
                  onClick={() => setShowNewProjectForm(true)}
                  className="bg-gradient-to-r from-purple-400 to-indigo-500 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Project
                </Button>
              )}
            </div>
          ) : (
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
          )}
        </div>
      )}

      {/* Tasks View */}
      {activeView === "tasks" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h2>
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
                className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800"
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

          {tasksLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="border-blue-100 dark:border-blue-800 shadow-lg animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                        <div>
                          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-2"></div>
                          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                        </div>
                      </div>
                      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : projectTasks.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <CheckSquare className="h-10 w-10 text-blue-400 dark:text-blue-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {selectedProject ? "No Tasks in This Project" : "No Tasks Yet"}
              </h3>
              <p className="text-muted-foreground dark:text-gray-400 mb-6 max-w-md mx-auto">
                {selectedProject 
                  ? "This project doesn't have any tasks yet. Create your first task to start organizing your work."
                  : "You haven't created any tasks across your projects. Tasks help you break down your projects into manageable pieces."
                }
              </p>
              {!isReadOnly && (
                <Button 
                  onClick={() => setShowNewTaskForm(true)}
                  className="bg-gradient-to-r from-blue-400 to-cyan-500 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Task
                </Button>
              )}
            </div>
          ) : (
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
                      <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800/50 rounded text-sm">
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
          )}
        </div>
      )}

      {/* Testing Queue View */}
      {activeView === "testing" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Testing Queue & Completion Verification</h2>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {/* Mock count - would be dynamic */}
                3 items pending
              </Badge>
              <Button 
                variant="outline"
                disabled={isReadOnly}
                className={`text-green-600 border-green-300 hover:bg-green-50 ${
                  isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Verify All Complete
              </Button>
            </div>
          </div>

          {/* Testing Queue - Items Pending Completion Verification */}
          <Card className="border-blue-100 dark:border-blue-800 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                <CheckSquare className="h-5 w-5" />
                Items Awaiting Admin Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Example testing queue items - would be populated from changes and gaps */}
                {[
                  {
                    id: 1,
                    type: "performance_fix",
                    title: "Compression middleware implementation",
                    description: "Verify that gzip compression is working and improving load times",
                    expectedOutcome: "Page load times reduced by 20-30%",
                    testSteps: [
                      "Check network tab for compressed responses",
                      "Measure load time before/after",
                      "Verify all endpoints return compressed content"
                    ],
                    completed: false,
                    completedAt: null,
                    completedBy: null
                  },
                  {
                    id: 2,
                    type: "feature_completion",
                    title: "Database query optimization with caching",
                    description: "Confirm that caching headers are properly set and reducing database load",
                    expectedOutcome: "Reduced database queries on public endpoints",
                    testSteps: [
                      "Monitor database query count",
                      "Check response headers for cache-control",
                      "Verify 5-minute cache duration on public data"
                    ],
                    completed: false,
                    completedAt: null,
                    completedBy: null
                  },
                  {
                    id: 3,
                    type: "deployment_verification",
                    title: "Production deployment configuration",
                    description: "Ensure deployment runs smoothly with new build configuration",
                    expectedOutcome: "Successful deployment without errors",
                    testSteps: [
                      "Deploy to production",
                      "Verify all services start correctly",
                      "Check application functionality post-deploy"
                    ],
                    completed: false,
                    completedAt: null,
                    completedBy: null
                  }
                ].map((item) => (
                  <div key={item.id} className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border-l-4 border-blue-400">
                    <div className="flex items-start gap-4">
                      <div className="pt-1">
                        <input 
                          type="checkbox" 
                          checked={item.completed}
                          className={`w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                            isReadOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                          disabled={isReadOnly}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="capitalize text-blue-700 border-blue-300">
                            {item.type.replace('_', ' ')}
                          </Badge>
                          {item.completed && (
                            <Badge className="bg-green-100 text-green-700">
                              ✓ Completed
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                          {item.title}
                        </h4>
                        <p className="text-sm text-muted-foreground dark:text-gray-400 mb-2">
                          {item.description}
                        </p>

                        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 mb-3">
                          <div className="text-sm">
                            <div className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                              Expected Outcome:
                            </div>
                            <div className="text-blue-700 dark:text-blue-300 mb-2">
                              {item.expectedOutcome}
                            </div>
                            <div className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                              Test Steps:
                            </div>
                            <ul className="text-blue-700 dark:text-blue-300 text-xs space-y-1">
                              {item.testSteps.map((step, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-blue-500 mt-1">•</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {item.completed && (
                          <div className="text-xs text-green-600 dark:text-green-400">
                            ✓ Completed {item.completedAt ? format(new Date(item.completedAt), 'MMM dd, yyyy') : 'recently'}
                            {item.completedBy && ` by ${item.completedBy}`}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Testing Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{testingStats.totalTests}</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Total Tests</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{testingStats.passRate}%</div>
                  <div className="text-sm text-green-600 dark:text-green-400">Pass Rate</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{testingStats.openIssues}</div>
                  <div className="text-sm text-orange-600 dark:text-orange-400">Open Issues</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{testingStats.criticalIssues}</div>
                  <div className="text-sm text-red-600 dark:text-red-400">Critical Issues</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Real Test Cases and Quality Issues */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Cases */}
            <Card className="border-blue-100 dark:border-blue-800 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                  <CheckSquare className="h-5 w-5" />
                  Test Cases
                </CardTitle>
              </CardHeader>
              <CardContent>
                {testCasesLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  </div>
                ) : testCases.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No test cases found</p>
                    <p className="text-sm">Create test cases to track testing progress</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {testCases.slice(0, 5).map((testCase) => (
                      <div key={testCase.id} className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            checked={testCase.status === 'passed'}
                            className={`rounded border-gray-300 ${
                              isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            disabled={isReadOnly}
                          />
                          <div>
                            <span className="text-sm font-medium">{testCase.title}</span>
                            <div className="text-xs text-gray-500">{testCase.category}</div>
                          </div>
                        </div>
                        <Badge variant="outline" className={
                          testCase.status === 'passed' ? "text-green-500" :
                          testCase.status === 'failed' ? "text-red-500" :
                          testCase.status === 'blocked' ? "text-orange-500" :
                          "text-yellow-500"
                        }>
                          {testCase.status}
                        </Badge>
                      </div>
                    ))}
                    {testCases.length > 5 && (
                      <div className="text-center pt-2">
                        <Button variant="ghost" size="sm">
                          View all {testCases.length} test cases
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quality Issues */}
            <Card className="border-red-100 dark:border-red-800 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-red-600 dark:text-red-400">
                  <Bug className="h-5 w-5" />
                  Quality Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                {qualityIssuesLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
                  </div>
                ) : qualityIssues.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bug className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No quality issues found</p>
                    <p className="text-sm">Great job! No issues to report</p>
                  ```tool_code
                  </div>
                ) : (
                  <div className="space-y-3">
                    {qualityIssues.slice(0, 5).map((issue) => (
                      <div key={issue.id} className="p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border-l-4 border-red-400">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium">{issue.title}</h4>
                            <p className="text-xs text-gray-500 mt-1">{issue.category}</p>
                            {issue.description && (
                              <p className="text-xs text-gray-600 mt-1">{issue.description}</p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Badge variant="outline" className={
                              issue.severity === 'critical' ? "text-red-600" :
                              issue.severity === 'high' ? "text-orange-600" :
                              issue.severity === 'medium' ? "text-yellow-600" :
                              "text-gray-600"
                            }>
                              {issue.severity}
                            </Badge>
                            <Badge variant="outline" className={
                              issue.status === 'open' ? "text-red-500" :
                              issue.status === 'in_progress' ? "text-yellow-500" :
                              issue.status === 'resolved' ? "text-green-500" :
                              "text-gray-500"
                            }>
                              {issue.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                    {qualityIssues.length > 5 && (
                      <div className="text-center pt-2">
                        <Button variant="ghost" size="sm">
                          View all {qualityIssues.length} issues
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>


        </div>
      )}

      {/* Time Tracking View */}
      {activeView === "time" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Time Tracking</h2>
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
                  <div key={project.id} className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl">
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
                      className={`w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-600 ${
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
                      className={`w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-600 ${
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
                    <div key={entry.id} className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border">
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


    </div>
  );
}