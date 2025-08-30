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
  const [activeTab, setActiveTab] = useState<'projects' | 'tasks' | 'testing'>('projects');
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
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('projects')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'projects'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
            <Card>
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
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Project Name</th>
                        <th className="text-left p-2">Key</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Lead</th>
                        <th className="text-left p-2">Issues</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((project: JiraProject) => (
                        <tr key={project.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            <div className="flex items-center space-x-2">
                              <Folder className="w-4 h-4 text-blue-500" />
                              <span className="font-medium">{project.name}</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <Badge variant="outline">{project.key}</Badge>
                          </td>
                          <td className="p-2 capitalize">{project.projectTypeKey}</td>
                          <td className="p-2">
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-gray-500" />
                              <span>{project.lead.displayName}</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <Badge variant="secondary">
                              {allIssues.filter((issue: JiraIssue) => issue.fields.project.key === project.key).length}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <Button variant="ghost" size="sm" asChild>
                              <a href={project.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
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
            <Card>
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
            <Card>
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
        </div>
      )}
    </div>
  );
}