import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Droplets, Utensils, Dumbbell, DollarSign } from "lucide-react";
import { useUpdateDailyEntry } from "@/hooks/use-daily-data";
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
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Add Entry</DialogTitle>
        </DialogHeader>
        
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              
              return (
                <Button
                  key={action.key}
                  variant="outline"
                  className="p-4 h-auto flex flex-col items-center space-y-2 hover:bg-gray-50"
                  onClick={() => handleQuickAdd(action.key)}
                  disabled={updateDailyEntry.isPending}
                >
                  <Icon className={`h-6 w-6 ${action.color}`} />
                  <span className="text-sm font-medium">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
