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
  Sun
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SiteMapSectionProps {
  onNavigate: (section: string) => void;
}

export default function SiteMapSection({ onNavigate }: SiteMapSectionProps) {
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
      category: "Health & Wellness",
      icon: Heart,
      color: "from-red-400 to-pink-500",
      items: [
        { key: "health", label: "Health Tracking", icon: Heart, description: "Basic health metrics and wellness" },
        { key: "habits", label: "Habits & Mood", icon: Zap, description: "Daily habits, mood, and energy tracking" }
      ]
    },
    {
      category: "Productivity & Goals",
      icon: Target,
      color: "from-blue-400 to-indigo-500",
      items: [
        { key: "productivity", label: "Work & Time", icon: Briefcase, description: "Work hours, focus sessions, and time blocks" },
        { key: "goals", label: "Goals & Achievements", icon: Target, description: "Personal and professional goal tracking" },
        { key: "reports", label: "Reports & Analytics", icon: BarChart3, description: "Progress reports and data insights" }
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
      category: "Lifestyle & Planning",
      icon: ShoppingCart,
      color: "from-orange-400 to-amber-500",
      items: [
        { key: "groceries", label: "Grocery Management", icon: ShoppingCart, description: "Shopping lists and meal planning" },
        { key: "content", label: "Content Creation", icon: PenTool, description: "Content planning and scheduling" }
      ]
    }
  ];

  const quickActions = [
    { key: "dashboard", label: "Today's Overview", icon: Calendar, description: "See today's progress and tasks" },
    { key: "habits", label: "Log Habits", icon: CheckSquare, description: "Mark today's habits as complete" },
    { key: "productivity", label: "Start Focus Timer", icon: Timer, description: "Begin a focused work session" },
    { key: "finances", label: "Add Expense", icon: Receipt, description: "Log a new expense or transaction" },
    { key: "groceries", label: "Create Shopping List", icon: List, description: "Plan your next grocery trip" },
    { key: "goals", label: "Update Goals", icon: TrendingUp, description: "Track progress on your goals" }
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
                  className="h-auto p-4 text-left border-pink-100 hover:bg-pink-50 dark:border-purple-800 dark:hover:bg-purple-900 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start space-x-3 w-full">
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-500 rounded-lg flex items-center justify-center shadow-sm">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900 dark:text-white">{action.label}</div>
                      <div className="text-sm text-muted-foreground dark:text-gray-400 mt-1">{action.description}</div>
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
              <Card key={section.category} className="border-pink-100 dark:border-purple-800 shadow-lg hover:shadow-xl transition-all duration-200">
                <CardHeader>
                  <CardTitle className="text-lg font-heading text-pink-600 dark:text-pink-400 flex items-center gap-3">
                    <div className={`w-8 h-8 bg-gradient-to-r ${section.color} rounded-lg flex items-center justify-center shadow-sm`}>
                      <CategoryIcon className="h-4 w-4 text-white" />
                    </div>
                    {section.category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.key}
                        onClick={() => onNavigate(item.key)}
                        variant="ghost"
                        className="w-full h-auto p-4 text-left hover:bg-pink-50 dark:hover:bg-purple-900 rounded-xl transition-all duration-200 justify-start"
                      >
                        <div className="flex items-start space-x-3 w-full">
                          <div className="w-8 h-8 bg-gradient-to-r from-pink-200 to-purple-200 dark:from-pink-800 dark:to-purple-800 rounded-lg flex items-center justify-center shadow-sm">
                            <Icon className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-medium text-gray-900 dark:text-white">{item.label}</div>
                            <div className="text-sm text-muted-foreground dark:text-gray-400 mt-1">{item.description}</div>
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
    </div>
  );
}