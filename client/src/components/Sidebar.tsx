import { 
  Home, 
  Heart, 
  Target,
  Briefcase, 
  BarChart3,
  DollarSign, 
  ShoppingCart, 
  Plus,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Menu,
  X,
  Zap,
  PenTool,
  Map,
  Code2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { format, addDays, subDays } from "date-fns";
import { useDailyData } from "@/hooks/use-daily-data";
import { useTheme } from "@/hooks/use-theme";

type ViewType = "dashboard" | "health" | "habits" | "productivity" | "goals" | "reports" | "finances" | "groceries" | "content" | "apps" | "sitemap";

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  onQuickAdd: () => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ activeView, onViewChange, onQuickAdd, selectedDate, onDateChange, isCollapsed, onToggleCollapse }: SidebarProps) {
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const { data: dailyEntry } = useDailyData(dateString);
  const { theme, toggleTheme } = useTheme();

  const goToPreviousDay = () => {
    onDateChange(subDays(selectedDate, 1));
  };

  const goToNextDay = () => {
    onDateChange(addDays(selectedDate, 1));
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const navItems = [
    { key: "dashboard" as ViewType, label: "Dashboard", icon: Home },
    { key: "health" as ViewType, label: "Health", icon: Heart },
    { key: "habits" as ViewType, label: "Habits", icon: Zap },
    { key: "productivity" as ViewType, label: "Productivity", icon: Briefcase },
    { key: "goals" as ViewType, label: "Goals", icon: Target },
    { key: "reports" as ViewType, label: "Reports", icon: BarChart3 },
    { key: "finances" as ViewType, label: "Finances", icon: DollarSign },
    { key: "groceries" as ViewType, label: "Groceries", icon: ShoppingCart },
    { key: "content" as ViewType, label: "Content", icon: PenTool },
    { key: "apps" as ViewType, label: "App Development", icon: Code2 },
    { key: "sitemap" as ViewType, label: "Site Map", icon: Map },
  ];

  // Calculate progress metrics
  const waterIntake = dailyEntry?.waterIntake || 0;
  const waterProgress = Math.min((waterIntake / 8) * 100, 100);
  
  const mealCount = [
    dailyEntry?.breakfastCompleted,
    dailyEntry?.lunchCompleted,
    dailyEntry?.dinnerCompleted
  ].filter(Boolean).length;

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-80'} transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-r border-pink-100 dark:border-purple-800 flex flex-col shadow-xl`}>
      {/* Toggle Button */}
      <div className="p-4 border-b border-pink-100 dark:border-purple-800">
        <Button
          onClick={onToggleCollapse}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-pink-100 dark:hover:bg-purple-800"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>
      
      {/* Logo and Date - Hidden when collapsed */}
      {!isCollapsed && (
        <div className="p-6 border-b border-pink-100 dark:border-purple-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-500 dark:from-pink-500 dark:to-purple-600 rounded-2xl flex items-center justify-center shadow-md">
                <Sparkles className="text-white text-lg h-6 w-6" />
              </div>
              <h1 className="text-2xl font-heading font-bold bg-gradient-to-r from-pink-500 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
                Belle Journal
              </h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-8 w-8 p-0 hover:bg-pink-100 dark:hover:bg-purple-800"
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4 text-pink-600 dark:text-pink-400" />
              ) : (
                <Sun className="h-4 w-4 text-pink-600 dark:text-pink-400" />
              )}
            </Button>
          </div>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground dark:text-white">
              <span className="font-script text-base">Selected: </span>
              <span className="font-medium text-pink-700 dark:text-white">
                {format(selectedDate, 'MMMM d, yyyy')}
              </span>
            </div>
            
            {/* Date Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPreviousDay}
                className="h-8 w-8 p-0 hover:bg-pink-100 rounded-xl"
              >
                <ChevronLeft className="h-4 w-4 text-pink-600" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={goToToday}
                className="text-xs px-3 py-1 h-7 hover:bg-pink-100 dark:hover:bg-pink-900 rounded-lg text-pink-600 dark:text-white font-medium"
              >
                Today
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNextDay}
                className="h-8 w-8 p-0 hover:bg-pink-100 rounded-xl"
              >
                <ChevronRight className="h-4 w-4 text-pink-600" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats - Hidden when collapsed */}
      {!isCollapsed && (
        <div className="p-6 border-b border-pink-100 dark:border-purple-800">
          <h3 className="text-sm font-heading font-semibold text-pink-600 dark:text-white uppercase tracking-wide mb-4">
            Today's Progress ✨
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white/60 dark:bg-gray-800/60 rounded-xl p-3 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full shadow-sm"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-white">Water</span>
              </div>
              <div className="flex items-center space-x-2">
                <Progress value={waterProgress} className="w-16 h-2" />
                <span className="text-xs text-muted-foreground dark:text-white font-medium">{waterIntake}/8</span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-white/60 dark:bg-gray-800/60 rounded-xl p-3 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full shadow-sm"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-white">Exercise</span>
              </div>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm ${
                dailyEntry?.exerciseCompleted ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-gray-200'
              }`}>
                {dailyEntry?.exerciseCompleted && (
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between bg-white/60 dark:bg-gray-800/60 rounded-xl p-3 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full shadow-sm"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-white">Meals</span>
              </div>
              <span className="text-xs text-muted-foreground dark:text-white font-medium">{mealCount}/3</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation - Full view when expanded */}
      {!isCollapsed && (
        <nav className="flex-1 p-6">
          <h3 className="text-sm font-heading font-semibold text-pink-600 dark:text-white uppercase tracking-wide mb-4">
            Categories 💖
          </h3>
          <ul className="space-y-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.key;
              
              return (
                <li key={item.key}>
                  <button
                    onClick={() => onViewChange(item.key)}
                    className={`w-full flex items-center space-x-3 p-4 rounded-2xl transition-all duration-200 shadow-sm ${
                      isActive
                        ? 'bg-gradient-to-r from-pink-400 to-purple-500 dark:from-pink-500 dark:to-purple-600 text-white font-medium shadow-lg transform scale-105'
                        : 'hover:bg-pink-50 dark:hover:bg-purple-900 text-gray-600 dark:text-gray-300 hover:shadow-md'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {/* Collapsed Navigation - Icons Only */}
      {isCollapsed && (
        <nav className="flex-1 p-2">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.key;
              
              return (
                <li key={item.key}>
                  <button
                    onClick={() => onViewChange(item.key)}
                    className={`w-full flex items-center justify-center p-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-pink-400 to-purple-500 dark:from-pink-500 dark:to-purple-600 text-white shadow-lg'
                        : 'hover:bg-pink-50 dark:hover:bg-purple-900 text-gray-600 dark:text-gray-300'
                    }`}
                    title={item.label}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {/* Quick Add Button - Hidden when collapsed */}
      {!isCollapsed && (
        <div className="p-6 border-t border-pink-100">
          <Button 
            onClick={onQuickAdd}
            className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white hover:from-pink-500 hover:to-purple-600 shadow-lg rounded-2xl font-medium py-3 transform hover:scale-105 transition-all duration-200"
          >
            <Plus className="mr-2 h-5 w-5" />
            Quick Add Entry ✨
          </Button>
        </div>
      )}
    </aside>
  );
}