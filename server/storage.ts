import { db } from "./db";
import memoize from "memoizee";
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

// Cache frequently accessed data for 5 minutes
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export class DatabaseStorage {
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

  async createOrUpdateDailyEntry(entry: InsertDailyEntry): Promise<DailyEntry> {
    try {
      const existing = await this.getDailyEntry(entry.date);

      if (existing) {
        return await this.updateDailyEntry(entry.date, entry);
      } else {
        return await this.createDailyEntry(entry);
      }
    } catch (error) {
      console.error('Error creating/updating daily entry:', error);
      throw error;
    }
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

  // Grocery management
  async getAllGroceryLists(): Promise<GroceryList[]> {
    return await db.select().from(schema.groceryLists).orderBy(desc(schema.groceryLists.createdAt));
  }

  async createGroceryList(list: InsertGroceryList): Promise<GroceryList> {
    const [newList] = await db.insert(schema.groceryLists).values(list).returning();
    return newList;
  }

  async getGroceryItems(listId?: number): Promise<GroceryItem[]> {
    const query = db.select().from(schema.groceryItems);
    if (listId) {
      return await query.where(eq(schema.groceryItems.listId, listId));
    }
    return await query.orderBy(desc(schema.groceryItems.createdAt));
  }

  async createGroceryItem(item: InsertGroceryItem): Promise<GroceryItem> {
    const [newItem] = await db.insert(schema.groceryItems).values(item).returning();
    return newItem;
  }

  async updateGroceryItem(id: number, item: Partial<InsertGroceryItem>): Promise<GroceryItem> {
    const [updatedItem] = await db.update(schema.groceryItems)
      .set(item)
      .where(eq(schema.groceryItems.id, id))
      .returning();
    return updatedItem;
  }

  // Goals
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

  // Habits
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

  // Habit logs
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

  // Medications
  async getAllMedications(): Promise<Medication[]> {
    return await db.select().from(schema.medications).orderBy(desc(schema.medications.createdAt));
  }

  async createMedication(medication: InsertMedication): Promise<Medication> {
    const [newMedication] = await db.insert(schema.medications).values(medication).returning();
    return newMedication;
  }

  async updateMedication(id: number, medication: Partial<InsertMedication>): Promise<Medication> {
    const [updatedMedication] = await db.update(schema.medications)
      .set(medication)
      .where(eq(schema.medications.id, id))
      .returning();
    return updatedMedication;
  }

  async deleteMedication(id: number): Promise<void> {
    await db.delete(schema.medications).where(eq(schema.medications.id, id));
  }

  // Todos
  async getAllTodos(): Promise<Todo[]> {
    return await db.select().from(schema.todos).orderBy(desc(schema.todos.createdAt));
  }

  async createTodo(todo: InsertTodo): Promise<Todo> {
    const [newTodo] = await db.insert(schema.todos).values(todo).returning();
    return newTodo;
  }

  async updateTodo(id: number, todo: Partial<InsertTodo>): Promise<Todo> {
    const [updatedTodo] = await db.update(schema.todos)
      .set(todo)
      .where(eq(schema.todos.id, id))
      .returning();
    return updatedTodo;
  }

  async deleteTodo(id: number): Promise<void> {
    await db.delete(schema.todos).where(eq(schema.todos.id, id));
  }

  // Time blocks
  async getTimeBlocks(date?: string): Promise<TimeBlock[]> {
    const query = db.select().from(schema.timeBlocks);
    if (date) {
      return await query.where(eq(schema.timeBlocks.date, date));
    }
    return await query.orderBy(desc(schema.timeBlocks.createdAt));
  }

  async createTimeBlock(block: InsertTimeBlock): Promise<TimeBlock> {
    const [newBlock] = await db.insert(schema.timeBlocks).values(block).returning();
    return newBlock;
  }

  async updateTimeBlock(id: number, block: Partial<InsertTimeBlock>): Promise<TimeBlock> {
    const [updatedBlock] = await db.update(schema.timeBlocks)
      .set(block)
      .where(eq(schema.timeBlocks.id, id))
      .returning();
    return updatedBlock;
  }

  async deleteTimeBlock(id: number): Promise<void> {
    await db.delete(schema.timeBlocks).where(eq(schema.timeBlocks.id, id));
  }

  // Focus sessions
  async getAllFocusSessions(): Promise<FocusSession[]> {
    return await db.select().from(schema.focusSessions).orderBy(desc(schema.focusSessions.createdAt));
  }

  async createFocusSession(session: InsertFocusSession): Promise<FocusSession> {
    const [newSession] = await db.insert(schema.focusSessions).values(session).returning();
    return newSession;
  }

  async updateFocusSession(id: number, session: Partial<InsertFocusSession>): Promise<FocusSession> {
    const [updatedSession] = await db.update(schema.focusSessions)
      .set(session)
      .where(eq(schema.focusSessions.id, id))
      .returning();
    return updatedSession;
  }

  // Budget
  async getAllBudgets(): Promise<Budget[]> {
    return await db.select().from(schema.budgets).orderBy(desc(schema.budgets.createdAt));
  }

  async createBudget(budget: InsertBudget): Promise<Budget> {
    const [newBudget] = await db.insert(schema.budgets).values(budget).returning();
    return newBudget;
  }

  async updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget> {
    const [updatedBudget] = await db.update(schema.budgets)
      .set(budget)
      .where(eq(schema.budgets.id, id))
      .returning();
    return updatedBudget;
  }

  // Income
  async getAllIncomeEntries(): Promise<IncomeEntry[]> {
    return await db.select().from(schema.incomeEntries).orderBy(desc(schema.incomeEntries.createdAt));
  }

  async createIncomeEntry(entry: InsertIncomeEntry): Promise<IncomeEntry> {
    const [newEntry] = await db.insert(schema.incomeEntries).values(entry).returning();
    return newEntry;
  }

  // Challenges
  async getAllChallenges(): Promise<Challenge[]> {
    return await db.select().from(schema.challenges).orderBy(desc(schema.challenges.createdAt));
  }

  async createChallenge(challenge: InsertChallenge): Promise<Challenge> {
    const [newChallenge] = await db.insert(schema.challenges).values(challenge).returning();
    return newChallenge;
  }

  async updateChallenge(id: number, challenge: Partial<InsertChallenge>): Promise<Challenge> {
    const [updatedChallenge] = await db.update(schema.challenges)
      .set(challenge)
      .where(eq(schema.challenges.id, id))
      .returning();
    return updatedChallenge;
  }

  // Content management
  async getAllContentCategories(): Promise<ContentCategory[]> {
    return await db.select().from(schema.contentCategories).orderBy(desc(schema.contentCategories.createdAt));
  }

  async createContentCategory(category: InsertContentCategory): Promise<ContentCategory> {
    const [newCategory] = await db.insert(schema.contentCategories).values(category).returning();
    return newCategory;
  }

  async getAllContentTypes(): Promise<ContentType[]> {
    return await db.select().from(schema.contentTypes).orderBy(desc(schema.contentTypes.createdAt));
  }

  async createContentType(type: InsertContentType): Promise<ContentType> {
    const [newType] = await db.insert(schema.contentTypes).values(type).returning();
    return newType;
  }

  async getAllContentPieces(): Promise<ContentPiece[]> {
    return await db.select().from(schema.contentPieces).orderBy(desc(schema.contentPieces.createdAt));
  }

  async createContentPiece(piece: InsertContentPiece): Promise<ContentPiece> {
    const [newPiece] = await db.insert(schema.contentPieces).values(piece).returning();
    return newPiece;
  }

  async updateContentPiece(id: number, piece: Partial<InsertContentPiece>): Promise<ContentPiece> {
    const [updatedPiece] = await db.update(schema.contentPieces)
      .set({ ...piece, updatedAt: new Date() })
      .where(eq(schema.contentPieces.id, id))
      .returning();
    return updatedPiece;
  }

  async getContentProgress(): Promise<ContentProgress[]> {
    return await db.select().from(schema.contentProgress).orderBy(desc(schema.contentProgress.createdAt));
  }

  async createContentProgress(progress: InsertContentProgress): Promise<ContentProgress> {
    const [newProgress] = await db.insert(schema.contentProgress).values(progress).returning();
    return newProgress;
  }

  // Social media
  async getAllSocialMediaPosts(): Promise<SocialMediaPost[]> {
    return await db.select().from(schema.socialMediaPosts).orderBy(desc(schema.socialMediaPosts.createdAt));
  }

  async createSocialMediaPost(post: InsertSocialMediaPost): Promise<SocialMediaPost> {
    const [newPost] = await db.insert(schema.socialMediaPosts).values(post).returning();
    return newPost;
  }

  async updateSocialMediaPost(id: number, post: Partial<InsertSocialMediaPost>): Promise<SocialMediaPost> {
    const [updatedPost] = await db.update(schema.socialMediaPosts)
      .set({ ...post, updatedAt: new Date() })
      .where(eq(schema.socialMediaPosts.id, id))
      .returning();
    return updatedPost;
  }

  async getSocialMediaAnalytics(): Promise<SocialMediaAnalytics[]> {
    return await db.select().from(schema.socialMediaAnalytics).orderBy(desc(schema.socialMediaAnalytics.createdAt));
  }

  async createSocialMediaAnalytics(analytics: InsertSocialMediaAnalytics): Promise<SocialMediaAnalytics> {
    const [newAnalytics] = await db.insert(schema.socialMediaAnalytics).values(analytics).returning();
    return newAnalytics;
  }

  // App development
  async getAllAppProjects(): Promise<AppProject[]> {
    return await db.select().from(schema.appProjects).orderBy(desc(schema.appProjects.createdAt));
  }

  async getAppProject(id: number): Promise<AppProject | undefined> {
    const [project] = await db.select().from(schema.appProjects).where(eq(schema.appProjects.id, id));
    return project || undefined;
  }

  async createAppProject(project: InsertAppProject): Promise<AppProject> {
    const [newProject] = await db.insert(schema.appProjects).values(project).returning();
    return newProject;
  }

  async updateAppProject(id: number, project: Partial<InsertAppProject>): Promise<AppProject> {
    const [updatedProject] = await db.update(schema.appProjects)
      .set({ ...project, updatedAt: new Date() })
      .where(eq(schema.appProjects.id, id))
      .returning();
    return updatedProject;
  }

  async getAppSprints(projectId?: number): Promise<AppSprint[]> {
    const query = db.select().from(schema.appSprints);
    if (projectId) {
      return await query.where(eq(schema.appSprints.projectId, projectId));
    }
    return await query.orderBy(desc(schema.appSprints.createdAt));
  }

  async createAppSprint(sprint: InsertAppSprint): Promise<AppSprint> {
    const [newSprint] = await db.insert(schema.appSprints).values(sprint).returning();
    return newSprint;
  }


  async getAllAppTasks(): Promise<AppTask[]> {
    return await db.select().from(schema.appTasks).orderBy(desc(schema.appTasks.createdAt));
  }

  async getAppTasksByProject(projectId: number): Promise<AppTask[]> {
    return await db.select().from(schema.appTasks)
      .where(eq(schema.appTasks.projectId, projectId))
      .orderBy(desc(schema.appTasks.createdAt));
  }
  async getAppTasks(sprintId?: number): Promise<AppTask[]> {
    const query = db.select().from(schema.appTasks);
    if (sprintId) {
      return await query.orderBy(desc(schema.appTasks.createdAt));
    }
    return await query.orderBy(desc(schema.appTasks.createdAt));
  }

  async createAppTask(task: InsertAppTask): Promise<AppTask> {
    const [newTask] = await db.insert(schema.appTasks).values(task).returning();
    return newTask;
  }

  async updateAppTask(id: number, task: Partial<InsertAppTask>): Promise<AppTask> {
    const [updatedTask] = await db.update(schema.appTasks)
      .set({ ...task, updatedAt: new Date() })
      .where(eq(schema.appTasks.id, id))
      .returning();
    return updatedTask;
  }

  async getAppTimeEntries(taskId?: number): Promise<AppTimeEntry[]> {
    const query = db.select().from(schema.appTimeEntries);
    if (taskId) {
      return await query.where(eq(schema.appTimeEntries.taskId, taskId));
    }
    return await query.orderBy(desc(schema.appTimeEntries.createdAt));
  }

  async createAppTimeEntry(entry: InsertAppTimeEntry): Promise<AppTimeEntry> {
    const [newEntry] = await db.insert(schema.appTimeEntries).values(entry).returning();
    return newEntry;
  }

  async getAllAppTimeEntries(): Promise<AppTimeEntry[]> {
    return await db.select().from(schema.appTimeEntries).orderBy(desc(schema.appTimeEntries.createdAt));
  }

  async getAppTimeEntriesByProject(projectId: number, startDate?: string, endDate?: string): Promise<AppTimeEntry[]> {
    const conditions = [eq(schema.appTimeEntries.projectId, projectId)];

    if (startDate) conditions.push(gte(schema.appTimeEntries.startTime, new Date(startDate)));
    if (endDate) conditions.push(lte(schema.appTimeEntries.endTime, new Date(endDate)));

    return await db.select().from(schema.appTimeEntries)
      .where(and(...conditions))
      .orderBy(desc(schema.appTimeEntries.createdAt));
  }

  // Testing & QA
  async getAllTestCases(): Promise<TestCase[]> {
    return await db.select().from(schema.testCases).orderBy(desc(schema.testCases.createdAt));
  }

  async createTestCase(testCase: InsertTestCase): Promise<TestCase> {
    const [newTestCase] = await db.insert(schema.testCases).values(testCase).returning();
    return newTestCase;
  }

  async getAllQualityIssues(): Promise<QualityIssue[]> {
    return await db.select().from(schema.qualityIssues).orderBy(desc(schema.qualityIssues.createdAt));
  }

  async createQualityIssue(issue: InsertQualityIssue): Promise<QualityIssue> {
    const [newIssue] = await db.insert(schema.qualityIssues).values(issue).returning();
    return newIssue;
  }

  async getAllPerformanceInsights(): Promise<PerformanceInsights[]> {
    return await db.select().from(schema.performanceInsights);
  }

  async createPerformanceInsight(insight: InsertPerformanceInsights): Promise<PerformanceInsights> {
    const [newInsight] = await db.insert(schema.performanceInsights).values(insight).returning();
    return newInsight;
  }

  // Mini games
  async getAllMiniGameDesigns(): Promise<MiniGameDesign[]> {
    return await db.select().from(schema.miniGameDesigns).orderBy(desc(schema.miniGameDesigns.createdAt));
  }

  async createMiniGameDesign(design: InsertMiniGameDesign): Promise<MiniGameDesign> {
    const [newDesign] = await db.insert(schema.miniGameDesigns).values(design).returning();
    return newDesign;
  }

  async getMiniGameBlocks(designId?: number): Promise<MiniGameBlock[]> {
    return await db.select().from(schema.miniGameBlocks).orderBy(desc(schema.miniGameBlocks.createdAt));
  }

  async createMiniGameBlock(block: InsertMiniGameBlock): Promise<MiniGameBlock> {
    const [newBlock] = await db.insert(schema.miniGameBlocks).values(block).returning();
    return newBlock;
  }

  // Additional implementation methods for DatabaseStorage
  async getAllGroceryItems(): Promise<GroceryItem[]> {
    return await db.select().from(schema.groceryItems).orderBy(desc(schema.groceryItems.createdAt));
  }

  async deleteGroceryItem(id: number): Promise<void> {
    await db.delete(schema.groceryItems).where(eq(schema.groceryItems.id, id));
  }

  async getTodosByDate(date: string): Promise<Todo[]> {
    return await db.select().from(schema.todos).where(eq(schema.todos.dueDate, date));
  }

  async getTimeBlocksByDate(date: string): Promise<TimeBlock[]> {
    return await db.select().from(schema.timeBlocks).where(eq(schema.timeBlocks.date, date));
  }

  async getBillPaymentsForDate(date: string): Promise<BillPayment[]> {
    return await db.select().from(schema.billPayments).where(eq(schema.billPayments.date, date));
  }

  async updateBillPayment(id: number, isPaid: boolean): Promise<BillPayment> {
    const [updatedPayment] = await db.update(schema.billPayments)
      .set({ isPaid })
      .where(eq(schema.billPayments.id, id))
      .returning();
    return updatedPayment;
  }

  async getAllMiniGameBlocks(): Promise<MiniGameBlock[]> {
    return await db.select().from(schema.miniGameBlocks).orderBy(desc(schema.miniGameBlocks.createdAt));
  }

  async getSocialMediaPostsByDesign(designId: number): Promise<SocialMediaPost[]> {
    return await db.select().from(schema.socialMediaPosts)
      .where(eq(schema.socialMediaPosts.miniGameDesignId, designId));
  }

  async deleteSocialMediaPost(id: number): Promise<void> {
    await db.delete(schema.socialMediaPosts).where(eq(schema.socialMediaPosts.id, id));
  }

  async getTestCasesByProject(projectId: number): Promise<TestCase[]> {
    return await db.select().from(schema.testCases)
      .where(eq(schema.testCases.projectId, projectId));
  }

  async updateTestCase(id: number, testCase: Partial<InsertTestCase>): Promise<TestCase> {
    const [updated] = await db.update(schema.testCases)
      .set({ ...testCase, updatedAt: new Date() })
      .where(eq(schema.testCases.id, id))
      .returning();
    return updated;
  }

  async getQualityIssuesByProject(projectId: number): Promise<QualityIssue[]> {
    return await db.select().from(schema.qualityIssues)
      .where(eq(schema.qualityIssues.projectId, projectId));
  }

  async updateQualityIssue(id: number, issue: Partial<InsertQualityIssue>): Promise<QualityIssue> {
    const [updated] = await db.update(schema.qualityIssues)
      .set({ ...issue, updatedAt: new Date() })
      .where(eq(schema.qualityIssues.id, id))
      .returning();
    return updated;
  }

  async getAllSocialMediaAnalytics(): Promise<SocialMediaAnalytics[]> {
    return await db.select().from(schema.socialMediaAnalytics).orderBy(desc(schema.socialMediaAnalytics.createdAt));
  }

  async aggregatePerformanceData(): Promise<void> {
    // Implementation for aggregating performance data would go here
    // This is a complex operation that would analyze social media analytics
    console.log('Performance data aggregation not yet implemented for database storage');
  }

  async scheduleContentForMoonPhases(year: number, month: number): Promise<void> {
    // Implementation for moon phase scheduling would go here
    console.log('Moon phase scheduling not yet implemented for database storage');
  }

  async getContentCategories(): Promise<ContentCategory[]> {
    return this.getAllContentCategories();
  }

  async getContentTypes(): Promise<ContentType[]> {
    return this.getAllContentTypes();
  }

  async getContentPieces(): Promise<ContentPiece[]> {
    return this.getAllContentPieces();
  }

  // Reports Analytics Implementation
  async getReportsAnalytics(period: string, startDate: string, endDate: string): Promise<any> {
    const dailyEntriesResult = await db.select().from(schema.dailyEntries)
      .where(and(
        gte(schema.dailyEntries.date, startDate),
        lte(schema.dailyEntries.date, endDate)
      ));

    const goals = await this.getAllGoals();
    const habits = await this.getAllHabits();

    const totalDays = dailyEntriesResult.length;
    const avgWaterIntake = totalDays > 0 ? 
      dailyEntriesResult.reduce((sum, entry) => sum + (entry.waterIntake || 0), 0) / totalDays : 0;

    return {
      period,
      totalDays,
      avgWaterIntake: Math.round(avgWaterIntake * 10) / 10,
      goalsActive: goals.filter(g => !g.isCompleted).length,
      goalsCompleted: goals.filter(g => g.isCompleted).length,
      habitsActive: habits.filter(h => h.isActive).length,
    };
  }

  async getHabitsAnalytics(startDate: string, endDate: string): Promise<any> {
    const habits = await this.getAllHabits();
    const habitLogs = await this.getHabitLogs(undefined, startDate, endDate);

    return {
      habits: habits.map(habit => ({
        id: habit.id,
        name: habit.name,
        category: habit.category,
        currentStreak: habit.currentStreak,
        longestStreak: habit.longestStreak,
      })),
      totalLogs: habitLogs.length,
    };
  }

  async getGoalsAnalytics(period: string, startDate: string, endDate: string): Promise<any> {
    const goals = await this.getAllGoals();

    return {
      goals: goals.map(goal => ({
        id: goal.id,
        title: goal.title,
        category: goal.category,
        isCompleted: goal.isCompleted,
      })),
      summary: {
        total: goals.length,
        completed: goals.filter(g => g.isCompleted).length,
      }
    };
  }

  async getHealthAnalytics(startDate: string, endDate: string): Promise<any> {
    const dailyEntries = await db.select().from(schema.dailyEntries)
      .where(and(
        gte(schema.dailyEntries.date, startDate),
        lte(schema.dailyEntries.date, endDate)
      ));

    const totalDays = dailyEntries.length;
    if (totalDays === 0) return { totalDays: 0 };

    const avgWaterIntake = dailyEntries.reduce((sum, entry) => sum + (entry.waterIntake || 0), 0) / totalDays;
    const exerciseDays = dailyEntries.filter(entry => entry.exerciseCompleted).length;

    return {
      totalDays,
      avgWaterIntake: Math.round(avgWaterIntake * 10) / 10,
      exerciseFrequency: Math.round((exerciseDays / totalDays) * 100),
    };
  }

  async getProductivityAnalytics(startDate: string, endDate: string): Promise<any> {
    const dailyEntries = await db.select().from(schema.dailyEntries)
      .where(and(
        gte(schema.dailyEntries.date, startDate),
        lte(schema.dailyEntries.date, endDate)
      ));

    const totalDays = dailyEntries.length;
    if (totalDays === 0) return { totalDays: 0 };

    const avgWorkHours = dailyEntries.reduce((sum, entry) => 
      sum + parseFloat(entry.workHours || "0"), 0) / totalDays;

    return {
      totalDays,
      avgWorkHours: Math.round(avgWorkHours * 10) / 10,
    };
  }
}

export const storage = new DatabaseStorage();