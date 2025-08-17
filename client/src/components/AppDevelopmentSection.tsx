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
  Wrench,
  Edit3,
  Save,
  X,
  Trash2,
  Activity,
  TrendingUp,
  Clock4,
  GitCommit,
  Star,
  Archive,
  CheckCircle,
  Circle,
  Eye,
  ExternalLink,
  Tag,
  Folder,
  MessageSquare
} from "lucide-react";
import { format } from "date-fns";

// Mock data generation for prompt templates
const generateMockPrompts = (): PromptTemplate[] => [
  {
    id: 1,
    title: "React Component Generator",
    description: "Generate a functional React component with TypeScript",
    category: "code_generation",
    language: "TypeScript",
    framework: "React",
    prompt: "Create a React functional component in TypeScript that:\n- Uses proper TypeScript types\n- Includes basic props interface\n- Has proper JSX structure\n- Follows modern React patterns\n\nComponent name: [COMPONENT_NAME]\nProps needed: [PROPS_LIST]",
    tags: ["react", "typescript", "component", "frontend"],
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    title: "API Endpoint Generator",
    description: "Generate Express.js API endpoint with proper error handling",
    category: "code_generation",
    language: "JavaScript",
    framework: "Express",
    prompt: "Create an Express.js API endpoint that:\n- Has proper error handling\n- Validates request data\n- Returns structured JSON responses\n- Includes appropriate HTTP status codes\n\nEndpoint: [ENDPOINT_PATH]\nMethod: [HTTP_METHOD]\nPurpose: [ENDPOINT_PURPOSE]",
    tags: ["express", "api", "backend", "javascript"],
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    title: "Database Query Optimizer",
    description: "Optimize SQL queries for better performance",
    category: "database",
    language: "SQL",
    prompt: "Analyze and optimize this SQL query:\n[QUERY]\n\nProvide:\n- Performance analysis\n- Optimization suggestions\n- Index recommendations\n- Rewritten optimized query",
    tags: ["sql", "optimization", "database", "performance"],
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 4,
    title: "Bug Debugging Assistant",
    description: "Systematic approach to debug code issues",
    category: "debugging",
    prompt: "Help debug this issue:\n\nCode: [CODE_SNIPPET]\nError: [ERROR_MESSAGE]\nExpected behavior: [EXPECTED_BEHAVIOR]\n\nProvide:\n- Root cause analysis\n- Step-by-step debugging approach\n- Possible solutions\n- Prevention strategies",
    tags: ["debugging", "troubleshooting", "error-handling"],
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 5,
    title: "Mobile-First CSS Generator",
    description: "Generate responsive CSS with mobile-first approach",
    category: "mobile",
    language: "CSS",
    prompt: "Create mobile-first responsive CSS for:\n[ELEMENT_DESCRIPTION]\n\nInclude:\n- Mobile base styles (320px+)\n- Tablet breakpoint (768px+)\n- Desktop breakpoint (1024px+)\n- Flexbox/Grid layout\n- Touch-friendly interactions",
    tags: ["css", "mobile", "responsive", "web-design"],
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 6,
    title: "Social Media Post Generator",
    description: "Generate engaging social media content for tech posts",
    category: "social_media",
    prompt: "Create social media content for:\nTopic: [TOPIC]\nPlatform: [PLATFORM]\n\nGenerate:\n- Engaging headline\n- Main content (appropriate length)\n- Relevant hashtags\n- Call-to-action\n- Visual description suggestions",
    tags: ["social-media", "content", "marketing"],
    isCustom: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

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
  priority: z.enum(["low", "medium", "high"]).optional()
});

const newPromptSchema = z.object({
  title: z.string().min(1, "Prompt title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.enum(["code_generation", "debugging", "documentation", "database", "web_design", "mobile", "social_media", "custom"]),
  language: z.string().optional(),
  framework: z.string().optional(),
  prompt: z.string().min(10, "Prompt must be at least 10 characters"),
  tags: z.string().optional()
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
type NewPromptForm = z.infer<typeof newPromptSchema>;

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
  actualHours: number;
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

// Prompt Library Interfaces
interface PromptTemplate {
  id: number;
  title: string;
  description: string;
  category: "code_generation" | "debugging" | "documentation" | "database" | "web_design" | "mobile" | "social_media" | "custom";
  language?: string;
  framework?: string;
  prompt: string;
  tags: string[];
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AppDevelopmentSection({ selectedDate, isReadOnly = false }: AppDevelopmentSectionProps) {
  const [activeView, setActiveView] = useState<"overview" | "projects" | "tasks" | "testing" | "library">("overview");
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [showTestItemForm, setShowTestItemForm] = useState(false);
  const { toast } = useToast();
  
  // Library state
  const [showNewPromptForm, setShowNewPromptForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingPrompt, setEditingPrompt] = useState<number | null>(null);
  const [editingPromptValues, setEditingPromptValues] = useState<any>({});
  
  // Enhanced UI state
  const [editingProject, setEditingProject] = useState<number | null>(null);
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [editingValues, setEditingValues] = useState<any>({});
  const [editingTaskValues, setEditingTaskValues] = useState<any>({});
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'progress' | 'priority'>('name');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [taskFilter, setTaskFilter] = useState<string>('all');

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

  // Fetch prompt templates from API (will fall back to mock data for now)
  const { data: promptTemplates = [] } = useQuery({
    queryKey: ['/api/prompt-templates'],
    select: (data: PromptTemplate[]) => data || [],
    initialData: () => generateMockPrompts() // Mock data fallback
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

  const getTaskCategoryIcon = (category: string) => {
    const icons = {
      feature: Lightbulb,
      bug: Bug,
      improvement: Wrench,
      documentation: FileText
    };
    const Icon = icons[category as keyof typeof icons] || Lightbulb;
    return <Icon className="h-4 w-4" />;
  };



  // Enhanced utility functions for editing and management
  const startEditingProject = (project: AppProject) => {
    setEditingProject(project.id);
    setEditingValues({
      name: project.name,
      description: project.description,
      status: project.status,
      priority: 'medium' // Default if not provided
    });
  };

  const startEditingTask = (task: AppTask) => {
    setEditingTask(task.id);
    setEditingTaskValues({
      title: task.title,
      description: task.description,
      status: task.status,
      category: task.category,
      priority: 'medium' // Default if not provided
    });
  };

  const saveProjectEdit = async (projectId: number) => {
    try {
      await apiRequest(`/api/app-projects/${projectId}`, 'PATCH', editingValues);
      queryClient.invalidateQueries({ queryKey: ['/api/app-projects'] });
      setEditingProject(null);
      setEditingValues({});
      toast({ title: "Success", description: "Project updated successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update project", variant: "destructive" });
    }
  };

  const saveTaskEdit = async (taskId: number) => {
    try {
      await apiRequest(`/api/app-tasks/${taskId}`, 'PATCH', editingTaskValues);
      queryClient.invalidateQueries({ queryKey: ['/api/app-tasks'] });
      setEditingTask(null);
      setEditingTaskValues({});
      toast({ title: "Success", description: "Task updated successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update task", variant: "destructive" });
    }
  };

  const cancelEdit = () => {
    setEditingProject(null);
    setEditingTask(null);
    setEditingValues({});
  };

  const cancelTaskEdit = () => {
    setEditingTask(null);
    setEditingTaskValues({});
  };

  const deleteProject = async (projectId: number) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await apiRequest(`/api/app-projects/${projectId}`, 'DELETE');
        queryClient.invalidateQueries({ queryKey: ['/api/app-projects'] });
        toast({ title: "Success", description: "Project deleted successfully" });
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete project", variant: "destructive" });
      }
    }
  };

  const deleteTask = async (taskId: number) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await apiRequest(`/api/app-tasks/${taskId}`, 'DELETE');
        queryClient.invalidateQueries({ queryKey: ['/api/app-tasks'] });
        toast({ title: "Success", description: "Task deleted successfully" });
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete task", variant: "destructive" });
      }
    }
  };

  // Sorting and filtering functions
  const sortedProjects = [...projects].sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'status': return a.status.localeCompare(b.status);
      case 'progress': return b.progress - a.progress;
      case 'priority': {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority as keyof typeof priorityOrder] || 2) - 
               (priorityOrder[a.priority as keyof typeof priorityOrder] || 2);
      }
      default: return 0;
    }
  });

  const filteredProjects = sortedProjects.filter(project => 
    filterStatus === 'all' || project.status === filterStatus
  );

  // Define derived data first
  const activeProjects = projects.filter(p => p.isActive);
  const projectTasks = selectedProject ? tasks.filter(t => t.projectId === selectedProject) : tasks;
  const testingTasks = tasks.filter(t => t.status === 'testing');

  const sortedTasks = [...projectTasks].sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.title.localeCompare(b.title);
      case 'status': return a.status.localeCompare(b.status);
      default: return 0;
    }
  });

  // Statistics calculations
  const projectStats = {
    total: projects.length,
    active: projects.filter(p => p.isActive).length,
    completed: projects.filter(p => p.status === 'deployed').length,
    inProgress: projects.filter(p => p.status === 'in_progress').length,
    avgProgress: projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) : 0,
    totalHours: projects.reduce((sum, p) => sum + p.actualHours, 0),
    estimatedHours: projects.reduce((sum, p) => sum + (p.estimatedHours || 0), 0)
  };

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    todo: tasks.filter(t => t.status === 'todo').length,
    bugs: tasks.filter(t => t.category === 'bug').length,
    features: tasks.filter(t => t.category === 'feature').length
  };

  // Enhanced task filtering
  const filteredTasks = projectTasks.filter(task => {
    if (taskFilter === 'all') return true;
    return task.status === taskFilter;
  });

  // Prompt library helper functions
  const getCategoryIcon = (category: string) => {
    const icons = {
      code_generation: Code2,
      debugging: Bug,
      documentation: FileText,
      database: Database,
      web_design: Globe,
      mobile: Smartphone,
      social_media: MessageSquare,
      custom: Settings
    };
    const Icon = icons[category as keyof typeof icons] || Code2;
    return <Icon className="h-4 w-4" />;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      code_generation: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      debugging: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", 
      documentation: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      database: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      web_design: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      mobile: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
      social_media: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
      custom: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
    };
    return colors[category as keyof typeof colors] || colors.code_generation;
  };

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
            { key: "library", label: "Library", icon: Folder }
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

      {/* Enhanced Overview Dashboard */}
      {activeView === "overview" && (
        <div className="space-y-8">
          {/* Comprehensive Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">Active Projects</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{projectStats.active}</p>
                    <p className="text-xs text-muted-foreground dark:text-gray-500">of {projectStats.total} total</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Code2 className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">Tasks Progress</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{taskStats.completed}</p>
                    <p className="text-xs text-muted-foreground dark:text-gray-500">{taskStats.inProgress} in progress</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                    <CheckSquare className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">Time Tracked</p>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{projectStats.totalHours}h</p>
                    <p className="text-xs text-muted-foreground dark:text-gray-500">
                      {projectStats.estimatedHours > 0 ? 
                        `${Math.round((projectStats.totalHours / projectStats.estimatedHours) * 100)}% of estimated` :
                        'No estimates set'
                      }
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">Avg Progress</p>
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{projectStats.avgProgress}%</p>
                    <p className="text-xs text-muted-foreground dark:text-gray-500">{taskStats.bugs} bugs reported</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Recent Projects with More Detail */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-[#4b5563] dark:text-white">
                  <Activity className="h-5 w-5" />
                  Project Portfolio Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.slice(0, 4).map((project) => (
                    <div key={project.id} className="p-4 bg-gradient-to-r from-gray-50 to-white dark:from-[#17111d]/40 dark:to-[#17111d]/60 rounded-xl border border-gray-100 dark:border-gray-700">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-lg flex items-center justify-center">
                            {getProjectIcon(project.projectType)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{project.name}</h4>
                            <p className="text-sm text-muted-foreground dark:text-gray-400 capitalize">{project.projectType} Project</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                        
                        <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock4 className="h-4 w-4 text-purple-500" />
                            <span>{project.actualHours}h logged</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <GitCommit className="h-4 w-4 text-green-500" />
                            <span>{tasks.filter(t => t.projectId === project.id).length} tasks</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-3">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedProject(project.id);
                              setActiveView('projects');
                            }}
                            disabled={isReadOnly}
                            className="text-xs"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          {project.repositoryUrl && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              disabled={isReadOnly}
                              className="text-xs"
                            >
                              <GitBranch className="h-3 w-3 mr-1" />
                              Repo
                            </Button>
                          )}
                          {project.deploymentUrl && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              disabled={isReadOnly}
                              className="text-xs"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Live
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Task Activity Feed */}
            <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-[#4b5563] dark:text-white">
                  <CheckCircle className="h-5 w-5" />
                  Recent Task Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-white dark:from-[#17111d]/40 dark:to-[#17111d]/60 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
                        {getTaskCategoryIcon(task.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{task.title}</p>
                        <p className="text-xs text-muted-foreground dark:text-gray-400">
                          {projects.find(p => p.id === task.projectId)?.name} • {task.category}
                        </p>
                      </div>
                      <Badge className={getStatusColor(task.status)} variant="outline">
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                  
                  {tasks.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <CheckSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No tasks yet. Create your first project to get started!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Productivity Insights */}
          <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-[#4b5563] dark:text-white">
                <BarChart3 className="h-5 w-5" />
                Development Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Star className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900 dark:text-blue-100">Project Health</span>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {projectStats.completed > 0 ? 
                      `${projectStats.completed} projects deployed successfully` :
                      'No projects completed yet - keep pushing forward!'
                    }
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock4 className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900 dark:text-green-100">Time Efficiency</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {projectStats.totalHours > 0 ?
                      `Average ${Math.round(projectStats.totalHours / Math.max(projectStats.active, 1))}h per active project` :
                      'Start tracking time to see efficiency metrics'
                    }
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Target className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-purple-900 dark:text-purple-100">Focus Areas</span>
                  </div>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    {taskStats.features > taskStats.bugs ?
                      `Building features (${taskStats.features} vs ${taskStats.bugs} bugs)` :
                      taskStats.bugs > 0 ?
                      `Focus on bug fixes (${taskStats.bugs} pending)` :
                      'Ready for feature development'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced Projects View */}
      {activeView === "projects" && (
        <div className="space-y-6">
          {/* Header with Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#4b5563] dark:text-white">Project Management</h2>
              <p className="text-sm text-muted-foreground dark:text-gray-400">
                {filteredProjects.length} projects • {projectStats.active} active • {projectStats.completed} completed
              </p>
            </div>
            
            {/* Controls */}
            <div className="flex gap-3">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="testing">Testing</SelectItem>
                  <SelectItem value="deployed">Deployed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                </SelectContent>
              </Select>
              
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
          </div>

          {/* Projects Table with Inline Editing */}
          <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Project
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredProjects.map((project) => (
                      <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center">
                              {getProjectIcon(project.projectType)}
                            </div>
                            <div className="flex-1 min-w-0">
                              {editingProject === project.id ? (
                                <div className="space-y-2">
                                  <Input
                                    value={editingValues.name || ''}
                                    onChange={(e) => setEditingValues({...editingValues, name: e.target.value})}
                                    className="font-semibold"
                                    placeholder="Project name"
                                  />
                                  <Textarea
                                    value={editingValues.description || ''}
                                    onChange={(e) => setEditingValues({...editingValues, description: e.target.value})}
                                    className="text-sm resize-none"
                                    rows={2}
                                    placeholder="Project description"
                                  />
                                </div>
                              ) : (
                                <div>
                                  <div className="font-semibold text-gray-900 dark:text-white">{project.name}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{project.description}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {editingProject === project.id ? (
                            <Select 
                              value={editingValues.projectType || project.projectType} 
                              onValueChange={(value) => setEditingValues({...editingValues, projectType: value})}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="web">Web App</SelectItem>
                                <SelectItem value="mobile">Mobile App</SelectItem>
                                <SelectItem value="desktop">Desktop</SelectItem>
                                <SelectItem value="api">API</SelectItem>
                                <SelectItem value="database">Database</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-sm text-gray-900 dark:text-white capitalize">
                              {project.projectType.replace('_', ' ')}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingProject === project.id ? (
                            <Select 
                              value={editingValues.status || project.status} 
                              onValueChange={(value) => setEditingValues({...editingValues, status: value})}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="planning">Planning</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="testing">Testing</SelectItem>
                                <SelectItem value="deployed">Deployed</SelectItem>
                                <SelectItem value="on_hold">On Hold</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge className={getStatusColor(project.status)}>
                              {project.status.replace('_', ' ')}
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingProject === project.id ? (
                            <Select 
                              value={editingValues.priority || project.priority} 
                              onValueChange={(value) => setEditingValues({...editingValues, priority: value})}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className={`text-sm font-medium ${
                              project.priority === 'urgent' ? 'text-red-600 dark:text-red-400' :
                              project.priority === 'high' ? 'text-orange-600 dark:text-orange-400' :
                              project.priority === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                              'text-green-600 dark:text-green-400'
                            }`}>
                              {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-purple-400 to-indigo-500 h-2 rounded-full transition-all"
                                  style={{ width: `${project.progress}%` }}
                                />
                              </div>
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[3rem]">
                              {project.progress}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {editingProject === project.id ? (
                              <div className="flex gap-1">
                                <Button 
                                  size="sm" 
                                  onClick={() => saveProjectEdit(project.id)}
                                  disabled={isReadOnly}
                                  className="bg-green-500 hover:bg-green-600 text-white"
                                >
                                  <Save className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={cancelEdit}
                                  disabled={isReadOnly}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex gap-1">
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => startEditingProject(project)}
                                  disabled={isReadOnly}
                                  className={isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}
                                >
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => deleteProject(project.id)}
                                  disabled={isReadOnly}
                                  className={`text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 ${
                                    isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                                  }`}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    
                    {/* Add New Row */}
                    <tr className="border-t-2 border-dashed border-gray-300 dark:border-gray-600">
                      <td colSpan={6} className="px-6 py-8">
                        <div className="text-center">
                          {filteredProjects.length === 0 ? (
                            <div className="py-8">
                              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Code2 className="h-8 w-8 text-white" />
                              </div>
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Projects Found</h3>
                              <p className="text-gray-500 dark:text-gray-400 mb-4">
                                {filterStatus === 'all' 
                                  ? "Click below to create your first development project"
                                  : `No projects match the current filter: ${filterStatus}`
                                }
                              </p>
                            </div>
                          ) : (
                            <div className="py-4">
                              <p className="text-gray-500 dark:text-gray-400 mb-4">
                                Add a new project to continue building
                              </p>
                            </div>
                          )}
                          <Button
                            onClick={() => setShowNewProjectForm(true)}
                            disabled={isReadOnly}
                            className="bg-gradient-to-r from-purple-400 to-indigo-500 text-white"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Project
                          </Button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced Tasks View */}
      {activeView === "tasks" && (
        <div className="space-y-6">
          {/* Header with Enhanced Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#4b5563] dark:text-white">Task Management</h2>
              <p className="text-sm text-muted-foreground dark:text-gray-400">
                {selectedProject 
                  ? `${projectTasks.length} tasks in ${projects.find(p => p.id === selectedProject)?.name || 'selected project'}` 
                  : `${tasks.length} total tasks • ${taskStats.inProgress} in progress • ${taskStats.completed} completed`
                }
              </p>
            </div>
            
            <div className="flex gap-3">
              <Select value={taskFilter} onValueChange={setTaskFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Filter tasks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="testing">Testing</SelectItem>
                  <SelectItem value="done">Completed</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                onClick={() => setShowNewTaskForm(true)}
                disabled={isReadOnly}
                className={`bg-gradient-to-r from-blue-400 to-cyan-500 text-white ${
                  isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
              
              {selectedProject && (
                <Button 
                  variant="outline"
                  onClick={() => setSelectedProject(null)}
                  disabled={isReadOnly}
                  className={isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  View All Tasks
                </Button>
              )}
            </div>
          </div>

          {/* Enhanced Task Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center">
                        {getTaskCategoryIcon(task.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        {editingTask === task.id ? (
                          <div className="space-y-2">
                            <Input
                              value={editingTaskValues.title || ''}
                              onChange={(e) => setEditingTaskValues({...editingTaskValues, title: e.target.value})}
                              className="font-semibold"
                              placeholder="Task title"
                            />
                            <Textarea
                              value={editingTaskValues.description || ''}
                              onChange={(e) => setEditingTaskValues({...editingTaskValues, description: e.target.value})}
                              className="text-sm resize-none"
                              rows={2}
                              placeholder="Task description"
                            />
                          </div>
                        ) : (
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white truncate">{task.title}</h4>
                            <p className="text-sm text-muted-foreground dark:text-gray-400 line-clamp-2">{task.description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {editingTask === task.id ? (
                        <Select 
                          value={editingTaskValues.status || task.status} 
                          onValueChange={(value) => setEditingTaskValues({...editingTaskValues, status: value})}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="testing">Testing</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={getStatusColor(task.status)}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock4 className="h-4 w-4 text-purple-500" />
                        <span className="text-muted-foreground dark:text-gray-400">Time:</span>
                        <span className="font-medium">{task.actualHours}h</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-blue-500" />
                        <span className="text-muted-foreground dark:text-gray-400">Type:</span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {task.category}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Folder className="h-4 w-4 text-green-500" />
                      <span className="text-muted-foreground dark:text-gray-400">Project:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {projects.find(p => p.id === task.projectId)?.name || 'No Project'}
                      </span>
                    </div>

                    {task.comments && editingTask !== task.id && (
                      <div className="p-3 bg-gradient-to-r from-gray-50 to-white dark:from-[#17111d]/40 dark:to-[#17111d]/60 rounded-xl border border-gray-100 dark:border-gray-700">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5" />
                          <p className="text-sm text-gray-700 dark:text-gray-300">{task.comments}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      {editingTask === task.id ? (
                        <div className="flex gap-2 w-full">
                          <Button
                            size="sm"
                            onClick={() => saveTaskEdit(task.id)}
                            disabled={isReadOnly}
                            className="bg-gradient-to-r from-green-400 to-emerald-500 text-white flex-1"
                          >
                            <Save className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelTaskEdit}
                            className="flex-1"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2 w-full">
                          <Button
                            size="sm"
                            onClick={() => startEditingTask(task)}
                            disabled={isReadOnly}
                            variant="outline"
                            className="flex-1"
                          >
                            <Edit3 className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => console.log('Timer feature removed')}
                            disabled={isReadOnly}
                            className="bg-gradient-to-r from-green-400 to-emerald-500 text-white flex-1"
                          >
                            <Timer className="h-3 w-3 mr-1" />
                            Timer
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteTask(task.id)}
                            disabled={isReadOnly}
                            className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 dark:text-red-400 dark:border-red-800"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredTasks.length === 0 && (
              <div className="col-span-full">
                <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckSquare className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Tasks Found</h3>
                    <p className="text-muted-foreground dark:text-gray-400 mb-4">
                      {taskFilter === 'all' 
                        ? selectedProject 
                          ? "No tasks in this project yet. Create your first task to get started!"
                          : "No tasks created yet. Start by adding your first development task!"
                        : `No tasks match the current filter: ${taskFilter}`
                      }
                    </p>
                    <Button
                      onClick={() => setShowNewTaskForm(true)}
                      disabled={isReadOnly}
                      className="bg-gradient-to-r from-blue-400 to-cyan-500 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Task
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
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

      {/* Library View */}
      {activeView === "library" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#4b5563] dark:text-white">Prompt Library</h2>
            <Button 
              onClick={() => setShowNewPromptForm(true)}
              disabled={isReadOnly}
              className={`bg-gradient-to-r from-purple-400 to-indigo-500 text-white ${
                isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Prompt
            </Button>
          </div>

          {/* Search and Filters */}
          <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search prompts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="code_generation">Code Generation</SelectItem>
                      <SelectItem value="debugging">Debugging</SelectItem>
                      <SelectItem value="documentation">Documentation</SelectItem>
                      <SelectItem value="database">Database</SelectItem>
                      <SelectItem value="web_design">Web Design</SelectItem>
                      <SelectItem value="mobile">Mobile</SelectItem>
                      <SelectItem value="social_media">Social Media</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Languages</SelectItem>
                      <SelectItem value="JavaScript">JavaScript</SelectItem>
                      <SelectItem value="TypeScript">TypeScript</SelectItem>
                      <SelectItem value="Python">Python</SelectItem>
                      <SelectItem value="React">React</SelectItem>
                      <SelectItem value="Node.js">Node.js</SelectItem>
                      <SelectItem value="SQL">SQL</SelectItem>
                      <SelectItem value="CSS">CSS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prompt Templates Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {promptTemplates
              .filter(template => {
                const matchesSearch = searchQuery === '' || 
                  template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
                
                const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
                const matchesLanguage = selectedLanguage === 'all' || template.language === selectedLanguage;
                
                return matchesSearch && matchesCategory && matchesLanguage;
              })
              .map((template) => (
              <Card key={template.id} className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center">
                        {getCategoryIcon(template.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{template.title}</CardTitle>
                        <p className="text-sm text-muted-foreground dark:text-gray-400">
                          {template.description}
                        </p>
                      </div>
                    </div>
                    <Badge className={getCategoryColor(template.category)}>
                      {template.category.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {template.language && (
                    <div className="flex items-center gap-2">
                      <Code2 className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">{template.language}</span>
                      {template.framework && (
                        <span className="text-sm text-muted-foreground">• {template.framework}</span>
                      )}
                    </div>
                  )}
                  
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                    <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                      {template.prompt.length > 200 ? 
                        `${template.prompt.substring(0, 200)}...` : 
                        template.prompt
                      }
                    </pre>
                  </div>

                  {template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(template.prompt)}
                      className="bg-gradient-to-r from-blue-400 to-cyan-500 text-white flex-1"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Copy Prompt
                    </Button>
                    {template.isCustom && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingPrompt(template.id);
                          setEditingPromptValues(template);
                        }}
                        disabled={isReadOnly}
                        className="flex-1"
                      >
                        <Edit3 className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {promptTemplates.length === 0 && (
              <div className="col-span-full">
                <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Folder className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Prompts Found</h3>
                    <p className="text-muted-foreground dark:text-gray-400 mb-4">
                      Start building your prompt library by adding your first template!
                    </p>
                    <Button
                      onClick={() => setShowNewPromptForm(true)}
                      disabled={isReadOnly}
                      className="bg-gradient-to-r from-purple-400 to-indigo-500 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Prompt
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
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