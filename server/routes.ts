import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertDailyEntrySchema, 
  insertBillSchema, 
  insertBillPaymentSchema, 
  insertGroceryItemSchema 
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

  const httpServer = createServer(app);
  return httpServer;
}
