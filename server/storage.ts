import { 
  dailyEntries, 
  bills, 
  billPayments, 
  groceryItems,
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
  type InsertAppTimeEntry
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
        waterIntake: entry.waterIntake || 0,
        exerciseCompleted: entry.exerciseCompleted || false,
        breakfastCompleted: entry.breakfastCompleted || false,
        lunchCompleted: entry.lunchCompleted || false,
        dinnerCompleted: entry.dinnerCompleted || false,
        napTaken: entry.napTaken || false,
        workHours: entry.workHours || "0",
        tvHours: entry.tvHours || "0",
        phoneHours: entry.phoneHours || "0",
        cashSavings: entry.cashSavings || "0",
        grocerySpent: entry.grocerySpent || "0",
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
      createdAt: new Date()
    };
    this.appProjects.set(newProject.id, newProject);
    return newProject;
  }

  async updateAppProject(id: number, updates: Partial<AppProject>): Promise<AppProject> {
    const project = this.appProjects.get(id);
    if (!project) {
      throw new Error("App project not found");
    }

    const updated = { ...project, ...updates };
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
      createdAt: new Date()
    };
    this.appTasks.set(newTask.id, newTask);
    return newTask;
  }

  async updateAppTask(id: number, updates: Partial<AppTask>): Promise<AppTask> {
    const task = this.appTasks.get(id);
    if (!task) {
      throw new Error("App task not found");
    }

    const updated = { ...task, ...updates };
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
      createdAt: new Date()
    };
    this.appSprints.set(newSprint.id, newSprint);
    return newSprint;
  }

  async updateAppSprint(id: number, updates: Partial<AppSprint>): Promise<AppSprint> {
    const sprint = this.appSprints.get(id);
    if (!sprint) {
      throw new Error("App sprint not found");
    }

    const updated = { ...sprint, ...updates };
    this.appSprints.set(id, updated);
    return updated;
  }

  async deleteAppSprint(id: number): Promise<void> {
    this.appSprints.delete(id);
  }

  async getAppTimeEntriesByProject(projectId: number, startDate?: string, endDate?: string): Promise<AppTimeEntry[]> {
    const entries = Array.from(this.appTimeEntries.values()).filter(entry => entry.projectId === projectId);

    if (startDate && endDate) {
      return entries.filter(entry => entry.startTime >= startDate && entry.endTime <= endDate);
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
      createdAt: new Date()
    };
    this.groceryLists.set(newList.id, newList);
    return newList;
  }

  async deleteGroceryList(id: number): Promise<void> {
    this.groceryLists.delete(id);
  }

  // Content Categories methods
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

  // Content Types methods
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

  // Content Pieces methods
  async getAllContentPieces(): Promise<ContentPiece[]> {
    return Array.from(this.contentPieces.values());
  }

  async createContentPiece(piece: InsertContentPiece): Promise<ContentPiece> {
    const newPiece: ContentPiece = {
      id: this.currentId++,
      ...piece,
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

  async createContentProgress(progress: InsertContentProgress): Promise<ContentProgress> {
    const newProgress: ContentProgress = {
      id: this.currentId++,
      ...progress,
      createdAt: new Date()
    };
    this.contentProgress.set(newProgress.id, newProgress);
    return newProgress;
  }
}

export const storage = new MemStorage();