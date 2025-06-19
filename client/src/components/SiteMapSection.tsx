import { 
  Home, 
  Heart, 
  Target,
  Briefcase, 
  BarChart3,
  DollarSign, 
  ShoppingCart,
  Zap,
  PenTool,
  Calendar,
  Clock,
  User,
  Settings,
  TrendingUp,
  Activity,
  Pill,
  CheckSquare,
  Timer,
  Wallet,
  Receipt,
  List,
  FileText,
  Video,
  Image,
  BookOpen,
  Coffee,
  Utensils,
  Dumbbell,
  Moon,
  Sun,
  Code2,
  Download
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface SiteMapSectionProps {
  onNavigate: (section: string) => void;
  isReadOnly?: boolean;
}

export default function SiteMapSection({ onNavigate, isReadOnly = false }: SiteMapSectionProps) {
  const handleExportData = () => {
    // Create sample data export
    const exportData = {
      exportDate: new Date().toISOString(),
      dataType: "Belle Journal Export",
      sections: {
        health: "Health tracking data",
        habits: "Habit completion records",
        productivity: "Work time and focus sessions",
        goals: "Personal goals and achievements",
        finances: "Financial tracking and budgets",
        groceries: "Shopping lists and items",
        content: "Content management records",
        apps: "Development projects and tasks"
      }
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `belle-journal-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const siteMapSections = [
    {
      category: "Main Dashboard",
      icon: Home,
      color: "from-pink-400 to-purple-500",
      items: [
        { key: "dashboard", label: "Dashboard Home", icon: Home, description: "Daily productivity hub with quick stats" }
      ]
    },
    {
      category: "Content Studio",
      icon: Moon,
      color: "from-purple-400 to-indigo-500",
      items: [
        { key: "content", label: "𝔯𝔬𝔱𝔞𝔱𝔦𝔬𝔫𝐎𝐍𝐋𝐘 Content Studio", icon: Moon, description: "Astrological content management and mini-game design studio" }
      ]
    },
    {
      category: "Productivity & Goals",
      icon: Target,
      color: "from-blue-400 to-indigo-500",
      items: [
        { key: "goals", label: "Goals & Achievements", icon: Target, description: "Personal and professional goal tracking" },
        { key: "productivity", label: "Work & Time", icon: Briefcase, description: "Work hours, focus sessions, and time blocks" },
        { key: "reports", label: "Reports & Analytics", icon: BarChart3, description: "Progress reports and data insights" }
      ]
    },
    {
      category: "Lifestyle & Planning",
      icon: ShoppingCart,
      color: "from-orange-400 to-amber-500",
      items: [
        { key: "groceries", label: "Grocery Management", icon: ShoppingCart, description: "Shopping lists and meal planning" }
      ]
    },
    {
      category: "Financial Management",
      icon: DollarSign,
      color: "from-green-400 to-emerald-500",
      items: [
        { key: "finances", label: "Finance Tracker", icon: DollarSign, description: "Budget, bills, and expense tracking" }
      ]
    },
    {
      category: "Health & Wellness",
      icon: Heart,
      color: "from-red-400 to-pink-500",
      items: [
        { key: "habits", label: "Habits & Mood", icon: Zap, description: "Daily habits, mood, and energy tracking" },
        { key: "health", label: "Health Tracking", icon: Heart, description: "Basic health metrics and wellness" }
      ]
    },
    {
      category: "Development & Projects",
      icon: Code2,
      color: "from-purple-400 to-indigo-500",
      items: [
        { key: "apps", label: "App Development", icon: Code2, description: "Project management for software development" }
      ]
    }
  ];

  const quickActions = [
    { key: "dashboard", label: "Today's Overview", icon: Calendar, description: "See today's progress and tasks" },
    { key: "habits", label: "Log Habits", icon: CheckSquare, description: "Mark today's habits as complete" },
    { key: "productivity", label: "Start Focus Timer", icon: Timer, description: "Begin a focused work session" },
    { key: "finances", label: "Add Expense", icon: Receipt, description: "Log a new expense or transaction" },
    { key: "groceries", label: "Create Shopping List", icon: List, description: "Plan your next grocery trip" },
    { key: "goals", label: "Update Goals", icon: TrendingUp, description: "Track progress on your goals" },
    { key: "content", label: "Design Mini-Game", icon: Moon, description: "Create content for 𝔯𝔬𝔱𝔞𝔱𝔦𝔬𝔫𝐎𝐍𝐋𝐘 Content Studio" }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-r from-pink-400 to-purple-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
          <Home className="h-10 w-10 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
            Site Map
          </h1>
          <p className="text-lg text-muted-foreground dark:text-gray-300 max-w-2xl mx-auto">
            Quick access to all sections of Belle Journal. Click any item below to navigate directly to that page.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="border-pink-100 dark:border-purple-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-heading text-pink-600 dark:text-pink-400 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common tasks you can access with one click
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.key}
                  onClick={() => onNavigate(action.key)}
                  variant="outline"
                  className="h-auto p-4 text-left border-pink-100 hover:bg-pink-50 dark:border-purple-800 dark:hover:bg-purple-900 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-start space-x-3 w-full">
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-500 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 text-left min-w-0 pr-2">
                      <div className="font-medium text-gray-900 dark:text-white break-words hyphens-auto leading-tight mb-1">{action.label}</div>
                      <div className="text-sm text-muted-foreground dark:text-gray-400 break-words hyphens-auto leading-relaxed whitespace-normal">{action.description}</div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* All Sections */}
      <div className="space-y-6">
        <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white text-center">
          All Sections
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {siteMapSections.map((section) => {
            const CategoryIcon = section.icon;
            return (
              <Card key={section.category} className="border-pink-100 dark:border-purple-800 shadow-lg hover:shadow-xl transition-all duration-200 min-h-[200px]">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-heading text-pink-600 dark:text-pink-400 flex items-center gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-r ${section.color} rounded-lg flex items-center justify-center shadow-sm flex-shrink-0`}>
                      <CategoryIcon className="h-5 w-5 text-white" />
                    </div>
                    <span className="break-words leading-tight">{section.category}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.key}
                        onClick={() => onNavigate(item.key)}
                        variant="ghost"
                        className="w-full h-auto p-4 text-left hover:bg-pink-50 dark:hover:bg-purple-900 rounded-xl transition-all duration-200 justify-start group"
                      >
                        <div className="flex items-start space-x-3 w-full">
                          <div className="w-10 h-10 bg-gradient-to-r from-pink-200 to-purple-200 dark:from-pink-800 dark:to-purple-800 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                            <Icon className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                          </div>
                          <div className="flex-1 text-left min-w-0 pr-2">
                            <div className="font-medium text-gray-900 dark:text-white break-words hyphens-auto leading-tight mb-1">{item.label}</div>
                            <div className="text-sm text-muted-foreground dark:text-gray-400 break-words hyphens-auto leading-relaxed whitespace-normal">{item.description}</div>
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Navigation Help */}
      <Card className="border-pink-100 dark:border-purple-800 shadow-lg bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950 dark:to-purple-950">
        <CardContent className="p-6">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-heading font-semibold text-pink-600 dark:text-pink-400">
              Navigation Tips
            </h3>
            <p className="text-sm text-muted-foreground dark:text-gray-300 max-w-2xl mx-auto">
              Use the sidebar navigation for quick access to any section. The Site Map provides an overview of all available features. 
              You can also collapse the sidebar for more screen space using the toggle button.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Export Data Button - Bottom Right */}
      <div className="flex justify-end mt-8">
        <Button 
          onClick={() => !isReadOnly && handleExportData()}
          disabled={isReadOnly}
          className={`bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl px-6 py-3 shadow-lg font-medium ${
            isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>
    </div>
  );
}