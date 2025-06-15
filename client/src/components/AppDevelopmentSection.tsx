The code is modified to use client-side constants instead of API calls in the AppDevelopmentSection component.
```

```replit_final_file
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { 
  Plus, Edit, Trash2, Clock, Target, Code, GitBranch, 
  CheckCircle, AlertCircle, Timer, Play, Pause, Square,
  Folder, FileText, Bug, Lightbulb, Wrench, TestTube,
  Users, Calendar, TrendingUp, Activity, Zap, Star,
  Settings, Database, Cloud, Shield, Smartphone
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "../hooks/use-toast";
import { 
  TECH_STACK_OPTIONS, 
  PROJECT_CATEGORIES, 
  PRIORITY_LEVELS, 
  TASK_CATEGORIES 
} from "../lib/constants";

interface AppDevelopmentSectionProps {
  selectedDate: Date;
  isReadOnly?: boolean;
}

export default function AppDevelopmentSection({ selectedDate, isReadOnly = false }: AppDevelopmentSectionProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  const { user } = useAuth();

  // Format time helper
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Queries
  const { data: gitCommits = [], isLoading: commitsLoading } = useQuery({
    queryKey: ['/api/git/commits']
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/app-tasks']
  });

  const { data: autoDetectedIssues = [], isLoading: issuesLoading } = useQuery({
    queryKey: ['/api/auto-detected-issues']
  });

  const activeCommits = Array.isArray(gitCommits) ? gitCommits.slice(0, 5) : [];
  const totalCommits = Array.isArray(gitCommits) ? gitCommits.length : 0;

  // Use constants from client-side constants file
  const techStackOptions = TECH_STACK_OPTIONS;
  const categoryOptions = PROJECT_CATEGORIES;
  const priorityOptions = PRIORITY_LEVELS;
  const taskCategories = TASK_CATEGORIES;

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {[
          { key: 'overview', label: 'Overview', icon: BarChart3 },
          { key: 'projects', label: 'Projects', icon: GitCommit },
          { key: 'tasks', label: 'Tasks', icon: CheckCircle2 },
          { key: 'time-tracking', label: 'Time Tracking', icon: Timer }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 justify-center ${
              activeTab === key
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Active Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="h-5 w-5" />
                Recent Commits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {totalCommits}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Belle Journal App
              </p>
            </CardContent>
          </Card>

          {/* Active Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Active Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {Array.isArray(tasks) ? tasks.filter((task: any) => task.status !== 'completed').length : 0}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {Array.isArray(tasks) ? tasks.filter((task: any) => task.status === 'completed').length : 0} completed
              </p>
            </CardContent>
          </Card>

          {/* Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="h-5 w-5" />
                Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {Array.isArray(autoDetectedIssues) ? autoDetectedIssues.filter((issue: any) => issue.status !== 'resolved').length : 0}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {Array.isArray(autoDetectedIssues) ? autoDetectedIssues.filter((issue: any) => issue.status === 'resolved').length : 0} resolved
              </p>
            </CardContent>
          </Card>

          {/* Hours Logged */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                Hours Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                0:00
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                0 sessions today
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Projects Tab - Git Commits */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Belle Journal App</h2>
            <p className="text-gray-600 dark:text-gray-400">Development Activity & Git Commits</p>
          </div>

          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <GitCommit className="h-5 w-5" />
              Recent Commits
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {Array.isArray(gitCommits) ? gitCommits.length : 0} total commits
            </div>
          </div>

          <div className="space-y-4">
            {commitsLoading ? (
              [...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : Array.isArray(gitCommits) && gitCommits.length > 0 ? (
              gitCommits.map((commit: any) => (
                <Card key={commit.hash} className="border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-white truncate">
                              {commit.message}
                            </h4>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-300">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {commit.author}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(commit.date), 'MMM dd, yyyy HH:mm')}
                              </span>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                              {commit.hash.substring(0, 7)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <GitCommit className="h-8 w-8 text-blue-400 dark:text-blue-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Git Commits Found</h3>
                <p className="text-gray-600 dark:text-gray-300">Make your first commit to see development activity here.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Tasks</h3>
          </div>

          <div className="space-y-4">
            {tasksLoading ? (
              [...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : Array.isArray(tasks) && tasks.length > 0 ? (
              tasks.map((task: any) => (
                <Card key={task.id} className="border-gray-200 dark:border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {task.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {task.description}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                          {task.status}
                        </Badge>
                        <Badge variant="outline">
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8 text-blue-400 dark:text-blue-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Tasks Yet</h3>
                <p className="text-gray-600 dark:text-gray-300">Tasks will appear here as they are created.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Time Tracking Tab */}
      {activeTab === 'time-tracking' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Time Tracking</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Today's Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  0:00
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  0 sessions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  0:00
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  0 sessions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  0:00
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  All time
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Timer className="h-8 w-8 text-blue-400 dark:text-blue-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Time Entries Yet</h3>
            <p className="text-gray-600 dark:text-gray-300">Start tracking time to see your productivity metrics here.</p>
          </div>
        </div>
      )}
    </div>
  );
}