import { Router } from "express";
import { z } from "zod";
import { recurrenceEngine, RecurrencePattern } from "./recurrence-engine";
import { moonPhaseService } from "./moon-phase-service";
import { notion, findDatabaseByTitle } from "./notion";
import {
  ScheduleTemplate,
  ScheduledContentItem,
  WeeklyConfig,
  NthWeekdayConfig,
  QuarterlyConfig,
  MonthlyDayConfig,
  MoonPhaseConfig,
} from "../shared/schema";
import {
  PAGE_OPTIONS,
  MINI_GAME_TITLES,
  CONTENT_STATUS_OPTIONS,
  MOON_PHASE_BACKEND_VALUES,
} from "../shared/dropdown-constants";

const router = Router();

// Validation schemas
const weeklyConfigSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  time: z.string().optional(),
});

const nthWeekdayConfigSchema = z.object({
  weekNumber: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(-1),
  ]),
  dayOfWeek: z.number().min(0).max(6),
  time: z.string().optional(),
});

const quarterlyConfigSchema = z.object({
  monthInQuarter: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  dayOfMonth: z.number().min(1).max(31),
  time: z.string().optional(),
});

const monthlyDayConfigSchema = z.object({
  dayOfMonth: z.number().min(1).max(31),
  time: z.string().optional(),
});

const moonPhaseConfigSchema = z.object({
  phaseTypes: z.array(
    z.enum([
      "new_moon",
      "first_quarter",
      "full_moon",
      "last_quarter",
      "waxing_crescent",
      "waxing_gibbous",
      "waning_gibbous",
      "waning_crescent",
    ]),
  ),
  offsetDays: z.number().optional(),
  time: z.string().optional(),
});

const scheduleTemplateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  recurrenceType: z.enum([
    "weekly",
    "nth_weekday",
    "quarterly",
    "monthly_day",
    "moon_phase",
  ]),
  recurrenceConfig: z.union([
    weeklyConfigSchema,
    nthWeekdayConfigSchema,
    quarterlyConfigSchema,
    monthlyDayConfigSchema,
    moonPhaseConfigSchema,
  ]),
});

const scheduledContentItemSchema = z.object({
  templateId: z.number().nullable(),
  notionPageId: z.string().optional().nullable(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  miniGameBlockId: z.number().optional(),
  scheduledDate: z.string().transform((str) => new Date(str)),
  metadata: z.record(z.any()).optional(),
  // New fields for automatic population with validation
  page: z
    .enum(PAGE_OPTIONS as unknown as [string, ...string[]])
    .optional()
    .nullable(),
  month: z.string().optional().nullable(),
  dayOfWeek: z.string().optional().nullable(),
  moonPhase: z
    .enum(MOON_PHASE_BACKEND_VALUES as unknown as [string, ...string[]])
    .optional()
    .nullable(),
  squareType: z
    .enum(MINI_GAME_TITLES as unknown as [string, ...string[]])
    .optional()
    .nullable(),
  definitionTerm: z.string().optional().nullable(),
  status: z
    .enum(CONTENT_STATUS_OPTIONS as unknown as [string, ...string[]])
    .optional(),
});

// In-memory storage for demo (replace with actual database calls)
let scheduleTemplates: ScheduleTemplate[] = [];
let scheduledContentItems: ScheduledContentItem[] = [];
let nextTemplateId = 1;
let nextItemId = 1;

/**
 * GET /api/schedule-templates
 * Get all schedule templates
 */
router.get("/schedule-templates", async (req, res) => {
  try {
    res.json(scheduleTemplates);
  } catch (error: any) {
    console.error("Error fetching schedule templates:", error);
    res.status(500).json({ error: "Failed to fetch schedule templates" });
  }
});

/**
 * POST /api/schedule-templates
 * Create a new schedule template
 */
router.post("/schedule-templates", async (req, res) => {
  try {
    const validatedData = scheduleTemplateSchema.parse(req.body);

    const newTemplate: ScheduleTemplate = {
      id: nextTemplateId++,
      name: validatedData.name,
      description: validatedData.description,
      type: "mini-game-block", // Default type
      platform: "@rotationonly", // Default platform
      recurrenceType: validatedData.recurrenceType,
      recurrenceConfig: JSON.stringify(validatedData.recurrenceConfig),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    scheduleTemplates.push(newTemplate);

    console.log(`✅ Created schedule template: ${newTemplate.name}`);
    res.status(201).json(newTemplate);
  } catch (error: any) {
    console.error("Error creating schedule template:", error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * PUT /api/schedule-templates/:id
 * Update a schedule template
 */
router.put("/schedule-templates/:id", async (req, res) => {
  try {
    const templateId = parseInt(req.params.id);
    const validatedData = scheduleTemplateSchema.parse(req.body);

    const templateIndex = scheduleTemplates.findIndex(
      (t) => t.id === templateId,
    );
    if (templateIndex === -1) {
      return res.status(404).json({ error: "Template not found" });
    }

    scheduleTemplates[templateIndex] = {
      ...scheduleTemplates[templateIndex],
      name: validatedData.name,
      description: validatedData.description,
      recurrenceType: validatedData.recurrenceType,
      recurrenceConfig: JSON.stringify(validatedData.recurrenceConfig),
      updatedAt: new Date(),
    };

    res.json(scheduleTemplates[templateIndex]);
  } catch (error: any) {
    console.error("Error updating schedule template:", error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * DELETE /api/schedule-templates/:id
 * Delete a schedule template
 */
router.delete("/schedule-templates/:id", async (req, res) => {
  try {
    const templateId = parseInt(req.params.id);
    const templateIndex = scheduleTemplates.findIndex(
      (t) => t.id === templateId,
    );

    if (templateIndex === -1) {
      return res.status(404).json({ error: "Template not found" });
    }

    scheduleTemplates.splice(templateIndex, 1);
    res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting schedule template:", error);
    res.status(500).json({ error: "Failed to delete template" });
  }
});

/**
 * POST /api/schedule-templates/:id/preview
 * Preview next occurrences for a schedule template
 */
router.post("/schedule-templates/:id/preview", async (req, res) => {
  try {
    const templateId = parseInt(req.params.id);
    const { fromDate, maxOccurrences = 10 } = req.body;

    const template = scheduleTemplates.find((t) => t.id === templateId);
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    const pattern: RecurrencePattern = {
      type: template.recurrenceType,
      config: JSON.parse(template.recurrenceConfig),
    };

    const startDate = fromDate ? new Date(fromDate) : new Date();
    const occurrences = await recurrenceEngine.calculateNextOccurrences(
      pattern,
      startDate,
      maxOccurrences,
    );

    res.json({
      template: template,
      occurrences: occurrences,
      preview_generated_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error generating schedule preview:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/scheduled-content-items
 * Get all scheduled content items
 */
router.get("/scheduled-content-items", async (req, res) => {
  try {
    const { status, templateId, fromDate, toDate } = req.query;

    let filteredItems = [...scheduledContentItems];

    if (status) {
      filteredItems = filteredItems.filter((item) => item.status === status);
    }

    if (templateId) {
      const templateIdNum = parseInt(templateId as string);
      filteredItems = filteredItems.filter(
        (item) => item.templateId === templateIdNum,
      );
    }

    if (fromDate) {
      const from = new Date(fromDate as string);
      filteredItems = filteredItems.filter(
        (item) => item.scheduledDate >= from,
      );
    }

    if (toDate) {
      const to = new Date(toDate as string);
      filteredItems = filteredItems.filter((item) => item.scheduledDate <= to);
    }

    res.json(filteredItems);
  } catch (error: any) {
    console.error("Error fetching scheduled content items:", error);
    res.status(500).json({ error: "Failed to fetch scheduled content items" });
  }
});

/**
 * POST /api/scheduled-content-items
 * Create a new scheduled content item
 */
router.post("/scheduled-content-items", async (req, res) => {
  try {
    const validatedData = scheduledContentItemSchema.parse(req.body);

    // Create Notion record first
    let notionPageId: string | undefined = undefined;
    let notionError: string | undefined = undefined;

    try {
      // Find the ROMLCONTENTCALENDAR database
      const contentCalendarDb = await findDatabaseByTitle(
        "ROMLCONTENTCALENDAR",
      );
      if (!contentCalendarDb) {
        throw new Error("ROMLCONTENTCALENDAR database not found in Notion");
      }

      // Format date for Notion with PST timezone
      const dateObj = validatedData.scheduledDate;

      // Check if midnight in PST (convert UTC to PST by subtracting 8 hours)
      const pstHours = (dateObj.getUTCHours() - 8 + 24) % 24;
      const isMidnight = pstHours === 0 && dateObj.getUTCMinutes() === 0;

      let notionDateStr;
      if (isMidnight) {
        // Just the date (no time component)
        notionDateStr = dateObj.toISOString().split("T")[0];
      } else {
        // Format with PST offset (-08:00)
        // Convert UTC time to PST by subtracting 8 hours
        const pstDate = new Date(dateObj.getTime() - 8 * 60 * 60 * 1000);

        const pad = (n: number) => n.toString().padStart(2, "0");
        const year = pstDate.getUTCFullYear();
        const month = pad(pstDate.getUTCMonth() + 1);
        const day = pad(pstDate.getUTCDate());
        const hours = pad(pstDate.getUTCHours());
        const minutes = pad(pstDate.getUTCMinutes());

        notionDateStr = `${year}-${month}-${day}T${hours}:${minutes}:00.000-08:00`;
      }

      // Create the page in Notion using user's database schema
      const properties: any = {
        Name: {
          title: [{ text: { content: validatedData.title } }],
        },
        "Scheduled Publish Date": {
          date: { start: notionDateStr },
        },
      };

      // Safe status mapping - only use known Notion status values
      const statusMapping: { [key: string]: string } = {
        scheduled: "Not started",
        created: "In progress",
        published: "Done",
        failed: "Not started",
      };
      const notionStatus =
        statusMapping[validatedData.status as string] || "Not started";
      properties["Status"] = { status: { name: notionStatus } };

      // Add optional select properties only if they have values
      // Note: Only include properties that are actually select types in Notion
      if (validatedData.month) {
        properties["Month"] = { select: { name: validatedData.month } };
      }

      if (validatedData.dayOfWeek) {
        // Use exact property name with trailing space as found in database
        properties["Day of the Week "] = {
          select: { name: validatedData.dayOfWeek },
        };
      }

      if (validatedData.moonPhase) {
        properties["Moon Phase"] = {
          select: { name: validatedData.moonPhase },
        };
      }

      // Mini Game is now a select field (updated by user)
      if (validatedData.squareType) {
        properties["Mini Game"] = {
          select: { name: validatedData.squareType },
        };
      }

      if (validatedData.page) {
        properties["Page"] = { select: { name: validatedData.page } };
      }

      if (validatedData.definitionTerm && validatedData.definitionTerm !== "None") {
        properties["Definition Term"] = { select: { name: validatedData.definitionTerm } };
      }

      const notionResponse = await notion.pages.create({
        parent: { database_id: contentCalendarDb.id },
        properties: properties,
      });

      notionPageId = notionResponse.id;
      console.log(
        `✅ Created Notion record for scheduled content item: ${validatedData.title}`,
      );
    } catch (error: any) {
      console.error("⚠️ Failed to create Notion record:", error.message);
      notionError = error.message;
      // Continue with in-memory storage as fallback
    }

    const newItem: ScheduledContentItem = {
      id: nextItemId++,
      templateId: validatedData.templateId || 0,
      notionPageId: notionPageId,
      title: validatedData.title,
      description: validatedData.description,
      miniGameBlockId: validatedData.miniGameBlockId,
      status:
        (validatedData.status as
          | "scheduled"
          | "created"
          | "published"
          | "failed") || "scheduled",
      scheduledDate: validatedData.scheduledDate,
      metadata: validatedData.metadata
        ? JSON.stringify(validatedData.metadata)
        : undefined,
      // Include new fields for automatic population
      page: validatedData.page || undefined,
      month: validatedData.month || undefined,
      dayOfWeek: validatedData.dayOfWeek || undefined,
      moonPhase: validatedData.moonPhase || undefined,
      squareType: validatedData.squareType || undefined,
      definitionTerm: validatedData.definitionTerm || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store in memory as fallback/cache
    scheduledContentItems.push(newItem);

    console.log(
      `✅ Created scheduled content item: ${newItem.title}${notionPageId ? " with Notion ID: " + notionPageId : " (in-memory only)"}`,
    );

    // Return success with optional warning about Notion
    const response: any = { ...newItem };
    if (notionError) {
      response._warning = `Item created in memory but failed to sync with Notion: ${notionError}`;
    }

    res.status(201).json(response);
  } catch (error: any) {
    console.error("Error creating scheduled content item:", error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * PUT /api/scheduled-content-items/:id
 * Update a scheduled content item
 */
router.put("/scheduled-content-items/:id", async (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    const updates = req.body;

    const itemIndex = scheduledContentItems.findIndex(
      (item) => item.id === itemId,
    );
    if (itemIndex === -1) {
      return res.status(404).json({ error: "Scheduled item not found" });
    }

    scheduledContentItems[itemIndex] = {
      ...scheduledContentItems[itemIndex],
      ...updates,
      updatedAt: new Date(),
    };

    res.json(scheduledContentItems[itemIndex]);
  } catch (error: any) {
    console.error("Error updating scheduled content item:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/scheduled-content-items/generate-from-template/:templateId
 * Generate scheduled items from a template for a date range
 */
router.post(
  "/scheduled-content-items/generate-from-template/:templateId",
  async (req, res) => {
    try {
      const templateId = parseInt(req.params.templateId);
      const { fromDate, toDate, title, description, miniGameBlockId } =
        req.body;

      const template = scheduleTemplates.find((t) => t.id === templateId);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      const pattern: RecurrencePattern = {
        type: template.recurrenceType,
        config: JSON.parse(template.recurrenceConfig),
      };

      const startDate = new Date(fromDate);
      const endDate = new Date(toDate);

      // Calculate all occurrences within the date range
      const allOccurrences = await recurrenceEngine.calculateNextOccurrences(
        pattern,
        startDate,
        100, // Get plenty of occurrences to filter
      );

      const occurrencesInRange = allOccurrences.filter(
        (occurrence) =>
          occurrence.date >= startDate && occurrence.date <= endDate,
      );

      // Create scheduled items for each occurrence
      const newItems: ScheduledContentItem[] = [];

      for (const occurrence of occurrencesInRange) {
        const newItem: ScheduledContentItem = {
          id: nextItemId++,
          templateId: templateId,
          title: title || occurrence.title,
          description: description || occurrence.description,
          miniGameBlockId: miniGameBlockId,
          status: "scheduled",
          scheduledDate: occurrence.date,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        scheduledContentItems.push(newItem);
        newItems.push(newItem);
      }

      console.log(
        `✅ Generated ${newItems.length} scheduled items from template ${template.name}`,
      );
      res.status(201).json({
        generated_count: newItems.length,
        items: newItems,
        template: template,
      });
    } catch (error: any) {
      console.error("Error generating scheduled items:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * GET /api/moon-phases
 * Get moon phases for current and next year
 */
router.get("/moon-phases", async (req, res) => {
  try {
    const { year } = req.query;

    if (year) {
      const phases = await moonPhaseService.getMoonPhasesForYear(
        parseInt(year as string),
      );
      res.json(phases);
    } else {
      const phases = await moonPhaseService.getCurrentAndNextYearPhases();
      res.json(phases);
    }
  } catch (error: any) {
    console.error("Error fetching moon phases:", error);
    res.status(500).json({ error: "Failed to fetch moon phases" });
  }
});

/**
 * GET /api/moon-phases/next/:phaseType
 * Get the next occurrence of a specific moon phase
 */
router.get("/moon-phases/next/:phaseType", async (req, res) => {
  try {
    const { phaseType } = req.params;
    const { fromDate } = req.query;

    const startDate = fromDate ? new Date(fromDate as string) : new Date();
    const nextPhase = moonPhaseService.getNextMoonPhase(phaseType, startDate);

    if (nextPhase) {
      res.json({
        phaseType,
        date: nextPhase,
        fromDate: startDate,
      });
    } else {
      res.status(404).json({ error: "Moon phase not found" });
    }
  } catch (error: any) {
    console.error("Error fetching next moon phase:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
