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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Activity,
  Target,
  Calendar,
  Wallet,
  CreditCard,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from "lucide-react";
import { format, parseISO, subDays, subMonths, subYears } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell,
  LineChart,
  AreaChart,
  Area
} from "recharts";

interface Investment {
  id: number;
  symbol: string;
  name: string;
  type: string;
  quantity: string;
  purchasePrice: string;
  currentPrice: string;
  marketValue: string;
  platformId?: number;
  purchaseDate: string;
  lastPriceUpdate?: Date;
  createdAt?: Date;
}

interface Portfolio {
  id: number;
  name: string;
  description?: string;
  totalValue: string;
  totalCost: string;
  totalGainLoss: string;
  lastUpdated?: Date;
  createdAt?: Date;
}

interface PortfolioHolding {
  id: number;
  portfolioId: number;
  investmentId: number;
  allocationPercentage: string;
  targetAllocation?: string;
  createdAt?: Date;
}

interface InvestmentPlatform {
  id: number;
  name: string;
  type: string;
  accountNumber?: string;
  loginUrl?: string;
  notes?: string;
  createdAt?: Date;
}

interface Account {
  id: number;
  name: string;
  type: string;
  institution: string;
  balance: string;
  interestRate?: string;
  isActive?: boolean;
  accountNumber?: string;
  createdAt?: Date;
}

interface NetWorthSnapshot {
  id: number;
  date: string;
  totalAssets: string;
  totalLiabilities: string;
  netWorth: string;
  notes?: string;
  createdAt?: Date;
}

interface InvestmentTransaction {
  id: number;
  investmentId: number;
  type: string;
  quantity: string;
  price: string;
  totalAmount: string;
  fees?: string;
  date: string;
  notes?: string;
  createdAt?: Date;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function InvestmentTracking() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [selectedPeriod, setSelectedPeriod] = useState<string>("1Y");
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>("all");
  const [newInvestmentDialog, setNewInvestmentDialog] = useState(false);
  const [newPortfolioDialog, setNewPortfolioDialog] = useState(false);
  const [newAccountDialog, setNewAccountDialog] = useState(false);
  const [newTransactionDialog, setNewTransactionDialog] = useState(false);
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<number | null>(null);

  // Fetch investment data
  const { data: investments } = useQuery<Investment[]>({
    queryKey: ["/api/investments"],
  });

  const { data: portfolios } = useQuery<Portfolio[]>({
    queryKey: ["/api/portfolios"],
  });

  const { data: portfolioHoldings } = useQuery<PortfolioHolding[]>({
    queryKey: ["/api/portfolio-holdings"],
  });

  const { data: investmentPlatforms } = useQuery<InvestmentPlatform[]>({
    queryKey: ["/api/investment-platforms"],
  });

  const { data: accounts } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: netWorthSnapshots } = useQuery<NetWorthSnapshot[]>({
    queryKey: ["/api/net-worth-snapshots"],
  });

  const { data: investmentTransactions } = useQuery<InvestmentTransaction[]>({
    queryKey: ["/api/investment-transactions"],
  });

  const { data: investmentPerformance } = useQuery({
    queryKey: ["/api/investment-performance", selectedPeriod],
  });

  // Mutations
  const createInvestmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      setNewInvestmentDialog(false);
      toast({ title: "Investment added successfully" });
    },
  });

  const createPortfolioMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/portfolios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolios"] });
      setNewPortfolioDialog(false);
      toast({ title: "Portfolio created successfully" });
    },
  });

  const createAccountMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      setNewAccountDialog(false);
      toast({ title: "Account added successfully" });
    },
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/investment-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investment-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      setNewTransactionDialog(false);
      toast({ title: "Transaction recorded successfully" });
    },
  });

  // Calculate portfolio performance
  const calculatePortfolioPerformance = () => {
    if (!investments || !portfolioHoldings) return [];
    
    return portfolios?.map(portfolio => {
      const holdings = portfolioHoldings.filter(h => h.portfolioId === portfolio.id);
      const totalValue = holdings.reduce((sum, holding) => {
        const investment = investments.find(i => i.id === holding.investmentId);
        return sum + (investment ? parseFloat(investment.marketValue) : 0);
      }, 0);
      
      const totalCost = holdings.reduce((sum, holding) => {
        const investment = investments.find(i => i.id === holding.investmentId);
        return sum + (investment ? parseFloat(investment.purchasePrice) * parseFloat(investment.quantity) : 0);
      }, 0);
      
      const gainLoss = totalValue - totalCost;
      const gainLossPercentage = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;
      
      return {
        ...portfolio,
        totalValue,
        totalCost,
        gainLoss,
        gainLossPercentage
      };
    }) || [];
  };

  // Calculate asset allocation
  const calculateAssetAllocation = () => {
    if (!investments) return [];
    
    const typeGroups = investments.reduce((acc, investment) => {
      if (!acc[investment.type]) {
        acc[investment.type] = 0;
      }
      acc[investment.type] += parseFloat(investment.marketValue);
      return acc;
    }, {} as Record<string, number>);
    
    const total = Object.values(typeGroups).reduce((sum, value) => sum + value, 0);
    
    return Object.entries(typeGroups).map(([type, value], index) => ({
      name: type,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
      color: COLORS[index % COLORS.length]
    }));
  };

  // Calculate net worth over time
  const calculateNetWorthOverTime = () => {
    if (!netWorthSnapshots) return [];
    
    return netWorthSnapshots
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(snapshot => ({
        date: format(parseISO(snapshot.date), "MMM yyyy"),
        netWorth: parseFloat(snapshot.netWorth),
        assets: parseFloat(snapshot.totalAssets),
        liabilities: parseFloat(snapshot.totalLiabilities)
      }));
  };

  // Get investment color based on performance
  const getPerformanceColor = (gainLoss: number) => {
    if (gainLoss > 0) return "text-green-600";
    if (gainLoss < 0) return "text-red-600";
    return "text-gray-600";
  };

  // Get performance icon
  const getPerformanceIcon = (gainLoss: number) => {
    if (gainLoss > 0) return <ArrowUpRight className="h-4 w-4" />;
    if (gainLoss < 0) return <ArrowDownRight className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const portfolioPerformance = calculatePortfolioPerformance();
  const assetAllocation = calculateAssetAllocation();
  const netWorthOverTime = calculateNetWorthOverTime();
  const totalInvestmentValue = investments?.reduce((sum, inv) => sum + parseFloat(inv.marketValue), 0) || 0;
  const totalInvestmentCost = investments?.reduce((sum, inv) => sum + (parseFloat(inv.purchasePrice) * parseFloat(inv.quantity)), 0) || 0;
  const totalGainLoss = totalInvestmentValue - totalInvestmentCost;
  const totalGainLossPercentage = totalInvestmentCost > 0 ? (totalGainLoss / totalInvestmentCost) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Investment Tracking</h1>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1M">1 Month</SelectItem>
              <SelectItem value="3M">3 Months</SelectItem>
              <SelectItem value="6M">6 Months</SelectItem>
              <SelectItem value="1Y">1 Year</SelectItem>
              <SelectItem value="5Y">5 Years</SelectItem>
              <SelectItem value="ALL">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={newAccountDialog} onOpenChange={setNewAccountDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Account</DialogTitle>
              </DialogHeader>
              <AccountForm onSubmit={createAccountMutation.mutate} />
            </DialogContent>
          </Dialog>
          <Dialog open={newPortfolioDialog} onOpenChange={setNewPortfolioDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                New Portfolio
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Portfolio</DialogTitle>
              </DialogHeader>
              <PortfolioForm onSubmit={createPortfolioMutation.mutate} />
            </DialogContent>
          </Dialog>
          <Dialog open={newInvestmentDialog} onOpenChange={setNewInvestmentDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Investment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Investment</DialogTitle>
              </DialogHeader>
              <InvestmentForm onSubmit={createInvestmentMutation.mutate} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalInvestmentValue.toFixed(2)}</div>
            <div className={`flex items-center gap-1 text-sm ${getPerformanceColor(totalGainLoss)}`}>
              {getPerformanceIcon(totalGainLoss)}
              <span>{totalGainLossPercentage >= 0 ? "+" : ""}{totalGainLossPercentage.toFixed(2)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Total Gain/Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(totalGainLoss)}`}>
              ${totalGainLoss >= 0 ? "+" : ""}${totalGainLoss.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">
              Cost basis: ${totalInvestmentCost.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Portfolios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolios?.length || 0}</div>
            <div className="text-sm text-gray-600">
              {portfolios?.filter(p => parseFloat(p.totalValue) > 0).length || 0} active
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{investments?.length || 0}</div>
            <div className="text-sm text-gray-600">
              {new Set(investments?.map(i => i.symbol)).size || 0} unique symbols
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={assetAllocation}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                  >
                    {assetAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Value']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Net Worth Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={netWorthOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, '']} />
                  <Area type="monotone" dataKey="assets" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="liabilities" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                  <Line type="monotone" dataKey="netWorth" stroke="#10b981" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="portfolios" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="portfolios">Portfolios</TabsTrigger>
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolios" className="space-y-4">
          <div className="grid gap-4">
            {portfolioPerformance.map((portfolio) => (
              <Card key={portfolio.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{portfolio.name}</CardTitle>
                      {portfolio.description && (
                        <p className="text-sm text-gray-600 mt-1">{portfolio.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">${portfolio.totalValue.toFixed(2)}</div>
                      <div className={`flex items-center gap-1 text-sm ${getPerformanceColor(portfolio.gainLoss)}`}>
                        {getPerformanceIcon(portfolio.gainLoss)}
                        <span>{portfolio.gainLossPercentage >= 0 ? "+" : ""}{portfolio.gainLossPercentage.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-600">
                      Cost Basis: ${portfolio.totalCost.toFixed(2)}
                    </span>
                    <span className={`text-sm font-medium ${getPerformanceColor(portfolio.gainLoss)}`}>
                      {portfolio.gainLoss >= 0 ? "+" : ""}${portfolio.gainLoss.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="holdings" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Investment Holdings</h2>
            <Dialog open={newTransactionDialog} onOpenChange={setNewTransactionDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Record Transaction
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Transaction</DialogTitle>
                </DialogHeader>
                <TransactionForm 
                  onSubmit={createTransactionMutation.mutate} 
                  investments={investments || []}
                />
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Purchase Price</TableHead>
                    <TableHead>Current Price</TableHead>
                    <TableHead>Market Value</TableHead>
                    <TableHead>Gain/Loss</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investments?.map((investment) => {
                    const quantity = parseFloat(investment.quantity);
                    const purchasePrice = parseFloat(investment.purchasePrice);
                    const currentPrice = parseFloat(investment.currentPrice);
                    const marketValue = parseFloat(investment.marketValue);
                    const costBasis = quantity * purchasePrice;
                    const gainLoss = marketValue - costBasis;
                    const gainLossPercentage = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;
                    
                    return (
                      <TableRow key={investment.id}>
                        <TableCell className="font-medium">{investment.symbol}</TableCell>
                        <TableCell>{investment.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{investment.type}</Badge>
                        </TableCell>
                        <TableCell>{quantity}</TableCell>
                        <TableCell>${purchasePrice.toFixed(2)}</TableCell>
                        <TableCell>${currentPrice.toFixed(2)}</TableCell>
                        <TableCell>${marketValue.toFixed(2)}</TableCell>
                        <TableCell className={getPerformanceColor(gainLoss)}>
                          <div className="flex items-center gap-1">
                            {getPerformanceIcon(gainLoss)}
                            <span>{gainLoss >= 0 ? "+" : ""}${gainLoss.toFixed(2)}</span>
                            <span className="text-xs">({gainLossPercentage >= 0 ? "+" : ""}{gainLossPercentage.toFixed(1)}%)</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => {
                              setSelectedInvestmentId(investment.id);
                              setNewTransactionDialog(true);
                            }}>
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <div className="grid gap-4">
            {accounts?.filter(account => account.isActive).map((account) => (
              <Card key={account.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{account.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{account.type}</Badge>
                        <span className="text-sm text-gray-600">{account.institution}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">${account.balance}</div>
                      {account.interestRate && (
                        <div className="text-sm text-gray-600">
                          {account.interestRate}% APY
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Account: ***{account.accountNumber || "0000"}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Activity className="h-4 w-4 mr-2" />
                        View History
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Fees</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investmentTransactions?.slice(0, 20).map((transaction) => {
                    const investment = investments?.find(i => i.id === transaction.investmentId);
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>{format(parseISO(transaction.date), "MMM d, yyyy")}</TableCell>
                        <TableCell className="font-medium">{investment?.symbol || "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant={transaction.type === "buy" ? "default" : 
                                        transaction.type === "sell" ? "destructive" : "secondary"}>
                            {transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.quantity}</TableCell>
                        <TableCell>${transaction.price}</TableCell>
                        <TableCell>${transaction.totalAmount}</TableCell>
                        <TableCell>{transaction.fees ? `$${transaction.fees}` : "—"}</TableCell>
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
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Investment Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={investmentPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Portfolio Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assetAllocation.map((allocation, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: allocation.color }}
                        />
                        <span className="text-sm">{allocation.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{allocation.percentage.toFixed(1)}%</div>
                        <div className="text-xs text-gray-600">${allocation.value.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Form components
function InvestmentForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    symbol: "",
    name: "",
    type: "",
    quantity: "",
    purchasePrice: "",
    currentPrice: "",
    purchaseDate: format(new Date(), "yyyy-MM-dd"),
    platformId: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const marketValue = (parseFloat(formData.quantity) * parseFloat(formData.currentPrice)).toFixed(2);
    onSubmit({
      ...formData,
      marketValue,
      platformId: formData.platformId ? parseInt(formData.platformId) : undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Symbol</label>
          <Input
            value={formData.symbol}
            onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
            placeholder="AAPL"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Apple Inc."
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Type</label>
        <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select investment type" />
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
          <label className="block text-sm font-medium mb-1">Quantity</label>
          <Input
            type="number"
            step="0.001"
            value={formData.quantity}
            onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
            placeholder="0"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Purchase Price</label>
          <Input
            type="number"
            step="0.01"
            value={formData.purchasePrice}
            onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Current Price</label>
          <Input
            type="number"
            step="0.01"
            value={formData.currentPrice}
            onChange={(e) => setFormData(prev => ({ ...prev, currentPrice: e.target.value }))}
            placeholder="0.00"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Purchase Date</label>
        <Input
          type="date"
          value={formData.purchaseDate}
          onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
          required
        />
      </div>
      <Button type="submit" className="w-full">Add Investment</Button>
    </form>
  );
}

function PortfolioForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Portfolio Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., Retirement Portfolio"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Brief description of portfolio strategy"
        />
      </div>
      <Button type="submit" className="w-full">Create Portfolio</Button>
    </form>
  );
}

function AccountForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    institution: "",
    balance: "",
    interestRate: "",
    accountNumber: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      isActive: true
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Account Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., Main Checking"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Account Type</label>
        <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select account type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="checking">Checking</SelectItem>
            <SelectItem value="savings">Savings</SelectItem>
            <SelectItem value="investment">Investment</SelectItem>
            <SelectItem value="retirement">Retirement</SelectItem>
            <SelectItem value="credit_card">Credit Card</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Institution</label>
        <Input
          value={formData.institution}
          onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
          placeholder="e.g., Bank of America"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Balance</label>
          <Input
            type="number"
            step="0.01"
            value={formData.balance}
            onChange={(e) => setFormData(prev => ({ ...prev, balance: e.target.value }))}
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Interest Rate (%)</label>
          <Input
            type="number"
            step="0.01"
            value={formData.interestRate}
            onChange={(e) => setFormData(prev => ({ ...prev, interestRate: e.target.value }))}
            placeholder="0.00"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Account Number (last 4 digits)</label>
        <Input
          value={formData.accountNumber}
          onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
          placeholder="1234"
          maxLength={4}
        />
      </div>
      <Button type="submit" className="w-full">Add Account</Button>
    </form>
  );
}

function TransactionForm({ onSubmit, investments }: { onSubmit: (data: any) => void, investments: Investment[] }) {
  const [formData, setFormData] = useState({
    investmentId: "",
    type: "",
    quantity: "",
    price: "",
    fees: "",
    date: format(new Date(), "yyyy-MM-dd"),
    notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmount = (parseFloat(formData.quantity) * parseFloat(formData.price)).toFixed(2);
    onSubmit({
      ...formData,
      investmentId: parseInt(formData.investmentId),
      totalAmount
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Investment</label>
        <Select value={formData.investmentId} onValueChange={(value) => setFormData(prev => ({ ...prev, investmentId: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select investment" />
          </SelectTrigger>
          <SelectContent>
            {investments.map((investment) => (
              <SelectItem key={investment.id} value={investment.id.toString()}>
                {investment.symbol} - {investment.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Transaction Type</label>
        <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select transaction type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="buy">Buy</SelectItem>
            <SelectItem value="sell">Sell</SelectItem>
            <SelectItem value="dividend">Dividend</SelectItem>
            <SelectItem value="split">Stock Split</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Quantity</label>
          <Input
            type="number"
            step="0.001"
            value={formData.quantity}
            onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
            placeholder="0"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Price</label>
          <Input
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
            placeholder="0.00"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Fees</label>
        <Input
          type="number"
          step="0.01"
          value={formData.fees}
          onChange={(e) => setFormData(prev => ({ ...prev, fees: e.target.value }))}
          placeholder="0.00"
        />
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
        <label className="block text-sm font-medium mb-1">Notes</label>
        <Input
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Optional notes about this transaction"
        />
      </div>
      <Button type="submit" className="w-full">Record Transaction</Button>
    </form>
  );
}