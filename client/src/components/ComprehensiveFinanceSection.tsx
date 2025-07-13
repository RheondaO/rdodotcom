import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PieChart,
  BarChart3,
  CreditCard,
  Wallet,
  Target,
  AlertTriangle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Plus
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from "recharts";
import BudgetManagement from "./BudgetManagement";
import InvestmentTracking from "./InvestmentTracking";

// Sample data for demonstration
const mockFinancialData = {
  netWorth: 125000,
  totalAssets: 185000,
  totalLiabilities: 60000,
  monthlyIncome: 8500,
  monthlyExpenses: 6200,
  emergencyFund: 25000,
  investmentValue: 95000,
  debtTotal: 35000,
  budgetUtilization: 73,
  savingsRate: 27
};

const mockNetWorthHistory = [
  { month: "Jan", netWorth: 118000, assets: 175000, liabilities: 57000 },
  { month: "Feb", netWorth: 119500, assets: 177000, liabilities: 57500 },
  { month: "Mar", netWorth: 121000, assets: 179000, liabilities: 58000 },
  { month: "Apr", netWorth: 122800, assets: 181000, liabilities: 58200 },
  { month: "May", netWorth: 124200, assets: 183000, liabilities: 58800 },
  { month: "Jun", netWorth: 125000, assets: 185000, liabilities: 60000 }
];

const mockAssetAllocation = [
  { name: "Investments", value: 95000, color: "#3b82f6" },
  { name: "Cash & Savings", value: 45000, color: "#10b981" },
  { name: "Real Estate", value: 35000, color: "#f59e0b" },
  { name: "Other Assets", value: 10000, color: "#8b5cf6" }
];

const mockExpenseBreakdown = [
  { category: "Housing", amount: 2200, budget: 2500, percentage: 88 },
  { category: "Transportation", amount: 650, budget: 800, percentage: 81 },
  { category: "Food & Dining", amount: 850, budget: 1000, percentage: 85 },
  { category: "Entertainment", amount: 420, budget: 500, percentage: 84 },
  { category: "Utilities", amount: 280, budget: 350, percentage: 80 },
  { category: "Healthcare", amount: 180, budget: 300, percentage: 60 },
  { category: "Shopping", amount: 320, budget: 400, percentage: 80 },
  { category: "Other", amount: 298, budget: 350, percentage: 85 }
];

export default function ComprehensiveFinanceSection() {
  const [selectedView, setSelectedView] = useState<string>("overview");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getPerformanceColor = (value: number) => {
    if (value > 0) return "text-green-600";
    if (value < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getPerformanceIcon = (value: number) => {
    if (value > 0) return <ArrowUpRight className="h-4 w-4" />;
    if (value < 0) return <ArrowDownRight className="h-4 w-4" />;
    return <div className="h-4 w-4" />;
  };

  const getBudgetStatusColor = (percentage: number) => {
    if (percentage > 90) return "bg-red-500";
    if (percentage > 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const netWorthChange = mockNetWorthHistory.length > 1 ? 
    mockNetWorthHistory[mockNetWorthHistory.length - 1].netWorth - mockNetWorthHistory[mockNetWorthHistory.length - 2].netWorth : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Financial Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Monthly Report
          </Button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Net Worth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockFinancialData.netWorth)}</div>
            <div className={`flex items-center gap-1 text-sm ${getPerformanceColor(netWorthChange)}`}>
              {getPerformanceIcon(netWorthChange)}
              <span>{netWorthChange >= 0 ? "+" : ""}{formatCurrency(netWorthChange)} this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Monthly Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(mockFinancialData.monthlyIncome - mockFinancialData.monthlyExpenses)}
            </div>
            <div className="text-sm text-gray-600">
              {formatCurrency(mockFinancialData.monthlyIncome)} - {formatCurrency(mockFinancialData.monthlyExpenses)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Investment Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockFinancialData.investmentValue)}</div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <ArrowUpRight className="h-4 w-4" />
              <span>+12.3% YTD</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Savings Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockFinancialData.savingsRate}%</div>
            <div className="text-sm text-gray-600">Target: 25%</div>
            <Progress value={mockFinancialData.savingsRate} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Net Worth Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockNetWorthHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Line type="monotone" dataKey="netWorth" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="assets" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="liabilities" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={mockAssetAllocation}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name} ${formatCurrency(value)}`}
                  >
                    {mockAssetAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Budget Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockExpenseBreakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-24 text-sm font-medium">{item.category}</div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{formatCurrency(item.amount)} of {formatCurrency(item.budget)}</span>
                      <span className={item.percentage > 90 ? "text-red-600" : item.percentage > 75 ? "text-yellow-600" : "text-green-600"}>
                        {item.percentage}%
                      </span>
                    </div>
                    <Progress 
                      value={item.percentage} 
                      className={`h-2 ${item.percentage > 90 ? "[&>div]:bg-red-500" : 
                                       item.percentage > 75 ? "[&>div]:bg-yellow-500" : ""}`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Financial Health Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Emergency Fund</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockFinancialData.emergencyFund)}</div>
            <div className="text-sm text-gray-600 mt-1">
              {Math.round(mockFinancialData.emergencyFund / mockFinancialData.monthlyExpenses * 10) / 10} months of expenses
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Target: 6 months</span>
                <span className="text-green-600">
                  {Math.round(mockFinancialData.emergencyFund / (mockFinancialData.monthlyExpenses * 6) * 100)}%
                </span>
              </div>
              <Progress 
                value={Math.min(mockFinancialData.emergencyFund / (mockFinancialData.monthlyExpenses * 6) * 100, 100)} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Debt-to-Income Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(mockFinancialData.debtTotal / (mockFinancialData.monthlyIncome * 12) * 100)}%
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Total debt: {formatCurrency(mockFinancialData.debtTotal)}
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Target: &lt;36%</span>
                <span className="text-green-600">Good</span>
              </div>
              <Progress 
                value={Math.min(mockFinancialData.debtTotal / (mockFinancialData.monthlyIncome * 12) * 100, 100)} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Investment Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(mockFinancialData.investmentValue / mockFinancialData.totalAssets * 100)}%
            </div>
            <div className="text-sm text-gray-600 mt-1">
              of total assets
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Target: 60%</span>
                <span className="text-yellow-600">Below target</span>
              </div>
              <Progress 
                value={mockFinancialData.investmentValue / mockFinancialData.totalAssets * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Sections */}
      <Tabs defaultValue="budget" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="budget">Budget Management</TabsTrigger>
          <TabsTrigger value="investments">Investment Tracking</TabsTrigger>
          <TabsTrigger value="analytics">Analytics & Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="budget" className="space-y-4">
          <BudgetManagement />
        </TabsContent>

        <TabsContent value="investments" className="space-y-4">
          <InvestmentTracking />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Spending vs Budget</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={mockExpenseBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Bar dataKey="budget" fill="#e5e7eb" />
                      <Bar dataKey="amount" fill="#3b82f6" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Health Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600">82</div>
                    <div className="text-sm text-gray-600">out of 100</div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Emergency Fund</span>
                      <div className="flex items-center gap-2">
                        <Progress value={85} className="w-16 h-2" />
                        <span className="text-sm font-medium">85</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Debt Management</span>
                      <div className="flex items-center gap-2">
                        <Progress value={78} className="w-16 h-2" />
                        <span className="text-sm font-medium">78</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Investment Diversification</span>
                      <div className="flex items-center gap-2">
                        <Progress value={90} className="w-16 h-2" />
                        <span className="text-sm font-medium">90</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Savings Rate</span>
                      <div className="flex items-center gap-2">
                        <Progress value={75} className="w-16 h-2" />
                        <span className="text-sm font-medium">75</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Financial Goals Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Target className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">House Down Payment</div>
                      <div className="text-sm text-gray-600">Target: $50,000 by Dec 2025</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">$32,000</div>
                    <div className="text-sm text-gray-600">64% complete</div>
                  </div>
                </div>
                <Progress value={64} className="h-2" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <PieChart className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">Retirement Fund</div>
                      <div className="text-sm text-gray-600">Target: $1,000,000 by age 65</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">$95,000</div>
                    <div className="text-sm text-gray-600">19% complete</div>
                  </div>
                </div>
                <Progress value={19} className="h-2" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="font-medium">Vacation Fund</div>
                      <div className="text-sm text-gray-600">Target: $8,000 by Jun 2025</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">$5,200</div>
                    <div className="text-sm text-gray-600">65% complete</div>
                  </div>
                </div>
                <Progress value={65} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}