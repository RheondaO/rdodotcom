import { 
  type DailyEntry, 
  type InsertDailyEntry,
  type Bill,
  type InsertBill,
  type BillPayment,
  type InsertBillPayment,
  type GroceryItem,
  type InsertGroceryItem,
  type Goal,
  type InsertGoal,
  type Habit,
  type InsertHabit,
  type HabitLog,
  type InsertHabitLog,
  type Todo,
  type InsertTodo,
  type Budget,
  type Challenge,
  type ContentCategory,
  type InsertContentCategory,
  type ContentType,
  type InsertContentType,
  type ContentPiece,
  type InsertContentPiece,
  type ContentProgress,
  type InsertContentProgress,
  type MiniGameBlock,
  type InsertMiniGameBlock,
  type MiniGameDesign,
  type InsertMiniGameDesign,
  type SocialMediaPost,
  type InsertSocialMediaPost,
  type SocialMediaAnalytics,
  type InsertSocialMediaAnalytics,
  type PerformanceInsights,
  type InsertPerformanceInsights,
  type BlogPost,
  type InsertBlogPost,
  type BlogIdea,
  type InsertBlogIdea,
  type BlogCalendar,
  type InsertBlogCalendar,
  type BudgetCategory,
  type InsertBudgetCategory,
  type Expense,
  type InsertExpense,
  type Debt,
  type InsertDebt,
  type DebtPayment,
  type InsertDebtPayment,
  type Investment,
  type InsertInvestment,
  type InvestmentPlatform,
  type InsertInvestmentPlatform,
  type Account,
  type InsertAccount,
  type NetWorthSnapshot,
  type InsertNetWorthSnapshot,
  type FinancialGoal,
  type InsertFinancialGoal,
  type BudgetPeriod,
  type InsertBudgetPeriod,
  type BudgetAlert,
  type InsertBudgetAlert,
  type SpendingTrend,
  type InsertSpendingTrend,
  type Portfolio,
  type InsertPortfolio,
  type PortfolioHolding,
  type InsertPortfolioHolding,
  type PriceHistory,
  type InsertPriceHistory,
  type InvestmentTransaction,
  type InsertInvestmentTransaction,
  type TimerSession,
  type InsertTimerSession,
  type Purchase,
  type InsertPurchase,
  timerSessions,
  blogPosts,
  blogIdeas,
  blogCalendar,
  purchases,
  type BlogPostType,
  type BlogIdeaType,
  type BlogCalendarType,
  type PurchaseType,
  type SelectCalendarSelection,
  type InsertCalendarSelection
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
// Note: Database imports will be replaced with Notion integration later

export interface IStorage {
  // Daily Entries
  getDailyEntry(date: string): Promise<DailyEntry | undefined>;
  createOrUpdateDailyEntry(entry: InsertDailyEntry): Promise<DailyEntry>;

  // Bills
  getAllBills(): Promise<Bill[]>;
  createBill(bill: InsertBill): Promise<Bill>;
  deleteBill(id: number): Promise<void>;

  // Bill Payments
  getBillPaymentsForDate(date: string): Promise<BillPayment[]>;
  createBillPayment(payment: InsertBillPayment): Promise<BillPayment>;
  updateBillPayment(id: number, isPaid: boolean): Promise<BillPayment>;

  // Grocery Items & Lists
  getAllGroceryItems(): Promise<GroceryItem[]>;
  createGroceryItem(item: InsertGroceryItem): Promise<GroceryItem>;
  updateGroceryItem(id: number, updates: Partial<GroceryItem>): Promise<GroceryItem>;
  deleteGroceryItem(id: number): Promise<void>;

  // Purchase Calendar
  getAllPurchases(): Promise<Purchase[]>;
  getPurchasesByDateRange(startDate: string, endDate: string): Promise<Purchase[]>;
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  updatePurchase(id: number, updates: Partial<Purchase>): Promise<Purchase>;
  deletePurchase(id: number): Promise<void>;

  // Goals
  getAllGoals(): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, updates: Partial<Goal>): Promise<Goal>;
  deleteGoal(id: number): Promise<void>;

  // Habits & Habit Logs
  getAllHabits(): Promise<Habit[]>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  updateHabit(id: number, updates: Partial<Habit>): Promise<Habit>;
  deleteHabit(id: number): Promise<void>;
  getHabitLogs(habitId: number, startDate?: string, endDate?: string): Promise<HabitLog[]>;
  createHabitLog(log: InsertHabitLog): Promise<HabitLog>;
  updateHabitLog(id: number, updates: Partial<HabitLog>): Promise<HabitLog>;

  // Medications
  getAllMedications(): Promise<Medication[]>;
  createMedication(medication: InsertMedication): Promise<Medication>;
  updateMedication(id: number, updates: Partial<Medication>): Promise<Medication>;
  deleteMedication(id: number): Promise<void>;

  // Todos
  getAllTodos(): Promise<Todo[]>;
  getTodosByDate(date: string): Promise<Todo[]>;
  createTodo(todo: InsertTodo): Promise<Todo>;
  updateTodo(id: number, updates: Partial<Todo>): Promise<Todo>;
  deleteTodo(id: number): Promise<void>;

  // Time Blocks
  getAllTimeBlocks(): Promise<TimeBlock[]>;
  getTimeBlocksByDate(date: string): Promise<TimeBlock[]>;
  createTimeBlock(timeBlock: InsertTimeBlock): Promise<TimeBlock>;
  updateTimeBlock(id: number, updates: Partial<TimeBlock>): Promise<TimeBlock>;
  deleteTimeBlock(id: number): Promise<void>;

  // Focus Sessions
  getAllFocusSessions(): Promise<FocusSession[]>;
  getFocusSessionsByDate(date: string): Promise<FocusSession[]>;
  createFocusSession(session: InsertFocusSession): Promise<FocusSession>;
  updateFocusSession(id: number, updates: Partial<FocusSession>): Promise<FocusSession>;
  deleteFocusSession(id: number): Promise<void>;

  // Timer Sessions
  getActiveTimerSession(): Promise<TimerSession | null>;
  getAllTimerSessions(): Promise<TimerSession[]>;
  createTimerSession(session: InsertTimerSession): Promise<TimerSession>;
  updateTimerSession(id: number, updates: Partial<TimerSession>): Promise<TimerSession>;
  deleteTimerSession(id: number): Promise<void>;
  pauseTimerSession(id: number): Promise<TimerSession>;
  resumeTimerSession(id: number): Promise<TimerSession>;
  // Stop functionality removed per user request

  // Budgets
  getAllBudgets(): Promise<Budget[]>;
  getBudgetsByMonth(month: string): Promise<Budget[]>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: number, updates: Partial<Budget>): Promise<Budget>;
  deleteBudget(id: number): Promise<void>;

  // Income Entries
  getAllIncomeEntries(): Promise<IncomeEntry[]>;
  getIncomeEntriesByDateRange(startDate: string, endDate: string): Promise<IncomeEntry[]>;
  createIncomeEntry(entry: InsertIncomeEntry): Promise<IncomeEntry>;
  deleteIncomeEntry(id: number): Promise<void>;

  // Challenges
  getAllChallenges(): Promise<Challenge[]>;
  getActiveChallenges(): Promise<Challenge[]>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  updateChallenge(id: number, updates: Partial<Challenge>): Promise<Challenge>;
  deleteChallenge(id: number): Promise<void>;

  // Content Categories
  getAllContentCategories(): Promise<ContentCategory[]>;
  createContentCategory(category: InsertContentCategory): Promise<ContentCategory>;

  // Content Types
  getAllContentTypes(): Promise<ContentType[]>;
  createContentType(type: InsertContentType): Promise<ContentType>;

  // Content Pieces
  getAllContentPieces(): Promise<ContentPiece[]>;
  createContentPiece(piece: InsertContentPiece): Promise<ContentPiece>;
  updateContentPiece(id: number, updates: Partial<ContentPiece>): Promise<ContentPiece>;

  // Content Progress
  getAllContentProgress(): Promise<ContentProgress[]>;
  createContentProgress(progress: InsertContentProgress): Promise<ContentProgress>;

  // App Projects
  getAllAppProjects(): Promise<AppProject[]>;
  getAppProject(id: number): Promise<AppProject | undefined>;
  createAppProject(project: InsertAppProject): Promise<AppProject>;
  updateAppProject(id: number, updates: Partial<AppProject>): Promise<AppProject>;
  deleteAppProject(id: number): Promise<void>;

  // App Tasks
  getAppTasksByProject(projectId: number): Promise<AppTask[]>;
  getAllAppTasks(): Promise<AppTask[]>;
  createAppTask(task: InsertAppTask): Promise<AppTask>;
  updateAppTask(id: number, updates: Partial<AppTask>): Promise<AppTask>;
  deleteAppTask(id: number): Promise<void>;

  // App Sprints
  getAppSprintsByProject(projectId: number): Promise<AppSprint[]>;
  createAppSprint(sprint: InsertAppSprint): Promise<AppSprint>;
  updateAppSprint(id: number, updates: Partial<AppSprint>): Promise<AppSprint>;
  deleteAppSprint(id: number): Promise<void>;

  // App Time Entries
  getAppTimeEntriesByProject(projectId: number, startDate?: string, endDate?: string): Promise<AppTimeEntry[]>;
  createAppTimeEntry(entry: InsertAppTimeEntry): Promise<AppTimeEntry>;
  updateAppTimeEntry(id: number, updates: Partial<AppTimeEntry>): Promise<AppTimeEntry>;
  deleteAppTimeEntry(id: number): Promise<void>;

  // Mini Game Blocks
  getAllMiniGameBlocks(): Promise<MiniGameBlock[]>;
  createMiniGameBlock(block: InsertMiniGameBlock): Promise<MiniGameBlock>;
  updateMiniGameBlock(id: number, updates: Partial<MiniGameBlock>): Promise<MiniGameBlock>;
  deleteMiniGameBlock(id: number): Promise<void>;

  // Mini Game Designs
  getAllMiniGameDesigns(): Promise<MiniGameDesign[]>;
  getMiniGameDesignsByBlock(blockId: number): Promise<MiniGameDesign[]>;
  createMiniGameDesign(design: InsertMiniGameDesign): Promise<MiniGameDesign>;
  updateMiniGameDesign(id: number, updates: Partial<MiniGameDesign>): Promise<MiniGameDesign>;
  deleteMiniGameDesign(id: number): Promise<void>;

  // Social Media Posts
  getAllSocialMediaPosts(): Promise<SocialMediaPost[]>;
  getSocialMediaPostsByDesign(designId: number): Promise<SocialMediaPost[]>;
  getSocialMediaPostsByDateRange(startDate: string, endDate: string): Promise<SocialMediaPost[]>;
  createSocialMediaPost(post: InsertSocialMediaPost): Promise<SocialMediaPost>;
  updateSocialMediaPost(id: number, updates: Partial<SocialMediaPost>): Promise<SocialMediaPost>;
  deleteSocialMediaPost(id: number): Promise<void>;

  // Social Media Analytics
  getAllSocialMediaAnalytics(): Promise<SocialMediaAnalytics[]>;
  getSocialMediaAnalyticsByPost(postId: number): Promise<SocialMediaAnalytics[]>;
  getLatestAnalyticsForPost(postId: number): Promise<SocialMediaAnalytics | undefined>;
  createSocialMediaAnalytics(analytics: InsertSocialMediaAnalytics): Promise<SocialMediaAnalytics>;
  updateSocialMediaAnalytics(id: number, updates: Partial<SocialMediaAnalytics>): Promise<SocialMediaAnalytics>;

  // Performance Insights
  getAllPerformanceInsights(): Promise<PerformanceInsights[]>;
  getPerformanceInsightsByMiniGame(miniGameBlockId: number): Promise<PerformanceInsights[]>;
  getPerformanceInsightsByPlatform(platform: string): Promise<PerformanceInsights[]>;
  getPerformanceInsightsByDayOfWeek(dayOfWeek: string): Promise<PerformanceInsights[]>;
  createPerformanceInsights(insights: InsertPerformanceInsights): Promise<PerformanceInsights>;
  updatePerformanceInsights(id: number, updates: Partial<PerformanceInsights>): Promise<PerformanceInsights>;
  deletePerformanceInsights(id: number): Promise<void>;

  // Utility methods
  scheduleContentForMoonPhases(year: number, month: number): Promise<void>;
  aggregatePerformanceData(): Promise<void>;

  // Blog Content Studio
  getAllBlogPosts(): Promise<BlogPost[]>;
  getBlogPostsByStatus(status: string): Promise<BlogPost[]>;
  getBlogPostsByPlatform(platform: string): Promise<BlogPost[]>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, updates: Partial<BlogPost>): Promise<BlogPost>;
  deleteBlogPost(id: number): Promise<void>;

  getAllBlogIdeas(): Promise<BlogIdea[]>;
  getBlogIdeasByStatus(status: string): Promise<BlogIdea[]>;
  getBlogIdeasByPlatform(platform: string): Promise<BlogIdea[]>;
  createBlogIdea(idea: InsertBlogIdea): Promise<BlogIdea>;
  updateBlogIdea(id: number, updates: Partial<BlogIdea>): Promise<BlogIdea>;
  deleteBlogIdea(id: number): Promise<void>;
  generateAIContent(ideaId: number): Promise<BlogIdea>;

  getAllBlogCalendarEvents(): Promise<BlogCalendar[]>;
  getBlogCalendarEventsByDate(date: string): Promise<BlogCalendar[]>;
  getBlogCalendarEventsByDateRange(startDate: string, endDate: string): Promise<BlogCalendar[]>;
  createBlogCalendarEvent(event: InsertBlogCalendar): Promise<BlogCalendar>;
  updateBlogCalendarEvent(id: number, updates: Partial<BlogCalendar>): Promise<BlogCalendar>;
  deleteBlogCalendarEvent(id: number): Promise<void>;

  // Finance Methods
  // Budget Categories
  getAllBudgetCategories(): Promise<BudgetCategory[]>;
  createBudgetCategory(category: InsertBudgetCategory): Promise<BudgetCategory>;
  updateBudgetCategory(id: number, updates: Partial<BudgetCategory>): Promise<BudgetCategory>;
  deleteBudgetCategory(id: number): Promise<void>;

  // Expenses
  getAllExpenses(): Promise<Expense[]>;
  getExpensesByDateRange(startDate: string, endDate: string): Promise<Expense[]>;
  getExpensesByCategory(categoryId: number): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, updates: Partial<Expense>): Promise<Expense>;
  deleteExpense(id: number): Promise<void>;

  // Debt Management
  getAllDebts(): Promise<Debt[]>;
  getActiveDebts(): Promise<Debt[]>;
  createDebt(debt: InsertDebt): Promise<Debt>;
  updateDebt(id: number, updates: Partial<Debt>): Promise<Debt>;
  deleteDebt(id: number): Promise<void>;

  // Debt Payments
  getAllDebtPayments(): Promise<DebtPayment[]>;
  getDebtPaymentsByDebt(debtId: number): Promise<DebtPayment[]>;
  createDebtPayment(payment: InsertDebtPayment): Promise<DebtPayment>;
  updateDebtPayment(id: number, updates: Partial<DebtPayment>): Promise<DebtPayment>;
  deleteDebtPayment(id: number): Promise<void>;

  // Investments
  getAllInvestments(): Promise<Investment[]>;
  getInvestmentsByPlatform(platformId: number): Promise<Investment[]>;
  createInvestment(investment: InsertInvestment): Promise<Investment>;
  updateInvestment(id: number, updates: Partial<Investment>): Promise<Investment>;
  deleteInvestment(id: number): Promise<void>;

  // Investment Platforms
  getAllInvestmentPlatforms(): Promise<InvestmentPlatform[]>;
  createInvestmentPlatform(platform: InsertInvestmentPlatform): Promise<InvestmentPlatform>;
  updateInvestmentPlatform(id: number, updates: Partial<InvestmentPlatform>): Promise<InvestmentPlatform>;
  deleteInvestmentPlatform(id: number): Promise<void>;

  // Accounts
  getAllAccounts(): Promise<Account[]>;
  getActiveAccounts(): Promise<Account[]>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccount(id: number, updates: Partial<Account>): Promise<Account>;
  deleteAccount(id: number): Promise<void>;

  // Net Worth Tracking
  getAllNetWorthSnapshots(): Promise<NetWorthSnapshot[]>;
  getNetWorthSnapshotsByDateRange(startDate: string, endDate: string): Promise<NetWorthSnapshot[]>;
  createNetWorthSnapshot(snapshot: InsertNetWorthSnapshot): Promise<NetWorthSnapshot>;
  updateNetWorthSnapshot(id: number, updates: Partial<NetWorthSnapshot>): Promise<NetWorthSnapshot>;
  deleteNetWorthSnapshot(id: number): Promise<void>;

  // Financial Goals
  getAllFinancialGoals(): Promise<FinancialGoal[]>;
  getActiveFinancialGoals(): Promise<FinancialGoal[]>;
  createFinancialGoal(goal: InsertFinancialGoal): Promise<FinancialGoal>;
  updateFinancialGoal(id: number, updates: Partial<FinancialGoal>): Promise<FinancialGoal>;
  deleteFinancialGoal(id: number): Promise<void>;

  // Budget Management
  getAllBudgetPeriods(): Promise<BudgetPeriod[]>;
  getActiveBudgetPeriod(): Promise<BudgetPeriod | undefined>;
  createBudgetPeriod(period: InsertBudgetPeriod): Promise<BudgetPeriod>;
  updateBudgetPeriod(id: number, updates: Partial<BudgetPeriod>): Promise<BudgetPeriod>;
  deleteBudgetPeriod(id: number): Promise<void>;

  getAllBudgetAlerts(): Promise<BudgetAlert[]>;
  getActiveBudgetAlerts(): Promise<BudgetAlert[]>;
  createBudgetAlert(alert: InsertBudgetAlert): Promise<BudgetAlert>;
  updateBudgetAlert(id: number, updates: Partial<BudgetAlert>): Promise<BudgetAlert>;
  deleteBudgetAlert(id: number): Promise<void>;

  getAllSpendingTrends(): Promise<SpendingTrend[]>;
  getSpendingTrendsByCategory(categoryId: number): Promise<SpendingTrend[]>;
  createSpendingTrend(trend: InsertSpendingTrend): Promise<SpendingTrend>;
  updateSpendingTrend(id: number, updates: Partial<SpendingTrend>): Promise<SpendingTrend>;
  deleteSpendingTrend(id: number): Promise<void>;

  // Portfolio Management
  getAllPortfolios(): Promise<Portfolio[]>;
  getPortfolio(id: number): Promise<Portfolio | undefined>;
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  updatePortfolio(id: number, updates: Partial<Portfolio>): Promise<Portfolio>;
  deletePortfolio(id: number): Promise<void>;

  getAllPortfolioHoldings(): Promise<PortfolioHolding[]>;
  getPortfolioHoldingsByPortfolio(portfolioId: number): Promise<PortfolioHolding[]>;
  createPortfolioHolding(holding: InsertPortfolioHolding): Promise<PortfolioHolding>;
  updatePortfolioHolding(id: number, updates: Partial<PortfolioHolding>): Promise<PortfolioHolding>;
  deletePortfolioHolding(id: number): Promise<void>;

  getAllPriceHistory(): Promise<PriceHistory[]>;
  getPriceHistoryBySymbol(symbol: string): Promise<PriceHistory[]>;
  createPriceHistory(history: InsertPriceHistory): Promise<PriceHistory>;
  updatePriceHistory(id: number, updates: Partial<PriceHistory>): Promise<PriceHistory>;
  deletePriceHistory(id: number): Promise<void>;

  getAllInvestmentTransactions(): Promise<InvestmentTransaction[]>;
  getInvestmentTransactionsByInvestment(investmentId: number): Promise<InvestmentTransaction[]>;
  createInvestmentTransaction(transaction: InsertInvestmentTransaction): Promise<InvestmentTransaction>;
  updateInvestmentTransaction(id: number, updates: Partial<InvestmentTransaction>): Promise<InvestmentTransaction>;
  deleteInvestmentTransaction(id: number): Promise<void>;

  // Finance Analytics
  getBudgetAnalytics(month: string): Promise<any>;
  getSpendingTrends(startDate: string, endDate: string): Promise<any>;
  getDebtPayoffProjections(): Promise<any>;
  getInvestmentPerformance(): Promise<any>;
  getFinancialHealthScore(): Promise<any>;
  calculateBudgetVsActual(budgetPeriodId: number): Promise<any>;
  generateSpendingAlerts(): Promise<BudgetAlert[]>;
  calculateDebtPayoffTimelines(): Promise<any>;
  calculatePortfolioPerformance(portfolioId: number): Promise<any>;
  calculateNetWorthOverTime(startDate: string, endDate: string): Promise<any>;

  // Analytics methods
  getReportsAnalytics(period: string, startDate: string, endDate: string): Promise<any>;
  getHabitsAnalytics(startDate: string, endDate: string): Promise<any>;
  getGoalsAnalytics(period: string, startDate: string, endDate: string): Promise<any>;
  getHealthAnalytics(startDate: string, endDate: string): Promise<any>;

  // Jira Sync Mappings
  getJiraSyncMappings(): Promise<any[]>;
  saveJiraSyncMapping(mapping: any): Promise<void>;
  deleteJiraSyncMapping(belleJournalId: string): Promise<void>;
  getProductivityAnalytics(startDate: string, endDate: string): Promise<any>;
  getPublicStats(): Promise<any>;
  getPublicRecentContent(): Promise<any>;
  
  // Timer Sessions
  getActiveTimerSession(): Promise<TimerSession | null>;
  completeTimerSession(id: number, tasksCompleted: string[], habitsCompleted: string[], sessionContext: string): Promise<void>;
  
  // Calendar Selections
  getCalendarSelections(): Promise<SelectCalendarSelection[]>;
  createCalendarSelections(selections: InsertCalendarSelection[]): Promise<SelectCalendarSelection[]>;
  deleteCalendarSelection(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private dailyEntries: Map<string, DailyEntry> = new Map();
  private bills: Map<number, Bill> = new Map();
  private billPayments: Map<number, BillPayment> = new Map();
  private groceryItems: Map<number, GroceryItem> = new Map();
  private groceryLists: Map<number, GroceryList> = new Map();
  private goals: Map<number, Goal> = new Map();
  private habits: Map<number, Habit> = new Map();
  private habitLogs: Map<number, HabitLog> = new Map();
  private medications: Map<number, Medication> = new Map();
  private todos: Map<number, Todo> = new Map();
  private timeBlocks: Map<number, TimeBlock> = new Map();
  private focusSessions: Map<number, FocusSession> = new Map();
  private timerSessions: Map<number, TimerSession> = new Map();
  private budgets: Map<number, Budget> = new Map();
  private incomeEntries: Map<number, IncomeEntry> = new Map();
  private challenges: Map<number, Challenge> = new Map();
  private contentCategories: Map<number, ContentCategory> = new Map();
  private contentTypes: Map<number, ContentType> = new Map();
  private contentPieces: Map<number, ContentPiece> = new Map();
  private contentProgress: Map<number, ContentProgress> = new Map();
  private appProjects: Map<number, AppProject> = new Map();
  private appTasks: Map<number, AppTask> = new Map();
  private appSprints: Map<number, AppSprint> = new Map();
  private appTimeEntries: Map<number, AppTimeEntry> = new Map();
  private miniGameBlocks: Map<number, MiniGameBlock> = new Map();
  private miniGameDesigns: Map<number, MiniGameDesign> = new Map();
  private socialMediaPosts: Map<number, SocialMediaPost> = new Map();
  private socialMediaAnalytics: Map<number, SocialMediaAnalytics> = new Map();
  private performanceInsights: Map<number, PerformanceInsights> = new Map();
  private blogPosts: Map<number, BlogPost> = new Map();
  private blogIdeas: Map<number, BlogIdea> = new Map();
  private blogCalendarEvents: Map<number, BlogCalendar> = new Map();
  private budgetCategories: Map<number, BudgetCategory> = new Map();
  private expenses: Map<number, Expense> = new Map();
  private debts: Map<number, Debt> = new Map();
  private debtPayments: Map<number, DebtPayment> = new Map();
  private investments: Map<number, Investment> = new Map();
  private investmentPlatforms: Map<number, InvestmentPlatform> = new Map();
  private accounts: Map<number, Account> = new Map();
  private netWorthSnapshots: Map<number, NetWorthSnapshot> = new Map();
  private financialGoals: Map<number, FinancialGoal> = new Map();
  private budgetPeriods: Map<number, BudgetPeriod> = new Map();
  private budgetAlerts: Map<number, BudgetAlert> = new Map();
  private spendingTrends: Map<number, SpendingTrend> = new Map();
  private portfolios: Map<number, Portfolio> = new Map();
  private portfolioHoldings: Map<number, PortfolioHolding> = new Map();
  private priceHistory: Map<number, PriceHistory> = new Map();
  private investmentTransactions: Map<number, InvestmentTransaction> = new Map();
  private purchases: Map<number, Purchase> = new Map();
  private jiraSyncMappings: Map<string, any> = new Map();
  private calendarSelections: Map<number, SelectCalendarSelection> = new Map();
  private currentId = 1;

  constructor() {
    // Initialize with some default bills
    this.createBill({
      name: "Rent",
      amount: "1200.00",
      isAutoPay: true,
      dueDate: 1
    });
    this.createBill({
      name: "Utilities",
      amount: "150.00",
      isAutoPay: false,
      dueDate: 15
    });
    this.createBill({
      name: "Credit Card",
      amount: "300.00",
      isAutoPay: false,
      dueDate: 20
    });

    // Initialize with sample habits
    this.createHabit({
      name: "Morning Meditation",
      description: "10 minutes of mindfulness meditation",
      category: "wellness",
      targetFrequency: 1,
      currentStreak: 7,
      longestStreak: 21,
      isActive: true
    });

    this.createHabit({
      name: "Read for 30 Minutes",
      description: "Read books or educational content",
      category: "personal",
      targetFrequency: 1,
      currentStreak: 12,
      longestStreak: 18,
      isActive: true
    });

    this.createHabit({
      name: "Daily Exercise",
      description: "Any form of physical activity",
      category: "health",
      targetFrequency: 1,
      currentStreak: 5,
      longestStreak: 30,
      isActive: true
    });

    // Initialize with sample goals
    this.createGoal({
      title: "Drink More Water",
      description: "Drink at least 8 glasses of water daily",
      category: "health",
      targetValue: "8",
      currentValue: "6",
      unit: "glasses",
      targetDate: "2024-12-31",
      isCompleted: false
    });

    this.createGoal({
      title: "Complete Side Project",
      description: "Finish building my personal portfolio website",
      category: "work",
      targetValue: "100",
      currentValue: "75",
      unit: "percent",
      targetDate: "2024-03-15",
      isCompleted: false
    });

    this.createGoal({
      title: "Save Emergency Fund",
      description: "Build up 6 months of expenses",
      category: "finance",
      targetValue: "15000",
      currentValue: "8500",
      unit: "dollars",
      targetDate: "2024-12-31",
      isCompleted: false
    });

    // Initialize with sample content categories
    this.createContentCategory({
      name: "Mini Games",
      description: "Small interactive games and puzzles",
      color: "#FF6B6B"
    });

    this.createContentCategory({
      name: "Educational",
      description: "Learning and tutorial content",
      color: "#4ECDC4"
    });

    this.createContentCategory({
      name: "Entertainment",
      description: "Fun and engaging content",
      color: "#45B7D1"
    });

    // Initialize with sample content types
    this.createContentType({
      name: "Video Tutorial",
      description: "Step-by-step instructional videos",
      estimatedDuration: 15
    });

    this.createContentType({
      name: "Interactive Demo",
      description: "Hands-on demonstrations",
      estimatedDuration: 10
    });

    this.createContentType({
      name: "Blog Post",
      description: "Written articles and guides",
      estimatedDuration: 30
    });

    // Initialize with sample blog posts (will be replaced with Notion integration later)
    this.createBlogPost({
      title: "10 Productivity Tips for Remote Workers",
      content: "Working from home can be challenging, but with the right strategies...",
      excerpt: "Discover proven techniques to boost your productivity while working remotely.",
      status: "published",
      type: "blog",
      platform: "personal_blog",
      tags: JSON.stringify(["productivity", "remote work", "tips"]),
      publishedDate: "2024-01-15",
      priority: "high",
      wordCount: 1200,
      readingTime: 6,
      seoTitle: "10 Productivity Tips for Remote Workers - Boost Your Efficiency",
      seoDescription: "Learn how to maximize your productivity while working from home with these proven strategies and tips.",
      isAiGenerated: false
    });

    this.createBlogPost({
      title: "The Future of AI in Content Creation",
      content: "Artificial Intelligence is revolutionizing how we create content...",
      excerpt: "Explore how AI is transforming the content creation landscape.",
      status: "draft",
      type: "blog",
      platform: "medium",
      tags: JSON.stringify(["ai", "content creation", "technology"]),
      scheduledDate: "2024-01-25",
      priority: "medium",
      wordCount: 800,
      readingTime: 4,
      isAiGenerated: true
    });

    // Initialize with sample blog ideas (will be replaced with Notion integration later)
    this.createBlogIdea({
      title: "Building Sustainable Habits",
      description: "A deep dive into the psychology of habit formation and practical strategies for building lasting habits.",
      category: "lifestyle",
      platform: "substack",
      tags: JSON.stringify(["habits", "psychology", "self-improvement"]),
      priority: "high",
      status: "idea",
      estimatedReadTime: 8,
      targetAudience: "professionals seeking personal development",
      aiPrompt: "Write about the science of habit formation and include practical examples"
    });

    this.createBlogIdea({
      title: "The Rise of No-Code Development",
      description: "How no-code platforms are democratizing software development and what it means for the future.",
      category: "technology",
      platform: "linkedin",
      tags: JSON.stringify(["no-code", "development", "technology"]),
      priority: "medium",
      status: "in_progress",
      estimatedReadTime: 6,
      targetAudience: "developers and business professionals"
    });

    // Initialize with sample calendar events (will be replaced with Notion integration later)
    this.createBlogCalendarEvent({
      title: "Review and Edit AI Content Post",
      type: "review",
      platform: "medium",
      date: "2024-01-22",
      time: "14:00",
      status: "scheduled",
      notes: "Final review before publishing AI content creation article"
    });

    this.createBlogCalendarEvent({
      title: "Publish Remote Work Tips",
      type: "post",
      platform: "personal_blog",
      date: "2024-01-20",
      time: "09:00",
      status: "scheduled",
      notes: "Share on social media after publishing"
    });
  }

  // Daily Entries
  async getDailyEntry(date: string): Promise<DailyEntry | undefined> {
    return this.dailyEntries.get(date);
  }

  async createOrUpdateDailyEntry(entry: InsertDailyEntry): Promise<DailyEntry> {
    const existingEntry = this.dailyEntries.get(entry.date);
    const newEntry: DailyEntry = {
      id: existingEntry?.id || this.currentId++,
      ...entry,
      createdAt: existingEntry?.createdAt || new Date(),
      updatedAt: new Date()
    };
    this.dailyEntries.set(entry.date, newEntry);
    return newEntry;
  }

  // Bills
  async getAllBills(): Promise<Bill[]> {
    return Array.from(this.bills.values());
  }

  async createBill(bill: InsertBill): Promise<Bill> {
    const newBill: Bill = {
      id: this.currentId++,
      ...bill,
      createdAt: new Date()
    };
    this.bills.set(newBill.id, newBill);
    return newBill;
  }

  async deleteBill(id: number): Promise<void> {
    this.bills.delete(id);
  }

  // Bill Payments
  async getBillPaymentsForDate(date: string): Promise<BillPayment[]> {
    return Array.from(this.billPayments.values()).filter(payment => payment.date === date);
  }

  async createBillPayment(payment: InsertBillPayment): Promise<BillPayment> {
    const newPayment: BillPayment = {
      id: this.currentId++,
      ...payment,
      createdAt: new Date()
    };
    this.billPayments.set(newPayment.id, newPayment);
    return newPayment;
  }

  async updateBillPayment(id: number, isPaid: boolean): Promise<BillPayment> {
    const payment = this.billPayments.get(id);
    if (!payment) throw new Error("Payment not found");
    
    const updatedPayment = { ...payment, isPaid };
    this.billPayments.set(id, updatedPayment);
    return updatedPayment;
  }

  // Grocery Items
  async getAllGroceryItems(): Promise<GroceryItem[]> {
    return Array.from(this.groceryItems.values());
  }

  async createGroceryItem(item: InsertGroceryItem): Promise<GroceryItem> {
    const newItem: GroceryItem = {
      id: this.currentId++,
      ...item,
      createdAt: new Date()
    };
    this.groceryItems.set(newItem.id, newItem);
    return newItem;
  }

  async updateGroceryItem(id: number, updates: Partial<GroceryItem>): Promise<GroceryItem> {
    const item = this.groceryItems.get(id);
    if (!item) throw new Error("Item not found");
    
    const updatedItem = { ...item, ...updates };
    this.groceryItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteGroceryItem(id: number): Promise<void> {
    this.groceryItems.delete(id);
  }

  // Purchase Calendar
  async getAllPurchases(): Promise<Purchase[]> {
    return Array.from(this.purchases.values());
  }

  async getPurchasesByDateRange(startDate: string, endDate: string): Promise<Purchase[]> {
    return Array.from(this.purchases.values()).filter(purchase => 
      purchase.date >= startDate && purchase.date <= endDate
    );
  }

  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    const newPurchase: Purchase = {
      id: this.currentId++,
      ...purchase,
      createdAt: new Date()
    };
    this.purchases.set(newPurchase.id, newPurchase);
    return newPurchase;
  }

  async updatePurchase(id: number, updates: Partial<Purchase>): Promise<Purchase> {
    const purchase = this.purchases.get(id);
    if (!purchase) throw new Error("Purchase not found");
    
    const updatedPurchase = { ...purchase, ...updates };
    this.purchases.set(id, updatedPurchase);
    return updatedPurchase;
  }

  async deletePurchase(id: number): Promise<void> {
    this.purchases.delete(id);
  }

  // Grocery Lists
  async getAllGroceryLists(): Promise<GroceryList[]> {
    return Array.from(this.groceryLists.values());
  }

  async createGroceryList(list: InsertGroceryList): Promise<GroceryList> {
    const newList: GroceryList = {
      id: this.currentId++,
      ...list,
      createdAt: new Date()
    };
    this.groceryLists.set(newList.id, newList);
    return newList;
  }

  async deleteGroceryList(id: number): Promise<void> {
    this.groceryLists.delete(id);
  }

  // Goals
  async getAllGoals(): Promise<Goal[]> {
    return Array.from(this.goals.values());
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const newGoal: Goal = {
      id: this.currentId++,
      ...goal,
      createdAt: new Date()
    };
    this.goals.set(newGoal.id, newGoal);
    return newGoal;
  }

  async updateGoal(id: number, updates: Partial<Goal>): Promise<Goal> {
    const goal = this.goals.get(id);
    if (!goal) throw new Error("Goal not found");
    
    const updatedGoal = { ...goal, ...updates };
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }

  async deleteGoal(id: number): Promise<void> {
    this.goals.delete(id);
  }

  // Habits
  async getAllHabits(): Promise<Habit[]> {
    return Array.from(this.habits.values());
  }

  async createHabit(habit: InsertHabit): Promise<Habit> {
    const newHabit: Habit = {
      id: this.currentId++,
      ...habit,
      createdAt: new Date()
    };
    this.habits.set(newHabit.id, newHabit);
    return newHabit;
  }

  async updateHabit(id: number, updates: Partial<Habit>): Promise<Habit> {
    const habit = this.habits.get(id);
    if (!habit) throw new Error("Habit not found");
    
    const updatedHabit = { ...habit, ...updates };
    this.habits.set(id, updatedHabit);
    return updatedHabit;
  }

  async deleteHabit(id: number): Promise<void> {
    this.habits.delete(id);
  }

  // Habit Logs
  async getHabitLogs(habitId: number, startDate?: string, endDate?: string): Promise<HabitLog[]> {
    let logs = Array.from(this.habitLogs.values()).filter(log => log.habitId === habitId);
    
    if (startDate && endDate) {
      logs = logs.filter(log => log.date >= startDate && log.date <= endDate);
    }
    
    return logs;
  }

  async createHabitLog(log: InsertHabitLog): Promise<HabitLog> {
    const newLog: HabitLog = {
      id: this.currentId++,
      ...log,
      createdAt: new Date()
    };
    this.habitLogs.set(newLog.id, newLog);
    return newLog;
  }

  async updateHabitLog(id: number, updates: Partial<HabitLog>): Promise<HabitLog> {
    const log = this.habitLogs.get(id);
    if (!log) throw new Error("Habit log not found");
    
    const updatedLog = { ...log, ...updates };
    this.habitLogs.set(id, updatedLog);
    return updatedLog;
  }

  // Medications
  async getAllMedications(): Promise<Medication[]> {
    return Array.from(this.medications.values());
  }

  async createMedication(medication: InsertMedication): Promise<Medication> {
    const newMedication: Medication = {
      id: this.currentId++,
      ...medication,
      createdAt: new Date()
    };
    this.medications.set(newMedication.id, newMedication);
    return newMedication;
  }

  async updateMedication(id: number, updates: Partial<Medication>): Promise<Medication> {
    const medication = this.medications.get(id);
    if (!medication) throw new Error("Medication not found");
    
    const updatedMedication = { ...medication, ...updates };
    this.medications.set(id, updatedMedication);
    return updatedMedication;
  }

  async deleteMedication(id: number): Promise<void> {
    this.medications.delete(id);
  }

  // Todos
  async getAllTodos(): Promise<Todo[]> {
    return Array.from(this.todos.values());
  }

  async getTodosByDate(date: string): Promise<Todo[]> {
    return Array.from(this.todos.values()).filter(todo => todo.dueDate === date);
  }

  async createTodo(todo: InsertTodo): Promise<Todo> {
    const newTodo: Todo = {
      id: this.currentId++,
      ...todo,
      createdAt: new Date()
    };
    this.todos.set(newTodo.id, newTodo);
    return newTodo;
  }

  async updateTodo(id: number, updates: Partial<Todo>): Promise<Todo> {
    const todo = this.todos.get(id);
    if (!todo) throw new Error("Todo not found");
    
    const updatedTodo = { ...todo, ...updates };
    this.todos.set(id, updatedTodo);
    return updatedTodo;
  }

  async deleteTodo(id: number): Promise<void> {
    this.todos.delete(id);
  }

  // Time Blocks
  async getAllTimeBlocks(): Promise<TimeBlock[]> {
    return Array.from(this.timeBlocks.values());
  }

  async getTimeBlocksByDate(date: string): Promise<TimeBlock[]> {
    return Array.from(this.timeBlocks.values()).filter(block => block.date === date);
  }

  async createTimeBlock(timeBlock: InsertTimeBlock): Promise<TimeBlock> {
    const newTimeBlock: TimeBlock = {
      id: this.currentId++,
      ...timeBlock,
      createdAt: new Date()
    };
    this.timeBlocks.set(newTimeBlock.id, newTimeBlock);
    return newTimeBlock;
  }

  async updateTimeBlock(id: number, updates: Partial<TimeBlock>): Promise<TimeBlock> {
    const timeBlock = this.timeBlocks.get(id);
    if (!timeBlock) throw new Error("Time block not found");
    
    const updatedTimeBlock = { ...timeBlock, ...updates };
    this.timeBlocks.set(id, updatedTimeBlock);
    return updatedTimeBlock;
  }

  async deleteTimeBlock(id: number): Promise<void> {
    this.timeBlocks.delete(id);
  }

  // Focus Sessions
  async getAllFocusSessions(): Promise<FocusSession[]> {
    return Array.from(this.focusSessions.values());
  }

  async getFocusSessionsByDate(date: string): Promise<FocusSession[]> {
    return Array.from(this.focusSessions.values()).filter(session => session.date === date);
  }

  async createFocusSession(session: InsertFocusSession): Promise<FocusSession> {
    const newSession: FocusSession = {
      id: this.currentId++,
      ...session,
      createdAt: new Date()
    };
    this.focusSessions.set(newSession.id, newSession);
    return newSession;
  }

  async updateFocusSession(id: number, updates: Partial<FocusSession>): Promise<FocusSession> {
    const session = this.focusSessions.get(id);
    if (!session) throw new Error("Focus session not found");
    
    const updatedSession = { ...session, ...updates };
    this.focusSessions.set(id, updatedSession);
    return updatedSession;
  }

  async deleteFocusSession(id: number): Promise<void> {
    this.focusSessions.delete(id);
  }

  // Timer Sessions - in-memory fallback
  async getActiveTimerSession(): Promise<TimerSession | null> {
    const activeSessions = Array.from(this.timerSessions.values()).filter(session => session.isActive);
    return activeSessions.length > 0 ? activeSessions[0] : null;
  }

  // Budgets
  async getAllBudgets(): Promise<Budget[]> {
    return Array.from(this.budgets.values());
  }

  async getBudgetsByMonth(month: string): Promise<Budget[]> {
    return Array.from(this.budgets.values()).filter(budget => budget.month === month);
  }

  async createBudget(budget: InsertBudget): Promise<Budget> {
    const newBudget: Budget = {
      id: this.currentId++,
      ...budget,
      createdAt: new Date()
    };
    this.budgets.set(newBudget.id, newBudget);
    return newBudget;
  }

  async updateBudget(id: number, updates: Partial<Budget>): Promise<Budget> {
    const budget = this.budgets.get(id);
    if (!budget) throw new Error("Budget not found");
    
    const updatedBudget = { ...budget, ...updates };
    this.budgets.set(id, updatedBudget);
    return updatedBudget;
  }

  async deleteBudget(id: number): Promise<void> {
    this.budgets.delete(id);
  }

  // Income Entries
  async getAllIncomeEntries(): Promise<IncomeEntry[]> {
    return Array.from(this.incomeEntries.values());
  }

  async getIncomeEntriesByDateRange(startDate: string, endDate: string): Promise<IncomeEntry[]> {
    return Array.from(this.incomeEntries.values()).filter(entry => 
      entry.date >= startDate && entry.date <= endDate
    );
  }

  async createIncomeEntry(entry: InsertIncomeEntry): Promise<IncomeEntry> {
    const newEntry: IncomeEntry = {
      id: this.currentId++,
      ...entry,
      createdAt: new Date()
    };
    this.incomeEntries.set(newEntry.id, newEntry);
    return newEntry;
  }

  async deleteIncomeEntry(id: number): Promise<void> {
    this.incomeEntries.delete(id);
  }

  // Challenges
  async getAllChallenges(): Promise<Challenge[]> {
    return Array.from(this.challenges.values());
  }

  async getActiveChallenges(): Promise<Challenge[]> {
    return Array.from(this.challenges.values()).filter(challenge => challenge.isActive);
  }

  async createChallenge(challenge: InsertChallenge): Promise<Challenge> {
    const newChallenge: Challenge = {
      id: this.currentId++,
      ...challenge,
      createdAt: new Date()
    };
    this.challenges.set(newChallenge.id, newChallenge);
    return newChallenge;
  }

  async updateChallenge(id: number, updates: Partial<Challenge>): Promise<Challenge> {
    const challenge = this.challenges.get(id);
    if (!challenge) throw new Error("Challenge not found");
    
    const updatedChallenge = { ...challenge, ...updates };
    this.challenges.set(id, updatedChallenge);
    return updatedChallenge;
  }

  async deleteChallenge(id: number): Promise<void> {
    this.challenges.delete(id);
  }

  // Content Categories
  async getAllContentCategories(): Promise<ContentCategory[]> {
    return Array.from(this.contentCategories.values());
  }

  async createContentCategory(category: InsertContentCategory): Promise<ContentCategory> {
    const newCategory: ContentCategory = {
      id: this.currentId++,
      ...category,
      createdAt: new Date()
    };
    this.contentCategories.set(newCategory.id, newCategory);
    return newCategory;
  }

  // Content Types
  async getAllContentTypes(): Promise<ContentType[]> {
    return Array.from(this.contentTypes.values());
  }

  async createContentType(type: InsertContentType): Promise<ContentType> {
    const newType: ContentType = {
      id: this.currentId++,
      ...type,
      createdAt: new Date()
    };
    this.contentTypes.set(newType.id, newType);
    return newType;
  }

  // Content Pieces
  async getAllContentPieces(): Promise<ContentPiece[]> {
    return Array.from(this.contentPieces.values());
  }

  async createContentPiece(piece: InsertContentPiece): Promise<ContentPiece> {
    const newPiece: ContentPiece = {
      id: this.currentId++,
      ...piece,
      createdAt: new Date()
    };
    this.contentPieces.set(newPiece.id, newPiece);
    return newPiece;
  }

  async updateContentPiece(id: number, updates: Partial<ContentPiece>): Promise<ContentPiece> {
    const piece = this.contentPieces.get(id);
    if (!piece) throw new Error("Content piece not found");
    
    const updatedPiece = { ...piece, ...updates };
    this.contentPieces.set(id, updatedPiece);
    return updatedPiece;
  }

  // Content Progress
  async getAllContentProgress(): Promise<ContentProgress[]> {
    return Array.from(this.contentProgress.values());
  }

  async createContentProgress(progress: InsertContentProgress): Promise<ContentProgress> {
    const newProgress: ContentProgress = {
      id: this.currentId++,
      ...progress,
      createdAt: new Date()
    };
    this.contentProgress.set(newProgress.id, newProgress);
    return newProgress;
  }

  // App Projects
  async getAllAppProjects(): Promise<AppProject[]> {
    return Array.from(this.appProjects.values());
  }

  async getAppProject(id: number): Promise<AppProject | undefined> {
    return this.appProjects.get(id);
  }

  async createAppProject(project: InsertAppProject): Promise<AppProject> {
    const newProject: AppProject = {
      id: this.currentId++,
      ...project,
      createdAt: new Date()
    };
    this.appProjects.set(newProject.id, newProject);
    return newProject;
  }

  async updateAppProject(id: number, updates: Partial<AppProject>): Promise<AppProject> {
    const project = this.appProjects.get(id);
    if (!project) throw new Error("App project not found");
    
    const updatedProject = { ...project, ...updates };
    this.appProjects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteAppProject(id: number): Promise<void> {
    this.appProjects.delete(id);
  }

  // App Tasks
  async getAppTasksByProject(projectId: number): Promise<AppTask[]> {
    return Array.from(this.appTasks.values()).filter(task => task.projectId === projectId);
  }

  async getAllAppTasks(): Promise<AppTask[]> {
    return Array.from(this.appTasks.values());
  }

  async createAppTask(task: InsertAppTask): Promise<AppTask> {
    const newTask: AppTask = {
      id: this.currentId++,
      ...task,
      createdAt: new Date()
    };
    this.appTasks.set(newTask.id, newTask);
    return newTask;
  }

  async updateAppTask(id: number, updates: Partial<AppTask>): Promise<AppTask> {
    const task = this.appTasks.get(id);
    if (!task) throw new Error("App task not found");
    
    const updatedTask = { ...task, ...updates };
    this.appTasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteAppTask(id: number): Promise<void> {
    this.appTasks.delete(id);
  }

  // App Sprints
  async getAppSprintsByProject(projectId: number): Promise<AppSprint[]> {
    return Array.from(this.appSprints.values()).filter(sprint => sprint.projectId === projectId);
  }

  async createAppSprint(sprint: InsertAppSprint): Promise<AppSprint> {
    const newSprint: AppSprint = {
      id: this.currentId++,
      ...sprint,
      createdAt: new Date()
    };
    this.appSprints.set(newSprint.id, newSprint);
    return newSprint;
  }

  async updateAppSprint(id: number, updates: Partial<AppSprint>): Promise<AppSprint> {
    const sprint = this.appSprints.get(id);
    if (!sprint) throw new Error("App sprint not found");
    
    const updatedSprint = { ...sprint, ...updates };
    this.appSprints.set(id, updatedSprint);
    return updatedSprint;
  }

  async deleteAppSprint(id: number): Promise<void> {
    this.appSprints.delete(id);
  }

  // App Time Entries
  async getAppTimeEntriesByProject(projectId: number, startDate?: string, endDate?: string): Promise<AppTimeEntry[]> {
    let entries = Array.from(this.appTimeEntries.values()).filter(entry => entry.projectId === projectId);
    
    if (startDate && endDate) {
      entries = entries.filter(entry => entry.date >= startDate && entry.date <= endDate);
    }
    
    return entries;
  }

  async createAppTimeEntry(entry: InsertAppTimeEntry): Promise<AppTimeEntry> {
    const newEntry: AppTimeEntry = {
      id: this.currentId++,
      ...entry,
      createdAt: new Date()
    };
    this.appTimeEntries.set(newEntry.id, newEntry);
    return newEntry;
  }

  async updateAppTimeEntry(id: number, updates: Partial<AppTimeEntry>): Promise<AppTimeEntry> {
    const entry = this.appTimeEntries.get(id);
    if (!entry) throw new Error("App time entry not found");
    
    const updatedEntry = { ...entry, ...updates };
    this.appTimeEntries.set(id, updatedEntry);
    return updatedEntry;
  }

  async deleteAppTimeEntry(id: number): Promise<void> {
    this.appTimeEntries.delete(id);
  }

  // Mini Game Blocks
  async getAllMiniGameBlocks(): Promise<MiniGameBlock[]> {
    return Array.from(this.miniGameBlocks.values());
  }

  async createMiniGameBlock(block: InsertMiniGameBlock): Promise<MiniGameBlock> {
    const newBlock: MiniGameBlock = {
      id: this.currentId++,
      ...block,
      createdAt: new Date()
    };
    this.miniGameBlocks.set(newBlock.id, newBlock);
    return newBlock;
  }

  async updateMiniGameBlock(id: number, updates: Partial<MiniGameBlock>): Promise<MiniGameBlock> {
    const block = this.miniGameBlocks.get(id);
    if (!block) throw new Error("Mini game block not found");
    
    const updatedBlock = { ...block, ...updates };
    this.miniGameBlocks.set(id, updatedBlock);
    return updatedBlock;
  }

  async deleteMiniGameBlock(id: number): Promise<void> {
    this.miniGameBlocks.delete(id);
  }

  // Mini Game Designs
  async getAllMiniGameDesigns(): Promise<MiniGameDesign[]> {
    return Array.from(this.miniGameDesigns.values());
  }

  async getMiniGameDesignsByBlock(blockId: number): Promise<MiniGameDesign[]> {
    return Array.from(this.miniGameDesigns.values()).filter(design => design.blockId === blockId);
  }

  async createMiniGameDesign(design: InsertMiniGameDesign): Promise<MiniGameDesign> {
    const newDesign: MiniGameDesign = {
      id: this.currentId++,
      ...design,
      createdAt: new Date()
    };
    this.miniGameDesigns.set(newDesign.id, newDesign);
    return newDesign;
  }

  async updateMiniGameDesign(id: number, updates: Partial<MiniGameDesign>): Promise<MiniGameDesign> {
    const design = this.miniGameDesigns.get(id);
    if (!design) throw new Error("Mini game design not found");
    
    const updatedDesign = { ...design, ...updates };
    this.miniGameDesigns.set(id, updatedDesign);
    return updatedDesign;
  }

  async deleteMiniGameDesign(id: number): Promise<void> {
    this.miniGameDesigns.delete(id);
  }

  // Social Media Posts
  async getAllSocialMediaPosts(): Promise<SocialMediaPost[]> {
    return Array.from(this.socialMediaPosts.values());
  }

  async getSocialMediaPostsByDesign(designId: number): Promise<SocialMediaPost[]> {
    return Array.from(this.socialMediaPosts.values()).filter(post => post.designId === designId);
  }

  async getSocialMediaPostsByDateRange(startDate: string, endDate: string): Promise<SocialMediaPost[]> {
    return Array.from(this.socialMediaPosts.values()).filter(post => 
      post.scheduledDate && post.scheduledDate >= startDate && post.scheduledDate <= endDate
    );
  }

  async createSocialMediaPost(post: InsertSocialMediaPost): Promise<SocialMediaPost> {
    const newPost: SocialMediaPost = {
      id: this.currentId++,
      ...post,
      createdAt: new Date()
    };
    this.socialMediaPosts.set(newPost.id, newPost);
    return newPost;
  }

  async updateSocialMediaPost(id: number, updates: Partial<SocialMediaPost>): Promise<SocialMediaPost> {
    const post = this.socialMediaPosts.get(id);
    if (!post) throw new Error("Social media post not found");
    
    const updatedPost = { ...post, ...updates };
    this.socialMediaPosts.set(id, updatedPost);
    return updatedPost;
  }

  async deleteSocialMediaPost(id: number): Promise<void> {
    this.socialMediaPosts.delete(id);
  }

  // Social Media Analytics
  async getAllSocialMediaAnalytics(): Promise<SocialMediaAnalytics[]> {
    return Array.from(this.socialMediaAnalytics.values());
  }

  async getSocialMediaAnalyticsByPost(postId: number): Promise<SocialMediaAnalytics[]> {
    return Array.from(this.socialMediaAnalytics.values()).filter(analytics => analytics.postId === postId);
  }

  async getLatestAnalyticsForPost(postId: number): Promise<SocialMediaAnalytics | undefined> {
    const analytics = this.getSocialMediaAnalyticsByPost(postId);
    return (await analytics).sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime())[0];
  }

  async createSocialMediaAnalytics(analytics: InsertSocialMediaAnalytics): Promise<SocialMediaAnalytics> {
    const newAnalytics: SocialMediaAnalytics = {
      id: this.currentId++,
      ...analytics,
      createdAt: new Date()
    };
    this.socialMediaAnalytics.set(newAnalytics.id, newAnalytics);
    return newAnalytics;
  }

  async updateSocialMediaAnalytics(id: number, updates: Partial<SocialMediaAnalytics>): Promise<SocialMediaAnalytics> {
    const analytics = this.socialMediaAnalytics.get(id);
    if (!analytics) throw new Error("Social media analytics not found");
    
    const updatedAnalytics = { ...analytics, ...updates };
    this.socialMediaAnalytics.set(id, updatedAnalytics);
    return updatedAnalytics;
  }

  // Performance Insights
  async getAllPerformanceInsights(): Promise<PerformanceInsights[]> {
    return Array.from(this.performanceInsights.values());
  }

  async getPerformanceInsightsByMiniGame(miniGameBlockId: number): Promise<PerformanceInsights[]> {
    return Array.from(this.performanceInsights.values()).filter(insight => insight.miniGameBlockId === miniGameBlockId);
  }

  async getPerformanceInsightsByPlatform(platform: string): Promise<PerformanceInsights[]> {
    return Array.from(this.performanceInsights.values()).filter(insight => insight.platform === platform);
  }

  async getPerformanceInsightsByDayOfWeek(dayOfWeek: string): Promise<PerformanceInsights[]> {
    return Array.from(this.performanceInsights.values()).filter(insight => insight.dayOfWeek === dayOfWeek);
  }

  async createPerformanceInsights(insights: InsertPerformanceInsights): Promise<PerformanceInsights> {
    const newInsights: PerformanceInsights = {
      id: this.currentId++,
      ...insights,
      createdAt: new Date()
    };
    this.performanceInsights.set(newInsights.id, newInsights);
    return newInsights;
  }

  async updatePerformanceInsights(id: number, updates: Partial<PerformanceInsights>): Promise<PerformanceInsights> {
    const insights = this.performanceInsights.get(id);
    if (!insights) throw new Error("Performance insights not found");
    
    const updatedInsights = { ...insights, ...updates };
    this.performanceInsights.set(id, updatedInsights);
    return updatedInsights;
  }

  async deletePerformanceInsights(id: number): Promise<void> {
    this.performanceInsights.delete(id);
  }

  // Utility methods
  async scheduleContentForMoonPhases(year: number, month: number): Promise<void> {
    // Mock implementation - in a real app, this would calculate moon phases
    // and schedule content accordingly
    console.log(`Scheduling content for moon phases in ${year}-${month}`);
  }

  async aggregatePerformanceData(): Promise<void> {
    // Mock implementation - in a real app, this would aggregate performance data
    console.log("Aggregating performance data");
  }

  // Analytics methods
  async getReportsAnalytics(period: string, startDate: string, endDate: string): Promise<any> {
    const habits = Array.from(this.habits.values());
    const goals = Array.from(this.goals.values());
    const dailyEntries = Array.from(this.dailyEntries.values()).filter(entry => 
      entry.date >= startDate && entry.date <= endDate
    );

    return {
      period,
      startDate,
      endDate,
      summary: {
        activeHabits: habits.filter(h => h.isActive).length,
        completedGoals: goals.filter(g => g.isCompleted).length,
        totalDailyEntries: dailyEntries.length,
        avgMoodScore: dailyEntries.length > 0 ? 
          dailyEntries.reduce((sum, entry) => sum + (entry.energyLevel || 0), 0) / dailyEntries.length : 0
      },
      trends: {
        habitConsistency: habits.filter(h => (h.currentStreak || 0) > 5).length,
        goalProgress: goals.filter(g => !g.isCompleted && parseFloat(g.currentValue || "0") > 0).length,
        wellnessImprovement: dailyEntries.filter(entry => (entry.energyLevel || 0) >= 4).length
      }
    };
  }

  async getHabitsAnalytics(startDate: string, endDate: string): Promise<any> {
    const habits = Array.from(this.habits.values());
    const habitLogs = Array.from(this.habitLogs.values()).filter(log => 
      log.date >= startDate && log.date <= endDate
    );

    const habitsAnalytics = habits.map(habit => {
      const logs = habitLogs.filter(log => log.habitId === habit.id);
      const completionRate = logs.length > 0 ? 
        (logs.filter(log => log.completed).length / logs.length) * 100 : 0;

      return {
        id: habit.id,
        name: habit.name,
        category: habit.category,
        currentStreak: habit.currentStreak || 0,
        longestStreak: habit.longestStreak || 0,
        completionRate: Math.round(completionRate),
        isActive: habit.isActive,
        trend: completionRate > 70 ? 'improving' : completionRate > 40 ? 'stable' : 'declining'
      };
    });

    return {
      habits: habitsAnalytics,
      summary: {
        total: habits.length,
        active: habits.filter(h => h.isActive).length,
        strongHabits: habitsAnalytics.filter(h => h.completionRate > 70).length,
        avgCompletionRate: Math.round(
          habitsAnalytics.reduce((sum, h) => sum + h.completionRate, 0) / habitsAnalytics.length
        )
      }
    };
  }

  async getGoalsAnalytics(period: string, startDate: string, endDate: string): Promise<any> {
    const goals = Array.from(this.goals.values());
    const activeGoals = goals.filter(goal => !goal.isCompleted);
    const completedGoals = goals.filter(goal => goal.isCompleted);

    const goalsAnalytics = goals.map(goal => {
      const currentVal = parseFloat(goal.currentValue || "0");
      const targetVal = parseFloat(goal.targetValue || "0");
      const progress = targetVal > 0 ? (currentVal / targetVal) * 100 : 0;

      return {
        id: goal.id,
        title: goal.title,
        category: goal.category,
        progress: Math.round(progress),
        isCompleted: goal.isCompleted,
        targetDate: goal.targetDate,
        onTrack: progress >= 75 || goal.isCompleted
      };
    });

    return {
      goals: goalsAnalytics,
      summary: {
        total: goals.length,
        active: activeGoals.length,
        completed: completedGoals.length,
        onTrack: goalsAnalytics.filter(g => g.onTrack).length
      }
    };
  }

  async getHealthAnalytics(startDate: string, endDate: string): Promise<any> {
    const dailyEntries = Array.from(this.dailyEntries.values()).filter(entry => 
      entry.date >= startDate && entry.date <= endDate
    );

    const totalDays = dailyEntries.length;
    if (totalDays === 0) return { totalDays: 0 };

    const avgWaterIntake = dailyEntries.reduce((sum, entry) => sum + (entry.waterIntake || 0), 0) / totalDays;
    const avgSleepHours = dailyEntries.reduce((sum, entry) => sum + parseFloat(entry.sleepHours || "0"), 0) / totalDays;
    const avgMoodScore = dailyEntries.reduce((sum, entry) => sum + (entry.energyLevel || 0), 0) / totalDays;
    const exerciseConsistency = dailyEntries.filter(entry => entry.exerciseCompleted).length;

    return {
      totalDays,
      avgWaterIntake: Math.round(avgWaterIntake * 10) / 10,
      avgSleepHours: Math.round(avgSleepHours * 10) / 10,
      avgMoodScore: Math.round(avgMoodScore * 10) / 10,
      exerciseConsistency: Math.round((exerciseConsistency / totalDays) * 100),
      trends: {
        hydrationOnTrack: avgWaterIntake >= 8,
        sleepOnTrack: avgSleepHours >= 7 && avgSleepHours <= 9,
        moodImproving: avgMoodScore >= 4,
        activeLifestyle: exerciseConsistency > totalDays * 0.6
      }
    };
  }

  async getProductivityAnalytics(startDate: string, endDate: string): Promise<any> {
    const dailyEntries = Array.from(this.dailyEntries.values()).filter(entry => 
      entry.date >= startDate && entry.date <= endDate
    );
    const focusSessions = Array.from(this.focusSessions.values()).filter(session =>
      session.date >= startDate && session.date <= endDate
    );

    const totalDays = dailyEntries.length;
    if (totalDays === 0) return { totalDays: 0 };

    const avgWorkHours = dailyEntries.reduce((sum, entry) => sum + parseFloat(entry.workHours || "0"), 0) / totalDays;
    const avgFocusSessions = dailyEntries.reduce((sum, entry) => sum + (entry.focusSessionsCompleted || 0), 0) / totalDays;
    const successfulSessions = focusSessions.filter(session => session.wasSuccessful).length;

    return {
      totalDays,
      avgWorkHours: Math.round(avgWorkHours * 10) / 10,
      avgFocusSessions: Math.round(avgFocusSessions * 10) / 10,
      totalFocusSessions: focusSessions.length,
      successRate: focusSessions.length > 0 ? Math.round((successfulSessions / focusSessions.length) * 100) : 0,
      trends: {
        workLifeBalance: avgWorkHours >= 6 && avgWorkHours <= 8,
        focusImproving: avgFocusSessions >= 2,
        consistentProductivity: successfulSessions > focusSessions.length * 0.7
      }
    };
  }

  async getPublicStats(): Promise<any> {
    const habits = Array.from(this.habits.values());
    const goals = Array.from(this.goals.values());
    const dailyEntries = Array.from(this.dailyEntries.values());
    const contentPieces = Array.from(this.contentPieces.values());

    return {
      totalHabits: habits.length,
      activeHabits: habits.filter(h => h.isActive).length,
      completedGoals: goals.filter(g => g.isCompleted).length,
      totalDailyEntries: dailyEntries.length,
      publishedContent: contentPieces.filter(c => c.status === 'published').length,
      lastUpdated: new Date().toISOString()
    };
  }

  async getPublicRecentContent(): Promise<any> {
    const contentPieces = Array.from(this.contentPieces.values())
      .filter(c => c.status === 'published')
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5);

    return contentPieces.map(piece => ({
      id: piece.id,
      title: piece.title,
      category: piece.categoryId,
      publishedDate: piece.createdAt,
      tags: piece.tags ? JSON.parse(piece.tags) : []
    }));
  }

  // Blog Content Studio methods
  async getAllBlogPosts(): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getBlogPostsByStatus(status: string): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values()).filter(post => post.status === status);
  }

  async getBlogPostsByPlatform(platform: string): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values()).filter(post => post.platform === platform);
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const newPost: BlogPost = {
      id: this.currentId++,
      ...post,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.blogPosts.set(newPost.id, newPost);
    return newPost;
  }

  async updateBlogPost(id: number, updates: Partial<BlogPost>): Promise<BlogPost> {
    const post = this.blogPosts.get(id);
    if (!post) throw new Error("Blog post not found");
    
    const updatedPost = { ...post, ...updates, updatedAt: new Date() };
    this.blogPosts.set(id, updatedPost);
    return updatedPost;
  }

  async deleteBlogPost(id: number): Promise<void> {
    this.blogPosts.delete(id);
  }

  async getAllBlogIdeas(): Promise<BlogIdea[]> {
    return Array.from(this.blogIdeas.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getBlogIdeasByStatus(status: string): Promise<BlogIdea[]> {
    return Array.from(this.blogIdeas.values()).filter(idea => idea.status === status);
  }

  async getBlogIdeasByPlatform(platform: string): Promise<BlogIdea[]> {
    return Array.from(this.blogIdeas.values()).filter(idea => idea.platform === platform);
  }

  async createBlogIdea(idea: InsertBlogIdea): Promise<BlogIdea> {
    const newIdea: BlogIdea = {
      id: this.currentId++,
      ...idea,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.blogIdeas.set(newIdea.id, newIdea);
    return newIdea;
  }

  async updateBlogIdea(id: number, updates: Partial<BlogIdea>): Promise<BlogIdea> {
    const idea = this.blogIdeas.get(id);
    if (!idea) throw new Error("Blog idea not found");
    
    const updatedIdea = { ...idea, ...updates, updatedAt: new Date() };
    this.blogIdeas.set(id, updatedIdea);
    return updatedIdea;
  }

  async deleteBlogIdea(id: number): Promise<void> {
    this.blogIdeas.delete(id);
  }

  async generateAIContent(ideaId: number): Promise<BlogIdea> {
    const idea = this.blogIdeas.get(ideaId);
    if (!idea) throw new Error("Blog idea not found");
    
    // Mock AI content generation
    const aiContent = `This is AI-generated content based on the prompt: "${idea.aiPrompt || idea.title}". 
    
    The content would explore ${idea.description} and provide valuable insights for ${idea.targetAudience}.
    
    Key topics to cover:
    - Introduction to the concept
    - Practical applications
    - Real-world examples
    - Conclusion and key takeaways
    
    This content is optimized for ${idea.platform} and targets an estimated reading time of ${idea.estimatedReadTime} minutes.`;
    
    const updatedIdea = { 
      ...idea, 
      aiGeneratedContent: aiContent, 
      status: "in_progress",
      updatedAt: new Date() 
    };
    
    this.blogIdeas.set(ideaId, updatedIdea);
    return updatedIdea;
  }

  async getAllBlogCalendarEvents(): Promise<BlogCalendar[]> {
    return Array.from(this.blogCalendarEvents.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  async getBlogCalendarEventsByDate(date: string): Promise<BlogCalendar[]> {
    return Array.from(this.blogCalendarEvents.values()).filter(event => event.date === date);
  }

  async getBlogCalendarEventsByDateRange(startDate: string, endDate: string): Promise<BlogCalendar[]> {
    return Array.from(this.blogCalendarEvents.values()).filter(event => 
      event.date >= startDate && event.date <= endDate
    );
  }

  async createBlogCalendarEvent(event: InsertBlogCalendar): Promise<BlogCalendar> {
    const newEvent: BlogCalendar = {
      id: this.currentId++,
      ...event,
      createdAt: new Date()
    };
    this.blogCalendarEvents.set(newEvent.id, newEvent);
    return newEvent;
  }

  async updateBlogCalendarEvent(id: number, updates: Partial<BlogCalendar>): Promise<BlogCalendar> {
    const event = this.blogCalendarEvents.get(id);
    if (!event) throw new Error("Blog calendar event not found");
    
    const updatedEvent = { ...event, ...updates };
    this.blogCalendarEvents.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteBlogCalendarEvent(id: number): Promise<void> {
    this.blogCalendarEvents.delete(id);
  }

  // Budget Management Implementation
  async getAllBudgetPeriods(): Promise<BudgetPeriod[]> {
    return Array.from(this.budgetPeriods.values()).sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }

  async getActiveBudgetPeriod(): Promise<BudgetPeriod | undefined> {
    return Array.from(this.budgetPeriods.values()).find(period => period.isActive);
  }

  async createBudgetPeriod(period: InsertBudgetPeriod): Promise<BudgetPeriod> {
    const newPeriod: BudgetPeriod = {
      id: this.currentId++,
      ...period,
      createdAt: new Date()
    };
    this.budgetPeriods.set(newPeriod.id, newPeriod);
    return newPeriod;
  }

  async updateBudgetPeriod(id: number, updates: Partial<BudgetPeriod>): Promise<BudgetPeriod> {
    const period = this.budgetPeriods.get(id);
    if (!period) throw new Error("Budget period not found");
    
    const updatedPeriod = { ...period, ...updates };
    this.budgetPeriods.set(id, updatedPeriod);
    return updatedPeriod;
  }

  async deleteBudgetPeriod(id: number): Promise<void> {
    this.budgetPeriods.delete(id);
  }

  async getAllBudgetAlerts(): Promise<BudgetAlert[]> {
    return Array.from(this.budgetAlerts.values());
  }

  async getActiveBudgetAlerts(): Promise<BudgetAlert[]> {
    return Array.from(this.budgetAlerts.values()).filter(alert => alert.isActive);
  }

  async createBudgetAlert(alert: InsertBudgetAlert): Promise<BudgetAlert> {
    const newAlert: BudgetAlert = {
      id: this.currentId++,
      ...alert,
      createdAt: new Date()
    };
    this.budgetAlerts.set(newAlert.id, newAlert);
    return newAlert;
  }

  async updateBudgetAlert(id: number, updates: Partial<BudgetAlert>): Promise<BudgetAlert> {
    const alert = this.budgetAlerts.get(id);
    if (!alert) throw new Error("Budget alert not found");
    
    const updatedAlert = { ...alert, ...updates };
    this.budgetAlerts.set(id, updatedAlert);
    return updatedAlert;
  }

  async deleteBudgetAlert(id: number): Promise<void> {
    this.budgetAlerts.delete(id);
  }

  async getAllSpendingTrends(): Promise<SpendingTrend[]> {
    return Array.from(this.spendingTrends.values()).sort((a, b) => 
      new Date(b.calculatedAt).getTime() - new Date(a.calculatedAt).getTime()
    );
  }

  async getSpendingTrendsByCategory(categoryId: number): Promise<SpendingTrend[]> {
    return Array.from(this.spendingTrends.values()).filter(trend => trend.categoryId === categoryId);
  }

  async createSpendingTrend(trend: InsertSpendingTrend): Promise<SpendingTrend> {
    const newTrend: SpendingTrend = {
      id: this.currentId++,
      ...trend,
      createdAt: new Date()
    };
    this.spendingTrends.set(newTrend.id, newTrend);
    return newTrend;
  }

  async updateSpendingTrend(id: number, updates: Partial<SpendingTrend>): Promise<SpendingTrend> {
    const trend = this.spendingTrends.get(id);
    if (!trend) throw new Error("Spending trend not found");
    
    const updatedTrend = { ...trend, ...updates };
    this.spendingTrends.set(id, updatedTrend);
    return updatedTrend;
  }

  async deleteSpendingTrend(id: number): Promise<void> {
    this.spendingTrends.delete(id);
  }

  // Portfolio Management Implementation
  async getAllPortfolios(): Promise<Portfolio[]> {
    return Array.from(this.portfolios.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getPortfolio(id: number): Promise<Portfolio | undefined> {
    return this.portfolios.get(id);
  }

  async createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio> {
    const newPortfolio: Portfolio = {
      id: this.currentId++,
      ...portfolio,
      createdAt: new Date(),
      lastUpdated: new Date()
    };
    this.portfolios.set(newPortfolio.id, newPortfolio);
    return newPortfolio;
  }

  async updatePortfolio(id: number, updates: Partial<Portfolio>): Promise<Portfolio> {
    const portfolio = this.portfolios.get(id);
    if (!portfolio) throw new Error("Portfolio not found");
    
    const updatedPortfolio = { ...portfolio, ...updates, lastUpdated: new Date() };
    this.portfolios.set(id, updatedPortfolio);
    return updatedPortfolio;
  }

  async deletePortfolio(id: number): Promise<void> {
    this.portfolios.delete(id);
  }

  async getAllPortfolioHoldings(): Promise<PortfolioHolding[]> {
    return Array.from(this.portfolioHoldings.values());
  }

  async getPortfolioHoldingsByPortfolio(portfolioId: number): Promise<PortfolioHolding[]> {
    return Array.from(this.portfolioHoldings.values()).filter(holding => holding.portfolioId === portfolioId);
  }

  async createPortfolioHolding(holding: InsertPortfolioHolding): Promise<PortfolioHolding> {
    const newHolding: PortfolioHolding = {
      id: this.currentId++,
      ...holding,
      createdAt: new Date()
    };
    this.portfolioHoldings.set(newHolding.id, newHolding);
    return newHolding;
  }

  async updatePortfolioHolding(id: number, updates: Partial<PortfolioHolding>): Promise<PortfolioHolding> {
    const holding = this.portfolioHoldings.get(id);
    if (!holding) throw new Error("Portfolio holding not found");
    
    const updatedHolding = { ...holding, ...updates };
    this.portfolioHoldings.set(id, updatedHolding);
    return updatedHolding;
  }

  async deletePortfolioHolding(id: number): Promise<void> {
    this.portfolioHoldings.delete(id);
  }

  async getAllPriceHistory(): Promise<PriceHistory[]> {
    return Array.from(this.priceHistory.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getPriceHistoryBySymbol(symbol: string): Promise<PriceHistory[]> {
    return Array.from(this.priceHistory.values()).filter(history => history.symbol === symbol);
  }

  async createPriceHistory(history: InsertPriceHistory): Promise<PriceHistory> {
    const newHistory: PriceHistory = {
      id: this.currentId++,
      ...history,
      createdAt: new Date()
    };
    this.priceHistory.set(newHistory.id, newHistory);
    return newHistory;
  }

  async updatePriceHistory(id: number, updates: Partial<PriceHistory>): Promise<PriceHistory> {
    const history = this.priceHistory.get(id);
    if (!history) throw new Error("Price history not found");
    
    const updatedHistory = { ...history, ...updates };
    this.priceHistory.set(id, updatedHistory);
    return updatedHistory;
  }

  async deletePriceHistory(id: number): Promise<void> {
    this.priceHistory.delete(id);
  }

  async getAllInvestmentTransactions(): Promise<InvestmentTransaction[]> {
    return Array.from(this.investmentTransactions.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getInvestmentTransactionsByInvestment(investmentId: number): Promise<InvestmentTransaction[]> {
    return Array.from(this.investmentTransactions.values()).filter(tx => tx.investmentId === investmentId);
  }

  async createInvestmentTransaction(transaction: InsertInvestmentTransaction): Promise<InvestmentTransaction> {
    const newTransaction: InvestmentTransaction = {
      id: this.currentId++,
      ...transaction,
      createdAt: new Date()
    };
    this.investmentTransactions.set(newTransaction.id, newTransaction);
    return newTransaction;
  }

  async updateInvestmentTransaction(id: number, updates: Partial<InvestmentTransaction>): Promise<InvestmentTransaction> {
    const transaction = this.investmentTransactions.get(id);
    if (!transaction) throw new Error("Investment transaction not found");
    
    const updatedTransaction = { ...transaction, ...updates };
    this.investmentTransactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async deleteInvestmentTransaction(id: number): Promise<void> {
    this.investmentTransactions.delete(id);
  }

  // Advanced Analytics Implementation
  async calculateBudgetVsActual(budgetPeriodId: number): Promise<any> {
    const period = this.budgetPeriods.get(budgetPeriodId);
    if (!period) return null;
    
    const expenses = Array.from(this.expenses.values()).filter(expense => 
      expense.date >= period.startDate && expense.date <= period.endDate
    );
    
    const budgets = Array.from(this.budgets.values()).filter(budget => 
      budget.month >= period.startDate.substring(0, 7) && budget.month <= period.endDate.substring(0, 7)
    );
    
    return {
      period: period.name,
      totalBudget: parseFloat(period.totalBudget),
      totalSpent: expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0),
      categoryBreakdown: budgets.map(budget => {
        const categoryExpenses = expenses.filter(expense => expense.categoryId.toString() === budget.category);
        const spent = categoryExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        return {
          category: budget.category,
          budget: parseFloat(budget.monthlyLimit),
          spent,
          variance: spent - parseFloat(budget.monthlyLimit),
          percentageUsed: (spent / parseFloat(budget.monthlyLimit)) * 100
        };
      })
    };
  }

  async generateSpendingAlerts(): Promise<BudgetAlert[]> {
    const alerts: BudgetAlert[] = [];
    const budgets = Array.from(this.budgets.values());
    const currentMonth = new Date().toISOString().substring(0, 7);
    
    for (const budget of budgets) {
      if (budget.month === currentMonth) {
        const expenses = Array.from(this.expenses.values()).filter(expense => 
          expense.date.startsWith(currentMonth) && expense.categoryId.toString() === budget.category
        );
        
        const totalSpent = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        const budgetLimit = parseFloat(budget.monthlyLimit);
        const percentageUsed = (totalSpent / budgetLimit) * 100;
        
        if (percentageUsed > 80) {
          const alert: BudgetAlert = {
            id: this.currentId++,
            budgetId: budget.id,
            type: percentageUsed > 100 ? "overspend" : "approaching_limit",
            threshold: percentageUsed.toFixed(1),
            isActive: true,
            lastTriggered: new Date(),
            createdAt: new Date()
          };
          alerts.push(alert);
          this.budgetAlerts.set(alert.id, alert);
        }
      }
    }
    
    return alerts;
  }

  async calculateDebtPayoffTimelines(): Promise<any> {
    const debts = Array.from(this.debts.values()).filter(debt => debt.isActive);
    
    return debts.map(debt => {
      const balance = parseFloat(debt.currentBalance);
      const rate = parseFloat(debt.interestRate) / 100 / 12;
      const payment = parseFloat(debt.minimumPayment);
      
      let months = 0;
      if (payment > balance * rate) {
        months = Math.ceil(-Math.log(1 - (balance * rate) / payment) / Math.log(1 + rate));
      }
      
      const totalInterest = (payment * months) - balance;
      
      return {
        debtId: debt.id,
        debtName: debt.name,
        currentBalance: balance,
        monthsToPayoff: months,
        totalInterest,
        totalPayments: payment * months,
        payoffDate: months > 0 ? new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10) : null
      };
    });
  }

  async calculatePortfolioPerformance(portfolioId: number): Promise<any> {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) return null;
    
    const holdings = Array.from(this.portfolioHoldings.values()).filter(h => h.portfolioId === portfolioId);
    const investments = Array.from(this.investments.values());
    
    const portfolioData = holdings.map(holding => {
      const investment = investments.find(i => i.id === holding.investmentId);
      if (!investment) return null;
      
      const quantity = parseFloat(investment.quantity);
      const purchasePrice = parseFloat(investment.purchasePrice);
      const currentPrice = parseFloat(investment.currentPrice);
      const marketValue = parseFloat(investment.marketValue);
      const costBasis = quantity * purchasePrice;
      const gainLoss = marketValue - costBasis;
      
      return {
        symbol: investment.symbol,
        quantity,
        purchasePrice,
        currentPrice,
        marketValue,
        costBasis,
        gainLoss,
        gainLossPercentage: costBasis > 0 ? (gainLoss / costBasis) * 100 : 0,
        allocationPercentage: parseFloat(holding.allocationPercentage)
      };
    }).filter(item => item !== null);
    
    const totalValue = portfolioData.reduce((sum, item) => sum + item.marketValue, 0);
    const totalCost = portfolioData.reduce((sum, item) => sum + item.costBasis, 0);
    const totalGainLoss = totalValue - totalCost;
    
    return {
      portfolioId,
      portfolioName: portfolio.name,
      totalValue,
      totalCost,
      totalGainLoss,
      totalGainLossPercentage: totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0,
      holdings: portfolioData
    };
  }

  async calculateNetWorthOverTime(startDate: string, endDate: string): Promise<any> {
    const snapshots = Array.from(this.netWorthSnapshots.values()).filter(snapshot => 
      snapshot.date >= startDate && snapshot.date <= endDate
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return snapshots.map(snapshot => ({
      date: snapshot.date,
      netWorth: parseFloat(snapshot.netWorth),
      totalAssets: parseFloat(snapshot.totalAssets),
      totalLiabilities: parseFloat(snapshot.totalLiabilities),
      change: snapshots.length > 1 ? 
        parseFloat(snapshot.netWorth) - parseFloat(snapshots[snapshots.indexOf(snapshot) - 1]?.netWorth || "0") : 0
    }));
  }

  // Jira Sync Mappings
  async getJiraSyncMappings(): Promise<any[]> {
    return Array.from(this.jiraSyncMappings.values());
  }

  async saveJiraSyncMapping(mapping: any): Promise<void> {
    this.jiraSyncMappings.set(mapping.belleJournalId, mapping);
  }

  async deleteJiraSyncMapping(belleJournalId: string): Promise<void> {
    this.jiraSyncMappings.delete(belleJournalId);
  }
}

// Database Storage for Blog System using direct SQL queries
class BlogDatabaseStorage {
  // Blog Posts
  async getAllBlogPosts(): Promise<BlogPost[]> {
    const result = await pool.query(`
      SELECT * FROM blog_posts 
      ORDER BY updated_at DESC
    `);
    return result.rows.map(row => ({
      ...row,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      scheduledDate: row.scheduled_date,
      publishedDate: row.published_date,
      reviewDate: row.review_date,
      wordCount: row.word_count,
      readingTime: row.reading_time,
      seoTitle: row.seo_title,
      seoDescription: row.seo_description,
      featuredImage: row.featured_image,
      isAiGenerated: row.is_ai_generated
    }));
  }

  async getBlogPostsByStatus(status: string): Promise<BlogPost[]> {
    const result = await pool.query(`
      SELECT * FROM blog_posts 
      WHERE status = $1
      ORDER BY updated_at DESC
    `, [status]);
    return result.rows.map(row => ({
      ...row,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      scheduledDate: row.scheduled_date,
      publishedDate: row.published_date,
      reviewDate: row.review_date,
      wordCount: row.word_count,
      readingTime: row.reading_time,
      seoTitle: row.seo_title,
      seoDescription: row.seo_description,
      featuredImage: row.featured_image,
      isAiGenerated: row.is_ai_generated
    }));
  }

  async getBlogPostsByPlatform(platform: string): Promise<BlogPost[]> {
    const result = await pool.query(`
      SELECT * FROM blog_posts 
      WHERE platform = $1
      ORDER BY updated_at DESC
    `, [platform]);
    return result.rows.map(row => ({
      ...row,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      scheduledDate: row.scheduled_date,
      publishedDate: row.published_date,
      reviewDate: row.review_date,
      wordCount: row.word_count,
      readingTime: row.reading_time,
      seoTitle: row.seo_title,
      seoDescription: row.seo_description,
      featuredImage: row.featured_image,
      isAiGenerated: row.is_ai_generated
    }));
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    const result = await pool.query(`
      SELECT * FROM blog_posts 
      WHERE id = $1
    `, [id]);
    if (result.rows.length === 0) return undefined;
    
    const row = result.rows[0];
    return {
      ...row,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      scheduledDate: row.scheduled_date,
      publishedDate: row.published_date,
      reviewDate: row.review_date,
      wordCount: row.word_count,
      readingTime: row.reading_time,
      seoTitle: row.seo_title,
      seoDescription: row.seo_description,
      featuredImage: row.featured_image,
      isAiGenerated: row.is_ai_generated
    };
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const result = await pool.query(`
      INSERT INTO blog_posts (
        title, content, excerpt, status, type, platform, tags, 
        scheduled_date, published_date, review_date, priority, 
        word_count, reading_time, seo_title, seo_description, 
        featured_image, is_ai_generated
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
      ) RETURNING *
    `, [
      post.title, post.content, post.excerpt, post.status, post.type, post.platform, 
      post.tags, post.scheduledDate, post.publishedDate, post.reviewDate, post.priority,
      post.wordCount, post.readingTime, post.seoTitle, post.seoDescription, 
      post.featuredImage, post.isAiGenerated
    ]);
    
    const row = result.rows[0];
    return {
      ...row,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      scheduledDate: row.scheduled_date,
      publishedDate: row.published_date,
      reviewDate: row.review_date,
      wordCount: row.word_count,
      readingTime: row.reading_time,
      seoTitle: row.seo_title,
      seoDescription: row.seo_description,
      featuredImage: row.featured_image,
      isAiGenerated: row.is_ai_generated
    };
  }

  async updateBlogPost(id: number, updates: Partial<BlogPost>): Promise<BlogPost> {
    const result = await pool.query(`
      UPDATE blog_posts 
      SET title = COALESCE($2, title),
          content = COALESCE($3, content),
          excerpt = COALESCE($4, excerpt),
          status = COALESCE($5, status),
          type = COALESCE($6, type),
          platform = COALESCE($7, platform),
          tags = COALESCE($8, tags),
          scheduled_date = COALESCE($9, scheduled_date),
          published_date = COALESCE($10, published_date),
          review_date = COALESCE($11, review_date),
          priority = COALESCE($12, priority),
          word_count = COALESCE($13, word_count),
          reading_time = COALESCE($14, reading_time),
          seo_title = COALESCE($15, seo_title),
          seo_description = COALESCE($16, seo_description),
          featured_image = COALESCE($17, featured_image),
          is_ai_generated = COALESCE($18, is_ai_generated),
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [
      id, updates.title, updates.content, updates.excerpt, updates.status, 
      updates.type, updates.platform, updates.tags, updates.scheduledDate, 
      updates.publishedDate, updates.reviewDate, updates.priority, 
      updates.wordCount, updates.readingTime, updates.seoTitle, 
      updates.seoDescription, updates.featuredImage, updates.isAiGenerated
    ]);
    
    const row = result.rows[0];
    return {
      ...row,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      scheduledDate: row.scheduled_date,
      publishedDate: row.published_date,
      reviewDate: row.review_date,
      wordCount: row.word_count,
      readingTime: row.reading_time,
      seoTitle: row.seo_title,
      seoDescription: row.seo_description,
      featuredImage: row.featured_image,
      isAiGenerated: row.is_ai_generated
    };
  }

  async deleteBlogPost(id: number): Promise<void> {
    await pool.query(`DELETE FROM blog_posts WHERE id = $1`, [id]);
  }

  // Blog Ideas
  async getAllBlogIdeas(): Promise<BlogIdea[]> {
    const result = await pool.query(`
      SELECT * FROM blog_ideas 
      ORDER BY updated_at DESC
    `);
    return result.rows.map(row => ({
      ...row,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      aiPrompt: row.ai_prompt,
      aiGeneratedContent: row.ai_generated_content,
      estimatedReadTime: row.estimated_read_time,
      targetAudience: row.target_audience
    }));
  }

  async getBlogIdeasByStatus(status: string): Promise<BlogIdea[]> {
    const result = await pool.query(`
      SELECT * FROM blog_ideas 
      WHERE status = $1
      ORDER BY updated_at DESC
    `, [status]);
    return result.rows.map(row => ({
      ...row,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      aiPrompt: row.ai_prompt,
      aiGeneratedContent: row.ai_generated_content,
      estimatedReadTime: row.estimated_read_time,
      targetAudience: row.target_audience
    }));
  }

  async getBlogIdeasByPlatform(platform: string): Promise<BlogIdea[]> {
    const result = await pool.query(`
      SELECT * FROM blog_ideas 
      WHERE platform = $1
      ORDER BY updated_at DESC
    `, [platform]);
    return result.rows.map(row => ({
      ...row,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      aiPrompt: row.ai_prompt,
      aiGeneratedContent: row.ai_generated_content,
      estimatedReadTime: row.estimated_read_time,
      targetAudience: row.target_audience
    }));
  }

  async createBlogIdea(idea: InsertBlogIdea): Promise<BlogIdea> {
    const result = await pool.query(`
      INSERT INTO blog_ideas (
        title, description, category, platform, tags, priority, 
        ai_prompt, ai_generated_content, status, estimated_read_time, target_audience
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      ) RETURNING *
    `, [
      idea.title, idea.description, idea.category, idea.platform, 
      idea.tags, idea.priority, idea.aiPrompt, idea.aiGeneratedContent, 
      idea.status, idea.estimatedReadTime, idea.targetAudience
    ]);
    
    const row = result.rows[0];
    return {
      ...row,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      aiPrompt: row.ai_prompt,
      aiGeneratedContent: row.ai_generated_content,
      estimatedReadTime: row.estimated_read_time,
      targetAudience: row.target_audience
    };
  }

  async updateBlogIdea(id: number, updates: Partial<BlogIdea>): Promise<BlogIdea> {
    const result = await pool.query(`
      UPDATE blog_ideas 
      SET title = COALESCE($2, title),
          description = COALESCE($3, description),
          category = COALESCE($4, category),
          platform = COALESCE($5, platform),
          tags = COALESCE($6, tags),
          priority = COALESCE($7, priority),
          ai_prompt = COALESCE($8, ai_prompt),
          ai_generated_content = COALESCE($9, ai_generated_content),
          status = COALESCE($10, status),
          estimated_read_time = COALESCE($11, estimated_read_time),
          target_audience = COALESCE($12, target_audience),
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [
      id, updates.title, updates.description, updates.category, 
      updates.platform, updates.tags, updates.priority, 
      updates.aiPrompt, updates.aiGeneratedContent, updates.status, 
      updates.estimatedReadTime, updates.targetAudience
    ]);
    
    const row = result.rows[0];
    return {
      ...row,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      aiPrompt: row.ai_prompt,
      aiGeneratedContent: row.ai_generated_content,
      estimatedReadTime: row.estimated_read_time,
      targetAudience: row.target_audience
    };
  }

  async deleteBlogIdea(id: number): Promise<void> {
    await pool.query(`DELETE FROM blog_ideas WHERE id = $1`, [id]);
  }

  async generateAIContent(ideaId: number): Promise<BlogIdea> {
    const result = await pool.query(`
      UPDATE blog_ideas 
      SET ai_generated_content = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [ideaId, "AI-generated content placeholder - will be implemented with OpenAI integration"]);
    
    const row = result.rows[0];
    return {
      ...row,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      aiPrompt: row.ai_prompt,
      aiGeneratedContent: row.ai_generated_content,
      estimatedReadTime: row.estimated_read_time,
      targetAudience: row.target_audience
    };
  }

  // Blog Calendar
  async getAllBlogCalendarEvents(): Promise<BlogCalendar[]> {
    const result = await pool.query(`
      SELECT * FROM blog_calendar 
      ORDER BY date ASC
    `);
    return result.rows.map(row => ({
      ...row,
      postId: row.post_id,
      ideaId: row.idea_id,
      createdAt: row.created_at
    }));
  }

  async getBlogCalendarEventsByDate(date: string): Promise<BlogCalendar[]> {
    const result = await pool.query(`
      SELECT * FROM blog_calendar 
      WHERE date = $1
      ORDER BY time ASC
    `, [date]);
    return result.rows.map(row => ({
      ...row,
      postId: row.post_id,
      ideaId: row.idea_id,
      createdAt: row.created_at
    }));
  }

  async getBlogCalendarEventsByDateRange(startDate: string, endDate: string): Promise<BlogCalendar[]> {
    const result = await pool.query(`
      SELECT * FROM blog_calendar 
      WHERE date >= $1 AND date <= $2
      ORDER BY date ASC, time ASC
    `, [startDate, endDate]);
    return result.rows.map(row => ({
      ...row,
      postId: row.post_id,
      ideaId: row.idea_id,
      createdAt: row.created_at
    }));
  }

  async createBlogCalendarEvent(event: InsertBlogCalendar): Promise<BlogCalendar> {
    const result = await pool.query(`
      INSERT INTO blog_calendar (
        post_id, idea_id, title, type, platform, date, time, status, notes
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9
      ) RETURNING *
    `, [
      event.postId, event.ideaId, event.title, event.type, 
      event.platform, event.date, event.time, event.status, event.notes
    ]);
    
    const row = result.rows[0];
    return {
      ...row,
      postId: row.post_id,
      ideaId: row.idea_id,
      createdAt: row.created_at
    };
  }

  async updateBlogCalendarEvent(id: number, updates: Partial<BlogCalendar>): Promise<BlogCalendar> {
    const result = await pool.query(`
      UPDATE blog_calendar 
      SET post_id = COALESCE($2, post_id),
          idea_id = COALESCE($3, idea_id),
          title = COALESCE($4, title),
          type = COALESCE($5, type),
          platform = COALESCE($6, platform),
          date = COALESCE($7, date),
          time = COALESCE($8, time),
          status = COALESCE($9, status),
          notes = COALESCE($10, notes)
      WHERE id = $1
      RETURNING *
    `, [
      id, updates.postId, updates.ideaId, updates.title, 
      updates.type, updates.platform, updates.date, 
      updates.time, updates.status, updates.notes
    ]);
    
    const row = result.rows[0];
    return {
      ...row,
      postId: row.post_id,
      ideaId: row.idea_id,
      createdAt: row.created_at
    };
  }

  async deleteBlogCalendarEvent(id: number): Promise<void> {
    await pool.query(`DELETE FROM blog_calendar WHERE id = $1`, [id]);
  }
}

// Combined Storage that uses database for blog and in-memory for other features
class CombinedStorage extends MemStorage {
  private blogStorage: BlogDatabaseStorage;
  
  constructor() {
    super();
    this.blogStorage = new BlogDatabaseStorage();
    this.initializeBlogData();
  }

  private async initializeBlogData() {
    // Initialize with sample blog posts
    await this.createBlogPost({
      title: "10 Productivity Tips for Remote Workers",
      content: "Working from home can be challenging, but with the right strategies...",
      excerpt: "Discover proven techniques to boost your productivity while working remotely.",
      status: "published",
      type: "blog",
      platform: "personal_blog",
      tags: JSON.stringify(["productivity", "remote work", "tips"]),
      publishedDate: "2024-01-15",
      priority: "high",
      wordCount: 1200,
      readingTime: 6,
      seoTitle: "10 Productivity Tips for Remote Workers - Boost Your Efficiency",
      seoDescription: "Learn how to maximize your productivity while working from home with these proven strategies and tips.",
      isAiGenerated: false
    });

    await this.createBlogPost({
      title: "The Future of AI in Content Creation",
      content: "Artificial Intelligence is revolutionizing how we create content...",
      excerpt: "Explore how AI is transforming the content creation landscape.",
      status: "draft",
      type: "blog",
      platform: "medium",
      tags: JSON.stringify(["ai", "content creation", "technology"]),
      scheduledDate: "2024-01-25",
      priority: "medium",
      wordCount: 800,
      readingTime: 4,
      isAiGenerated: true
    });

    // Initialize with sample blog ideas
    await this.createBlogIdea({
      title: "Building Sustainable Habits",
      description: "A deep dive into the psychology of habit formation and practical strategies for building lasting habits.",
      category: "lifestyle",
      platform: "substack",
      tags: JSON.stringify(["habits", "psychology", "self-improvement"]),
      priority: "high",
      status: "idea",
      estimatedReadTime: 8,
      targetAudience: "professionals seeking personal development",
      aiPrompt: "Write about the science of habit formation and include practical examples"
    });

    await this.createBlogIdea({
      title: "The Rise of No-Code Development",
      description: "How no-code platforms are democratizing software development and what it means for the future.",
      category: "technology",
      platform: "linkedin",
      tags: JSON.stringify(["no-code", "development", "technology"]),
      priority: "medium",
      status: "in_progress",
      estimatedReadTime: 6,
      targetAudience: "developers and business professionals"
    });

    // Initialize with sample calendar events
    await this.createBlogCalendarEvent({
      title: "Review and Edit AI Content Post",
      type: "review",
      platform: "medium",
      date: "2024-01-22",
      time: "14:00",
      status: "scheduled",
      notes: "Final review before publishing AI content creation article"
    });

    await this.createBlogCalendarEvent({
      title: "Publish Remote Work Tips",
      type: "post",
      platform: "personal_blog",
      date: "2024-01-20",
      time: "09:00",
      status: "scheduled",
      notes: "Share on social media after publishing"
    });
  }

  // Override blog methods to use database
  async getAllBlogPosts(): Promise<BlogPost[]> {
    return this.blogStorage.getAllBlogPosts();
  }

  async getBlogPostsByStatus(status: string): Promise<BlogPost[]> {
    return this.blogStorage.getBlogPostsByStatus(status);
  }

  async getBlogPostsByPlatform(platform: string): Promise<BlogPost[]> {
    return this.blogStorage.getBlogPostsByPlatform(platform);
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    return this.blogStorage.getBlogPost(id);
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    return this.blogStorage.createBlogPost(post);
  }

  async updateBlogPost(id: number, updates: Partial<BlogPost>): Promise<BlogPost> {
    return this.blogStorage.updateBlogPost(id, updates);
  }

  async deleteBlogPost(id: number): Promise<void> {
    return this.blogStorage.deleteBlogPost(id);
  }

  async getAllBlogIdeas(): Promise<BlogIdea[]> {
    return this.blogStorage.getAllBlogIdeas();
  }

  async getBlogIdeasByStatus(status: string): Promise<BlogIdea[]> {
    return this.blogStorage.getBlogIdeasByStatus(status);
  }

  async getBlogIdeasByPlatform(platform: string): Promise<BlogIdea[]> {
    return this.blogStorage.getBlogIdeasByPlatform(platform);
  }

  async createBlogIdea(idea: InsertBlogIdea): Promise<BlogIdea> {
    return this.blogStorage.createBlogIdea(idea);
  }

  async updateBlogIdea(id: number, updates: Partial<BlogIdea>): Promise<BlogIdea> {
    return this.blogStorage.updateBlogIdea(id, updates);
  }

  async deleteBlogIdea(id: number): Promise<void> {
    return this.blogStorage.deleteBlogIdea(id);
  }

  async generateAIContent(ideaId: number): Promise<BlogIdea> {
    return this.blogStorage.generateAIContent(ideaId);
  }

  async getAllBlogCalendarEvents(): Promise<BlogCalendar[]> {
    return this.blogStorage.getAllBlogCalendarEvents();
  }

  async getBlogCalendarEventsByDate(date: string): Promise<BlogCalendar[]> {
    return this.blogStorage.getBlogCalendarEventsByDate(date);
  }

  async getBlogCalendarEventsByDateRange(startDate: string, endDate: string): Promise<BlogCalendar[]> {
    return this.blogStorage.getBlogCalendarEventsByDateRange(startDate, endDate);
  }

  async createBlogCalendarEvent(event: InsertBlogCalendar): Promise<BlogCalendar> {
    return this.blogStorage.createBlogCalendarEvent(event);
  }

  async updateBlogCalendarEvent(id: number, updates: Partial<BlogCalendar>): Promise<BlogCalendar> {
    return this.blogStorage.updateBlogCalendarEvent(id, updates);
  }

  async deleteBlogCalendarEvent(id: number): Promise<void> {
    return this.blogStorage.deleteBlogCalendarEvent(id);
  }

  // Timer Sessions - Local storage fallback (returns null since timers are in Notion)
  async getActiveTimerSession(): Promise<TimerSession | null> {
    return null;
  }

  // Calendar Selections
  async getCalendarSelections(): Promise<SelectCalendarSelection[]> {
    return Array.from(this.calendarSelections.values()).sort((a, b) => 
      new Date(a.selectedDate).getTime() - new Date(b.selectedDate).getTime()
    );
  }

  async createCalendarSelections(selections: InsertCalendarSelection[]): Promise<SelectCalendarSelection[]> {
    const created: SelectCalendarSelection[] = [];
    for (const selection of selections) {
      const newSelection: SelectCalendarSelection = {
        id: this.currentId++,
        status: selection.status || 'selected',
        selectedDate: selection.selectedDate,
        notionPageId: selection.notionPageId || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.calendarSelections.set(newSelection.id, newSelection);
      created.push(newSelection);
    }
    return created;
  }

  async deleteCalendarSelection(id: number): Promise<boolean> {
    return this.calendarSelections.delete(id);
  }

  // Additional calendar selection helper methods
  async getCalendarSelectionsByDate(date: string): Promise<SelectCalendarSelection[]> {
    const targetDate = new Date(date).toISOString().split('T')[0];
    return Array.from(this.calendarSelections.values()).filter(selection => 
      selection.selectedDate.toISOString().split('T')[0] === targetDate
    );
  }

  async updateCalendarSelection(id: number, updates: Partial<SelectCalendarSelection>): Promise<SelectCalendarSelection | null> {
    const existing = this.calendarSelections.get(id);
    if (!existing) return null;
    
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.calendarSelections.set(id, updated);
    return updated;
  }
}

// DatabaseStorage class for PostgreSQL-based persistence
export class DatabaseStorage implements IStorage {
  private memStorage = new MemStorage(); // Fallback for non-timer operations
  
  // Timer Sessions - PostgreSQL implementation
  async getActiveTimerSession(): Promise<TimerSession | null> {
    try {
      const [activeSession] = await db
        .select()
        .from(timerSessions)
        .where(and(eq(timerSessions.isActive, true), eq(timerSessions.userId, "admin")))
        .orderBy(desc(timerSessions.createdAt))
        .limit(1);
      
      return activeSession || null;
    } catch (error) {
      console.error("Database error, falling back to Notion:", error);
      return null; // Falls back to Notion API in timer routes
    }
  }

  async getAllTimerSessions(): Promise<TimerSession[]> {
    try {
      return await db.select().from(timerSessions).orderBy(desc(timerSessions.createdAt));
    } catch (error) {
      console.error("Database error:", error);
      return [];
    }
  }

  async createTimerSession(session: InsertTimerSession): Promise<TimerSession> {
    try {
      const [newSession] = await db.insert(timerSessions).values(session).returning();
      return newSession;
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  }

  async updateTimerSession(id: number, updates: Partial<TimerSession>): Promise<TimerSession> {
    try {
      const [updatedSession] = await db
        .update(timerSessions)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(timerSessions.id, id))
        .returning();
      return updatedSession;
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  }

  async deleteTimerSession(id: number): Promise<void> {
    try {
      await db.delete(timerSessions).where(eq(timerSessions.id, id));
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  }

  async pauseTimerSession(id: number): Promise<TimerSession> {
    return this.updateTimerSession(id, { isPaused: true, pausedAt: new Date() });
  }

  async resumeTimerSession(id: number): Promise<TimerSession> {
    return this.updateTimerSession(id, { isPaused: false, pausedAt: null });
  }

  // Stop functionality removed per user request

  async completeTimerSession(id: number, tasksCompleted: string[], habitsCompleted: string[], sessionContext: string): Promise<void> {
    try {
      // Get the session first to extract data for analytics
      const session = await this.getTimerSession(id);
      if (!session) {
        throw new Error("Timer session not found");
      }

      // Mark session as completed and update context
      await this.updateTimerSession(id, { 
        isActive: false, 
        isPaused: false,
        tasks_completed: JSON.stringify(tasksCompleted),
        habits_completed: JSON.stringify(habitsCompleted),
        session_context: sessionContext,
        productivity_insights: this.generateProductivityInsights(session, tasksCompleted, habitsCompleted)
      });

      // Store in Notion for AI analytics (async without blocking)
      this.storeSessionInNotionAnalytics(session, tasksCompleted, habitsCompleted, sessionContext);
      
      console.log("✅ Timer session completed and queued for Notion analytics storage");
    } catch (error) {
      console.error("❌ Error completing timer session:", error);
      throw error;
    }
  }

  private async storeSessionInNotionAnalytics(session: TimerSession, tasksCompleted: string[], habitsCompleted: string[], sessionContext: string) {
    try {
      const { storeCompletedTimerSession } = await import('./notion');
      
      const duration = session.totalDuration - session.remainingTime;
      const sessionData = {
        title: session.title || `${session.mode} Session`,
        mode: session.mode,
        duration: duration,
        tasksCompleted: tasksCompleted,
        habitsCompleted: habitsCompleted,
        sessionContext: sessionContext,
        startedAt: session.startedAt || new Date(),
        completedAt: new Date()
      };

      await storeCompletedTimerSession(sessionData);
    } catch (error) {
      console.log("⚠️ Failed to store timer session in Notion analytics (non-blocking):", error);
    }
  }

  private generateProductivityInsights(session: TimerSession, tasksCompleted: string[], habitsCompleted: string[]): string {
    const insights = [];
    const duration = Math.round((session.totalDuration - session.remainingTime) / 60);
    
    // Duration insights
    if (duration >= 90) {
      insights.push("Deep focus achieved");
    } else if (duration >= 25) {
      insights.push("Good focus session");
    }
    
    // Task completion insights
    if (tasksCompleted.length > 0) {
      insights.push(`Completed ${tasksCompleted.length} task${tasksCompleted.length > 1 ? 's' : ''}`);
    }
    
    // Habit insights
    if (habitsCompleted.length > 0) {
      insights.push(`Built ${habitsCompleted.length} habit${habitsCompleted.length > 1 ? 's' : ''}`);
    }
    
    // Mode-specific insights
    const modeInsights = {
      pomodoro: "Structured productivity approach",
      deepwork: "Extended concentration period",
      flowstate: "Creative flow achieved",
      focus: "Dedicated focus time"
    };
    
    insights.push(modeInsights[session.mode as keyof typeof modeInsights] || "Productive session");
    
    return insights.join("; ");
  }

  // Delegate all other methods to MemStorage
  async getDailyEntry(date: string) { return this.memStorage.getDailyEntry(date); }
  async createOrUpdateDailyEntry(entry: any) { return this.memStorage.createOrUpdateDailyEntry(entry); }
  async getAllBills() { return this.memStorage.getAllBills(); }
  async createBill(bill: any) { return this.memStorage.createBill(bill); }
  async deleteBill(id: number) { return this.memStorage.deleteBill(id); }
  async getBillPaymentsForDate(date: string) { return this.memStorage.getBillPaymentsForDate(date); }
  async createBillPayment(payment: any) { return this.memStorage.createBillPayment(payment); }
  async updateBillPayment(id: number, isPaid: boolean) { return this.memStorage.updateBillPayment(id, isPaid); }
  async getAllGroceryItems() { return this.memStorage.getAllGroceryItems(); }
  async createGroceryItem(item: any) { return this.memStorage.createGroceryItem(item); }
  async updateGroceryItem(id: number, updates: any) { return this.memStorage.updateGroceryItem(id, updates); }
  async deleteGroceryItem(id: number) { return this.memStorage.deleteGroceryItem(id); }
  async getAllGroceryLists() { return this.memStorage.getAllGroceryLists(); }
  async createGroceryList(list: any) { return this.memStorage.createGroceryList(list); }
  async deleteGroceryList(id: number) { return this.memStorage.deleteGroceryList(id); }
  async getAllGoals() { return this.memStorage.getAllGoals(); }
  async createGoal(goal: any) { return this.memStorage.createGoal(goal); }
  async updateGoal(id: number, updates: any) { return this.memStorage.updateGoal(id, updates); }
  async deleteGoal(id: number) { return this.memStorage.deleteGoal(id); }
  async getAllHabits() { return this.memStorage.getAllHabits(); }
  async createHabit(habit: any) { return this.memStorage.createHabit(habit); }
  async updateHabit(id: number, updates: any) { return this.memStorage.updateHabit(id, updates); }
  async deleteHabit(id: number) { return this.memStorage.deleteHabit(id); }
  async getHabitLogs(habitId: number, startDate?: string, endDate?: string) { return this.memStorage.getHabitLogs(habitId, startDate, endDate); }
  async createHabitLog(log: any) { return this.memStorage.createHabitLog(log); }
  async updateHabitLog(id: number, updates: any) { return this.memStorage.updateHabitLog(id, updates); }
  async getAllMedications() { return this.memStorage.getAllMedications(); }
  async createMedication(medication: any) { return this.memStorage.createMedication(medication); }
  async updateMedication(id: number, updates: any) { return this.memStorage.updateMedication(id, updates); }
  async deleteMedication(id: number) { return this.memStorage.deleteMedication(id); }
  async getAllTodos() { return this.memStorage.getAllTodos(); }
  async getTodosByDate(date: string) { return this.memStorage.getTodosByDate(date); }
  async createTodo(todo: any) { return this.memStorage.createTodo(todo); }
  async updateTodo(id: number, updates: any) { return this.memStorage.updateTodo(id, updates); }
  async deleteTodo(id: number) { return this.memStorage.deleteTodo(id); }
  async getAllTimeBlocks() { return this.memStorage.getAllTimeBlocks(); }
  async getTimeBlocksByDate(date: string) { return this.memStorage.getTimeBlocksByDate(date); }
  async createTimeBlock(timeBlock: any) { return this.memStorage.createTimeBlock(timeBlock); }
  async updateTimeBlock(id: number, updates: any) { return this.memStorage.updateTimeBlock(id, updates); }
  async deleteTimeBlock(id: number) { return this.memStorage.deleteTimeBlock(id); }
  async getAllFocusSessions() { return this.memStorage.getAllFocusSessions(); }
  async getFocusSessionsByDate(date: string) { return this.memStorage.getFocusSessionsByDate(date); }
  async createFocusSession(session: any) { return this.memStorage.createFocusSession(session); }
  async updateFocusSession(id: number, updates: any) { return this.memStorage.updateFocusSession(id, updates); }
  async deleteFocusSession(id: number) { return this.memStorage.deleteFocusSession(id); }
  async getAllBudgets() { return this.memStorage.getAllBudgets(); }
  async getBudgetsByMonth(month: string) { return this.memStorage.getBudgetsByMonth(month); }
  async createBudget(budget: any) { return this.memStorage.createBudget(budget); }
  async updateBudget(id: number, updates: any) { return this.memStorage.updateBudget(id, updates); }
  async deleteBudget(id: number) { return this.memStorage.deleteBudget(id); }
  async getAllIncomeEntries() { return this.memStorage.getAllIncomeEntries(); }
  async getIncomeEntriesByDateRange(startDate: string, endDate: string) { return this.memStorage.getIncomeEntriesByDateRange(startDate, endDate); }
  async createIncomeEntry(entry: any) { return this.memStorage.createIncomeEntry(entry); }
  async deleteIncomeEntry(id: number) { return this.memStorage.deleteIncomeEntry(id); }
  async getAllChallenges() { return this.memStorage.getAllChallenges(); }
  async getActiveChallenges() { return this.memStorage.getActiveChallenges(); }
  async createChallenge(challenge: any) { return this.memStorage.createChallenge(challenge); }
  async updateChallenge(id: number, updates: any) { return this.memStorage.updateChallenge(id, updates); }
  async deleteChallenge(id: number) { return this.memStorage.deleteChallenge(id); }
  async getAllContentCategories() { return this.memStorage.getAllContentCategories(); }
  async createContentCategory(category: any) { return this.memStorage.createContentCategory(category); }
  async getAllContentTypes() { return this.memStorage.getAllContentTypes(); }
  async createContentType(type: any) { return this.memStorage.createContentType(type); }
  async getAllContentPieces() { return this.memStorage.getAllContentPieces(); }
  async createContentPiece(piece: any) { return this.memStorage.createContentPiece(piece); }
  async updateContentPiece(id: number, updates: any) { return this.memStorage.updateContentPiece(id, updates); }
  async getAllContentProgress() { return this.memStorage.getAllContentProgress(); }
  async createContentProgress(progress: any) { return this.memStorage.createContentProgress(progress); }
  async getAllAppProjects() { return this.memStorage.getAllAppProjects(); }
  async getAppProject(id: number) { return this.memStorage.getAppProject(id); }
  async createAppProject(project: any) { return this.memStorage.createAppProject(project); }
  async updateAppProject(id: number, updates: any) { return this.memStorage.updateAppProject(id, updates); }
  async deleteAppProject(id: number) { return this.memStorage.deleteAppProject(id); }
  async getAppTasksByProject(projectId: number) { return this.memStorage.getAppTasksByProject(projectId); }
  async getAllAppTasks() { return this.memStorage.getAllAppTasks(); }
  async createAppTask(task: any) { return this.memStorage.createAppTask(task); }
  async updateAppTask(id: number, updates: any) { return this.memStorage.updateAppTask(id, updates); }
  async deleteAppTask(id: number) { return this.memStorage.deleteAppTask(id); }
  async getAppSprintsByProject(projectId: number) { return this.memStorage.getAppSprintsByProject(projectId); }
  async createAppSprint(sprint: any) { return this.memStorage.createAppSprint(sprint); }
  async updateAppSprint(id: number, updates: any) { return this.memStorage.updateAppSprint(id, updates); }
  async deleteAppSprint(id: number) { return this.memStorage.deleteAppSprint(id); }
  async getAppTimeEntriesByProject(projectId: number, startDate?: string, endDate?: string) { return this.memStorage.getAppTimeEntriesByProject(projectId, startDate, endDate); }
  async createAppTimeEntry(entry: any) { return this.memStorage.createAppTimeEntry(entry); }
  async updateAppTimeEntry(id: number, updates: any) { return this.memStorage.updateAppTimeEntry(id, updates); }
  async deleteAppTimeEntry(id: number) { return this.memStorage.deleteAppTimeEntry(id); }
  async getAllMiniGameBlocks() { return this.memStorage.getAllMiniGameBlocks(); }
  async createMiniGameBlock(block: any) { return this.memStorage.createMiniGameBlock(block); }
  async updateMiniGameBlock(id: number, updates: any) { return this.memStorage.updateMiniGameBlock(id, updates); }
  async deleteMiniGameBlock(id: number) { return this.memStorage.deleteMiniGameBlock(id); }
  async getAllMiniGameDesigns() { return this.memStorage.getAllMiniGameDesigns(); }
  async getMiniGameDesignsByBlock(blockId: number) { return this.memStorage.getMiniGameDesignsByBlock(blockId); }
  async createMiniGameDesign(design: any) { return this.memStorage.createMiniGameDesign(design); }
  async updateMiniGameDesign(id: number, updates: any) { return this.memStorage.updateMiniGameDesign(id, updates); }
  async deleteMiniGameDesign(id: number) { return this.memStorage.deleteMiniGameDesign(id); }
  async getAllSocialMediaPosts() { return this.memStorage.getAllSocialMediaPosts(); }
  async getSocialMediaPostsByDesign(designId: number) { return this.memStorage.getSocialMediaPostsByDesign(designId); }
  async getSocialMediaPostsByDateRange(startDate: string, endDate: string) { return this.memStorage.getSocialMediaPostsByDateRange(startDate, endDate); }
  async createSocialMediaPost(post: any) { return this.memStorage.createSocialMediaPost(post); }
  async updateSocialMediaPost(id: number, updates: any) { return this.memStorage.updateSocialMediaPost(id, updates); }
  async deleteSocialMediaPost(id: number) { return this.memStorage.deleteSocialMediaPost(id); }
  async getAllSocialMediaAnalytics() { return this.memStorage.getAllSocialMediaAnalytics(); }
  async getSocialMediaAnalyticsByPost(postId: number) { return this.memStorage.getSocialMediaAnalyticsByPost(postId); }
  async getLatestAnalyticsForPost(postId: number) { return this.memStorage.getLatestAnalyticsForPost(postId); }
  async createSocialMediaAnalytics(analytics: any) { return this.memStorage.createSocialMediaAnalytics(analytics); }
  async updateSocialMediaAnalytics(id: number, updates: any) { return this.memStorage.updateSocialMediaAnalytics(id, updates); }
  async getAllPerformanceInsights() { return this.memStorage.getAllPerformanceInsights(); }
  async getPerformanceInsightsByMiniGame(miniGameBlockId: number) { return this.memStorage.getPerformanceInsightsByMiniGame(miniGameBlockId); }
  async getPerformanceInsightsByPlatform(platform: string) { return this.memStorage.getPerformanceInsightsByPlatform(platform); }
  async getPerformanceInsightsByDayOfWeek(dayOfWeek: string) { return this.memStorage.getPerformanceInsightsByDayOfWeek(dayOfWeek); }
  async createPerformanceInsights(insights: any) { return this.memStorage.createPerformanceInsights(insights); }
  async updatePerformanceInsights(id: number, updates: any) { return this.memStorage.updatePerformanceInsights(id, updates); }
  async deletePerformanceInsights(id: number) { return this.memStorage.deletePerformanceInsights(id); }
  async scheduleContentForMoonPhases(year: number, month: number) { return this.memStorage.scheduleContentForMoonPhases(year, month); }
  async aggregatePerformanceData() { return this.memStorage.aggregatePerformanceData(); }
  async getAllBlogPosts() { return this.memStorage.getAllBlogPosts(); }
  async getBlogPostsByStatus(status: string) { return this.memStorage.getBlogPostsByStatus(status); }
  async getBlogPostsByPlatform(platform: string) { return this.memStorage.getBlogPostsByPlatform(platform); }
  async getBlogPost(id: number) { return this.memStorage.getBlogPost(id); }
  async createBlogPost(post: any) { return this.memStorage.createBlogPost(post); }
  async updateBlogPost(id: number, updates: any) { return this.memStorage.updateBlogPost(id, updates); }
  async deleteBlogPost(id: number) { return this.memStorage.deleteBlogPost(id); }
  async getAllBlogIdeas() { return this.memStorage.getAllBlogIdeas(); }
  async getBlogIdeasByStatus(status: string) { return this.memStorage.getBlogIdeasByStatus(status); }
  async getBlogIdeasByPlatform(platform: string) { return this.memStorage.getBlogIdeasByPlatform(platform); }
  async createBlogIdea(idea: any) { return this.memStorage.createBlogIdea(idea); }
  async updateBlogIdea(id: number, updates: any) { return this.memStorage.updateBlogIdea(id, updates); }
  async deleteBlogIdea(id: number) { return this.memStorage.deleteBlogIdea(id); }
  async generateAIContent(ideaId: number) { return this.memStorage.generateAIContent(ideaId); }
  async getAllBlogCalendarEvents() { return this.memStorage.getAllBlogCalendarEvents(); }
  async getBlogCalendarEventsByDate(date: string) { return this.memStorage.getBlogCalendarEventsByDate(date); }
  async getBlogCalendarEventsByDateRange(startDate: string, endDate: string) { return this.memStorage.getBlogCalendarEventsByDateRange(startDate, endDate); }
  async createBlogCalendarEvent(event: any) { return this.memStorage.createBlogCalendarEvent(event); }
  async updateBlogCalendarEvent(id: number, updates: any) { return this.memStorage.updateBlogCalendarEvent(id, updates); }
  async deleteBlogCalendarEvent(id: number) { return this.memStorage.deleteBlogCalendarEvent(id); }
  async getAllBudgetCategories() { return this.memStorage.getAllBudgetCategories(); }
  async createBudgetCategory(category: any) { return this.memStorage.createBudgetCategory(category); }
  async updateBudgetCategory(id: number, updates: any) { return this.memStorage.updateBudgetCategory(id, updates); }
  async deleteBudgetCategory(id: number) { return this.memStorage.deleteBudgetCategory(id); }
  async getAllExpenses() { return this.memStorage.getAllExpenses(); }
  async getExpensesByDateRange(startDate: string, endDate: string) { return this.memStorage.getExpensesByDateRange(startDate, endDate); }
  async getExpensesByCategory(categoryId: number) { return this.memStorage.getExpensesByCategory(categoryId); }
  async createExpense(expense: any) { return this.memStorage.createExpense(expense); }
  async updateExpense(id: number, updates: any) { return this.memStorage.updateExpense(id, updates); }
  async deleteExpense(id: number) { return this.memStorage.deleteExpense(id); }
  async getAllDebts() { return this.memStorage.getAllDebts(); }
  async getActiveDebts() { return this.memStorage.getActiveDebts(); }
  async createDebt(debt: any) { return this.memStorage.createDebt(debt); }
  async updateDebt(id: number, updates: any) { return this.memStorage.updateDebt(id, updates); }
  async deleteDebt(id: number) { return this.memStorage.deleteDebt(id); }
  async getAllDebtPayments() { return this.memStorage.getAllDebtPayments(); }
  async getDebtPaymentsByDebt(debtId: number) { return this.memStorage.getDebtPaymentsByDebt(debtId); }
  async createDebtPayment(payment: any) { return this.memStorage.createDebtPayment(payment); }
  async updateDebtPayment(id: number, updates: any) { return this.memStorage.updateDebtPayment(id, updates); }
  async deleteDebtPayment(id: number) { return this.memStorage.deleteDebtPayment(id); }
  async getAllInvestments() { return this.memStorage.getAllInvestments(); }
  async getInvestmentsByPlatform(platformId: number) { return this.memStorage.getInvestmentsByPlatform(platformId); }
  async createInvestment(investment: any) { return this.memStorage.createInvestment(investment); }
  async updateInvestment(id: number, updates: any) { return this.memStorage.updateInvestment(id, updates); }
  async deleteInvestment(id: number) { return this.memStorage.deleteInvestment(id); }
  async getAllInvestmentPlatforms() { return this.memStorage.getAllInvestmentPlatforms(); }
  async createInvestmentPlatform(platform: any) { return this.memStorage.createInvestmentPlatform(platform); }
  async updateInvestmentPlatform(id: number, updates: any) { return this.memStorage.updateInvestmentPlatform(id, updates); }
  async deleteInvestmentPlatform(id: number) { return this.memStorage.deleteInvestmentPlatform(id); }
  async getAllAccounts() { return this.memStorage.getAllAccounts(); }
  async getActiveAccounts() { return this.memStorage.getActiveAccounts(); }
  async createAccount(account: any) { return this.memStorage.createAccount(account); }
  async updateAccount(id: number, updates: any) { return this.memStorage.updateAccount(id, updates); }
  async deleteAccount(id: number) { return this.memStorage.deleteAccount(id); }
  async getAllNetWorthSnapshots() { return this.memStorage.getAllNetWorthSnapshots(); }
  async getNetWorthSnapshotsByDateRange(startDate: string, endDate: string) { return this.memStorage.getNetWorthSnapshotsByDateRange(startDate, endDate); }
  async createNetWorthSnapshot(snapshot: any) { return this.memStorage.createNetWorthSnapshot(snapshot); }
  async updateNetWorthSnapshot(id: number, updates: any) { return this.memStorage.updateNetWorthSnapshot(id, updates); }
  async deleteNetWorthSnapshot(id: number) { return this.memStorage.deleteNetWorthSnapshot(id); }
  async getAllFinancialGoals() { return this.memStorage.getAllFinancialGoals(); }
  async getActiveFinancialGoals() { return this.memStorage.getActiveFinancialGoals(); }
  async createFinancialGoal(goal: any) { return this.memStorage.createFinancialGoal(goal); }
  async updateFinancialGoal(id: number, updates: any) { return this.memStorage.updateFinancialGoal(id, updates); }
  async deleteFinancialGoal(id: number) { return this.memStorage.deleteFinancialGoal(id); }
  async getAllBudgetPeriods() { return this.memStorage.getAllBudgetPeriods(); }
  async getActiveBudgetPeriod() { return this.memStorage.getActiveBudgetPeriod(); }
  async createBudgetPeriod(period: any) { return this.memStorage.createBudgetPeriod(period); }
  async updateBudgetPeriod(id: number, updates: any) { return this.memStorage.updateBudgetPeriod(id, updates); }
  async deleteBudgetPeriod(id: number) { return this.memStorage.deleteBudgetPeriod(id); }
  async getAllBudgetAlerts() { return this.memStorage.getAllBudgetAlerts(); }
  async getActiveBudgetAlerts() { return this.memStorage.getActiveBudgetAlerts(); }
  async createBudgetAlert(alert: any) { return this.memStorage.createBudgetAlert(alert); }
  async updateBudgetAlert(id: number, updates: any) { return this.memStorage.updateBudgetAlert(id, updates); }
  async deleteBudgetAlert(id: number) { return this.memStorage.deleteBudgetAlert(id); }
  async getAllSpendingTrends() { return this.memStorage.getAllSpendingTrends(); }
  async getSpendingTrendsByCategory(categoryId: number) { return this.memStorage.getSpendingTrendsByCategory(categoryId); }
  async createSpendingTrend(trend: any) { return this.memStorage.createSpendingTrend(trend); }
  async updateSpendingTrend(id: number, updates: any) { return this.memStorage.updateSpendingTrend(id, updates); }
  async deleteSpendingTrend(id: number) { return this.memStorage.deleteSpendingTrend(id); }
  async getAllPortfolios() { return this.memStorage.getAllPortfolios(); }
  async getPortfolio(id: number) { return this.memStorage.getPortfolio(id); }
  async createPortfolio(portfolio: any) { return this.memStorage.createPortfolio(portfolio); }
  async updatePortfolio(id: number, updates: any) { return this.memStorage.updatePortfolio(id, updates); }
  async deletePortfolio(id: number) { return this.memStorage.deletePortfolio(id); }
  async getAllPortfolioHoldings() { return this.memStorage.getAllPortfolioHoldings(); }
  async getPortfolioHoldingsByPortfolio(portfolioId: number) { return this.memStorage.getPortfolioHoldingsByPortfolio(portfolioId); }
  async createPortfolioHolding(holding: any) { return this.memStorage.createPortfolioHolding(holding); }
  async updatePortfolioHolding(id: number, updates: any) { return this.memStorage.updatePortfolioHolding(id, updates); }
  async deletePortfolioHolding(id: number) { return this.memStorage.deletePortfolioHolding(id); }
  async getAllPriceHistory() { return this.memStorage.getAllPriceHistory(); }
  async getPriceHistoryBySymbol(symbol: string) { return this.memStorage.getPriceHistoryBySymbol(symbol); }
  async getPriceHistoryByDateRange(startDate: string, endDate: string) { return this.memStorage.getPriceHistoryByDateRange(startDate, endDate); }
  async createPriceHistory(price: any) { return this.memStorage.createPriceHistory(price); }
  async updatePriceHistory(id: number, updates: any) { return this.memStorage.updatePriceHistory(id, updates); }
  async deletePriceHistory(id: number) { return this.memStorage.deletePriceHistory(id); }
  async getAllInvestmentTransactions() { return this.memStorage.getAllInvestmentTransactions(); }
  async getInvestmentTransactionsByInvestment(investmentId: number) { return this.memStorage.getInvestmentTransactionsByInvestment(investmentId); }
  async createInvestmentTransaction(transaction: any) { return this.memStorage.createInvestmentTransaction(transaction); }
  async updateInvestmentTransaction(id: number, updates: any) { return this.memStorage.updateInvestmentTransaction(id, updates); }
  async deleteInvestmentTransaction(id: number) { return this.memStorage.deleteInvestmentTransaction(id); }
  async getFinancialAnalytics(startDate: string, endDate: string) { return this.memStorage.getFinancialAnalytics(startDate, endDate); }
  async getProductivityAnalytics(startDate: string, endDate: string) { return this.memStorage.getProductivityAnalytics(startDate, endDate); }
  async getPublicStats() { return this.memStorage.getPublicStats(); }
  async getPublicRecentContent() { return this.memStorage.getPublicRecentContent(); }
  
  // Jira Sync Mappings
  async getJiraSyncMappings() { return this.memStorage.getJiraSyncMappings(); }
  async saveJiraSyncMapping(mapping: any) { return this.memStorage.saveJiraSyncMapping(mapping); }
  async deleteJiraSyncMapping(belleJournalId: string) { return this.memStorage.deleteJiraSyncMapping(belleJournalId); }
  
  // Purchase methods delegation
  async getAllPurchases() { return this.memStorage.getAllPurchases(); }
  async getPurchasesByDateRange(startDate: string, endDate: string) { return this.memStorage.getPurchasesByDateRange(startDate, endDate); }
  async createPurchase(purchase: any) { return this.memStorage.createPurchase(purchase); }
  async updatePurchase(id: number, updates: any) { return this.memStorage.updatePurchase(id, updates); }
  async deletePurchase(id: number) { return this.memStorage.deletePurchase(id); }
  
  // Analytics methods delegation
  async getReportsAnalytics(period: string, startDate: string, endDate: string) { return this.memStorage.getReportsAnalytics(period, startDate, endDate); }
  async getHabitsAnalytics(startDate: string, endDate: string) { return this.memStorage.getHabitsAnalytics(startDate, endDate); }
  async getGoalsAnalytics(period: string, startDate: string, endDate: string) { return this.memStorage.getGoalsAnalytics(period, startDate, endDate); }
  async getHealthAnalytics(startDate: string, endDate: string) { return this.memStorage.getHealthAnalytics(startDate, endDate); }
  async getBudgetAnalytics(period: string, startDate: string, endDate: string) { return this.memStorage.getBudgetAnalytics(period, startDate, endDate); }
  async calculateDebtPayoffTimelines() { return this.memStorage.calculateDebtPayoffTimelines(); }
  async getInvestmentPerformance(startDate: string, endDate: string) { return this.memStorage.getInvestmentPerformance(startDate, endDate); }
  async calculatePortfolioPerformance(portfolioId: number, startDate: string, endDate: string) { return this.memStorage.calculatePortfolioPerformance(portfolioId, startDate, endDate); }
  async calculateNetWorthOverTime(startDate: string, endDate: string) { return this.memStorage.calculateNetWorthOverTime(startDate, endDate); }
  
  // Timer helper method
  async getTimerSession(id: number) { return this.memStorage.getTimerSession(id); }
  async storeCompletedTimerSession(sessionData: any) { return this.memStorage.storeCompletedTimerSession(sessionData); }

  // Calendar Selections
  async getCalendarSelections() { return this.memStorage.getCalendarSelections(); }
  async createCalendarSelections(selections: InsertCalendarSelection[]) { return this.memStorage.createCalendarSelections(selections); }
  async deleteCalendarSelection(id: number) { return this.memStorage.deleteCalendarSelection(id); }
}

export const storage = new DatabaseStorage();