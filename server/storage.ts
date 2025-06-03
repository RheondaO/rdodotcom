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
}

export const storage = new MemStorage();
