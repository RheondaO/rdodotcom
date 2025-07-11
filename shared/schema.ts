import { z } from "zod";

// Type definitions for data models (no database tables)
export interface DailyEntry {
  id: number;
  date: string;
  // Health & Wellness
  waterIntake?: number; // glasses of water
  exerciseCompleted?: boolean;
  exerciseNotes?: string;
  breakfastCompleted?: boolean;
  lunchCompleted?: boolean;
  dinnerCompleted?: boolean;
  napTaken?: boolean;
  napDuration?: number; // minutes
  wakeUpTime?: string; // HH:MM format
  sleepHours?: string; // hours with decimal
  sleepQuality?: number; // 1-5 rating
  mood?: string; // happy, sad, neutral, anxious, excited, etc.
  energyLevel?: number; // 1-5 rating
  stressLevel?: number; // 1-5 rating
  symptoms?: string; // JSON array string
  medicationsTaken?: string; // JSON array string
  periodFlow?: string; // none, light, medium, heavy
  periodSymptoms?: string; // JSON array string
  // Work & Screen Time
  workHours?: string;
  tvHours?: string;
  phoneHours?: string;
  focusSessionsCompleted?: number;
  // Finance
  cashSavings?: string;
  grocerySpent?: string;
  dailyIncome?: string;
  // Habits (date-specific completion tracking)
  habitCompletions?: string; // JSON string of habit IDs that were completed
  // Tasks (date-specific todo items)
  todoItems?: string; // JSON string of todo items for this date
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Bill {
  id: number;
  name: string;
  amount: string;
  isAutoPay?: boolean;
  dueDate: number; // day of month
  createdAt?: Date;
}

export interface BillPayment {
  id: number;
  billId: number;
  date: string;
  amount: string;
  isPaid?: boolean;
  createdAt?: Date;
}

export interface GroceryItem {
  id: number;
  name: string;
  estimatedPrice?: string;
  isCompleted?: boolean;
  listId?: number;
  createdAt?: Date;
}

export interface GroceryList {
  id: number;
  name: string;
  isRecurring?: boolean;
  isTemplate?: boolean;
  createdAt?: Date;
}

export interface Goal {
  id: number;
  title: string;
  description?: string;
  category: string; // health, work, finance, personal
  targetValue?: string;
  currentValue?: string;
  unit?: string; // glasses, hours, dollars, etc.
  targetDate?: string;
  isCompleted?: boolean;
  createdAt?: Date;
}

export interface Habit {
  id: number;
  name: string;
  description?: string;
  category: string;
  targetFrequency?: number; // times per day
  currentStreak?: number;
  longestStreak?: number;
  isActive?: boolean;
  createdAt?: Date;
}

export interface HabitLog {
  id: number;
  habitId: number;
  date: string;
  completed?: boolean;
  notes?: string;
  createdAt?: Date;
}

export interface Medication {
  id: number;
  name: string;
  dosage?: string;
  frequency?: string; // daily, twice_daily, weekly, etc.
  reminderTimes?: string; // JSON array of times
  isActive?: boolean;
  createdAt?: Date;
}

export interface Todo {
  id: number;
  title: string;
  description?: string;
  priority?: string; // low, medium, high, urgent
  category?: string;
  dueDate?: string;
  isCompleted?: boolean;
  estimatedDuration?: number; // minutes
  actualDuration?: number; // minutes
  createdAt?: Date;
}

export interface TimeBlock {
  id: number;
  title: string;
  description?: string;
  date: string;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  category?: string;
  todoId?: number;
  createdAt?: Date;
}

export interface FocusSession {
  id: number;
  date: string;
  startTime: Date;
  endTime?: Date;
  plannedDuration: number; // minutes
  actualDuration?: number; // minutes
  taskDescription?: string;
  wasSuccessful?: boolean;
  notes?: string;
  createdAt?: Date;
}

export interface Budget {
  id: number;
  category: string;
  monthlyLimit: string;
  spent?: string;
  month: string; // YYYY-MM format
  createdAt?: Date;
}

export interface IncomeEntry {
  id: number;
  source: string;
  amount: string;
  date: string;
  category?: string; // salary, freelance, investment, etc.
  description?: string;
  createdAt?: Date;
}

export interface Challenge {
  id: number;
  title: string;
  description?: string;
  category: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  progress?: number;
  createdAt?: Date;
}

export interface ContentCategory {
  id: number;
  name: string;
  description?: string;
  color?: string;
  createdAt?: Date;
}

export interface ContentType {
  id: number;
  name: string;
  description?: string;
  estimatedDuration?: number; // minutes
  createdAt?: Date;
}

export interface ContentPiece {
  id: number;
  title: string;
  description?: string;
  categoryId: number;
  typeId: number;
  status?: string; // planning, in_progress, completed, published
  scheduledDate?: string;
  tags?: string; // JSON array string
  createdAt?: Date;
}

export interface ContentProgress {
  id: number;
  contentPieceId: number;
  phase: string; // research, draft, edit, review, publish
  isCompleted?: boolean;
  notes?: string;
  completedAt?: Date;
  createdAt?: Date;
}

export interface AppProject {
  id: number;
  name: string;
  description?: string;
  status?: string; // planning, active, completed, on_hold
  priority?: string; // low, medium, high
  startDate?: string;
  targetDate?: string;
  createdAt?: Date;
}

export interface AppTask {
  id: number;
  projectId: number;
  title: string;
  description?: string;
  status?: string; // todo, in_progress, completed, blocked
  priority?: string; // low, medium, high
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
  createdAt?: Date;
}

export interface AppSprint {
  id: number;
  projectId: number;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  createdAt?: Date;
}

export interface AppTimeEntry {
  id: number;
  projectId: number;
  taskId?: number;
  date: string;
  hours: number;
  description?: string;
  createdAt?: Date;
}

export interface MiniGameBlock {
  id: number;
  title: string;
  description?: string;
  gameType: string; // puzzle, action, strategy, etc.
  difficulty?: string; // easy, medium, hard
  estimatedPlayTime?: number; // minutes
  createdAt?: Date;
}

export interface MiniGameDesign {
  id: number;
  blockId: number;
  title: string;
  description?: string;
  designElements?: string; // JSON array string
  colorScheme?: string;
  targetAudience?: string;
  createdAt?: Date;
}

export interface SocialMediaPost {
  id: number;
  designId: number;
  platform: string; // tiktok, instagram, youtube, etc.
  caption?: string;
  hashtags?: string; // JSON array string
  scheduledDate?: string;
  isPublished?: boolean;
  createdAt?: Date;
}

export interface SocialMediaAnalytics {
  id: number;
  postId: number;
  platform: string;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  recordedAt: Date;
  createdAt?: Date;
}

export interface PerformanceInsights {
  id: number;
  miniGameBlockId: number;
  platform: string;
  dayOfWeek: string;
  avgViews?: number;
  avgEngagement?: number;
  bestPerformingTime?: string;
  insights?: string; // JSON string
  createdAt?: Date;
}

// Insert schemas using Zod
export const insertDailyEntrySchema = z.object({
  date: z.string(),
  waterIntake: z.number().optional(),
  exerciseCompleted: z.boolean().optional(),
  exerciseNotes: z.string().optional(),
  breakfastCompleted: z.boolean().optional(),
  lunchCompleted: z.boolean().optional(),
  dinnerCompleted: z.boolean().optional(),
  napTaken: z.boolean().optional(),
  napDuration: z.number().optional(),
  wakeUpTime: z.string().optional(),
  sleepHours: z.string().optional(),
  sleepQuality: z.number().optional(),
  mood: z.string().optional(),
  energyLevel: z.number().optional(),
  stressLevel: z.number().optional(),
  symptoms: z.string().optional(),
  medicationsTaken: z.string().optional(),
  periodFlow: z.string().optional(),
  periodSymptoms: z.string().optional(),
  workHours: z.string().optional(),
  tvHours: z.string().optional(),
  phoneHours: z.string().optional(),
  focusSessionsCompleted: z.number().optional(),
  cashSavings: z.string().optional(),
  grocerySpent: z.string().optional(),
  dailyIncome: z.string().optional(),
  habitCompletions: z.string().optional(),
  todoItems: z.string().optional(),
});

export const insertBillSchema = z.object({
  name: z.string(),
  amount: z.string(),
  isAutoPay: z.boolean().optional(),
  dueDate: z.number(),
});

export const insertBillPaymentSchema = z.object({
  billId: z.number(),
  date: z.string(),
  amount: z.string(),
  isPaid: z.boolean().optional(),
});

export const insertGroceryItemSchema = z.object({
  name: z.string(),
  estimatedPrice: z.string().optional(),
  isCompleted: z.boolean().optional(),
  listId: z.number().optional(),
});

export const insertGoalSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  category: z.string(),
  targetValue: z.string().optional(),
  currentValue: z.string().optional(),
  unit: z.string().optional(),
  targetDate: z.string().optional(),
  isCompleted: z.boolean().optional(),
});

export const insertHabitSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  category: z.string(),
  targetFrequency: z.number().optional(),
  currentStreak: z.number().optional(),
  longestStreak: z.number().optional(),
  isActive: z.boolean().optional(),
});

export const insertHabitLogSchema = z.object({
  habitId: z.number(),
  date: z.string(),
  completed: z.boolean().optional(),
  notes: z.string().optional(),
});

export const insertTodoSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  priority: z.string().optional(),
  category: z.string().optional(),
  dueDate: z.string().optional(),
  isCompleted: z.boolean().optional(),
  estimatedDuration: z.number().optional(),
  actualDuration: z.number().optional(),
});

export const insertContentCategorySchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  color: z.string().optional(),
});

export const insertContentTypeSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  estimatedDuration: z.number().optional(),
});

export const insertContentPieceSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  categoryId: z.number(),
  typeId: z.number(),
  status: z.string().optional(),
  scheduledDate: z.string().optional(),
  tags: z.string().optional(),
});

export const insertContentProgressSchema = z.object({
  contentPieceId: z.number(),
  phase: z.string(),
  isCompleted: z.boolean().optional(),
  notes: z.string().optional(),
});

export const insertMiniGameBlockSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  gameType: z.string(),
  difficulty: z.string().optional(),
  estimatedPlayTime: z.number().optional(),
});

export const insertMiniGameDesignSchema = z.object({
  blockId: z.number(),
  title: z.string(),
  description: z.string().optional(),
  designElements: z.string().optional(),
  colorScheme: z.string().optional(),
  targetAudience: z.string().optional(),
});

export const insertSocialMediaPostSchema = z.object({
  designId: z.number(),
  platform: z.string(),
  caption: z.string().optional(),
  hashtags: z.string().optional(),
  scheduledDate: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export const insertSocialMediaAnalyticsSchema = z.object({
  postId: z.number(),
  platform: z.string(),
  views: z.number().optional(),
  likes: z.number().optional(),
  comments: z.number().optional(),
  shares: z.number().optional(),
  recordedAt: z.date(),
});

export const insertPerformanceInsightsSchema = z.object({
  miniGameBlockId: z.number(),
  platform: z.string(),
  dayOfWeek: z.string(),
  avgViews: z.number().optional(),
  avgEngagement: z.number().optional(),
  bestPerformingTime: z.string().optional(),
  insights: z.string().optional(),
});

// Insert types
export type InsertDailyEntry = z.infer<typeof insertDailyEntrySchema>;
export type InsertBill = z.infer<typeof insertBillSchema>;
export type InsertBillPayment = z.infer<typeof insertBillPaymentSchema>;
export type InsertGroceryItem = z.infer<typeof insertGroceryItemSchema>;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type InsertHabitLog = z.infer<typeof insertHabitLogSchema>;
export type InsertTodo = z.infer<typeof insertTodoSchema>;
export type InsertContentCategory = z.infer<typeof insertContentCategorySchema>;
export type InsertContentType = z.infer<typeof insertContentTypeSchema>;
export type InsertContentPiece = z.infer<typeof insertContentPieceSchema>;
export type InsertContentProgress = z.infer<typeof insertContentProgressSchema>;
export type InsertMiniGameBlock = z.infer<typeof insertMiniGameBlockSchema>;
export type InsertMiniGameDesign = z.infer<typeof insertMiniGameDesignSchema>;
export type InsertSocialMediaPost = z.infer<typeof insertSocialMediaPostSchema>;
export type InsertSocialMediaAnalytics = z.infer<typeof insertSocialMediaAnalyticsSchema>;
export type InsertPerformanceInsights = z.infer<typeof insertPerformanceInsightsSchema>;