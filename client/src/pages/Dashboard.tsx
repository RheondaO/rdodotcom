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
import QuickAddModal from "@/components/QuickAddModal";
import WeekView from "@/components/WeekView";
import MonthView from "@/components/MonthView";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { format } from "date-fns";

type ViewType = "dashboard" | "health" | "habits" | "productivity" | "goals" | "reports" | "finances" | "groceries";
type TimeViewType = "day" | "week" | "month";

export default function Dashboard() {
  const [activeView, setActiveView] = useState<ViewType>("dashboard");
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeView, setTimeView] = useState<TimeViewType>("day");

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
      case "work": return "Work & Time Tracking";
      case "finances": return "Financial Tracking";
      case "groceries": return "Grocery Management";
      case "content": return "Content Creation";
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
      case "work": return "Track your work hours and screen time usage";
      case "finances": return "Manage your finances, bills, and spending";
      case "groceries": return "Plan and track your grocery shopping";
      case "content": return "Manage your content planning, creation, and scheduling";
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
      />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-b border-pink-200 dark:border-purple-800 px-8 py-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-heading font-bold bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">{getViewTitle()}</h2>
              <p className="text-muted-foreground dark:text-gray-300 mt-2 font-medium">{getViewDescription()}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={handleExportData}
                className="px-6 py-3 text-sm border-pink-200 hover:bg-pink-50 dark:border-pink-700 dark:hover:bg-pink-900 rounded-xl shadow-sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
              <div className="flex items-center space-x-2 bg-white/60 dark:bg-gray-800/60 rounded-2xl p-1 shadow-sm backdrop-blur-sm">
                <button 
                  onClick={() => setTimeView("day")}
                  className={`px-4 py-2 text-sm rounded-xl font-medium transition-all duration-200 ${
                    timeView === "day" 
                      ? "bg-gradient-to-r from-pink-400 to-purple-500 dark:from-pink-500 dark:to-purple-600 text-white shadow-sm" 
                      : "text-muted-foreground hover:text-pink-600 dark:text-gray-300 dark:hover:text-pink-400"
                  }`}
                >
                  Day
                </button>
                <button 
                  onClick={() => setTimeView("week")}
                  className={`px-4 py-2 text-sm rounded-xl font-medium transition-all duration-200 ${
                    timeView === "week" 
                      ? "bg-gradient-to-r from-pink-400 to-purple-500 dark:from-pink-500 dark:to-purple-600 text-white shadow-sm" 
                      : "text-muted-foreground hover:text-pink-600 dark:text-gray-300 dark:hover:text-pink-400"
                  }`}
                >
                  Week
                </button>
                <button 
                  onClick={() => setTimeView("month")}
                  className={`px-4 py-2 text-sm rounded-xl font-medium transition-all duration-200 ${
                    timeView === "month" 
                      ? "bg-gradient-to-r from-pink-400 to-purple-500 dark:from-pink-500 dark:to-purple-600 text-white shadow-sm" 
                      : "text-muted-foreground hover:text-pink-600 dark:text-gray-300 dark:hover:text-pink-400"
                  }`}
                >
                  Month
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {timeView === "week" ? (
            <WeekView selectedDate={selectedDate} onDateChange={setSelectedDate} />
          ) : timeView === "month" ? (
            <MonthView selectedDate={selectedDate} onDateChange={setSelectedDate} />
          ) : (
            <>
              {activeView === "dashboard" && (
                <>
                  <HealthSection selectedDate={selectedDate} />
                  <WorkTimeSection selectedDate={selectedDate} />
                  <FinanceSection selectedDate={selectedDate} />
                  <GrocerySection />
                </>
              )}
              {activeView === "health" && <HealthSection selectedDate={selectedDate} />}
              {activeView === "habits" && <HabitsSection selectedDate={selectedDate} />}
              {activeView === "productivity" && <ProductivitySection selectedDate={selectedDate} />}
              {activeView === "goals" && <GoalsSection selectedDate={selectedDate} />}
              {activeView === "reports" && <ReportsSection selectedDate={selectedDate} />}
              {activeView === "finances" && <FinanceSection selectedDate={selectedDate} />}
              {activeView === "groceries" && <GrocerySection />}
            </>
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