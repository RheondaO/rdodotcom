
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  GitBranch, 
  GitCommit, 
  GitMerge, 
  Plus, 
  Eye, 
  Download,
  Upload,
  RefreshCw,
  FileText,
  Clock,
  User,
  Hash,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";

interface GitCommit {
  id: string;
  hash: string;
  message: string;
  author: string;
  date: Date;
  branch: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  status: "success" | "pending" | "failed";
}

interface GitBranch {
  name: string;
  current: boolean;
  lastCommit: Date;
  ahead: number;
  behind: number;
  status: "active" | "merged" | "stale";
}

interface FileChange {
  path: string;
  status: "added" | "modified" | "deleted" | "renamed";
  additions: number;
  deletions: number;
}

interface GitIntegrationPanelProps {
  isReadOnly?: boolean;
}

export default function GitIntegrationPanel({ isReadOnly = false }: GitIntegrationPanelProps) {
  const [commits, setCommits] = useState<GitCommit[]>([
    {
      id: "1",
      hash: "a1b2c3d4",
      message: "Add Replit integration components",
      author: "developer",
      date: new Date(Date.now() - 10 * 60 * 1000),
      branch: "main",
      filesChanged: 5,
      additions: 247,
      deletions: 12,
      status: "success"
    },
    {
      id: "2", 
      hash: "e5f6g7h8",
      message: "Update CI/CD pipeline configuration",
      author: "devops",
      date: new Date(Date.now() - 45 * 60 * 1000),
      branch: "main",
      filesChanged: 3,
      additions: 89,
      deletions: 23,
      status: "success"
    },
    {
      id: "3",
      hash: "i9j0k1l2",
      message: "Fix deployment build issues",
      author: "developer",
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
      branch: "hotfix/deployment",
      filesChanged: 2,
      additions: 15,
      deletions: 8,
      status: "pending"
    }
  ]);

  const [branches, setBranches] = useState<GitBranch[]>([
    {
      name: "main",
      current: true,
      lastCommit: new Date(Date.now() - 10 * 60 * 1000),
      ahead: 0,
      behind: 0,
      status: "active"
    },
    {
      name: "feature/replit-integration", 
      current: false,
      lastCommit: new Date(Date.now() - 30 * 60 * 1000),
      ahead: 3,
      behind: 1,
      status: "active"
    },
    {
      name: "hotfix/deployment",
      current: false,
      lastCommit: new Date(Date.now() - 2 * 60 * 60 * 1000),
      ahead: 1,
      behind: 2,
      status: "active"
    }
  ]);

  const [selectedCommit, setSelectedCommit] = useState<string | null>(null);
  const [fileChanges, setFileChanges] = useState<FileChange[]>([
    {
      path: "client/src/components/ReplitIntegrationPanel.tsx",
      status: "added",
      additions: 125,
      deletions: 0
    },
    {
      path: "client/src/components/CICDPipelineMonitor.tsx", 
      status: "added",
      additions: 98,
      deletions: 0
    },
    {
      path: "client/src/components/AppDevelopmentSection.tsx",
      status: "modified",
      additions: 24,
      deletions: 12
    }
  ]);

  const [showCommitDialog, setShowCommitDialog] = useState(false);
  const [commitMessage, setCommitMessage] = useState("");
  const [isCommitting, setIsCommitting] = useState(false);
  
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "failed": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return <CheckCircle className="h-4 w-4" />;
      case "pending": return <Clock className="h-4 w-4" />;
      case "failed": return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getFileStatusColor = (status: string) => {
    switch (status) {
      case "added": return "text-green-600 dark:text-green-400";
      case "modified": return "text-blue-600 dark:text-blue-400";
      case "deleted": return "text-red-600 dark:text-red-400";
      case "renamed": return "text-purple-600 dark:text-purple-400";
      default: return "text-gray-600 dark:text-gray-400";
    }
  };

  const createCommit = async () => {
    if (isReadOnly || !commitMessage.trim()) return;
    
    setIsCommitting(true);
    
    // Simulate commit creation
    setTimeout(() => {
      const newCommit: GitCommit = {
        id: Date.now().toString(),
        hash: Math.random().toString(36).substr(2, 8),
        message: commitMessage,
        author: "current-user",
        date: new Date(),
        branch: "main",
        filesChanged: fileChanges.length,
        additions: fileChanges.reduce((sum, f) => sum + f.additions, 0),
        deletions: fileChanges.reduce((sum, f) => sum + f.deletions, 0),
        status: "success"
      };

      setCommits(prev => [newCommit, ...prev]);
      setCommitMessage("");
      setShowCommitDialog(false);
      setIsCommitting(false);
      
      toast({
        title: "Commit Created",
        description: `Successfully committed ${fileChanges.length} files`
      });
    }, 2000);
  };

  const switchBranch = async (branchName: string) => {
    if (isReadOnly) return;
    
    setBranches(prev => prev.map(branch => ({
      ...branch,
      current: branch.name === branchName
    })));
    
    toast({
      title: "Branch Switched",
      description: `Switched to branch: ${branchName}`
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Git Integration
          </h3>
          <p className="text-sm text-muted-foreground dark:text-gray-400">
            Version control and change tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCommitDialog(true)}
            disabled={isReadOnly}
            className={isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}
          >
            <GitCommit className="h-4 w-4 mr-2" />
            Commit
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isReadOnly}
            className={isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Pull
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isReadOnly}
            className={isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}
          >
            <Upload className="h-4 w-4 mr-2" />
            Push
          </Button>
        </div>
      </div>

      {/* Branch Management */}
      <Card className="border-blue-100 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
            <GitBranch className="h-5 w-5" />
            Branches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {branches.map((branch) => (
              <div key={branch.name} className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border">
                <div className="flex items-center gap-3">
                  <GitBranch className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {branch.name}
                      </span>
                      {branch.current && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Current
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground dark:text-gray-400">
                      Last commit: {format(branch.lastCommit, 'MMM dd, HH:mm')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {(branch.ahead > 0 || branch.behind > 0) && (
                    <div className="text-sm text-muted-foreground dark:text-gray-400">
                      {branch.ahead > 0 && <span className="text-green-600">+{branch.ahead}</span>}
                      {branch.ahead > 0 && branch.behind > 0 && " / "}
                      {branch.behind > 0 && <span className="text-red-600">-{branch.behind}</span>}
                    </div>
                  )}
                  {!branch.current && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => switchBranch(branch.name)}
                      disabled={isReadOnly}
                      className={isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                      Switch
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Commits */}
      <Card className="border-purple-100 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
            <GitCommit className="h-5 w-5" />
            Recent Commits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {commits.map((commit) => (
              <div key={commit.id} className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getStatusColor(commit.status)}>
                        {getStatusIcon(commit.status)}
                        <span className="ml-1">{commit.status}</span>
                      </Badge>
                      <span className="text-sm font-mono text-gray-500">
                        {commit.hash}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {commit.branch}
                      </Badge>
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      {commit.message}
                    </h4>
                    <div className="text-sm text-muted-foreground dark:text-gray-400 space-y-1">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {commit.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(commit.date, 'MMM dd, HH:mm')}
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {commit.filesChanged} files
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-green-600">+{commit.additions}</span>
                        <span className="text-red-600">-{commit.deletions}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedCommit(commit.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Changes
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isReadOnly}
                    className={isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Cherry Pick
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* File Changes Detail */}
      {selectedCommit && (
        <Card className="border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <FileText className="h-5 w-5" />
              File Changes - {commits.find(c => c.id === selectedCommit)?.hash}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedCommit(null)}
                className="ml-auto"
              >
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {fileChanges.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={getFileStatusColor(file.status)}>
                      {file.status}
                    </Badge>
                    <span className="font-mono text-sm">{file.path}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-green-600">+{file.additions}</span>
                    <span className="text-red-600">-{file.deletions}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Commit Dialog */}
      <Dialog open={showCommitDialog} onOpenChange={setShowCommitDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Commit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Commit Message
              </label>
              <Textarea
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="Describe your changes..."
                rows={3}
                disabled={isReadOnly}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Files to Commit ({fileChanges.length})
              </label>
              <ScrollArea className="h-32 border rounded-lg p-2">
                <div className="space-y-2">
                  {fileChanges.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" defaultChecked disabled={isReadOnly} />
                      <Badge variant="outline" className={getFileStatusColor(file.status)}>
                        {file.status.charAt(0).toUpperCase()}
                      </Badge>
                      <span className="font-mono">{file.path}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCommitDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={createCommit}
                disabled={isCommitting || !commitMessage.trim() || isReadOnly}
                className={isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}
              >
                {isCommitting ? "Committing..." : "Create Commit"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
