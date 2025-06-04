import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertDailyEntrySchema, 
  insertBillSchema, 
  insertBillPaymentSchema, 
  insertGroceryItemSchema,
  insertContentCategorySchema,
  insertContentTypeSchema,
  insertContentPieceSchema,
  insertContentProgressSchema,
  insertHabitSchema,
  insertHabitLogSchema,
  insertTodoSchema
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

  const httpServer = createServer(app);
  return httpServer;
}