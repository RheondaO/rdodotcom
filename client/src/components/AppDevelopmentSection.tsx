import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  Code2, 
  GitBranch,
  Clock,
  BarChart3,
  Timer,
  Eye,
  GitCommit,
  History,
  FileText,
  Calendar,
  User,
  Plus,
  Globe,
  Smartphone,
  Monitor,
  Database,
  Lightbulb,
  Bug,
  Wrench,
  CheckSquare,
  AlertCircle,
  Square
} from "lucide-react";

import { format, formatDistanceToNow } from "date-fns";
import { z } from "zod";

// Interfaces
interface AppProject {
  id: number;
  name: string;
  description: string;
  status: string;
  priority: string;
  type: string;
  technology_stack: string[];
  repository_url?: string;
  deployment_url?: string;
  progress: number;
  created_at: string;
  updated_at: string;
  tags?: string[];
}

interface AppTask {
  id: number;
  project_id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee?: string;
  created_at: string;
  updated_at: string;
}

interface AutoDetectedIssue {
  id: number;
  title: string;
  description: string;
  severity: string;
  status: string;
  file_path?: string;
  line_number?: number;
  created_at: string;
  updated_at: string;
}

interface AppDevelopmentSectionProps {
  selectedDate: Date;
  isReadOnly?: boolean;
}

// Zod schemas
const newProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().min(1, "Description is required"),
  type: z.string().min(1, "Type is required"),
  status: z.string().default("planning"),
  priority: z.string().default("medium"),
  technology_stack: z.array(z.string()).default([]),
  repository_url: z.string().optional(),
  deployment_url: z.string().optional(),
  tags: z.array(z.string()).default([])
});

const newTaskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().min(1, "Description is required"),
  status: z.string().default("todo"),
  priority: z.string().default("medium"),
  project_id: z.number(),
  assignee: z.string().optional()
});

type NewProjectForm = z.infer<typeof newProjectSchema>;
type NewTaskForm = z.infer<typeof newTaskSchema>;

export default function AppDevelopmentSection({ selectedDate, isReadOnly = false }: AppDevelopmentSectionProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'tasks' | 'timetracking'>('overview');
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [techStackInput, setTechStackInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  
  // Time tracking state
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [showTimeTracker, setShowTimeTracker] = useState(false);
  
  // Mock time tracking data (replace with actual API calls)
  const timeEntries = [
    { id: 1, startTime: new Date(), duration: 125, project: 'Belle Journal' },
    { id: 2, startTime: new Date(Date.now() - 3600000), duration: 90, project: 'App Development Suite' }
  ];
  const todayTotalTime = 215; // minutes
  const sessionsToday = 2;

  // Queries - Enable for all users, not just admins
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/app-projects']
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/app-tasks']
  });

  const { data: autoDetectedIssues = [], isLoading: issuesLoading } = useQuery({
    queryKey: ['/api/auto-detected-issues']
  });

  // Forms
  const projectForm = useForm<NewProjectForm>({
    resolver: zodResolver(newProjectSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'web',
      status: 'planning',
      priority: 'medium',
      technology_stack: [],
      repository_url: '',
      deployment_url: '',
      tags: []
    }
  });

  const taskForm = useForm<NewTaskForm>({
    resolver: zodResolver(newTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      project_id: 0,
      assignee: ''
    }
  });

  // Mutations
  const createProjectMutation = useMutation({
    mutationFn: (data: NewProjectForm) => apiRequest('/api/app-projects', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        technology_stack: techStackInput.split(',').map(t => t.trim()).filter(Boolean),
        tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean)
      })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/app-projects'] });
      setShowNewProjectForm(false);
      projectForm.reset();
      setTechStackInput('');
      setTagsInput('');
      toast({
        title: "Project created successfully",
        description: "Your new project has been added to the development pipeline."
      });
    },
    onError: () => {
      toast({
        title: "Error creating project",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: NewTaskForm) => apiRequest('/api/app-tasks', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/app-tasks'] });
      setShowNewTaskForm(false);
      taskForm.reset();
      toast({
        title: "Task created successfully",
        description: "Your new task has been added to the project."
      });
    },
    onError: () => {
      toast({
        title: "Error creating task",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  });

  const handleProjectSubmit = (data: NewProjectForm) => {
    createProjectMutation.mutate(data);
  };

  const handleTaskSubmit = (data: NewTaskForm) => {
    createTaskMutation.mutate(data);
  };

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getProjectIcon = (type: string) => {
    switch (type) {
      case 'web': return Globe;
      case 'mobile': return Smartphone;
      case 'desktop': return Monitor;
      case 'api': return Database;
      default: return Code2;
    }
  };

  const getIssueIcon = (severity: string) => {
    switch (severity) {
      case 'high': return AlertCircle;
      case 'medium': return Bug;
      case 'low': return Wrench;
      default: return Lightbulb;
    }
  };

  const activeProjects = projects.filter((project: AppProject) => project.status !== 'completed' && project.status !== 'cancelled');
  const completedProjects = projects.filter((project: AppProject) => project.status === 'completed');

  const getProjectTasks = (projectId: number) => {
    return tasks.filter((task: AppTask) => task.project_id === projectId);
  };

  const getProjectProgress = (project: AppProject) => {
    const projectTasks = getProjectTasks(project.id);
    if (projectTasks.length === 0) return 0;
    const completedTasks = projectTasks.filter((task: AppTask) => task.status === 'completed');
    return Math.round((completedTasks.length / projectTasks.length) * 100);
  };

  // Remove the early return for read-only users - they should see the full suite

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center">
          <Code2 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">App Development Suite</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Project management & development tracking
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'projects', label: 'Projects', icon: Code2 },
          { id: 'tasks', label: 'Tasks', icon: FileText },
          { id: 'timetracking', label: 'Time Tracking', icon: Timer }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Project Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="h-5 w-5" />
                Active Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {activeProjects.length}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {completedProjects.length} completed
              </p>
            </CardContent>
          </Card>

          {/* Task Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Open Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {tasks.filter((task: AppTask) => task.status !== 'completed').length}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {tasks.filter((task: AppTask) => task.status === 'completed').length} completed
              </p>
            </CardContent>
          </Card>

          {/* Issues Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="h-5 w-5" />
                Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {autoDetectedIssues.filter((issue: AutoDetectedIssue) => issue.status !== 'resolved').length}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {autoDetectedIssues.filter((issue: AutoDetectedIssue) => issue.status === 'resolved').length} resolved
              </p>
            </CardContent>
          </Card>

          {/* Monitoring */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                Active
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Real-time tracking
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Projects</h3>
            {!isReadOnly && (
              <Button
                onClick={() => setShowNewProjectForm(true)}
                className="bg-gradient-to-r from-blue-400 to-cyan-500 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectsLoading ? (
              [...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : projects.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Code2 className="h-8 w-8 text-blue-400 dark:text-blue-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No projects yet</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {isReadOnly ? "No projects to display" : "Get started by creating your first project"}
                </p>
                {!isReadOnly && (
                  <Button
                    onClick={() => setShowNewProjectForm(true)}
                    className="bg-gradient-to-r from-blue-400 to-cyan-500 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
                )}
              </div>
            ) : (
              projects.map((project: AppProject) => {
                const ProjectIcon = getProjectIcon(project.type);
                const progress = getProjectProgress(project);
                
                return (
                  <Card key={project.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center">
                          <ProjectIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                        {project.description}
                      </p>
                      
                      <div className="flex gap-2 mb-4">
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(project.priority)}>
                          {project.priority}
                        </Badge>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-400 to-cyan-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {project.technology_stack && project.technology_stack.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {project.technology_stack.slice(0, 3).map((tech, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                          {project.technology_stack.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{project.technology_stack.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2">
                        {project.repository_url && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={project.repository_url} target="_blank" rel="noopener noreferrer">
                              <GitBranch className="h-4 w-4 mr-1" />
                              Repo
                            </a>
                          </Button>
                        )}
                        {project.deployment_url && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={project.deployment_url} target="_blank" rel="noopener noreferrer">
                              <Globe className="h-4 w-4 mr-1" />
                              Live
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Tasks</h3>
          {!isReadOnly && (
            <Button
              onClick={() => setShowNewTaskForm(true)}
              className="bg-gradient-to-r from-green-400 to-blue-500 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          )}
        </div>

          <div className="space-y-4">
            {tasksLoading ? (
              [...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-6">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))
            ) : tasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-green-400 dark:text-green-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks yet</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {isReadOnly ? "No tasks to display" : "Create your first task to get started"}
                </p>
                {!isReadOnly && (
                  <Button
                    onClick={() => setShowNewTaskForm(true)}
                    className="bg-gradient-to-r from-green-400 to-blue-500 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Task
                  </Button>
                )}
              </div>
            ) : (
              tasks.map((task: AppTask) => {
                const project = projects.find((p: AppProject) => p.id === task.project_id);
                
                return (
                  <Card key={task.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            {task.title}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                            {task.description}
                          </p>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getStatusColor(task.status)}>
                              {task.status.replace('_', ' ')}
                            </Badge>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            {project && (
                              <Badge variant="outline">
                                {project.name}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(task.created_at), 'MMM d, yyyy')}
                            </span>
                            {task.assignee && (
                              <span className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {task.assignee}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Time Tracking Tab */}
      {activeTab === 'timetracking' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Time Tracking & Hours Log</h3>
            {!isReadOnly && (
              <Button
                onClick={() => setShowTimeTracker(true)}
                className="bg-gradient-to-r from-green-400 to-emerald-500 text-white"
              >
                <Timer className="h-4 w-4 mr-2" />
                Start Timer
              </Button>
            )}
          </div>
          
          {/* Active Timer Display */}
          <Card className="border-green-100 dark:border-green-800 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-green-600 dark:text-green-400">
                <Timer className="h-5 w-5" />
                Current Session
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-4xl font-mono font-bold text-gray-900 dark:text-white mb-2">
                  {formatTime(sessionTime)}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {isTimerActive ? 'Session in progress' : 'No active session'}
                </p>
                {!isReadOnly && (
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant={isTimerActive ? "destructive" : "default"}
                      onClick={isTimerActive ? stopTimer : startTimer}
                      className={!isTimerActive ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white" : ""}
                    >
                      {isTimerActive ? (
                        <>
                          <Square className="h-4 w-4 mr-2" />
                          Stop Session
                        </>
                      ) : (
                        <>
                          <Timer className="h-4 w-4 mr-2" />
                          Start Session
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Today's Time Summary */}
          <Card className="border-blue-100 dark:border-blue-800 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                <Clock className="h-5 w-5" />
                Today's Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.floor(todayTotalTime / 60)}h {todayTotalTime % 60}m
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total Time</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {sessionsToday}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Sessions</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.round(todayTotalTime / Math.max(sessionsToday, 1))}m
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Avg Session</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Time Entries */}
          <Card className="border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <History className="h-5 w-5" />
                Recent Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timeEntries && timeEntries.length > 0 ? (
                <div className="space-y-3">
                  {timeEntries.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl border">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Development Session
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {format(new Date(entry.startTime), 'MMM dd, HH:mm')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-gray-900 dark:text-white">
                          {formatTime(entry.duration)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {entry.project || 'General'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Timer className="h-8 w-8 text-blue-400 dark:text-blue-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Time Entries Yet</h3>
                  <p className="text-gray-600 dark:text-gray-300">Start your first development session to see time tracking data.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* New Project Dialog */}
      <Dialog open={showNewProjectForm} onOpenChange={setShowNewProjectForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <Form {...projectForm}>
            <form onSubmit={projectForm.handleSubmit(handleProjectSubmit)} className="space-y-4">
              <FormField
                control={projectForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter project name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={projectForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project type" />
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
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="planning">Planning</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="testing">Testing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
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
                            <SelectValue />
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

              <FormField
                control={projectForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Describe your project..."
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Technology Stack
                  </label>
                  <Input
                    value={techStackInput}
                    onChange={(e) => setTechStackInput(e.target.value)}
                    placeholder="e.g., React, TypeScript, Node.js (comma-separated)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tags
                  </label>
                  <Input
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="e.g., frontend, backend, mobile (comma-separated)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={projectForm.control}
                  name="repository_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repository URL (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://github.com/..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={projectForm.control}
                  name="deployment_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deployment URL (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://myapp.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewProjectForm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createProjectMutation.isPending}
                  className="bg-gradient-to-r from-blue-400 to-cyan-500 text-white"
                >
                  {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* New Task Dialog */}
      <Dialog open={showNewTaskForm} onOpenChange={setShowNewTaskForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <Form {...taskForm}>
            <form onSubmit={taskForm.handleSubmit(handleTaskSubmit)} className="space-y-4">
              <FormField
                control={taskForm.control}
                name="project_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects.map((project: AppProject) => (
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

              <FormField
                control={taskForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter task title" />
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
                      <Textarea 
                        {...field} 
                        placeholder="Describe the task..."
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={taskForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
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
                            <SelectValue />
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

              <FormField
                control={taskForm.control}
                name="assignee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Developer name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewTaskForm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createTaskMutation.isPending}
                  className="bg-gradient-to-r from-blue-400 to-cyan-500 text-white"
                >
                  {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

    </div>
  );
}