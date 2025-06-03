import { 
  Home, 
  Heart, 
  Briefcase, 
  DollarSign, 
  ShoppingCart, 
  Plus,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { format, addDays, subDays } from "date-fns";
import { useDailyData } from "@/hooks/use-daily-data";

type ViewType = "dashboard" | "health" | "work" | "finances" | "groceries";

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  onQuickAdd: () => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function Sidebar({ activeView, onViewChange, onQuickAdd, selectedDate, onDateChange }: SidebarProps) {
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const { data: dailyEntry } = useDailyData(dateString);

  const goToPreviousDay = () => {
    onDateChange(subDays(selectedDate, 1));
  };

  const goToNextDay = () => {
    onDateChange(addDays(selectedDate, 1));
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

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
    <aside className="w-80 bg-gradient-to-b from-pink-50 to-purple-50 border-r border-pink-200 flex flex-col shadow-lg">
      {/* Logo and Date */}
      <div className="p-6 border-b border-pink-100">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-md">
            <Sparkles className="text-white text-lg h-6 w-6" />
          </div>
          <h1 className="text-2xl font-heading font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Belle Journal
          </h1>
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="font-script text-base">Today: </span>
          <span className="font-medium text-pink-700">
            {format(selectedDate, 'MMMM d, yyyy')}
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-6 border-b border-pink-100">
        <h3 className="text-sm font-heading font-semibold text-pink-600 uppercase tracking-wide mb-4">
          Today's Progress ✨
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white/60 rounded-xl p-3 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full shadow-sm"></div>
              <span className="text-sm font-medium text-gray-700">Water</span>
            </div>
            <div className="flex items-center space-x-2">
              <Progress value={waterProgress} className="w-16 h-2" />
              <span className="text-xs text-muted-foreground font-medium">{waterCount}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between bg-white/60 rounded-xl p-3 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full shadow-sm"></div>
              <span className="text-sm font-medium text-gray-700">Exercise</span>
            </div>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm ${
              dailyEntry?.exerciseCompleted ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-gray-200'
            }`}>
              {dailyEntry?.exerciseCompleted && (
                <div className="w-3 h-3 bg-white rounded-full"></div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between bg-white/60 rounded-xl p-3 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full shadow-sm"></div>
              <span className="text-sm font-medium text-gray-700">Meals</span>
            </div>
            <span className="text-xs text-muted-foreground font-medium">{mealCount}/3</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6">
        <h3 className="text-sm font-heading font-semibold text-pink-600 uppercase tracking-wide mb-4">
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
                      ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-white font-medium shadow-lg transform scale-105'
                      : 'hover:bg-white/80 text-gray-700 hover:shadow-md hover:transform hover:scale-102'
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

      {/* Quick Add Button */}
      <div className="p-6 border-t border-pink-100">
        <Button 
          onClick={onQuickAdd}
          className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white hover:from-pink-500 hover:to-purple-600 shadow-lg rounded-2xl font-medium py-3 transform hover:scale-105 transition-all duration-200"
        >
          <Plus className="mr-2 h-5 w-5" />
          Quick Add Entry ✨
        </Button>
      </div>
    </aside>
  );
}
