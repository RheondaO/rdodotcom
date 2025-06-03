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
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <DollarSign className="text-success mr-3 h-5 w-5" />
        Finances
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Savings */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Cash Savings</h4>
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-success mb-2">
                ${cashSavings.toFixed(0)}
              </div>
              <div className="text-sm text-neutral-cool">Monthly Goal: $500</div>
            </div>
          </CardContent>
        </Card>

        {/* Bills Status */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Bills Status</h4>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              {bills.slice(0, 3).map((bill) => {
                const payment = billPayments.find(p => p.billId === bill.id);
                const isPaid = payment?.isPaid || false;
                
                return (
                  <div key={bill.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{bill.name}</span>
                    <div className="flex items-center space-x-2">
                      {bill.isAutoPay && (
                        <Badge variant="secondary" className="text-xs bg-success bg-opacity-10 text-success">
                          Auto
                        </Badge>
                      )}
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        isPaid ? 'bg-success' : 'border-2 border-gray-300'
                      }`}>
                        {isPaid && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
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
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Grocery Budget</h4>
              <Button variant="ghost" size="sm">
                <Receipt className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-accent mb-2">
                ${grocerySpent.toFixed(0)}
              </div>
              <Progress value={groceryProgress} className="w-full h-2 mb-2" />
              <div className="text-sm text-neutral-cool">
                Budget: ${groceryBudget}/week
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
