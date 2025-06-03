import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import HealthSection from "@/components/HealthSection";
import WorkTimeSection from "@/components/WorkTimeSection";
import FinanceSection from "@/components/FinanceSection";
import GrocerySection from "@/components/GrocerySection";
import QuickAddModal from "@/components/QuickAddModal";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { format } from "date-fns";

type ViewType = "dashboard" | "health" | "work" | "finances" | "groceries";

export default function Dashboard() {
  const [activeView, setActiveView] = useState<ViewType>("dashboard");
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleExportData = () => {
    // TODO: Implement data export functionality
    console.log("Exporting data...");
  };

  const getViewTitle = () => {
    switch (activeView) {
      case "health": return "Health & Wellness";
      case "work": return "Work & Time Tracking";
      case "finances": return "Financial Tracking";
      case "groceries": return "Grocery Management";
      default: return "Dashboard";
    }
  };

  const getViewDescription = () => {
    switch (activeView) {
      case "health": return "Monitor your daily health habits and wellness goals";
      case "work": return "Track your work hours and screen time usage";
      case "finances": return "Manage your finances, bills, and spending";
      case "groceries": return "Plan and track your grocery shopping";
      default: return "Track your daily habits and goals";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView}
        onQuickAdd={() => setQuickAddOpen(true)}
        selectedDate={selectedDate}
      />
      
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white/70 backdrop-blur-sm border-b border-pink-200 px-8 py-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-heading font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">{getViewTitle()}</h2>
              <p className="text-muted-foreground mt-2 font-medium">{getViewDescription()}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={handleExportData}
                className="px-6 py-3 text-sm border-pink-200 hover:bg-pink-50 rounded-xl shadow-sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
              <div className="flex items-center space-x-2 bg-white/60 rounded-2xl p-1 shadow-sm backdrop-blur-sm">
                <button className="px-4 py-2 text-sm bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-xl shadow-sm font-medium">
                  Day
                </button>
                <button className="px-4 py-2 text-sm text-muted-foreground hover:text-pink-600 transition-colors rounded-xl">
                  Week
                </button>
                <button className="px-4 py-2 text-sm text-muted-foreground hover:text-pink-600 transition-colors rounded-xl">
                  Month
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {activeView === "dashboard" && (
            <>
              <HealthSection selectedDate={selectedDate} />
              <WorkTimeSection selectedDate={selectedDate} />
              <FinanceSection selectedDate={selectedDate} />
              <GrocerySection />
            </>
          )}
          {activeView === "health" && <HealthSection selectedDate={selectedDate} />}
          {activeView === "work" && <WorkTimeSection selectedDate={selectedDate} />}
          {activeView === "finances" && <FinanceSection selectedDate={selectedDate} />}
          {activeView === "groceries" && <GrocerySection />}
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
