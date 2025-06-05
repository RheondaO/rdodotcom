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
  // Habits (date-specific completion tracking)
  habitCompletions: text("habit_completions"), // JSON string of habit IDs that were completed
  // Tasks (date-specific todo items)
  todoItems: text("todo_items"), // JSON string of todo items for this date
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

// Content Creation System
export const contentCategories = pgTable("content_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").default("#8B5CF6"), // hex color for theming
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contentTypes = pgTable("content_types", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull().references(() => contentCategories.id),
  name: text("name").notNull(),
  description: text("description"),
  frequency: text("frequency").notNull(), // monthly, yearly, custom
  targetCount: integer("target_count").notNull(), // how many per frequency period
  isRecurring: boolean("is_recurring").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contentPieces = pgTable("content_pieces", {
  id: serial("id").primaryKey(),
  contentTypeId: integer("content_type_id").notNull().references(() => contentTypes.id),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("draft"), // draft, review, approved, scheduled, published
  targetDate: date("target_date"),
  scheduledDate: date("scheduled_date"),
  publishedDate: date("published_date"),
  notes: text("notes"),
  priority: text("priority").default("medium"), // low, medium, high, urgent
  estimatedDuration: integer("estimated_duration"), // minutes to complete
  actualDuration: integer("actual_duration"), // actual time spent
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contentProgress = pgTable("content_progress", {
  id: serial("id").primaryKey(),
  contentPieceId: integer("content_piece_id").notNull().references(() => contentPieces.id),
  phase: text("phase").notNull(), // research, draft, edit, review, final
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Mini-Game Block Management
export const miniGameBlocks = pgTable("mini_game_blocks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  frequency: text("frequency").notNull(), // weekly, monthly, lunar_full, lunar_new, etc.
  frequencyValue: integer("frequency_value").notNull(), // Number of times per year
  color: text("color").default("#8B5CF6"),
  category: text("category").default("engagement"), // engagement, astrological, wellness, etc.
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const miniGameDesigns = pgTable("mini_game_designs", {
  id: serial("id").primaryKey(),
  miniGameBlockId: integer("mini_game_block_id").notNull().references(() => miniGameBlocks.id),
  title: text("title").notNull(),
  description: text("description"),
  designNotes: text("design_notes"), // Visual elements, colors, interactions
  status: text("status").default("designed"), // designed, reviewed, approved, archived
  targetDate: date("target_date"),
  designedDate: date("designed_date"),
  reviewedDate: date("reviewed_date"),
  approvedDate: date("approved_date"),
  version: integer("version").default(1),
  isTemplate: boolean("is_template").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// App Development Tables
export const appProjects = pgTable("app_projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  status: text("status").notNull().default("planning"), // planning, in_progress, testing, deployed, on_hold
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  projectType: text("project_type").notNull().default("web"), // web, mobile, desktop, api
  repositoryUrl: text("repository_url"),
  deploymentUrl: text("deployment_url"),
  targetDate: timestamp("target_date"),
  startDate: timestamp("start_date"),
  completedDate: timestamp("completed_date"),
  progress: integer("progress").notNull().default(0), // 0-100
  estimatedHours: integer("estimated_hours"),
  actualHours: integer("actual_hours").default(0),
  techStack: text("tech_stack").array().notNull().default([]),
  tags: text("tags").array().notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const appTasks = pgTable("app_tasks", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => appProjects.id),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  status: text("status").notNull().default("todo"), // todo, in_progress, review, testing, done
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  category: text("category").notNull().default("feature"), // feature, bug, improvement, documentation
  assignee: text("assignee"), // for team projects
  estimatedHours: integer("estimated_hours"),
  actualHours: integer("actual_hours").default(0),
  dueDate: timestamp("due_date"),
  completedDate: timestamp("completed_date"),
  dependencies: text("dependencies").array().notNull().default([]), // task IDs that must be completed first
  tags: text("tags").array().notNull().default([]),
  attachments: text("attachments").array().notNull().default([]),
  comments: text("comments").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const appSprints = pgTable("app_sprints", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => appProjects.id),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  status: text("status").notNull().default("planning"), // planning, active, completed
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  goal: text("goal").notNull().default(""),
  velocity: integer("velocity").default(0), // story points completed
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const appTimeEntries = pgTable("app_time_entries", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => appProjects.id),
  taskId: integer("task_id").references(() => appTasks.id),
  description: text("description").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration").notNull().default(0), // in minutes
  date: timestamp("date").notNull(),
  billable: boolean("billable").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Social Media Posts Table
export const socialMediaPosts = pgTable("social_media_posts", {
  id: serial("id").primaryKey(),
  miniGameDesignId: integer("mini_game_design_id").notNull().references(() => miniGameDesigns.id),
  platform: text("platform").notNull(), // 'instagram', 'tiktok', 'facebook', 'twitter', etc.
  postUrl: text("post_url"),
  scheduledDate: timestamp("scheduled_date").notNull(),
  publishedDate: timestamp("published_date"),
  dayOfWeek: text("day_of_week").notNull(), // 'monday', 'tuesday', etc.
  timeSlot: text("time_slot").notNull(), // 'morning', 'afternoon', 'evening'
  postType: text("post_type").notNull(), // 'image', 'video', 'carousel', 'reel', 'story'
  caption: text("caption"),
  hashtags: text("hashtags").array().default([]),
  status: text("status").notNull().default("scheduled"), // 'scheduled', 'published', 'failed', 'archived'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Social Media Analytics Table
export const socialMediaAnalytics = pgTable("social_media_analytics", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => socialMediaPosts.id),
  impressions: integer("impressions").notNull().default(0),
  reach: integer("reach").notNull().default(0),
  likes: integer("likes").notNull().default(0),
  comments: integer("comments").notNull().default(0),
  shares: integer("shares").notNull().default(0),
  saves: integer("saves").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  profileViews: integer("profile_views").notNull().default(0),
  engagementRate: integer("engagement_rate").notNull().default(0), // stored as percentage * 100
  recordedAt: timestamp("recorded_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Performance Insights Table for aggregated analytics
export const performanceInsights = pgTable("performance_insights", {
  id: serial("id").primaryKey(),
  miniGameBlockId: integer("mini_game_block_id").notNull().references(() => miniGameBlocks.id),
  platform: text("platform").notNull(),
  dayOfWeek: text("day_of_week").notNull(),
  timeSlot: text("time_slot").notNull(),
  postType: text("post_type").notNull(),
  avgImpressions: integer("avg_impressions").notNull().default(0),
  avgReach: integer("avg_reach").notNull().default(0),
  avgLikes: integer("avg_likes").notNull().default(0),
  avgComments: integer("avg_comments").notNull().default(0),
  avgShares: integer("avg_shares").notNull().default(0),
  avgEngagementRate: integer("avg_engagement_rate").notNull().default(0), // stored as percentage * 100
  totalPosts: integer("total_posts").notNull().default(0),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
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

export const insertContentCategorySchema = createInsertSchema(contentCategories).omit({
  id: true,
  createdAt: true,
});

export const insertContentTypeSchema = createInsertSchema(contentTypes).omit({
  id: true,
  createdAt: true,
});

export const insertContentPieceSchema = createInsertSchema(contentPieces).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContentProgressSchema = createInsertSchema(contentProgress).omit({
  id: true,
  createdAt: true,
});

export const insertMiniGameBlockSchema = createInsertSchema(miniGameBlocks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMiniGameDesignSchema = createInsertSchema(miniGameDesigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAppProjectSchema = createInsertSchema(appProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAppTaskSchema = createInsertSchema(appTasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAppSprintSchema = createInsertSchema(appSprints).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAppTimeEntrySchema = createInsertSchema(appTimeEntries).omit({
  id: true,
  createdAt: true,
});

export const insertSocialMediaPostSchema = createInsertSchema(socialMediaPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSocialMediaAnalyticsSchema = createInsertSchema(socialMediaAnalytics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPerformanceInsightsSchema = createInsertSchema(performanceInsights).omit({
  id: true,
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

export type InsertContentCategory = z.infer<typeof insertContentCategorySchema>;
export type ContentCategory = typeof contentCategories.$inferSelect;

export type InsertContentType = z.infer<typeof insertContentTypeSchema>;
export type ContentType = typeof contentTypes.$inferSelect;

export type InsertContentPiece = z.infer<typeof insertContentPieceSchema>;
export type ContentPiece = typeof contentPieces.$inferSelect;

export type InsertContentProgress = z.infer<typeof insertContentProgressSchema>;
export type ContentProgress = typeof contentProgress.$inferSelect;

export type InsertMiniGameBlock = z.infer<typeof insertMiniGameBlockSchema>;
export type MiniGameBlock = typeof miniGameBlocks.$inferSelect;

export type InsertMiniGameDesign = z.infer<typeof insertMiniGameDesignSchema>;
export type MiniGameDesign = typeof miniGameDesigns.$inferSelect;

export type InsertAppProject = z.infer<typeof insertAppProjectSchema>;
export type AppProject = typeof appProjects.$inferSelect;

export type InsertAppTask = z.infer<typeof insertAppTaskSchema>;
export type AppTask = typeof appTasks.$inferSelect;

export type InsertAppSprint = z.infer<typeof insertAppSprintSchema>;
export type AppSprint = typeof appSprints.$inferSelect;

export type InsertAppTimeEntry = z.infer<typeof insertAppTimeEntrySchema>;
export type AppTimeEntry = typeof appTimeEntries.$inferSelect;
