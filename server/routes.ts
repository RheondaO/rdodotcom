import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticateUser, requireAuth, requireAdmin, adminLogin, adminLogout, type AuthenticatedRequest } from "./auth";
import { 
  getNotionDatabases, 
  findDatabaseByTitle, 
  getNotionTasks, 
  createNotionTask, 
  updateNotionTask, 
  deleteNotionTask,
  NOTION_TASKS_DATABASE_ID,
  NOTION_TIMEBLOCKS_DATABASE_ID,
  NOTION_TIMERSESSIONS_DATABASE_ID,
  getActiveNotionTimerSession
} from "./notion";
import timerRoutes from "./timer-routes-new";
import fitnessRoutes from "./fitness-routes";
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
  insertPerformanceInsightsSchema,
  insertBlogPostSchema,
  insertBlogIdeaSchema,
  insertBlogCalendarSchema,
  insertBudgetCategorySchema,
  insertExpenseSchema,
  insertDebtSchema,
  insertDebtPaymentSchema,
  insertInvestmentSchema,
  insertInvestmentPlatformSchema,
  insertAccountSchema,
  insertNetWorthSnapshotSchema,
  insertFinancialGoalSchema,
  insertBudgetPeriodSchema,
  insertBudgetAlertSchema,
  insertSpendingTrendSchema,
  insertPortfolioSchema,
  insertPortfolioHoldingSchema,
  insertPriceHistorySchema,
  insertInvestmentTransactionSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Apply authentication middleware to all routes
  app.use(authenticateUser);

  // Timer debug routes for cross-device troubleshooting
  app.get("/api/timer/debug", async (req, res) => {
    try {
      const timerDebugInfo = {
        environment: {
          hasNotionSecret: !!process.env.NOTION_INTEGRATION_SECRET,
          hasTimerSessionsUrl: !!process.env.NOTION_TIMERSESSIONS_URL,
          timerSessionsDbId: NOTION_TIMERSESSIONS_DATABASE_ID,
          nodeEnv: process.env.NODE_ENV
        },
        
        notionStatus: {
          databaseConfigured: !!NOTION_TIMERSESSIONS_DATABASE_ID,
          databaseIdLength: NOTION_TIMERSESSIONS_DATABASE_ID?.length || 0
        },
        
        activeTimer: null as any,
        errors: [] as string[]
      };

      // Test Notion connection and active timer retrieval
      try {
        const activeTimer = await getActiveNotionTimerSession();
        timerDebugInfo.activeTimer = activeTimer ? {
          id: activeTimer.id,
          mode: activeTimer.mode,
          title: activeTimer.title,
          isActive: activeTimer.isActive,
          source: activeTimer.id.length > 10 ? "notion" : "local"
        } : null;
      } catch (error: any) {
        timerDebugInfo.errors.push(`Active timer fetch error: ${error.message}`);
      }

      res.json({
        success: true,
        data: timerDebugInfo,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Enhanced public active timer with debug info
  app.get("/api/timer/active-enhanced", async (req, res) => {
    try {
      console.log("🔍 Enhanced active timer request - checking Notion first");
      
      // Primary: Check Notion for active timer
      let activeTimer = null;
      let source = "none";
      let errors: string[] = [];

      if (NOTION_TIMERSESSIONS_DATABASE_ID) {
        try {
          activeTimer = await getActiveNotionTimerSession();
          if (activeTimer) {
            source = "notion";
            console.log("✅ Found active timer in Notion:", activeTimer.id);
          }
        } catch (error: any) {
          errors.push(`Notion error: ${error.message}`);
          console.log("❌ Notion timer fetch failed:", error.message);
        }
      } else {
        errors.push("NOTION_TIMERSESSIONS_DATABASE_ID not configured");
        console.log("⚠️ Timer Sessions database not configured");
      }

      // Response with debug information
      res.json({
        timer: activeTimer,
        debug: {
          source,
          notionConfigured: !!NOTION_TIMERSESSIONS_DATABASE_ID,
          errors: errors.length > 0 ? errors : null,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error: any) {
      console.error("💥 Enhanced active timer error:", error);
      res.status(500).json({
        timer: null,
        debug: {
          source: "error",
          error: error.message,
          timestamp: new Date().toISOString()
        }
      });
    }
  });

  // Public can only VIEW active timers, not create them

  // Public routes (no auth required)
  app.get("/api/public/stats", async (req, res) => {
    try {
      const stats = await storage.getPublicStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch public stats" });
    }
  });

  app.get("/api/public/recent-content", async (req, res) => {
    try {
      const content = await storage.getPublicRecentContent();
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent content" });
    }
  });

  app.get("/api/public/active-timer", async (req, res) => {
    try {
      console.log("📱 Getting active timer for public view");

      // Try database first for production reliability
      try {
        const dbActiveSession = await storage.getActiveTimerSession();
        if (dbActiveSession) {
          // For Belle Journal count-up timers, calculate elapsed time
          const now = new Date();
          const startedAt = new Date(dbActiveSession.startedAt!);
          const elapsedSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
          
          // Check if timer has exceeded total duration (for count-up timers)
          const totalDurationSeconds = dbActiveSession.totalDuration * 60;
          if (elapsedSeconds >= totalDurationSeconds && dbActiveSession.isActive) {
            await storage.stopTimerSession(dbActiveSession.id);
            console.log("⏰ Timer completed full duration, marked as inactive");
            res.json(null);
            return;
          }
          
          const sessionWithUpdatedTime = {
            ...dbActiveSession,
            remainingTime: Math.max(0, totalDurationSeconds - elapsedSeconds),
            elapsedTime: elapsedSeconds
          };
          
          console.log("✅ Found active database timer session for public view:", sessionWithUpdatedTime.id);
          res.json(sessionWithUpdatedTime);
          return;
        }
      } catch (dbError) {
        console.log("⚠️ Database error in public timer view, falling back to Notion:", dbError);
      }

      // Fallback to Notion if configured
      if (NOTION_TIMERSESSIONS_DATABASE_ID) {
        try {
          const activeSession = await getActiveNotionTimerSession("admin");
          
          if (activeSession) {
            // Calculate actual remaining time based on elapsed time
            const now = new Date();
            const lastSync = new Date(activeSession.lastSync);
            const elapsedSinceSync = Math.floor((now.getTime() - lastSync.getTime()) / 1000);
            
            let updatedRemainingTime = activeSession.remainingTime;
            if (!activeSession.isPaused) {
              updatedRemainingTime = Math.max(0, activeSession.remainingTime - elapsedSinceSync);
            }

            // Update the session with current time if it's still active
            if (updatedRemainingTime > 0) {
              activeSession.remainingTime = updatedRemainingTime;
              activeSession.lastSync = now.toISOString();

              console.log("✅ Found active Notion timer session for public view:", activeSession.id);
              
              res.json({
                ...activeSession,
                remainingTime: updatedRemainingTime,
                lastSync: now.toISOString()
              });
              return;
            }
          }
        } catch (notionError) {
          console.log("⚠️ Notion error in public timer view:", (notionError as Error).message);
        }
      }

      // No active session found
      console.log("📱 No active timer session found for public view");
      res.json(null);
    } catch (error) {
      console.error("Error getting public active timer:", error);
      res.status(500).json({ error: "Failed to get active timer" });
    }
  });

  // Auth status endpoint
  app.get("/api/auth/status", (req: AuthenticatedRequest, res) => {
    res.json({ 
      authenticated: !!req.user,
      user: req.user,
      isAdmin: !!(req as any).session?.isAdmin
    });
  });

  // Authentication routes
  app.post("/api/auth/login", adminLogin);
  app.post("/api/auth/logout", adminLogout);

  // Public read-only routes for dashboard data
  app.get("/api/goals", async (req, res) => {
    try {
      const goals = await storage.getAllGoals();
      res.json(goals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch goals" });
    }
  });

  app.get("/api/daily-entry/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const entry = await storage.getDailyEntry(date);
      res.json(entry || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch daily entry" });
    }
  });

  app.get("/api/todos/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const todos = await storage.getTodosByDate(date);
      res.json(todos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch todos" });
    }
  });



  app.get("/api/grocery-items", async (req, res) => {
    try {
      const groceryItems = await storage.getAllGroceryItems();
      res.json(groceryItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch grocery items" });
    }
  });

  // Protected routes (require authentication for write operations)
  app.use("/api", (req, res, next) => {
    // Only require auth for write operations (POST, PUT, PATCH, DELETE)
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return requireAuth(req, res, next);
    }
    next();
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
      
      // Check goal limit (5 goals maximum)
      const existingGoals = await storage.getAllGoals();
      if (existingGoals.length >= 5) {
        return res.status(400).json({ 
          error: "Goal limit exceeded", 
          message: "You can only have a maximum of 5 goals at a time." 
        });
      }
      
      const data = insertGoalSchema.parse(req.body);
      console.log("Parsed goal data:", data);
      const goal = await storage.createGoal(data);
      res.json(goal);
    } catch (error) {
      console.error("Goal creation error:", error);
      res.status(400).json({ error: "Invalid goal data", details: (error as Error).message });
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
      res.status(400).json({ error: (error as Error).message || "Invalid todo data" });
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

  // Time Blocks (date-specific) - now using Notion integration
  app.get("/api/time-blocks/:date", async (req, res) => {
    try {
      const date = req.params.date;
      console.log(`📅 GET /api/time-blocks/${date} - Starting request`);
      
      // Check if we have the required environment variables
      if (!process.env.NOTION_TIMEBLOCKS_URL) {
        console.log("📅 NOTION_TIMEBLOCKS_URL not configured, using local storage");
        const timeBlocks = await storage.getTimeBlocksByDate(date);
        console.log(`📅 Local storage: returning ${timeBlocks.length} time blocks`);
        res.json(timeBlocks);
        return;
      }
      
      // Try to get from Notion first
      try {
        console.log(`📅 Attempting to fetch time blocks from Notion for ${date}`);
        const { getNotionTimeBlocks } = await import('./notion');
        const notionTimeBlocks = await getNotionTimeBlocks(date);
        console.log(`📅 SUCCESS: Fetched ${notionTimeBlocks.length} time blocks from Notion for ${date}`);
        res.json(notionTimeBlocks);
      } catch (notionError: any) {
        console.log("📅 NOTION ERROR: Falling back to local storage");
        console.error("📅 Error details:", notionError.message);
        console.error("📅 Error stack:", notionError.stack);
        // Fallback to local storage if Notion fails
        const timeBlocks = await storage.getTimeBlocksByDate(date);
        console.log(`📅 Fallback: returning ${timeBlocks.length} time blocks from local storage`);
        res.json(timeBlocks);
      }
    } catch (error: any) {
      console.error("📅 CRITICAL ERROR fetching time blocks:", error.message);
      res.status(500).json({ error: "Failed to fetch time blocks" });
    }
  });

  app.post("/api/time-blocks", async (req, res) => {
    try {
      const data = req.body;
      
      console.log("📅 Attempting to create time block:", data);
      
      // Try to create in Notion first
      try {
        const { createNotionTimeBlock } = await import('./notion');
        console.log("📅 Imported Notion functions, creating time block...");
        const notionTimeBlock = await createNotionTimeBlock({
          title: data.title,
          description: data.description,
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          category: data.category
        });
        console.log("📅 Successfully created time block in Notion:", notionTimeBlock);
        res.json(notionTimeBlock);
      } catch (notionError) {
        console.log("📅 Notion error, falling back to local storage:", notionError);
        console.error("📅 Detailed Notion creation error:", notionError);
        // Fallback to local storage if Notion fails
        const timeBlock = await storage.createTimeBlock(data);
        console.log("📅 Fallback: created time block in local storage:", timeBlock);
        res.json(timeBlock);
      }
    } catch (error) {
      console.error("Error creating time block:", error);
      res.status(400).json({ error: "Invalid time block data" });
    }
  });

  // Update time block route
  app.patch("/api/time-blocks/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const updates = req.body;
      
      // Try to update in Notion if it's a Notion ID (string)
      if (isNaN(Number(id))) {
        try {
          const { updateNotionTimeBlock } = await import('./notion');
          await updateNotionTimeBlock(id, updates);
          console.log("📅 Successfully updated time block in Notion");
          res.json({ success: true });
        } catch (notionError) {
          console.log("📅 Notion update error:", notionError);
          res.status(500).json({ error: "Failed to update time block in Notion" });
        }
      } else {
        // Local storage update for numeric IDs
        const timeBlock = await storage.updateTimeBlock(Number(id), updates);
        res.json(timeBlock);
      }
    } catch (error) {
      console.error("Error updating time block:", error);
      res.status(500).json({ error: "Failed to update time block" });
    }
  });

  // Delete time block route
  app.delete("/api/time-blocks/:id", async (req, res) => {
    try {
      const id = req.params.id;
      
      // Try to delete in Notion if it's a Notion ID (string)
      if (isNaN(Number(id))) {
        try {
          const { deleteNotionTimeBlock } = await import('./notion');
          await deleteNotionTimeBlock(id);
          console.log("📅 Successfully deleted time block from Notion");
          res.json({ success: true });
        } catch (notionError) {
          console.log("📅 Notion delete error:", notionError);
          res.status(500).json({ error: "Failed to delete time block from Notion" });
        }
      } else {
        // Local storage delete for numeric IDs
        await storage.deleteTimeBlock(Number(id));
        res.json({ success: true });
      }
    } catch (error) {
      console.error("Error deleting time block:", error);
      res.status(500).json({ error: "Failed to delete time block" });
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
      const insight = await storage.createPerformanceInsight(data);
      res.json(insight);
    } catch (error) {
      res.status(400).json({ error: "Invalid performance insight data" });
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

  // Blog Content Studio Routes
  // Blog Posts
  app.get("/api/blog/posts", async (req, res) => {
    try {
      const { status, platform } = req.query;
      let posts;
      
      if (status) {
        posts = await storage.getBlogPostsByStatus(status as string);
      } else if (platform) {
        posts = await storage.getBlogPostsByPlatform(platform as string);
      } else {
        posts = await storage.getAllBlogPosts();
      }
      
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/posts/:id", async (req, res) => {
    try {
      const post = await storage.getBlogPost(parseInt(req.params.id));
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blog post" });
    }
  });

  app.post("/api/blog/posts", async (req, res) => {
    try {
      const data = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(data);
      res.json(post);
    } catch (error) {
      res.status(400).json({ error: "Invalid blog post data" });
    }
  });

  app.patch("/api/blog/posts/:id", async (req, res) => {
    try {
      const post = await storage.updateBlogPost(parseInt(req.params.id), req.body);
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to update blog post" });
    }
  });

  app.delete("/api/blog/posts/:id", async (req, res) => {
    try {
      await storage.deleteBlogPost(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete blog post" });
    }
  });

  // Blog Ideas
  app.get("/api/blog/ideas", async (req, res) => {
    try {
      const { status, platform } = req.query;
      let ideas;
      
      if (status) {
        ideas = await storage.getBlogIdeasByStatus(status as string);
      } else if (platform) {
        ideas = await storage.getBlogIdeasByPlatform(platform as string);
      } else {
        ideas = await storage.getAllBlogIdeas();
      }
      
      res.json(ideas);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blog ideas" });
    }
  });

  app.post("/api/blog/ideas", async (req, res) => {
    try {
      const data = insertBlogIdeaSchema.parse(req.body);
      const idea = await storage.createBlogIdea(data);
      res.json(idea);
    } catch (error) {
      res.status(400).json({ error: "Invalid blog idea data" });
    }
  });

  app.patch("/api/blog/ideas/:id", async (req, res) => {
    try {
      const idea = await storage.updateBlogIdea(parseInt(req.params.id), req.body);
      res.json(idea);
    } catch (error) {
      res.status(500).json({ error: "Failed to update blog idea" });
    }
  });

  app.delete("/api/blog/ideas/:id", async (req, res) => {
    try {
      await storage.deleteBlogIdea(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete blog idea" });
    }
  });

  app.post("/api/blog/ideas/:id/generate-ai-content", async (req, res) => {
    try {
      const idea = await storage.generateAIContent(parseInt(req.params.id));
      res.json(idea);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate AI content" });
    }
  });

  // Blog Calendar
  app.get("/api/blog/calendar", async (req, res) => {
    try {
      const { date, startDate, endDate } = req.query;
      let events;
      
      if (date) {
        events = await storage.getBlogCalendarEventsByDate(date as string);
      } else if (startDate && endDate) {
        events = await storage.getBlogCalendarEventsByDateRange(startDate as string, endDate as string);
      } else {
        events = await storage.getAllBlogCalendarEvents();
      }
      
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blog calendar events" });
    }
  });

  app.post("/api/blog/calendar", async (req, res) => {
    try {
      const data = insertBlogCalendarSchema.parse(req.body);
      const event = await storage.createBlogCalendarEvent(data);
      res.json(event);
    } catch (error) {
      res.status(400).json({ error: "Invalid blog calendar data" });
    }
  });

  app.patch("/api/blog/calendar/:id", async (req, res) => {
    try {
      const event = await storage.updateBlogCalendarEvent(parseInt(req.params.id), req.body);
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to update blog calendar event" });
    }
  });

  app.delete("/api/blog/calendar/:id", async (req, res) => {
    try {
      await storage.deleteBlogCalendarEvent(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete blog calendar event" });
    }
  });

  // Blog Workflow Status - shows where posts are in development
  app.get("/api/blog/workflow-status", async (req, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      const ideas = await storage.getAllBlogIdeas();
      const calendar = await storage.getAllBlogCalendarEvents();
      
      const workflowStatus = {
        ideas: {
          total: ideas.length,
          byStatus: ideas.reduce((acc, idea) => {
            acc[idea.status] = (acc[idea.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          items: ideas.map(idea => ({
            id: idea.id,
            title: idea.title,
            status: idea.status,
            platform: idea.platform,
            priority: idea.priority,
            createdAt: idea.createdAt
          }))
        },
        posts: {
          total: posts.length,
          byStatus: posts.reduce((acc, post) => {
            acc[post.status] = (acc[post.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          items: posts.map(post => ({
            id: post.id,
            title: post.title,
            status: post.status,
            platform: post.platform,
            priority: post.priority,
            scheduledDate: post.scheduledDate,
            publishedDate: post.publishedDate,
            createdAt: post.createdAt
          }))
        },
        calendar: {
          upcoming: calendar.filter(event => 
            new Date(event.date) >= new Date() && event.status === 'scheduled'
          ).slice(0, 10),
          overdue: calendar.filter(event => 
            new Date(event.date) < new Date() && event.status === 'scheduled'
          )
        },
        workflow: {
          ideaStage: ideas.filter(i => i.status === 'idea').length,
          research: ideas.filter(i => i.status === 'in_progress').length,
          drafting: posts.filter(p => p.status === 'draft').length,
          review: posts.filter(p => p.status === 'scheduled').length,
          published: posts.filter(p => p.status === 'published').length
        }
      };
      
      res.json(workflowStatus);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workflow status" });
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

  // App Projects
  app.get("/api/app-projects", async (req, res) => {
    try {
      const projects = await storage.getAllAppProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch app projects" });
    }
  });

  app.post("/api/app-projects", async (req, res) => {
    try {
      const project = await storage.createAppProject(req.body);
      res.json(project);
    } catch (error) {
      res.status(400).json({ error: "Invalid app project data" });
    }
  });

  // App Tasks
  app.get("/api/app-tasks", async (req, res) => {
    try {
      const tasks = await storage.getAllAppTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch app tasks" });
    }
  });

  app.post("/api/app-tasks", async (req, res) => {
    try {
      const task = await storage.createAppTask(req.body);
      res.json(task);
    } catch (error) {
      res.status(400).json({ error: "Invalid app task data" });
    }
  });

  // Medications
  app.get("/api/medications", async (req, res) => {
    try {
      const medications = await storage.getAllMedications();
      res.json(medications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch medications" });
    }
  });

  app.post("/api/medications", async (req, res) => {
    try {
      const medication = await storage.createMedication(req.body);
      res.json(medication);
    } catch (error) {
      res.status(400).json({ error: "Invalid medication data" });
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

  // Budget Management Routes
  app.get("/api/budget-categories", async (req, res) => {
    try {
      const categories = await storage.getAllBudgetCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch budget categories" });
    }
  });

  app.post("/api/budget-categories", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertBudgetCategorySchema.parse(req.body);
      const category = await storage.createBudgetCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ error: "Invalid budget category data" });
    }
  });

  app.get("/api/budget-periods", async (req, res) => {
    try {
      const periods = await storage.getAllBudgetPeriods();
      res.json(periods);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch budget periods" });
    }
  });

  app.post("/api/budget-periods", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertBudgetPeriodSchema.parse(req.body);
      const period = await storage.createBudgetPeriod(validatedData);
      res.status(201).json(period);
    } catch (error) {
      res.status(400).json({ error: "Invalid budget period data" });
    }
  });

  app.get("/api/budget-alerts", async (req, res) => {
    try {
      const alerts = await storage.getAllBudgetAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch budget alerts" });
    }
  });

  app.get("/api/expenses", async (req, res) => {
    try {
      const expenses = await storage.getAllExpenses();
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expenses" });
    }
  });

  app.post("/api/expenses", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(validatedData);
      res.status(201).json(expense);
    } catch (error) {
      res.status(400).json({ error: "Invalid expense data" });
    }
  });

  app.get("/api/debts", async (req, res) => {
    try {
      const debts = await storage.getAllDebts();
      res.json(debts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch debts" });
    }
  });

  app.post("/api/debts", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertDebtSchema.parse(req.body);
      const debt = await storage.createDebt(validatedData);
      res.status(201).json(debt);
    } catch (error) {
      res.status(400).json({ error: "Invalid debt data" });
    }
  });

  app.get("/api/spending-trends", async (req, res) => {
    try {
      const trends = await storage.getAllSpendingTrends();
      res.json(trends);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch spending trends" });
    }
  });

  // Investment Management Routes
  app.get("/api/investments", async (req, res) => {
    try {
      const investments = await storage.getAllInvestments();
      res.json(investments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch investments" });
    }
  });

  app.post("/api/investments", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertInvestmentSchema.parse(req.body);
      const investment = await storage.createInvestment(validatedData);
      res.status(201).json(investment);
    } catch (error) {
      res.status(400).json({ error: "Invalid investment data" });
    }
  });

  app.get("/api/portfolios", async (req, res) => {
    try {
      const portfolios = await storage.getAllPortfolios();
      res.json(portfolios);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch portfolios" });
    }
  });

  app.post("/api/portfolios", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertPortfolioSchema.parse(req.body);
      const portfolio = await storage.createPortfolio(validatedData);
      res.status(201).json(portfolio);
    } catch (error) {
      res.status(400).json({ error: "Invalid portfolio data" });
    }
  });

  app.get("/api/portfolio-holdings", async (req, res) => {
    try {
      const holdings = await storage.getAllPortfolioHoldings();
      res.json(holdings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch portfolio holdings" });
    }
  });

  app.get("/api/investment-platforms", async (req, res) => {
    try {
      const platforms = await storage.getAllInvestmentPlatforms();
      res.json(platforms);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch investment platforms" });
    }
  });

  app.post("/api/investment-platforms", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertInvestmentPlatformSchema.parse(req.body);
      const platform = await storage.createInvestmentPlatform(validatedData);
      res.status(201).json(platform);
    } catch (error) {
      res.status(400).json({ error: "Invalid investment platform data" });
    }
  });

  app.get("/api/accounts", async (req, res) => {
    try {
      const accounts = await storage.getAllAccounts();
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch accounts" });
    }
  });

  app.post("/api/accounts", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertAccountSchema.parse(req.body);
      const account = await storage.createAccount(validatedData);
      res.status(201).json(account);
    } catch (error) {
      res.status(400).json({ error: "Invalid account data" });
    }
  });

  app.get("/api/net-worth-snapshots", async (req, res) => {
    try {
      const snapshots = await storage.getAllNetWorthSnapshots();
      res.json(snapshots);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch net worth snapshots" });
    }
  });

  app.post("/api/net-worth-snapshots", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertNetWorthSnapshotSchema.parse(req.body);
      const snapshot = await storage.createNetWorthSnapshot(validatedData);
      res.status(201).json(snapshot);
    } catch (error) {
      res.status(400).json({ error: "Invalid net worth snapshot data" });
    }
  });

  app.get("/api/investment-transactions", async (req, res) => {
    try {
      const transactions = await storage.getAllInvestmentTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch investment transactions" });
    }
  });

  app.post("/api/investment-transactions", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertInvestmentTransactionSchema.parse(req.body);
      const transaction = await storage.createInvestmentTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(400).json({ error: "Invalid investment transaction data" });
    }
  });

  // Financial Analytics Routes
  app.get("/api/budget-analytics/:month", async (req, res) => {
    try {
      const month = req.params.month;
      const analytics = await storage.getBudgetAnalytics(month);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch budget analytics" });
    }
  });

  app.get("/api/debt-payoff-projections", async (req, res) => {
    try {
      const projections = await storage.calculateDebtPayoffTimelines();
      res.json(projections);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch debt payoff projections" });
    }
  });

  app.get("/api/investment-performance/:period", async (req, res) => {
    try {
      // Mock investment performance data for the period
      const period = req.params.period;
      const performance = await storage.getInvestmentPerformance();
      res.json(performance || []);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch investment performance" });
    }
  });

  app.get("/api/portfolio-performance/:portfolioId", async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.portfolioId);
      const performance = await storage.calculatePortfolioPerformance(portfolioId);
      res.json(performance);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch portfolio performance" });
    }
  });

  app.get("/api/net-worth-history", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const history = await storage.calculateNetWorthOverTime(
        startDate as string || "2024-01-01", 
        endDate as string || new Date().toISOString().split('T')[0]
      );
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch net worth history" });
    }
  });

  // Notion Integration Routes
  app.get("/api/notion/databases", async (req, res) => {
    try {
      const databases = await getNotionDatabases();
      res.json(databases);
    } catch (error) {
      console.error("Error fetching Notion databases:", error);
      res.status(500).json({ error: "Failed to fetch Notion databases" });
    }
  });

  // Production debugging endpoint
  app.get("/api/notion/production-test", async (req, res) => {
    try {
      const results = {
        environment: process.env.NODE_ENV,
        hasSecret: !!process.env.NOTION_INTEGRATION_SECRET,
        hasUrl: !!process.env.NOTION_PAGE_URL,
        timestamp: new Date().toISOString(),
        tests: []
      };
      
      if (!process.env.NOTION_INTEGRATION_SECRET) {
        results.tests.push({
          name: 'Environment Variables',
          status: 'FAILED',
          error: 'NOTION_INTEGRATION_SECRET not configured'
        });
        return res.json(results);
      }
      
      if (!process.env.NOTION_PAGE_URL) {
        results.tests.push({
          name: 'Environment Variables',
          status: 'FAILED',
          error: 'NOTION_PAGE_URL not configured'
        });
        return res.json(results);
      }
      
      results.tests.push({
        name: 'Environment Variables',
        status: 'PASSED',
        details: {
          secretLength: process.env.NOTION_INTEGRATION_SECRET.length,
          secretFormat: process.env.NOTION_INTEGRATION_SECRET.startsWith('ntn_'),
          urlFormat: process.env.NOTION_PAGE_URL.includes('notion.so')
        }
      });
      
      // Test database connection
      try {
        const databases = await getNotionDatabases();
        results.tests.push({
          name: 'Database Connection',
          status: 'PASSED',
          details: { 
            databaseCount: databases.length,
            databases: databases.map(db => ({
              id: db.id,
              title: db.title?.[0]?.plain_text || 'Unknown'
            }))
          }
        });
        
        // Test task retrieval
        const tasks = await getNotionTasks();
        results.tests.push({
          name: 'Task Retrieval',
          status: 'PASSED',
          details: { taskCount: tasks.length }
        });
        
      } catch (error) {
        results.tests.push({
          name: 'Database Connection',
          status: 'FAILED',
          error: error.message,
          code: error.code,
          status: error.status
        });
      }
      
      res.json(results);
      
    } catch (error) {
      res.status(500).json({
        error: 'Production test failed',
        message: error.message
      });
    }
  });

  app.get("/api/notion/tasks", async (req, res) => {
    try {
      const { date, view } = req.query;
      
      console.log("📋 Fetching Notion tasks for date:", date, "view:", view);
      console.log("🔍 Environment check - Secret exists:", !!process.env.NOTION_INTEGRATION_SECRET);
      console.log("🔍 Environment check - URL exists:", !!process.env.NOTION_PAGE_URL);
      
      const tasks = await getNotionTasks();
      
      console.log("📋 Retrieved", tasks.length, "tasks from Notion");
      
      // Filter by date if provided
      if (date && view) {
        const targetDate = new Date(date as string);
        const filteredTasks = tasks.filter(task => {
          if (!task.dueDate) return false;
          
          const taskDate = new Date(task.dueDate);
          const taskDateStr = taskDate.toISOString().split('T')[0];
          const targetDateStr = targetDate.toISOString().split('T')[0];
          
          return taskDateStr === targetDateStr;
        });
        
        console.log("📋 Filtered to", filteredTasks.length, "tasks for selected date");
        res.json(filteredTasks);
      } else {
        res.json(tasks);
      }
    } catch (error: any) {
      console.error("❌ Error fetching Notion entries:", error.message);
      console.error("❌ Error code:", error.code);
      console.error("❌ Error status:", error.status);
      console.error("❌ Full error:", error);
      
      // Return specific error message for debugging
      res.status(500).json({ 
        error: `Failed to fetch Notion entries: ${error.message}`,
        code: error.code,
        status: error.status 
      });
    }
  });

  app.post("/api/notion/tasks", requireAuth, async (req, res) => {
    try {
      console.log("📋 POST /api/notion/tasks - Starting task creation");
      console.log("📋 User authenticated:", (req as any).session?.userId ? "YES" : "NO");
      console.log("📋 Database ID available:", NOTION_TASKS_DATABASE_ID ? "YES" : "NO");
      console.log("📋 Request body:", JSON.stringify(req.body, null, 2));
      
      if (!NOTION_TASKS_DATABASE_ID) {
        console.error("❌ NOTION_TASKS_DATABASE_ID is null - environment variables not configured");
        return res.status(500).json({ 
          error: "Database ID not configured",
          details: "NOTION_TASKS_DATABASE_ID is null"
        });
      }
      
      // Convert dueDate string to Date object if needed
      const taskData = { ...req.body };
      if (taskData.dueDate && typeof taskData.dueDate === 'string') {
        taskData.dueDate = new Date(taskData.dueDate);
      }
      
      const task = await createNotionTask(NOTION_TASKS_DATABASE_ID, taskData);
      console.log("📋 Successfully created task:", task.id);
      res.json(task);
    } catch (error: any) {
      console.error("❌ Error creating Notion task:", error.message);
      console.error("❌ Error code:", error.code);
      console.error("❌ Error status:", error.status);
      console.error("❌ Full error:", error);
      res.status(500).json({ 
        error: `Failed to create Notion task: ${error.message}`,
        code: error.code,
        status: error.status
      });
    }
  });

  app.patch("/api/notion/tasks/:pageId", requireAuth, async (req, res) => {
    try {
      const { pageId } = req.params;
      const task = await updateNotionTask(pageId, req.body);
      res.json(task);
    } catch (error) {
      console.error("Error updating Notion task:", error);
      res.status(500).json({ error: "Failed to update Notion task" });
    }
  });

  app.delete("/api/notion/tasks/:pageId", requireAuth, async (req, res) => {
    try {
      const { pageId } = req.params;
      await deleteNotionTask(pageId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting Notion task:", error);
      res.status(500).json({ error: "Failed to delete Notion task" });
    }
  });

  // Debug endpoint for production testing
  app.get("/api/notion/debug", async (req, res) => {
    try {
      const authStatus = {
        authenticated: !!(req as any).session?.userId,
        isAdmin: !!(req as any).session?.isAdmin,
        sessionData: (req as any).session
      };
      
      const configStatus = {
        hasSecret: !!process.env.NOTION_INTEGRATION_SECRET,
        hasTasksUrl: !!process.env.NOTION_TASKS_URL,
        hasTimeBlocksUrl: !!process.env.NOTION_TIMEBLOCKS_URL,
        hasTimerSessionsUrl: !!process.env.NOTION_TIMERSESSIONS_URL,
        tasksDbId: NOTION_TASKS_DATABASE_ID ? `${NOTION_TASKS_DATABASE_ID.substring(0, 8)}...` : null,
        timeBlocksDbId: NOTION_TIMEBLOCKS_DATABASE_ID ? `${NOTION_TIMEBLOCKS_DATABASE_ID.substring(0, 8)}...` : null,
        timerSessionsDbId: NOTION_TIMERSESSIONS_DATABASE_ID ? `${NOTION_TIMERSESSIONS_DATABASE_ID.substring(0, 8)}...` : null,
        tasksDbIdFull: NOTION_TASKS_DATABASE_ID,
        timeBlocksDbIdFull: NOTION_TIMEBLOCKS_DATABASE_ID,
        timerSessionsDbIdFull: NOTION_TIMERSESSIONS_DATABASE_ID
      };
      
      res.json({
        auth: authStatus,
        config: configStatus,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/notion/setup", async (req, res) => {
    try {
      // Check if environment variables are configured
      if (!process.env.NOTION_INTEGRATION_SECRET) {
        console.error("❌ NOTION_INTEGRATION_SECRET not configured in production");
        return res.status(500).json({ 
          isSetup: false, 
          error: "NOTION_INTEGRATION_SECRET not configured",
          databases: []
        });
      }

      if (!process.env.NOTION_PAGE_URL) {
        console.error("❌ NOTION_PAGE_URL not configured in production");
        return res.status(500).json({ 
          isSetup: false, 
          error: "NOTION_PAGE_URL not configured",
          databases: []
        });
      }

      console.log("✅ Environment variables configured, attempting database connection...");
      
      const databases = await getNotionDatabases();
      const hasRequiredDbs = true; // We have your existing TABLEMAKER database
      
      console.log("✅ Database connection successful:", databases.length, "databases found");
      
      res.json({ 
        isSetup: hasRequiredDbs, 
        databases: databases.map(db => ({
          id: db.id,
          title: db.title && Array.isArray(db.title) && db.title.length > 0 
            ? db.title[0].plain_text 
            : "Untitled"
        }))
      });
    } catch (error) {
      console.error("❌ Error checking Notion setup:", error);
      console.error("Error type:", error.constructor.name);
      console.error("Error message:", error.message);
      if (error.code) {
        console.error("Error code:", error.code);
      }
      res.status(500).json({ 
        isSetup: false, 
        error: `Failed to connect to Notion: ${error.message}`,
        databases: []
      });
    }
  });



  // Mount Timer routes
  app.use("/api/timer", timerRoutes);

  // Mount Fitness routes
  app.use("/api", fitnessRoutes);

  const httpServer = createServer(app);
  return httpServer;
}