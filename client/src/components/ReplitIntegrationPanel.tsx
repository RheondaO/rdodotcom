
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  GitBranch, 
  Settings, 
  Zap, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Database,
  Webhook,
  Monitor,
  RefreshCw,
  Link,
  Eye,
  Play
} from "lucide-react";

interface ReplitService {
  name: string;
  status: "connected" | "disconnected" | "error" | "pending";
  lastSync: Date;
  endpoint?: string;
  description: string;
}

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  lastTriggered?: Date;
}

interface ReplitIntegrationPanelProps {
  isReadOnly?: boolean;
}

export default function ReplitIntegrationPanel({ isReadOnly = false }: ReplitIntegrationPanelProps) {
  const [services, setServices] = useState<ReplitService[]>([
    {
      name: "Replit API",
      status: "connected",
      lastSync: new Date(),
      endpoint: "https://api.replit.com/v1",
      description: "Core Replit platform integration"
    },
    {
      name: "Git Integration",
      status: "connected",
      lastSync: new Date(Date.now() - 5 * 60 * 1000),
      endpoint: "git://github.com/username/repo.git",
      description: "Repository monitoring and change detection"
    },
    {
      name: "Deployment API",
      status: "pending",
      lastSync: new Date(Date.now() - 30 * 60 * 1000),
      endpoint: "https://api.replit.com/deployments",
      description: "Automated deployment management"
    },
    {
      name: "File System Monitor",
      status: "connected",
      lastSync: new Date(Date.now() - 2 * 60 * 1000),
      description: "Real-time file change detection"
    }
  ]);

  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([
    {
      id: "1",
      name: "Deploy on Push",
      url: "https://your-app.replit.app/api/webhooks/deploy",
      events: ["push", "merge"],
      active: true,
      lastTriggered: new Date(Date.now() - 10 * 60 * 1000)
    },
    {
      id: "2", 
      name: "Project Updates",
      url: "https://your-app.replit.app/api/webhooks/project",
      events: ["project.created", "project.updated"],
      active: true
    }
  ]);

  const [showWebhookConfig, setShowWebhookConfig] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "error": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected": return <CheckCircle className="h-4 w-4" />;
      case "pending": return <Clock className="h-4 w-4" />;
      case "error": return <AlertCircle className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const refreshConnection = async (serviceName: string) => {
    if (isReadOnly) return;
    
    setIsRefreshing(true);
    
    // Simulate API call
    setTimeout(() => {
      setServices(prev => prev.map(service => 
        service.name === serviceName 
          ? { ...service, lastSync: new Date(), status: "connected" }
          : service
      ));
      setIsRefreshing(false);
      toast({
        title: "Connection Refreshed",
        description: `${serviceName} connection updated successfully`
      });
    }, 2000);
  };

  const testWebhook = async (webhookId: string) => {
    if (isReadOnly) return;
    
    const webhook = webhooks.find(w => w.id === webhookId);
    if (!webhook) return;

    toast({
      title: "Testing Webhook",
      description: `Sending test payload to ${webhook.name}...`
    });

    // Simulate webhook test
    setTimeout(() => {
      setWebhooks(prev => prev.map(w => 
        w.id === webhookId 
          ? { ...w, lastTriggered: new Date() }
          : w
      ));
      toast({
        title: "Webhook Test Complete",
        description: "Test payload sent successfully"
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Replit Integration
          </h3>
          <p className="text-sm text-muted-foreground dark:text-gray-400">
            Manage connections to Replit services and automation
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshConnection("all")}
            disabled={isRefreshing || isReadOnly}
            className={isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowWebhookConfig(true)}
            disabled={isReadOnly}
            className={isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Service Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <Card key={service.name} className="border-blue-100 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                    {getStatusIcon(service.status)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {service.name}
                    </h4>
                    <p className="text-xs text-muted-foreground dark:text-gray-400">
                      {service.description}
                    </p>
                  </div>
                </div>
                <Badge className={getStatusColor(service.status)}>
                  {service.status}
                </Badge>
              </div>

              <div className="space-y-2">
                {service.endpoint && (
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Link className="h-3 w-3" />
                    <span className="truncate">{service.endpoint}</span>
                  </div>
                )}
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last sync: {service.lastSync.toLocaleTimeString()}
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => refreshConnection(service.name)}
                  disabled={isRefreshing || isReadOnly}
                  className={`text-xs ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
                {service.status === "error" && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isReadOnly}
                    className={`text-red-600 border-red-300 text-xs ${
                      isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Debug
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Webhook Management */}
      <Card className="border-purple-100 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
            <Webhook className="h-5 w-5" />
            Webhook Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {webhook.name}
                      </h4>
                      <Badge className={webhook.active ? 
                        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                        "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                      }>
                        {webhook.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground dark:text-gray-400 mb-2">
                      {webhook.url}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {webhook.events.map((event) => (
                        <Badge key={event} variant="secondary" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                    {webhook.lastTriggered && (
                      <div className="text-xs text-gray-500">
                        Last triggered: {webhook.lastTriggered.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testWebhook(webhook.id)}
                    disabled={isReadOnly}
                    className={isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Test
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isReadOnly}
                    className={isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Logs
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Webhook Configuration Dialog */}
      <Dialog open={showWebhookConfig} onOpenChange={setShowWebhookConfig}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Webhook Configuration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Available Webhook Events
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-blue-700 dark:text-blue-300">
                <div>• push - Git push events</div>
                <div>• merge - Pull request merges</div>
                <div>• deploy - Deployment events</div>
                <div>• project.created - New projects</div>
                <div>• project.updated - Project changes</div>
                <div>• file.changed - File modifications</div>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground dark:text-gray-400">
              Webhooks allow real-time integration between Replit and your project management system.
              Configure endpoints to receive automatic notifications when events occur.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
