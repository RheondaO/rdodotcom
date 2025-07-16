import { Briefcase, Edit, Plus, Smartphone } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import { useDailyData } from "../hooks/use-daily-data";
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-heading font-bold bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
            Work & Screen Time
          </h3>
          <p className="text-muted-foreground dark:text-gray-300 mt-1">
            Track your work hours and screen time usage
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Work Hours */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-heading font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Work Hours</h4>
              <Button variant="ghost" size="sm" className="hover:bg-purple-50 rounded-xl">
                <Edit className="h-4 w-4 text-purple-500" />
              </Button>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-heading font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                {workHours.toFixed(1)}h
              </div>
              <Progress value={workProgress} className="w-full h-3 mb-3" />
              <div className="text-sm text-muted-foreground bg-purple-50 rounded-lg px-3 py-1">Goal: 8h</div>
            </div>
          </CardContent>
        </Card>

        {/* TV Hours */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-heading font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">TV Time</h4>
              <Button variant="ghost" size="sm" className="hover:bg-blue-50 rounded-xl">
                <Plus className="h-4 w-4 text-blue-500" />
              </Button>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-heading font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                {tvHours.toFixed(1)}h
              </div>
              <div className="text-sm text-muted-foreground bg-blue-50 rounded-lg px-3 py-1">Limit: 3h</div>
            </div>
          </CardContent>
        </Card>

        {/* Phone Screen Time */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-heading font-semibold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Phone Time</h4>
              <Button variant="ghost" size="sm" className="hover:bg-pink-50 rounded-xl">
                <Smartphone className="h-4 w-4 text-pink-500" />
              </Button>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-heading font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-3">
                {phoneHours.toFixed(1)}h
              </div>
              <div className={`text-sm rounded-lg px-3 py-1 ${
                phoneHours > 3 ? 'text-red-600 bg-red-50' : 'text-muted-foreground bg-pink-50'
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
