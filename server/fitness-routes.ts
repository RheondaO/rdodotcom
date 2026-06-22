import { Request, Response, Router } from 'express';
import { z } from 'zod';
import {
  insertWorkoutSchema,
  insertBodyWeightSchema,
  insertFitnessGoalSchema,
  insertNutritionEntrySchema,
  insertExerciseSchema,
  insertMealPlanSchema,
  insertDietGoalSchema,
  insertFoodDatabaseSchema,
  insertHealthVitalsSchema,
  insertSleepLogSchema,
  insertWellnessJournalSchema,
  insertHealthWellnessGoalSchema,
  insertHealthAnalyticsSnapshotSchema,
  type InsertBodyWeight,
  type InsertFitnessGoal,
  type InsertNutritionEntry,
  type InsertExercise,
  type InsertMealPlan,
  type InsertDietGoal,
  type InsertFoodDatabase,
  type InsertHealthVitals,
  type InsertSleepLog,
  type InsertWellnessJournal,
  type InsertHealthWellnessGoal,
  type InsertHealthAnalyticsSnapshot,
} from '@shared/schema';
import { storage } from './storage';
import { getTodaysWorkouts, notion, NOTION_WORKOUTSTATS_DATABASE_ID } from './notion';

const router = Router();

// Date validation schema
const dateQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
});

const dateRangeQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid start date"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid end date")
});

// Middleware to require authentication for write operations
const requireAuth = (req: Request, res: Response, next: Function) => {
  const session = req.session as any;
  if (!session?.isAuthenticated || !session?.isAdmin) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// ============================================================================
// TODAY'S WORKOUTS FROM NOTION
// ============================================================================

router.get('/todays-workouts', async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required in YYYY-MM-DD format' });
    }
    const validatedQuery = dateQuerySchema.parse({ date });
    console.log(`🏋️ API: Getting today's workouts for date: ${validatedQuery.date}`);
    const workouts = await getTodaysWorkouts(validatedQuery.date);
    console.log(`🏋️ API: Found ${workouts.length} workouts for ${validatedQuery.date}`);
    res.json(workouts);
  } catch (error) {
    console.error('Error getting today\'s workouts:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid date format', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to get today\'s workouts' });
    }
  }
});

// ============================================================================
// WORKOUTS
// ============================================================================

router.get('/workouts', async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    if (date) {
      const filtered = (await storage.getAllHabits()).filter(h => h.category === 'wellness');
      // Note: workouts are stored in the existing habits system as wellness; we can extend later
      res.json([]);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error getting workouts:', error);
    res.status(500).json({ error: 'Failed to get workouts' });
  }
});

router.post('/workouts', requireAuth, (req: Request, res: Response) => {
  try {
    const validatedData = insertWorkoutSchema.parse(req.body);
    const newWorkout = { id: Date.now(), ...validatedData, createdAt: new Date().toISOString() };
    res.status(201).json(newWorkout);
  } catch (error) {
    console.error('Error creating workout:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create workout' });
    }
  }
});

// ============================================================================
// BODY WEIGHTS
// ============================================================================

router.get('/body-weights', async (req: Request, res: Response) => {
  try {
    const vitals = await storage.getHealthVitals();
    const weights = vitals
      .filter(v => v.weight)
      .map(v => ({
        id: v.id,
        date: v.date,
        weight: parseFloat(v.weight || '0'),
        notes: v.notes,
        createdAt: v.createdAt
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    res.json(weights);
  } catch (error) {
    console.error('Error getting body weights:', error);
    res.status(500).json({ error: 'Failed to get body weights' });
  }
});

router.post('/body-weights', requireAuth, async (req: Request, res: Response) => {
  try {
    const validatedData = insertBodyWeightSchema.parse(req.body);
    const vitals = await storage.createHealthVitals({
      date: validatedData.date,
      weight: validatedData.weight.toString(),
      notes: validatedData.notes
    });
    res.status(201).json({
      id: vitals.id,
      date: vitals.date,
      weight: parseFloat(vitals.weight || '0'),
      notes: vitals.notes,
      createdAt: vitals.createdAt
    });
  } catch (error) {
    console.error('Error creating body weight:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create body weight entry' });
    }
  }
});

// ============================================================================
// FITNESS GOALS
// ============================================================================

router.get('/fitness-goals', async (req: Request, res: Response) => {
  try {
    const goals = await storage.getHealthWellnessGoalsByCategory('fitness');
    res.json(goals);
  } catch (error) {
    console.error('Error getting fitness goals:', error);
    res.status(500).json({ error: 'Failed to get fitness goals' });
  }
});

router.post('/fitness-goals', requireAuth, async (req: Request, res: Response) => {
  try {
    const validatedData = insertFitnessGoalSchema.parse(req.body);
    const goal = await storage.createHealthWellnessGoal({
      title: validatedData.title,
      description: validatedData.description,
      category: 'fitness',
      targetValue: validatedData.targetValue.toString(),
      currentValue: (validatedData.currentValue || 0).toString(),
      unit: validatedData.unit,
      targetDate: validatedData.targetDate,
      isCompleted: validatedData.isCompleted,
      priority: validatedData.priority,
    });
    res.status(201).json(goal);
  } catch (error) {
    console.error('Error creating fitness goal:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create fitness goal' });
    }
  }
});

router.patch('/fitness-goals/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const goal = await storage.updateHealthWellnessGoal(id, req.body);
    res.json(goal);
  } catch (error) {
    console.error('Error updating fitness goal:', error);
    res.status(500).json({ error: 'Failed to update fitness goal' });
  }
});

// ============================================================================
// NUTRITION
// ============================================================================

router.get('/nutrition', async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    if (date) {
      res.json([]);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error getting nutrition entries:', error);
    res.status(500).json({ error: 'Failed to get nutrition entries' });
  }
});

router.post('/nutrition', requireAuth, (req: Request, res: Response) => {
  try {
    const validatedData = insertNutritionEntrySchema.parse(req.body);
    const newEntry = { id: Date.now(), ...validatedData, createdAt: new Date().toISOString() };
    res.status(201).json(newEntry);
  } catch (error) {
    console.error('Error creating nutrition entry:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create nutrition entry' });
    }
  }
});

// ============================================================================
// EXERCISES
// ============================================================================

router.get('/exercises', (req: Request, res: Response) => {
  try {
    res.json([]);
  } catch (error) {
    console.error('Error getting exercises:', error);
    res.status(500).json({ error: 'Failed to get exercises' });
  }
});

router.post('/exercises', requireAuth, (req: Request, res: Response) => {
  try {
    const validatedData = insertExerciseSchema.parse(req.body);
    const newExercise = { id: Date.now(), ...validatedData, createdAt: new Date().toISOString() };
    res.status(201).json(newExercise);
  } catch (error) {
    console.error('Error creating exercise:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create exercise' });
    }
  }
});

// ============================================================================
// WORKOUT STATS FROM NOTION
// ============================================================================

router.get('/workout-stats', async (req: Request, res: Response) => {
  try {
    console.log('📊 API: Getting workout stats from Notion WORKOUTSTATS database');
    if (!NOTION_WORKOUTSTATS_DATABASE_ID) {
      console.log('📊 No WORKOUTSTATS database ID found, returning empty stats');
      return res.json({ totalWorkouts: 0, totalMinutes: 0, caloriesBurned: 0, avgDifficulty: 0.0 });
    }
    console.log('📊 Retrieving Workout Stats database with ID:', NOTION_WORKOUTSTATS_DATABASE_ID);
    const database = await notion.databases.retrieve({ database_id: NOTION_WORKOUTSTATS_DATABASE_ID });
    console.log('📊 Found Workout Stats database:', (database as any).title?.[0]?.plain_text);
    const response = await notion.databases.query({ database_id: NOTION_WORKOUTSTATS_DATABASE_ID });
    console.log('📊 Raw response: Found', response.results.length, 'total records in database');
    let totalWorkouts = 0;
    let totalMinutes = 0;
    let totalCalories = 0;
    let totalDifficulty = 0;
    let validRecords = 0;
    response.results.forEach((record: any) => {
      const properties = record.properties;
      if (properties['Total Workouts']) {
        if (properties['Total Workouts'].rollup && properties['Total Workouts'].rollup.number) {
          totalWorkouts += properties['Total Workouts'].rollup.number;
        } else if (properties['Total Workouts'].number) {
          totalWorkouts += properties['Total Workouts'].number;
        }
      }
      if (properties['Total Minutes']) {
        if (properties['Total Minutes'].rollup && properties['Total Minutes'].rollup.number) {
          totalMinutes += properties['Total Minutes'].rollup.number;
        } else if (properties['Total Minutes'].number) {
          totalMinutes += properties['Total Minutes'].number;
        }
      }
      if (properties['Calories Burned']) {
        if (properties['Calories Burned'].rollup && properties['Calories Burned'].rollup.number) {
          totalCalories += properties['Calories Burned'].rollup.number;
        } else if (properties['Calories Burned'].number) {
          totalCalories += properties['Calories Burned'].number;
        }
      }
      if (properties['Avg Difficulty']) {
        let difficulty = 0;
        if (properties['Avg Difficulty'].rollup && properties['Avg Difficulty'].rollup.number) {
          difficulty = properties['Avg Difficulty'].rollup.number;
        } else if (properties['Avg Difficulty'].number) {
          difficulty = properties['Avg Difficulty'].number;
        }
        if (difficulty > 0) { totalDifficulty += difficulty; validRecords++; }
      }
    });
    const avgDifficulty = validRecords > 0 ? (totalDifficulty / validRecords).toFixed(1) : '0.0';
    const stats = { totalWorkouts, totalMinutes, caloriesBurned: totalCalories, avgDifficulty: parseFloat(avgDifficulty) };
    console.log('📊 API: Successfully compiled workout stats:', stats);
    res.json(stats);
  } catch (error: any) {
    console.error('❌ Error fetching workout stats from Notion:', error);
    res.json({ totalWorkouts: 0, totalMinutes: 0, caloriesBurned: 0, avgDifficulty: 0.0 });
  }
});

// ============================================================================
// MEAL PLANNING
// ============================================================================

router.get('/meal-plans', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, date } = req.query;
    res.json([]);
  } catch (error) {
    console.error('Error getting meal plans:', error);
    res.status(500).json({ error: 'Failed to get meal plans' });
  }
});

router.post('/meal-plans', requireAuth, (req: Request, res: Response) => {
  try {
    const validatedData = insertMealPlanSchema.parse(req.body);
    const newPlan = { id: Date.now(), ...validatedData, createdAt: new Date().toISOString() };
    res.status(201).json(newPlan);
  } catch (error) {
    console.error('Error creating meal plan:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create meal plan' });
    }
  }
});

router.patch('/meal-plans/:id', requireAuth, (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    res.json({ id, ...req.body });
  } catch (error) {
    console.error('Error updating meal plan:', error);
    res.status(500).json({ error: 'Failed to update meal plan' });
  }
});

router.delete('/meal-plans/:id', requireAuth, (req: Request, res: Response) => {
  try {
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting meal plan:', error);
    res.status(500).json({ error: 'Failed to delete meal plan' });
  }
});

// ============================================================================
// DIET GOALS
// ============================================================================

router.get('/diet-goals', async (req: Request, res: Response) => {
  try {
    const goals = await storage.getHealthWellnessGoalsByCategory('nutrition');
    res.json(goals);
  } catch (error) {
    console.error('Error getting diet goals:', error);
    res.status(500).json({ error: 'Failed to get diet goals' });
  }
});

router.post('/diet-goals', requireAuth, async (req: Request, res: Response) => {
  try {
    const validatedData = insertDietGoalSchema.parse(req.body);
    const goal = await storage.createHealthWellnessGoal({
      title: validatedData.name,
      description: validatedData.description,
      category: 'nutrition',
      targetValue: (validatedData.targetCalories || 0).toString(),
      currentValue: '0',
      unit: 'calories',
      targetDate: validatedData.startDate,
    });
    res.status(201).json(goal);
  } catch (error) {
    console.error('Error creating diet goal:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create diet goal' });
    }
  }
});

// ============================================================================
// FOOD DATABASE
// ============================================================================

router.get('/food-database', (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;
    res.json([]);
  } catch (error) {
    console.error('Error getting food database:', error);
    res.status(500).json({ error: 'Failed to get food database' });
  }
});

router.post('/food-database', requireAuth, (req: Request, res: Response) => {
  try {
    const validatedData = insertFoodDatabaseSchema.parse(req.body);
    const newFood = { id: Date.now(), ...validatedData, createdAt: new Date().toISOString() };
    res.status(201).json(newFood);
  } catch (error) {
    console.error('Error creating food database entry:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create food database entry' });
    }
  }
});

// ============================================================================
// HEALTH VITALS
// ============================================================================

router.get('/health-vitals', async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    const vitals = await storage.getHealthVitals(date as string);
    res.json(vitals);
  } catch (error) {
    console.error('Error getting health vitals:', error);
    res.status(500).json({ error: 'Failed to get health vitals' });
  }
});

router.get('/health-vitals/range', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }
    const vitals = await storage.getHealthVitalsByDateRange(startDate as string, endDate as string);
    res.json(vitals);
  } catch (error) {
    console.error('Error getting health vitals range:', error);
    res.status(500).json({ error: 'Failed to get health vitals range' });
  }
});

router.post('/health-vitals', requireAuth, async (req: Request, res: Response) => {
  try {
    const validatedData = insertHealthVitalsSchema.parse(req.body);
    const vitals = await storage.createHealthVitals(validatedData);
    res.status(201).json(vitals);
  } catch (error) {
    console.error('Error creating health vitals:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create health vitals' });
    }
  }
});

router.patch('/health-vitals/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const vitals = await storage.updateHealthVitals(id, req.body);
    res.json(vitals);
  } catch (error) {
    console.error('Error updating health vitals:', error);
    res.status(500).json({ error: 'Failed to update health vitals' });
  }
});

router.delete('/health-vitals/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteHealthVitals(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting health vitals:', error);
    res.status(500).json({ error: 'Failed to delete health vitals' });
  }
});

// ============================================================================
// SLEEP LOGS
// ============================================================================

router.get('/sleep-logs', async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    const logs = await storage.getSleepLogs(date as string);
    res.json(logs);
  } catch (error) {
    console.error('Error getting sleep logs:', error);
    res.status(500).json({ error: 'Failed to get sleep logs' });
  }
});

router.get('/sleep-logs/range', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }
    const logs = await storage.getSleepLogsByDateRange(startDate as string, endDate as string);
    res.json(logs);
  } catch (error) {
    console.error('Error getting sleep logs range:', error);
    res.status(500).json({ error: 'Failed to get sleep logs range' });
  }
});

router.post('/sleep-logs', requireAuth, async (req: Request, res: Response) => {
  try {
    const validatedData = insertSleepLogSchema.parse(req.body);
    const log = await storage.createSleepLog(validatedData);
    res.status(201).json(log);
  } catch (error) {
    console.error('Error creating sleep log:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create sleep log' });
    }
  }
});

router.patch('/sleep-logs/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const log = await storage.updateSleepLog(id, req.body);
    res.json(log);
  } catch (error) {
    console.error('Error updating sleep log:', error);
    res.status(500).json({ error: 'Failed to update sleep log' });
  }
});

router.delete('/sleep-logs/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteSleepLog(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting sleep log:', error);
    res.status(500).json({ error: 'Failed to delete sleep log' });
  }
});

// ============================================================================
// WELLNESS JOURNAL
// ============================================================================

router.get('/wellness-journal', async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    const entries = await storage.getWellnessJournal(date as string);
    res.json(entries);
  } catch (error) {
    console.error('Error getting wellness journal:', error);
    res.status(500).json({ error: 'Failed to get wellness journal' });
  }
});

router.get('/wellness-journal/range', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }
    const entries = await storage.getWellnessJournalByDateRange(startDate as string, endDate as string);
    res.json(entries);
  } catch (error) {
    console.error('Error getting wellness journal range:', error);
    res.status(500).json({ error: 'Failed to get wellness journal range' });
  }
});

router.post('/wellness-journal', requireAuth, async (req: Request, res: Response) => {
  try {
    const validatedData = insertWellnessJournalSchema.parse(req.body);
    const entry = await storage.createWellnessJournal(validatedData);
    res.status(201).json(entry);
  } catch (error) {
    console.error('Error creating wellness journal entry:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create wellness journal entry' });
    }
  }
});

router.patch('/wellness-journal/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const entry = await storage.updateWellnessJournal(id, req.body);
    res.json(entry);
  } catch (error) {
    console.error('Error updating wellness journal entry:', error);
    res.status(500).json({ error: 'Failed to update wellness journal entry' });
  }
});

router.delete('/wellness-journal/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteWellnessJournal(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting wellness journal entry:', error);
    res.status(500).json({ error: 'Failed to delete wellness journal entry' });
  }
});

// ============================================================================
// HEALTH & WELLNESS GOALS
// ============================================================================

router.get('/health-wellness-goals', async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    let goals;
    if (category) {
      goals = await storage.getHealthWellnessGoalsByCategory(category as string);
    } else {
      goals = await storage.getHealthWellnessGoals();
    }
    res.json(goals);
  } catch (error) {
    console.error('Error getting health wellness goals:', error);
    res.status(500).json({ error: 'Failed to get health wellness goals' });
  }
});

router.post('/health-wellness-goals', requireAuth, async (req: Request, res: Response) => {
  try {
    const validatedData = insertHealthWellnessGoalSchema.parse(req.body);
    const goal = await storage.createHealthWellnessGoal(validatedData);
    res.status(201).json(goal);
  } catch (error) {
    console.error('Error creating health wellness goal:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create health wellness goal' });
    }
  }
});

router.patch('/health-wellness-goals/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const goal = await storage.updateHealthWellnessGoal(id, req.body);
    res.json(goal);
  } catch (error) {
    console.error('Error updating health wellness goal:', error);
    res.status(500).json({ error: 'Failed to update health wellness goal' });
  }
});

router.delete('/health-wellness-goals/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteHealthWellnessGoal(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting health wellness goal:', error);
    res.status(500).json({ error: 'Failed to delete health wellness goal' });
  }
});

// ============================================================================
// HEALTH ANALYTICS
// ============================================================================

router.get('/health-dashboard', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }
    const dashboard = await storage.getHealthWellnessDashboard(startDate as string, endDate as string);
    res.json(dashboard);
  } catch (error) {
    console.error('Error getting health dashboard:', error);
    res.status(500).json({ error: 'Failed to get health dashboard' });
  }
});

router.get('/health-trends', async (req: Request, res: Response) => {
  try {
    const { metric, startDate, endDate } = req.query;
    if (!metric || !startDate || !endDate) {
      return res.status(400).json({ error: 'metric, startDate, and endDate are required' });
    }
    const trends = await storage.getHealthTrends(metric as string, startDate as string, endDate as string);
    res.json(trends);
  } catch (error) {
    console.error('Error getting health trends:', error);
    res.status(500).json({ error: 'Failed to get health trends' });
  }
});

router.get('/sleep-analytics', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }
    const analytics = await storage.getSleepAnalytics(startDate as string, endDate as string);
    res.json(analytics);
  } catch (error) {
    console.error('Error getting sleep analytics:', error);
    res.status(500).json({ error: 'Failed to get sleep analytics' });
  }
});

router.get('/nutrition-analytics', async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'date is required' });
    }
    const analytics = await storage.getNutritionAnalytics(date as string);
    res.json(analytics);
  } catch (error) {
    console.error('Error getting nutrition analytics:', error);
    res.status(500).json({ error: 'Failed to get nutrition analytics' });
  }
});

// ============================================================================
// AI FITNESS INSIGHTS
// ============================================================================

router.get('/fitness-insights', requireAuth, async (req: Request, res: Response) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Gemini API key not configured',
        message: 'Please add GEMINI_API_KEY to environment variables for AI insights'
      });
    }
    const recentVitals = (await storage.getHealthVitals()).slice(-5);
    const recentSleep = (await storage.getSleepLogs()).slice(-5);
    const recentWellness = (await storage.getWellnessJournal()).slice(-5);
    const activeGoals = await storage.getHealthWellnessGoals();
    const fitnessData = { vitals: recentVitals, sleep: recentSleep, wellness: recentWellness, goals: activeGoals };
    const { generateFitnessInsights } = await import('./gemini.js');
    const insights = await generateFitnessInsights(fitnessData);
    res.json(insights);
  } catch (error) {
    console.error('Error generating fitness insights:', error);
    res.status(500).json({ error: 'Failed to generate fitness insights' });
  }
});

export default router;
