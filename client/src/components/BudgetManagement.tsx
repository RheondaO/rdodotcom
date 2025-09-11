import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Calendar, 
  Target, 
  CreditCard,
  PiggyBank,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  BarChart3,
  Filter,
  Search
} from "lucide-react";
import { format, addMonths, subMonths, isWithinInterval, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  AreaChart,
  Area
} from "recharts";

interface BudgetCategory {
  id: number;
  name: string;
  description?: string;
  color?: string;
  parentId?: number;
  isDefault?: boolean;
  createdAt?: Date;
}

interface Budget {
  id: number;
  category: string;
  monthlyLimit: string;
  spent?: string;
  month: string;
  createdAt?: Date;
}

interface BudgetPeriod {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  totalBudget: string;
  totalSpent?: string;
  isActive?: boolean;
  createdAt?: Date;
}

interface BudgetAlert {
  id: number;
  budgetId: number;
  type: string;
  threshold: string;
  isActive?: boolean;
  lastTriggered?: Date;
  createdAt?: Date;
}

interface SpendingTrend {
  id: number;
  categoryId: number;
  period: string;
  averageSpend: string;
  trendDirection: string;
  changePercentage: string;
  calculatedAt: Date;
  createdAt?: Date;
}

interface Expense {
  id: number;
  amount: string;
  description: string;
  categoryId: number;
  date: string;
  isRecurring?: boolean;
  recurringType?: string;
  tags?: string;
  paymentMethod?: string;
  location?: string;
  notes?: string;
  createdAt?: Date;
}

interface Debt {
  id: number;
  name: string;
  type: string;
  totalAmount: string;
  currentBalance: string;
  interestRate: string;
  minimumPayment: string;
  dueDate: number;
  payoffStrategy?: string;
  isActive?: boolean;
  createdAt?: Date;
}

export default function BudgetManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  
  const [selectedPeriod, setSelectedPeriod] = useState<string>(format(new Date(), "yyyy-MM"));
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [newBudgetDialog, setNewBudgetDialog] = useState(false);
  const [newExpenseDialog, setNewExpenseDialog] = useState(false);
  const [newDebtDialog, setNewDebtDialog] = useState(false);
  const [alertsExpanded, setAlertsExpanded] = useState(false);
  const [showTrends, setShowTrends] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch budget data
  const { data: budgetCategories } = useQuery<BudgetCategory[]>({
    queryKey: ["/api/budget-categories"]
    // Uses global defaults: refetchOnWindowFocus: true, staleTime: 30000
  });

  const { data: budgets } = useQuery<Budget[]>({
    queryKey: ["/api/budgets"]
    // Uses global defaults: refetchOnWindowFocus: true, staleTime: 30000
  });

  const { data: budgetPeriods } = useQuery<BudgetPeriod[]>({
    queryKey: ["/api/budget-periods"]
    // Uses global defaults: refetchOnWindowFocus: true, staleTime: 30000
  });

  const { data: budgetAlerts } = useQuery<BudgetAlert[]>({
    queryKey: ["/api/budget-alerts"]
    // Uses global defaults: refetchOnWindowFocus: true, staleTime: 30000
  });

  const { data: spendingTrends } = useQuery<SpendingTrend[]>({
    queryKey: ["/api/spending-trends"],
    staleTime: 300000 // Heavy analytics - 5 minutes
    // Uses global defaults: refetchOnWindowFocus: true
  });

  const { data: expenses } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"]
    // Uses global defaults: refetchOnWindowFocus: true, staleTime: 30000
  });

  const { data: debts } = useQuery<Debt[]>({
    queryKey: ["/api/debts"]
    // Uses global defaults: refetchOnWindowFocus: true, staleTime: 30000
  });

  const { data: budgetAnalytics } = useQuery({
    queryKey: ["/api/budget-analytics", selectedPeriod],
    staleTime: 300000 // Heavy analytics - 5 minutes
    // Uses global defaults: refetchOnWindowFocus: true
  });

  const { data: debtPayoffProjections } = useQuery({
    queryKey: ["/api/debt-payoff-projections"],
    staleTime: 300000 // Heavy analytics - 5 minutes
    // Uses global defaults: refetchOnWindowFocus: true
  });

  // Mutations
  const createBudgetMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!isAdmin) {
        throw new Error("Admin authentication required");
      }
      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      setNewBudgetDialog(false);
      toast({ title: "Budget created successfully" });
    },
    onError: () => {
      toast({ 
        description: "Records can only be created when logged in as the admin. Please log in to continue.",
        variant: "destructive"
      });
    },
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!isAdmin) {
        throw new Error("Admin authentication required");
      }
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/budget-analytics"] });
      setNewExpenseDialog(false);
      toast({ title: "Expense added successfully" });
    },
    onError: () => {
      toast({ 
        description: "Records can only be created when logged in as the admin. Please log in to continue.",
        variant: "destructive"
      });
    },
  });

  const createDebtMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!isAdmin) {
        throw new Error("Admin authentication required");
      }
      const response = await fetch("/api/debts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/debts"] });
      setNewDebtDialog(false);
      toast({ title: "Debt added successfully" });
    },
    onError: () => {
      toast({ 
        description: "Records can only be created when logged in as the admin. Please log in to continue.",
        variant: "destructive"
      });
    },
  });

  // Calculate budget vs actual spending
  const calculateBudgetVsActual = () => {
    if (!budgets || !expenses) return [];
    
    const currentMonthExpenses = expenses.filter(expense => 
      expense.date.startsWith(selectedPeriod)
    );
    
    return budgets.map(budget => {
      const categoryExpenses = currentMonthExpenses.filter(expense => 
        expense.categoryId.toString() === budget.category
      );
      
      const totalSpent = categoryExpenses.reduce((sum, expense) => 
        sum + parseFloat(expense.amount), 0
      );
      
      const budgetLimit = parseFloat(budget.monthlyLimit);
      const spentPercentage = (totalSpent / budgetLimit) * 100;
      
      return {
        category: budget.category,
        budget: budgetLimit,
        spent: totalSpent,
        remaining: budgetLimit - totalSpent,
        percentage: Math.min(spentPercentage, 100),
        status: spentPercentage > 100 ? "over" : spentPercentage > 80 ? "warning" : "good"
      };
    });
  };

  // Calculate debt payoff timeline
  const calculateDebtPayoffTimeline = (debt: Debt) => {
    const balance = parseFloat(debt.currentBalance);
    const rate = parseFloat(debt.interestRate) / 100 / 12;
    const payment = parseFloat(debt.minimumPayment);
    
    if (payment <= balance * rate) {
      return "Never (payment too low)";
    }
    
    const months = Math.ceil(-Math.log(1 - (balance * rate) / payment) / Math.log(1 + rate));
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    return years > 0 ? `${years}y ${remainingMonths}m` : `${remainingMonths}m`;
  };

  // Get spending trend color
  const getTrendColor = (direction: string) => {
    switch (direction) {
      case "increasing": return "text-red-600";
      case "decreasing": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  // Get spending trend icon
  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case "increasing": return <TrendingUp className="h-4 w-4" />;
      case "decreasing": return <TrendingDown className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const budgetVsActual = calculateBudgetVsActual();
  const activeBudgetPeriod = budgetPeriods?.find(period => period.isActive);
  const activeAlerts = budgetAlerts?.filter(alert => alert.isActive) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Budget Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowTrends(!showTrends)}>
            <BarChart3 className="h-4 w-4 mr-2" />
            {showTrends ? "Hide" : "Show"} Trends
          </Button>
          <Dialog open={newExpenseDialog} onOpenChange={setNewExpenseDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
              </DialogHeader>
              <ExpenseForm onSubmit={createExpenseMutation.mutate} />
            </DialogContent>
          </Dialog>
          <Dialog open={newBudgetDialog} onOpenChange={setNewBudgetDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Budget</DialogTitle>
              </DialogHeader>
              <BudgetForm onSubmit={createBudgetMutation.mutate} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Budget Alerts */}
      {activeAlerts.length > 0 && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <div className="flex items-center justify-between">
              <span>You have {activeAlerts.length} active budget alerts</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAlertsExpanded(!alertsExpanded)}
              >
                {alertsExpanded ? "Hide" : "Show"} Details
              </Button>
            </div>
            {alertsExpanded && (
              <div className="mt-3 space-y-2">
                {activeAlerts.map((alert) => (
                  <div key={alert.id} className="text-sm">
                    Alert: {alert.type} - Threshold: {alert.threshold}%
                  </div>
                ))}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Budget Period</CardTitle>
          </CardHeader>
          <CardContent>
            {activeBudgetPeriod ? (
              <div className="space-y-2">
                <div className="font-medium">{activeBudgetPeriod.name}</div>
                <div className="text-sm text-gray-600">
                  {format(parseISO(activeBudgetPeriod.startDate), "MMM d")} - {format(parseISO(activeBudgetPeriod.endDate), "MMM d, yyyy")}
                </div>
                <div className="text-lg font-semibold">
                  ${activeBudgetPeriod.totalSpent || "0"} / ${activeBudgetPeriod.totalBudget}
                </div>
                <Progress 
                  value={((parseFloat(activeBudgetPeriod.totalSpent || "0") / parseFloat(activeBudgetPeriod.totalBudget)) * 100)} 
                  className="h-2"
                />
              </div>
            ) : (
              <div className="text-gray-500">No active budget period</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Monthly Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Total Budget</span>
                <span className="font-medium">
                  ${budgetVsActual.reduce((sum, item) => sum + item.budget, 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total Spent</span>
                <span className="font-medium">
                  ${budgetVsActual.reduce((sum, item) => sum + item.spent, 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Remaining</span>
                <span className="font-medium text-green-600">
                  ${budgetVsActual.reduce((sum, item) => sum + item.remaining, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Debt Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Total Debt</span>
                <span className="font-medium text-red-600">
                  ${debts?.reduce((sum, debt) => sum + parseFloat(debt.currentBalance), 0).toFixed(2) || "0.00"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Monthly Payments</span>
                <span className="font-medium">
                  ${debts?.reduce((sum, debt) => sum + parseFloat(debt.minimumPayment), 0).toFixed(2) || "0.00"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Active Debts</span>
                <span className="font-medium">
                  {debts?.filter(debt => debt.isActive).length || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget vs Actual Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Budget vs Actual Spending</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={budgetVsActual}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
                <Bar dataKey="spent" fill="#ef4444" name="Spent" />
                <Line type="monotone" dataKey="remaining" stroke="#10b981" name="Remaining" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="debts">Debt Management</TabsTrigger>
          <TabsTrigger value="trends">Trends & Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4">
            {budgetVsActual.map((item, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium">{item.category}</h3>
                      <div className="text-sm text-gray-600">
                        ${item.spent.toFixed(2)} of ${item.budget.toFixed(2)}
                      </div>
                    </div>
                    <Badge 
                      variant={item.status === "good" ? "default" : 
                              item.status === "warning" ? "secondary" : "destructive"}
                    >
                      {item.percentage.toFixed(1)}%
                    </Badge>
                  </div>
                  <Progress 
                    value={item.percentage} 
                    className={`h-2 ${item.status === "over" ? "[&>div]:bg-red-500" : 
                                     item.status === "warning" ? "[&>div]:bg-yellow-500" : ""}`}
                  />
                  <div className="mt-2 text-sm text-gray-600">
                    {item.remaining >= 0 ? 
                      `$${item.remaining.toFixed(2)} remaining` : 
                      `$${Math.abs(item.remaining).toFixed(2)} over budget`
                    }
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {budgetCategories?.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses?.filter(expense => {
                    const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesCategory = selectedCategory === "all" || expense.categoryId.toString() === selectedCategory;
                    return matchesSearch && matchesCategory;
                  }).slice(0, 10).map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{format(parseISO(expense.date), "MMM d, yyyy")}</TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {budgetCategories?.find(cat => cat.id === expense.categoryId)?.name || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>${expense.amount}</TableCell>
                      <TableCell>{expense.paymentMethod || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debts" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Debt Management</h2>
            <Dialog open={newDebtDialog} onOpenChange={setNewDebtDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Debt
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Debt</DialogTitle>
                  </DialogHeader>
                  <DebtForm onSubmit={createDebtMutation.mutate} />
                </DialogContent>
              </Dialog>
          </div>

          <div className="grid gap-4">
            {debts?.filter(debt => debt.isActive).map((debt) => (
              <Card key={debt.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{debt.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{debt.type}</Badge>
                        <span className="text-sm text-gray-600">
                          {debt.interestRate}% APR
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-600">
                        ${debt.currentBalance}
                      </div>
                      <div className="text-sm text-gray-600">
                        of ${debt.totalAmount}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Monthly Payment</span>
                      <span className="font-medium">${debt.minimumPayment}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Due Date</span>
                      <span className="font-medium">{debt.dueDate}th of each month</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Payoff Timeline</span>
                      <Badge variant="outline">
                        {calculateDebtPayoffTimeline(debt)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Strategy</span>
                      <Badge variant="secondary">
                        {debt.payoffStrategy || "minimum"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Spending Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {spendingTrends?.map((trend) => (
                    <div key={trend.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <div className={getTrendColor(trend.trendDirection)}>
                          {getTrendIcon(trend.trendDirection)}
                        </div>
                        <div>
                          <div className="font-medium">
                            {budgetCategories?.find(cat => cat.id === trend.categoryId)?.name || "Unknown"}
                          </div>
                          <div className="text-sm text-gray-600">
                            {trend.period} average: ${trend.averageSpend}
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant={trend.trendDirection === "increasing" ? "destructive" : 
                                trend.trendDirection === "decreasing" ? "default" : "secondary"}
                      >
                        {trend.changePercentage}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Debt Payoff Projections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={(debtPayoffProjections as any[]) || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="totalDebt" stroke="#ef4444" name="Total Debt" />
                      <Line type="monotone" dataKey="projection" stroke="#10b981" name="Projection" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BudgetForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    category: "",
    monthlyLimit: "",
    month: format(new Date(), "yyyy-MM")
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <Input
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
          placeholder="e.g., Food, Transportation"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Monthly Limit</label>
        <Input
          type="number"
          step="0.01"
          value={formData.monthlyLimit}
          onChange={(e) => setFormData(prev => ({ ...prev, monthlyLimit: e.target.value }))}
          placeholder="0.00"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Month</label>
        <Input
          type="month"
          value={formData.month}
          onChange={(e) => setFormData(prev => ({ ...prev, month: e.target.value }))}
          required
        />
      </div>
      <Button type="submit" className="w-full">Create Budget</Button>
    </form>
  );
}

function ExpenseForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    categoryId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    paymentMethod: "",
    location: "",
    notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      categoryId: parseInt(formData.categoryId)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Amount</label>
        <Input
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
          placeholder="0.00"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="What did you buy?"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <Select value={formData.categoryId} onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Food & Dining</SelectItem>
            <SelectItem value="2">Transportation</SelectItem>
            <SelectItem value="3">Housing</SelectItem>
            <SelectItem value="4">Entertainment</SelectItem>
            <SelectItem value="5">Shopping</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Date</label>
        <Input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Payment Method</label>
        <Select value={formData.paymentMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="credit_card">Credit Card</SelectItem>
            <SelectItem value="debit_card">Debit Card</SelectItem>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            <SelectItem value="digital_wallet">Digital Wallet</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full">Add Expense</Button>
    </form>
  );
}

function DebtForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    totalAmount: "",
    currentBalance: "",
    interestRate: "",
    minimumPayment: "",
    dueDate: "",
    payoffStrategy: "minimum"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      dueDate: parseInt(formData.dueDate),
      isActive: true
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Debt Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., Credit Card, Student Loan"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Type</label>
        <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select debt type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="credit_card">Credit Card</SelectItem>
            <SelectItem value="student_loan">Student Loan</SelectItem>
            <SelectItem value="mortgage">Mortgage</SelectItem>
            <SelectItem value="auto_loan">Auto Loan</SelectItem>
            <SelectItem value="personal_loan">Personal Loan</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Total Amount</label>
          <Input
            type="number"
            step="0.01"
            value={formData.totalAmount}
            onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: e.target.value }))}
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Current Balance</label>
          <Input
            type="number"
            step="0.01"
            value={formData.currentBalance}
            onChange={(e) => setFormData(prev => ({ ...prev, currentBalance: e.target.value }))}
            placeholder="0.00"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Interest Rate (%)</label>
          <Input
            type="number"
            step="0.01"
            value={formData.interestRate}
            onChange={(e) => setFormData(prev => ({ ...prev, interestRate: e.target.value }))}
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Minimum Payment</label>
          <Input
            type="number"
            step="0.01"
            value={formData.minimumPayment}
            onChange={(e) => setFormData(prev => ({ ...prev, minimumPayment: e.target.value }))}
            placeholder="0.00"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Due Date (day of month)</label>
        <Input
          type="number"
          min="1"
          max="31"
          value={formData.dueDate}
          onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
          placeholder="15"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Payoff Strategy</label>
        <Select value={formData.payoffStrategy} onValueChange={(value) => setFormData(prev => ({ ...prev, payoffStrategy: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select strategy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="minimum">Minimum Payment</SelectItem>
            <SelectItem value="avalanche">Debt Avalanche</SelectItem>
            <SelectItem value="snowball">Debt Snowball</SelectItem>
            <SelectItem value="custom">Custom Strategy</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full">Add Debt</Button>
    </form>
  );
}