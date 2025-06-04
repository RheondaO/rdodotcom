import { useState } from "react";
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
import QuickAddModal from "@/components/QuickAddModal";
import WeekView from "@/components/WeekView";
import MonthView from "@/components/MonthView";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { format } from "date-fns";

type ViewType = "dashboard" | "health" | "habits" | "productivity" | "goals" | "reports" | "finances" | "groceries" | "content" | "apps" | "sitemap";
type TimeViewType = "day" | "week" | "month";

export default function Dashboard() {
  const [activeView, setActiveView] = useState<ViewType>("dashboard");
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeView, setTimeView] = useState<TimeViewType>("day");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleExportData = () => {
    // TODO: Implement data export functionality
    console.log("Exporting data...");
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
      case "groceries": return "Grocery Management";
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
      case "groceries": return "Plan and track your grocery shopping";
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
        onQuickAdd={() => setQuickAddOpen(true)}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-b border-pink-200 dark:border-purple-800 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-heading font-bold bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">{getViewTitle()}</h2>
              <p className="text-sm text-muted-foreground dark:text-gray-300 mt-1 font-medium">{getViewDescription()}</p>
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
          {activeView === "reports" && <ReportsSection selectedDate={selectedDate} />}
          {activeView === "finances" && <FinanceSection selectedDate={selectedDate} />}
          {activeView === "groceries" && <GrocerySection />}
          {activeView === "content" && <ContentManagementSuite selectedDate={selectedDate} />}
          {activeView === "apps" && <AppDevelopmentSection selectedDate={selectedDate} />}
          {activeView === "sitemap" && (
            <SiteMapSection onNavigate={(section: string) => setActiveView(section as ViewType)} />
          )}
        </div>
      </main>

      <QuickAddModal 
        open={quickAddOpen} 
        onOpenChange={setQuickAddOpen}
        selectedDate={selectedDate}
      />
    </div>
  );
}