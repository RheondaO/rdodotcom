
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  PiggyBank, 
  Target, 
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Calculator,
  Banknote,
  Building,
  Wallet,
  Trophy,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff
} from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

interface BudgetCategory {
  id: number;
  name: string;
  description?: string;
  color?: string;
  parentId?: number;
  isDefault?: boolean;
  spent?: number;
  budgeted?: number;
}

interface Expense {
  id: number;
  amount: string;
  description: string;
  categoryId: number;
  date: string;
  paymentMethod?: string;
  location?: string;
  notes?: string;
  category?: BudgetCategory;
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
}

interface Investment {
  id: number;
  symbol: string;
  name: string;
  type: string;
  quantity: string;
  purchasePrice: string;
  currentPrice: string;
  marketValue: string;
  purchaseDate: string;
  gainLoss?: number;
  gainLossPercent?: number;
}

interface Account {
  id: number;
  name: string;
  type: string;
  institution: string;
  balance: string;
  isActive?: boolean;
}

interface NetWorthSnapshot {
  id: number;
  date: string;
  totalAssets: string;
  totalLiabilities: string;
  netWorth: string;
}

interface FinancialGoal {
  id: number;
  name: string;
  description?: string;
  targetAmount: string;
  currentAmount: string;
  targetDate: string;
  category: string;
  isCompleted?: boolean;
  monthlyContribution?: string;
  progress?: number;
}

export default function ComprehensiveFinanceSection() {
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [showAddInvestment, setShowAddInvestment] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showBalances, setShowBalances] = useState(false);

  // Fetch data
  const { data: expenses } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const { data: budgetCategories } = useQuery<BudgetCategory[]>({
    queryKey: ["/api/budget-categories"],
  });

  const { data: debts } = useQuery<Debt[]>({
    queryKey: ["/api/debts"],
  });

  const { data: investments } = useQuery<Investment[]>({
    queryKey: ["/api/investments"],
  });

  const { data: accounts } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: netWorthSnapshots } = useQuery<NetWorthSnapshot[]>({
    queryKey: ["/api/net-worth-snapshots"],
  });

  const { data: financialGoals } = useQuery<FinancialGoal[]>({
    queryKey: ["/api/financial-goals"],
  });

  // Calculations
  const currentMonthExpenses = expenses?.filter(expense => 
    expense.date.startsWith(selectedMonth)
  ) || [];

  const totalExpensesThisMonth = currentMonthExpenses.reduce((sum, expense) => 
    sum + parseFloat(expense.amount), 0
  );

  const totalDebt = debts?.reduce((sum, debt) => 
    sum + parseFloat(debt.currentBalance), 0
  ) || 0;

  const totalInvestmentValue = investments?.reduce((sum, investment) => 
    sum + parseFloat(investment.marketValue), 0
  ) || 0;

  const totalAssets = accounts?.reduce((sum, account) => 
    sum + parseFloat(account.balance), 0
  ) || 0;

  const netWorth = totalAssets + totalInvestmentValue - totalDebt;

  // Category spending analysis
  const categorySpending = currentMonthExpenses.reduce((acc, expense) => {
    const categoryId = expense.categoryId;
    const category = budgetCategories?.find(cat => cat.id === categoryId);
    const categoryName = category?.name || "Uncategorized";
    
    acc[categoryName] = (acc[categoryName] || 0) + parseFloat(expense.amount);
    return acc;
  }, {} as Record<string, number>);

  const categorySpendingData = Object.entries(categorySpending).map(([name, amount]) => ({
    name,
    value: amount,
    color: budgetCategories?.find(cat => cat.name === name)?.color || "#8884d8"
  }));

  // Net worth trend data
  const netWorthTrendData = netWorthSnapshots?.map(snapshot => ({
    date: format(new Date(snapshot.date), "MMM yyyy"),
    netWorth: parseFloat(snapshot.netWorth),
    assets: parseFloat(snapshot.totalAssets),
    liabilities: parseFloat(snapshot.totalLiabilities)
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];

  // Debt payoff projections
  const debtPayoffData = debts?.filter(debt => debt.isActive).map(debt => {
    const balance = parseFloat(debt.currentBalance);
    const rate = parseFloat(debt.interestRate) / 100 / 12;
    const payment = parseFloat(debt.minimumPayment);
    
    // Calculate months to payoff using minimum payments
    const monthsToPayoff = Math.ceil(
      -Math.log(1 - (balance * rate) / payment) / Math.log(1 + rate)
    );
    
    return {
      name: debt.name,
      balance,
      monthsToPayoff: isFinite(monthsToPayoff) ? monthsToPayoff : 999,
      minimumPayment: payment,
      type: debt.type
    };
  }).sort((a, b) => a.monthsToPayoff - b.monthsToPayoff) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Comprehensive Finance Management</h1>
          <p className="text-muted-foreground">
            Track budgets, manage debt, monitor investments, and achieve financial goals
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowBalances(!showBalances)}
          >
            {showBalances ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showBalances ? "Hide" : "Show"} Balances
          </Button>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => {
                const date = subMonths(new Date(), i);
                const monthYear = format(date, "yyyy-MM");
                return (
                  <SelectItem key={monthYear} value={monthYear}>
                    {format(date, "MMM yyyy")}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="debt">Debt</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {showBalances ? `$${netWorth.toLocaleString()}` : "••••••"}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12.5% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {showBalances ? `$${totalExpensesThisMonth.toLocaleString()}` : "••••••"}
                </div>
                <p className="text-xs text-muted-foreground">
                  -5.2% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Debt</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {showBalances ? `$${totalDebt.toLocaleString()}` : "••••••"}
                </div>
                <p className="text-xs text-muted-foreground">
                  -8.1% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Investments</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {showBalances ? `$${totalInvestmentValue.toLocaleString()}` : "••••••"}
                </div>
                <p className="text-xs text-muted-foreground">
                  +15.3% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Net Worth Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Net Worth Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={netWorthTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="netWorth" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Net Worth"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Spending */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Spending by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categorySpendingData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categorySpendingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              onClick={() => setShowAddExpense(true)}
              className="h-20 flex flex-col items-center justify-center"
            >
              <Plus className="h-6 w-6 mb-2" />
              Add Expense
            </Button>
            <Button 
              onClick={() => setShowAddDebt(true)}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <CreditCard className="h-6 w-6 mb-2" />
              Add Debt
            </Button>
            <Button 
              onClick={() => setShowAddInvestment(true)}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <TrendingUp className="h-6 w-6 mb-2" />
              Add Investment
            </Button>
            <Button 
              onClick={() => setShowAddGoal(true)}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <Target className="h-6 w-6 mb-2" />
              Add Goal
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="budget" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Budget Management</h2>
            <Button onClick={() => setShowAddExpense(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>

          {/* Budget vs Actual */}
          <div className="grid gap-4">
            {budgetCategories?.map((category) => {
              const spent = categorySpending[category.name] || 0;
              const budgeted = category.budgeted || 1000; // Default budget
              const percentage = (spent / budgeted) * 100;
              const isOverBudget = percentage > 100;

              return (
                <Card key={category.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          ${spent.toFixed(2)} / ${budgeted.toFixed(2)}
                        </div>
                        <Badge variant={isOverBudget ? "destructive" : "default"}>
                          {percentage.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className="w-full"
                    />
                    {isOverBudget && (
                      <div className="flex items-center mt-2 text-sm text-red-600">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Over budget by ${(spent - budgeted).toFixed(2)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Recent Expenses */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentMonthExpenses.slice(0, 10).map((expense) => (
                  <div key={expense.id} className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{expense.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {expense.paymentMethod} • {format(new Date(expense.date), "MMM d")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${parseFloat(expense.amount).toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">
                        {budgetCategories?.find(cat => cat.id === expense.categoryId)?.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debt" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Debt Management</h2>
            <Button onClick={() => setShowAddDebt(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Debt
            </Button>
          </div>

          {/* Debt Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Debt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {showBalances ? `$${totalDebt.toLocaleString()}` : "••••••"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Monthly Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {showBalances ? `$${debts?.reduce((sum, debt) => sum + parseFloat(debt.minimumPayment), 0).toLocaleString()}` : "••••••"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Avg Interest Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {debts?.length ? (debts.reduce((sum, debt) => sum + parseFloat(debt.interestRate), 0) / debts.length).toFixed(1) : 0}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Debt List */}
          <Card>
            <CardHeader>
              <CardTitle>Debt Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {debts?.filter(debt => debt.isActive).map((debt) => {
                  const balance = parseFloat(debt.currentBalance);
                  const total = parseFloat(debt.totalAmount);
                  const progress = ((total - balance) / total) * 100;
                  const monthsToPayoff = debtPayoffData.find(d => d.name === debt.name)?.monthsToPayoff || 0;

                  return (
                    <div key={debt.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">{debt.name}</h4>
                          <p className="text-sm text-muted-foreground">{debt.type}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {showBalances ? `$${balance.toLocaleString()}` : "••••••"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {debt.interestRate}% APR
                          </div>
                        </div>
                      </div>
                      <Progress value={progress} className="mb-2" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{progress.toFixed(1)}% paid off</span>
                        <span>
                          {monthsToPayoff < 999 ? `${monthsToPayoff} months to payoff` : "Calculate payoff"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Payoff Strategy */}
          <Card>
            <CardHeader>
              <CardTitle>Debt Payoff Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={debtPayoffData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="balance" fill="#8884d8" name="Current Balance" />
                  <Bar dataKey="monthsToPayoff" fill="#82ca9d" name="Months to Payoff" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="investments" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Investment Portfolio</h2>
            <Button onClick={() => setShowAddInvestment(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Investment
            </Button>
          </div>

          {/* Portfolio Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {showBalances ? `$${totalInvestmentValue.toLocaleString()}` : "••••••"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Gain/Loss</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  +$2,450
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Today's Change</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  +$125.50
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Holdings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {investments?.length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Investment Holdings */}
          <Card>
            <CardHeader>
              <CardTitle>Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {investments?.map((investment) => {
                  const currentValue = parseFloat(investment.marketValue);
                  const purchaseValue = parseFloat(investment.purchasePrice) * parseFloat(investment.quantity);
                  const gainLoss = currentValue - purchaseValue;
                  const gainLossPercent = (gainLoss / purchaseValue) * 100;

                  return (
                    <div key={investment.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-semibold">{investment.symbol}</div>
                        <div className="text-sm text-muted-foreground">{investment.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {investment.quantity} shares @ ${parseFloat(investment.currentPrice).toFixed(2)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {showBalances ? `$${currentValue.toLocaleString()}` : "••••••"}
                        </div>
                        <div className={`text-sm ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(2)} ({gainLossPercent.toFixed(2)}%)
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Account Management</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </div>

          {/* Account Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Checking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {showBalances ? `$${accounts?.filter(acc => acc.type === 'checking').reduce((sum, acc) => sum + parseFloat(acc.balance), 0).toLocaleString()}` : "••••••"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {showBalances ? `$${accounts?.filter(acc => acc.type === 'savings').reduce((sum, acc) => sum + parseFloat(acc.balance), 0).toLocaleString()}` : "••••••"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {showBalances ? `$${totalAssets.toLocaleString()}` : "••••••"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account List */}
          <Card>
            <CardHeader>
              <CardTitle>All Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {accounts?.map((account) => (
                  <div key={account.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-semibold">{account.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {account.institution} • {account.type}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {showBalances ? `$${parseFloat(account.balance).toLocaleString()}` : "••••••"}
                      </div>
                      {account.isActive && (
                        <Badge variant="outline" className="text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Financial Goals</h2>
            <Button onClick={() => setShowAddGoal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </div>

          {/* Goals Grid */}
          <div className="grid gap-4">
            {financialGoals?.map((goal) => {
              const current = parseFloat(goal.currentAmount);
              const target = parseFloat(goal.targetAmount);
              const progress = (current / target) * 100;
              const remaining = target - current;
              const daysUntilTarget = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

              return (
                <Card key={goal.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{goal.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                        <Badge variant="outline" className="mt-2">
                          {goal.category}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          {showBalances ? `$${current.toLocaleString()} / $${target.toLocaleString()}` : "••••••"}
                        </div>
                        <div className="text-lg font-bold">
                          {progress.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress value={Math.min(progress, 100)} className="mb-3" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>${remaining.toLocaleString()} remaining</span>
                      <span>{daysUntilTarget} days left</span>
                    </div>
                    {goal.monthlyContribution && (
                      <div className="mt-2 text-sm">
                        Monthly contribution: ${parseFloat(goal.monthlyContribution).toLocaleString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Dialogs */}
      <AddExpenseDialog 
        open={showAddExpense} 
        onOpenChange={setShowAddExpense}
        categories={budgetCategories || []}
      />
      <AddDebtDialog 
        open={showAddDebt} 
        onOpenChange={setShowAddDebt}
      />
      <AddInvestmentDialog 
        open={showAddInvestment} 
        onOpenChange={setShowAddInvestment}
      />
      <AddGoalDialog 
        open={showAddGoal} 
        onOpenChange={setShowAddGoal}
      />
    </div>
  );
}

// Add Expense Dialog Component
function AddExpenseDialog({ 
  open, 
  onOpenChange, 
  categories 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  categories: BudgetCategory[];
}) {
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
    // TODO: Implement expense creation
    console.log("Creating expense:", formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Amount</label>
              <Input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What was this expense for?"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Category</label>
            <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Payment Method</label>
              <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="debit_card">Debit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Where was this expense?"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Notes</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Expense</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Add Debt Dialog Component
function AddDebtDialog({ 
  open, 
  onOpenChange 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    totalAmount: "",
    currentBalance: "",
    interestRate: "",
    minimumPayment: "",
    dueDate: "1",
    payoffStrategy: "minimum"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement debt creation
    console.log("Creating debt:", formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Debt</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Debt Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Chase Freedom Card"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Type</label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="personal_loan">Personal Loan</SelectItem>
                <SelectItem value="auto_loan">Auto Loan</SelectItem>
                <SelectItem value="student_loan">Student Loan</SelectItem>
                <SelectItem value="mortgage">Mortgage</SelectItem>
                <SelectItem value="line_of_credit">Line of Credit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Total Amount</label>
              <Input
                type="number"
                step="0.01"
                value={formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Current Balance</label>
              <Input
                type="number"
                step="0.01"
                value={formData.currentBalance}
                onChange={(e) => setFormData({ ...formData, currentBalance: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Interest Rate (%)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Minimum Payment</label>
              <Input
                type="number"
                step="0.01"
                value={formData.minimumPayment}
                onChange={(e) => setFormData({ ...formData, minimumPayment: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Due Date (Day of Month)</label>
              <Select value={formData.dueDate} onValueChange={(value) => setFormData({ ...formData, dueDate: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 31 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Payoff Strategy</label>
              <Select value={formData.payoffStrategy} onValueChange={(value) => setFormData({ ...formData, payoffStrategy: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimum">Minimum Payments</SelectItem>
                  <SelectItem value="avalanche">Debt Avalanche</SelectItem>
                  <SelectItem value="snowball">Debt Snowball</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Debt</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Add Investment Dialog Component
function AddInvestmentDialog({ 
  open, 
  onOpenChange 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const [formData, setFormData] = useState({
    symbol: "",
    name: "",
    type: "",
    quantity: "",
    purchasePrice: "",
    currentPrice: "",
    purchaseDate: format(new Date(), "yyyy-MM-dd")
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement investment creation
    console.log("Creating investment:", formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Investment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Symbol</label>
              <Input
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                placeholder="AAPL, TSLA, etc."
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Apple Inc."
                required
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Type</label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stock">Stock</SelectItem>
                <SelectItem value="etf">ETF</SelectItem>
                <SelectItem value="mutual_fund">Mutual Fund</SelectItem>
                <SelectItem value="bond">Bond</SelectItem>
                <SelectItem value="crypto">Cryptocurrency</SelectItem>
                <SelectItem value="reit">REIT</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Quantity</label>
              <Input
                type="number"
                step="0.001"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="0"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Purchase Price</label>
              <Input
                type="number"
                step="0.01"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Current Price</label>
              <Input
                type="number"
                step="0.01"
                value={formData.currentPrice}
                onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Purchase Date</label>
            <Input
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Investment</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Add Goal Dialog Component
function AddGoalDialog({ 
  open, 
  onOpenChange 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    targetAmount: "",
    currentAmount: "0",
    targetDate: "",
    category: "",
    monthlyContribution: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement goal creation
    console.log("Creating goal:", formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Financial Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Goal Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Emergency Fund"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="6 months of expenses for emergencies"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Target Amount</label>
              <Input
                type="number"
                step="0.01"
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                placeholder="10000.00"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Current Amount</label>
              <Input
                type="number"
                step="0.01"
                value={formData.currentAmount}
                onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Target Date</label>
              <Input
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emergency_fund">Emergency Fund</SelectItem>
                  <SelectItem value="house_downpayment">House Down Payment</SelectItem>
                  <SelectItem value="retirement">Retirement</SelectItem>
                  <SelectItem value="vacation">Vacation</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="car">Car Purchase</SelectItem>
                  <SelectItem value="debt_payoff">Debt Payoff</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Monthly Contribution</label>
            <Input
              type="number"
              step="0.01"
              value={formData.monthlyContribution}
              onChange={(e) => setFormData({ ...formData, monthlyContribution: e.target.value })}
              placeholder="500.00"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Goal</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
