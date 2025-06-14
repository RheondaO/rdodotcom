import { db } from "./db";
import { eq, desc, and, gte, lte, count, sum, avg } from "drizzle-orm";
import * as schema from "@shared/schema";
import type {
  User, InsertUser, DailyEntry, InsertDailyEntry, Bill, InsertBill,
  BillPayment, InsertBillPayment, GroceryItem, InsertGroceryItem,
  GroceryList, InsertGroceryList, Goal, InsertGoal, Habit, InsertHabit,
  HabitLog, InsertHabitLog, Medication, InsertMedication, Todo, InsertTodo,
  TimeBlock, InsertTimeBlock, FocusSession, InsertFocusSession,
  Budget, InsertBudget, IncomeEntry, InsertIncomeEntry, Challenge, InsertChallenge,
  ContentCategory, InsertContentCategory, ContentType, InsertContentType,
  ContentPiece, InsertContentPiece, ContentProgress, InsertContentProgress,
  SocialMediaPost, InsertSocialMediaPost, SocialMediaAnalytics, InsertSocialMediaAnalytics,
  AppProject, InsertAppProject, AppSprint, InsertAppSprint, AppTask, InsertAppTask,
  AppTimeEntry, InsertAppTimeEntry, TestCase, InsertTestCase, QualityIssue, InsertQualityIssue,
  PerformanceInsights, InsertPerformanceInsights, MiniGameDesign, InsertMiniGameDesign,
  MiniGameBlock, InsertMiniGameBlock
} from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Daily entries
  getDailyEntry(date: string): Promise<DailyEntry | undefined>;
  createDailyEntry(entry: InsertDailyEntry): Promise<DailyEntry>;
  updateDailyEntry(date: string, entry: Partial<InsertDailyEntry>): Promise<DailyEntry>;
  getAllDailyEntries(): Promise<DailyEntry[]>;

  // Bills
  getAllBills(): Promise<Bill[]>;
  createBill(bill: InsertBill): Promise<Bill>;
  updateBill(id: number, bill: Partial<InsertBill>): Promise<Bill>;
  deleteBill(id: number): Promise<void>;

  // Bill payments
  getBillPayments(billId?: number): Promise<BillPayment[]>;
  createBillPayment(payment: InsertBillPayment): Promise<BillPayment>;

  // Grocery management
  getAllGroceryLists(): Promise<GroceryList[]>;
  createGroceryList(list: InsertGroceryList): Promise<GroceryList>;
  getGroceryItems(listId?: number): Promise<GroceryItem[]>;
  createGroceryItem(item: InsertGroceryItem): Promise<GroceryItem>;
  updateGroceryItem(id: number, item: Partial<InsertGroceryItem>): Promise<GroceryItem>;

  // Goals
  getAllGoals(): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, goal: Partial<InsertGoal>): Promise<Goal>;
  deleteGoal(id: number): Promise<void>;

  // Habits
  getAllHabits(): Promise<Habit[]>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  updateHabit(id: number, habit: Partial<InsertHabit>): Promise<Habit>;
  deleteHabit(id: number): Promise<void>;

  // Habit logs
  getHabitLogs(habitId?: number, startDate?: string, endDate?: string): Promise<HabitLog[]>;
  createHabitLog(log: InsertHabitLog): Promise<HabitLog>;
  updateHabitLog(id: number, log: Partial<InsertHabitLog>): Promise<HabitLog>;

  // Medications
  getAllMedications(): Promise<Medication[]>;
  createMedication(medication: InsertMedication): Promise<Medication>;
  updateMedication(id: number, medication: Partial<InsertMedication>): Promise<Medication>;
  deleteMedication(id: number): Promise<void>;

  // Todos
  getAllTodos(): Promise<Todo[]>;
  createTodo(todo: InsertTodo): Promise<Todo>;
  updateTodo(id: number, todo: Partial<InsertTodo>): Promise<Todo>;
  deleteTodo(id: number): Promise<void>;

  // Time blocks
  getTimeBlocks(date?: string): Promise<TimeBlock[]>;
  createTimeBlock(block: InsertTimeBlock): Promise<TimeBlock>;
  updateTimeBlock(id: number, block: Partial<InsertTimeBlock>): Promise<TimeBlock>;
  deleteTimeBlock(id: number): Promise<void>;

  // Focus sessions
  getAllFocusSessions(): Promise<FocusSession[]>;
  createFocusSession(session: InsertFocusSession): Promise<FocusSession>;
  updateFocusSession(id: number, session: Partial<InsertFocusSession>): Promise<FocusSession>;

  // Budget
  getAllBudgets(): Promise<Budget[]>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget>;

  // Income
  getAllIncomeEntries(): Promise<IncomeEntry[]>;
  createIncomeEntry(entry: InsertIncomeEntry): Promise<IncomeEntry>;

  // Challenges
  getAllChallenges(): Promise<Challenge[]>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  updateChallenge(id: number, challenge: Partial<InsertChallenge>): Promise<Challenge>;

  // Content management
  getAllContentCategories(): Promise<ContentCategory[]>;
  createContentCategory(category: InsertContentCategory): Promise<ContentCategory>;
  getAllContentTypes(): Promise<ContentType[]>;
  createContentType(type: InsertContentType): Promise<ContentType>;
  getAllContentPieces(): Promise<ContentPiece[]>;
  createContentPiece(piece: InsertContentPiece): Promise<ContentPiece>;
  updateContentPiece(id: number, piece: Partial<InsertContentPiece>): Promise<ContentPiece>;
  getContentProgress(): Promise<ContentProgress[]>;
  createContentProgress(progress: InsertContentProgress): Promise<ContentProgress>;

  // Social media
  getAllSocialMediaPosts(): Promise<SocialMediaPost[]>;
  createSocialMediaPost(post: InsertSocialMediaPost): Promise<SocialMediaPost>;
  updateSocialMediaPost(id: number, post: Partial<InsertSocialMediaPost>): Promise<SocialMediaPost>;
  getSocialMediaAnalytics(): Promise<SocialMediaAnalytics[]>;
  createSocialMediaAnalytics(analytics: InsertSocialMediaAnalytics): Promise<SocialMediaAnalytics>;

  // App development
  getAllAppProjects(): Promise<AppProject[]>;
  getAppProject(id: number): Promise<AppProject | undefined>;
  createAppProject(project: InsertAppProject): Promise<AppProject>;
  updateAppProject(id: number, project: Partial<InsertAppProject>): Promise<AppProject>;
  getAppSprints(projectId?: number): Promise<AppSprint[]>;
  createAppSprint(sprint: InsertAppSprint): Promise<AppSprint>;
  getAppTasks(sprintId?: number): Promise<AppTask[]>;
  createAppTask(task: InsertAppTask): Promise<AppTask>;
  updateAppTask(id: number, task: Partial<InsertAppTask>): Promise<AppTask>;
  getAppTimeEntries(taskId?: number): Promise<AppTimeEntry[]>;
  createAppTimeEntry(entry: InsertAppTimeEntry): Promise<AppTimeEntry>;
  getAllTestCases(): Promise<TestCase[]>;
  createTestCase(testCase: InsertTestCase): Promise<TestCase>;
  getAllQualityIssues(): Promise<QualityIssue[]>;
  createQualityIssue(issue: InsertQualityIssue): Promise<QualityIssue>;
  getAllPerformanceInsights(): Promise<PerformanceInsights[]>;
  createPerformanceInsight(insight: InsertPerformanceInsights): Promise<PerformanceInsights>;

  // Mini games
  getAllMiniGameDesigns(): Promise<MiniGameDesign[]>;
  createMiniGameDesign(design: InsertMiniGameDesign): Promise<MiniGameDesign>;
  getMiniGameBlocks(designId?: number): Promise<MiniGameBlock[]>;
  createMiniGameBlock(block: InsertMiniGameBlock): Promise<MiniGameBlock>;

  // Public stats
  getPublicStats(): Promise<any>;
  getPublicRecentContent(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User management
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(schema.users).values(user).returning();
    return newUser;
  }

  // Daily entries
  async getDailyEntry(date: string): Promise<DailyEntry | undefined> {
    const [entry] = await db.select().from(schema.dailyEntries).where(eq(schema.dailyEntries.date, date));
    return entry || undefined;
  }

  async createDailyEntry(entry: InsertDailyEntry): Promise<DailyEntry> {
    const [newEntry] = await db.insert(schema.dailyEntries).values(entry).returning();
    return newEntry;
  }

  async updateDailyEntry(date: string, entry: Partial<InsertDailyEntry>): Promise<DailyEntry> {
    const [updatedEntry] = await db.update(schema.dailyEntries)
      .set({ ...entry, updatedAt: new Date() })
      .where(eq(schema.dailyEntries.date, date))
      .returning();
    return updatedEntry;
  }

  async getAllDailyEntries(): Promise<DailyEntry[]> {
    return await db.select().from(schema.dailyEntries).orderBy(desc(schema.dailyEntries.date));
  }

  // Bills
  async getAllBills(): Promise<Bill[]> {
    return await db.select().from(schema.bills).orderBy(schema.bills.dueDate);
  }

  async createBill(bill: InsertBill): Promise<Bill> {
    const [newBill] = await db.insert(schema.bills).values(bill).returning();
    return newBill;
  }

  async updateBill(id: number, bill: Partial<InsertBill>): Promise<Bill> {
    const [updatedBill] = await db.update(schema.bills)
      .set(bill)
      .where(eq(schema.bills.id, id))
      .returning();
    return updatedBill;
  }

  async deleteBill(id: number): Promise<void> {
    await db.delete(schema.bills).where(eq(schema.bills.id, id));
  }

  // Bill payments
  async getBillPayments(billId?: number): Promise<BillPayment[]> {
    const query = db.select().from(schema.billPayments);
    if (billId) {
      return await query.where(eq(schema.billPayments.billId, billId)).orderBy(desc(schema.billPayments.date));
    }
    return await query.orderBy(desc(schema.billPayments.date));
  }

  async createBillPayment(payment: InsertBillPayment): Promise<BillPayment> {
    const [newPayment] = await db.insert(schema.billPayments).values(payment).returning();
    return newPayment;
  }

  // Continue with remaining methods...
  async getAllGoals(): Promise<Goal[]> {
    return await db.select().from(schema.goals).orderBy(desc(schema.goals.createdAt));
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const [newGoal] = await db.insert(schema.goals).values(goal).returning();
    return newGoal;
  }

  async updateGoal(id: number, goal: Partial<InsertGoal>): Promise<Goal> {
    const [updatedGoal] = await db.update(schema.goals)
      .set(goal)
      .where(eq(schema.goals.id, id))
      .returning();
    return updatedGoal;
  }

  async deleteGoal(id: number): Promise<void> {
    await db.delete(schema.goals).where(eq(schema.goals.id, id));
  }

  async getAllHabits(): Promise<Habit[]> {
    return await db.select().from(schema.habits).orderBy(desc(schema.habits.createdAt));
  }

  async createHabit(habit: InsertHabit): Promise<Habit> {
    const [newHabit] = await db.insert(schema.habits).values(habit).returning();
    return newHabit;
  }

  async updateHabit(id: number, habit: Partial<InsertHabit>): Promise<Habit> {
    const [updatedHabit] = await db.update(schema.habits)
      .set(habit)
      .where(eq(schema.habits.id, id))
      .returning();
    return updatedHabit;
  }

  async deleteHabit(id: number): Promise<void> {
    await db.delete(schema.habits).where(eq(schema.habits.id, id));
  }

  async getHabitLogs(habitId?: number, startDate?: string, endDate?: string): Promise<HabitLog[]> {
    const conditions = [];
    
    if (habitId) conditions.push(eq(schema.habitLogs.habitId, habitId));
    if (startDate) conditions.push(gte(schema.habitLogs.date, startDate));
    if (endDate) conditions.push(lte(schema.habitLogs.date, endDate));
    
    if (conditions.length > 0) {
      return await db.select().from(schema.habitLogs)
        .where(and(...conditions))
        .orderBy(desc(schema.habitLogs.date));
    }
    
    return await db.select().from(schema.habitLogs).orderBy(desc(schema.habitLogs.date));
  }

  async createHabitLog(log: InsertHabitLog): Promise<HabitLog> {
    const [newLog] = await db.insert(schema.habitLogs).values(log).returning();
    return newLog;
  }

  async updateHabitLog(id: number, log: Partial<InsertHabitLog>): Promise<HabitLog> {
    const [updatedLog] = await db.update(schema.habitLogs)
      .set(log)
      .where(eq(schema.habitLogs.id, id))
      .returning();
    return updatedLog;
  }

  // Enhanced analytics with comprehensive real data calculations
  async getPublicStats(): Promise<any> {
    try {
      // Goal analytics - separate queries for accurate counts
      const [totalGoals] = await db.select({ count: count() }).from(schema.goals);
      const [completedGoals] = await db.select({ count: count() })
        .from(schema.goals)
        .where(eq(schema.goals.isCompleted, true));

      // Habit analytics - separate queries for accurate counts
      const [totalHabits] = await db.select({ count: count() }).from(schema.habits);
      const [activeHabits] = await db.select({ count: count() })
        .from(schema.habits)
        .where(eq(schema.habits.isActive, true));

      // Focus session analytics
      const [focusStats] = await db.select({
        totalFocusSessions: count(),
        avgFocusTime: avg(schema.focusSessions.actualDuration),
      }).from(schema.focusSessions);

      // Daily entry wellness metrics
      const [wellnessStats] = await db.select({
        avgSleepQuality: avg(schema.dailyEntries.sleepQuality),
        avgEnergyLevel: avg(schema.dailyEntries.energyLevel),
        avgStressLevel: avg(schema.dailyEntries.stressLevel),
        totalWaterIntake: sum(schema.dailyEntries.waterIntake),
      }).from(schema.dailyEntries);

      // Recent activity analytics
      const [recentStats] = await db.select({
        recentEntries: count(),
      }).from(schema.dailyEntries)
        .where(gte(schema.dailyEntries.date, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]));

      // Calculate health wellness score from real data with proper type conversion
      const sleepQualityNum = parseFloat(String(wellnessStats?.avgSleepQuality || 0));
      const energyLevelNum = parseFloat(String(wellnessStats?.avgEnergyLevel || 0));
      const stressLevelNum = parseFloat(String(wellnessStats?.avgStressLevel || 5));
      const healthScore = Math.round(((sleepQualityNum + energyLevelNum + (6 - stressLevelNum)) / 15) * 100);

      return {
        totalGoals: totalGoals?.count || 0,
        completedGoals: completedGoals?.count || 0,
        totalHabits: totalHabits?.count || 0,
        activeHabits: activeHabits?.count || 0,
        totalFocusSessions: focusStats?.totalFocusSessions || 0,
        avgFocusTime: Math.round(parseFloat(String(focusStats?.avgFocusTime || 0))),
        healthWellnessScore: Math.max(0, Math.min(100, healthScore)),
        avgSleepQuality: Math.round(sleepQualityNum * 10) / 10,
        avgEnergyLevel: Math.round(energyLevelNum * 10) / 10,
        avgStressLevel: Math.round(stressLevelNum * 10) / 10,
        totalWaterIntake: parseFloat(String(wellnessStats?.totalWaterIntake || 0)),
        recentActivityDays: recentStats?.recentEntries || 0,
      };
    } catch (error) {
      console.error('Error calculating public stats:', error);
      // Return minimal stats if database queries fail
      return {
        totalGoals: 0,
        completedGoals: 0,
        totalHabits: 0,
        activeHabits: 0,
        totalFocusSessions: 0,
        avgFocusTime: 0,
        healthWellnessScore: 0,
        avgSleepQuality: 0,
        avgEnergyLevel: 0,
        avgStressLevel: 0,
        totalWaterIntake: 0,
        recentActivityDays: 0,
      };
    }
  }

  async getPublicRecentContent(): Promise<any> {
    return await db.select().from(schema.contentPieces)
      .where(eq(schema.contentPieces.status, 'published'))
      .orderBy(desc(schema.contentPieces.publishedDate))
      .limit(5);
  }

  // Placeholder implementations for remaining methods
  async getAllGroceryLists(): Promise<GroceryList[]> { return []; }
  async createGroceryList(list: InsertGroceryList): Promise<GroceryList> { throw new Error('Not implemented'); }
  async getGroceryItems(listId?: number): Promise<GroceryItem[]> { return []; }
  async createGroceryItem(item: InsertGroceryItem): Promise<GroceryItem> { throw new Error('Not implemented'); }
  async updateGroceryItem(id: number, item: Partial<InsertGroceryItem>): Promise<GroceryItem> { throw new Error('Not implemented'); }
  async getAllMedications(): Promise<Medication[]> { return []; }
  async createMedication(medication: InsertMedication): Promise<Medication> { throw new Error('Not implemented'); }
  async updateMedication(id: number, medication: Partial<InsertMedication>): Promise<Medication> { throw new Error('Not implemented'); }
  async deleteMedication(id: number): Promise<void> { }
  async getAllTodos(): Promise<Todo[]> { return []; }
  async createTodo(todo: InsertTodo): Promise<Todo> { throw new Error('Not implemented'); }
  async updateTodo(id: number, todo: Partial<InsertTodo>): Promise<Todo> { throw new Error('Not implemented'); }
  async deleteTodo(id: number): Promise<void> { }
  async getTimeBlocks(date?: string): Promise<TimeBlock[]> { return []; }
  async createTimeBlock(block: InsertTimeBlock): Promise<TimeBlock> { throw new Error('Not implemented'); }
  async updateTimeBlock(id: number, block: Partial<InsertTimeBlock>): Promise<TimeBlock> { throw new Error('Not implemented'); }
  async deleteTimeBlock(id: number): Promise<void> { }
  async getAllFocusSessions(): Promise<FocusSession[]> { return []; }
  async createFocusSession(session: InsertFocusSession): Promise<FocusSession> { throw new Error('Not implemented'); }
  async updateFocusSession(id: number, session: Partial<InsertFocusSession>): Promise<FocusSession> { throw new Error('Not implemented'); }
  async getAllBudgets(): Promise<Budget[]> { return []; }
  async createBudget(budget: InsertBudget): Promise<Budget> { throw new Error('Not implemented'); }
  async updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget> { throw new Error('Not implemented'); }
  async getAllIncomeEntries(): Promise<IncomeEntry[]> { return []; }
  async createIncomeEntry(entry: InsertIncomeEntry): Promise<IncomeEntry> { throw new Error('Not implemented'); }
  async getAllChallenges(): Promise<Challenge[]> { return []; }
  async createChallenge(challenge: InsertChallenge): Promise<Challenge> { throw new Error('Not implemented'); }
  async updateChallenge(id: number, challenge: Partial<InsertChallenge>): Promise<Challenge> { throw new Error('Not implemented'); }
  async getAllContentCategories(): Promise<ContentCategory[]> { return []; }
  async createContentCategory(category: InsertContentCategory): Promise<ContentCategory> { throw new Error('Not implemented'); }
  async getAllContentTypes(): Promise<ContentType[]> { return []; }
  async createContentType(type: InsertContentType): Promise<ContentType> { throw new Error('Not implemented'); }
  async getAllContentPieces(): Promise<ContentPiece[]> { return []; }
  async createContentPiece(piece: InsertContentPiece): Promise<ContentPiece> { throw new Error('Not implemented'); }
  async updateContentPiece(id: number, piece: Partial<InsertContentPiece>): Promise<ContentPiece> { throw new Error('Not implemented'); }
  async getContentProgress(): Promise<ContentProgress[]> { return []; }
  async createContentProgress(progress: InsertContentProgress): Promise<ContentProgress> { throw new Error('Not implemented'); }
  async getAllSocialMediaPosts(): Promise<SocialMediaPost[]> { return []; }
  async createSocialMediaPost(post: InsertSocialMediaPost): Promise<SocialMediaPost> { throw new Error('Not implemented'); }
  async updateSocialMediaPost(id: number, post: Partial<InsertSocialMediaPost>): Promise<SocialMediaPost> { throw new Error('Not implemented'); }
  async getSocialMediaAnalytics(): Promise<SocialMediaAnalytics[]> { return []; }
  async createSocialMediaAnalytics(analytics: InsertSocialMediaAnalytics): Promise<SocialMediaAnalytics> { throw new Error('Not implemented'); }
  async getAllAppProjects(): Promise<AppProject[]> { return []; }
  async getAppProject(id: number): Promise<AppProject | undefined> { return undefined; }
  async createAppProject(project: InsertAppProject): Promise<AppProject> { throw new Error('Not implemented'); }
  async updateAppProject(id: number, project: Partial<InsertAppProject>): Promise<AppProject> { throw new Error('Not implemented'); }
  async getAppSprints(projectId?: number): Promise<AppSprint[]> { return []; }
  async createAppSprint(sprint: InsertAppSprint): Promise<AppSprint> { throw new Error('Not implemented'); }
  async getAppTasks(sprintId?: number): Promise<AppTask[]> { return []; }
  async createAppTask(task: InsertAppTask): Promise<AppTask> { throw new Error('Not implemented'); }
  async updateAppTask(id: number, task: Partial<InsertAppTask>): Promise<AppTask> { throw new Error('Not implemented'); }
  async getAppTimeEntries(taskId?: number): Promise<AppTimeEntry[]> { return []; }
  async createAppTimeEntry(entry: InsertAppTimeEntry): Promise<AppTimeEntry> { throw new Error('Not implemented'); }
  async getAllTestCases(): Promise<TestCase[]> { return []; }
  async createTestCase(testCase: InsertTestCase): Promise<TestCase> { throw new Error('Not implemented'); }
  async getAllQualityIssues(): Promise<QualityIssue[]> { return []; }
  async createQualityIssue(issue: InsertQualityIssue): Promise<QualityIssue> { throw new Error('Not implemented'); }
  async getAllPerformanceInsights(): Promise<PerformanceInsights[]> { return []; }
  async createPerformanceInsight(insight: InsertPerformanceInsights): Promise<PerformanceInsights> { throw new Error('Not implemented'); }
  async getAllMiniGameDesigns(): Promise<MiniGameDesign[]> { return []; }
  async createMiniGameDesign(design: InsertMiniGameDesign): Promise<MiniGameDesign> { throw new Error('Not implemented'); }
  async getMiniGameBlocks(designId?: number): Promise<MiniGameBlock[]> { return []; }
  async createMiniGameBlock(block: InsertMiniGameBlock): Promise<MiniGameBlock> { throw new Error('Not implemented'); }
}

export const storage = new DatabaseStorage();