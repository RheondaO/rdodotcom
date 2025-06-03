import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

interface AppProject {
  id: number;
  name: string;
  description: string;
  status: "planning" | "in_progress" | "testing" | "deployed" | "on_hold";
  priority: "low" | "medium" | "high" | "urgent";
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
  tags: string[];
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
  priority: "low" | "medium" | "high" | "urgent";
  category: "feature" | "bug" | "improvement" | "documentation";
  assignee?: string;
  estimatedHours?: number;
  actualHours: number;
  dueDate?: string;
  completedDate?: string;
  dependencies: string[];
  tags: string[];
  attachments: string[];
  comments: string;
  createdAt: string;
  updatedAt: string;
}

interface AppDevelopmentSectionProps {
  selectedDate: Date;
}

export default function AppDevelopmentSection({ selectedDate }: AppDevelopmentSectionProps) {
  const [activeView, setActiveView] = useState<"overview" | "projects" | "tasks" | "testing" | "time">("overview");
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);

  // Mock data - in real app would come from API
  const projects: AppProject[] = [
    {
      id: 1,
      name: "Professional Portfolio",
      description: "Personal portfolio website showcasing my development skills and projects",
      status: "in_progress",
      priority: "high",
      projectType: "web",
      repositoryUrl: "https://github.com/yourusername/portfolio",
      deploymentUrl: "https://yourportfolio.com",
      targetDate: "2025-07-15",
      startDate: "2025-05-01",
      progress: 75,
      estimatedHours: 120,
      actualHours: 85,
      techStack: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Framer Motion"],
      tags: ["portfolio", "frontend", "responsive"],
      isActive: true,
      createdAt: "2025-05-01T00:00:00Z",
      updatedAt: "2025-06-03T10:30:00Z"
    },
    {
      id: 2,
      name: "Really Obvious Media Lab",
      description: "Creative media laboratory website with interactive features and content management",
      status: "in_progress",
      priority: "medium",
      projectType: "web",
      repositoryUrl: "https://github.com/yourusername/media-lab",
      deploymentUrl: "https://reallyobviousmedialab.net",
      targetDate: "2025-08-30",
      startDate: "2025-04-15",
      progress: 60,
      estimatedHours: 200,
      actualHours: 110,
      techStack: ["Vue.js", "Node.js", "PostgreSQL", "Express", "GSAP"],
      tags: ["media", "creative", "cms", "animation"],
      isActive: true,
      createdAt: "2025-04-15T00:00:00Z",
      updatedAt: "2025-06-03T09:15:00Z"
    },
    {
      id: 3,
      name: "Belle Journal App",
      description: "Comprehensive life management application with habit tracking and analytics",
      status: "planning",
      priority: "medium",
      projectType: "web",
      progress: 25,
      estimatedHours: 300,
      actualHours: 45,
      techStack: ["React", "TypeScript", "Vite", "Tailwind CSS", "Drizzle ORM"],
      tags: ["productivity", "health", "habits", "analytics"],
      isActive: true,
      createdAt: "2025-06-01T00:00:00Z",
      updatedAt: "2025-06-03T12:00:00Z"
    }
  ];

  const tasks: AppTask[] = [
    {
      id: 1,
      projectId: 1,
      title: "Implement responsive navigation",
      description: "Create a mobile-friendly navigation menu with smooth animations",
      status: "done",
      priority: "high",
      category: "feature",
      estimatedHours: 8,
      actualHours: 6,
      completedDate: "2025-05-15",
      dependencies: [],
      tags: ["navigation", "responsive", "animation"],
      attachments: [],
      comments: "Successfully implemented with hamburger menu",
      createdAt: "2025-05-01T00:00:00Z",
      updatedAt: "2025-05-15T14:30:00Z"
    },
    {
      id: 2,
      projectId: 1,
      title: "Add project showcase section",
      description: "Design and implement a grid layout for showcasing portfolio projects",
      status: "in_progress",
      priority: "high",
      category: "feature",
      estimatedHours: 12,
      actualHours: 8,
      dueDate: "2025-06-10",
      dependencies: [],
      tags: ["showcase", "grid", "portfolio"],
      attachments: [],
      comments: "Working on interactive hover effects",
      createdAt: "2025-05-16T00:00:00Z",
      updatedAt: "2025-06-03T11:00:00Z"
    },
    {
      id: 3,
      projectId: 2,
      title: "Set up content management system",
      description: "Implement CMS for managing media content and blog posts",
      status: "todo",
      priority: "medium",
      category: "feature",
      estimatedHours: 20,
      actualHours: 0,
      dueDate: "2025-06-20",
      dependencies: [],
      tags: ["cms", "content", "admin"],
      attachments: [],
      comments: "",
      createdAt: "2025-04-20T00:00:00Z",
      updatedAt: "2025-04-20T00:00:00Z"
    }
  ];

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

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "text-gray-500",
      medium: "text-blue-500",
      high: "text-orange-500",
      urgent: "text-red-500"
    };
    return colors[priority as keyof typeof colors] || colors.medium;
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

  const activeProjects = projects.filter(p => p.isActive);
  const projectTasks = selectedProject ? tasks.filter(t => t.projectId === selectedProject) : tasks;

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
      },
      {
        id: 2,
        area: "Visual Design",
        issue: "Color contrast insufficient for accessibility",
        severity: "high",
        project: "Really Obvious Media Lab",
        status: "in_progress",
        dateFound: "2025-06-01",
        resolution: "Updating color palette to meet WCAG guidelines",
        testSteps: ["Run accessibility audit", "Test with color blindness simulator", "Verify contrast ratios"]
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
      },
      {
        id: 2,
        category: "SEO",
        description: "Meta descriptions missing on key pages",
        impact: "Poor search engine visibility",
        project: "Really Obvious Media Lab",
        priority: "medium",
        discoveredDuring: "SEO audit",
        solution: "Add dynamic meta descriptions"
      }
    ],
    testChecklist: [
      { category: "Functionality", items: ["All forms submit correctly", "Navigation works on all pages", "Search functionality accurate", "User authentication secure"] },
      { category: "Design", items: ["Responsive on all devices", "Color contrast accessible", "Typography consistent", "Loading states present"] },
      { category: "Performance", items: ["Page load under 3 seconds", "Images optimized", "Code minified", "CDN implemented"] },
      { category: "SEO", items: ["Meta tags complete", "Alt text on images", "Structured data", "Sitemap generated"] },
      { category: "Accessibility", items: ["Keyboard navigation", "Screen reader compatible", "Focus indicators", "ARIA labels"] },
      { category: "Security", items: ["HTTPS enabled", "Input validation", "XSS protection", "Data encryption"] }
    ]
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
                        <Badge variant="outline" className={getPriorityColor(project.priority)}>
                          {project.priority}
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
                          {project.techStack.map((tech, index) => (
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
                          className="bg-gradient-to-r from-purple-400 to-indigo-500 text-white"
                        >
                          View Details
                        </Button>
                        {project.repositoryUrl && (
                          <Button size="sm" variant="outline">
                            <GitBranch className="h-4 w-4 mr-1" />
                            Repository
                          </Button>
                        )}
                        {project.deploymentUrl && (
                          <Button size="sm" variant="outline">
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h2>
            <Button 
              onClick={() => setShowNewProjectForm(true)}
              className="bg-gradient-to-r from-purple-400 to-indigo-500 text-white"
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
                      <span className="text-muted-foreground dark:text-gray-400">Priority:</span>
                      <Badge variant="outline" className={`ml-1 ${getPriorityColor(project.priority)}`}>
                        {project.priority}
                      </Badge>
                    </div>
                  </div>

                  {project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.techStack.slice(0, 3).map((tech, index) => (
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
                      className="bg-gradient-to-r from-purple-400 to-indigo-500 text-white"
                    >
                      Manage
                    </Button>
                    <Button size="sm" variant="outline">
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
                className="bg-gradient-to-r from-purple-400 to-indigo-500 text-white"
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
                      <Badge variant="outline" className={getPriorityColor(task.priority)}>
                        {task.priority}
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
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Testing & Quality Assurance</h2>
            <Button className="bg-gradient-to-r from-red-400 to-orange-500 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Log Issue
            </Button>
          </div>

          {/* Design Gaps Tracking */}
          <Card className="border-red-100 dark:border-red-800 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
                Design Gaps & Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testingTemplate.designGaps.map((gap) => (
                  <div key={gap.id} className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border-l-4 border-red-400">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{gap.issue}</h4>
                        <p className="text-sm text-muted-foreground dark:text-gray-400">{gap.area} • {gap.project}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={
                          gap.severity === "high" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                          gap.severity === "medium" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" :
                          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        }>
                          {gap.severity}
                        </Badge>
                        <Badge variant="outline" className={
                          gap.status === "identified" ? "text-orange-500" :
                          gap.status === "in_progress" ? "text-blue-500" :
                          "text-green-500"
                        }>
                          {gap.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground dark:text-gray-400">Found:</span>
                        <span className="ml-1 font-medium">{format(new Date(gap.dateFound), 'MMM dd, yyyy')}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground dark:text-gray-400">Test Steps:</span>
                        <span className="ml-1 font-medium">{gap.testSteps.length} defined</span>
                      </div>
                    </div>

                    {gap.resolution && (
                      <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/30 rounded text-sm">
                        <span className="text-blue-600 dark:text-blue-400 font-medium">Resolution:</span>
                        <span className="ml-1">{gap.resolution}</span>
                      </div>
                    )}

                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <CheckSquare className="h-4 w-4 mr-1" />
                        Test Steps
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Development Oversights */}
          <Card className="border-orange-100 dark:border-orange-800 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-orange-600 dark:text-orange-400">
                <Lightbulb className="h-5 w-5" />
                Development Oversights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testingTemplate.oversights.map((oversight) => (
                  <div key={oversight.id} className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border-l-4 border-orange-400">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{oversight.description}</h4>
                        <p className="text-sm text-muted-foreground dark:text-gray-400">{oversight.category} • {oversight.project}</p>
                      </div>
                      <Badge className={
                        oversight.priority === "high" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                        oversight.priority === "medium" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" :
                        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      }>
                        {oversight.priority}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground dark:text-gray-400">Impact:</span>
                        <span className="ml-1">{oversight.impact}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground dark:text-gray-400">Discovered During:</span>
                        <span className="ml-1">{oversight.discoveredDuring}</span>
                      </div>
                      <div className="p-2 bg-green-50 dark:bg-green-950/30 rounded">
                        <span className="text-green-600 dark:text-green-400 font-medium">Solution:</span>
                        <span className="ml-1">{oversight.solution}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline">
                        Assign Task
                      </Button>
                      <Button size="sm" variant="outline">
                        Mark Resolved
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Development Testing Checklist */}
          <Card className="border-green-100 dark:border-green-800 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-green-600 dark:text-green-400">
                <CheckSquare className="h-5 w-5" />
                AI Development Testing Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testingTemplate.testChecklist.map((category, index) => (
                  <div key={index} className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                        <CheckSquare className="h-3 w-3 text-white" />
                      </div>
                      {category.category}
                    </h4>
                    <div className="space-y-2">
                      {category.items.map((item, itemIndex) => (
                        <label key={itemIndex} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-1 rounded">
                          <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                          <span className="text-gray-600 dark:text-gray-300">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI-Specific Testing Areas */}
          <Card className="border-purple-100 dark:border-purple-800 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                <Code2 className="h-5 w-5" />
                AI-Assisted Development Considerations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Code Quality Checks</h4>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-1 rounded">
                      <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                      <span className="text-gray-600 dark:text-gray-300">AI-generated code reviewed for logic errors</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-1 rounded">
                      <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                      <span className="text-gray-600 dark:text-gray-300">Variable names and functions are meaningful</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-1 rounded">
                      <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                      <span className="text-gray-600 dark:text-gray-300">No unused imports or variables</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-1 rounded">
                      <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                      <span className="text-gray-600 dark:text-gray-300">Error handling is comprehensive</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Integration Testing</h4>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-1 rounded">
                      <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                      <span className="text-gray-600 dark:text-gray-300">Components work together seamlessly</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-1 rounded">
                      <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                      <span className="text-gray-600 dark:text-gray-300">API endpoints return expected data</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-1 rounded">
                      <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                      <span className="text-gray-600 dark:text-gray-300">State management is consistent</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-1 rounded">
                      <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                      <span className="text-gray-600 dark:text-gray-300">Navigation flows are logical</span>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Testing Progress Summary */}
          <Card className="border-blue-100 dark:border-blue-800 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                <BarChart3 className="h-5 w-5" />
                Testing Progress Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
                    {testingTemplate.designGaps.length}
                  </div>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">Design Gaps Identified</p>
                  <div className="mt-2">
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                      {testingTemplate.designGaps.filter(g => g.severity === 'high').length} High Priority
                    </Badge>
                  </div>
                </div>

                <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                    {testingTemplate.oversights.length}
                  </div>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">Development Oversights</p>
                  <div className="mt-2">
                    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                      {testingTemplate.oversights.filter(o => o.priority === 'high').length} High Priority
                    </Badge>
                  </div>
                </div>

                <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {testingTemplate.testChecklist.reduce((sum, cat) => sum + cat.items.length, 0)}
                  </div>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">Total Test Items</p>
                  <div className="mt-2">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      {testingTemplate.testChecklist.length} Categories
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground dark:text-gray-400">Overall Testing Progress</span>
                  <span className="font-medium">65%</span>
                </div>
                <Progress value={65} className="h-3" />
                <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
                  Based on completed checklist items and resolved issues
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Time Tracking View */}
      {activeView === "time" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Time Tracking</h2>
            <Button className="bg-gradient-to-r from-green-400 to-emerald-500 text-white">
              <Play className="h-4 w-4 mr-2" />
              Start Timer
            </Button>
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
              <div className="text-center p-8">
                <div className="text-6xl font-mono font-bold text-gray-900 dark:text-white mb-4">
                  00:00:00
                </div>
                <p className="text-muted-foreground dark:text-gray-400 mb-6">
                  No active session
                </p>
                <div className="flex gap-4 justify-center">
                  <Button className="bg-gradient-to-r from-green-400 to-emerald-500 text-white">
                    <Play className="h-4 w-4 mr-2" />
                    Start Session
                  </Button>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}