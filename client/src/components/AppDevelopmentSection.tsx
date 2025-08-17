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
import { format } from "date-fns";
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
  startDate: z.string().optional(),
  endDate: z.string().optional(),
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
  endDate?: string;
  completedDate?: string;
  actualHours: number;
  techStack: string[];
  priority?: "low" | "medium" | "high";
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
  const [editingTestItem, setEditingTestItem] = useState<number | null>(null);
  const [editingValues, setEditingValues] = useState<any>({});
  const [editingTaskValues, setEditingTaskValues] = useState<any>({});
  const [editingTestValues, setEditingTestValues] = useState<any>({});
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'progress' | 'priority'>('name');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [taskFilter, setTaskFilter] = useState<string>('all');
  const [selectedTestProject, setSelectedTestProject] = useState<string | null>(null);

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

  // Mock test items data (until API is implemented)
  const testItems = [
    {
      id: 1,
      title: "User Authentication Flow",
      description: "Test login/logout functionality",
      projectId: 1,
      type: "e2e",
      status: "pending",
      priority: "high"
    },
    {
      id: 2,
      title: "API Response Validation",
      description: "Verify API returns correct data format",
      projectId: 1,
      type: "integration",
      status: "in_progress",
      priority: "medium"
    }
  ];

  // Mutations
  const createProjectMutation = useMutation({
    mutationFn: (data: NewProjectForm) => 
      apiRequest('/api/app-projects', 'POST', {
        ...data,
        actualHours: 0,
        isActive: true,
        techStack: data.techStack ? data.techStack.split(',').map(s => s.trim()) : [],
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
      priority: project.priority || 'medium',
      projectType: project.projectType,
      startDate: project.startDate || '',
      endDate: project.endDate || ''
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

  // Testing functions
  const startEditingTestItem = (testItem: any) => {
    setEditingTestItem(testItem.id);
    setEditingTestValues({
      title: testItem.title,
      description: testItem.description,
      type: testItem.type,
      status: testItem.status,
      priority: testItem.priority,
      projectId: testItem.projectId
    });
  };

  const saveTestItemEdit = async (testItemId: number) => {
    try {
      // Mock implementation - in real app would call API
      setEditingTestItem(null);
      setEditingTestValues({});
      toast({ title: "Success", description: "Test item updated successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update test item", variant: "destructive" });
    }
  };

  const cancelTestEdit = () => {
    setEditingTestItem(null);
    setEditingTestValues({});
  };

  const deleteTestItem = async (testItemId: number) => {
    if (confirm('Are you sure you want to delete this test item?')) {
      try {
        // Mock implementation - in real app would call API
        toast({ title: "Success", description: "Test item deleted successfully" });
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete test item", variant: "destructive" });
      }
    }
  };

  const getTestStatusColor = (status: string) => {
    const colors = {
      pending: "bg-gray-100 text-gray-800 dark:bg-[#17111d]/30 dark:text-gray-400",
      in_progress: "bg-yellow-100 text-yellow-800 dark:bg-[#17111d]/30 dark:text-yellow-400",
      passed: "bg-green-100 text-green-800 dark:bg-[#17111d]/30 dark:text-green-400",
      failed: "bg-red-100 text-red-800 dark:bg-[#17111d]/30 dark:text-red-400",
      blocked: "bg-purple-100 text-purple-800 dark:bg-[#17111d]/30 dark:text-purple-400"
    };
    return colors[status as keyof typeof colors] || colors.pending;
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
      case 'startDate': {
        if (!a.startDate && !b.startDate) return 0;
        if (!a.startDate) return 1;
        if (!b.startDate) return -1;
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      }
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
    totalHours: projects.reduce((sum, p) => sum + p.actualHours, 0),
    withStartDate: projects.filter(p => p.startDate).length
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

  // Test items filtering
  const filteredTestItems = testItems.filter(testItem => {
    if (!selectedTestProject) return true;
    return testItem.projectId.toString() === selectedTestProject;
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
                      {projectStats.withStartDate > 0 ? 
                        `${projectStats.withStartDate} projects have start dates` :
                        'No start dates set'
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
                          <span>Start Date</span>
                          <span className="font-medium">
                            {project.startDate ? format(new Date(project.startDate), 'MMM dd') : 'Not set'}
                          </span>
                        </div>
                        
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
                  <SelectItem value="startDate">Start Date</SelectItem>
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
                        Start Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        End Date
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
                          {editingProject === project.id ? (
                            <Input
                              type="date"
                              value={editingValues.startDate || ''}
                              onChange={(e) => setEditingValues({...editingValues, startDate: e.target.value})}
                              className="w-36"
                            />
                          ) : (
                            <span className="text-sm text-gray-900 dark:text-white">
                              {project.startDate ? format(new Date(project.startDate), 'MMM dd, yyyy') : 'Not set'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingProject === project.id ? (
                            <Input
                              type="date"
                              value={editingValues.endDate || ''}
                              onChange={(e) => setEditingValues({...editingValues, endDate: e.target.value})}
                              className="w-36"
                            />
                          ) : (
                            <span className="text-sm text-gray-900 dark:text-white">
                              {project.endDate ? format(new Date(project.endDate), 'MMM dd, yyyy') : 'Not set'}
                            </span>
                          )}
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
                      <td colSpan={7} className="px-6 py-8">
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

          {/* Tasks Table with Inline Editing */}
          <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Task
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Project
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredTasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
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
                                  <div className="font-semibold text-gray-900 dark:text-white">{task.title}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{task.description}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {editingTask === task.id ? (
                            <Select 
                              value={editingTaskValues.projectId || task.projectId} 
                              onValueChange={(value) => setEditingTaskValues({...editingTaskValues, projectId: value})}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {projects.map((project) => (
                                  <SelectItem key={project.id} value={project.id}>
                                    {project.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-sm text-gray-900 dark:text-white">
                              {projects.find(p => p.id === task.projectId)?.name || 'No Project'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingTask === task.id ? (
                            <Select 
                              value={editingTaskValues.category || task.category} 
                              onValueChange={(value) => setEditingTaskValues({...editingTaskValues, category: value})}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="feature">Feature</SelectItem>
                                <SelectItem value="bug">Bug Fix</SelectItem>
                                <SelectItem value="enhancement">Enhancement</SelectItem>
                                <SelectItem value="documentation">Documentation</SelectItem>
                                <SelectItem value="testing">Testing</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge variant="outline" className="text-xs capitalize">
                              {task.category}
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingTask === task.id ? (
                            <Select 
                              value={editingTaskValues.status || task.status} 
                              onValueChange={(value) => setEditingTaskValues({...editingTaskValues, status: value})}
                            >
                              <SelectTrigger className="w-32">
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
                        </td>
                        <td className="px-6 py-4">
                          {editingTask === task.id ? (
                            <Select 
                              value={editingTaskValues.priority || task.priority} 
                              onValueChange={(value) => setEditingTaskValues({...editingTaskValues, priority: value})}
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
                              task.priority === 'urgent' ? 'text-red-600 dark:text-red-400' :
                              task.priority === 'high' ? 'text-orange-600 dark:text-orange-400' :
                              task.priority === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                              'text-green-600 dark:text-green-400'
                            }`}>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {editingTask === task.id ? (
                              <div className="flex gap-1">
                                <Button 
                                  size="sm" 
                                  onClick={() => saveTaskEdit(task.id)}
                                  disabled={isReadOnly}
                                  className="bg-green-500 hover:bg-green-600 text-white"
                                >
                                  <Save className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={cancelTaskEdit}
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
                                  onClick={() => startEditingTask(task)}
                                  disabled={isReadOnly}
                                  className={isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}
                                >
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => deleteTask(task.id)}
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
            
                    
                    {/* Add New Task Row */}
                    <tr className="border-t-2 border-dashed border-gray-300 dark:border-gray-600">
                      <td colSpan={6} className="px-6 py-8">
                        <div className="text-center">
                          {filteredTasks.length === 0 ? (
                            <div className="py-8">
                              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckSquare className="h-8 w-8 text-white" />
                              </div>
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Tasks Found</h3>
                              <p className="text-gray-500 dark:text-gray-400 mb-4">
                                {taskFilter === 'all' 
                                  ? selectedProject 
                                    ? "No tasks in this project yet. Create your first task to get started!"
                                    : "No tasks created yet. Start by adding your first development task!"
                                  : `No tasks match the current filter: ${taskFilter}`
                                }
                              </p>
                            </div>
                          ) : (
                            <div className="py-4">
                              <p className="text-gray-500 dark:text-gray-400 mb-4">
                                Add a new task to continue building
                              </p>
                            </div>
                          )}
                          <Button
                            onClick={() => setShowNewTaskForm(true)}
                            disabled={isReadOnly}
                            className="bg-gradient-to-r from-blue-400 to-cyan-500 text-white"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Task
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

      {/* Testing & QA View */}
      {activeView === "testing" && (
        <div className="space-y-6">
          {/* Header with Enhanced Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#4b5563] dark:text-white">Testing & Quality Assurance</h2>
              <p className="text-sm text-muted-foreground dark:text-gray-400">
                {selectedTestProject 
                  ? `Testing tasks for ${projects.find(p => p.id === selectedTestProject)?.name || 'selected project'}` 
                  : `${testItems.length} total test items • ${testItems.filter(t => t.status === 'in_progress').length} in progress`
                }
              </p>
            </div>
            
            <div className="flex gap-3">
              <Select value={selectedTestProject || 'all'} onValueChange={(value) => setSelectedTestProject(value === 'all' ? null : value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
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
            </div>
          </div>

          {/* Testing Items Table with Inline Editing */}
          <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Test Item
                      </th>
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
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredTestItems.map((testItem) => (
                      <tr key={testItem.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-red-400 to-orange-500 rounded-xl flex items-center justify-center">
                              <CheckSquare className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              {editingTestItem === testItem.id ? (
                                <div className="space-y-2">
                                  <Input
                                    value={editingTestValues.title || ''}
                                    onChange={(e) => setEditingTestValues({...editingTestValues, title: e.target.value})}
                                    className="font-semibold"
                                    placeholder="Test item title"
                                  />
                                  <Textarea
                                    value={editingTestValues.description || ''}
                                    onChange={(e) => setEditingTestValues({...editingTestValues, description: e.target.value})}
                                    className="text-sm resize-none"
                                    rows={2}
                                    placeholder="Test description"
                                  />
                                </div>
                              ) : (
                                <div>
                                  <div className="font-semibold text-gray-900 dark:text-white">{testItem.title}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{testItem.description}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {editingTestItem === testItem.id ? (
                            <Select 
                              value={editingTestValues.projectId || testItem.projectId} 
                              onValueChange={(value) => setEditingTestValues({...editingTestValues, projectId: value})}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {projects.map((project) => (
                                  <SelectItem key={project.id} value={project.id}>
                                    {project.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-sm text-gray-900 dark:text-white">
                              {projects.find(p => p.id === testItem.projectId)?.name || 'No Project'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingTestItem === testItem.id ? (
                            <Select 
                              value={editingTestValues.type || testItem.type} 
                              onValueChange={(value) => setEditingTestValues({...editingTestValues, type: value})}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unit">Unit Test</SelectItem>
                                <SelectItem value="integration">Integration</SelectItem>
                                <SelectItem value="e2e">End-to-End</SelectItem>
                                <SelectItem value="performance">Performance</SelectItem>
                                <SelectItem value="security">Security</SelectItem>
                                <SelectItem value="usability">Usability</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge variant="outline" className="text-xs capitalize">
                              {testItem.type}
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingTestItem === testItem.id ? (
                            <Select 
                              value={editingTestValues.status || testItem.status} 
                              onValueChange={(value) => setEditingTestValues({...editingTestValues, status: value})}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="passed">Passed</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                                <SelectItem value="blocked">Blocked</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge className={getTestStatusColor(testItem.status)}>
                              {testItem.status.replace('_', ' ')}
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingTestItem === testItem.id ? (
                            <Select 
                              value={editingTestValues.priority || testItem.priority} 
                              onValueChange={(value) => setEditingTestValues({...editingTestValues, priority: value})}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className={`text-sm font-medium ${
                              testItem.priority === 'critical' ? 'text-red-600 dark:text-red-400' :
                              testItem.priority === 'high' ? 'text-orange-600 dark:text-orange-400' :
                              testItem.priority === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                              'text-green-600 dark:text-green-400'
                            }`}>
                              {testItem.priority.charAt(0).toUpperCase() + testItem.priority.slice(1)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {editingTestItem === testItem.id ? (
                              <div className="flex gap-1">
                                <Button 
                                  size="sm" 
                                  onClick={() => saveTestItemEdit(testItem.id)}
                                  disabled={isReadOnly}
                                  className="bg-green-500 hover:bg-green-600 text-white"
                                >
                                  <Save className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={cancelTestEdit}
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
                                  onClick={() => startEditingTestItem(testItem)}
                                  disabled={isReadOnly}
                                  className={isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}
                                >
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => deleteTestItem(testItem.id)}
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
                    
                    {/* Add New Test Item Row */}
                    <tr className="border-t-2 border-dashed border-gray-300 dark:border-gray-600">
                      <td colSpan={6} className="px-6 py-8">
                        <div className="text-center">
                          {filteredTestItems.length === 0 ? (
                            <div className="py-8">
                              <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckSquare className="h-8 w-8 text-white" />
                              </div>
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Test Items Found</h3>
                              <p className="text-gray-500 dark:text-gray-400 mb-4">
                                {selectedTestProject 
                                  ? "No test items for this project yet. Create your first test item to get started!"
                                  : "No test items created yet. Start by adding your first test case!"
                                }
                              </p>
                            </div>
                          ) : (
                            <div className="py-4">
                              <p className="text-gray-500 dark:text-gray-400 mb-4">
                                Add a new test item to continue quality assurance
                              </p>
                            </div>
                          )}
                          <Button
                            onClick={() => setShowTestItemForm(true)}
                            disabled={isReadOnly}
                            className="bg-gradient-to-r from-red-400 to-orange-500 text-white"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Test Item
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

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={projectForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={projectForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
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