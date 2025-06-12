import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import HealthSection from "@/components/HealthSection";
import WorkTimeSection from "@/components/WorkTimeSection";
import FinanceSection from "@/components/FinanceSection";
import GrocerySection from "@/components/GrocerySection";
import HabitsSection from "@/components/HabitsSection";
import ProductivitySection from "@/components/ProductivitySection";
import GoalsSection from "@/components/GoalsSection";
import ReportsSection from "@/components/ReportsSection";
import DashboardHome from "@/components/DashboardHome";
import SiteMapSection from "@/components/SiteMapSection";
import AppDevelopmentSection from "@/components/AppDevelopmentSection";
import ContentManagementSuite from "@/components/ContentManagementSuite";
import ContentCreationSection from "@/components/ContentCreationSection";
import QuickAddModal from "@/components/QuickAddModal";
import WeekView from "@/components/WeekView";
import MonthView from "@/components/MonthView";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Sun, Moon, Eye, Lock } from "lucide-react";
import { format, addDays, subDays, isSameDay, isToday, isYesterday, isTomorrow } from "date-fns";
import { useTheme } from "@/hooks/use-theme";

type ViewType = "dashboard" | "health" | "habits" | "productivity" | "goals" | "reports" | "finances" | "groceries" | "content" | "rotationonly" | "apps" | "sitemap";
type TimeViewType = "day" | "week" | "month";

export default function Dashboard() {
  const [activeView, setActiveView] = useState<ViewType>("dashboard");
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeView, setTimeView] = useState<TimeViewType>("day");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Check admin status
  const { data: authStatus } = useQuery({
    queryKey: ['/api/auth/status'],
    queryFn: async () => {
      const response = await fetch('/api/auth/status');
      if (!response.ok) {
        return { authenticated: false, isAdmin: false };
      }
      return response.json();
    }
  });

  const isAdmin = authStatus?.isAdmin || false;
  const isReadOnly = false; // Always allow full functionality for now

  // Date comparison helpers
  const today = new Date();
  const yesterday = subDays(today, 1);
  const tomorrow = addDays(today, 1);
  
  const isYesterdaySelected = isSameDay(selectedDate, yesterday);
  const isTodaySelected = isSameDay(selectedDate, today);
  const isTomorrowSelected = isSameDay(selectedDate, tomorrow);

  const handleExportData = () => {
    // TODO: Implement data export functionality
    console.log("Exporting data...");
  };

  const getFullDateLabel = () => {
    const dayName = format(selectedDate, 'EEEE');
    const fullDate = format(selectedDate, 'MMMM d, yyyy');
    
    if (isToday(selectedDate)) return `Today is ${dayName} ${fullDate}`;
    if (isYesterday(selectedDate)) return `Yesterday was ${dayName} ${fullDate}`;
    if (isTomorrow(selectedDate)) return `Tomorrow is ${dayName} ${fullDate}`;
    return `${dayName} ${fullDate}`;
  };

  const getViewTitle = () => {
    if (timeView === "week") {
      return "Week Overview";
    }
    if (timeView === "month") {
      return "Month Overview";
    }
    switch (activeView) {
      case "health": return "Health & Wellness";
      case "habits": return "Habits & Wellness";
      case "productivity": return "Work & Time Tracking";
      case "goals": return "Goals & Achievements";
      case "reports": return "Reports & Analytics";
      case "finances": return "Financial Tracking";
      case "groceries": return "Shopping Management";
      case "content": return "Content Management Suite";
      case "sitemap": return "Site Map";
      default: return "Dashboard";
    }
  };

  const getViewDescription = () => {
    if (timeView === "week") {
      return "View your weekly progress and patterns";
    }
    if (timeView === "month") {
      return "View your monthly progress and statistics";
    }
    switch (activeView) {
      case "health": return "Monitor your daily health habits and wellness goals";
      case "habits": return "Build and maintain positive daily habits";
      case "productivity": return "Track your work hours and screen time usage";
      case "goals": return "Set and track your personal achievements";
      case "reports": return "View analytics and progress reports";
      case "finances": return "Manage your finances, bills, and spending";
      case "groceries": return "Plan and track your shopping list";
      case "content": return "Manage your content planning, creation, and scheduling";
      case "sitemap": return "Quick access to all pages and sections";
      default: return "Track your daily habits and goals";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:bg-gradient-to-br dark:from-purple-950 dark:via-pink-950 dark:to-indigo-950">
      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView}
        onQuickAdd={isReadOnly ? () => {} : () => setQuickAddOpen(true)}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className="flex-1 overflow-auto">
        {/* Header with Belle Journal title and date navigation */}
        <header className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-b border-pink-200 dark:border-purple-800 px-6 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 dark:from-pink-500 dark:to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white text-lg">✨</span>
              </div>
              <div>
                <h1 className="text-xl font-heading font-bold bg-gradient-to-r from-pink-500 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Belle Journal
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300 -mt-1">
                  {getFullDateLabel()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="h-8 w-8 p-0 hover:bg-pink-100 dark:hover:bg-purple-800 rounded-lg"
              >
                {theme === "light" ? (
                  <Moon className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                ) : (
                  <Sun className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                )}
              </Button>
            </div>
            
            <div className="flex items-center space-x-3">
              {isReadOnly && (
                <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                  <Eye className="mr-1 h-3 w-3" />
                  Read Only
                </Badge>
              )}
              <div className="text-sm text-muted-foreground dark:text-white">
                <span className="font-medium text-pink-700 dark:text-white">
                  {format(selectedDate, 'MMM d, yyyy')}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedDate(subDays(new Date(), 1))}
                  className={`text-xs px-3 py-1 h-7 rounded-lg font-medium transition-colors ${
                    isYesterdaySelected
                      ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-white shadow-md'
                      : 'hover:bg-pink-100 dark:hover:bg-pink-900 text-pink-600 dark:text-white'
                  }`}
                >
                  Yesterday
                </button>
                
                <button
                  onClick={() => setSelectedDate(new Date())}
                  className={`text-xs px-3 py-1 h-7 rounded-lg font-medium transition-colors ${
                    isTodaySelected
                      ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-white shadow-md'
                      : 'hover:bg-pink-100 dark:hover:bg-pink-900 text-pink-600 dark:text-white'
                  }`}
                >
                  Today
                </button>
                
                <button
                  onClick={() => setSelectedDate(addDays(new Date(), 1))}
                  className={`text-xs px-3 py-1 h-7 rounded-lg font-medium transition-colors ${
                    isTomorrowSelected
                      ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-white shadow-md'
                      : 'hover:bg-pink-100 dark:hover:bg-pink-900 text-pink-600 dark:text-white'
                  }`}
                >
                  Tomorrow
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4">
          {activeView === "dashboard" && (
            <DashboardHome selectedDate={selectedDate} onNavigate={(section: string) => setActiveView(section as ViewType)} />
          )}
          {activeView === "health" && <HealthSection selectedDate={selectedDate} />}
          {activeView === "habits" && <HabitsSection selectedDate={selectedDate} />}
          {activeView === "productivity" && <ProductivitySection selectedDate={selectedDate} />}
          {activeView === "goals" && <GoalsSection selectedDate={selectedDate} />}
          {activeView === "reports" && <ReportsSection />}
          {activeView === "finances" && <FinanceSection selectedDate={selectedDate} />}
          {activeView === "groceries" && <GrocerySection />}
          {activeView === "content" && <ContentManagementSuite selectedDate={selectedDate} />}
          {activeView === "rotationonly" && <ContentCreationSection selectedDate={selectedDate} />}
          {activeView === "apps" && <AppDevelopmentSection selectedDate={selectedDate} />}
          {activeView === "sitemap" && (
            <SiteMapSection onNavigate={(section: string) => setActiveView(section as ViewType)} />
          )}
        </div>
      </main>

      {!isReadOnly && (
        <QuickAddModal 
          open={quickAddOpen} 
          onOpenChange={setQuickAddOpen}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
}