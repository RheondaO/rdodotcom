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
  // Work & Screen Time
  workHours: decimal("work_hours", { precision: 3, scale: 1 }).default("0"),
  tvHours: decimal("tv_hours", { precision: 3, scale: 1 }).default("0"),
  phoneHours: decimal("phone_hours", { precision: 3, scale: 1 }).default("0"),
  // Finance
  cashSavings: decimal("cash_savings", { precision: 10, scale: 2 }).default("0"),
  grocerySpent: decimal("grocery_spent", { precision: 8, scale: 2 }).default("0"),
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
  createdAt: timestamp("created_at").defaultNow(),
});

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

export type InsertDailyEntry = z.infer<typeof insertDailyEntrySchema>;
export type DailyEntry = typeof dailyEntries.$inferSelect;

export type InsertBill = z.infer<typeof insertBillSchema>;
export type Bill = typeof bills.$inferSelect;

export type InsertBillPayment = z.infer<typeof insertBillPaymentSchema>;
export type BillPayment = typeof billPayments.$inferSelect;

export type InsertGroceryItem = z.infer<typeof insertGroceryItemSchema>;
export type GroceryItem = typeof groceryItems.$inferSelect;
