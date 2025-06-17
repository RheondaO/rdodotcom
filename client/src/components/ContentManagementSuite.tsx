import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { 
  PenTool, 
  Plus, 
  Calendar, 
  Clock, 
  Eye,
  FileText,
  Video,
  Image,
  Layout,
  Target,
  Edit,
  Trash2
} from "lucide-react";
import { format } from "date-fns";

interface ContentItem {
  id: number;
  title: string;
  type: "blog" | "social" | "video" | "email";
  status: "draft" | "review" | "scheduled" | "published";
  platform: string;
  scheduledDate?: string;
  content: string;
  createdAt: string;
}

interface ContentManagementSuiteProps {
  selectedDate: Date;
  isReadOnly?: boolean;
}

export default function ContentManagementSuite({ selectedDate, isReadOnly = false }: ContentManagementSuiteProps) {
  const [activeView, setActiveView] = useState<"overview" | "create" | "calendar">("overview");
  const [showNewContentForm, setShowNewContentForm] = useState(false);
  const [newContent, setNewContent] = useState({
    title: "",
    type: "social" as const,
    platform: "instagram",
    content: "",
    scheduledDate: format(selectedDate, 'yyyy-MM-dd')
  });

  // Sample content data
  const [contentItems, setContentItems] = useState<ContentItem[]>([
    {
      id: 1,
      title: "Morning Motivation Post",
      type: "social",
      status: "published",
      platform: "Instagram",
      content: "Start your week with intention and purpose...",
      createdAt: "2025-06-15",
      scheduledDate: "2025-06-16"
    },
    {
      id: 2,
      title: "Weekly Newsletter",
      type: "email",
      status: "draft",
      platform: "Email",
      content: "This week's insights and updates...",
      createdAt: "2025-06-15"
    },
    {
      id: 3,
      title: "Tutorial Video",
      type: "video",
      status: "review",
      platform: "YouTube",
      content: "How to create engaging content...",
      createdAt: "2025-06-14"
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800";
      case "review": return "bg-yellow-100 text-yellow-800";
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "published": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "blog": return <FileText className="h-4 w-4" />;
      case "social": return <Image className="h-4 w-4" />;
      case "video": return <Video className="h-4 w-4" />;
      case "email": return <Layout className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const handleCreateContent = () => {
    if (!newContent.title || !newContent.content) return;
    
    const content: ContentItem = {
      id: contentItems.length + 1,
      title: newContent.title,
      type: newContent.type,
      status: "draft",
      platform: newContent.platform,
      content: newContent.content,
      scheduledDate: newContent.scheduledDate,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    };

    setContentItems([...contentItems, content]);
    setNewContent({
      title: "",
      type: "social",
      platform: "instagram",
      content: "",
      scheduledDate: format(selectedDate, 'yyyy-MM-dd')
    });
    setShowNewContentForm(false);
  };

  const todaysContent = contentItems.filter(item => 
    item.scheduledDate === format(selectedDate, 'yyyy-MM-dd')
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Content Studio</h2>
          <p className="text-gray-600 dark:text-gray-300">Plan, create, and manage your content</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={activeView === "overview" ? "default" : "outline"}
            onClick={() => setActiveView("overview")}
            className="flex items-center space-x-2"
          >
            <Layout className="h-4 w-4" />
            <span>Overview</span>
          </Button>
          <Button
            variant={activeView === "create" ? "default" : "outline"}
            onClick={() => setActiveView("create")}
            className="flex items-center space-x-2"
          >
            <PenTool className="h-4 w-4" />
            <span>Create</span>
          </Button>
          <Button
            variant={activeView === "calendar" ? "default" : "outline"}
            onClick={() => setActiveView("calendar")}
            className="flex items-center space-x-2"
          >
            <Calendar className="h-4 w-4" />
            <span>Calendar</span>
          </Button>
        </div>
      </div>

      {/* Overview */}
      {activeView === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Content Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Total Content</span>
                  <span className="font-semibold">{contentItems.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Published</span>
                  <span className="font-semibold text-green-600">
                    {contentItems.filter(c => c.status === "published").length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Scheduled</span>
                  <span className="font-semibold text-blue-600">
                    {contentItems.filter(c => c.status === "scheduled").length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">In Review</span>
                  <span className="font-semibold text-yellow-600">
                    {contentItems.filter(c => c.status === "review").length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Recent Content</CardTitle>
                {!isReadOnly && (
                  <Button 
                    onClick={() => setActiveView("create")}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>New Content</span>
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contentItems.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(item.type)}
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{item.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{item.platform}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                        {item.scheduledDate && (
                          <span className="text-xs text-gray-500">{item.scheduledDate}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Create Content */}
      {activeView === "create" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Create New Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <Input
                  value={newContent.title}
                  onChange={(e) => setNewContent({...newContent, title: e.target.value})}
                  placeholder="Content title"
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={newContent.type}
                  onChange={(e) => setNewContent({...newContent, type: e.target.value as any})}
                  className="w-full p-2 border rounded-lg"
                  disabled={isReadOnly}
                >
                  <option value="social">Social Media</option>
                  <option value="blog">Blog Post</option>
                  <option value="video">Video</option>
                  <option value="email">Email</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Platform</label>
                <Input
                  value={newContent.platform}
                  onChange={(e) => setNewContent({...newContent, platform: e.target.value})}
                  placeholder="Instagram, YouTube, etc."
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Scheduled Date</label>
                <Input
                  type="date"
                  value={newContent.scheduledDate}
                  onChange={(e) => setNewContent({...newContent, scheduledDate: e.target.value})}
                  disabled={isReadOnly}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Content</label>
              <Textarea
                value={newContent.content}
                onChange={(e) => setNewContent({...newContent, content: e.target.value})}
                placeholder="Write your content here..."
                rows={6}
                disabled={isReadOnly}
              />
            </div>
            {!isReadOnly && (
              <div className="flex space-x-2">
                <Button onClick={handleCreateContent} className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Create Content</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setNewContent({
                    title: "",
                    type: "social",
                    platform: "instagram",
                    content: "",
                    scheduledDate: format(selectedDate, 'yyyy-MM-dd')
                  })}
                >
                  Clear
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Calendar View */}
      {activeView === "calendar" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Content Calendar - {format(selectedDate, 'MMMM d, yyyy')}</CardTitle>
          </CardHeader>
          <CardContent>
            {todaysContent.length > 0 ? (
              <div className="space-y-3">
                {todaysContent.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(item.type)}
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{item.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{item.platform}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                      <Clock className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">No content scheduled for {format(selectedDate, 'MMMM d, yyyy')}</p>
                {!isReadOnly && (
                  <Button 
                    onClick={() => setActiveView("create")} 
                    className="mt-4"
                  >
                    Create Content for Today
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}