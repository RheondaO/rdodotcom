import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "./ui/button";
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
  Plus, Code2, Users, FileText, CheckCircle, Circle, 
  Clock, AlertCircle, Bug, Target, ExternalLink, Folder,
  ListTodo, Settings, Edit3, Trash2
} from "lucide-react";

// Jira-based Form Schemas
const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  key: z.string().min(2, "Project key must be at least 2 characters").max(10, "Project key must be 10 characters or less"),
  description: z.string().optional(),
  projectTypeKey: z.enum(["business", "software", "service_desk"]).default("business")
});

const issueSchema = z.object({
  projectKey: z.string().min(1, "Project is required"),
  summary: z.string().min(1, "Summary is required"),
  description: z.string().optional(),
  issueType: z.enum(["Story", "Task", "Bug", "Epic", "Test"]).default("Task"),
  priority: z.enum(["Lowest", "Low", "Medium", "High", "Highest"]).default("Medium")
});

type ProjectForm = z.infer<typeof projectSchema>;
type IssueForm = z.infer<typeof issueSchema>;

// Jira Interfaces
interface JiraProject {
  id: string;
  key: string;
  name: string;
  description?: string;
  projectTypeKey: string;
  lead: {
    accountId: string;
    displayName: string;
  };
  url: string;
}

interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    description?: string;
    status: {
      name: string;
      statusCategory: { key: string; name: string; };
    };
    issuetype: {
      name: string;
      subtask: boolean;
    };
    project: {
      key: string;
      name: string;
    };
    priority?: {
      name: string;
    };
    assignee?: {
      accountId: string;
      displayName: string;
    };
    created: string;
    updated: string;
    resolutiondate?: string;
    labels?: string[];
  };
}

export function UnifiedJiraSection() {
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'tasks' | 'testing' | 'documentation' | 'prompts'>('overview');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showIssueForm, setShowIssueForm] = useState(false);
  
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  // Forms
  const projectForm = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      projectTypeKey: "business"
    }
  });

  const issueForm = useForm<IssueForm>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      issueType: "Task",
      priority: "Medium"
    }
  });

  // Fetch Jira Projects
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ['/api/jira/projects'],
    queryFn: async () => {
      const response = await fetch('/api/jira/projects', {
        credentials: 'include'
      });
      if (!response.ok) return [];
      return response.json();
    }
  });

  // Fetch Jira Issues
  const { data: allIssues = [], isLoading: isLoadingIssues } = useQuery({
    queryKey: ['/api/jira/issues'],
    queryFn: async () => {
      const response = await fetch('/api/jira/issues', {
        credentials: 'include'
      });
      if (!response.ok) return [];
      return response.json();
    }
  });

  // Filter issues by status for different tabs
  const taskIssues = allIssues.filter((issue: JiraIssue) => 
    issue.fields.status.name === 'To Do' || 
    issue.fields.status.name === 'In Progress' ||
    issue.fields.status.name === 'Implementing'
  );

  const testingIssues = allIssues.filter((issue: JiraIssue) => 
    issue.fields.status.name === 'QA Testing' ||
    issue.fields.status.name === 'Testing' ||
    (issue.fields.status.name === 'Done' && issue.fields.issuetype.name === 'Test')
  );

  const documentationIssues = allIssues.filter((issue: JiraIssue) => 
    issue.fields.status.name === 'Documentation' ||
    issue.fields.issuetype.name === 'Documentation' ||
    issue.fields.labels?.includes('documentation')
  );

  // Mutations
  const createProjectMutation = useMutation({
    mutationFn: (data: ProjectForm) => apiRequest('POST', '/api/jira/projects', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jira/projects'] });
      toast({ title: "Success", description: "Jira project created successfully" });
      setShowProjectForm(false);
      projectForm.reset();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create project", 
        variant: "destructive" 
      });
    }
  });

  const createIssueMutation = useMutation({
    mutationFn: (data: IssueForm) => apiRequest('POST', '/api/jira/issues', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jira/issues'] });
      toast({ title: "Success", description: "Jira issue created successfully" });
      setShowIssueForm(false);
      issueForm.reset();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create issue", 
        variant: "destructive" 
      });
    }
  });

  const onSubmitProject = (data: ProjectForm) => {
    if (!isAdmin) {
      toast({
        title: "Authentication Required",
        description: "Admin access required to create projects",
        variant: "destructive"
      });
      return;
    }
    createProjectMutation.mutate(data);
  };

  const onSubmitIssue = (data: IssueForm) => {
    if (!isAdmin) {
      toast({
        title: "Authentication Required", 
        description: "Admin access required to create issues",
        variant: "destructive"
      });
      return;
    }
    createIssueMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      'To Do': 'bg-gray-100 text-gray-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Implementing': 'bg-yellow-100 text-yellow-800',
      'QA Testing': 'bg-purple-100 text-purple-800',
      'Testing': 'bg-purple-100 text-purple-800',
      'Documentation': 'bg-green-100 text-green-800',
      'Done': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const getPriorityIcon = (priority?: string) => {
    switch(priority) {
      case 'Highest': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'High': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'Medium': return <Circle className="w-4 h-4 text-yellow-500" />;
      case 'Low': return <Circle className="w-4 h-4 text-green-500" />;
      case 'Lowest': return <Circle className="w-4 h-4 text-gray-500" />;
      default: return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getIssueTypeIcon = (issueType: string) => {
    switch(issueType) {
      case 'Story': return <FileText className="w-4 h-4 text-green-500" />;
      case 'Task': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'Bug': return <Bug className="w-4 h-4 text-red-500" />;
      case 'Epic': return <Target className="w-4 h-4 text-purple-500" />;
      case 'Test': return <Settings className="w-4 h-4 text-orange-500" />;
      default: return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const isLoading = isLoadingProjects || isLoadingIssues;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Code2 className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Project Development</h2>
          <Badge variant="outline" className="text-xs">
            Jira Integrated
          </Badge>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Overview</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'projects'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Folder className="w-4 h-4" />
              <span>Projects</span>
              <Badge variant="secondary" className="text-xs">
                {projects.length}
              </Badge>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tasks'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <ListTodo className="w-4 h-4" />
              <span>Tasks</span>
              <Badge variant="secondary" className="text-xs">
                {taskIssues.length}
              </Badge>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('testing')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'testing'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Bug className="w-4 h-4" />
              <span>Testing & QA</span>
              <Badge variant="secondary" className="text-xs">
                {testingIssues.length}
              </Badge>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('documentation')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'documentation'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Documentation</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('prompts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'prompts'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Code2 className="w-4 h-4" />
              <span>Prompt Library</span>
            </div>
          </button>
        </nav>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div>
          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Folder className="w-5 h-5" />
                  <span>Jira Projects</span>
                </CardTitle>
                <Dialog open={showProjectForm} onOpenChange={setShowProjectForm}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Jira Project</DialogTitle>
                    </DialogHeader>
                    <Form {...projectForm}>
                      <form onSubmit={projectForm.handleSubmit(onSubmitProject)} className="space-y-4">
                        <FormField
                          control={projectForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Project Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="My Awesome Project" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={projectForm.control}
                          name="key"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Project Key</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="MAP" className="uppercase" />
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
                              <FormLabel>Description (Optional)</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Project description..." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={projectForm.control}
                          name="projectTypeKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Project Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="business">Business</SelectItem>
                                  <SelectItem value="software">Software</SelectItem>
                                  <SelectItem value="service_desk">Service Desk</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setShowProjectForm(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createProjectMutation.isPending}>
                            {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Project
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Key
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Lead
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Issues
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {projects.map((project: JiraProject) => (
                        <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center">
                                <Folder className="h-5 w-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {project.name}
                                </div>
                                {project.description && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {project.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                              {project.key}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <span className="capitalize text-sm text-gray-600 dark:text-gray-300">
                              {project.projectTypeKey.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                {project.lead.displayName}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="secondary" className="text-xs">
                              {allIssues.filter((issue: JiraIssue) => issue.fields.project.key === project.key).length} issues
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" asChild>
                                <a href={project.url} target="_blank" rel="noopener noreferrer" 
                                   className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                                  <ExternalLink className="w-4 h-4" />
                                  <span className="text-xs">View in Jira</span>
                                </a>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {projects.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No projects found. Create your first project to get started.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <ListTodo className="w-5 h-5" />
                  <span>Active Tasks</span>
                </CardTitle>
                <Dialog open={showIssueForm} onOpenChange={setShowIssueForm}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Task</DialogTitle>
                    </DialogHeader>
                    <Form {...issueForm}>
                      <form onSubmit={issueForm.handleSubmit(onSubmitIssue)} className="space-y-4">
                        <FormField
                          control={issueForm.control}
                          name="projectKey"
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
                                  {projects.map((project: JiraProject) => (
                                    <SelectItem key={project.key} value={project.key}>
                                      {project.name} ({project.key})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={issueForm.control}
                          name="summary"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Task Summary</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Implement user authentication" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={issueForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description (Optional)</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Detailed task description..." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={issueForm.control}
                          name="issueType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Issue Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Task">Task</SelectItem>
                                  <SelectItem value="Story">Story</SelectItem>
                                  <SelectItem value="Bug">Bug</SelectItem>
                                  <SelectItem value="Epic">Epic</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={issueForm.control}
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
                                  <SelectItem value="Lowest">Lowest</SelectItem>
                                  <SelectItem value="Low">Low</SelectItem>
                                  <SelectItem value="Medium">Medium</SelectItem>
                                  <SelectItem value="High">High</SelectItem>
                                  <SelectItem value="Highest">Highest</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setShowIssueForm(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createIssueMutation.isPending}>
                            {createIssueMutation.isPending ? 'Creating...' : 'Create Task'}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Issue</th>
                        <th className="text-left p-2">Summary</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Priority</th>
                        <th className="text-left p-2">Assignee</th>
                        <th className="text-left p-2">Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {taskIssues.map((issue: JiraIssue) => (
                        <tr key={issue.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            <div className="flex items-center space-x-2">
                              {getIssueTypeIcon(issue.fields.issuetype.name)}
                              <Badge variant="outline">{issue.key}</Badge>
                            </div>
                          </td>
                          <td className="p-2">
                            <span className="font-medium">{issue.fields.summary}</span>
                            <br />
                            <span className="text-sm text-gray-500">{issue.fields.project.name}</span>
                          </td>
                          <td className="p-2">
                            {getStatusBadge(issue.fields.status.name)}
                          </td>
                          <td className="p-2">
                            <div className="flex items-center space-x-1">
                              {getPriorityIcon(issue.fields.priority?.name)}
                              <span className="text-sm">{issue.fields.priority?.name || 'Medium'}</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">
                                {issue.fields.assignee?.displayName || 'Unassigned'}
                              </span>
                            </div>
                          </td>
                          <td className="p-2 text-sm text-gray-500">
                            {format(new Date(issue.fields.updated), 'MMM d, yyyy')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {taskIssues.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No active tasks found. Create a new task to get started.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Testing & QA Tab */}
          {activeTab === 'testing' && (
            <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Bug className="w-5 h-5" />
                  <span>Testing & QA</span>
                </CardTitle>
                <Dialog open={showIssueForm} onOpenChange={setShowIssueForm}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Test
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Test Item</DialogTitle>
                    </DialogHeader>
                    <Form {...issueForm}>
                      <form onSubmit={issueForm.handleSubmit((data) => onSubmitIssue({...data, issueType: 'Test'}))} className="space-y-4">
                        <FormField
                          control={issueForm.control}
                          name="projectKey"
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
                                  {projects.map((project: JiraProject) => (
                                    <SelectItem key={project.key} value={project.key}>
                                      {project.name} ({project.key})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={issueForm.control}
                          name="summary"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Test Summary</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Test user login functionality" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={issueForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Test Details</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Test steps, expected results..." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={issueForm.control}
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
                                  <SelectItem value="Lowest">Lowest</SelectItem>
                                  <SelectItem value="Low">Low</SelectItem>
                                  <SelectItem value="Medium">Medium</SelectItem>
                                  <SelectItem value="High">High</SelectItem>
                                  <SelectItem value="Highest">Highest</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setShowIssueForm(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createIssueMutation.isPending}>
                            {createIssueMutation.isPending ? 'Creating...' : 'Create Test'}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Issue</th>
                        <th className="text-left p-2">Summary</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Priority</th>
                        <th className="text-left p-2">Assignee</th>
                        <th className="text-left p-2">Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testingIssues.map((issue: JiraIssue) => (
                        <tr key={issue.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            <div className="flex items-center space-x-2">
                              {getIssueTypeIcon(issue.fields.issuetype.name)}
                              <Badge variant="outline">{issue.key}</Badge>
                            </div>
                          </td>
                          <td className="p-2">
                            <span className="font-medium">{issue.fields.summary}</span>
                            <br />
                            <span className="text-sm text-gray-500">{issue.fields.project.name}</span>
                          </td>
                          <td className="p-2">
                            {getStatusBadge(issue.fields.status.name)}
                          </td>
                          <td className="p-2">
                            <div className="flex items-center space-x-1">
                              {getPriorityIcon(issue.fields.priority?.name)}
                              <span className="text-sm">{issue.fields.priority?.name || 'Medium'}</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">
                                {issue.fields.assignee?.displayName || 'Unassigned'}
                              </span>
                            </div>
                          </td>
                          <td className="p-2 text-sm text-gray-500">
                            {format(new Date(issue.fields.updated), 'MMM d, yyyy')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {testingIssues.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No testing items found. Issues in "QA Testing" status will appear here automatically.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground dark:text-gray-400">Total Projects</p>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{projects.length}</p>
                        <p className="text-xs text-muted-foreground dark:text-gray-500">Jira-integrated</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center">
                        <Folder className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground dark:text-gray-400">Active Tasks</p>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{taskIssues.length}</p>
                        <p className="text-xs text-muted-foreground dark:text-gray-500">In progress</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                        <ListTodo className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground dark:text-gray-400">In Testing</p>
                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{testingIssues.length}</p>
                        <p className="text-xs text-muted-foreground dark:text-gray-500">QA items</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                        <Bug className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground dark:text-gray-400">Total Issues</p>
                        <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{allIssues.length}</p>
                        <p className="text-xs text-muted-foreground dark:text-gray-500">All statuses</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {allIssues.slice(0, 5).map((issue: JiraIssue) => (
                      <div key={issue.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getIssueTypeIcon(issue.fields.issuetype.name)}
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {issue.fields.summary}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {issue.key} • {issue.fields.project.name}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(issue.fields.status.name)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Documentation Tab */}
          {activeTab === 'documentation' && (
            <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Project Documentation</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="prose dark:prose-invert max-w-none">
                    <h3>Jira Integration Guide</h3>
                    <p>This system provides complete bidirectional synchronization with Jira for project management.</p>
                    
                    <h4>Status-Driven Workflows</h4>
                    <ul>
                      <li><strong>Tasks Tab:</strong> Shows issues with status "To Do", "In Progress", or "Implementing"</li>
                      <li><strong>Testing & QA Tab:</strong> Displays issues with status "QA Testing" or "Testing"</li>
                      <li><strong>Automatic Movement:</strong> Issues move between tabs automatically based on status changes in Jira</li>
                    </ul>

                    <h4>Creating Projects</h4>
                    <ol>
                      <li>Click "Create Project" in the Projects tab</li>
                      <li>Enter project name and unique key (2-10 characters)</li>
                      <li>Select project type (Business, Software, or Service Desk)</li>
                      <li>Add optional description</li>
                      <li>Project is created directly in Jira</li>
                    </ol>

                    <h4>Managing Tasks</h4>
                    <ul>
                      <li>All tasks are Jira issues with full synchronization</li>
                      <li>Create tasks with priority levels from Lowest to Highest</li>
                      <li>Assign to team members through Jira</li>
                      <li>Track progress through status updates</li>
                    </ul>

                    <h4>Testing Workflow</h4>
                    <p>Test items automatically appear in the Testing & QA tab when their status is set to "QA Testing" or "Testing" in Jira. Once testing is complete and status changes to "Done", they automatically move out of the testing queue.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Prompt Library Tab */}
          {activeTab === 'prompts' && (
            <div className="space-y-6">
              <Card className="bg-white/80 dark:bg-[#17111d]/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Code2 className="w-5 h-5" />
                    <span>Development Prompt Library</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Sample prompts */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <h4 className="font-medium text-sm mb-2">React Component Generator</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        Generate functional React components with TypeScript
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="text-xs">React</Badge>
                        <Badge variant="secondary" className="text-xs">TypeScript</Badge>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <h4 className="font-medium text-sm mb-2">API Endpoint Builder</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        Create RESTful API endpoints with error handling
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="text-xs">API</Badge>
                        <Badge variant="secondary" className="text-xs">Backend</Badge>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <h4 className="font-medium text-sm mb-2">Database Query Optimizer</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        Optimize SQL queries for better performance
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="text-xs">SQL</Badge>
                        <Badge variant="secondary" className="text-xs">Performance</Badge>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <h4 className="font-medium text-sm mb-2">Bug Debugging Assistant</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        Systematic approach to debug code issues
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="text-xs">Debug</Badge>
                        <Badge variant="secondary" className="text-xs">Testing</Badge>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <h4 className="font-medium text-sm mb-2">Mobile-First CSS</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        Generate responsive CSS with mobile-first approach
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="text-xs">CSS</Badge>
                        <Badge variant="secondary" className="text-xs">Mobile</Badge>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <h4 className="font-medium text-sm mb-2">Test Case Generator</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        Create comprehensive test cases for features
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="text-xs">Testing</Badge>
                        <Badge variant="secondary" className="text-xs">QA</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}