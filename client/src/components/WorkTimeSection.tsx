import { Briefcase, Edit, Plus, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useDailyData } from "@/hooks/use-daily-data";
import { format } from "date-fns";

interface WorkTimeSectionProps {
  selectedDate: Date;
}

export default function WorkTimeSection({ selectedDate }: WorkTimeSectionProps) {
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const { data: dailyEntry } = useDailyData(dateString);

  const workHours = parseFloat(dailyEntry?.workHours || "0");
  const tvHours = parseFloat(dailyEntry?.tvHours || "0");
  const phoneHours = parseFloat(dailyEntry?.phoneHours || "0");
  
  const workProgress = (workHours / 8) * 100;

  return (
    <section className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <Briefcase className="text-accent mr-3 h-5 w-5" />
        Work & Screen Time
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Work Hours */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Work Hours</h4>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">
                {workHours.toFixed(1)}h
              </div>
              <Progress value={workProgress} className="w-full h-2 mb-2" />
              <div className="text-sm text-neutral-cool">Goal: 8h</div>
            </div>
          </CardContent>
        </Card>

        {/* TV Hours */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">TV Time</h4>
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {tvHours.toFixed(1)}h
              </div>
              <div className="text-sm text-neutral-cool">Limit: 3h</div>
            </div>
          </CardContent>
        </Card>

        {/* Phone Screen Time */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Phone Time</h4>
              <Button variant="ghost" size="sm">
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary mb-2">
                {phoneHours.toFixed(1)}h
              </div>
              <div className={`text-sm ${
                phoneHours > 3 ? 'text-red-500' : 'text-neutral-cool'
              }`}>
                {phoneHours > 3 ? 'Over limit (3h)' : 'Limit: 3h'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
