import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  RefreshCw, 
  Upload, 
  Download, 
  Plus, 
  ExternalLink, 
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  GitBranch,
  Settings,
  Loader2
} from 'lucide-react';

interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
}

interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    description?: string;
    status: {
      name: string;
      id: string;
    };
    assignee?: {
      displayName: string;
      emailAddress: string;
    };
    priority?: {
      name: string;
      id: string;
    };
    project: {
      key: string;
      name: string;
    };
    issuetype: {
      name: string;
      id: string;
    };
    created: string;
    updated: string;
    duedate?: string;
    labels?: string[];
  };
}

interface SyncResult {
  success: boolean;
  synced: number;
  errors: string[];
  details: any[];
}

export function JiraIntegration() {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newIssue, setNewIssue] = useState({
    projectKey: '',
    summary: '',
    description: '',
    issueType: 'Task',
    priority: 'Medium'
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check Jira configuration status
  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/jira/status'],
    enabled: true,
    refetchOnWindowFocus: true
  });

  // Fetch Jira projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/jira/projects'],
    enabled: !!status?.configured,
    refetchOnWindowFocus: true
  });

  // Fetch issues for selected project
  const { data: issues = [], isLoading: issuesLoading, refetch: refetchIssues } = useQuery({
    queryKey: [`/api/jira/projects/${selectedProject}/issues`],
    enabled: !!selectedProject && !!status?.configured,
    refetchOnWindowFocus: true
  });

  // Fetch user's issues
  const { data: myIssues = [], isLoading: myIssuesLoading } = useQuery({
    queryKey: ['/api/jira/my-issues'],
    enabled: !!status?.configured,
    refetchOnWindowFocus: true
  });

  // Sync from Jira to Belle Journal
  const syncFromJira = useMutation({
    mutationFn: async (projectKey?: string) => {
      return apiRequest('/api/jira/sync/from-jira', {
        method: 'POST',
        body: JSON.stringify({ projectKey })
      });
    },
    onSuccess: (result: SyncResult) => {
      toast({
        title: 'Sync Complete',
        description: `Successfully synced ${result.synced} items from Jira`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-development/tasks'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Sync Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Sync from Belle Journal to Jira
  const syncToJira = useMutation({
    mutationFn: async (projectKey: string) => {
      return apiRequest('/api/jira/sync/to-jira', {
        method: 'POST',
        body: JSON.stringify({ projectKey })
      });
    },
    onSuccess: (result: SyncResult) => {
      toast({
        title: 'Sync Complete',
        description: `Successfully synced ${result.synced} items to Jira`,
      });
      refetchIssues();
    },
    onError: (error: any) => {
      toast({
        title: 'Sync Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Create new Jira issue
  const createIssue = useMutation({
    mutationFn: async (issueData: typeof newIssue) => {
      return apiRequest('/api/jira/issues', {
        method: 'POST',
        body: JSON.stringify(issueData)
      });
    },
    onSuccess: () => {
      toast({
        title: 'Issue Created',
        description: 'New Jira issue created successfully',
      });
      setCreateDialogOpen(false);
      setNewIssue({
        projectKey: '',
        summary: '',
        description: '',
        issueType: 'Task',
        priority: 'Medium'
      });
      refetchIssues();
    },
    onError: (error: any) => {
      toast({
        title: 'Creation Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleSyncFromJira = async () => {
    setIsSyncing(true);
    try {
      await syncFromJira.mutateAsync(selectedProject || undefined);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncToJira = async () => {
    if (!selectedProject) {
      toast({
        title: 'No Project Selected',
        description: 'Please select a Jira project first',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSyncing(true);
    try {
      await syncToJira.mutateAsync(selectedProject);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateIssue = async () => {
    if (!newIssue.projectKey || !newIssue.summary) {
      toast({
        title: 'Missing Information',
        description: 'Please provide project and summary',
        variant: 'destructive'
      });
      return;
    }
    
    await createIssue.mutateAsync(newIssue);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'done':
      case 'resolved':
      case 'closed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'in progress':
      case 'in review':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'blocked':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPriorityIcon = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'highest':
      case 'critical':
        return '🔴';
      case 'high':
        return '🟠';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!status?.configured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Jira Integration
          </CardTitle>
          <CardDescription>
            Connect Belle Journal with your Jira instance for bidirectional sync
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Jira integration is not configured. Please add your Jira credentials (JIRA_DOMAIN, JIRA_EMAIL, and JIRA_API_TOKEN) to enable this feature.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Jira Integration
            </CardTitle>
            <CardDescription>
              Manage and sync your Jira issues with Belle Journal
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Connected to {status.connectionDetails?.domain}
            </Badge>
            {status.syncStatus?.lastSync && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last sync: {new Date(status.syncStatus.lastSync).toLocaleTimeString()}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Project Selection and Actions */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label htmlFor="project-select">Select Project</Label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger id="project-select">
                <SelectValue placeholder="Choose a Jira project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project: JiraProject) => (
                  <SelectItem key={project.key} value={project.key}>
                    {project.name} ({project.key})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2 pt-6">
            <Button
              onClick={handleSyncFromJira}
              disabled={isSyncing}
              variant="outline"
              size="sm"
            >
              {isSyncing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Pull from Jira
            </Button>
            
            <Button
              onClick={handleSyncToJira}
              disabled={isSyncing || !selectedProject}
              variant="outline"
              size="sm"
            >
              {isSyncing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Push to Jira
            </Button>

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Issue
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Jira Issue</DialogTitle>
                  <DialogDescription>
                    Create a new issue in your Jira project
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="issue-project">Project</Label>
                    <Select value={newIssue.projectKey} onValueChange={(value) => setNewIssue({...newIssue, projectKey: value})}>
                      <SelectTrigger id="issue-project">
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project: JiraProject) => (
                          <SelectItem key={project.key} value={project.key}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="issue-summary">Summary</Label>
                    <Input
                      id="issue-summary"
                      value={newIssue.summary}
                      onChange={(e) => setNewIssue({...newIssue, summary: e.target.value})}
                      placeholder="Issue summary"
                    />
                  </div>
                  <div>
                    <Label htmlFor="issue-description">Description</Label>
                    <Textarea
                      id="issue-description"
                      value={newIssue.description}
                      onChange={(e) => setNewIssue({...newIssue, description: e.target.value})}
                      placeholder="Issue description (optional)"
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="issue-type">Issue Type</Label>
                      <Select value={newIssue.issueType} onValueChange={(value) => setNewIssue({...newIssue, issueType: value})}>
                        <SelectTrigger id="issue-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Task">Task</SelectItem>
                          <SelectItem value="Bug">Bug</SelectItem>
                          <SelectItem value="Story">Story</SelectItem>
                          <SelectItem value="Epic">Epic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="issue-priority">Priority</Label>
                      <Select value={newIssue.priority} onValueChange={(value) => setNewIssue({...newIssue, priority: value})}>
                        <SelectTrigger id="issue-priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Highest">Highest</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Lowest">Lowest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateIssue} disabled={createIssue.isPending}>
                    {createIssue.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Create Issue
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Issues Display */}
        <Tabs defaultValue="project" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="project">Project Issues</TabsTrigger>
            <TabsTrigger value="my">My Issues</TabsTrigger>
          </TabsList>
          
          <TabsContent value="project" className="space-y-4">
            {selectedProject ? (
              issuesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : issues.length > 0 ? (
                <div className="space-y-2">
                  {issues.map((issue: JiraIssue) => (
                    <div
                      key={issue.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            {issue.key}
                          </span>
                          <span className="text-sm">{getPriorityIcon(issue.fields.priority?.name)}</span>
                          <Badge className={getStatusColor(issue.fields.status.name)}>
                            {issue.fields.status.name}
                          </Badge>
                          {issue.fields.labels?.map((label) => (
                            <Badge key={label} variant="outline" className="text-xs">
                              {label}
                            </Badge>
                          ))}
                        </div>
                        <h4 className="font-medium">{issue.fields.summary}</h4>
                        {issue.fields.assignee && (
                          <p className="text-sm text-muted-foreground">
                            Assigned to: {issue.fields.assignee.displayName}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`https://${status.connectionDetails?.domain}/browse/${issue.key}`, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No issues found in this project
                </div>
              )
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select a project to view its issues
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="my" className="space-y-4">
            {myIssuesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : myIssues.length > 0 ? (
              <div className="space-y-2">
                {myIssues.map((issue: JiraIssue) => (
                  <div
                    key={issue.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          {issue.key}
                        </span>
                        <span className="text-sm">{getPriorityIcon(issue.fields.priority?.name)}</span>
                        <Badge className={getStatusColor(issue.fields.status.name)}>
                          {issue.fields.status.name}
                        </Badge>
                        <Badge variant="secondary">
                          {issue.fields.project.name}
                        </Badge>
                      </div>
                      <h4 className="font-medium">{issue.fields.summary}</h4>
                      {issue.fields.duedate && (
                        <p className="text-sm text-muted-foreground">
                          Due: {new Date(issue.fields.duedate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://${status.connectionDetails?.domain}/browse/${issue.key}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No issues assigned to you
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}