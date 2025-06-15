import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  PenTool, 
  Plus, 
  Eye,
  Edit
} from "lucide-react";
import { format } from "date-fns";
import { CONTENT_STATUSES } from "../lib/constants";

interface ContentCategory {
  id: number;
  name: string;
  description: string;
  color: string;
  icon: string;
  brand?: string;
  isActive: boolean;
  createdAt: string;
}

interface ContentPiece {
  id: number;
  contentTypeId: number;
  title: string;
  description: string;
  status: "idea" | "planning" | "draft" | "review" | "approved" | "scheduled" | "published" | "archived";
  targetDate: string | null;
  scheduledDate: string | null;
  publishedDate: string | null;
  platforms: string[];
  tags: string[];
  notes: string;
  estimatedDuration: number | null;
  actualDuration: number | null;
  assignee: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ContentManagementSuiteProps {
  selectedDate: Date;
  isReadOnly?: boolean;
}

export default function ContentManagementSuite({ selectedDate, isReadOnly = false }: ContentManagementSuiteProps) {
  const [activeView, setActiveView] = useState<"overview" | "categories" | "content" | "calendar" | "analytics">("overview");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Fetch real data from API
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/content-categories'],
    select: (data: any[]) => data || []
  });

  const { data: contentTypes = [], isLoading: contentTypesLoading } = useQuery({
    queryKey: ['/api/content-types'],
    select: (data: any[]) => data || []
  });

  const { data: contentPieces = [], isLoading: contentPiecesLoading } = useQuery({
    queryKey: ['/api/content-pieces'],
    select: (data: any[]) => data || []
  });

  const { data: contentProgress = [], isLoading: contentProgressLoading } = useQuery({
    queryKey: ['/api/content-progress'],
    select: (data: any[]) => data || []
  });

  // Brand definitions
  const brands = [
    { id: "rotationONLY", name: "𝔯𝔬𝔱𝔞𝔱𝔦𝔬𝔫𝐎𝐍𝐋𝐘 Magazine", icon: "🌙", color: "#8B5CF6" },
    { id: "reallyObvi", name: "Really Obvi Media Lab", icon: "🧪", color: "#3B82F6" },
    { id: "personal", name: "Personal Brand", icon: "✨", color: "#EC4899" },
    { id: "misc", name: "Misc", icon: "📦", color: "#10B981" }
  ];

  // Calculate content statistics from real data
  const getContentStats = () => {
    const totalContent = contentPieces.length;
    const inProgress = contentPieces.filter(cp => cp.status === 'draft' || cp.status === 'review').length;
    const scheduled = contentPieces.filter(cp => cp.status === 'scheduled').length;
    const published = contentPieces.filter(cp => cp.status === 'published').length;

    return {
      totalContent,
      inProgress,
      scheduled,
      published
    };
  };

  const contentStats = getContentStats();

  // Filter content based on search and filters
  const filteredContent = contentPieces.filter(content => {
    const matchesSearch = searchQuery === "" || 
      content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === null || content.contentTypeId === selectedCategory;
    const matchesStatus = selectedStatus === null || content.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get recent content (last 7 days)
  const recentContent = contentPieces
    .filter(cp => {
      const createdDate = new Date(cp.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdDate >= weekAgo;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const isLoading = categoriesLoading || contentTypesLoading || contentPiecesLoading || contentProgressLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            Content Management Suite
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading content data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenTool className="h-5 w-5" />
          Content Management Suite
        </CardTitle>
        <div className="flex flex-wrap gap-2">
          {["overview", "categories", "content", "calendar", "analytics"].map((view) => (
            <Button
              key={view}
              variant={activeView === view ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveView(view as any)}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {activeView === "overview" && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{contentStats.totalContent}</div>
                  <div className="text-sm text-muted-foreground">Total Content</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{contentStats.inProgress}</div>
                  <div className="text-sm text-muted-foreground">In Progress</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-orange-600">{contentStats.scheduled}</div>
                  <div className="text-sm text-muted-foreground">Scheduled</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">{contentStats.published}</div>
                  <div className="text-sm text-muted-foreground">Published</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Content */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Recent Content</h3>
              {recentContent.length === 0 ? (
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center text-muted-foreground">
                      No recent content found. Create your first content piece to get started.
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {recentContent.map((content) => (
                    <Card key={content.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{content.title}</h4>
                            <p className="text-sm text-muted-foreground">{content.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{content.status}</Badge>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(content.createdAt), 'MMM d')}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button disabled={isReadOnly}>
                <Plus className="h-4 w-4 mr-2" />
                New Content
              </Button>
              <Button variant="outline" disabled={isReadOnly}>
                <Plus className="h-4 w-4 mr-2" />
                New Category
              </Button>
            </div>
          </div>
        )}

        {activeView === "content" && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedStatus || "all"} onValueChange={(value) => setSelectedStatus(value === "all" ? null : value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {CONTENT_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Content List */}
            <div className="space-y-2">
              {filteredContent.length === 0 ? (
                <Card>
                  <CardContent className="p-8">
                    <div className="text-center text-muted-foreground">
                      {contentPieces.length === 0 
                        ? "No content found. Create your first content piece to get started."
                        : "No content matches your current filters."
                      }
                    </div>
                  </CardContent>
                </Card>
              ) : (
                filteredContent.map((content) => (
                  <Card key={content.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{content.title}</h4>
                            <Badge variant="outline">{content.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{content.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {content.targetDate && (
                              <span>Target: {format(new Date(content.targetDate), 'MMM d, yyyy')}</span>
                            )}
                            {content.estimatedDuration && (
                              <span>Est: {content.estimatedDuration}min</span>
                            )}
                            {content.platforms.length > 0 && (
                              <span>Platforms: {content.platforms.join(', ')}</span>
                            )}
                          </div>
                          {content.tags.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {content.tags.map((tag: string) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" disabled={isReadOnly}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {activeView === "categories" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="p-8">
                    <div className="text-center text-muted-foreground">
                      No content categories found. Create your first category to organize your content.
                    </div>
                  </CardContent>
                </Card>
              ) : (
                categories.map((category: ContentCategory) => (
                  <Card key={category.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: category.color }}
                        >
                          {category.icon}
                        </div>
                        <h3 className="font-medium">{category.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                      {category.brand && (
                        <Badge variant="outline" className="mb-2">
                          {brands.find(b => b.id === category.brand)?.name || category.brand}
                        </Badge>
                      )}
                      <div className="text-xs text-muted-foreground">
                        Created: {format(new Date(category.createdAt), 'MMM d, yyyy')}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {activeView === "analytics" && (
          <div className="space-y-6">
            <div className="text-center py-8 text-muted-foreground">
              Content analytics will be available when you have published content.
            </div>
          </div>
        )}

        {activeView === "calendar" && (
          <div className="space-y-6">
            <div className="text-center py-8 text-muted-foreground">
              Content calendar view will show scheduled and published content by date.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}