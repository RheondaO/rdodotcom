
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Eye, 
  Trash2, 
  Plus, 
  Edit, 
  FolderOpen,
  Search,
  Clock,
  User,
  Zap,
  GitCommit,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";

interface FileChange {
  id: string;
  path: string;
  type: "created" | "modified" | "deleted" | "renamed";
  timestamp: Date;
  author: string;
  size?: number;
  linesChanged?: number;
  autoDeployed: boolean;
  reviewStatus: "pending" | "approved" | "rejected";
  description?: string;
}

interface FileChangeMonitorProps {
  isReadOnly?: boolean;
}

export default function FileChangeMonitor({ isReadOnly = false }: FileChangeMonitorProps) {
  const [changes, setChanges] = useState<FileChange[]>([
    {
      id: "1",
      path: "client/src/components/ReplitIntegrationPanel.tsx",
      type: "created",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      author: "current-user",
      size: 8542,
      linesChanged: 247,
      autoDeployed: false,
      reviewStatus: "pending",
      description: "Added new Replit integration dashboard component"
    },
    {
      id: "2",
      path: "client/src/components/CICDPipelineMonitor.tsx", 
      type: "created",
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
      author: "current-user",
      size: 6234,
      linesChanged: 189,
      autoDeployed: false,
      reviewStatus: "pending",
      description: "Added CI/CD pipeline monitoring dashboard"
    },
    {
      id: "3",
      path: "client/src/components/AppDevelopmentSection.tsx",
      type: "modified",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      author: "current-user",
      linesChanged: 24,
      autoDeployed: true,
      reviewStatus: "approved",
      description: "Updated to include new integration components"
    },
    {
      id: "4",
      path: "server/routes.ts",
      type: "modified", 
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      author: "system",
      linesChanged: 45,
      autoDeployed: true,
      reviewStatus: "approved",
      description: "Added new API endpoints for Replit integration"
    }
  ]);

  const [filter, setFilter] = useState<"all" | "pending" | "deployed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChanges, setSelectedChanges] = useState<string[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  
  const { toast } = useToast();

  // Simulate real-time file monitoring
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      // Simulate new file changes being detected
      const shouldAddChange = Math.random() < 0.1; // 10% chance every 5 seconds
      
      if (shouldAddChange) {
        const newChange: FileChange = {
          id: Date.now().toString(),
          path: `client/src/components/Component${Math.floor(Math.random() * 100)}.tsx`,
          type: Math.random() > 0.7 ? "created" : "modified",
          timestamp: new Date(),
          author: "current-user",
          linesChanged: Math.floor(Math.random() * 50) + 1,
          autoDeployed: false,
          reviewStatus: "pending",
          description: "Auto-detected file change"
        };

        setChanges(prev => [newChange, ...prev.slice(0, 19)]); // Keep only last 20 changes
        
        toast({
          title: "File Change Detected",
          description: `${newChange.type} - ${newChange.path}`,
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isMonitoring, toast]);

  const filteredChanges = changes.filter(change => {
    const matchesFilter = filter === "all" || 
      (filter === "pending" && change.reviewStatus === "pending") ||
      (filter === "deployed" && change.autoDeployed);
    
    const matchesSearch = !searchQuery || 
      change.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      change.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "created": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "modified": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "deleted": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "renamed": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "created": return <Plus className="h-4 w-4" />;
      case "modified": return <Edit className="h-4 w-4" />;
      case "deleted": return <Trash2 className="h-4 w-4" />;
      case "renamed": return <FolderOpen className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getReviewStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    }
  };

  const approveChange = (changeId: string) => {
    if (isReadOnly) return;
    
    setChanges(prev => prev.map(change => 
      change.id === changeId 
        ? { ...change, reviewStatus: "approved" as const }
        : change
    ));
    
    toast({
      title: "Change Approved",
      description: "File change has been approved for deployment"
    });
  };

  const deployChanges = (changeIds: string[]) => {
    if (isReadOnly) return;
    
    setChanges(prev => prev.map(change => 
      changeIds.includes(change.id)
        ? { ...change, autoDeployed: true, reviewStatus: "approved" as const }
        : change
    ));
    
    setSelectedChanges([]);
    
    toast({
      title: "Deployment Triggered",
      description: `${changeIds.length} changes deployed successfully`
    });
  };

  const toggleChangeSelection = (changeId: string) => {
    setSelectedChanges(prev => 
      prev.includes(changeId)
        ? prev.filter(id => id !== changeId)
        : [...prev, changeId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            File Change Monitor
          </h3>
          <p className="text-sm text-muted-foreground dark:text-gray-400">
            Real-time file system monitoring and change detection
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-muted-foreground">
              {isMonitoring ? 'Monitoring' : 'Stopped'}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMonitoring(!isMonitoring)}
            disabled={isReadOnly}
            className={isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}
          >
            {isMonitoring ? 'Stop' : 'Start'} Monitoring
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {changes.length}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Total Changes</div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {changes.filter(c => c.reviewStatus === "pending").length}
            </div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400">Pending Review</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {changes.filter(c => c.autoDeployed).length}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">Auto-Deployed</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {changes.reduce((sum, c) => sum + (c.linesChanged || 0), 0)}
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-400">Lines Changed</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search files or descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {["all", "pending", "deployed"].map((filterOption) => (
            <Button
              key={filterOption}
              variant={filter === filterOption ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(filterOption as typeof filter)}
              className="capitalize"
            >
              {filterOption}
            </Button>
          ))}
        </div>
        {selectedChanges.length > 0 && (
          <Button
            size="sm"
            onClick={() => deployChanges(selectedChanges)}
            disabled={isReadOnly}
            className={`bg-gradient-to-r from-green-400 to-emerald-500 text-white ${
              isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Zap className="h-4 w-4 mr-2" />
            Deploy Selected ({selectedChanges.length})
          </Button>
        )}
      </div>

      {/* Changes List */}
      <Card className="border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <FileText className="h-5 w-5" />
            Recent Changes ({filteredChanges.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {filteredChanges.map((change) => (
                <div key={change.id} className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedChanges.includes(change.id)}
                      onChange={() => toggleChangeSelection(change.id)}
                      disabled={isReadOnly}
                      className={`mt-1 ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getTypeColor(change.type)}>
                          {getTypeIcon(change.type)}
                          <span className="ml-1 capitalize">{change.type}</span>
                        </Badge>
                        <Badge className={getReviewStatusColor(change.reviewStatus)}>
                          {change.reviewStatus === "approved" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {change.reviewStatus === "pending" && <AlertCircle className="h-3 w-3 mr-1" />}
                          {change.reviewStatus}
                        </Badge>
                        {change.autoDeployed && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            <Zap className="h-3 w-3 mr-1" />
                            Deployed
                          </Badge>
                        )}
                      </div>

                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                        {change.path}
                      </h4>
                      
                      {change.description && (
                        <p className="text-sm text-muted-foreground dark:text-gray-400 mb-2">
                          {change.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-muted-foreground dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {change.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(change.timestamp, 'MMM dd, HH:mm:ss')}
                        </div>
                        {change.linesChanged && (
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {change.linesChanged} lines
                          </div>
                        )}
                        {change.size && (
                          <div className="text-xs">
                            {(change.size / 1024).toFixed(1)}KB
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {change.reviewStatus === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => approveChange(change.id)}
                          disabled={isReadOnly}
                          className={`text-green-600 border-green-300 hover:bg-green-50 ${
                            isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredChanges.length === 0 && (
                <div className="text-center py-8 text-muted-foreground dark:text-gray-400">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No file changes found</p>
                  <p className="text-sm">
                    {filter === "all" 
                      ? "No recent file changes detected"
                      : `No ${filter} changes found`
                    }
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
