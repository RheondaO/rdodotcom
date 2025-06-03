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
    <div className="flex h-screen overflow-hidden bg-bg-light">
      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView}
        onQuickAdd={() => setQuickAddOpen(true)}
        selectedDate={selectedDate}
      />
      
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{getViewTitle()}</h2>
              <p className="text-neutral-cool mt-1">{getViewDescription()}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={handleExportData}
                className="px-4 py-2 text-sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <button className="px-3 py-2 text-sm bg-white rounded-md shadow-sm font-medium text-primary">
                  Day
                </button>
                <button className="px-3 py-2 text-sm text-neutral-cool hover:text-gray-900 transition-colors">
                  Week
                </button>
                <button className="px-3 py-2 text-sm text-neutral-cool hover:text-gray-900 transition-colors">
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
