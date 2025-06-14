import { 
  dailyEntries, 
  bills, 
  billPayments, 
  groceryItems,
  goals,
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
  type TestCase,
  type InsertTestCase,
  type QualityIssue,
  type InsertQualityIssue
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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
  getTimeBlocksByDate(date: string): Promise<TimeBlock[]>;
  createTimeBlock(timeBlock: InsertTimeBlock): Promise<TimeBlock>;
  updateTimeBlock(id: number, updates: Partial<TimeBlock>): Promise<TimeBlock>;
  deleteTimeBlock(id: number): Promise<void>;

  // Focus Sessions
  getFocusSessionsByDate(date: string): Promise<FocusSession[]>;
  createFocusSession(session: InsertFocusSession): Promise<FocusSession>;
  updateFocusSession(id: number, updates: Partial<FocusSession>): Promise<FocusSession>;

  // Budget & Income
  getBudgetsByMonth(month: string): Promise<Budget[]>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: number, updates: Partial<Budget>): Promise<Budget>;
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
  getContentCategories(): Promise<ContentCategory[]>;
  createContentCategory(category: InsertContentCategory): Promise<ContentCategory>;

  // Content Types
  getAllContentTypes(): Promise<ContentType[]>;
  getContentTypes(): Promise<ContentType[]>;
  createContentType(type: InsertContentType): Promise<ContentType>;

  // Content Pieces
  getAllContentPieces(): Promise<ContentPiece[]>;
  getContentPieces(): Promise<ContentPiece[]>;
  createContentPiece(piece: InsertContentPiece): Promise<ContentPiece>;
  updateContentPiece(id: number, updates: Partial<ContentPiece>): Promise<ContentPiece>;

  // Content Progress
  getAllContentProgress(): Promise<ContentProgress[]>;
  getContentProgress(): Promise<ContentProgress[]>;
  createContentProgress(progress: InsertContentProgress): Promise<ContentProgress>;

  // App Development
  getAllAppProjects(): Promise<AppProject[]>;
  getAppProject(id: number): Promise<AppProject | undefined>;
  createAppProject(project: InsertAppProject): Promise<AppProject>;
  updateAppProject(id: number, updates: Partial<AppProject>): Promise<AppProject>;
  deleteAppProject(id: number): Promise<void>;

  getAppTasksByProject(projectId: number): Promise<AppTask[]>;
  getAllAppTasks(): Promise<AppTask[]>;
  createAppTask(task: InsertAppTask): Promise<AppTask>;
  updateAppTask(id: number, updates: Partial<AppTask>): Promise<AppTask>;
  deleteAppTask(id: number): Promise<void>;

  getAppSprintsByProject(projectId: number): Promise<AppSprint[]>;
  createAppSprint(sprint: InsertAppSprint): Promise<AppSprint>;
  updateAppSprint(id: number, updates: Partial<AppSprint>): Promise<AppSprint>;
  deleteAppSprint(id: number): Promise<void>;

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

  // Scheduling
  scheduleContentForMoonPhases(year: number, month: number): Promise<void>;

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

  // Test Cases
  getAllTestCases(): Promise<TestCase[]>;
  getTestCasesByProject(projectId: number): Promise<TestCase[]>;
  createTestCase(testCase: InsertTestCase): Promise<TestCase>;
  updateTestCase(id: number, updates: Partial<TestCase>): Promise<TestCase>;
  deleteTestCase(id: number): Promise<void>;

  // Quality Issues
  getAllQualityIssues(): Promise<QualityIssue[]>;
  getQualityIssuesByProject(projectId: number): Promise<QualityIssue[]>;
  createQualityIssue(issue: InsertQualityIssue): Promise<QualityIssue>;
  updateQualityIssue(id: number, updates: Partial<QualityIssue>): Promise<QualityIssue>;
  deleteQualityIssue(id: number): Promise<void>;
  createPerformanceInsights(insights: InsertPerformanceInsights): Promise<PerformanceInsights>;
  updatePerformanceInsights(id: number, updates: Partial<PerformanceInsights>): Promise<PerformanceInsights>;
  deletePerformanceInsights(id: number): Promise<void>;

  // Analytics aggregation
  aggregatePerformanceData(): Promise<void>;

  // Reports analytics methods
  getReportsAnalytics(period: string, startDate: string, endDate: string): Promise<any>;
  getHabitsAnalytics(startDate: string, endDate: string): Promise<any>;
  getGoalsAnalytics(period: string, startDate: string, endDate: string): Promise<any>;
  getHealthAnalytics(startDate: string, endDate: string): Promise<any>;
  getProductivityAnalytics(startDate: string, endDate: string): Promise<any>;

  // Public data methods (no sensitive information)
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
  private testCases: Map<number, TestCase> = new Map();
  private qualityIssues: Map<number, QualityIssue> = new Map();
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
  }

  // Public data methods (no sensitive information)
  async getPublicStats() {
    const goals = this.goals.size;
    const completedGoals = Array.from(this.goals.values()).filter(g => g.isCompleted).length;
    const habits = this.habits.size;
    const activeHabits = Array.from(this.habits.values()).filter(h => h.isActive).length;
    const contentPieces = this.contentPieces.size;
    const publishedContent = Array.from(this.contentPieces.values()).filter(c => c.status === 'published').length;
    const totalPosts = this.socialMediaPosts.size;
    const totalBlocks = this.miniGameBlocks.size;

    return {
      totalGoals: goals,
      completedGoals: completedGoals,
      totalHabits: habits,
      activeHabits: activeHabits,
      totalContent: contentPieces,
      publishedContent: publishedContent,
      totalPosts: totalPosts,
      totalBlocks: totalBlocks,
      completionRate: goals > 0 ? Math.round((completedGoals / goals) * 100) : 0,
      streak: this.calculateCurrentStreak(),
      lastUpdated: new Date().toISOString()
    };
  }

  private calculateCurrentStreak(): number {
    const today = new Date().toISOString().split('T')[0];
    const entries = Array.from(this.dailyEntries.values())
      .filter(entry => entry.date <= today)
      .sort((a, b) => b.date.localeCompare(a.date));
    
    let streak = 0;
    for (const entry of entries) {
      if (entry.waterIntake && entry.waterIntake > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  async getPublicRecentContent() {
    const contentPieces = Array.from(this.contentPieces.values())
      .filter(piece => piece.status === 'published')
      .sort((a, b) => {
        const dateA = b.updatedAt ? new Date(b.updatedAt) : new Date();
        const dateB = a.updatedAt ? new Date(a.updatedAt) : new Date();
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 3)
      .map(piece => ({
        id: piece.id,
        title: piece.title,
        description: piece.description,
        updatedAt: piece.updatedAt,
        status: piece.status,
        type: 'content'
      }));

    const recentGoals = Array.from(this.goals.values())
      .filter(goal => goal.isCompleted)
      .sort((a, b) => {
        const dateA = b.createdAt ? new Date(b.createdAt) : new Date();
        const dateB = a.createdAt ? new Date(a.createdAt) : new Date();
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 2)
      .map(goal => ({
        id: goal.id,
        title: `Completed: ${goal.title}`,
        description: goal.description,
        updatedAt: goal.createdAt,
        status: 'completed',
        type: 'goal'
      }));

    return [...contentPieces, ...recentGoals].slice(0, 5);
  }

  async getDailyEntry(date: string): Promise<DailyEntry | undefined> {
    return this.dailyEntries.get(date);
  }

  async createOrUpdateDailyEntry(entry: InsertDailyEntry): Promise<DailyEntry> {
    const existing = this.dailyEntries.get(entry.date);

    if (existing) {
      const updated: DailyEntry = {
        ...existing,
        ...entry,
        updatedAt: new Date()
      };
      this.dailyEntries.set(entry.date, updated);
      return updated;
    } else {
      const newEntry: DailyEntry = {
        id: this.currentId++,
        ...entry,
        exerciseNotes: entry.exerciseNotes || null,
        napDuration: entry.napDuration || null,
        wakeUpTime: entry.wakeUpTime || null,
        sleepHours: entry.sleepHours || null,
        sleepQuality: entry.sleepQuality || null,
        mood: entry.mood || null,
        energyLevel: entry.energyLevel || null,
        stressLevel: entry.stressLevel || null,
        symptoms: entry.symptoms || null,
        medicationsTaken: entry.medicationsTaken || null,
        periodFlow: entry.periodFlow || null,
        periodSymptoms: entry.periodSymptoms || null,
        habitCompletions: entry.habitCompletions || null,
        todoItems: entry.todoItems || null,
        waterIntake: entry.waterIntake || 0,
        exerciseCompleted: entry.exerciseCompleted || false,
        breakfastCompleted: entry.breakfastCompleted || false,
        lunchCompleted: entry.lunchCompleted || false,
        dinnerCompleted: entry.dinnerCompleted || false,
        napTaken: entry.napTaken || false,
        workHours: entry.workHours || "0",
        tvHours: entry.tvHours || "0",
        phoneHours: entry.phoneHours || "0",
        focusSessionsCompleted: entry.focusSessionsCompleted || 0,
        cashSavings: entry.cashSavings || "0",
        grocerySpent: entry.grocerySpent || "0",
        dailyIncome: entry.dailyIncome || "0",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.dailyEntries.set(entry.date, newEntry);
      return newEntry;
    }
  }

  async getAllBills(): Promise<Bill[]> {
    return Array.from(this.bills.values());
  }

  async createBill(bill: InsertBill): Promise<Bill> {
    const newBill: Bill = {
      id: this.currentId++,
      ...bill,
      isAutoPay: bill.isAutoPay || false,
      createdAt: new Date()
    };
    this.bills.set(newBill.id, newBill);
    return newBill;
  }

  async deleteBill(id: number): Promise<void> {
    this.bills.delete(id);
  }

  async getBillPaymentsForDate(date: string): Promise<BillPayment[]> {
    return Array.from(this.billPayments.values()).filter(payment => payment.date === date);
  }

  async createBillPayment(payment: InsertBillPayment): Promise<BillPayment> {
    const newPayment: BillPayment = {
      id: this.currentId++,
      ...payment,
      isPaid: payment.isPaid || true,
      createdAt: new Date()
    };
    this.billPayments.set(newPayment.id, newPayment);
    return newPayment;
  }

  async updateBillPayment(id: number, isPaid: boolean): Promise<BillPayment> {
    const payment = this.billPayments.get(id);
    if (!payment) {
      throw new Error("Bill payment not found");
    }

    const updated = { ...payment, isPaid };
    this.billPayments.set(id, updated);
    return updated;
  }

  async getAllGroceryItems(): Promise<GroceryItem[]> {
    return Array.from(this.groceryItems.values());
  }

  async createGroceryItem(item: InsertGroceryItem): Promise<GroceryItem> {
    const newItem: GroceryItem = {
      id: this.currentId++,
      ...item,
      estimatedPrice: item.estimatedPrice || null,
      listId: item.listId || null,
      isCompleted: item.isCompleted || false,
      createdAt: new Date()
    };
    this.groceryItems.set(newItem.id, newItem);
    return newItem;
  }

  async updateGroceryItem(id: number, updates: Partial<GroceryItem>): Promise<GroceryItem> {
    const item = this.groceryItems.get(id);
    if (!item) {
      throw new Error("Grocery item not found");
    }

    const updated = { ...item, ...updates };
    this.groceryItems.set(id, updated);
    return updated;
  }

  async deleteGroceryItem(id: number): Promise<void> {
    this.groceryItems.delete(id);
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
      dueDate: todo.dueDate || null,
      isCompleted: todo.isCompleted || false,
      description: todo.description || null,
      category: todo.category || null,
      priority: todo.priority || "medium",
      estimatedDuration: todo.estimatedDuration || null,
      actualDuration: todo.actualDuration || null,
      createdAt: new Date()
    };
    this.todos.set(newTodo.id, newTodo);
    return newTodo;
  }

  async updateTodo(id: number, updates: Partial<Todo>): Promise<Todo> {
    const todo = this.todos.get(id);
    if (!todo) {
      throw new Error("Todo not found");
    }

    const updated = { ...todo, ...updates };
    this.todos.set(id, updated);
    return updated;
  }

  async deleteTodo(id: number): Promise<void> {
    this.todos.delete(id);
  }

  // Time Blocks
  async getTimeBlocksByDate(date: string): Promise<TimeBlock[]> {
    return Array.from(this.timeBlocks.values()).filter(block => block.date === date);
  }

  async createTimeBlock(timeBlock: InsertTimeBlock): Promise<TimeBlock> {
    const newTimeBlock: TimeBlock = {
      id: this.currentId++,
      ...timeBlock,
      description: timeBlock.description || null,
      category: timeBlock.category || null,
      todoId: timeBlock.todoId || null,
      createdAt: new Date()
    };
    this.timeBlocks.set(newTimeBlock.id, newTimeBlock);
    return newTimeBlock;
  }

  async updateTimeBlock(id: number, updates: Partial<TimeBlock>): Promise<TimeBlock> {
    const timeBlock = this.timeBlocks.get(id);
    if (!timeBlock) {
      throw new Error("Time block not found");
    }

    const updated = { ...timeBlock, ...updates };
    this.timeBlocks.set(id, updated);
    return updated;
  }

  async deleteTimeBlock(id: number): Promise<void> {
    this.timeBlocks.delete(id);
  }

  // Habits methods
  async getAllHabits(): Promise<Habit[]> {
    return Array.from(this.habits.values());
  }

  async createHabit(habit: InsertHabit): Promise<Habit> {
    const newHabit: Habit = {
      id: this.currentId++,
      ...habit,
      description: habit.description || null,
      targetFrequency: habit.targetFrequency || 1,
      currentStreak: habit.currentStreak || 0,
      longestStreak: habit.longestStreak || 0,
      isActive: habit.isActive || true,
      createdAt: new Date()
    };
    this.habits.set(newHabit.id, newHabit);
    return newHabit;
  }

  async updateHabit(id: number, updates: Partial<Habit>): Promise<Habit> {
    const habit = this.habits.get(id);
    if (!habit) {
      throw new Error("Habit not found");
    }

    const updated = { ...habit, ...updates };
    this.habits.set(id, updated);
    return updated;
  }

  async deleteHabit(id: number): Promise<void> {
    this.habits.delete(id);
  }

  async getHabitLogs(habitId: number, startDate?: string, endDate?: string): Promise<HabitLog[]> {
    const logs = Array.from(this.habitLogs.values()).filter(log => log.habitId === habitId);

    if (startDate && endDate) {
      return logs.filter(log => log.date >= startDate && log.date <= endDate);
    }

    return logs;
  }

  async createHabitLog(log: InsertHabitLog): Promise<HabitLog> {
    const newLog: HabitLog = {
      id: this.currentId++,
      ...log,
      completed: log.completed || false,
      notes: log.notes || null,
      createdAt: new Date()
    };
    this.habitLogs.set(newLog.id, newLog);
    return newLog;
  }

  async updateHabitLog(id: number, updates: Partial<HabitLog>): Promise<HabitLog> {
    const log = this.habitLogs.get(id);
    if (!log) {
      throw new Error("Habit log not found");
    }

    const updated = { ...log, ...updates };
    this.habitLogs.set(id, updated);
    return updated;
  }

  // Focus Sessions methods
  async getFocusSessionsByDate(date: string): Promise<FocusSession[]> {
    return Array.from(this.focusSessions.values()).filter(session => session.date === date);
  }

  async createFocusSession(session: InsertFocusSession): Promise<FocusSession> {
    const newSession: FocusSession = {
      id: this.currentId++,
      ...session,
      notes: session.notes || null,
      actualDuration: session.actualDuration || null,
      endTime: session.endTime || null,
      taskDescription: session.taskDescription || null,
      wasSuccessful: session.wasSuccessful || false,
      createdAt: new Date()
    };
    this.focusSessions.set(newSession.id, newSession);
    return newSession;
  }

  async updateFocusSession(id: number, updates: Partial<FocusSession>): Promise<FocusSession> {
    const session = this.focusSessions.get(id);
    if (!session) {
      throw new Error("Focus session not found");
    }

    const updated = { ...session, ...updates };
    this.focusSessions.set(id, updated);
    return updated;
  }

  // Budget methods
  async getBudgetsByMonth(month: string): Promise<Budget[]> {
    return Array.from(this.budgets.values()).filter(budget => budget.month === month);
  }

  async createBudget(budget: InsertBudget): Promise<Budget> {
    const newBudget: Budget = {
      id: this.currentId++,
      ...budget,
      spent: budget.spent || null,
      createdAt: new Date()
    };
    this.budgets.set(newBudget.id, newBudget);
    return newBudget;
  }

  async updateBudget(id: number, updates: Partial<Budget>): Promise<Budget> {
    const budget = this.budgets.get(id);
    if (!budget) {
      throw new Error("Budget not found");
    }

    const updated = { ...budget, ...updates };
    this.budgets.set(id, updated);
    return updated;
  }

  // Income methods
  async getIncomeEntriesByDateRange(startDate: string, endDate: string): Promise<IncomeEntry[]> {
    return Array.from(this.incomeEntries.values()).filter(entry => 
      entry.date >= startDate && entry.date <= endDate
    );
  }

  async createIncomeEntry(entry: InsertIncomeEntry): Promise<IncomeEntry> {
    const newEntry: IncomeEntry = {
      id: this.currentId++,
      ...entry,
      description: entry.description || null,
      category: entry.category || null,
      createdAt: new Date()
    };
    this.incomeEntries.set(newEntry.id, newEntry);
    return newEntry;
  }

  async deleteIncomeEntry(id: number): Promise<void> {
    this.incomeEntries.delete(id);
  }

  // Challenges methods
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
      isCompleted: challenge.isCompleted ?? false,
      description: challenge.description ?? null,
      currentValue: challenge.currentValue ?? null,
      isActive: challenge.isActive ?? true,
      createdAt: new Date()
    };
    this.challenges.set(newChallenge.id, newChallenge);
    return newChallenge;
  }

  async updateChallenge(id: number, updates: Partial<Challenge>): Promise<Challenge> {
    const challenge = this.challenges.get(id);
    if (!challenge) {
      throw new Error("Challenge not found");
    }

    const updated = { ...challenge, ...updates };
    this.challenges.set(id, updated);
    return updated;
  }

  async deleteChallenge(id: number): Promise<void> {
    this.challenges.delete(id);
  }

  // Content Management Suite methods
  async getAllContentCategories(): Promise<ContentCategory[]> {
    return Array.from(this.contentCategories.values());
  }

  async getContentCategories(): Promise<ContentCategory[]> {
    return this.getAllContentCategories();
  }

  async createContentCategory(category: InsertContentCategory): Promise<ContentCategory> {
    const newCategory: ContentCategory = {
      id: this.currentId++,
      ...category,
      description: category.description ?? null,
      isActive: category.isActive ?? true,
      color: category.color ?? null,
      createdAt: new Date()
    };
    this.contentCategories.set(newCategory.id, newCategory);
    return newCategory;
  }

  async getAllContentTypes(): Promise<ContentType[]> {
    return Array.from(this.contentTypes.values());
  }

  async getContentTypes(): Promise<ContentType[]> {
    return this.getAllContentTypes();
  }

  async createContentType(type: InsertContentType): Promise<ContentType> {
    const newType: ContentType = {
      id: this.currentId++,
      ...type,
      description: type.description ?? null,
      isRecurring: type.isRecurring ?? true,
      createdAt: new Date()
    };
    this.contentTypes.set(newType.id, newType);
    return newType;
  }

  async getAllContentPieces(): Promise<ContentPiece[]> {
    return Array.from(this.contentPieces.values());
  }

  async getContentPieces(): Promise<ContentPiece[]> {
    return this.getAllContentPieces();
  }

  async createContentPiece(piece: InsertContentPiece): Promise<ContentPiece> {
    const newPiece: ContentPiece = {
      id: this.currentId++,
      ...piece,
      description: piece.description ?? null,
      status: piece.status ?? null,
      targetDate: piece.targetDate ?? null,
      scheduledDate: piece.scheduledDate ?? null,
      publishedDate: piece.publishedDate ?? null,
      notes: piece.notes ?? null,
      priority: piece.priority ?? "medium",
      estimatedDuration: piece.estimatedDuration ?? null,
      actualDuration: piece.actualDuration ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.contentPieces.set(newPiece.id, newPiece);
    return newPiece;
  }

  async updateContentPiece(id: number, updates: Partial<ContentPiece>): Promise<ContentPiece> {
    const piece = this.contentPieces.get(id);
    if (!piece) {
      throw new Error("Content piece not found");
    }

    const updated = { ...piece, ...updates, updatedAt: new Date() };
    this.contentPieces.set(id, updated);
    return updated;
  }

  async getAllContentProgress(): Promise<ContentProgress[]> {
    return Array.from(this.contentProgress.values());
  }

  async getContentProgress(): Promise<ContentProgress[]> {
    return this.getAllContentProgress();
  }

  async createContentProgress(progress: InsertContentProgress): Promise<ContentProgress> {
    const newProgress: ContentProgress = {
      id: this.currentId++,
      ...progress,
      isCompleted: progress.isCompleted ?? false,
      completedAt: progress.completedAt ?? null,
      notes: progress.notes ?? null,
      createdAt: new Date()
    };
    this.contentProgress.set(newProgress.id, newProgress);
    return newProgress;
  }

  // App Development methods
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
      status: project.status ?? "active",
      description: project.description ?? "",
      projectType: project.projectType ?? "web",
      repositoryUrl: project.repositoryUrl ?? null,
      deploymentUrl: project.deploymentUrl ?? null,
      targetDate: project.targetDate ?? null,
      isActive: project.isActive ?? true,
      priority: project.priority ?? "medium",
      startDate: project.startDate ?? null,
      estimatedHours: project.estimatedHours ?? null,
      actualHours: project.actualHours ?? 0,
      techStack: project.techStack ?? [],
      completedDate: project.completedDate || null,
      progress: project.progress || 0,
      tags: project.tags || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.appProjects.set(newProject.id, newProject);
    return newProject;
  }

  async updateAppProject(id: number, updates: Partial<AppProject>): Promise<AppProject> {
    const project = this.appProjects.get(id);
    if (!project) {
      throw new Error("App project not found");
    }

    const updated = { ...project, ...updates, updatedAt: new Date() };
    this.appProjects.set(id, updated);
    return updated;
  }

  async deleteAppProject(id: number): Promise<void> {
    this.appProjects.delete(id);
  }

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
      status: task.status || "pending",
      dueDate: task.dueDate || null,
      description: task.description || "",
      category: task.category || "",
      priority: task.priority || "medium",
      completedDate: task.completedDate || null,
      estimatedHours: task.estimatedHours || null,
      actualHours: task.actualHours || null,
      assignee: task.assignee || null,
      dependencies: task.dependencies ?? [],
      tags: task.tags ?? [],
      attachments: task.attachments ?? [],
      comments: task.comments ?? "",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.appTasks.set(newTask.id, newTask);
    return newTask;
  }

  async updateAppTask(id: number, updates: Partial<AppTask>): Promise<AppTask> {
    const task = this.appTasks.get(id);
    if (!task) {
      throw new Error("App task not found");
    }

    const updated = { ...task, ...updates, updatedAt: new Date() };
    this.appTasks.set(id, updated);
    return updated;
  }

  async deleteAppTask(id: number): Promise<void> {
    this.appTasks.delete(id);
  }

  async getAppSprintsByProject(projectId: number): Promise<AppSprint[]> {
    return Array.from(this.appSprints.values()).filter(sprint => sprint.projectId === projectId);
  }

  async createAppSprint(sprint: InsertAppSprint): Promise<AppSprint> {
    const newSprint: AppSprint = {
      id: this.currentId++,
      ...sprint,
      status: sprint.status || "planning",
      description: sprint.description || "",
      goal: sprint.goal || "",
      velocity: sprint.velocity || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.appSprints.set(newSprint.id, newSprint);
    return newSprint;
  }

  async updateAppSprint(id: number, updates: Partial<AppSprint>): Promise<AppSprint> {
    const sprint = this.appSprints.get(id);
    if (!sprint) {
      throw new Error("App sprint not found");
    }

    const updated = { ...sprint, ...updates, updatedAt: new Date() };
    this.appSprints.set(id, updated);
    return updated;
  }

  async deleteAppSprint(id: number): Promise<void> {
    this.appSprints.delete(id);
  }

  async getAppTimeEntriesByProject(projectId: number, startDate?: string, endDate?: string): Promise<AppTimeEntry[]> {
    const entries = Array.from(this.appTimeEntries.values()).filter(entry => entry.projectId === projectId);

    if (startDate && endDate) {
      return entries.filter(entry => {
        if (!entry.endTime) return false;
        const entryStart = new Date(entry.startTime);
        const entryEnd = new Date(entry.endTime);
        const filterStart = new Date(startDate);
        const filterEnd = new Date(endDate);
        return entryStart >= filterStart && entryEnd <= filterEnd;
      });
    }

    return entries;
  }

  async createAppTimeEntry(entry: InsertAppTimeEntry): Promise<AppTimeEntry> {
    const newEntry: AppTimeEntry = {
      id: this.currentId++,
      ...entry,
      endTime: entry.endTime || null,
      taskId: entry.taskId || null,
      duration: entry.duration || 0,
      billable: entry.billable || false,
      createdAt: new Date()
    };
    this.appTimeEntries.set(newEntry.id, newEntry);
    return newEntry;
  }

  async updateAppTimeEntry(id: number, updates: Partial<AppTimeEntry>): Promise<AppTimeEntry> {
    const entry = this.appTimeEntries.get(id);
    if (!entry) {
      throw new Error("App time entry not found");
    }

    const updated = { ...entry, ...updates };
    this.appTimeEntries.set(id, updated);
    return updated;
  }

  async deleteAppTimeEntry(id: number): Promise<void> {
    this.appTimeEntries.delete(id);
  }

  // Goals methods (needed for goals section)
  async getAllGoals(): Promise<Goal[]> {
    return Array.from(this.goals.values());
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const newGoal: Goal = {
      id: this.currentId++,
      ...goal,
      isCompleted: goal.isCompleted ?? false,
      description: goal.description ?? null,
      targetValue: goal.targetValue ?? null,
      currentValue: goal.currentValue ?? null,
      unit: goal.unit ?? null,
      targetDate: goal.targetDate ?? null,

      createdAt: new Date()
    };
    this.goals.set(newGoal.id, newGoal);
    return newGoal;
  }

  async updateGoal(id: number, updates: Partial<Goal>): Promise<Goal> {
    const goal = this.goals.get(id);
    if (!goal) {
      throw new Error("Goal not found");
    }

    const updated = { ...goal, ...updates };
    this.goals.set(id, updated);
    return updated;
  }

  async deleteGoal(id: number): Promise<void> {
    this.goals.delete(id);
  }

  // Medications methods
  async getAllMedications(): Promise<Medication[]> {
    return Array.from(this.medications.values());
  }

  async createMedication(medication: InsertMedication): Promise<Medication> {
    const newMedication: Medication = {
      id: this.currentId++,
      ...medication,
      isActive: medication.isActive || true,
      dosage: medication.dosage || null,
      frequency: medication.frequency || null,
      reminderTimes: medication.reminderTimes || null,
      createdAt: new Date()
    };
    this.medications.set(newMedication.id, newMedication);
    return newMedication;
  }

  async updateMedication(id: number, updates: Partial<Medication>): Promise<Medication> {
    const medication = this.medications.get(id);
    if (!medication) {
      throw new Error("Medication not found");
    }

    const updated = { ...medication, ...updates };
    this.medications.set(id, updated);
    return updated;
  }

  async deleteMedication(id: number): Promise<void> {
    this.medications.delete(id);
  }

  // Grocery Lists methods
  async getAllGroceryLists(): Promise<GroceryList[]> {
    return Array.from(this.groceryLists.values());
  }

  async createGroceryList(list: InsertGroceryList): Promise<GroceryList> {
    const newList: GroceryList = {
      id: this.currentId++,
      ...list,
      isRecurring: list.isRecurring || false,
      isTemplate: list.isTemplate || false,
      createdAt: new Date()
    };
    this.groceryLists.set(newList.id, newList);
    return newList;
  }

  async deleteGroceryList(id: number): Promise<void> {
    this.groceryLists.delete(id);
  }



  async createContentPiece(piece: InsertContentPiece): Promise<ContentPiece> {
    const newPiece: ContentPiece = {
      id: this.currentId++,
      ...piece,
      description: piece.description ?? null,
      status: piece.status ?? null,
      targetDate: piece.targetDate ?? null,
      scheduledDate: piece.scheduledDate ?? null,
      publishedDate: piece.publishedDate ?? null,
      notes: piece.notes ?? null,
      priority: piece.priority ?? "medium",
      estimatedDuration: piece.estimatedDuration ?? null,
      actualDuration: piece.actualDuration ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.contentPieces.set(newPiece.id, newPiece);
    return newPiece;
  }

  async updateContentPiece(id: number, updates: Partial<ContentPiece>): Promise<ContentPiece> {
    const piece = this.contentPieces.get(id);
    if (!piece) {
      throw new Error("Content piece not found");
    }

    const updated = { ...piece, ...updates, updatedAt: new Date() };
    this.contentPieces.set(id, updated);
    return updated;
  }

  // Content Progress methods
  async getAllContentProgress(): Promise<ContentProgress[]> {
    return Array.from(this.contentProgress.values());
  }

  async getContentProgress(): Promise<ContentProgress[]> {
    return this.getAllContentProgress();
  }

  async createContentProgress(progress: InsertContentProgress): Promise<ContentProgress> {
    const newProgress: ContentProgress = {
      id: this.currentId++,
      ...progress,
      isCompleted: progress.isCompleted ?? false,
      completedAt: progress.completedAt ?? null,
      notes: progress.notes ?? null,
      createdAt: new Date()
    };
    this.contentProgress.set(newProgress.id, newProgress);
    return newProgress;
  }

  // Mini Game Blocks methods
  async getAllMiniGameBlocks(): Promise<MiniGameBlock[]> {
    return Array.from(this.miniGameBlocks.values());
  }

  async createMiniGameBlock(block: InsertMiniGameBlock): Promise<MiniGameBlock> {
    const newBlock: MiniGameBlock = {
      id: this.currentId++,
      ...block,
      description: block.description ?? null,
      category: block.category ?? null,
      isActive: block.isActive ?? true,
      color: block.color ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.miniGameBlocks.set(newBlock.id, newBlock);
    return newBlock;
  }

  async updateMiniGameBlock(id: number, updates: Partial<MiniGameBlock>): Promise<MiniGameBlock> {
    const block = this.miniGameBlocks.get(id);
    if (!block) {
      throw new Error("Mini game block not found");
    }

    const updated = { ...block, ...updates, updatedAt: new Date() };
    this.miniGameBlocks.set(id, updated);
    return updated;
  }

  async deleteMiniGameBlock(id: number): Promise<void> {
    this.miniGameBlocks.delete(id);
  }

  // Mini Game Designs methods
  async getAllMiniGameDesigns(): Promise<MiniGameDesign[]> {
    return Array.from(this.miniGameDesigns.values());
  }

  async getMiniGameDesignsByBlock(blockId: number): Promise<MiniGameDesign[]> {
    return Array.from(this.miniGameDesigns.values()).filter(design => design.miniGameBlockId === blockId);
  }

  async createMiniGameDesign(design: InsertMiniGameDesign): Promise<MiniGameDesign> {
    const newDesign: MiniGameDesign = {
      id: this.currentId++,
      ...design,
      status: design.status ?? null,
      isTemplate: design.isTemplate ?? false,
      description: design.description ?? null,
      targetDate: design.targetDate ?? null,
      designedDate: design.designedDate ?? null,
      reviewedDate: design.reviewedDate ?? null,
      approvedDate: design.approvedDate ?? null,
      designNotes: design.designNotes ?? null,
      version: design.version ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.miniGameDesigns.set(newDesign.id, newDesign);
    return newDesign;
  }

  async updateMiniGameDesign(id: number, updates: Partial<MiniGameDesign>): Promise<MiniGameDesign> {
    const design = this.miniGameDesigns.get(id);
    if (!design) {
      throw new Error("Mini game design not found");
    }

    const updated = { ...design, ...updates, updatedAt: new Date() };
    this.miniGameDesigns.set(id, updated);
    return updated;
  }

  async deleteMiniGameDesign(id: number): Promise<void> {
    this.miniGameDesigns.delete(id);
  }

  // Moon phase calculation helpers
  private calculateMoonPhase(date: Date): string {
    // This is a simplified moon phase calculation
    // For production, you'd want to use a more accurate astronomical library
    const referenceNewMoon = new Date('2025-01-13'); // Known new moon date
    const lunarCycle = 29.53058867; // days in lunar cycle

    const daysSinceReference = (date.getTime() - referenceNewMoon.getTime()) / (1000 * 60 * 60 * 24);
    const phaseValue = ((daysSinceReference % lunarCycle) + lunarCycle) % lunarCycle;

    if (phaseValue < 1.84566) return 'new_moon';
    if (phaseValue < 5.53699) return 'waxing_crescent';
    if (phaseValue < 9.22831) return 'first_quarter';
    if (phaseValue < 12.91963) return 'waxing_gibbous';
    if (phaseValue < 16.61096) return 'full_moon';
    if (phaseValue < 20.30228) return 'waning_gibbous';
    if (phaseValue < 23.99361) return 'third_quarter';
    return 'waning_crescent';
  }

  private getMoonPhaseDates(year: number, month: number): { date: Date; phase: string }[] {
    const dates: { date: Date; phase: string }[] = [];
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const phase = this.calculateMoonPhase(date);
      const previousDay = day > 1 ? this.calculateMoonPhase(new Date(year, month - 1, day - 1)) : null;

      // Only add dates where the phase changes (moon phase events)
      if (phase !== previousDay) {
        dates.push({ date, phase });
      }
    }

    return dates;
  }

  // Scheduling method
  async scheduleContentForMoonPhases(year: number, month: number): Promise<void> {
    const moonPhaseDates = this.getMoonPhaseDates(year, month);
    const blocks = await this.getAllMiniGameBlocks();

    // Define moon phase to content mappings
    const moonPhaseContentMap: { [key: string]: string[] } = {
      'waning_crescent': ['Written Realms'],
      'full_moon': ['Reading'], // Add any blocks that should post on full moon
      'new_moon': ['Moon Cycle'], // Add any blocks that should post on new moon
      'first_quarter': ['Positive Affirmations'],
      'third_quarter': ['She Stays On My Mind', 'The Way He Makes Me Feel']
    };

    for (const { date, phase } of moonPhaseDates) {
      const contentTypes = moonPhaseContentMap[phase];
      if (!contentTypes) continue;

      for (const contentType of contentTypes) {
        const matchingBlock = blocks.find(block => block.name === contentType);
        if (!matchingBlock) continue;

        // Create a design for this moon phase event
        const design: InsertMiniGameDesign = {
          miniGameBlockId: matchingBlock.id,
          title: `${matchingBlock.name} for ${this.getMoonPhaseName(phase)}`,
          description: `Scheduled content for ${phase} on ${date.toDateString()}`,
          designNotes: `Auto-scheduled for moon phase: ${phase}`,
          status: 'designed',
          targetDate: date.toISOString().split('T')[0],
          designedDate: new Date().toISOString().split('T')[0],
          reviewedDate: undefined,
          approvedDate: undefined,
          version: 1,
          isTemplate: false
        };

        await this.createMiniGameDesign(design);
      }
    }
  }

  private getMoonPhaseName(phase: string): string {
    const names: { [key: string]: string } = {
      'new_moon': 'New Moon',
      'waxing_crescent': 'Waxing Crescent',
      'first_quarter': 'First Quarter',
      'waxing_gibbous': 'Waxing Gibbous',
      'full_moon': 'Full Moon',
      'waning_gibbous': 'Waning Gibbous',
      'third_quarter': 'Third Quarter',
      'waning_crescent': 'Waning Crescent'
    };
    return names[phase] || phase;
  }

  // Social Media Posts Methods
  async getAllSocialMediaPosts(): Promise<SocialMediaPost[]> {
    return Array.from(this.socialMediaPosts.values());
  }

  async getSocialMediaPostsByDesign(designId: number): Promise<SocialMediaPost[]> {
    return Array.from(this.socialMediaPosts.values()).filter(post => post.miniGameDesignId === designId);
  }

  async getSocialMediaPostsByDateRange(startDate: string, endDate: string): Promise<SocialMediaPost[]> {
    return Array.from(this.socialMediaPosts.values()).filter(post => {
      const postDate = new Date(post.scheduledDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return postDate >= start && postDate <= end;
    });
  }

  async createSocialMediaPost(post: InsertSocialMediaPost): Promise<SocialMediaPost> {
    const newPost: SocialMediaPost = {
      id: this.currentId++,
      ...post,
      status: post.status ?? "scheduled",
      publishedDate: post.publishedDate ?? null,
      postUrl: post.postUrl ?? null,
      caption: post.caption ?? null,
      hashtags: post.hashtags ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.socialMediaPosts.set(newPost.id, newPost);
    return newPost;
  }

  async updateSocialMediaPost(id: number, updates: Partial<SocialMediaPost>): Promise<SocialMediaPost> {
    const existing = this.socialMediaPosts.get(id);
    if (!existing) {
      throw new Error(`Social media post with id ${id} not found`);
    }
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.socialMediaPosts.set(id, updated);
    return updated;
  }

  async deleteSocialMediaPost(id: number): Promise<void> {
    this.socialMediaPosts.delete(id);
  }

  // Social Media Analytics Methods
  async getAllSocialMediaAnalytics(): Promise<SocialMediaAnalytics[]> {
    return Array.from(this.socialMediaAnalytics.values());
  }

  async getSocialMediaAnalyticsByPost(postId: number): Promise<SocialMediaAnalytics[]> {
    return Array.from(this.socialMediaAnalytics.values()).filter(analytics => analytics.postId === postId);
  }

  async getLatestAnalyticsForPost(postId: number): Promise<SocialMediaAnalytics | undefined> {
    const analytics = await this.getSocialMediaAnalyticsByPost(postId);
    if (analytics.length === 0) return undefined;
    return analytics.sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0];
  }

  async createSocialMediaAnalytics(analytics: InsertSocialMediaAnalytics): Promise<SocialMediaAnalytics> {
    const newAnalytics: SocialMediaAnalytics = {
      id: this.currentId++,
      ...analytics,
      comments: analytics.comments ?? 0,
      impressions: analytics.impressions ?? 0,
      reach: analytics.reach ?? 0,
      likes: analytics.likes ?? 0,
      shares: analytics.shares ?? 0,
      saves: analytics.saves ?? 0,
      clicks: analytics.clicks ?? 0,
      profileViews: analytics.profileViews ?? 0,
      engagementRate: analytics.engagementRate ?? 0,
      recordedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.socialMediaAnalytics.set(newAnalytics.id, newAnalytics);
    return newAnalytics;
  }

  async updateSocialMediaAnalytics(id: number, updates: Partial<SocialMediaAnalytics>): Promise<SocialMediaAnalytics> {
    const existing = this.socialMediaAnalytics.get(id);
    if (!existing) {
      throw new Error(`Social media analytics with id ${id} not found`);
    }
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.socialMediaAnalytics.set(id, updated);
    return updated;
  }

  // Performance Insights Methods
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

  // Test Cases Methods
  async getAllTestCases(): Promise<TestCase[]> {
    return Array.from(this.testCases.values());
  }

  async getTestCasesByProject(projectId: number): Promise<TestCase[]> {
    return Array.from(this.testCases.values()).filter(testCase => testCase.projectId === projectId);
  }

  async createTestCase(testCase: InsertTestCase): Promise<TestCase> {
    const newTestCase: TestCase = {
      id: this.currentId++,
      ...testCase,
      description: testCase.description || "",
      category: testCase.category || "functionality",
      priority: testCase.priority || "medium",
      status: testCase.status || "pending",
      steps: testCase.steps || [],
      expectedResult: testCase.expectedResult || "",
      actualResult: testCase.actualResult || "",
      testedBy: testCase.testedBy || null,
      testedAt: testCase.testedAt || null,
      environment: testCase.environment || "development",
      browserOrDevice: testCase.browserOrDevice || null,
      notes: testCase.notes || "",
      taskId: testCase.taskId || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.testCases.set(newTestCase.id, newTestCase);
    return newTestCase;
  }

  async updateTestCase(id: number, updates: Partial<TestCase>): Promise<TestCase> {
    const existing = this.testCases.get(id);
    if (!existing) {
      throw new Error(`Test case with id ${id} not found`);
    }
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.testCases.set(id, updated);
    return updated;
  }

  async deleteTestCase(id: number): Promise<void> {
    this.testCases.delete(id);
  }

  // Quality Issues Methods
  async getAllQualityIssues(): Promise<QualityIssue[]> {
    return Array.from(this.qualityIssues.values());
  }

  async getQualityIssuesByProject(projectId: number): Promise<QualityIssue[]> {
    return Array.from(this.qualityIssues.values()).filter(issue => issue.projectId === projectId);
  }

  async createQualityIssue(issue: InsertQualityIssue): Promise<QualityIssue> {
    const newIssue: QualityIssue = {
      id: this.currentId++,
      projectId: issue.projectId,
      title: issue.title,
      description: issue.description || "",
      category: issue.category || "bug",
      severity: issue.severity || "medium",
      status: issue.status || "open",
      priority: issue.priority || "medium",
      foundIn: issue.foundIn || "development",
      assignedTo: issue.assignedTo || null,
      stepsToReproduce: issue.stepsToReproduce || [],
      expectedBehavior: issue.expectedBehavior || "",
      actualBehavior: issue.actualBehavior || "",
      workaround: issue.workaround || "",
      resolution: issue.resolution || "",
      resolvedAt: issue.resolvedAt || null,
      taskId: issue.taskId || null,
      testCaseId: issue.testCaseId || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.qualityIssues.set(newIssue.id, newIssue);
    return newIssue;
  }

  async updateQualityIssue(id: number, updates: Partial<QualityIssue>): Promise<QualityIssue> {
    const existing = this.qualityIssues.get(id);
    if (!existing) {
      throw new Error(`Quality issue with id ${id} not found`);
    }
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.qualityIssues.set(id, updated);
    return updated;
  }

  async deleteQualityIssue(id: number): Promise<void> {
    this.qualityIssues.delete(id);
  }

  async createPerformanceInsights(insights: InsertPerformanceInsights): Promise<PerformanceInsights> {
    const newInsights: PerformanceInsights = {
      id: this.currentId++,
      miniGameBlockId: insights.miniGameBlockId,
      platform: insights.platform,
      dayOfWeek: insights.dayOfWeek,
      timeSlot: insights.timeSlot,
      postType: insights.postType,
      avgImpressions: insights.avgImpressions ?? 0,
      avgReach: insights.avgReach ?? 0,
      avgLikes: insights.avgLikes ?? 0,
      avgComments: insights.avgComments ?? 0,
      avgShares: insights.avgShares ?? 0,
      avgEngagementRate: insights.avgEngagementRate ?? 0,
      totalPosts: insights.totalPosts ?? 0,
      lastUpdated: new Date()
    };
    this.performanceInsights.set(newInsights.id, newInsights);
    return newInsights;
  }

  async updatePerformanceInsights(id: number, updates: Partial<PerformanceInsights>): Promise<PerformanceInsights> {
    const existing = this.performanceInsights.get(id);
    if (!existing) {
      throw new Error(`Performance insights with id ${id} not found`);
    }
    const updated = { ...existing, ...updates, lastUpdated: new Date() };
    this.performanceInsights.set(id, updated);
    return updated;
  }

  async deletePerformanceInsights(id: number): Promise<void> {
    this.performanceInsights.delete(id);
  }

  async aggregatePerformanceData(): Promise<void> {
    const posts = await this.getAllSocialMediaPosts();
    const allAnalytics = await this.getAllSocialMediaAnalytics();

    // Group by mini-game, platform, day of week, time slot, and post type
    const groupedData: { [key: string]: {
      impressions: number[];
      reach: number[];
      likes: number[];
      comments: number[];
      shares: number[];
      engagementRates: number[];
    } } = {};

    for (const post of posts) {
      const postAnalytics = allAnalytics.filter(a => a.postId === post.id);
      if (postAnalytics.length === 0) continue;

      const latestAnalytics = postAnalytics[postAnalytics.length - 1];
      const design = await this.getMiniGameDesignsByBlock(post.miniGameDesignId);
      const miniGameBlock = design.length > 0 ? await this.getAllMiniGameBlocks().then(blocks => 
        blocks.find(b => b.id === design[0].miniGameBlockId)
      ) : null;

      if (!miniGameBlock) continue;

      const key = `${miniGameBlock.id}-${post.platform}-${post.dayOfWeek}-${post.timeSlot}-${post.postType}`;

      if (!groupedData[key]) {
        groupedData[key] = {
          impressions: [],
          reach: [],
          likes: [],
          comments: [],
          shares: [],
          engagementRates: []
        };
      }

      groupedData[key].impressions.push(latestAnalytics.impressions);
      groupedData[key].reach.push(latestAnalytics.reach);
      groupedData[key].likes.push(latestAnalytics.likes);
      groupedData[key].comments.push(latestAnalytics.comments);
      groupedData[key].shares.push(latestAnalytics.shares);

      const engagementRate = latestAnalytics.impressions > 0 ? 
        ((latestAnalytics.likes + latestAnalytics.comments + latestAnalytics.shares) / latestAnalytics.impressions) * 100 : 0;
      groupedData[key].engagementRates.push(engagementRate);
    }

    // Create or update performance insights
    for (const [key, data] of Object.entries(groupedData)) {
      const [miniGameBlockId, platform, dayOfWeek, timeSlot, postType] = key.split('-');

      const avgImpressions = data.impressions.reduce((sum, val) => sum + val, 0) / data.impressions.length;
      const avgReach = data.reach.reduce((sum, val) => sum + val, 0) / data.reach.length;
      const avgLikes = data.likes.reduce((sum, val) => sum + val, 0) / data.likes.length;
      const avgComments = data.comments.reduce((sum, val) => sum + val, 0) / data.comments.length;
      const avgShares = data.shares.reduce((sum, val) => sum + val, 0) / data.shares.length;
      const avgEngagementRate = data.engagementRates.reduce((sum, val) => sum + val, 0) / data.engagementRates.length;

      const existingInsight = Array.from(this.performanceInsights.values()).find(insight =>
        insight.miniGameBlockId === parseInt(miniGameBlockId) &&
        insight.platform === platform &&
        insight.dayOfWeek === dayOfWeek &&
        insight.timeSlot === timeSlot &&
        insight.postType === postType
      );

      if (existingInsight) {
        await this.updatePerformanceInsights(existingInsight.id, {
          avgImpressions: Math.round(avgImpressions),
          avgReach: Math.round(avgReach),
          avgLikes: Math.round(avgLikes),
          avgComments: Math.round(avgComments),
          avgShares: Math.round(avgShares),
          avgEngagementRate: Math.round(avgEngagementRate * 100) / 100,
          totalPosts: data.impressions.length
        });
      } else {
        await this.createPerformanceInsights({
          miniGameBlockId: parseInt(miniGameBlockId),
          platform,
          dayOfWeek,
          timeSlot,
          postType,
          avgImpressions: Math.round(avgImpressions),
          avgReach: Math.round(avgReach),
          avgLikes: Math.round(avgLikes),
          avgComments: Math.round(avgComments),
          avgShares: Math.round(avgShares),
          avgEngagementRate: Math.round(avgEngagementRate * 100) / 100,
          totalPosts: data.impressions.length
        });
      }
    }
  }

  // Reports Analytics Implementation
  async getReportsAnalytics(period: string, startDate: string, endDate: string): Promise<any> {
    const habits = await this.getAllHabits();
    const goals = await this.getAllGoals();
    const dailyEntries = Array.from(this.dailyEntries.values()).filter(entry => 
      entry.date >= startDate && entry.date <= endDate
    );

    const totalDays = dailyEntries.length;
    const habitsCompleted = dailyEntries.reduce((sum, entry) => {
      const completions = entry.habitCompletions ? JSON.parse(entry.habitCompletions) : [];
      return sum + completions.length;
    }, 0);

    const avgWaterIntake = totalDays > 0 ? 
      dailyEntries.reduce((sum, entry) => sum + (entry.waterIntake || 0), 0) / totalDays : 0;

    const avgWorkHours = totalDays > 0 ? 
      dailyEntries.reduce((sum, entry) => sum + parseFloat(entry.workHours || "0"), 0) / totalDays : 0;

    return {
      period,
      totalDays,
      habitsCompleted,
      avgWaterIntake: Math.round(avgWaterIntake * 10) / 10,
      avgWorkHours: Math.round(avgWorkHours * 10) / 10,
      goalsActive: goals.filter(g => !g.isCompleted).length,
      goalsCompleted: goals.filter(g => g.isCompleted).length,
      trends: {
        habitsImproving: habitsCompleted > totalDays * 2,
        waterIntakeGood: avgWaterIntake >= 8,
        workLifeBalance: avgWorkHours >= 6 && avgWorkHours <= 8
      }
    };
  }

  async getHabitsAnalytics(startDate: string, endDate: string): Promise<any> {
    const habits = await this.getAllHabits();
    const habitLogs = Array.from(this.habitLogs.values()).filter(log =>
      log.date >= startDate && log.date <= endDate
    );

    const habitAnalytics = habits.map(habit => {
      const logs = habitLogs.filter(log => log.habitId === habit.id);
      const completedLogs = logs.filter(log => log.completed);
      const completionRate = logs.length > 0 ? (completedLogs.length / logs.length) * 100 : 0;

      return {
        id: habit.id,
        name: habit.name,
        category: habit.category,
        currentStreak: habit.currentStreak,
        longestStreak: habit.longestStreak,
        completionRate: Math.round(completionRate),
        totalCompletions: completedLogs.length,
        totalDays: logs.length
      };
    });

    return {
      habits: habitAnalytics,
      avgCompletionRate: habitAnalytics.length > 0 ? 
        Math.round(habitAnalytics.reduce((sum, h) => sum + h.completionRate, 0) / habitAnalytics.length) : 0,
      topPerformer: habitAnalytics.sort((a, b) => b.completionRate - a.completionRate)[0]
    };
  }

  async getGoalsAnalytics(period: string, startDate: string, endDate: string): Promise<any> {
    const goals = await this.getAllGoals();
    const activeGoals = goals.filter(g => !g.isCompleted);
    const completedGoals = goals.filter(g => g.isCompleted);

    const goalsAnalytics = goals.map(goal => {
      const progress = goal.targetValue && parseFloat(goal.targetValue) > 0 ? 
        (parseFloat(goal.currentValue || "0") / parseFloat(goal.targetValue)) * 100 : 0;

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
    const exerciseDays = dailyEntries.filter(entry => entry.exerciseCompleted).length;
    const avgMood = dailyEntries.filter(entry => entry.mood).length;

    return {
      totalDays,
      avgWaterIntake: Math.round(avgWaterIntake * 10) / 10,
      avgSleepHours: Math.round(avgSleepHours * 10) / 10,
      exerciseFrequency: Math.round((exerciseDays / totalDays) * 100),
      moodTrackedDays: avgMood,
      trends: {
        hydrationGood: avgWaterIntake >= 8,
        sleepGood: avgSleepHours >= 7 && avgSleepHours <= 9,
        exerciseConsistent: (exerciseDays / totalDays) >= 0.5
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
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  // Goals methods using database
  async getAllGoals(): Promise<Goal[]> {
    return await db.select().from(goals);
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const [newGoal] = await db.insert(goals).values(goal).returning();
    return newGoal;
  }

  async updateGoal(id: number, updates: Partial<Goal>): Promise<Goal> {
    const [updatedGoal] = await db
      .update(goals)
      .set(updates)
      .where(eq(goals.id, id))
      .returning();
    return updatedGoal;
  }

  async deleteGoal(id: number): Promise<void> {
    await db.delete(goals).where(eq(goals.id, id));
  }

  // Test Cases Methods
  async getAllTestCases(): Promise<TestCase[]> {
    return this.memStorage.getAllTestCases();
  }

  async getTestCasesByProject(projectId: number): Promise<TestCase[]> {
    return this.memStorage.getTestCasesByProject(projectId);
  }

  async createTestCase(testCase: InsertTestCase): Promise<TestCase> {
    return this.memStorage.createTestCase(testCase);
  }

  async updateTestCase(id: number, updates: Partial<TestCase>): Promise<TestCase> {
    return this.memStorage.updateTestCase(id, updates);
  }

  async deleteTestCase(id: number): Promise<void> {
    return this.memStorage.deleteTestCase(id);
  }

  // Quality Issues Methods
  async getAllQualityIssues(): Promise<QualityIssue[]> {
    return this.memStorage.getAllQualityIssues();
  }

  async getQualityIssuesByProject(projectId: number): Promise<QualityIssue[]> {
    return this.memStorage.getQualityIssuesByProject(projectId);
  }

  async createQualityIssue(issue: InsertQualityIssue): Promise<QualityIssue> {
    return this.memStorage.createQualityIssue(issue);
  }

  async updateQualityIssue(id: number, updates: Partial<QualityIssue>): Promise<QualityIssue> {
    return this.memStorage.updateQualityIssue(id, updates);
  }

  async deleteQualityIssue(id: number): Promise<void> {
    return this.memStorage.deleteQualityIssue(id);
  }

  // Content Management Suite Methods
  async getAllContentCategories(): Promise<ContentCategory[]> {
    return this.memStorage.getAllContentCategories();
  }

  async getContentCategories(): Promise<ContentCategory[]> {
    return this.memStorage.getContentCategories();
  }

  async createContentCategory(category: InsertContentCategory): Promise<ContentCategory> {
    return this.memStorage.createContentCategory(category);
  }

  async getAllContentTypes(): Promise<ContentType[]> {
    return this.memStorage.getAllContentTypes();
  }

  async getContentTypes(): Promise<ContentType[]> {
    return this.memStorage.getContentTypes();
  }

  async createContentType(type: InsertContentType): Promise<ContentType> {
    return this.memStorage.createContentType(type);
  }

  async getAllContentPieces(): Promise<ContentPiece[]> {
    return this.memStorage.getAllContentPieces();
  }

  async getContentPieces(): Promise<ContentPiece[]> {
    return this.memStorage.getContentPieces();
  }

  async createContentPiece(piece: InsertContentPiece): Promise<ContentPiece> {
    return this.memStorage.createContentPiece(piece);
  }

  async updateContentPiece(id: number, updates: Partial<ContentPiece>): Promise<ContentPiece> {
    return this.memStorage.updateContentPiece(id, updates);
  }

  async getAllContentProgress(): Promise<ContentProgress[]> {
    return this.memStorage.getAllContentProgress();
  }

  async getContentProgress(): Promise<ContentProgress[]> {
    return this.memStorage.getContentProgress();
  }

  async createContentProgress(progress: InsertContentProgress): Promise<ContentProgress> {
    return this.memStorage.createContentProgress(progress);
  }

  // Placeholder implementations for other methods (keeping existing MemStorage functionality)
  private memStorage = new MemStorage();

  async getDailyEntry(date: string): Promise<DailyEntry | undefined> {
    return this.memStorage.getDailyEntry(date);
  }

  async createOrUpdateDailyEntry(entry: InsertDailyEntry): Promise<DailyEntry> {
    return this.memStorage.createOrUpdateDailyEntry(entry);
  }

  async getAllBills(): Promise<Bill[]> {
    return this.memStorage.getAllBills();
  }

  async createBill(bill: InsertBill): Promise<Bill> {
    return this.memStorage.createBill(bill);
  }

  async deleteBill(id: number): Promise<void> {
    return this.memStorage.deleteBill(id);
  }

  async getBillPaymentsForDate(date: string): Promise<BillPayment[]> {
    return this.memStorage.getBillPaymentsForDate(date);
  }

  async createBillPayment(payment: InsertBillPayment): Promise<BillPayment> {
    return this.memStorage.createBillPayment(payment);
  }

  async updateBillPayment(id: number, isPaid: boolean): Promise<BillPayment> {
    return this.memStorage.updateBillPayment(id, isPaid);
  }

  async getAllGroceryItems(): Promise<GroceryItem[]> {
    return this.memStorage.getAllGroceryItems();
  }

  async createGroceryItem(item: InsertGroceryItem): Promise<GroceryItem> {
    return this.memStorage.createGroceryItem(item);
  }

  async updateGroceryItem(id: number, updates: Partial<GroceryItem>): Promise<GroceryItem> {
    return this.memStorage.updateGroceryItem(id, updates);
  }

  async deleteGroceryItem(id: number): Promise<void> {
    return this.memStorage.deleteGroceryItem(id);
  }

  async getAllGroceryLists(): Promise<GroceryList[]> {
    return this.memStorage.getAllGroceryLists();
  }

  async createGroceryList(list: InsertGroceryList): Promise<GroceryList> {
    return this.memStorage.createGroceryList(list);
  }

  async deleteGroceryList(id: number): Promise<void> {
    return this.memStorage.deleteGroceryList(id);
  }

  async getAllHabits(): Promise<Habit[]> {
    return this.memStorage.getAllHabits();
  }

  async createHabit(habit: InsertHabit): Promise<Habit> {
    return this.memStorage.createHabit(habit);
  }

  async updateHabit(id: number, updates: Partial<Habit>): Promise<Habit> {
    return this.memStorage.updateHabit(id, updates);
  }

  async deleteHabit(id: number): Promise<void> {
    return this.memStorage.deleteHabit(id);
  }

  async getHabitLogs(habitId: number, startDate?: string, endDate?: string): Promise<HabitLog[]> {
    return this.memStorage.getHabitLogs(habitId, startDate, endDate);
  }

  async createHabitLog(log: InsertHabitLog): Promise<HabitLog> {
    return this.memStorage.createHabitLog(log);
  }

  async updateHabitLog(id: number, updates: Partial<HabitLog>): Promise<HabitLog> {
    return this.memStorage.updateHabitLog(id, updates);
  }

  async getAllMedications(): Promise<Medication[]> {
    return this.memStorage.getAllMedications();
  }

  async createMedication(medication: InsertMedication): Promise<Medication> {
    return this.memStorage.createMedication(medication);
  }

  async updateMedication(id: number, updates: Partial<Medication>): Promise<Medication> {
    return this.memStorage.updateMedication(id, updates);
  }

  async deleteMedication(id: number): Promise<void> {
    return this.memStorage.deleteMedication(id);
  }

  async getAllTodos(): Promise<Todo[]> {
    return this.memStorage.getAllTodos();
  }

  async getTodosByDate(date: string): Promise<Todo[]> {
    return this.memStorage.getTodosByDate(date);
  }

  async createTodo(todo: InsertTodo): Promise<Todo> {
    return this.memStorage.createTodo(todo);
  }

  async updateTodo(id: number, updates: Partial<Todo>): Promise<Todo> {
    return this.memStorage.updateTodo(id, updates);
  }

  async deleteTodo(id: number): Promise<void> {
    return this.memStorage.deleteTodo(id);
  }

  async getTimeBlocksByDate(date: string): Promise<TimeBlock[]> {
    return this.memStorage.getTimeBlocksByDate(date);
  }

  async createTimeBlock(timeBlock: InsertTimeBlock): Promise<TimeBlock> {
    return this.memStorage.createTimeBlock(timeBlock);
  }

  async updateTimeBlock(id: number, updates: Partial<TimeBlock>): Promise<TimeBlock> {
    return this.memStorage.updateTimeBlock(id, updates);
  }

  async deleteTimeBlock(id: number): Promise<void> {
    return this.memStorage.deleteTimeBlock(id);
  }

  async getFocusSessionsByDate(date: string): Promise<FocusSession[]> {
    return this.memStorage.getFocusSessionsByDate(date);
  }

  async createFocusSession(session: InsertFocusSession): Promise<FocusSession> {
    return this.memStorage.createFocusSession(session);
  }

  async updateFocusSession(id: number, updates: Partial<FocusSession>): Promise<FocusSession> {
    return this.memStorage.updateFocusSession(id, updates);
  }

  async getBudgetsByMonth(month: string): Promise<Budget[]> {
    return this.memStorage.getBudgetsByMonth(month);
  }

  async createBudget(budget: InsertBudget): Promise<Budget> {
    return this.memStorage.createBudget(budget);
  }

  async updateBudget(id: number, updates: Partial<Budget>): Promise<Budget> {
    return this.memStorage.updateBudget(id, updates);
  }

  async getIncomeEntriesByDateRange(startDate: string, endDate: string): Promise<IncomeEntry[]> {
    return this.memStorage.getIncomeEntriesByDateRange(startDate, endDate);
  }

  async createIncomeEntry(entry: InsertIncomeEntry): Promise<IncomeEntry> {
    return this.memStorage.createIncomeEntry(entry);
  }

  async deleteIncomeEntry(id: number): Promise<void> {
    return this.memStorage.deleteIncomeEntry(id);
  }

  async getAllChallenges(): Promise<Challenge[]> {
    return this.memStorage.getAllChallenges();
  }

  async getActiveChallenges(): Promise<Challenge[]> {
    return this.memStorage.getActiveChallenges();
  }

  async createChallenge(challenge: InsertChallenge): Promise<Challenge> {
    return this.memStorage.createChallenge(challenge);
  }

  async updateChallenge(id: number, updates: Partial<Challenge>): Promise<Challenge> {
    return this.memStorage.updateChallenge(id, updates);
  }

  async deleteChallenge(id: number): Promise<void> {
    return this.memStorage.deleteChallenge(id);
  }

  async getAllContentCategories(): Promise<ContentCategory[]> {
    return this.memStorage.getAllContentCategories();
  }

  async createContentCategory(category: InsertContentCategory): Promise<ContentCategory> {
    return this.memStorage.createContentCategory(category);
  }

  async getAllContentTypes(): Promise<ContentType[]> {
    return this.memStorage.getAllContentTypes();
  }

  async createContentType(type: InsertContentType): Promise<ContentType> {
    return this.memStorage.createContentType(type);
  }

  async getAllContentPieces(): Promise<ContentPiece[]> {
    return this.memStorage.getAllContentPieces();
  }

  async createContentPiece(piece: InsertContentPiece): Promise<ContentPiece> {
    return this.memStorage.createContentPiece(piece);
  }

  async updateContentPiece(id: number, updates: Partial<ContentPiece>): Promise<ContentPiece> {
    return this.memStorage.updateContentPiece(id, updates);
  }

  async getAllContentProgress(): Promise<ContentProgress[]> {
    return this.memStorage.getAllContentProgress();
  }

  async createContentProgress(progress: InsertContentProgress): Promise<ContentProgress> {
    return this.memStorage.createContentProgress(progress);
  }

  async getAllAppProjects(): Promise<AppProject[]> {
    return this.memStorage.getAllAppProjects();
  }

  async getAppProject(id: number): Promise<AppProject | undefined> {
    return this.memStorage.getAppProject(id);
  }

  async createAppProject(project: InsertAppProject): Promise<AppProject> {
    return this.memStorage.createAppProject(project);
  }

  async updateAppProject(id: number, updates: Partial<AppProject>): Promise<AppProject> {
    return this.memStorage.updateAppProject(id, updates);
  }

  async deleteAppProject(id: number): Promise<void> {
    return this.memStorage.deleteAppProject(id);
  }

  async getAppTasksByProject(projectId: number): Promise<AppTask[]> {
    return this.memStorage.getAppTasksByProject(projectId);
  }

  async getAllAppTasks(): Promise<AppTask[]> {
    return this.memStorage.getAllAppTasks();
  }

  async createAppTask(task: InsertAppTask): Promise<AppTask> {
    return this.memStorage.createAppTask(task);
  }

  async updateAppTask(id: number, updates: Partial<AppTask>): Promise<AppTask> {
    return this.memStorage.updateAppTask(id, updates);
  }

  async deleteAppTask(id: number): Promise<void> {
    return this.memStorage.deleteAppTask(id);
  }

  async getAppSprintsByProject(projectId: number): Promise<AppSprint[]> {
    return this.memStorage.getAppSprintsByProject(projectId);
  }

  async createAppSprint(sprint: InsertAppSprint): Promise<AppSprint> {
    return this.memStorage.createAppSprint(sprint);
  }

  async updateAppSprint(id: number, updates: Partial<AppSprint>): Promise<AppSprint> {
    return this.memStorage.updateAppSprint(id, updates);
  }

  async deleteAppSprint(id: number): Promise<void> {
    return this.memStorage.deleteAppSprint(id);
  }

  async getAppTimeEntriesByProject(projectId: number, startDate?: string, endDate?: string): Promise<AppTimeEntry[]> {
    return this.memStorage.getAppTimeEntriesByProject(projectId, startDate, endDate);
  }

  async createAppTimeEntry(entry: InsertAppTimeEntry): Promise<AppTimeEntry> {
    return this.memStorage.createAppTimeEntry(entry);
  }

  async updateAppTimeEntry(id: number, updates: Partial<AppTimeEntry>): Promise<AppTimeEntry> {
    return this.memStorage.updateAppTimeEntry(id, updates);
  }

  async deleteAppTimeEntry(id: number): Promise<void> {
    return this.memStorage.deleteAppTimeEntry(id);
  }

  async getAllMiniGameBlocks(): Promise<MiniGameBlock[]> {
    return this.memStorage.getAllMiniGameBlocks();
  }

  async createMiniGameBlock(block: InsertMiniGameBlock): Promise<MiniGameBlock> {
    return this.memStorage.createMiniGameBlock(block);
  }

  async updateMiniGameBlock(id: number, updates: Partial<MiniGameBlock>): Promise<MiniGameBlock> {
    return this.memStorage.updateMiniGameBlock(id, updates);
  }

  async deleteMiniGameBlock(id: number): Promise<void> {
    return this.memStorage.deleteMiniGameBlock(id);
  }

  async getAllMiniGameDesigns(): Promise<MiniGameDesign[]> {
    return this.memStorage.getAllMiniGameDesigns();
  }

  async getMiniGameDesignsByBlock(blockId: number): Promise<MiniGameDesign[]> {
    return this.memStorage.getMiniGameDesignsByBlock(blockId);
  }

  async createMiniGameDesign(design: InsertMiniGameDesign): Promise<MiniGameDesign> {
    return this.memStorage.createMiniGameDesign(design);
  }

  async updateMiniGameDesign(id: number, updates: Partial<MiniGameDesign>): Promise<MiniGameDesign> {
    return this.memStorage.updateMiniGameDesign(id, updates);
  }

  async deleteMiniGameDesign(id: number): Promise<void> {
    return this.memStorage.deleteMiniGameDesign(id);
  }

  async scheduleContentForMoonPhases(year: number, month: number): Promise<void> {
    return this.memStorage.scheduleContentForMoonPhases(year, month);
  }

  async getAllSocialMediaPosts(): Promise<SocialMediaPost[]> {
    return this.memStorage.getAllSocialMediaPosts();
  }

  async getSocialMediaPostsByDesign(designId: number): Promise<SocialMediaPost[]> {
    return this.memStorage.getSocialMediaPostsByDesign(designId);
  }

  async getSocialMediaPostsByDateRange(startDate: string, endDate: string): Promise<SocialMediaPost[]> {
    return this.memStorage.getSocialMediaPostsByDateRange(startDate, endDate);
  }

  async createSocialMediaPost(post: InsertSocialMediaPost): Promise<SocialMediaPost> {
    return this.memStorage.createSocialMediaPost(post);
  }

  async updateSocialMediaPost(id: number, updates: Partial<SocialMediaPost>): Promise<SocialMediaPost> {
    return this.memStorage.updateSocialMediaPost(id, updates);
  }

  async deleteSocialMediaPost(id: number): Promise<void> {
    return this.memStorage.deleteSocialMediaPost(id);
  }

  async getAllSocialMediaAnalytics(): Promise<SocialMediaAnalytics[]> {
    return this.memStorage.getAllSocialMediaAnalytics();
  }

  async getSocialMediaAnalyticsByPost(postId: number): Promise<SocialMediaAnalytics[]> {
    return this.memStorage.getSocialMediaAnalyticsByPost(postId);
  }

  async getLatestAnalyticsForPost(postId: number): Promise<SocialMediaAnalytics | undefined> {
    return this.memStorage.getLatestAnalyticsForPost(postId);
  }

  async createSocialMediaAnalytics(analytics: InsertSocialMediaAnalytics): Promise<SocialMediaAnalytics> {
    return this.memStorage.createSocialMediaAnalytics(analytics);
  }

  async updateSocialMediaAnalytics(id: number, updates: Partial<SocialMediaAnalytics>): Promise<SocialMediaAnalytics> {
    return this.memStorage.updateSocialMediaAnalytics(id, updates);
  }

  async getAllPerformanceInsights(): Promise<PerformanceInsights[]> {
    return this.memStorage.getAllPerformanceInsights();
  }

  async getPerformanceInsightsByMiniGame(miniGameBlockId: number): Promise<PerformanceInsights[]> {
    return this.memStorage.getPerformanceInsightsByMiniGame(miniGameBlockId);
  }

  async getPerformanceInsightsByPlatform(platform: string): Promise<PerformanceInsights[]> {
    return this.memStorage.getPerformanceInsightsByPlatform(platform);
  }

  async getPerformanceInsightsByDayOfWeek(dayOfWeek: string): Promise<PerformanceInsights[]> {
    return this.memStorage.getPerformanceInsightsByDayOfWeek(dayOfWeek);
  }

  async createPerformanceInsights(insights: InsertPerformanceInsights): Promise<PerformanceInsights> {
    return this.memStorage.createPerformanceInsights(insights);
  }

  async updatePerformanceInsights(id: number, updates: Partial<PerformanceInsights>): Promise<PerformanceInsights> {
    return this.memStorage.updatePerformanceInsights(id, updates);
  }

  async deletePerformanceInsights(id: number): Promise<void> {
    return this.memStorage.deletePerformanceInsights(id);
  }

  async aggregatePerformanceData(): Promise<void> {
    return this.memStorage.aggregatePerformanceData();
  }

  async getReportsAnalytics(period: string, startDate: string, endDate: string): Promise<any> {
    return this.memStorage.getReportsAnalytics(period, startDate, endDate);
  }

  async getHabitsAnalytics(startDate: string, endDate: string): Promise<any> {
    return this.memStorage.getHabitsAnalytics(startDate, endDate);
  }

  async getGoalsAnalytics(period: string, startDate: string, endDate: string): Promise<any> {
    // Use database for goals analytics
    const allGoals = await this.getAllGoals();
    const activeGoals = allGoals.filter(goal => !goal.isCompleted);
    const completedGoals = allGoals.filter(goal => goal.isCompleted);

    const goalsAnalytics = allGoals.map(goal => {
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
        total: allGoals.length,
        active: activeGoals.length,
        completed: completedGoals.length,
        onTrack: goalsAnalytics.filter(g => g.onTrack).length
      }
    };
  }

  async getHealthAnalytics(startDate: string, endDate: string): Promise<any> {
    return this.memStorage.getHealthAnalytics(startDate, endDate);
  }

  async getProductivityAnalytics(startDate: string, endDate: string): Promise<any> {
    return this.memStorage.getProductivityAnalytics(startDate, endDate);
  }

  async getPublicStats(): Promise<any> {
    return this.memStorage.getPublicStats();
  }

  async getPublicRecentContent(): Promise<any> {
    return this.memStorage.getPublicRecentContent();
  }
}

export const storage = new DatabaseStorage();