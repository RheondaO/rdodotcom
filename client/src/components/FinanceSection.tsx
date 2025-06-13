import { DollarSign, Plus, Settings, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useDailyData, useUpdateDailyEntry } from "@/hooks/use-daily-data";
import { useQuery } from "@tanstack/react-query";
import { format, isToday, isYesterday, isTomorrow } from "date-fns";
import { useState } from "react";

interface FinanceSectionProps {
  selectedDate: Date;
  isReadOnly?: boolean;
}

export default function FinanceSection({ selectedDate, isReadOnly = false }: FinanceSectionProps) {
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const { data: dailyEntry } = useDailyData(dateString);
  const updateDailyEntry = useUpdateDailyEntry();
  
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [incomeAmount, setIncomeAmount] = useState("");

  const getDateLabel = () => {
    if (isToday(selectedDate)) return "Today";
    if (isYesterday(selectedDate)) return "Yesterday";
    if (isTomorrow(selectedDate)) return "Tomorrow";
    return format(selectedDate, 'EEEE');
  };

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

  const handleAddIncome = async () => {
    if (!incomeAmount) return;
    
    const currentSavings = parseFloat(dailyEntry?.cashSavings || "0");
    const newAmount = parseFloat(incomeAmount);
    const updatedSavings = currentSavings + newAmount;
    
    await updateDailyEntry.mutateAsync({
      date: dateString,
      cashSavings: updatedSavings.toString()
    });
    
    setIncomeAmount("");
    setIsAddIncomeOpen(false);
  };

  const handleQuickAdd = async (amount: number) => {
    const currentSavings = parseFloat(dailyEntry?.cashSavings || "0");
    const updatedSavings = currentSavings + amount;
    
    await updateDailyEntry.mutateAsync({
      date: dateString,
      cashSavings: updatedSavings.toString()
    });
  };

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
              <Dialog open={isAddIncomeOpen} onOpenChange={setIsAddIncomeOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="hover:bg-green-50 rounded-xl">
                    <Plus className="h-4 w-4 text-green-500" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="font-heading text-xl text-gray-800">Add Income</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label htmlFor="income-amount" className="text-sm font-medium text-gray-700">
                        Amount ($)
                      </Label>
                      <Input
                        id="income-amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={incomeAmount}
                        onChange={(e) => setIncomeAmount(e.target.value)}
                        className="mt-1 rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={handleAddIncome}
                        disabled={!incomeAmount || updateDailyEntry.isPending}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl"
                      >
                        Add Income
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddIncomeOpen(false)}
                        className="flex-1 rounded-xl border-gray-200 hover:bg-gray-50"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-heading font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
                ${cashSavings.toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground bg-green-50 rounded-lg px-3 py-1 mb-3">Monthly Goal: $500</div>
              
              {/* Quick Add Buttons */}
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdd(20)}
                  disabled={updateDailyEntry.isPending}
                  className="text-xs bg-green-50 hover:bg-green-100 border-green-200 text-green-700 rounded-lg"
                >
                  +$20
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdd(50)}
                  disabled={updateDailyEntry.isPending}
                  className="text-xs bg-green-50 hover:bg-green-100 border-green-200 text-green-700 rounded-lg"
                >
                  +$50
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdd(100)}
                  disabled={updateDailyEntry.isPending}
                  className="text-xs bg-green-50 hover:bg-green-100 border-green-200 text-green-700 rounded-lg"
                >
                  +$100
                </Button>
              </div>
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

        {/* Shopping Spending */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-heading font-semibold text-gray-800">Shopping Budget</h4>
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
