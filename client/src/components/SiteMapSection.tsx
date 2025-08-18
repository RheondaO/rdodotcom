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
  Download,
  CreditCard,
  Building,
  PieChart,
  Lightbulb,
  Edit3,
  Grid3X3,
  Sparkles,
  LineChart,
  Coins,
  TrendingDown,
  Calculator,
  Gamepad2,
  Newspaper,
  Music,
  Microscope,
  Briefcase as BriefcaseIcon,
  Globe,
  Flame
} from "lucide-react";
import { SiGithub } from "react-icons/si";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface SiteMapSectionProps {
  onNavigate: (section: string) => void;
}

export default function SiteMapSection({ onNavigate }: SiteMapSectionProps) {
  const handleExportData = () => {
    // Create comprehensive data export
    const exportData = {
      exportDate: new Date().toISOString(),
      dataType: "Belle Journal Export",
      sections: {
        health: "Health tracking data with water intake and wellness metrics",
        habits: "Habit completion records with mood and energy tracking",
        productivity: "Work time, focus sessions, and time block management",
        goals: "Personal goals with progress monitoring and achievements",
        finances: "Complete financial overview with budget, investment, and bill tracking",
        budgets: "Advanced budget management with category analytics",
        investments: "Portfolio tracking with performance metrics",
        bills: "Bill management with due dates and payment tracking",
        income: "Multiple income source tracking with recurring entries",
        groceries: "Smart shopping lists with meal planning",
        blogging: "Blog content studio with ideas, posts, and workflow management",
        content: "RotationONLY content studio with mini-game creation tools",
        apps: "Development projects with task and sprint management",
        analytics: "Social media performance and engagement metrics",
        reports: "Comprehensive progress reports and insights"
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
      icon: Sparkles,
      color: "from-pink-400 to-purple-500",
      items: [
        { key: "dashboard", label: "Dashboard Home", icon: Sparkles, description: "Daily productivity hub with quick stats and overview" }
      ]
    },
    {
      category: "Content Creation Studios",
      icon: PenTool,
      color: "from-purple-400 to-indigo-500",
      items: [
        { key: "content", label: "𝔯𝔬𝔱𝔞𝔱𝔦𝔬𝔫𝐎𝐍𝐋𝐘 Content Studio", icon: Moon, description: "Mini-game content creation for 7 brand categories (@mag, @econ, @xxx, @ext, @stem, @music, @ceo)" },
        { key: "blogging", label: "Blog Content Studio", icon: Edit3, description: "Professional blog workflow with ideas management, grid/list views, and content calendar" }
      ]
    },
    {
      category: "Productivity & Goals",
      icon: Target,
      color: "from-blue-400 to-indigo-500",
      items: [
        { key: "goals", label: "Goals & Achievements", icon: Target, description: "Personal and professional goal tracking with progress monitoring" },
        { key: "productivity", label: "Work & Time", icon: Briefcase, description: "Work hours, focus sessions, time blocks, and productivity tracking" },
        { key: "reports", label: "Reports & Analytics", icon: BarChart3, description: "Comprehensive progress reports with social media analytics integration" }
      ]
    },
    {
      category: "Financial Management",
      icon: DollarSign,
      color: "from-green-400 to-emerald-500",
      items: [
        { key: "finances", label: "Finance Dashboard", icon: DollarSign, description: "Complete financial overview with budget tracking and expense management" },
        { key: "budget", label: "Budget Management", icon: Calculator, description: "Advanced budgeting with category management and spending analytics" },
        { key: "investments", label: "Investment Tracking", icon: TrendingUp, description: "Portfolio management with performance tracking and goal monitoring" },
        { key: "bills", label: "Bill Management", icon: CreditCard, description: "Automated bill tracking with due dates and payment reminders" },
        { key: "income", label: "Income Tracking", icon: Coins, description: "Multiple income source tracking with recurring and one-time entries" }
      ]
    },
    {
      category: "Analytics & Insights",
      icon: LineChart,
      color: "from-cyan-400 to-blue-500",
      items: [
        { key: "analytics", label: "Social Media Analytics", icon: LineChart, description: "Content performance tracking across platforms with engagement metrics" },
        { key: "financial-analytics", label: "Financial Analytics", icon: PieChart, description: "Advanced financial insights with spending patterns and trend analysis" },
        { key: "productivity-analytics", label: "Productivity Analytics", icon: Activity, description: "Work efficiency metrics and time allocation analysis" }
      ]
    },
    {
      category: "Lifestyle & Planning",
      icon: ShoppingCart,
      color: "from-orange-400 to-amber-500",
      items: [
        { key: "groceries", label: "Grocery Management", icon: ShoppingCart, description: "Smart shopping lists with meal planning and inventory tracking" }
      ]
    },
    {
      category: "Health & Wellness",
      icon: Heart,
      color: "from-red-400 to-pink-500",
      items: [
        { key: "habits", label: "Habits & Mood", icon: Zap, description: "Daily habits tracking with mood and energy monitoring" },
        { key: "health", label: "Health Tracking", icon: Heart, description: "Comprehensive health metrics including water intake and wellness goals" }
      ]
    },
    {
      category: "Development & Projects",
      icon: Code2,
      color: "from-purple-400 to-indigo-500",
      items: [
        { key: "apps", label: "App Development", icon: Code2, description: "Full-stack project management with task tracking and sprint planning" },
        { key: "github-repo", label: "Belle Journal GitHub Repository", icon: SiGithub, description: "View source code for Belle Journal development", external: "https://github.com/RheondaO/LifeTrackDash.git" }
      ]
    }
  ];

  const quickActions = [
    { key: "dashboard", label: "Today's Overview", icon: Calendar, description: "See today's progress and tasks" },
    { key: "habits", label: "Log Habits", icon: CheckSquare, description: "Mark today's habits as complete" },
    { key: "productivity", label: "Start Focus Timer", icon: Timer, description: "Begin a focused work session" },
    { key: "finances", label: "Add Expense", icon: Receipt, description: "Log a new expense or transaction" },
    { key: "blogging", label: "Write Blog Post", icon: Edit3, description: "Create a new blog post with AI assistance" },
    { key: "content", label: "Design Mini-Game", icon: Gamepad2, description: "Create rotationONLY content for brand categories" },
    { key: "budget", label: "Update Budget", icon: Calculator, description: "Manage budgets and track spending" },
    { key: "investments", label: "Track Investments", icon: TrendingUp, description: "Monitor portfolio performance" },
    { key: "analytics", label: "View Analytics", icon: LineChart, description: "Check content and financial performance" },
    { key: "groceries", label: "Create Shopping List", icon: List, description: "Plan your next grocery trip" },
    { key: "goals", label: "Update Goals", icon: Target, description: "Track progress on your goals" }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-r from-pink-400 to-purple-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
          <Sparkles className="h-10 w-10 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
            Site Map
          </h1>
          <p className="text-muted-foreground dark:text-gray-300 mt-1 max-w-2xl mx-auto">
            Quick access to all sections of Belle Journal.
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
                        onClick={() => {
                          if ((item as any).external) {
                            window.open((item as any).external, '_blank', 'noopener,noreferrer');
                          } else {
                            onNavigate(item.key);
                          }
                        }}
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
              New features include: Advanced financial management with investment tracking, comprehensive blogging workflow with grid/list views, 
              rotationONLY content studio with 7 brand categories, enhanced analytics dashboard, and improved access control for public/admin users.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Export Data Button - Bottom Right */}
      <div className="flex justify-end mt-8">
        <Button 
          onClick={() => handleExportData()}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl px-6 py-3 shadow-lg font-medium"
        >
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>
    </div>
  );
}