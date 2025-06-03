import { 
  Home, 
  Heart, 
  Briefcase, 
  DollarSign, 
  ShoppingCart, 
  Plus,
  CircleDot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { useDailyData } from "@/hooks/use-daily-data";

type ViewType = "dashboard" | "health" | "work" | "finances" | "groceries";

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  onQuickAdd: () => void;
  selectedDate: Date;
}

export default function Sidebar({ activeView, onViewChange, onQuickAdd, selectedDate }: SidebarProps) {
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const { data: dailyEntry } = useDailyData(dateString);

  const waterProgress = dailyEntry?.waterIntake ? (dailyEntry.waterIntake / 8) * 100 : 0;
  const waterCount = `${dailyEntry?.waterIntake || 0}/8`;
  
  const mealCount = [
    dailyEntry?.breakfastCompleted,
    dailyEntry?.lunchCompleted,
    dailyEntry?.dinnerCompleted
  ].filter(Boolean).length;

  const navItems = [
    { key: "dashboard", icon: Home, label: "Dashboard" },
    { key: "health", icon: Heart, label: "Health & Wellness" },
    { key: "work", icon: Briefcase, label: "Work & Time" },
    { key: "finances", icon: DollarSign, label: "Finances" },
    { key: "groceries", icon: ShoppingCart, label: "Groceries" },
  ] as const;

  return (
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo and Date */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <CircleDot className="text-white text-lg h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold text-primary">DotTracker</h1>
        </div>
        <div className="text-sm text-neutral-cool">
          Today: <span className="font-medium text-gray-800">
            {format(selectedDate, 'MMMM d, yyyy')}
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-neutral-cool uppercase tracking-wide mb-4">
          Today's Progress
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              <span className="text-sm">Water</span>
            </div>
            <div className="flex items-center space-x-2">
              <Progress value={waterProgress} className="w-16 h-2" />
              <span className="text-xs text-neutral-cool">{waterCount}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span className="text-sm">Exercise</span>
            </div>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              dailyEntry?.exerciseCompleted ? 'bg-success' : 'bg-gray-200'
            }`}>
              {dailyEntry?.exerciseCompleted && (
                <div className="w-3 h-3 bg-white rounded-full"></div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm">Meals</span>
            </div>
            <span className="text-xs text-neutral-cool">{mealCount}/3</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6">
        <h3 className="text-sm font-semibold text-neutral-cool uppercase tracking-wide mb-4">
          Categories
        </h3>
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.key;
            
            return (
              <li key={item.key}>
                <button
                  onClick={() => onViewChange(item.key)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary bg-opacity-10 text-primary font-medium'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Quick Add Button */}
      <div className="p-6 border-t border-gray-100">
        <Button 
          onClick={onQuickAdd}
          className="w-full bg-secondary text-white hover:bg-secondary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Quick Add Entry
        </Button>
      </div>
    </aside>
  );
}
