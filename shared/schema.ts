import { pgTable, text, serial, integer, boolean, decimal, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const dailyEntries = pgTable("daily_entries", {
  id: serial("id").primaryKey(),
  date: date("date").notNull().unique(),
  // Health & Wellness
  waterIntake: integer("water_intake").default(0), // glasses of water
  exerciseCompleted: boolean("exercise_completed").default(false),
  exerciseNotes: text("exercise_notes"),
  breakfastCompleted: boolean("breakfast_completed").default(false),
  lunchCompleted: boolean("lunch_completed").default(false),
  dinnerCompleted: boolean("dinner_completed").default(false),
  napTaken: boolean("nap_taken").default(false),
  napDuration: integer("nap_duration"), // minutes
  wakeUpTime: text("wake_up_time"), // HH:MM format
  sleepHours: decimal("sleep_hours", { precision: 3, scale: 1 }), // hours with decimal
  sleepQuality: integer("sleep_quality"), // 1-5 rating
  mood: text("mood"), // happy, sad, neutral, anxious, excited, etc.
  energyLevel: integer("energy_level"), // 1-5 rating
  stressLevel: integer("stress_level"), // 1-5 rating
  symptoms: text("symptoms"), // JSON array string
  medicationsTaken: text("medications_taken"), // JSON array string
  periodFlow: text("period_flow"), // none, light, medium, heavy
  periodSymptoms: text("period_symptoms"), // JSON array string
  // Work & Screen Time
  workHours: decimal("work_hours", { precision: 3, scale: 1 }).default("0"),
  tvHours: decimal("tv_hours", { precision: 3, scale: 1 }).default("0"),
  phoneHours: decimal("phone_hours", { precision: 3, scale: 1 }).default("0"),
  focusSessionsCompleted: integer("focus_sessions_completed").default(0),
  // Finance
  cashSavings: decimal("cash_savings", { precision: 10, scale: 2 }).default("0"),
  grocerySpent: decimal("grocery_spent", { precision: 8, scale: 2 }).default("0"),
  dailyIncome: decimal("daily_income", { precision: 8, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bills = pgTable("bills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  amount: decimal("amount", { precision: 8, scale: 2 }).notNull(),
  isAutoPay: boolean("is_auto_pay").default(false),
  dueDate: integer("due_date").notNull(), // day of month
  createdAt: timestamp("created_at").defaultNow(),
});

export const billPayments = pgTable("bill_payments", {
  id: serial("id").primaryKey(),
  billId: integer("bill_id").notNull().references(() => bills.id),
  date: date("date").notNull(),
  amount: decimal("amount", { precision: 8, scale: 2 }).notNull(),
  isPaid: boolean("is_paid").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const groceryItems = pgTable("grocery_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  estimatedPrice: decimal("estimated_price", { precision: 6, scale: 2 }),
  isCompleted: boolean("is_completed").default(false),
  listId: integer("list_id").references(() => groceryLists.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const groceryLists = pgTable("grocery_lists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  isRecurring: boolean("is_recurring").default(false),
  isTemplate: boolean("is_template").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(), // health, work, finance, personal
  targetValue: decimal("target_value", { precision: 8, scale: 2 }),
  currentValue: decimal("current_value", { precision: 8, scale: 2 }).default("0"),
  unit: text("unit"), // glasses, hours, dollars, etc.
  targetDate: date("target_date"),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  targetFrequency: integer("target_frequency").default(1), // times per day
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const habitLogs = pgTable("habit_logs", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull().references(() => habits.id),
  date: date("date").notNull(),
  completed: boolean("completed").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  dosage: text("dosage"),
  frequency: text("frequency"), // daily, twice_daily, weekly, etc.
  reminderTimes: text("reminder_times"), // JSON array of times
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const todos = pgTable("todos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").default("medium"), // low, medium, high, urgent
  category: text("category"),
  dueDate: date("due_date"),
  isCompleted: boolean("is_completed").default(false),
  estimatedDuration: integer("estimated_duration"), // minutes
  actualDuration: integer("actual_duration"), // minutes
  createdAt: timestamp("created_at").defaultNow(),
});

export const timeBlocks = pgTable("time_blocks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  date: date("date").notNull(),
  startTime: text("start_time").notNull(), // HH:MM format
  endTime: text("end_time").notNull(), // HH:MM format
  category: text("category"),
  todoId: integer("todo_id").references(() => todos.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const focusSessions = pgTable("focus_sessions", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  plannedDuration: integer("planned_duration").notNull(), // minutes
  actualDuration: integer("actual_duration"), // minutes
  taskDescription: text("task_description"),
  wasSuccessful: boolean("was_successful"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  monthlyLimit: decimal("monthly_limit", { precision: 8, scale: 2 }).notNull(),
  spent: decimal("spent", { precision: 8, scale: 2 }).default("0"),
  month: text("month").notNull(), // YYYY-MM format
  createdAt: timestamp("created_at").defaultNow(),
});

export const incomeEntries = pgTable("income_entries", {
  id: serial("id").primaryKey(),
  source: text("source").notNull(),
  amount: decimal("amount", { precision: 8, scale: 2 }).notNull(),
  date: date("date").notNull(),
  category: text("category"), // salary, freelance, investment, etc.
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // daily, weekly, monthly
  targetValue: integer("target_value").notNull(),
  currentValue: integer("current_value").default(0),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  isActive: boolean("is_active").default(true),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertDailyEntrySchema = createInsertSchema(dailyEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBillSchema = createInsertSchema(bills).omit({
  id: true,
  createdAt: true,
});

export const insertBillPaymentSchema = createInsertSchema(billPayments).omit({
  id: true,
  createdAt: true,
});

export const insertGroceryItemSchema = createInsertSchema(groceryItems).omit({
  id: true,
  createdAt: true,
});

export const insertGroceryListSchema = createInsertSchema(groceryLists).omit({
  id: true,
  createdAt: true,
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  createdAt: true,
});

export const insertHabitSchema = createInsertSchema(habits).omit({
  id: true,
  createdAt: true,
});

export const insertHabitLogSchema = createInsertSchema(habitLogs).omit({
  id: true,
  createdAt: true,
});

export const insertMedicationSchema = createInsertSchema(medications).omit({
  id: true,
  createdAt: true,
});

export const insertTodoSchema = createInsertSchema(todos).omit({
  id: true,
  createdAt: true,
});

export const insertTimeBlockSchema = createInsertSchema(timeBlocks).omit({
  id: true,
  createdAt: true,
});

export const insertFocusSessionSchema = createInsertSchema(focusSessions).omit({
  id: true,
  createdAt: true,
});

export const insertBudgetSchema = createInsertSchema(budgets).omit({
  id: true,
  createdAt: true,
});

export const insertIncomeEntrySchema = createInsertSchema(incomeEntries).omit({
  id: true,
  createdAt: true,
});

export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
  createdAt: true,
});

// Type exports
export type InsertDailyEntry = z.infer<typeof insertDailyEntrySchema>;
export type DailyEntry = typeof dailyEntries.$inferSelect;

export type InsertBill = z.infer<typeof insertBillSchema>;
export type Bill = typeof bills.$inferSelect;

export type InsertBillPayment = z.infer<typeof insertBillPaymentSchema>;
export type BillPayment = typeof billPayments.$inferSelect;

export type InsertGroceryItem = z.infer<typeof insertGroceryItemSchema>;
export type GroceryItem = typeof groceryItems.$inferSelect;

export type InsertGroceryList = z.infer<typeof insertGroceryListSchema>;
export type GroceryList = typeof groceryLists.$inferSelect;

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type Habit = typeof habits.$inferSelect;

export type InsertHabitLog = z.infer<typeof insertHabitLogSchema>;
export type HabitLog = typeof habitLogs.$inferSelect;

export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type Medication = typeof medications.$inferSelect;

export type InsertTodo = z.infer<typeof insertTodoSchema>;
export type Todo = typeof todos.$inferSelect;

export type InsertTimeBlock = z.infer<typeof insertTimeBlockSchema>;
export type TimeBlock = typeof timeBlocks.$inferSelect;

export type InsertFocusSession = z.infer<typeof insertFocusSessionSchema>;
export type FocusSession = typeof focusSessions.$inferSelect;

export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type Budget = typeof budgets.$inferSelect;

export type InsertIncomeEntry = z.infer<typeof insertIncomeEntrySchema>;
export type IncomeEntry = typeof incomeEntries.$inferSelect;

export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challenges.$inferSelect;
