import { Router } from "express";
import { requireAuth } from "./auth";
import { timerSessions, insertTimerSessionSchema } from "../shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

// We'll use storage interface for now since db is not set up yet
import { storage } from "./storage";

const router = Router();

// Get active timer session for current user
router.get("/active", requireAuth, async (req, res) => {
  try {
    const [activeSession] = await db
      .select()
      .from(timerSessions)
      .where(
        and(
          eq(timerSessions.userId, req.user!.id),
          eq(timerSessions.isActive, true)
        )
      )
      .orderBy(desc(timerSessions.startedAt))
      .limit(1);

    if (activeSession) {
      // Calculate actual remaining time based on elapsed time
      const now = new Date();
      const lastSync = new Date(activeSession.lastSync!);
      const elapsedSinceSync = Math.floor((now.getTime() - lastSync.getTime()) / 1000);
      
      let updatedRemainingTime = activeSession.remainingTime;
      if (!activeSession.isPaused) {
        updatedRemainingTime = Math.max(0, activeSession.remainingTime - elapsedSinceSync);
      }

      // Update the session with current time
      await db
        .update(timerSessions)
        .set({
          remainingTime: updatedRemainingTime,
          lastSync: now,
          updatedAt: now
        })
        .where(eq(timerSessions.id, activeSession.id));

      res.json({
        ...activeSession,
        remainingTime: updatedRemainingTime,
        lastSync: now
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
    await db
      .update(timerSessions)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(timerSessions.userId, req.user!.id),
          eq(timerSessions.isActive, true)
        )
      );

    // Create new session
    const [newSession] = await db
      .insert(timerSessions)
      .values({
        ...validatedData,
        userId: req.user!.id,
        isActive: true,
        startedAt: new Date(),
        lastSync: new Date()
      })
      .returning();

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
    
    const [updatedSession] = await db
      .update(timerSessions)
      .set({
        ...updates,
        lastSync: new Date(),
        updatedAt: new Date()
      })
      .where(
        and(
          eq(timerSessions.id, sessionId),
          eq(timerSessions.userId, req.user!.id)
        )
      )
      .returning();

    if (!updatedSession) {
      return res.status(404).json({ error: "Timer session not found" });
    }

    res.json(updatedSession);
  } catch (error) {
    console.error("Error updating timer session:", error);
    res.status(500).json({ error: "Failed to update timer session" });
  }
});

// Complete timer session
router.post("/:id/complete", requireAuth, async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    
    const [completedSession] = await db
      .update(timerSessions)
      .set({
        isActive: false,
        remainingTime: 0,
        completedSessions: db.$count(timerSessions.completedSessions) + 1,
        lastSync: new Date(),
        updatedAt: new Date()
      })
      .where(
        and(
          eq(timerSessions.id, sessionId),
          eq(timerSessions.userId, req.user!.id)
        )
      )
      .returning();

    if (!completedSession) {
      return res.status(404).json({ error: "Timer session not found" });
    }

    res.json(completedSession);
  } catch (error) {
    console.error("Error completing timer session:", error);
    res.status(500).json({ error: "Failed to complete timer session" });
  }
});

// Stop/cancel timer session
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    
    const [stoppedSession] = await db
      .update(timerSessions)
      .set({
        isActive: false,
        lastSync: new Date(),
        updatedAt: new Date()
      })
      .where(
        and(
          eq(timerSessions.id, sessionId),
          eq(timerSessions.userId, req.user!.id)
        )
      )
      .returning();

    if (!stoppedSession) {
      return res.status(404).json({ error: "Timer session not found" });
    }

    res.json(stoppedSession);
  } catch (error) {
    console.error("Error stopping timer session:", error);
    res.status(500).json({ error: "Failed to stop timer session" });
  }
});

// Get timer session history
router.get("/history", requireAuth, async (req, res) => {
  try {
    const sessions = await db
      .select()
      .from(timerSessions)
      .where(eq(timerSessions.userId, req.user!.id))
      .orderBy(desc(timerSessions.createdAt))
      .limit(50);

    res.json(sessions);
  } catch (error) {
    console.error("Error getting timer history:", error);
    res.status(500).json({ error: "Failed to get timer history" });
  }
});

export default router;