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
import { useAuth } from "@/hooks/useAuth";
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
  MessageSquare,
  Layers,
  ListTodo,
  Upload,
  Download,
  Paperclip,
  File,
  FileX,
  Link as LinkIcon
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
// Jira project schema
const newProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  key: z.string().min(2, "Project key is required (2-10 uppercase letters)").max(10).regex(/^[A-Z]+$/, "Project key must be uppercase letters only"),
  description: z.string().optional(),
  projectTypeKey: z.enum(["software", "service_desk", "business"]).default("software")
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
  taskCount?: number;
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

export default function AppDevelopmentSection({ selectedDate }: AppDevelopmentSectionProps) {
  // Authentication
  const { isAuthenticated, isAdmin } = useAuth();
  
  const [activeView, setActiveView] = useState<"overview" | "projects" | "tasks" | "testing" | "documentation" | "library">("overview");
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
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
  const [currentTaskPage, setCurrentTaskPage] = useState(1);
  const [tasksPerPage] = useState(10);
  const [taskFilter, setTaskFilter] = useState<string>('all');
  const [taskProjectFilter, setTaskProjectFilter] = useState<string>('all');
  const [selectedTestProject, setSelectedTestProject] = useState<string | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [modalProject, setModalProject] = useState<any>(null);

  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});

  // Fetch all projects from Jira
  const { data: jiraProjects = [], isLoading: isLoadingProjects, error: projectsError, isError: isProjectsError } = useQuery({
    queryKey: ['/api/public/jira/projects'],
    queryFn: async () => {
      const response = await fetch('/api/public/jira/projects', {
        credentials: 'include'
      });
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData.error === 'Jira integration not configured') {
          console.warn('Jira integration not configured');
          return [];
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    select: (data: any[]) => data || []
  });

  // Fetch all issues from Jira (as tasks)
  const { data: jiraIssues = [], isLoading: isLoadingTasks, error: tasksError, isError: isTasksError } = useQuery({
    queryKey: ['/api/public/jira/issues'],
    queryFn: async () => {
      const response = await fetch('/api/public/jira/issues', {
        credentials: 'include'
      });
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData.error === 'Jira integration not configured') {
          console.warn('Jira integration not configured');
          return [];
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    select: (data: any[]) => data || []
  });

  // Fetch QA Testing issues from Jira (filtered by issue type)
  const { data: jiraTestIssues = [], isLoading: isLoadingQATesting, error: qaTestingError, isError: isQATestingError } = useQuery({
    queryKey: ['/api/public/jira/issues?type=test'],
    queryFn: async () => {
      const response = await fetch('/api/public/jira/issues', {
        credentials: 'include'
      });
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData.error === 'Jira integration not configured') {
          console.warn('Jira integration not configured');
          return [];
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const allIssues = await response.json();
      // Filter for test-related issues
      return allIssues.filter((issue: any) => 
        issue.fields.issuetype.name.toLowerCase().includes('test') ||
        issue.fields.issuetype.name.toLowerCase().includes('bug') ||
        issue.fields.labels?.some((label: string) => label.toLowerCase().includes('test'))
      );
    },
    select: (data: any[]) => data || []
  });
  
  // Map Jira projects to internal format
  const projects = jiraProjects.map((project: any) => ({
    id: project.id,
    name: project.name,
    description: typeof project.description === 'object' && project.description?.content ? project.description.content : (project.description || ''),
    key: project.key,
    projectType: project.projectTypeKey,
    lead: project.lead?.displayName || '',
    url: project.self,
    avatarUrl: project.avatarUrls?.['48x48'] || '',
    category: project.projectCategory?.name || '',
    startDate: null, // Jira doesn't have start/end dates by default
    endDate: null,
    status: 'active', // Map from Jira project status if available
    priority: 'medium' // Default priority, can be customized
  }));
  
  // Use properly converted Jira data (already processed by backend)
  const tasks = jiraIssues.map((issue: any) => ({
    id: issue.jiraId || issue.id,
    key: issue.jiraKey || issue.key,
    title: issue.title,
    description: issue.description || '',
    status: issue.status,
    priority: issue.priority || 'Medium',
    projectKey: issue.projectKey,
    projectName: issue.projectName,
    assignee: issue.assignee || '',
    dueDate: issue.dueDate,
    issueType: issue.issueType,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    labels: issue.labels || [],
    storyPoints: issue.storyPoints || null
  }));
  
  // Use properly converted Jira test data (already processed by backend)
  const testItems = jiraTestIssues.map((issue: any) => ({
    id: issue.jiraId || issue.id,
    key: issue.jiraKey || issue.key,
    title: issue.title,
    name: issue.title, // Use title as name for consistency
    description: issue.description || '',
    status: issue.status,
    priority: issue.priority || 'Medium',
    projectKey: issue.projectKey,
    projectName: issue.projectName,
    testType: issue.issueType,
    assignee: issue.assignee || '',
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    labels: issue.labels || []
  }));
  
  // Keep prompt templates from AI Dev items for now
  const promptTemplates = generateMockPrompts(); // Use mock data for prompts

  const isLoading = isLoadingProjects || isLoadingTasks || isLoadingQATesting;
  const error = projectsError || tasksError || qaTestingError;
  const isError = isProjectsError || isTasksError || isQATestingError;

  // Task filtering and state management (already defined above in the enhanced UI state section)

  // Filter tasks based on current filters (handled below)

  // Task statistics (moved below to avoid duplicates)

  // Project tasks (when viewing specific project) - removed duplicate, handled below



  // Map projectType to database type values
  const mapProjectTypeToDBType = (projectType: string): string => {
    const typeMapping: Record<string, string> = {
      'web': 'web application',
      'mobile': 'mobile app', 
      'desktop': 'desktop app',
      'api': 'api backend',
      'library': 'library',
      'tool': 'tool'
    };
    return typeMapping[projectType] || 'Project';
  };

  // Create project in Jira
  const createProjectMutation = useMutation({
    mutationFn: (data: {
      name: string;
      key: string;
      projectTypeKey: string;
      description: string;
    }) => {
      console.log("📤 Creating Jira project:", data);
      return apiRequest('POST', '/api/jira/projects', data);
    },
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/public/jira/projects'] });
      toast({ 
        title: "Success", 
        description: `Jira project "${response.name}" created successfully with key ${response.key}` 
      });
      setShowNewProjectForm(false);
      projectForm.reset();
    },
    onError: (error: any) => {
      console.error("🚨 Jira project creation error:", error);
      const message = error?.message || error?.error || "Failed to create Jira project";
      
      if (message.includes("authentication") || message.includes("401")) {
        toast({ 
          title: "Authentication Required", 
          description: "Please log in as admin to create Jira projects", 
          variant: "destructive" 
        });
      } else if (message.includes("permission") || message.includes("403")) {
        toast({ 
          title: "Permission Denied", 
          description: "You don't have permission to create projects in Jira. Please check your Jira account settings.", 
          variant: "destructive" 
        });
      } else if (message.includes("not configured")) {
        toast({ 
          title: "Jira Not Configured", 
          description: "Jira integration is not properly configured. Please check your API credentials.", 
          variant: "destructive" 
        });
      } else {
        toast({ 
          title: "Error Creating Project", 
          description: message, 
          variant: "destructive" 
        });
      }
    }
  });

  // Removed duplicate Jira mutation - using single createProjectMutation above

  const createTaskMutation = useMutation({
    mutationFn: (data: NewTaskForm) => {
      console.log("🔄 Creating task with data:", data);
      return apiRequest('POST', '/api/ai-development/tasks', {
        title: data.title,
        description: data.description || '',
        category: data.category,
        status: data.status,
        priority: data.priority || 'medium',
        projectId: data.projectId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-development/tasks'] });
      toast({ title: "Success", description: "Task created successfully" });
      setShowNewTaskForm(false);
      taskForm.reset();
    },
    onError: (error: any) => {
      console.error("❌ Task creation error:", error);
      const message = error?.message || "Failed to create task";
      if (message.includes("Authentication") || message.includes("401")) {
        toast({ 
          title: "Authentication Required", 
          description: "Please log in as admin to create tasks", 
          variant: "destructive" 
        });
      } else {
        toast({ title: "Error", description: message, variant: "destructive" });
      }
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest('PATCH', `/api/ai-development/projects/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-development/projects'] });
      toast({ title: "Success", description: "Task updated successfully" });
      setEditingTask(null);
      setEditingTaskValues({});
    },
    onError: (error: any) => {
      console.error("❌ Task update error:", error);
      toast({ title: "Error", description: "Failed to update task", variant: "destructive" });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest('DELETE', `/api/ai-development/projects/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-development/projects'] });
      toast({ title: "Success", description: "Task deleted successfully" });
    },
    onError: (error: any) => {
      console.error("❌ Task deletion error:", error);
      toast({ title: "Error", description: "Failed to delete task", variant: "destructive" });
    }
  });

  const updateDocumentsMutation = useMutation({
    mutationFn: ({ projectId, documents }: { projectId: string; documents: any[] }) =>
      apiRequest('PATCH', `/api/ai-development/projects/${projectId}/documents`, { documents }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-development/projects'] });
      toast({ title: "Success", description: "Documents updated successfully" });
    },
    onError: (error: any) => {
      console.error("❌ Document update error:", error);
      toast({ title: "Error", description: "Failed to update documents", variant: "destructive" });
    }
  });

  // Form instances
  const projectForm = useForm<NewProjectForm>({
    resolver: zodResolver(newProjectSchema),
    defaultValues: {
      name: "",
      key: "",
      description: "",
      projectTypeKey: "software"
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
    if (!isAdmin) {
      toast({
        title: "Authentication Required",
        description: "Records can only be created when logged in as the admin. Please log in to continue.",
        variant: "destructive",
      });
      return;
    }
    createProjectMutation.mutate(data as any);
  };

  const onSubmitTask = (data: NewTaskForm) => {
    if (!isAdmin) {
      toast({
        title: "Authentication Required",
        description: "Records can only be created when logged in as the admin. Please log in to continue.",
        variant: "destructive",
      });
      return;
    }
    createTaskMutation.mutate(data);
  };

  // Task management functions
  const startEditingTask = (task: any) => {
    setEditingTask(task.id || task.id);
    setEditingTaskValues({
      title: task.title || task.title,
      description: task.description,
      status: task.status,
      category: task.issueType,
      priority: task.priority,
      projectId: task.projectKey
    });
  };

  const saveTaskEdit = (taskId: string) => {
    updateTaskMutation.mutate({ 
      id: taskId, 
      data: {
        ...editingTaskValues,
        name: editingTaskValues.title // Map title to name for Notion
      }
    });
  };

  const cancelTaskEdit = () => {
    setEditingTask(null);
    setEditingTaskValues({});
  };

  const deleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate(taskId);
    }
  };



  const createTestItemMutation = useMutation({
    mutationFn: (data: TestItemForm) => 
      apiRequest('POST', '/api/ai-development/projects', {
        name: data.title,
        description: data.description,
        type: 'Test Item',
        category: data.testType,
        status: 'Not Started',
        priority: data.priority,
        projectName: projects.find(p => p.key === data.projectId)?.name || '',
        testEnvironment: 'Development'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-development/projects'] });
      toast({ title: "Success", description: "Test item created successfully" });
      setShowTestItemForm(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create test item", variant: "destructive" });
    }
  });

  const onSubmitTestItem = (data: TestItemForm) => {
    if (!isAdmin) {
      toast({
        title: "Authentication Required",
        description: "Records can only be created when logged in as the admin. Please log in to continue.",
        variant: "destructive",
      });
      return;
    }
    createTestItemMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    
    // Handle original Jira statuses
    if (statusLower.includes('done') || statusLower.includes('resolved') || statusLower.includes('closed') || statusLower.includes('completed')) {
      return "bg-green-100 text-green-800 dark:bg-[#17111d]/30 dark:text-green-400";
    }
    if (statusLower.includes('progress') || statusLower.includes('development') || statusLower.includes('review')) {
      return "bg-yellow-100 text-yellow-800 dark:bg-[#17111d]/30 dark:text-yellow-400";
    }
    if (statusLower.includes('blocked') || statusLower.includes('hold')) {
      return "bg-red-100 text-red-800 dark:bg-[#17111d]/30 dark:text-red-400";
    }
    if (statusLower.includes('testing') || statusLower.includes('qa')) {
      return "bg-purple-100 text-purple-800 dark:bg-[#17111d]/30 dark:text-purple-400";
    }
    if (statusLower.includes('deployed') || statusLower.includes('live')) {
      return "bg-green-100 text-green-800 dark:bg-[#17111d]/30 dark:text-green-400";
    }
    
    // Default for todo-like statuses (including "not started", "to do", "open", etc.)
    return "bg-gray-100 text-gray-800 dark:bg-[#17111d]/30 dark:text-gray-400";
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
  const startEditingProject = (project: any) => {
    setEditingProject(project.id);
    setEditingValues({
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority || 'medium',
      type: project.projectType,
      startDate: project.startDate || '',
      endDate: project.endDate || ''
    });
  };



  const saveProjectEdit = async (projectId: string) => {
    try {
      await apiRequest('PATCH', `/api/ai-development/projects/${projectId}`, editingValues);
      queryClient.invalidateQueries({ queryKey: ['/api/ai-development/projects'] });
      setEditingProject(null);
      setEditingValues({});
      toast({ title: "Success", description: "Project updated successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update project", variant: "destructive" });
    }
  };



  const cancelEdit = () => {
    setEditingProject(null);
    setEditingTask(null);
    setEditingValues({});
  };

  const deleteProject = async (projectId: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await apiRequest('DELETE', `/api/ai-development/projects/${projectId}`);
        queryClient.invalidateQueries({ queryKey: ['/api/ai-development/projects'] });
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
      projectId: testItem.projectKey
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

  // File upload handlers for project documentation
  // Handle file upload to Object Storage, then update Notion Documents field (Admin only)
  const handleFileUpload = async (projectId: string, files: FileList) => {
    try {
      setUploadingFiles(prev => ({ ...prev, [projectId]: true }));

      // Upload each file to object storage first
      const uploadPromises = Array.from(files).map(async (file) => {
        try {
          // Get presigned URL for upload (requires admin authentication)
          const uploadResponse = await fetch('/upload/objects', {
            method: 'POST',
            credentials: 'include'
          });
          
          if (!uploadResponse.ok) {
            if (uploadResponse.status === 401 || uploadResponse.status === 403) {
              throw new Error('Admin login required to upload files');
            }
            throw new Error('Failed to get upload URL');
          }
          
          const { uploadURL } = await uploadResponse.json();
          
          // Upload file to object storage
          const fileUploadResponse = await fetch(uploadURL, {
            method: 'PUT',
            headers: {
              'Content-Type': file.type || 'application/octet-stream'
            },
            body: file
          });
          
          if (!fileUploadResponse.ok) {
            throw new Error(`Failed to upload ${file.name}`);
          }
          
          // Extract object path from upload URL for serving
          const urlObj = new URL(uploadURL);
          const objectPath = urlObj.pathname;
          
          // Create serve URL that includes the file extension
          // The upload URL structure is: /bucket-name/.private/uploads/uuid
          // We want to serve as: /objects/uploads/uuid.extension
          const pathParts = objectPath.split('/');
          const uuid = pathParts[pathParts.length - 1];
          const fileExtension = file.name.split('.').pop();
          const serveUrl = `/objects/uploads/${uuid}${fileExtension ? `.${fileExtension}` : ''}`;
          
          return {
            name: file.name,
            type: "external",
            external: {
              url: `${window.location.origin}${serveUrl}`
            }
          };
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          throw error;
        }
      });

      // Wait for all uploads to complete
      const newDocuments = await Promise.all(uploadPromises);

      // Get current project documents
      const currentProject = projects?.find((p: any) => p.id === projectId);
      const existingDocuments = currentProject?.documents || [];

      // Add new documents to existing ones
      const updatedDocuments = [...existingDocuments, ...newDocuments];

      // Update Notion Documents field
      await updateDocumentsMutation.mutateAsync({ 
        projectId, 
        documents: updatedDocuments 
      });

      setUploadingFiles(prev => ({ ...prev, [projectId]: false }));
      
      toast({ 
        title: "Success", 
        description: `Successfully uploaded ${files.length} file(s) to object storage and updated Notion` 
      });
    } catch (error: any) {
      console.error('Error uploading files:', error);
      setUploadingFiles(prev => ({ ...prev, [projectId]: false }));
      const errorMessage = error.message === 'Admin login required to upload files' 
        ? "Admin login required to upload files. Please log in to continue."
        : "Failed to upload files to storage";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  };

  const handleRemoveDocument = async (projectId: string, documentIndex: number) => {
    try {
      const currentProject = projects?.find((p: any) => p.id === projectId);
      const existingDocuments = currentProject?.documents || [];
      
      // Remove document at specified index
      const updatedDocuments = existingDocuments.filter((_: any, index: number) => index !== documentIndex);

      // Update Notion Documents field
      await updateDocumentsMutation.mutateAsync({ 
        projectId, 
        documents: updatedDocuments 
      });

      toast({ title: "Success", description: "Document removed from project" });
    } catch (error) {
      console.error('Error removing document:', error);
      toast({ title: "Error", description: "Failed to remove document", variant: "destructive" });
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type?: string) => {
    if (!type) return File;
    if (type.includes('image')) return File;
    if (type.includes('pdf')) return File;
    if (type.includes('text')) return FileText;
    return File;
  };



  // Sorting and filtering functions
  const sortedProjects = [...projects].sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'status': return a.status.localeCompare(b.status);
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
  const activeProjects = projects.filter(p => p.status === 'active');
  const testingTasks = tasks.filter(t => t.status === 'testing');

  // Apply project filter first, then selected project filter
  const baseFilteredTasks = taskProjectFilter === 'all' ? tasks : tasks.filter(t => t.projectKey === taskProjectFilter);
  const projectTasks = selectedProject ? baseFilteredTasks.filter(t => t.projectKey === selectedProject) : baseFilteredTasks;

  const sortedTasks = [...projectTasks].sort((a, b) => {
    switch (sortBy) {
      case 'name': return (a.title || '').localeCompare(b.title || '');
      case 'status': return a.status.localeCompare(b.status);
      default: return 0;
    }
  });

  // Calculate project length from dates when ProjectLength field is 0
  const getProjectLength = (project: any) => {
    if (project.projectLength && project.projectLength > 0) {
      return project.projectLength;
    }
    if (project.startDate && project.endDate) {
      const start = new Date(project.startDate);
      const end = new Date(project.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  // Statistics calculations
  const projectStats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'deployed').length,
    avgTaskCompletion: tasks.length > 0 ? Math.round(tasks.filter(t => t.status === 'done').length / tasks.length * 100) : 0,
    inProgress: projects.filter(p => p.status === 'in_progress').length,
    avgLength: projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + getProjectLength(p), 0) / projects.length) : 0,
    withStartDate: projects.filter(p => p.startDate).length
  };

  const taskStats = {
    total: baseFilteredTasks.length,
    completed: baseFilteredTasks.filter(t => t.status === 'done').length,
    inProgress: baseFilteredTasks.filter(t => t.status === 'in_progress').length,
    todo: baseFilteredTasks.filter(t => t.status === 'todo').length,
    bugs: baseFilteredTasks.filter(t => t.category === 'bug').length,
    features: baseFilteredTasks.filter(t => t.category === 'feature').length
  };

  // Enhanced task filtering
  const filteredTasks = projectTasks.filter(task => {
    if (taskFilter === 'all') return true;
    return task.status === taskFilter;
  });

  // Pagination logic for tasks
  const totalTasks = filteredTasks.length;
  const totalTaskPages = Math.ceil(totalTasks / tasksPerPage);
  const startTaskIndex = (currentTaskPage - 1) * tasksPerPage;
  const endTaskIndex = startTaskIndex + tasksPerPage;
  const paginatedTasks = filteredTasks.slice(startTaskIndex, endTaskIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentTaskPage(1);
  }, [taskFilter, taskProjectFilter]);

  // Test items filtering - use notionId to match projects
  const filteredTestItems = testItems.filter(testItem => {
    if (!selectedTestProject) return true;
    return testItem.projectKey === selectedTestProject;
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
            Building intelligent applications with AI-powered development tools and automated project workflows
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
            { key: "documentation", label: "Documentation", icon: FileText },
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
                    <p className="text-sm text-muted-foreground dark:text-gray-400">Avg Project Length</p>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{projectStats.avgLength}</p>
                    <p className="text-xs text-muted-foreground dark:text-gray-500">
                      {projectStats.total > 0 ? 
                        `based on ${projectStats.total} projects` :
                        'No projects available'
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
                    <p className="text-sm text-muted-foreground dark:text-gray-400">Avg Task Completion Rate</p>
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{projectStats.avgTaskCompletion}%</p>
                    <p className="text-xs text-muted-foreground dark:text-gray-500">{taskStats.completed} of {taskStats.total} tasks done</p>
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
                    <div key={project.id || project.id} className="p-4 bg-gradient-to-r from-gray-50 to-white dark:from-[#17111d]/40 dark:to-[#17111d]/60 rounded-xl border border-gray-100 dark:border-gray-700">
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
                        <div className="text-right">
                          <Badge className={getStatusColor(project.status)}>
                            {(project.status || 'Unknown').replace('_', ' ')}
                          </Badge>
                          <div className="text-sm mt-1">
                            <span className="text-muted-foreground">Start Date: </span>
                            <span className="font-medium">
                              {project.startDate ? format(new Date(project.startDate), 'MMM dd, yyyy') : 'Not set'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        
                        <div className="grid grid-cols-3 gap-3 mt-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock4 className="h-4 w-4 text-purple-500" />
                            <span>{getProjectLength(project)} days</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <GitCommit className="h-4 w-4 text-green-500" />
                            <span>0 tasks</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Bug className="h-4 w-4 text-orange-500" />
                            <span>{testItems.filter(t => t.projectKey === project.key).length} QA</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-3">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setModalProject(project);
                              setShowProjectModal(true);
                            }}
                            className="text-xs"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          {project.url && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => window.open(project.url, '_blank')}
                              className="text-xs"
                            >
                              <GitBranch className="h-3 w-3 mr-1" />
                              Repo
                            </Button>
                          )}
                          {false && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {/*placeholder*/}}
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

            {/* Recently Updated Projects */}
            <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg text-gray-900 dark:text-white">Recently Updated Projects</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isLoadingProjects ? (
                    <div className="text-center py-6">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500">Loading Jira projects...</p>
                    </div>
                  ) : jiraProjects && jiraProjects.length > 0 ? (
                    jiraProjects
                      .slice(0, 3) // Take first 3 projects from Jira
                      .map((project: any) => {
                        // Count related issues for this project
                        const projectIssues = jiraIssues?.filter((issue: any) => issue.projectKey === project.key) || [];
                        const completedIssues = projectIssues.filter((issue: any) => 
                          issue.status === 'completed' || issue.status === 'done' || 
                          (typeof issue.status === 'string' && issue.status.toLowerCase().includes('done'))
                        );

                        // Calculate last update time: project update time or most recent issue update
                        const getLastUpdateTime = () => {
                          // If project has update time, use that
                          if (project.updated) {
                            return new Date(project.updated);
                          }
                          
                          // Otherwise, find the most recent issue update for this project
                          const sortedIssues = projectIssues
                            .filter(issue => issue.updated)
                            .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());
                          
                          return sortedIssues.length > 0 ? new Date(sortedIssues[0].updated) : null;
                        };

                        const lastUpdateTime = getLastUpdateTime();
                        const formatLastUpdate = (date: Date | null) => {
                          if (!date) return 'No updates';
                          
                          const now = new Date();
                          const diffInMs = now.getTime() - date.getTime();
                          const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
                          const diffInDays = Math.floor(diffInHours / 24);
                          
                          if (diffInHours < 1) return 'Less than 1 hour ago';
                          if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
                          if (diffInDays < 7) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
                          
                          return date.toLocaleDateString();
                        };

                        // Function to download project documentation
                        const downloadProjectDocs = async (project: any) => {
                          try {
                            // Create documentation content
                            const docContent = `# ${project.name} Documentation
Project Key: ${project.key}
Project Type: ${project.projectTypeKey || 'Standard'}
Description: ${project.description || 'No description available'}

## Project Overview
- Total Issues: ${projectIssues.length}
- Completed Issues: ${completedIssues.length}
- Last Updated: ${formatLastUpdate(lastUpdateTime)}

## Project Issues
${projectIssues.map((issue: any, index: number) => `
${index + 1}. ${issue.title} (${issue.jiraKey})
   - Status: ${issue.status}
   - Type: ${issue.issueType}
   - Priority: ${issue.priority || 'Not set'}
   - Created: ${issue.created ? new Date(issue.created).toLocaleDateString() : 'Unknown'}
   - Updated: ${issue.updated ? new Date(issue.updated).toLocaleDateString() : 'Unknown'}
   - Description: ${issue.description || 'No description'}
`).join('')}

Generated on: ${new Date().toLocaleString()}
Generated by: Belle Journal - AI App Development & Coding
`;

                            // Create and download the file
                            const blob = new Blob([docContent], { type: 'text/markdown' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `${project.key}-documentation.md`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            URL.revokeObjectURL(url);
                          } catch (error) {
                            console.error('Error downloading documentation:', error);
                          }
                        };

                        return (
                          <div key={project.key} className="relative flex items-start gap-4 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors min-h-[120px]">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0 pr-24">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <p className="font-semibold text-base text-gray-900 dark:text-white truncate">{project.name}</p>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-4">
                                  <p className="text-sm text-muted-foreground">
                                    Progress: {completedIssues.length} / {projectIssues.length} issues completed
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="absolute top-6 right-6">
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatLastUpdate(lastUpdateTime)}
                              </p>
                            </div>
                            <div className="absolute bottom-6 right-6">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => downloadProjectDocs(project)}
                                className="text-sm h-9 px-4 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white border border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500 shadow-sm hover:shadow-md transition-all duration-200 font-semibold rounded-lg"
                              >
                                <Download className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-300" />
                                Draft Docs
                              </Button>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                      <FileX className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No Jira projects found</p>
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
                    <span className="font-medium text-green-900 dark:text-green-100">Project Length</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {projectStats.avgLength > 0 ?
                      `Average project length is ${projectStats.avgLength} days` :
                      'Set project lengths to see duration metrics'
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
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
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
                      <tr key={project.id || project.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center">
                              {getProjectIcon(project.projectType || 'web')}
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
                                  <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                    {typeof project.description === 'object' && project.description?.content ? 
                                      project.description.content : 
                                      (project.description || 'No description')
                                    }
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {editingProject === project.id ? (
                            <Select 
                              value={editingValues.type || project.projectType} 
                              onValueChange={(value) => setEditingValues({...editingValues, projectType: value})}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="web">
                                  <div className="flex flex-col">
                                    <span className="font-medium">Web App</span>
                                    <span className="text-xs text-muted-foreground">Browser-based applications</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="mobile">
                                  <div className="flex flex-col">
                                    <span className="font-medium">Mobile App</span>
                                    <span className="text-xs text-muted-foreground">iOS, Android, or cross-platform</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="desktop">
                                  <div className="flex flex-col">
                                    <span className="font-medium">Desktop App</span>
                                    <span className="text-xs text-muted-foreground">Windows, Mac, or Linux applications</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="api">
                                  <div className="flex flex-col">
                                    <span className="font-medium">API Backend</span>
                                    <span className="text-xs text-muted-foreground">Server APIs, databases, microservices</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="library">
                                  <div className="flex flex-col">
                                    <span className="font-medium">Library</span>
                                    <span className="text-xs text-muted-foreground">Reusable code packages, SDKs</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="tool">
                                  <div className="flex flex-col">
                                    <span className="font-medium">Tool</span>
                                    <span className="text-xs text-muted-foreground">CLI tools, utilities, automation scripts</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-sm text-gray-900 dark:text-white capitalize">
                              {(project.projectType || 'Unknown').replace('_', ' ')}
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
                              {(project.status || 'Unknown').replace('_', ' ')}
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
                                  className="bg-green-500 hover:bg-green-600 text-white"
                                >
                                  <Save className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={cancelEdit}
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
                                >
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => deleteProject(project.id)}
                                  className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
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
          
          {/* Admin Notice */}
          <div className="text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Records can only be created when logged in as the admin. Please log in to continue.
            </p>
          </div>
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
                  : taskProjectFilter !== 'all'
                    ? `${baseFilteredTasks.length} tasks in ${projects.find(p => p.id === taskProjectFilter)?.name || 'selected project'} • ${taskStats.inProgress} in progress • ${taskStats.completed} completed`
                    : `${baseFilteredTasks.length} total tasks • ${taskStats.inProgress} in progress • ${taskStats.completed} completed`
                }
              </p>
            </div>
            
            <div className="flex gap-3">
              <Select value={taskProjectFilter} onValueChange={setTaskProjectFilter}>
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
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('New Task button clicked, current showNewTaskForm:', showNewTaskForm);
                  console.log('Setting showNewTaskForm to true...');
                  setShowNewTaskForm(true);
                  console.log('showNewTaskForm should now be true');
                  setTimeout(() => console.log('After timeout - showNewTaskForm is:', showNewTaskForm), 100);
                }}
                className="bg-gradient-to-r from-blue-400 to-cyan-500 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
              
              {/* Jira Integration */}
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    const response = await apiRequest('POST', '/api/jira/sync/from-jira', {});
                    toast({
                      title: "Jira Sync Complete",
                      description: "Tasks imported from Jira successfully"
                    });
                    queryClient.invalidateQueries({ queryKey: ['/api/ai-development/tasks'] });
                  } catch (error: any) {
                    toast({
                      title: "Sync Failed",
                      description: error.message,
                      variant: "destructive"
                    });
                  }
                }}
                title="Import tasks from Jira"
              >
                <GitBranch className="h-4 w-4 mr-1" />
                Sync Jira
              </Button>
              
              {selectedProject && (
                <Button 
                  variant="outline"
                  onClick={() => setSelectedProject(null)}
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
                    {paginatedTasks.map((task) => (
                      <tr key={task.id || task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center">
                              {getTaskCategoryIcon(task.issueType)}
                            </div>
                            <div className="flex-1 min-w-0">
                              {editingTask === (task.id || task.id) ? (
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
                                  <div className="font-semibold text-gray-900 dark:text-white">{task.title || task.title}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{task.description || 'No description'}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {editingTask === (task.id || task.id) ? (
                            <Select 
                              value={editingTaskValues.projectId || task.projectKey} 
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
                              {projects.find(p => p.key === task.projectKey)?.name || 'No Project'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingTask === (task.id || task.id) ? (
                            <Select 
                              value={editingTaskValues.category || task.issueType} 
                              onValueChange={(value) => setEditingTaskValues({...editingTaskValues, category: value})}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="feature">Feature</SelectItem>
                                <SelectItem value="bug">Bug Fix</SelectItem>
                                <SelectItem value="improvement">Improvement</SelectItem>
                                <SelectItem value="documentation">Documentation</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge variant="outline" className="text-xs capitalize">
                              {task.issueType}
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingTask === (task.id || task.id) ? (
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
                                <SelectItem value="review">Review</SelectItem>
                                <SelectItem value="testing">Testing</SelectItem>
                                <SelectItem value="done">Done</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge className={getStatusColor(task.status)}>
                              {(task.status || 'Unknown').replace('_', ' ')}
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingTask === (task.id || task.id) ? (
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
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className={`text-sm font-medium ${
                              task.priority === 'high' ? 'text-orange-600 dark:text-orange-400' :
                              task.priority === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                              'text-green-600 dark:text-green-400'
                            }`}>
                              {(task.priority || 'medium').charAt(0).toUpperCase() + (task.priority || 'medium').slice(1)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {editingTask === (task.id || task.id) ? (
                              <div className="flex gap-1">
                                <Button 
                                  size="sm" 
                                  onClick={() => saveTaskEdit(task.id || task.id)}
                                  className="bg-green-500 hover:bg-green-600 text-white"
                                >
                                  <Save className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={cancelTaskEdit}
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
                                >
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => deleteTask(task.id || task.id)}
                                  className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
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
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Add New Task button clicked');
                              setShowNewTaskForm(true);
                            }}
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
              
              {/* Task Pagination Controls */}
              {totalTaskPages > 1 && (
                <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>
                      Showing {startTaskIndex + 1}-{Math.min(endTaskIndex, totalTasks)} of {totalTasks} tasks
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentTaskPage(currentTaskPage - 1)}
                      disabled={currentTaskPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      ‹
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalTaskPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentTaskPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentTaskPage(page)}
                          className="h-8 w-8 p-0"
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentTaskPage(currentTaskPage + 1)}
                      disabled={currentTaskPage === totalTaskPages}
                      className="h-8 w-8 p-0"
                    >
                      ›
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Admin Notice */}
          <div className="text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Records can only be created when logged in as the admin. Please log in to continue.
            </p>
          </div>
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
                className="bg-gradient-to-r from-red-400 to-orange-500 text-white"
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
                      <tr key={testItem.id || testItem.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
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
                                  <div className="font-semibold text-gray-900 dark:text-white">{testItem.name}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{testItem.description || 'No description'}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {editingTestItem === testItem.id ? (
                            <Select 
                              value={editingTestValues.projectId || testItem.projectKey} 
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
                              {projects.find(p => p.key === testItem.projectKey)?.name || testItem.projectName || 'No Project'}
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
                              {testItem.testType}
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
                              {(testItem.status || 'Unknown').replace('_', ' ')}
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
                                  className="bg-green-500 hover:bg-green-600 text-white"
                                >
                                  <Save className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={cancelTestEdit}
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
                                >
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => deleteTestItem(testItem.id)}
                                  className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
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
          
          {/* Admin Notice */}
          <div className="text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Records can only be created when logged in as the admin. Please log in to continue.
            </p>
          </div>
        </div>
      )}

      {/* Documentation View */}
      {activeView === "documentation" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-[#4b5563] dark:text-white">Project Documentation</h2>
              <p className="text-sm text-muted-foreground dark:text-gray-400">
                Documentation directly correlated with AI App Development projects
              </p>
            </div>
            <Button 
              onClick={() => setShowNewProjectForm(true)}
              className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Documentation
            </Button>
          </div>

          {/* Project Filter for Documentation */}
          <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search documentation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={selectedProject || 'all'} onValueChange={(value) => setSelectedProject(value === 'all' ? null : value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id || project.id} value={project.id || project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>


          {/* Documentation Grid */}
          <div className="grid grid-cols-1 gap-6">
            {jiraProjects
              ?.filter(project => {
                if (!searchQuery) return true;
                return project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()));
              })
              .map((project) => (
              <Card key={project.key} className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl flex items-center gap-2">
                          {project.name}
                          <Badge variant="secondary" className="text-xs">
                            {project.key}
                          </Badge>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1">
                          {project.description || 'No description available'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Project Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                          <Code2 className="h-4 w-4 text-blue-500" />
                          Project Type
                        </h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          {project.projectTypeKey || 'Standard Project'}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-green-500" />
                          Project Key
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {project.key}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                          <CheckSquare className="h-4 w-4 text-purple-500" />
                          Issues Progress
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {(() => {
                            const projectIssues = jiraIssues?.filter(issue => issue.projectKey === project.key) || [];
                            const completedIssues = projectIssues.filter(issue => 
                              issue.status === 'completed' || issue.status === 'done' || 
                              (typeof issue.status === 'string' && issue.status.toLowerCase().includes('done'))
                            );
                            return `${completedIssues.length} / ${projectIssues.length} issues completed`;
                          })()}
                        </p>
                      </div>
                    </div>

                    {/* Project Components */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <Layers className="h-4 w-4 text-orange-500" />
                        Project Components
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          const projectIssues = jiraIssues?.filter(issue => issue.projectKey === project.key) || [];
                          const uniqueComponents = [...new Set(
                            projectIssues.flatMap(issue => issue.labels || [])
                          )];
                          
                          if (uniqueComponents.length === 0) {
                            return <p className="text-xs text-muted-foreground">No components labeled</p>;
                          }
                          
                          return uniqueComponents.slice(0, 5).map((component, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {component}
                            </Badge>
                          ));
                        })()}
                      </div>
                    </div>

                    {/* Related Epics from Jira */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <ListTodo className="h-4 w-4 text-pink-500" />
                        Related Epics ({(() => {
                          // Filter for any epics from current project - broader search
                          const relatedEpics = jiraIssues?.filter(issue => {
                            // Look for Epic type OR any issue type that could be epic-related
                            const issueType = issue.issueType?.toLowerCase() || '';
                            const title = issue.title?.toLowerCase() || '';
                            const isEpic = issueType === 'epic' || 
                                          issueType.includes('epic') ||
                                          title.includes('epic') ||
                                          issueType === 'initiative' ||
                                          issueType === 'theme';
                            return isEpic && issue.projectKey === project.key;
                          }).sort((a, b) => {
                            // ORDER BY created DESC
                            const dateA = new Date(a.created || 0);
                            const dateB = new Date(b.created || 0);
                            return dateB.getTime() - dateA.getTime();
                          }) || [];
                          
                          return relatedEpics.length;
                        })()})
                      </h4>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {(() => {
                          // Filter for any epics from current project
                          const relatedEpics = jiraIssues?.filter(issue => {
                            // Look for Epic type OR issues that contain 'epic' in the type name
                            const issueType = issue.issueType?.toLowerCase() || '';
                            const isEpic = issueType === 'epic' || issueType.includes('epic');
                            return isEpic && issue.projectKey === project.key;
                          }).sort((a, b) => {
                            // ORDER BY created DESC
                            const dateA = new Date(a.created || 0);
                            const dateB = new Date(b.created || 0);
                            return dateB.getTime() - dateA.getTime();
                          }) || [];
                          
                          if (relatedEpics.length === 0) {
                            // Only show debug info for RDOC project, simple message for others
                            if (project.key === 'RDOC') {
                              // Debug: Show what issue types are actually available for this project
                              const projectIssues = jiraIssues?.filter(i => i.projectKey === project.key) || [];
                              const allProjects = [...new Set(jiraIssues?.map(i => i.projectKey) || [])];
                              const availableTypes = [...new Set(projectIssues.map(i => i.issueType))];
                              
                              return (
                                <div className="text-center py-2">
                                  <p className="text-xs text-muted-foreground">
                                    No epics found for this project
                                  </p>
                                  <div className="text-xs text-gray-500 mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                    <div><strong>Debug Info:</strong></div>
                                    <div>Current Project: {project.key}</div>
                                    <div>All Available Projects: {allProjects.join(', ') || 'None'}</div>
                                    <div>Issues in {project.key}: {projectIssues.length}</div>
                                    <div>Types in {project.key}: {availableTypes.join(', ') || 'None'}</div>
                                    {projectIssues.length > 0 && (
                                      <div className="mt-1">
                                        Sample: {projectIssues[0]?.title} (Type: {projectIssues[0]?.issueType})
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            } else {
                              // Simple empty message for non-RDOC projects
                              return (
                                <div className="text-center py-2">
                                  <p className="text-xs text-muted-foreground">
                                    No related epics
                                  </p>
                                </div>
                              );
                            }
                          }
                          
                          return (
                            <>
                              {relatedEpics.slice(0, 3).map((epic) => (
                                <div key={epic.key || epic.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded text-xs">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <Badge variant="secondary" className="text-xs">
                                      {epic.key || epic.jiraKey}
                                    </Badge>
                                    <span className="font-medium truncate">{epic.title}</span>
                                  </div>
                                  <Badge className={getStatusColor(epic.status)} variant="outline">
                                    {(epic.status || 'Unknown').replace('_', ' ')}
                                  </Badge>
                                </div>
                              ))}
                              {relatedEpics.length > 3 && (
                                <p className="text-xs text-muted-foreground text-center">
                                  ... and {relatedEpics.length - 3} more epics
                                </p>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setModalProject(project);
                          setShowProjectModal(true);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-3 w-3" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Empty State */}
            {projects.length === 0 && (
              <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Documentation Available</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Start by creating projects in the Projects tab to generate documentation automatically.
                  </p>
                  <Button
                    onClick={() => setActiveView("projects")}
                    className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white"
                  >
                    <Code2 className="h-4 w-4 mr-2" />
                    Go to Projects
                  </Button>
                </CardContent>
              </Card>
            )}
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
              className="bg-gradient-to-r from-purple-400 to-indigo-500 text-white"
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
                  template.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
                
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
                          {typeof template.description === 'object' && template.description?.content ? 
                            template.description.content : 
                            (template.description || 'No description')
                          }
                        </p>
                      </div>
                    </div>
                    <Badge className={getCategoryColor(template.category)}>
                      {(template.category || 'Unknown').replace('_', ' ')}
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
                      {template.tags.map((tag: string, index: number) => (
                        <Badge key={`${template.id}-tag-${index}`} variant="outline" className="text-xs">
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
          
          {/* Admin Notice */}
          <div className="text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Records can only be created when logged in as the admin. Please log in to continue.
            </p>
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
                          <SelectItem value="web">
                            <div className="flex flex-col">
                              <span className="font-medium">Web Application</span>
                              <span className="text-xs text-muted-foreground">Browser-based applications, websites</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="mobile">
                            <div className="flex flex-col">
                              <span className="font-medium">Mobile App</span>
                              <span className="text-xs text-muted-foreground">iOS, Android, React Native, Flutter</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="desktop">
                            <div className="flex flex-col">
                              <span className="font-medium">Desktop App</span>
                              <span className="text-xs text-muted-foreground">Electron, native Windows/Mac/Linux apps</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="api">
                            <div className="flex flex-col">
                              <span className="font-medium">API Backend</span>
                              <span className="text-xs text-muted-foreground">REST APIs, GraphQL, databases, servers</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="library">
                            <div className="flex flex-col">
                              <span className="font-medium">Library</span>
                              <span className="text-xs text-muted-foreground">NPM packages, Python libraries, SDKs</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="tool">
                            <div className="flex flex-col">
                              <span className="font-medium">Tool</span>
                              <span className="text-xs text-muted-foreground">CLI tools, build scripts, automation</span>
                            </div>
                          </SelectItem>
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

      {/* Jira Project Creation Dialog - Removed as we are using single form */}
      {/* <Dialog open={false} onOpenChange={() => {}}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-blue-600 dark:text-blue-400">Create Jira Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const projectData = {
              name: formData.get('name') as string,
              key: formData.get('key') as string,
              projectTypeKey: formData.get('projectTypeKey') as string || 'business',
              description: formData.get('description') as string || '',
            };
            
            console.log('Form submission data:', projectData);
            createJiraProjectMutation.mutate(projectData);
          }} className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="jira-name">Project Name</Label>
                <Input 
                  id="jira-name"
                  name="name"
                  placeholder="My New Project" 
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="jira-key">Project Key</Label>
                <Input 
                  id="jira-key"
                  name="key"
                  placeholder="MNP" 
                  maxLength={10}
                  required
                  className="uppercase"
                  onChange={(e) => e.target.value = e.target.value.toUpperCase()}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  2-10 uppercase letters, will be used as issue prefix (e.g., MNP-1)
                </p>
              </div>
              
              <div>
                <Label htmlFor="jira-type">Project Type</Label>
                <input type="hidden" name="projectTypeKey" id="projectTypeKey-hidden" defaultValue="business" />
                <Select 
                  defaultValue="business"
                  onValueChange={(value) => {
                    const hiddenInput = document.getElementById('projectTypeKey-hidden') as HTMLInputElement;
                    if (hiddenInput) hiddenInput.value = value;
                  }}
                >
                  <SelectTrigger id="jira-type">
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business">
                      <div className="flex flex-col">
                        <span className="font-medium">Business</span>
                        <span className="text-xs text-muted-foreground">For business teams and projects</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="software">
                      <div className="flex flex-col">
                        <span className="font-medium">Software</span>
                        <span className="text-xs text-muted-foreground">For software development teams</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="jira-description">Description (Optional)</Label>
                <Textarea 
                  id="jira-description"
                  name="description"
                  placeholder="Describe your project..." 
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button 
                type="submit" 
                disabled={createJiraProjectMutation.isPending}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
              >
                {createJiraProjectMutation.isPending ? (
                  <>
                    <Activity className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <GitBranch className="h-4 w-4 mr-2" />
                    Create Jira Project
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {}}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog> */}

      {/* New Task Form Modal */}
      <Dialog open={showNewTaskForm} onOpenChange={setShowNewTaskForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-blue-600 dark:text-blue-400">
              Create New Task
            </DialogTitle>
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
                          {projects.map((project, index) => (
                            <SelectItem key={project.id || `task-project-${index}`} value={project.id || index.toString()}>
                              {project.name || 'Untitled Project'}
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
                          {projects.map((project, index) => (
                            <SelectItem key={project.id || `test-project-${index}`} value={(project.id || index).toString()}>
                              {project.name || 'Untitled Project'}
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

      {/* Project Details Modal */}
      <Dialog open={showProjectModal} onOpenChange={setShowProjectModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-600 dark:text-purple-400 flex items-center gap-3">
              <Folder className="h-6 w-6" />
              {modalProject?.name || 'Project Details'}
            </DialogTitle>
            <p className="text-sm text-muted-foreground dark:text-gray-400">
              Read-only view of project information
            </p>
          </DialogHeader>
          
          {modalProject && (
            <div className="space-y-6">
              {/* Project Header */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{modalProject.name}</h3>
                    <p className="text-sm text-muted-foreground dark:text-gray-400 capitalize mt-1">
                      {modalProject.projectType} Project
                    </p>
                  </div>
                  <Badge className={getStatusColor(modalProject.status)}>
                    {(modalProject.status || 'Unknown').replace('_', ' ')}
                  </Badge>
                </div>
                
                {modalProject.description && (
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {typeof modalProject.description === 'object' && modalProject.description?.content ? 
                      modalProject.description.content : 
                      (modalProject.description || 'No description')
                    }
                  </p>
                )}
                
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Clock4 className="h-4 w-4 text-purple-500" />
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {getProjectLength(modalProject)} days
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <GitCommit className="h-4 w-4 text-green-500" />
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        { 0}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Tasks</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Bug className="h-4 w-4 text-orange-500" />
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {testItems.filter(t => t.projectKey === modalProject.key).length}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">QA Items</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                        {modalProject.priority || 'Medium'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Priority</p>
                  </div>
                </div>
              </div>

              {/* Project Dates */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-white/50 dark:bg-gray-800/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      Project Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Start Date:</span>
                      <span className="text-sm font-medium">
                        {modalProject.startDate ? format(new Date(modalProject.startDate), 'MMM dd, yyyy') : 'Not set'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">End Date:</span>
                      <span className="text-sm font-medium">
                        {modalProject.endDate ? format(new Date(modalProject.endDate), 'MMM dd, yyyy') : 'Not set'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Target Date:</span>
                      <span className="text-sm font-medium">
                        {modalProject.targetDate ? format(new Date(modalProject.targetDate), 'MMM dd, yyyy') : 'Not set'}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/50 dark:bg-gray-800/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Code2 className="h-4 w-4 text-green-500" />
                      Technical Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Tech Stack:</span>
                      <span className="text-sm font-medium">
                        {modalProject.techStack || 'Not specified'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Is Active:</span>
                      <Badge variant={modalProject.status === 'active' ? "default" : "secondary"}>
                        {modalProject.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Project Length:</span>
                      <span className="text-sm font-medium">
                        {modalProject.projectLength ? `${modalProject.projectLength} days` : 'Calculated'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Project Links */}
              {modalProject.url && (
                <Card className="bg-white/50 dark:bg-gray-800/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-purple-500" />
                      Project Links
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3">
                      {modalProject.url && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(modalProject.url, '_blank')}
                          className="flex items-center gap-2"
                        >
                          <GitBranch className="h-4 w-4" />
                          View Repository
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                      {false && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {/*placeholder*/}}
                          className="flex items-center gap-2"
                        >
                          <Globe className="h-4 w-4" />
                          View Live Site
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Project Tags */}
              {modalProject.tags && modalProject.tags.length > 0 && (
                <Card className="bg-white/50 dark:bg-gray-800/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Tag className="h-4 w-4 text-indigo-500" />
                      Tags
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {modalProject.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Project Documents - Simple Attach Files Button */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-3">
                  <Paperclip className="h-5 w-5 text-blue-500" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Project Documents</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Attach documentation and resources</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    multiple
                    accept="*/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileUpload(modalProject.id, e.target.files);
                        e.target.value = ''; // Reset input
                      }
                    }}
                    className="hidden"
                    id={`file-upload-${modalProject.id}`}
                  />
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      const input = document.getElementById(`file-upload-${modalProject.id}`) as HTMLInputElement;
                      input?.click();
                    }}
                    disabled={uploadingFiles[modalProject.id]}
                    className="h-8 px-3 text-sm bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {uploadingFiles[modalProject.id] ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Attach Files
                      </>
                    )}
                  </Button>
                </div>
              </div>


              {/* Related Epics from Jira */}
              <Card className="bg-white/50 dark:bg-gray-800/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <ListTodo className="h-4 w-4 text-pink-500" />
                    Related Epics ({(() => {
                      // Filter for any epics from current project
                      const relatedEpics = jiraIssues?.filter(issue => {
                        // Look for Epic type OR issues that contain 'epic' in the type name
                        const issueType = issue.issueType?.toLowerCase() || '';
                        const isEpic = issueType === 'epic' || issueType.includes('epic');
                        return isEpic && issue.projectKey === modalProject.key;
                      }).sort((a, b) => {
                        // ORDER BY created DESC
                        const dateA = new Date(a.created || 0);
                        const dateB = new Date(b.created || 0);
                        return dateB.getTime() - dateA.getTime();
                      }) || [];
                      
                      return relatedEpics.length;
                    })()})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {(() => {
                      // Filter for any epics from current project
                      const relatedEpics = jiraIssues?.filter(issue => {
                        // Look for Epic type OR issues that contain 'epic' in the type name
                        const issueType = issue.issueType?.toLowerCase() || '';
                        const isEpic = issueType === 'epic' || issueType.includes('epic');
                        return isEpic && issue.projectKey === modalProject.key;
                      }).sort((a, b) => {
                        // ORDER BY created DESC
                        const dateA = new Date(a.created || 0);
                        const dateB = new Date(b.created || 0);
                        return dateB.getTime() - dateA.getTime();
                      }) || [];
                      
                      if (relatedEpics.length === 0) {
                        // Only show debug info for RDOC project, simple message for others
                        if (modalProject.key === 'RDOC') {
                          // Debug: Show what issue types are actually available for this project
                          const projectIssues = jiraIssues?.filter(i => i.projectKey === modalProject.key) || [];
                          const allProjects = [...new Set(jiraIssues?.map(i => i.projectKey) || [])];
                          const availableTypes = [...new Set(projectIssues.map(i => i.issueType))];
                          
                          return (
                            <div className="text-center py-4">
                              <p className="text-sm text-muted-foreground">
                                No epics found for this project
                              </p>
                              <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                <div><strong>Debug Info:</strong></div>
                                <div>Current Project: {modalProject.key}</div>
                                <div>All Available Projects: {allProjects.join(', ') || 'None'}</div>
                                <div>Issues in {modalProject.key}: {projectIssues.length}</div>
                                <div>Types in {modalProject.key}: {availableTypes.join(', ') || 'None'}</div>
                                {projectIssues.length > 0 && (
                                  <div className="mt-1">
                                    Sample: {projectIssues[0]?.title} (Type: {projectIssues[0]?.issueType})
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        } else {
                          // Simple empty message for non-RDOC projects
                          return (
                            <div className="text-center py-4">
                              <p className="text-sm text-muted-foreground">
                                No related epics
                              </p>
                            </div>
                          );
                        }
                      }
                      
                      return (
                        <>
                          {relatedEpics.slice(0, 5).map((epic) => (
                            <div key={epic.key || epic.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Badge variant="secondary" className="text-xs">
                                  {epic.key || epic.jiraKey}
                                </Badge>
                                <span className="text-sm font-medium truncate">{epic.title}</span>
                              </div>
                              <Badge className={getStatusColor(epic.status)} variant="outline">
                                {(epic.status || 'Unknown').replace('_', ' ')}
                              </Badge>
                            </div>
                          ))}
                          {relatedEpics.length > 5 && (
                            <p className="text-xs text-muted-foreground text-center">
                              ... and {relatedEpics.length - 5} more epics
                            </p>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}