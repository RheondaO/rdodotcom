import { DollarSign, Plus, Settings, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useDailyData } from "@/hooks/use-daily-data";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

interface FinanceSectionProps {
  selectedDate: Date;
}

export default function FinanceSection({ selectedDate }: FinanceSectionProps) {
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const { data: dailyEntry } = useDailyData(dateString);

  const { data: bills = [] } = useQuery({
    queryKey: ['/api/bills'],
  });

  const { data: billPayments = [] } = useQuery({
    queryKey: ['/api/bill-payments', dateString],
  });

  const cashSavings = parseFloat(dailyEntry?.cashSavings || "0");
  const grocerySpent = parseFloat(dailyEntry?.grocerySpent || "0");
  const groceryBudget = 200; // Weekly budget
  const groceryProgress = (grocerySpent / groceryBudget) * 100;

  return (
    <section className="mb-8">
      <h3 className="text-2xl font-heading font-bold text-green-600 mb-6 flex items-center">
        <DollarSign className="text-green-500 mr-3 h-6 w-6" />
        Finances 💰
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Savings */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-heading font-semibold text-gray-800">Cash Savings</h4>
              <Button variant="ghost" size="sm" className="hover:bg-green-50 rounded-xl">
                <Plus className="h-4 w-4 text-green-500" />
              </Button>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-heading font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
                ${cashSavings.toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground bg-green-50 rounded-lg px-3 py-1">Monthly Goal: $500</div>
            </div>
          </CardContent>
        </Card>

        {/* Bills Status */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-heading font-semibold text-gray-800">Bills Status</h4>
              <Button variant="ghost" size="sm" className="hover:bg-blue-50 rounded-xl">
                <Settings className="h-4 w-4 text-blue-500" />
              </Button>
            </div>
            
            <div className="space-y-3">
              {(bills as any[]).slice(0, 3).map((bill: any) => {
                const payment = (billPayments as any[]).find((p: any) => p.billId === bill.id);
                const isPaid = payment?.isPaid || false;
                
                return (
                  <div key={bill.id} className="flex items-center justify-between py-2 px-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-700">{bill.name}</span>
                    <div className="flex items-center space-x-2">
                      {bill.isAutoPay && (
                        <Badge variant="secondary" className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-0">
                          Auto
                        </Badge>
                      )}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm ${
                        isPaid ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'border-2 border-gray-300 bg-white'
                      }`}>
                        {isPaid && (
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Grocery Spending */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-heading font-semibold text-gray-800">Grocery Budget</h4>
              <Button variant="ghost" size="sm" className="hover:bg-orange-50 rounded-xl">
                <Receipt className="h-4 w-4 text-orange-500" />
              </Button>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-heading font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-3">
                ${grocerySpent.toFixed(0)}
              </div>
              <Progress value={groceryProgress} className="w-full h-3 mb-3" />
              <div className="text-sm text-muted-foreground bg-orange-50 rounded-lg px-3 py-1">
                Budget: ${groceryBudget}/week
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
