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
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  Menu,
  X,
  Zap,
  PenTool,
  Map,
  Code2,
  FileText
} from "lucide-react";

import { useState } from "react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { format, addDays, subDays } from "date-fns";
import { useDailyData, useUpdateDailyEntry } from "../hooks/use-daily-data";
import { useTheme } from "../hooks/use-theme";

type ViewType = "dashboard" | "health" | "habits" | "productivity" | "goals" | "reports" | "finances" | "groceries" | "content" | "rotationonly" | "apps" | "sitemap" | "blog-studio";

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
  const [progressCollapsed, setProgressCollapsed] = useState(false);
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const { data: dailyEntry } = useDailyData(dateString);
  const { theme, toggleTheme } = useTheme();
  const updateDailyEntry = useUpdateDailyEntry();

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
    { key: "content" as ViewType, label: "𝔯𝔬𝔱𝔞𝔱𝔦𝔬𝔫𝐎𝐍𝐋𝐘 Content Studio", icon: Moon },
    { key: "blog-studio" as ViewType, label: "Blogging Content Studio", icon: PenTool },
    { key: "apps" as ViewType, label: "AI App Development", icon: Code2 },
    { key: "goals" as ViewType, label: "Goals", icon: Target },
    { key: "groceries" as ViewType, label: "Shopping", icon: ShoppingCart },
    { key: "finances" as ViewType, label: "Finances", icon: DollarSign },
    { key: "habits" as ViewType, label: "Habits", icon: Zap },
    { key: "health" as ViewType, label: "Health", icon: Heart },
    { key: "productivity" as ViewType, label: "Productivity", icon: Briefcase },
    { key: "reports" as ViewType, label: "Reports", icon: BarChart3 },
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

  // Click handlers for progress items
  const handleWaterClick = () => {
    updateDailyEntry.mutate({
      ...dailyEntry,
      date: dateString,
      waterIntake: waterIntake + 1
    });
  };

  const handleExerciseClick = () => {
    updateDailyEntry.mutate({
      ...dailyEntry,
      date: dateString,
      exerciseCompleted: !dailyEntry?.exerciseCompleted
    });
  };

  const handleMealsClick = () => {
    // Cycle through meal completion: breakfast -> lunch -> dinner -> reset
    if (!dailyEntry?.breakfastCompleted) {
      updateDailyEntry.mutate({
        ...dailyEntry,
        date: dateString,
        breakfastCompleted: true
      });
    } else if (!dailyEntry?.lunchCompleted) {
      updateDailyEntry.mutate({
        ...dailyEntry,
        date: dateString,
        lunchCompleted: true
      });
    } else if (!dailyEntry?.dinnerCompleted) {
      updateDailyEntry.mutate({
        ...dailyEntry,
        date: dateString,
        dinnerCompleted: true
      });
    } else {
      // Reset all meals
      updateDailyEntry.mutate({
        ...dailyEntry,
        date: dateString,
        breakfastCompleted: false,
        lunchCompleted: false,
        dinnerCompleted: false
      });
    }
  };

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-80'} transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-r border-pink-100 dark:border-purple-800 flex flex-col shadow-xl h-screen overflow-hidden`}>
        {/* Toggle Button */}
        <div className="px-6 py-3 border-b border-pink-100 dark:border-purple-800">
          <Button
            onClick={onToggleCollapse}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-pink-100 dark:hover:bg-purple-800"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>

        {/* Compact Progress Section - Hidden when collapsed */}
      {!isCollapsed && (
        <div className="px-3 py-2 border-b border-pink-100 dark:border-purple-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-heading font-semibold text-pink-600 dark:text-white uppercase tracking-wide">
              Today's Progress ✨
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setProgressCollapsed(!progressCollapsed)}
              className="h-5 w-5 p-0 hover:bg-pink-100 dark:hover:bg-purple-800 rounded-lg"
            >
              {progressCollapsed ? (
                <ChevronDown className="h-3 w-3 text-pink-600 dark:text-pink-400" />
              ) : (
                <ChevronUp className="h-3 w-3 text-pink-600 dark:text-pink-400" />
              )}
            </Button>
          </div>
          {!progressCollapsed && (
            <div className="space-y-4">
              <div 
                onClick={handleWaterClick}
                className="flex items-center justify-between bg-white/60 dark:bg-gray-800/60 rounded-xl p-3 backdrop-blur-sm cursor-pointer hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full shadow-sm"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-white">Water</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress value={waterProgress} className="w-16 h-2" />
                  <span className="text-xs text-muted-foreground dark:text-white font-medium">{waterIntake}/8</span>
                </div>
              </div>

              <div 
                onClick={handleExerciseClick}
                className="flex items-center justify-between bg-white/60 dark:bg-gray-800/60 rounded-xl p-3 backdrop-blur-sm cursor-pointer hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg"
              >
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

              <div 
                onClick={handleMealsClick}
                className="flex items-center justify-between bg-white/60 dark:bg-gray-800/60 rounded-xl p-3 backdrop-blur-sm cursor-pointer hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full shadow-sm"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-white">Meals</span>
                </div>
                <span className="text-xs text-muted-foreground dark:text-white font-medium">{mealCount}/3</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Compact Navigation - Full view when expanded */}
      {!isCollapsed && (
        <nav className="flex-1 px-3 py-2 overflow-y-auto">
          <h3 className="text-xs font-heading font-semibold text-pink-600 dark:text-white uppercase tracking-wide mb-2">
            Categories 💖
          </h3>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.key;
              
              return (
                <li key={item.key}>
                  <button
                    onClick={() => onViewChange(item.key)}
                    className={`w-full flex items-center space-x-2 p-2 rounded-xl transition-all duration-200 text-sm ${
                      isActive
                        ? 'bg-gradient-to-r from-pink-400 to-purple-500 dark:from-pink-500 dark:to-purple-600 text-white font-medium shadow-md'
                        : 'hover:bg-pink-50 dark:hover:bg-purple-900 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
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
        <nav className="flex-1 p-2 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.key;
              
              return (
                <li key={item.key}>
                  <button
                    onClick={() => onViewChange(item.key)}
                    title={item.label}
                    className={`w-full flex items-center justify-center p-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-pink-400 to-purple-500 dark:from-pink-500 dark:to-purple-600 text-white shadow-lg'
                        : 'hover:bg-pink-50 dark:hover:bg-purple-900 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

    </aside>
  );
}