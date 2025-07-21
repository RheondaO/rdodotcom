import { Router } from "express";
import { NOTION_TIMERSESSIONS_DATABASE_ID, getActiveNotionTimerSession } from "./notion";

const router = Router();

// Comprehensive timer debug endpoint for production troubleshooting
router.get("/debug", async (req, res) => {
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

// Enhanced active timer endpoint with detailed debugging
router.get("/active-enhanced", async (req, res) => {
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

export default router;