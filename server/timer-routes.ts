import { Router } from "express";
import { requireAuth } from "./auth";
import { insertTimerSessionSchema } from "../shared/schema";
import { z } from "zod";

// Simple in-memory storage for timer sessions until database is set up
interface TimerSession {
  id: number;
  userId: string;
  mode: string;
  title?: string;
  category?: string;
  totalDuration: number;
  remainingTime: number;
  currentSession: number;
  totalSessions: number;
  isBreak: boolean;
  isActive: boolean;
  isPaused: boolean;
  startedAt: string;
  pausedAt?: string;
  lastSync: string;
  totalFocusTime: number;
  completedSessions: number;
  createdAt: string;
  updatedAt: string;
}

// In-memory storage
let timerSessions: TimerSession[] = [];
let nextId = 1;

const router = Router();

// Get active timer session for current user
router.get("/active", requireAuth, async (req, res) => {
  try {
    const activeSession = timerSessions.find(
      session => session.userId === req.user!.id && session.isActive
    );

    if (activeSession) {
      // Calculate actual remaining time based on elapsed time
      const now = new Date();
      const lastSync = new Date(activeSession.lastSync);
      const elapsedSinceSync = Math.floor((now.getTime() - lastSync.getTime()) / 1000);
      
      let updatedRemainingTime = activeSession.remainingTime;
      if (!activeSession.isPaused) {
        updatedRemainingTime = Math.max(0, activeSession.remainingTime - elapsedSinceSync);
      }

      // Update the session with current time
      activeSession.remainingTime = updatedRemainingTime;
      activeSession.lastSync = now.toISOString();
      activeSession.updatedAt = now.toISOString();

      res.json({
        ...activeSession,
        remainingTime: updatedRemainingTime,
        lastSync: now.toISOString()
      });
    } else {
      res.json(null);
    }
  } catch (error) {
    console.error("Error getting active timer session:", error);
    res.status(500).json({ error: "Failed to get active timer session" });
  }
});

// Start new timer session
router.post("/start", requireAuth, async (req, res) => {
  try {
    const validatedData = insertTimerSessionSchema.parse(req.body);
    
    // End any existing active sessions first
    timerSessions.forEach(session => {
      if (session.userId === req.user!.id && session.isActive) {
        session.isActive = false;
        session.updatedAt = new Date().toISOString();
      }
    });

    // Create new session
    const newSession: TimerSession = {
      id: nextId++,
      ...validatedData,
      userId: req.user!.id,
      isActive: true,
      startedAt: new Date().toISOString(),
      lastSync: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    timerSessions.push(newSession);
    res.json(newSession);
  } catch (error) {
    console.error("Error starting timer session:", error);
    res.status(500).json({ error: "Failed to start timer session" });
  }
});

// Update timer session (pause, resume, sync)
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    const updates = req.body;
    
    const sessionIndex = timerSessions.findIndex(
      session => session.id === sessionId && session.userId === req.user!.id
    );

    if (sessionIndex === -1) {
      return res.status(404).json({ error: "Timer session not found" });
    }

    // Update the session
    const session = timerSessions[sessionIndex];
    Object.assign(session, updates, {
      lastSync: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    res.json(session);
  } catch (error) {
    console.error("Error updating timer session:", error);
    res.status(500).json({ error: "Failed to update timer session" });
  }
});

// Complete timer session
router.post("/:id/complete", requireAuth, async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    
    const sessionIndex = timerSessions.findIndex(
      session => session.id === sessionId && session.userId === req.user!.id
    );

    if (sessionIndex === -1) {
      return res.status(404).json({ error: "Timer session not found" });
    }

    const session = timerSessions[sessionIndex];
    session.isActive = false;
    session.remainingTime = 0;
    session.completedSessions = session.completedSessions + 1;
    session.lastSync = new Date().toISOString();
    session.updatedAt = new Date().toISOString();

    res.json(session);
  } catch (error) {
    console.error("Error completing timer session:", error);
    res.status(500).json({ error: "Failed to complete timer session" });
  }
});

// Stop/cancel timer session
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    
    const sessionIndex = timerSessions.findIndex(
      session => session.id === sessionId && session.userId === req.user!.id
    );

    if (sessionIndex === -1) {
      return res.status(404).json({ error: "Timer session not found" });
    }

    const session = timerSessions[sessionIndex];
    session.isActive = false;
    session.lastSync = new Date().toISOString();
    session.updatedAt = new Date().toISOString();

    res.json(session);
  } catch (error) {
    console.error("Error stopping timer session:", error);
    res.status(500).json({ error: "Failed to stop timer session" });
  }
});

// Get timer session history
router.get("/history", requireAuth, async (req, res) => {
  try {
    const userSessions = timerSessions
      .filter(session => session.userId === req.user!.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50);

    res.json(userSessions);
  } catch (error) {
    console.error("Error getting timer history:", error);
    res.status(500).json({ error: "Failed to get timer history" });
  }
});

export default router;