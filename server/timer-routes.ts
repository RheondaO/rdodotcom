import { Router } from "express";
import { requireAuth } from "./auth";
import { insertTimerSessionSchema } from "../shared/schema";
import { z } from "zod";

import { 
  getActiveNotionTimerSession, 
  createNotionTimerSession, 
  updateNotionTimerSession,
  NOTION_TIMERSESSIONS_DATABASE_ID 
} from "./notion";

// Simple in-memory storage as fallback
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

// In-memory storage as fallback
let timerSessions: TimerSession[] = [];
let nextId = 1;

const router = Router();

// Get active timer session for current user
router.get("/active", requireAuth, async (req, res) => {
  try {
    console.log("⏱️ Getting active timer session for user:", req.user!.id);

    // Try Notion first if configured
    if (NOTION_TIMERSESSIONS_DATABASE_ID) {
      try {
        const activeSession = await getActiveNotionTimerSession(req.user!.id);
        
        if (activeSession) {
          // Calculate actual remaining time based on elapsed time
          const now = new Date();
          const lastSync = new Date(activeSession.lastSync);
          const elapsedSinceSync = Math.floor((now.getTime() - lastSync.getTime()) / 1000);
          
          let updatedRemainingTime = activeSession.remainingTime;
          if (!activeSession.isPaused) {
            updatedRemainingTime = Math.max(0, activeSession.remainingTime - elapsedSinceSync);
          }

          // Update the session in Notion with current time
          await updateNotionTimerSession(activeSession.id, {
            remainingTime: updatedRemainingTime
          });

          res.json({
            ...activeSession,
            remainingTime: updatedRemainingTime,
            lastSync: now.toISOString()
          });
          return;
        }
      } catch (notionError) {
        console.log("⏱️ Notion fallback error:", notionError.message);
      }
    }

    // Fallback to in-memory storage
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
    console.log("⏱️ Starting new timer session:", validatedData.title);
    
    // Try Notion first if configured
    if (NOTION_TIMERSESSIONS_DATABASE_ID) {
      try {
        // End any existing active sessions in Notion first
        const activeSession = await getActiveNotionTimerSession(req.user!.id);
        if (activeSession) {
          await updateNotionTimerSession(activeSession.id, { isActive: false });
        }

        // Create new session in Notion
        const notionResponse = await createNotionTimerSession({
          ...validatedData,
          userId: req.user!.id
        });

        console.log("⏱️ Successfully created timer session in Notion:", notionResponse.id);
        
        // Return the Notion session formatted for the frontend
        const newSession = {
          id: notionResponse.id,
          notionId: notionResponse.id,
          ...validatedData,
          userId: req.user!.id,
          isActive: true,
          startedAt: new Date().toISOString(),
          lastSync: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        res.json(newSession);
        return;
      } catch (notionError) {
        console.log("⏱️ Notion fallback error:", notionError.message);
      }
    }

    // Fallback to in-memory storage
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
    const sessionId = req.params.id;
    const updates = req.body;
    console.log("⏱️ Updating timer session:", sessionId, updates);
    
    // Try Notion first if session ID looks like a Notion ID (string format)
    if (NOTION_TIMERSESSIONS_DATABASE_ID && typeof sessionId === 'string' && sessionId.length > 10) {
      try {
        await updateNotionTimerSession(sessionId, updates);
        
        // Get updated session from Notion
        const updatedSession = await getActiveNotionTimerSession(req.user!.id);
        if (updatedSession) {
          res.json(updatedSession);
          return;
        }
      } catch (notionError) {
        console.log("⏱️ Notion update fallback error:", notionError.message);
      }
    }

    // Fallback to in-memory storage
    const sessionIndex = timerSessions.findIndex(
      session => session.id === parseInt(sessionId) && session.userId === req.user!.id
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