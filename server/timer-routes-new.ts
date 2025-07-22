import { Router } from "express";
import { requireAuth } from "./auth";
import { insertTimerSessionSchema, type TimerSession } from "../shared/schema";
import { storage } from "./storage";
import { 
  getActiveNotionTimerSession, 
  createNotionTimerSession, 
  updateNotionTimerSession,
  NOTION_TIMERSESSIONS_DATABASE_ID 
} from "./notion";

const router = Router();

// Get active timer session for current user (Admin authenticated)
router.get("/active", requireAuth, async (req, res) => {
  try {
    console.log("⏱️ Getting active timer session for admin user");

    // Try database first
    try {
      const dbActiveSession = await storage.getActiveTimerSession();
      if (dbActiveSession) {
        // Calculate actual remaining time based on elapsed time
        const now = new Date();
        const lastSync = new Date(dbActiveSession.lastSync!);
        const elapsedSeconds = Math.floor((now.getTime() - lastSync.getTime()) / 1000);
        const adjustedRemainingTime = Math.max(0, dbActiveSession.remainingTime - elapsedSeconds);
        
        // If timer has run out, mark as inactive
        if (adjustedRemainingTime <= 0 && dbActiveSession.isActive) {
          await storage.stopTimerSession(dbActiveSession.id);
          return res.json(null);
        }
        
        const sessionWithUpdatedTime = {
          ...dbActiveSession,
          remainingTime: adjustedRemainingTime
        };
        
        console.log("✅ Found active database timer session:", sessionWithUpdatedTime.id);
        return res.json(sessionWithUpdatedTime);
      }
    } catch (dbError) {
      console.log("⚠️ Database error, falling back to Notion:", dbError);
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

          // Update the session with current time
          activeSession.remainingTime = updatedRemainingTime;
          activeSession.lastSync = now.toISOString();

          res.json({
            ...activeSession,
            remainingTime: updatedRemainingTime,
            lastSync: now.toISOString()
          });
        } else {
          res.json(null);
        }
        return;
      } catch (notionError: any) {
        console.log("⏱️ Notion fallback error:", notionError?.message || notionError);
      }
    }

    // No active session found
    res.json(null);
  } catch (error) {
    console.error("Error getting active timer session:", error);
    res.status(500).json({ error: "Failed to get active timer session" });
  }
});

// Start new timer session (Admin authenticated)
router.post("/start", requireAuth, async (req, res) => {
  try {
    const validatedData = insertTimerSessionSchema.parse(req.body);
    console.log("⏱️ Starting new timer session:", validatedData.title);
    
    // Try database first
    try {
      // End any existing active sessions in database first
      const activeSession = await storage.getActiveTimerSession();
      if (activeSession) {
        await storage.stopTimerSession(activeSession.id);
      }

      // Create new session in database
      const newSession = await storage.createTimerSession({
        ...validatedData,
        userId: "admin"
      });

      console.log("⏱️ Successfully created timer session in database:", newSession.id);
      res.json(newSession);
      return;
    } catch (dbError) {
      console.log("⚠️ Database error, falling back to Notion:", dbError);
    }
    
    // Fallback to Notion if configured
    if (NOTION_TIMERSESSIONS_DATABASE_ID) {
      try {
        // End any existing active sessions in Notion first
        const activeSession = await getActiveNotionTimerSession("admin");
        if (activeSession) {
          await updateNotionTimerSession(activeSession.id, { isActive: false });
        }

        // Create new session in Notion
        const notionResponse = await createNotionTimerSession({
          ...validatedData,
          userId: "admin",
          title: validatedData.title || "",
          category: validatedData.category || ""
        });

        console.log("⏱️ Successfully created timer session in Notion:", notionResponse.id);
        
        // Return the Notion session formatted for the frontend
        const newSession = {
          id: notionResponse.id,
          notionId: notionResponse.id,
          ...validatedData,
          userId: "admin",
          isActive: true,
          startedAt: new Date().toISOString(),
          lastSync: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        res.json(newSession);
        return;
      } catch (notionError: any) {
        console.log("⏱️ Notion fallback error:", notionError?.message || notionError);
      }
    }

    // Final fallback - this should not happen in normal operation
    res.status(500).json({ error: "Timer storage unavailable" });
  } catch (error) {
    console.error("Error starting timer session:", error);
    res.status(500).json({ error: "Failed to start timer session" });
  }
});

// Pause timer session (Admin authenticated)
router.patch("/:id/pause", requireAuth, async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    
    // Try database first
    if (!isNaN(sessionId)) {
      try {
        const updatedSession = await storage.pauseTimerSession(sessionId);
        console.log("⏱️ Paused database timer session:", sessionId);
        res.json(updatedSession);
        return;
      } catch (dbError) {
        console.log("⚠️ Database error, trying Notion:", dbError);
      }
    }
    
    // Fallback to Notion
    if (NOTION_TIMERSESSIONS_DATABASE_ID) {
      try {
        const updatedSession = await updateNotionTimerSession(req.params.id, { 
          isPaused: true,
          lastSync: new Date().toISOString()
        });
        console.log("⏱️ Paused Notion timer session:", req.params.id);
        res.json(updatedSession);
        return;
      } catch (notionError: any) {
        console.log("⏱️ Notion pause error:", notionError?.message || notionError);
      }
    }

    res.status(404).json({ error: "Timer session not found" });
  } catch (error) {
    console.error("Error pausing timer session:", error);
    res.status(500).json({ error: "Failed to pause timer session" });
  }
});

// Resume timer session (Admin authenticated)
router.patch("/:id/resume", requireAuth, async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    
    // Try database first
    if (!isNaN(sessionId)) {
      try {
        const updatedSession = await storage.resumeTimerSession(sessionId);
        console.log("⏱️ Resumed database timer session:", sessionId);
        res.json(updatedSession);
        return;
      } catch (dbError) {
        console.log("⚠️ Database error, trying Notion:", dbError);
      }
    }
    
    // Fallback to Notion
    if (NOTION_TIMERSESSIONS_DATABASE_ID) {
      try {
        const updatedSession = await updateNotionTimerSession(req.params.id, { 
          isPaused: false,
          lastSync: new Date().toISOString()
        });
        console.log("⏱️ Resumed Notion timer session:", req.params.id);
        res.json(updatedSession);
        return;
      } catch (notionError: any) {
        console.log("⏱️ Notion resume error:", notionError?.message || notionError);
      }
    }

    res.status(404).json({ error: "Timer session not found" });
  } catch (error) {
    console.error("Error resuming timer session:", error);
    res.status(500).json({ error: "Failed to resume timer session" });
  }
});

// Stop timer session (Admin authenticated)
router.patch("/:id/stop", requireAuth, async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    
    // Try database first
    if (!isNaN(sessionId)) {
      try {
        const updatedSession = await storage.stopTimerSession(sessionId);
        console.log("⏱️ Stopped database timer session:", sessionId);
        res.json(updatedSession);
        return;
      } catch (dbError) {
        console.log("⚠️ Database error, trying Notion:", dbError);
      }
    }
    
    // Fallback to Notion
    if (NOTION_TIMERSESSIONS_DATABASE_ID) {
      try {
        const updatedSession = await updateNotionTimerSession(req.params.id, { 
          isActive: false,
          isPaused: false,
          lastSync: new Date().toISOString()
        });
        console.log("⏱️ Stopped Notion timer session:", req.params.id);
        res.json(updatedSession);
        return;
      } catch (notionError: any) {
        console.log("⏱️ Notion stop error:", notionError?.message || notionError);
      }
    }

    res.status(404).json({ error: "Timer session not found" });
  } catch (error) {
    console.error("Error stopping timer session:", error);
    res.status(500).json({ error: "Failed to stop timer session" });
  }
});

export default router;