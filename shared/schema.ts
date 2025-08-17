import { z } from "zod";
import { pgTable, serial, text, timestamp, integer, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

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

// Fitness & Exercise Tracking Interfaces
export interface Exercise {
  id: number;
  name: string;
  category: string; // cardio, strength, flexibility, sports
  muscleGroups?: string; // JSON array of muscle groups
  equipment?: string; // bodyweight, dumbbells, barbell, machine, etc.
  instructions?: string;
  createdAt?: Date;
}

export interface Workout {
  id: number;
  name: string;
  date: string;
  duration?: number; // minutes
  notes?: string;
  calories?: number;
  difficulty?: number; // 1-5 rating
  isCompleted?: boolean;
  createdAt?: Date;
}

export interface WorkoutExercise {
  id: number;
  workoutId: number;
  exerciseId: number;
  sets?: number;
  reps?: string; // JSON array of reps per set
  weight?: string; // JSON array of weights per set
  duration?: number; // for time-based exercises
  distance?: number; // for cardio exercises
  restTime?: number; // seconds
  notes?: string;
}

export interface BodyWeight {
  id: number;
  date: string;
  weight: number; // in pounds or kg
  bodyFat?: number; // percentage
  muscleMass?: number; // in pounds or kg
  waterWeight?: number; // percentage
  notes?: string;
  createdAt?: Date;
}

export interface BodyMeasurement {
  id: number;
  date: string;
  chest?: number;
  waist?: number;
  hips?: number;
  biceps?: number;
  thighs?: number;
  neck?: number;
  shoulders?: number;
  forearms?: number;
  calves?: number;
  unit: string; // inches, cm
  notes?: string;
  createdAt?: Date;
}

export interface FitnessGoal {
  id: number;
  type: string; // weight_loss, muscle_gain, strength, endurance, flexibility
  title: string;
  description?: string;
  targetValue: number;
  currentValue?: number;
  unit: string; // lbs, kg, reps, minutes, etc.
  targetDate?: string;
  isCompleted?: boolean;
  priority?: string; // low, medium, high
  createdAt?: Date;
}

export interface WorkoutProgram {
  id: number;
  name: string;
  description?: string;
  duration?: number; // weeks
  difficulty?: string; // beginner, intermediate, advanced
  goalType?: string; // strength, muscle_gain, weight_loss, endurance
  isActive?: boolean;
  createdAt?: Date;
}

export interface NutritionEntry {
  id: number;
  date: string;
  mealType: string; // breakfast, lunch, dinner, snack
  food: string;
  calories?: number;
  protein?: number; // grams
  carbs?: number; // grams  
  fat?: number; // grams
  fiber?: number; // grams
  sugar?: number; // grams
  sodium?: number; // mg
  notes?: string;
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

export interface BudgetPeriod {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  totalBudget: string;
  totalSpent?: string;
  isActive?: boolean;
  createdAt?: Date;
}

export interface BudgetAlert {
  id: number;
  budgetId: number;
  type: string; // overspend, approaching_limit, trend_change
  threshold: string; // percentage or amount
  isActive?: boolean;
  lastTriggered?: Date;
  createdAt?: Date;
}

export interface SpendingTrend {
  id: number;
  categoryId: number;
  period: string; // weekly, monthly, yearly
  averageSpend: string;
  trendDirection: string; // increasing, decreasing, stable
  changePercentage: string;
  calculatedAt: Date;
  createdAt?: Date;
}

export interface BudgetCategory {
  id: number;
  name: string;
  description?: string;
  color?: string;
  parentId?: number;
  isDefault?: boolean;
  createdAt?: Date;
}

export interface Expense {
  id: number;
  amount: string;
  description: string;
  categoryId: number;
  date: string;
  isRecurring?: boolean;
  recurringType?: string; // weekly, monthly, yearly
  tags?: string; // JSON array string
  paymentMethod?: string;
  location?: string;
  notes?: string;
  createdAt?: Date;
}

export interface Debt {
  id: number;
  name: string;
  type: string; // credit_card, loan, mortgage, student_loan
  totalAmount: string;
  currentBalance: string;
  interestRate: string; // percentage
  minimumPayment: string;
  dueDate: number; // day of month
  payoffStrategy?: string; // avalanche, snowball, custom
  isActive?: boolean;
  createdAt?: Date;
}

export interface DebtPayment {
  id: number;
  debtId: number;
  amount: string;
  date: string;
  isExtraPayment?: boolean;
  notes?: string;
  createdAt?: Date;
}

export interface Investment {
  id: number;
  symbol: string;
  name: string;
  type: string; // stock, bond, etf, crypto, mutual_fund
  quantity: string;
  purchasePrice: string;
  currentPrice: string;
  marketValue: string;
  platformId?: number;
  purchaseDate: string;
  lastPriceUpdate?: Date;
  createdAt?: Date;
}

export interface Portfolio {
  id: number;
  name: string;
  description?: string;
  totalValue: string;
  totalCost: string;
  totalGainLoss: string;
  lastUpdated?: Date;
  createdAt?: Date;
}

export interface PortfolioHolding {
  id: number;
  portfolioId: number;
  investmentId: number;
  allocationPercentage: string;
  targetAllocation?: string;
  createdAt?: Date;
}

export interface PriceHistory {
  id: number;
  symbol: string;
  price: string;
  date: string;
  volume?: string;
  source?: string;
  createdAt?: Date;
}

export interface InvestmentTransaction {
  id: number;
  investmentId: number;
  type: string; // buy, sell, dividend, split
  quantity: string;
  price: string;
  totalAmount: string;
  fees?: string;
  date: string;
  notes?: string;
  createdAt?: Date;
}

export interface InvestmentPlatform {
  id: number;
  name: string;
  type: string; // brokerage, retirement, crypto_exchange
  accountNumber?: string;
  loginUrl?: string;
  notes?: string;
  createdAt?: Date;
}

export interface Account {
  id: number;
  name: string;
  type: string; // checking, savings, credit_card, investment, retirement
  institution: string;
  balance: string;
  interestRate?: string;
  isActive?: boolean;
  accountNumber?: string; // last 4 digits only for security
  createdAt?: Date;
}

export interface NetWorthSnapshot {
  id: number;
  date: string;
  totalAssets: string;
  totalLiabilities: string;
  netWorth: string;
  notes?: string;
  createdAt?: Date;
}

export interface FinancialGoal {
  id: number;
  name: string;
  description?: string;
  targetAmount: string;
  currentAmount: string;
  targetDate: string;
  category: string; // emergency_fund, house_downpayment, retirement, vacation
  isCompleted?: boolean;
  monthlyContribution?: string;
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

// Blog Content Studio Models
export interface BlogPost {
  id: number;
  title: string;
  content?: string;
  excerpt?: string;
  status: string; // draft, scheduled, published, archived
  type: string; // blog, newsletter, article
  platform: string; // substack, medium, linkedin, personal_blog, etc.
  tags?: string; // JSON array string
  scheduledDate?: string;
  publishedDate?: string;
  reviewDate?: string;
  priority?: string; // low, medium, high
  wordCount?: number;
  readingTime?: number; // minutes
  seoTitle?: string;
  seoDescription?: string;
  featuredImage?: string;
  isAiGenerated?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BlogIdea {
  id: number;
  title: string;
  description?: string;
  category: string;
  platform: string;
  tags?: string; // JSON array string
  priority?: string; // low, medium, high
  aiPrompt?: string;
  aiGeneratedContent?: string;
  status: string; // idea, in_progress, completed, discarded
  estimatedReadTime?: number;
  targetAudience?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BlogCalendar {
  id: number;
  postId?: number;
  ideaId?: number;
  title: string;
  type: string; // post, review, brainstorm, research
  platform: string;
  date: string;
  time?: string;
  status: string; // scheduled, completed, cancelled
  notes?: string;
  createdAt?: Date;
}

// Database Tables for Blog System
export const blogPosts = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content'),
  excerpt: text('excerpt'),
  status: text('status').notNull().default('draft'),
  type: text('type').notNull().default('blog'),
  platform: text('platform').notNull(),
  tags: text('tags'),
  scheduledDate: text('scheduled_date'),
  publishedDate: text('published_date'),
  reviewDate: text('review_date'),
  priority: text('priority').default('medium'),
  wordCount: integer('word_count'),
  readingTime: integer('reading_time'),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  featuredImage: text('featured_image'),
  isAiGenerated: boolean('is_ai_generated').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const blogIdeas = pgTable('blog_ideas', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  platform: text('platform').notNull(),
  tags: text('tags'),
  priority: text('priority').default('medium'),
  aiPrompt: text('ai_prompt'),
  aiGeneratedContent: text('ai_generated_content'),
  status: text('status').notNull().default('active'),
  estimatedReadTime: integer('estimated_read_time'),
  targetAudience: text('target_audience'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const blogCalendar = pgTable('blog_calendar', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').references(() => blogPosts.id),
  ideaId: integer('idea_id').references(() => blogIdeas.id),
  title: text('title').notNull(),
  type: text('type').notNull(),
  platform: text('platform').notNull(),
  date: text('date').notNull(),
  time: text('time'),
  status: text('status').notNull().default('scheduled'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Fitness & Exercise Database Tables
export const exercises = pgTable('exercises', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  muscleGroups: text('muscle_groups'), // JSON array
  equipment: text('equipment'),
  instructions: text('instructions'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const workouts = pgTable('workouts', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  date: text('date').notNull(),
  duration: integer('duration'), // minutes
  notes: text('notes'),
  calories: integer('calories'),
  difficulty: integer('difficulty'), // 1-5 rating
  isCompleted: boolean('is_completed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const workoutExercises = pgTable('workout_exercises', {
  id: serial('id').primaryKey(),
  workoutId: integer('workout_id').references(() => workouts.id),
  exerciseId: integer('exercise_id').references(() => exercises.id),
  sets: integer('sets'),
  reps: text('reps'), // JSON array of reps per set
  weight: text('weight'), // JSON array of weights per set
  duration: integer('duration'), // for time-based exercises
  distance: decimal('distance'), // for cardio exercises
  restTime: integer('rest_time'), // seconds
  notes: text('notes'),
});

export const bodyWeights = pgTable('body_weights', {
  id: serial('id').primaryKey(),
  date: text('date').notNull(),
  weight: decimal('weight').notNull(), // in pounds or kg
  bodyFat: decimal('body_fat'), // percentage
  muscleMass: decimal('muscle_mass'), // in pounds or kg
  waterWeight: decimal('water_weight'), // percentage
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const bodyMeasurements = pgTable('body_measurements', {
  id: serial('id').primaryKey(),
  date: text('date').notNull(),
  chest: decimal('chest'),
  waist: decimal('waist'),
  hips: decimal('hips'),
  biceps: decimal('biceps'),
  thighs: decimal('thighs'),
  neck: decimal('neck'),
  shoulders: decimal('shoulders'),
  forearms: decimal('forearms'),
  calves: decimal('calves'),
  unit: text('unit').notNull().default('inches'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const fitnessGoals = pgTable('fitness_goals', {
  id: serial('id').primaryKey(),
  type: text('type').notNull(), // weight_loss, muscle_gain, strength, endurance, flexibility
  title: text('title').notNull(),
  description: text('description'),
  targetValue: decimal('target_value').notNull(),
  currentValue: decimal('current_value'),
  unit: text('unit').notNull(),
  targetDate: text('target_date'),
  isCompleted: boolean('is_completed').default(false),
  priority: text('priority').default('medium'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const workoutPrograms = pgTable('workout_programs', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  duration: integer('duration'), // weeks
  difficulty: text('difficulty'), // beginner, intermediate, advanced
  goalType: text('goal_type'), // strength, muscle_gain, weight_loss, endurance
  isActive: boolean('is_active').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const nutritionEntries = pgTable('nutrition_entries', {
  id: serial('id').primaryKey(),
  date: text('date').notNull(),
  mealType: text('meal_type').notNull(), // breakfast, lunch, dinner, snack
  food: text('food').notNull(),
  calories: integer('calories'),
  protein: decimal('protein'), // grams
  carbs: decimal('carbs'), // grams
  fat: decimal('fat'), // grams
  fiber: decimal('fiber'), // grams
  sugar: decimal('sugar'), // grams
  sodium: decimal('sodium'), // mg
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

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

export const insertBlogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  status: z.string().default("draft"),
  type: z.string().default("blog"),
  platform: z.string().min(1, "Platform is required"),
  tags: z.string().optional(),
  scheduledDate: z.string().optional(),
  publishedDate: z.string().optional(),
  reviewDate: z.string().optional(),
  priority: z.string().default("medium"),
  wordCount: z.number().optional(),
  readingTime: z.number().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  featuredImage: z.string().optional(),
  isAiGenerated: z.boolean().default(false)
});

export const insertBlogIdeaSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  platform: z.string().min(1, "Platform is required"),
  tags: z.string().optional(),
  priority: z.string().default("medium"),
  aiPrompt: z.string().optional(),
  aiGeneratedContent: z.string().optional(),
  status: z.string().default("idea"),
  estimatedReadTime: z.number().optional(),
  targetAudience: z.string().optional()
});

export const insertBlogCalendarSchema = z.object({
  postId: z.number().optional(),
  ideaId: z.number().optional(),
  title: z.string().min(1, "Title is required"),
  type: z.string().min(1, "Type is required"),
  platform: z.string().min(1, "Platform is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().optional(),
  status: z.string().default("scheduled"),
  notes: z.string().optional()
});

// Fitness Insert Schemas
export const insertExerciseSchema = z.object({
  name: z.string().min(1, "Exercise name is required"),
  category: z.string().min(1, "Category is required"),
  muscleGroups: z.string().optional(),
  equipment: z.string().optional(),
  instructions: z.string().optional(),
});

export const insertWorkoutSchema = z.object({
  name: z.string().min(1, "Workout name is required"),
  date: z.string().min(1, "Date is required"),
  duration: z.number().optional(),
  notes: z.string().optional(),
  calories: z.number().optional(),
  difficulty: z.number().min(1).max(5).optional(),
  isCompleted: z.boolean().default(false),
});

export const insertWorkoutExerciseSchema = z.object({
  workoutId: z.number(),
  exerciseId: z.number(),
  sets: z.number().optional(),
  reps: z.string().optional(),
  weight: z.string().optional(),
  duration: z.number().optional(),
  distance: z.number().optional(),
  restTime: z.number().optional(),
  notes: z.string().optional(),
});

export const insertBodyWeightSchema = z.object({
  date: z.string().min(1, "Date is required"),
  weight: z.number().min(0, "Weight must be positive"),
  bodyFat: z.number().min(0).max(100).optional(),
  muscleMass: z.number().min(0).optional(),
  waterWeight: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

export const insertBodyMeasurementSchema = z.object({
  date: z.string().min(1, "Date is required"),
  chest: z.number().optional(),
  waist: z.number().optional(),
  hips: z.number().optional(),
  biceps: z.number().optional(),
  thighs: z.number().optional(),
  neck: z.number().optional(),
  shoulders: z.number().optional(),
  forearms: z.number().optional(),
  calves: z.number().optional(),
  unit: z.string().default("inches"),
  notes: z.string().optional(),
});

export const insertFitnessGoalSchema = z.object({
  type: z.string().min(1, "Goal type is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  targetValue: z.number().min(0, "Target value must be positive"),
  currentValue: z.number().min(0).optional(),
  unit: z.string().min(1, "Unit is required"),
  targetDate: z.string().optional(),
  isCompleted: z.boolean().default(false),
  priority: z.string().default("medium"),
});

export const insertWorkoutProgramSchema = z.object({
  name: z.string().min(1, "Program name is required"),
  description: z.string().optional(),
  duration: z.number().min(1).optional(),
  difficulty: z.string().optional(),
  goalType: z.string().optional(),
  isActive: z.boolean().default(false),
});

export const insertNutritionEntrySchema = z.object({
  date: z.string().min(1, "Date is required"),
  mealType: z.string().min(1, "Meal type is required"),
  food: z.string().min(1, "Food is required"),
  calories: z.number().min(0).optional(),
  protein: z.number().min(0).optional(),
  carbs: z.number().min(0).optional(),
  fat: z.number().min(0).optional(),
  fiber: z.number().min(0).optional(),
  sugar: z.number().min(0).optional(),
  sodium: z.number().min(0).optional(),
  notes: z.string().optional(),
});

// Diet Planning Interfaces
export interface MealPlan {
  id: number;
  date: string;
  mealType: string; // breakfast, lunch, dinner, snack
  plannedFood: string;
  plannedCalories?: number;
  plannedProtein?: number;
  plannedCarbs?: number;
  plannedFat?: number;
  notes?: string;
  isCompleted?: boolean;
  createdAt?: Date;
}

export interface DietGoal {
  id: number;
  name: string;
  description?: string;
  targetCalories?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFat?: number;
  targetFiber?: number;
  targetWater?: number; // glasses
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  createdAt?: Date;
}

export interface FoodDatabase {
  id: number;
  name: string;
  category: string; // protein, vegetable, grain, fruit, dairy, etc.
  caloriesPerServing: number;
  proteinPerServing?: number;
  carbsPerServing?: number;
  fatPerServing?: number;
  fiberPerServing?: number;
  servingSize: string;
  unit: string; // cup, oz, piece, etc.
  createdAt?: Date;
}

// Diet Planning Insert Schemas
export const insertMealPlanSchema = z.object({
  date: z.string().min(1, "Date is required"),
  mealType: z.string().min(1, "Meal type is required"),
  plannedFood: z.string().min(1, "Planned food is required"),
  plannedCalories: z.number().min(0).optional(),
  plannedProtein: z.number().min(0).optional(),
  plannedCarbs: z.number().min(0).optional(),
  plannedFat: z.number().min(0).optional(),
  notes: z.string().optional(),
  isCompleted: z.boolean().default(false),
});

export const insertDietGoalSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  targetCalories: z.number().min(0).optional(),
  targetProtein: z.number().min(0).optional(),
  targetCarbs: z.number().min(0).optional(),
  targetFat: z.number().min(0).optional(),
  targetFiber: z.number().min(0).optional(),
  targetWater: z.number().min(0).optional(),
  isActive: z.boolean().default(true),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const insertFoodDatabaseSchema = z.object({
  name: z.string().min(1, "Food name is required"),
  category: z.string().min(1, "Category is required"),
  caloriesPerServing: z.number().min(0, "Calories must be positive"),
  proteinPerServing: z.number().min(0).optional(),
  carbsPerServing: z.number().min(0).optional(),
  fatPerServing: z.number().min(0).optional(),
  fiberPerServing: z.number().min(0).optional(),
  servingSize: z.string().min(1, "Serving size is required"),
  unit: z.string().min(1, "Unit is required"),
});

// Type exports for blog system
export type BlogPostType = typeof blogPosts.$inferSelect;
export type BlogIdeaType = typeof blogIdeas.$inferSelect;
export type BlogCalendarType = typeof blogCalendar.$inferSelect;

export const insertBudgetCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().optional(),
  parentId: z.number().optional(),
  isDefault: z.boolean().default(false)
});

export const insertExpenseSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(1, "Description is required"),
  categoryId: z.number().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
  isRecurring: z.boolean().default(false),
  recurringType: z.string().optional(),
  tags: z.string().optional(),
  paymentMethod: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional()
});

export const insertDebtSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  totalAmount: z.string().min(1, "Total amount is required"),
  currentBalance: z.string().min(1, "Current balance is required"),
  interestRate: z.string().min(1, "Interest rate is required"),
  minimumPayment: z.string().min(1, "Minimum payment is required"),
  dueDate: z.number().min(1).max(31),
  payoffStrategy: z.string().optional(),
  isActive: z.boolean().default(true)
});

export const insertDebtPaymentSchema = z.object({
  debtId: z.number().min(1, "Debt ID is required"),
  amount: z.string().min(1, "Amount is required"),
  date: z.string().min(1, "Date is required"),
  isExtraPayment: z.boolean().default(false),
  notes: z.string().optional()
});

export const insertInvestmentSchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  quantity: z.string().min(1, "Quantity is required"),
  purchasePrice: z.string().min(1, "Purchase price is required"),
  currentPrice: z.string().min(1, "Current price is required"),
  marketValue: z.string().min(1, "Market value is required"),
  platformId: z.number().optional(),
  purchaseDate: z.string().min(1, "Purchase date is required")
});

export const insertInvestmentPlatformSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  accountNumber: z.string().optional(),
  loginUrl: z.string().optional(),
  notes: z.string().optional()
});

export const insertAccountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  institution: z.string().min(1, "Institution is required"),
  balance: z.string().min(1, "Balance is required"),
  interestRate: z.string().optional(),
  isActive: z.boolean().default(true),
  accountNumber: z.string().optional()
});

export const insertNetWorthSnapshotSchema = z.object({
  date: z.string().min(1, "Date is required"),
  totalAssets: z.string().min(1, "Total assets is required"),
  totalLiabilities: z.string().min(1, "Total liabilities is required"),
  netWorth: z.string().min(1, "Net worth is required"),
  notes: z.string().optional()
});

export const insertFinancialGoalSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  targetAmount: z.string().min(1, "Target amount is required"),
  currentAmount: z.string().default("0"),
  targetDate: z.string().min(1, "Target date is required"),
  category: z.string().min(1, "Category is required"),
  isCompleted: z.boolean().default(false),
  monthlyContribution: z.string().optional()
});

export const insertBudgetPeriodSchema = z.object({
  name: z.string().min(1, "Name is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  totalBudget: z.string().min(1, "Total budget is required"),
  totalSpent: z.string().default("0"),
  isActive: z.boolean().default(true)
});

export const insertBudgetAlertSchema = z.object({
  budgetId: z.number().min(1, "Budget ID is required"),
  type: z.string().min(1, "Type is required"),
  threshold: z.string().min(1, "Threshold is required"),
  isActive: z.boolean().default(true)
});

export const insertSpendingTrendSchema = z.object({
  categoryId: z.number().min(1, "Category ID is required"),
  period: z.string().min(1, "Period is required"),
  averageSpend: z.string().min(1, "Average spend is required"),
  trendDirection: z.string().min(1, "Trend direction is required"),
  changePercentage: z.string().min(1, "Change percentage is required"),
  calculatedAt: z.date()
});

export const insertPortfolioSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  totalValue: z.string().default("0"),
  totalCost: z.string().default("0"),
  totalGainLoss: z.string().default("0")
});

export const insertPortfolioHoldingSchema = z.object({
  portfolioId: z.number().min(1, "Portfolio ID is required"),
  investmentId: z.number().min(1, "Investment ID is required"),
  allocationPercentage: z.string().min(1, "Allocation percentage is required"),
  targetAllocation: z.string().optional()
});

export const insertPriceHistorySchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
  price: z.string().min(1, "Price is required"),
  date: z.string().min(1, "Date is required"),
  volume: z.string().optional(),
  source: z.string().optional()
});

export const insertInvestmentTransactionSchema = z.object({
  investmentId: z.number().min(1, "Investment ID is required"),
  type: z.string().min(1, "Type is required"),
  quantity: z.string().min(1, "Quantity is required"),
  price: z.string().min(1, "Price is required"),
  totalAmount: z.string().min(1, "Total amount is required"),
  fees: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional()
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
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type InsertBlogIdea = z.infer<typeof insertBlogIdeaSchema>;
export type InsertBlogCalendar = z.infer<typeof insertBlogCalendarSchema>;
export type InsertBudgetCategory = z.infer<typeof insertBudgetCategorySchema>;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type InsertDebt = z.infer<typeof insertDebtSchema>;
export type InsertDebtPayment = z.infer<typeof insertDebtPaymentSchema>;
export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;
export type InsertInvestmentPlatform = z.infer<typeof insertInvestmentPlatformSchema>;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type InsertNetWorthSnapshot = z.infer<typeof insertNetWorthSnapshotSchema>;
export type InsertFinancialGoal = z.infer<typeof insertFinancialGoalSchema>;
export type InsertBudgetPeriod = z.infer<typeof insertBudgetPeriodSchema>;
export type InsertBudgetAlert = z.infer<typeof insertBudgetAlertSchema>;
export type InsertSpendingTrend = z.infer<typeof insertSpendingTrendSchema>;
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
export type InsertPortfolioHolding = z.infer<typeof insertPortfolioHoldingSchema>;
export type InsertPriceHistory = z.infer<typeof insertPriceHistorySchema>;
export type InsertInvestmentTransaction = z.infer<typeof insertInvestmentTransactionSchema>;

// Timer Session interface will be inferred from the database table below

// Timer Sessions Table for persistent timer state across devices/sessions
export const timerSessions = pgTable("timer_sessions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("admin"), // For user sessions
  mode: text("mode").notNull(), // 'focus', 'pomodoro', 'deepwork', 'flowstate'
  title: text("title"), // Optional task/timeblock title
  category: text("category"), // Task category
  
  // Timer configuration
  totalDuration: integer("total_duration").notNull(), // Total session duration in seconds
  remainingTime: integer("remaining_time").notNull(), // Remaining time in seconds
  currentSession: integer("current_session").notNull().default(1), // Current session number
  totalSessions: integer("total_sessions").notNull().default(1), // Total sessions for this mode
  isBreak: boolean("is_break").notNull().default(false), // Whether currently on break
  
  // State management
  isActive: boolean("is_active").notNull().default(false), // Timer running/paused
  isPaused: boolean("is_paused").notNull().default(false), // Paused state
  startedAt: timestamp("started_at").defaultNow(), // When timer was started
  pausedAt: timestamp("paused_at"), // When timer was paused
  lastSync: timestamp("last_sync").defaultNow(), // Last synchronization time
  
  // Progress tracking
  totalFocusTime: integer("total_focus_time").notNull().default(0), // Total minutes of focus time completed
  completedSessions: integer("completed_sessions").notNull().default(0), // Number of completed sessions
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertTimerSessionSchema = createInsertSchema(timerSessions).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  lastSync: true
});
export type InsertTimerSession = z.infer<typeof insertTimerSessionSchema>;
export type TimerSession = typeof timerSessions.$inferSelect;

// Fitness Type Inference
export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type InsertWorkoutExercise = z.infer<typeof insertWorkoutExerciseSchema>;
export type InsertBodyWeight = z.infer<typeof insertBodyWeightSchema>;
export type InsertBodyMeasurement = z.infer<typeof insertBodyMeasurementSchema>;
export type InsertFitnessGoal = z.infer<typeof insertFitnessGoalSchema>;
export type InsertWorkoutProgram = z.infer<typeof insertWorkoutProgramSchema>;
export type InsertNutritionEntry = z.infer<typeof insertNutritionEntrySchema>;