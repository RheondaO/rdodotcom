import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Droplets, Utensils, Dumbbell, DollarSign } from "lucide-react";
import { useUpdateDailyEntry } from "../hooks/use-daily-data";
import { format } from "date-fns";

interface QuickAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
}

export default function QuickAddModal({ open, onOpenChange, selectedDate }: QuickAddModalProps) {
  const updateDailyEntry = useUpdateDailyEntry();
  const dateString = format(selectedDate, 'yyyy-MM-dd');

  const handleQuickAdd = (type: string) => {
    switch (type) {
      case 'water':
        updateDailyEntry.mutate({
          date: dateString,
          waterIntake: 1, // Will be added to existing
        });
        break;
      case 'exercise':
        updateDailyEntry.mutate({
          date: dateString,
          exerciseCompleted: true,
        });
        break;
      case 'breakfast':
        updateDailyEntry.mutate({
          date: dateString,
          breakfastCompleted: true,
        });
        break;
      case 'lunch':
        updateDailyEntry.mutate({
          date: dateString,
          lunchCompleted: true,
        });
        break;
      case 'dinner':
        updateDailyEntry.mutate({
          date: dateString,
          dinnerCompleted: true,
        });
        break;
    }
    onOpenChange(false);
  };

  const quickActions = [
    { key: 'water', icon: Droplets, label: 'Water Glass', color: 'text-secondary' },
    { key: 'breakfast', icon: Utensils, label: 'Breakfast', color: 'text-primary' },
    { key: 'lunch', icon: Utensils, label: 'Lunch', color: 'text-primary' },
    { key: 'dinner', icon: Utensils, label: 'Dinner', color: 'text-primary' },
    { key: 'exercise', icon: Dumbbell, label: 'Exercise', color: 'text-accent' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 rounded-3xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent text-center">
            Quick Add Entry ✨
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              
              return (
                <Button
                  key={action.key}
                  variant="outline"
                  className="p-6 h-auto flex flex-col items-center space-y-3 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 dark:hover:from-pink-900/30 dark:hover:to-purple-900/30 border-pink-200 dark:border-gray-600 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-lg hover:scale-105"
                  onClick={() => handleQuickAdd(action.key)}
                  disabled={updateDailyEntry.isPending}
                >
                  <Icon className={`h-8 w-8 ${action.color}`} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
