import { 
  type DailyEntry, 
  type InsertDailyEntry,
  type Bill,
  type InsertBill,
  type BillPayment,
  type InsertBillPayment,
  type GroceryItem,
  type InsertGroceryItem,
  type GroceryList,
  type InsertGroceryList,
  type Goal,
  type InsertGoal,
  type Habit,
  type InsertHabit,
  type HabitLog,
  type InsertHabitLog,
  type Medication,
  type InsertMedication,
  type Todo,
  type InsertTodo,
  type TimeBlock,
  type InsertTimeBlock,
  type FocusSession,
  type InsertFocusSession,
  type Budget,
  type InsertBudget,
  type IncomeEntry,
  type InsertIncomeEntry,
  type Challenge,
  type InsertChallenge,
  type ContentCategory,
  type InsertContentCategory,
  type ContentType,
  type InsertContentType,
  type ContentPiece,
  type InsertContentPiece,
  type ContentProgress,
  type InsertContentProgress,
  type AppProject,
  type InsertAppProject,
  type AppTask,
  type InsertAppTask,
  type AppSprint,
  type InsertAppSprint,
  type AppTimeEntry,
  type InsertAppTimeEntry,
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
  type InsertFinancialGoal
} from "@shared/schema";

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
  getAllGroceryLists(): Promise<GroceryList[]>;
  createGroceryList(list: InsertGroceryList): Promise<GroceryList>;
  deleteGroceryList(id: number): Promise<void>;

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

  // Finance Analytics
  getBudgetAnalytics(month: string): Promise<any>;
  getSpendingTrends(startDate: string, endDate: string): Promise<any>;
  getDebtPayoffProjections(): Promise<any>;
  getInvestmentPerformance(): Promise<any>;
  getFinancialHealthScore(): Promise<any>;

  // Analytics methods
  getReportsAnalytics(period: string, startDate: string, endDate: string): Promise<any>;
  getHabitsAnalytics(startDate: string, endDate: string): Promise<any>;
  getGoalsAnalytics(period: string, startDate: string, endDate: string): Promise<any>;
  getHealthAnalytics(startDate: string, endDate: string): Promise<any>;
  getProductivityAnalytics(startDate: string, endDate: string): Promise<any>;
  getPublicStats(): Promise<any>;
  getPublicRecentContent(): Promise<any>;
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

    // Initialize with sample blog posts
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

    // Initialize with sample blog ideas
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

    // Initialize with sample calendar events
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
}

export const storage = new MemStorage();