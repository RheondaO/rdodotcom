import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useQuery } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
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
        </div>
      )}

      {/* Testing & QA View */}
      {activeView === "testing" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Testing & Quality Assurance</h2>
            <div className="flex gap-2">
              <Button 
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
                    <div key={task.id} className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border-l-4 border-orange-400">
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