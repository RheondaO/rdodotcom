
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { ScrollArea } from "./ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  GitBranch, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Download,
  Upload,
  Monitor,
  Settings,
  Eye,
  Terminal
} from "lucide-react";
import { format } from "date-fns";

interface DeploymentStage {
  id: string;
  name: string;
  status: "pending" | "running" | "success" | "failed" | "skipped";
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  logs?: string[];
}

interface Deployment {
  id: string;
  commitHash: string;
  branch: string;
  author: string;
  message: string;
  status: "queued" | "running" | "success" | "failed" | "cancelled";
  stages: DeploymentStage[];
  startTime: Date;
  endTime?: Date;
  environment: "development" | "staging" | "production";
  url?: string;
}

interface BuildLog {
  id: string;
  timestamp: Date;
  level: "info" | "warn" | "error";
  message: string;
  source: string;
}

interface CICDPipelineMonitorProps {
  isReadOnly?: boolean;
}

export default function CICDPipelineMonitor({ isReadOnly = false }: CICDPipelineMonitorProps) {
  const [deployments, setDeployments] = useState<Deployment[]>([
    {
      id: "deploy_1",
      commitHash: "a1b2c3d",
      branch: "main",
      author: "developer",
      message: "Add Replit integration features",
      status: "running",
      startTime: new Date(Date.now() - 5 * 60 * 1000),
      environment: "production",
      stages: [
        {
          id: "build",
          name: "Build",
          status: "success",
          startTime: new Date(Date.now() - 5 * 60 * 1000),
          endTime: new Date(Date.now() - 3 * 60 * 1000),
          duration: 120
        },
        {
          id: "test",
          name: "Test",
          status: "success",
          startTime: new Date(Date.now() - 3 * 60 * 1000),
          endTime: new Date(Date.now() - 2 * 60 * 1000),
          duration: 60
        },
        {
          id: "deploy",
          name: "Deploy",
          status: "running",
          startTime: new Date(Date.now() - 2 * 60 * 1000)
        }
      ]
    },
    {
      id: "deploy_2",
      commitHash: "x9y8z7w",
      branch: "feature/ui-updates",
      author: "designer",
      message: "Update UI components and styling",
      status: "success",
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 90 * 60 * 1000),
      environment: "staging",
      url: "https://staging.your-app.replit.app",
      stages: [
        {
          id: "build",
          name: "Build",
          status: "success",
          duration: 95
        },
        {
          id: "test",
          name: "Test",
          status: "success",
          duration: 45
        },
        {
          id: "deploy",
          name: "Deploy",
          status: "success",
          duration: 30
        }
      ]
    }
  ]);

  const [selectedDeployment, setSelectedDeployment] = useState<string | null>(null);
  const [buildLogs, setBuildLogs] = useState<BuildLog[]>([
    {
      id: "1",
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      level: "info",
      message: "Starting deployment process...",
      source: "deploy"
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 90 * 1000),
      level: "info",
      message: "Building application...",
      source: "build"
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 60 * 1000),
      level: "info",
      message: "Running tests...",
      source: "test"
    },
    {
      id: "4",
      timestamp: new Date(Date.now() - 30 * 1000),
      level: "info",
      message: "Deploying to production...",
      source: "deploy"
    }
  ]);

  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "running": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "failed": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return <CheckCircle className="h-4 w-4" />;
      case "running": return <Play className="h-4 w-4" />;
      case "failed": return <XCircle className="h-4 w-4" />;
      case "pending": return <Clock className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const triggerDeployment = () => {
    if (isReadOnly) return;
    
    const newDeployment: Deployment = {
      id: `deploy_${Date.now()}`,
      commitHash: "f5e4d3c",
      branch: "main",
      author: "current-user",
      message: "Manual deployment trigger",
      status: "queued",
      startTime: new Date(),
      environment: "production",
      stages: [
        { id: "build", name: "Build", status: "pending" },
        { id: "test", name: "Test", status: "pending" },
        { id: "deploy", name: "Deploy", status: "pending" }
      ]
    };

    setDeployments(prev => [newDeployment, ...prev]);
    toast({
      title: "Deployment Triggered",
      description: "New deployment has been queued"
    });
  };

  const cancelDeployment = (deploymentId: string) => {
    if (isReadOnly) return;
    
    setDeployments(prev => prev.map(d => 
      d.id === deploymentId ? { ...d, status: "cancelled" as const } : d
    ));
    toast({
      title: "Deployment Cancelled",
      description: "Deployment has been stopped"
    });
  };

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case "production": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "staging": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default: return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            CI/CD Pipeline
          </h3>
          <p className="text-sm text-muted-foreground dark:text-gray-400">
            Monitor deployments and build status
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={triggerDeployment}
            disabled={isReadOnly}
            className={isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}
          >
            <Upload className="h-4 w-4 mr-2" />
            Deploy
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isReadOnly}
            className={isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Pipeline Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {deployments.filter(d => d.status === "running").length}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Running</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {deployments.filter(d => d.status === "success").length}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">Success</div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {deployments.filter(d => d.status === "failed").length}
            </div>
            <div className="text-sm text-red-600 dark:text-red-400">Failed</div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {deployments.filter(d => d.status === "queued").length}
            </div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400">Queued</div>
          </CardContent>
        </Card>
      </div>

      {/* Deployment History */}
      <Card className="border-purple-100 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
            <GitBranch className="h-5 w-5" />
            Deployment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deployments.map((deployment) => (
              <div key={deployment.id} className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getStatusColor(deployment.status)}>
                        {getStatusIcon(deployment.status)}
                        <span className="ml-1">{deployment.status}</span>
                      </Badge>
                      <Badge className={getEnvironmentColor(deployment.environment)}>
                        {deployment.environment}
                      </Badge>
                      <span className="text-sm font-mono text-gray-500">
                        {deployment.commitHash}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      {deployment.message}
                    </h4>
                    <div className="text-sm text-muted-foreground dark:text-gray-400 space-y-1">
                      <div>Branch: <span className="font-mono">{deployment.branch}</span></div>
                      <div>Author: {deployment.author}</div>
                      <div>Started: {format(deployment.startTime, 'MMM dd, HH:mm:ss')}</div>
                      {deployment.endTime && (
                        <div>Duration: {Math.round((deployment.endTime.getTime() - deployment.startTime.getTime()) / 1000)}s</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Deployment Stages */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
                  {deployment.stages.map((stage) => (
                    <div key={stage.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
                      {getStatusIcon(stage.status)}
                      <span className="text-sm font-medium">{stage.name}</span>
                      {stage.duration && (
                        <span className="text-xs text-gray-500 ml-auto">{stage.duration}s</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedDeployment(deployment.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Logs
                  </Button>
                  {deployment.url && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(deployment.url, '_blank')}
                    >
                      <Monitor className="h-4 w-4 mr-1" />
                      View Site
                    </Button>
                  )}
                  {deployment.status === "running" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => cancelDeployment(deployment.id)}
                      disabled={isReadOnly}
                      className={`text-red-600 border-red-300 ${
                        isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Pause className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Build Logs */}
      {selectedDeployment && (
        <Card className="border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Terminal className="h-5 w-5" />
              Build Logs - {selectedDeployment}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedDeployment(null)}
                className="ml-auto"
              >
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64 w-full bg-black dark:bg-gray-900 rounded p-4 font-mono text-sm">
              <div className="space-y-1">
                {buildLogs.map((log) => (
                  <div key={log.id} className="flex gap-3">
                    <span className="text-gray-400 text-xs">
                      {format(log.timestamp, 'HH:mm:ss')}
                    </span>
                    <span className={`text-xs uppercase ${
                      log.level === 'error' ? 'text-red-400' :
                      log.level === 'warn' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {log.level}
                    </span>
                    <span className="text-gray-300">[{log.source}]</span>
                    <span className="text-white">{log.message}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
