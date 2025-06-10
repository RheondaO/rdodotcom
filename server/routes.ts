import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertDailyEntrySchema, 
  insertBillSchema, 
  insertBillPaymentSchema, 
  insertGroceryItemSchema,
  insertGoalSchema,
  insertContentCategorySchema,
  insertContentTypeSchema,
  insertContentPieceSchema,
  insertContentProgressSchema,
  insertHabitSchema,
  insertHabitLogSchema,
  insertTodoSchema,
  insertMiniGameBlockSchema,
  insertMiniGameDesignSchema,
  insertSocialMediaPostSchema,
  insertSocialMediaAnalyticsSchema,
  insertPerformanceInsightsSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {

  // Daily Entries
  app.get("/api/daily-entry/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const entry = await storage.getDailyEntry(date);
      res.json(entry || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch daily entry" });
    }
  });

  app.post("/api/daily-entry", async (req, res) => {
    try {
      const data = insertDailyEntrySchema.parse(req.body);
      const entry = await storage.createOrUpdateDailyEntry(data);
      res.json(entry);
    } catch (error) {
      res.status(400).json({ error: "Invalid daily entry data" });
    }
  });

  // Bills
  app.get("/api/bills", async (req, res) => {
    try {
      const bills = await storage.getAllBills();
      res.json(bills);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bills" });
    }
  });

  app.post("/api/bills", async (req, res) => {
    try {
      const data = insertBillSchema.parse(req.body);
      const bill = await storage.createBill(data);
      res.json(bill);
    } catch (error) {
      res.status(400).json({ error: "Invalid bill data" });
    }
  });

  app.delete("/api/bills/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBill(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete bill" });
    }
  });

  // Bill Payments
  app.get("/api/bill-payments/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const payments = await storage.getBillPaymentsForDate(date);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bill payments" });
    }
  });

  app.post("/api/bill-payments", async (req, res) => {
    try {
      const data = insertBillPaymentSchema.parse(req.body);
      const payment = await storage.createBillPayment(data);
      res.json(payment);
    } catch (error) {
      res.status(400).json({ error: "Invalid bill payment data" });
    }
  });

  app.patch("/api/bill-payments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isPaid } = req.body;
      const payment = await storage.updateBillPayment(id, isPaid);
      res.json(payment);
    } catch (error) {
      res.status(500).json({ error: "Failed to update bill payment" });
    }
  });

  // Grocery Items
  app.get("/api/grocery-items", async (req, res) => {
    try {
      const items = await storage.getAllGroceryItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch grocery items" });
    }
  });

  app.post("/api/grocery-items", async (req, res) => {
    try {
      const data = insertGroceryItemSchema.parse(req.body);
      const item = await storage.createGroceryItem(data);
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid grocery item data" });
    }
  });

  app.patch("/api/grocery-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const item = await storage.updateGroceryItem(id, updates);
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to update grocery item" });
    }
  });

  app.delete("/api/grocery-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteGroceryItem(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete grocery item" });
    }
  });

  // Goals
  app.get("/api/goals", async (req, res) => {
    try {
      const goals = await storage.getAllGoals();
      res.json(goals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch goals" });
    }
  });

  app.post("/api/goals", async (req, res) => {
    try {
      console.log("Received goal data:", req.body);
      const data = insertGoalSchema.parse(req.body);
      console.log("Parsed goal data:", data);
      const goal = await storage.createGoal(data);
      res.json(goal);
    } catch (error) {
      console.error("Goal creation error:", error);
      res.status(400).json({ error: "Invalid goal data", details: error.message });
    }
  });

  app.patch("/api/goals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const goal = await storage.updateGoal(id, req.body);
      res.json(goal);
    } catch (error) {
      res.status(500).json({ error: "Failed to update goal" });
    }
  });

  app.delete("/api/goals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteGoal(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete goal" });
    }
  });

  // Content Categories
  app.get("/api/content-categories", async (req, res) => {
    try {
      const categories = await storage.getAllContentCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content categories" });
    }
  });

  app.post("/api/content-categories", async (req, res) => {
    try {
      const data = insertContentCategorySchema.parse(req.body);
      const category = await storage.createContentCategory(data);
      res.json(category);
    } catch (error) {
      res.status(400).json({ error: "Invalid content category data" });
    }
  });

  // Content Types
  app.get("/api/content-types", async (req, res) => {
    try {
      const types = await storage.getAllContentTypes();
      res.json(types);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content types" });
    }
  });

  app.post("/api/content-types", async (req, res) => {
    try {
      const data = insertContentTypeSchema.parse(req.body);
      const type = await storage.createContentType(data);
      res.json(type);
    } catch (error) {
      res.status(400).json({ error: "Invalid content type data" });
    }
  });

  // Content Pieces
  app.get("/api/content-pieces", async (req, res) => {
    try {
      const pieces = await storage.getAllContentPieces();
      res.json(pieces);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content pieces" });
    }
  });

  app.post("/api/content-pieces", async (req, res) => {
    try {
      const data = insertContentPieceSchema.parse(req.body);
      const piece = await storage.createContentPiece(data);
      res.json(piece);
    } catch (error) {
      res.status(400).json({ error: "Invalid content piece data" });
    }
  });

  app.patch("/api/content-pieces/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const piece = await storage.updateContentPiece(id, updates);
      res.json(piece);
    } catch (error) {
      res.status(500).json({ error: "Failed to update content piece" });
    }
  });

  // Content Progress endpoints
  app.get("/api/content-progress", async (req, res) => {
    try {
      const progress = await storage.getAllContentProgress();
      res.json(progress);
    } catch (error) {
      console.error("Error fetching content progress:", error);
      res.status(500).json({ error: "Failed to fetch content progress" });
    }
  });

  app.post("/api/content-progress", async (req, res) => {
    try {
      const data = insertContentProgressSchema.parse(req.body);
      const progress = await storage.createContentProgress(data);
      res.json(progress);
    } catch (error) {
      console.error("Error creating content progress:", error);
      res.status(500).json({ error: "Failed to create content progress" });
    }
  });

  // Habits
  app.get("/api/habits", async (req, res) => {
    try {
      const habits = await storage.getAllHabits();
      res.json(habits);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch habits" });
    }
  });

  app.post("/api/habits", async (req, res) => {
    try {
      const data = insertHabitSchema.parse(req.body);
      const habit = await storage.createHabit(data);
      res.json(habit);
    } catch (error) {
      res.status(400).json({ error: "Invalid habit data" });
    }
  });

  // Habit Logs (date-specific completion tracking)
  app.get("/api/habit-logs/:habitId/:date", async (req, res) => {
    try {
      const habitId = parseInt(req.params.habitId);
      const date = req.params.date;
      const logs = await storage.getHabitLogs(habitId, date, date);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch habit logs" });
    }
  });

  app.post("/api/habit-logs", async (req, res) => {
    try {
      const data = insertHabitLogSchema.parse(req.body);
      const log = await storage.createHabitLog(data);
      res.json(log);
    } catch (error) {
      res.status(400).json({ error: "Invalid habit log data" });
    }
  });

  // Todos (date-specific)
  app.get("/api/todos/:date", async (req, res) => {
    try {
      const date = req.params.date;
      const todos = await storage.getTodosByDate(date);
      res.json(todos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch todos" });
    }
  });

  app.post("/api/todos", async (req, res) => {
    try {
      console.log("Received todo data:", req.body);
      const data = insertTodoSchema.parse(req.body);
      console.log("Parsed todo data:", data);
      const todo = await storage.createTodo(data);
      res.json(todo);
    } catch (error) {
      console.error("Todo creation error:", error);
      res.status(400).json({ error: error.message || "Invalid todo data" });
    }
  });

  app.patch("/api/todos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const todo = await storage.updateTodo(id, updates);
      res.json(todo);
    } catch (error) {
      res.status(500).json({ error: "Failed to update todo" });
    }
  });

  // Time Blocks (date-specific)
  app.get("/api/time-blocks/:date", async (req, res) => {
    try {
      const date = req.params.date;
      const timeBlocks = await storage.getTimeBlocksByDate(date);
      res.json(timeBlocks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch time blocks" });
    }
  });

  app.post("/api/time-blocks", async (req, res) => {
    try {
      const data = req.body; // Will need proper schema validation
      const timeBlock = await storage.createTimeBlock(data);
      res.json(timeBlock);
    } catch (error) {
      res.status(400).json({ error: "Invalid time block data" });
    }
  });

  // Mini Game Blocks
  app.get("/api/mini-game-blocks", async (req, res) => {
    try {
      const blocks = await storage.getAllMiniGameBlocks();
      res.json(blocks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch mini game blocks" });
    }
  });

  app.post("/api/mini-game-blocks", async (req, res) => {
    try {
      const data = insertMiniGameBlockSchema.parse(req.body);
      const block = await storage.createMiniGameBlock(data);
      res.json(block);
    } catch (error) {
      res.status(400).json({ error: "Invalid mini game block data" });
    }
  });

  // Mini Game Designs
  app.get("/api/mini-game-designs", async (req, res) => {
    try {
      const designs = await storage.getAllMiniGameDesigns();
      res.json(designs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch mini game designs" });
    }
  });

  app.post("/api/mini-game-designs", async (req, res) => {
    try {
      const data = insertMiniGameDesignSchema.parse(req.body);
      const design = await storage.createMiniGameDesign(data);
      res.json(design);
    } catch (error) {
      res.status(400).json({ error: "Invalid mini game design data" });
    }
  });

  // Moon Phase Scheduling
  app.post("/api/schedule-moon-phases", async (req, res) => {
    try {
      const { year, month } = req.body;
      if (!year || !month) {
        return res.status(400).json({ error: "Year and month are required" });
      }
      
      await storage.scheduleContentForMoonPhases(year, month);
      res.json({ success: true, message: `Content scheduled for ${month}/${year}` });
    } catch (error) {
      console.error("Moon phase scheduling error:", error);
      res.status(500).json({ error: "Failed to schedule moon phase content" });
    }
  });

  // Social Media Posts
  app.get("/api/social-media-posts", async (req, res) => {
    try {
      const posts = await storage.getAllSocialMediaPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch social media posts" });
    }
  });

  app.get("/api/social-media-posts/design/:designId", async (req, res) => {
    try {
      const designId = parseInt(req.params.designId);
      const posts = await storage.getSocialMediaPostsByDesign(designId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts for design" });
    }
  });

  app.post("/api/social-media-posts", async (req, res) => {
    try {
      const data = insertSocialMediaPostSchema.parse(req.body);
      const post = await storage.createSocialMediaPost(data);
      res.json(post);
    } catch (error) {
      res.status(400).json({ error: "Invalid social media post data" });
    }
  });

  app.put("/api/social-media-posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const post = await storage.updateSocialMediaPost(id, updates);
      res.json(post);
    } catch (error) {
      res.status(400).json({ error: "Failed to update social media post" });
    }
  });

  app.delete("/api/social-media-posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSocialMediaPost(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete social media post" });
    }
  });

  // Social Media Analytics
  app.get("/api/social-media-analytics", async (req, res) => {
    try {
      const analytics = await storage.getAllSocialMediaAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch social media analytics" });
    }
  });

  app.post("/api/social-media-analytics", async (req, res) => {
    try {
      const data = insertSocialMediaAnalyticsSchema.parse(req.body);
      const analytics = await storage.createSocialMediaAnalytics(data);
      res.json(analytics);
    } catch (error) {
      res.status(400).json({ error: "Invalid social media analytics data" });
    }
  });

  // Performance Insights
  app.get("/api/performance-insights", async (req, res) => {
    try {
      const insights = await storage.getAllPerformanceInsights();
      res.json(insights);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch performance insights" });
    }
  });

  app.post("/api/performance-insights", async (req, res) => {
    try {
      const data = insertPerformanceInsightsSchema.parse(req.body);
      const insights = await storage.createPerformanceInsights(data);
      res.json(insights);
    } catch (error) {
      res.status(400).json({ error: "Invalid performance insights data" });
    }
  });

  app.post("/api/aggregate-performance-data", async (req, res) => {
    try {
      await storage.aggregatePerformanceData();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to aggregate performance data" });
    }
  });

  // Reports Analytics
  app.get("/api/reports/analytics/:period", async (req, res) => {
    try {
      const period = req.params.period;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: "Start date and end date are required" });
      }

      const analytics = await storage.getReportsAnalytics(period, startDate as string, endDate as string);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reports analytics" });
    }
  });

  app.get("/api/reports/habits/:dateRange", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: "Start date and end date are required" });
      }

      const habitData = await storage.getHabitsAnalytics(startDate as string, endDate as string);
      res.json(habitData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch habits analytics" });
    }
  });

  app.get("/api/reports/goals/:period", async (req, res) => {
    try {
      const period = req.params.period;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: "Start date and end date are required" });
      }

      const goalData = await storage.getGoalsAnalytics(period, startDate as string, endDate as string);
      res.json(goalData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch goals analytics" });
    }
  });

  app.get("/api/reports/health/:dateRange", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: "Start date and end date are required" });
      }

      const healthData = await storage.getHealthAnalytics(startDate as string, endDate as string);
      res.json(healthData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch health analytics" });
    }
  });

  app.get("/api/reports/productivity/:dateRange", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: "Start date and end date are required" });
      }

      const productivityData = await storage.getProductivityAnalytics(startDate as string, endDate as string);
      res.json(productivityData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch productivity analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}