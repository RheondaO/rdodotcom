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
  insertFoodDatabaseSchema
} from '@shared/schema';
import { getTodaysWorkouts, notion, NOTION_WORKOUTSTATS_DATABASE_ID } from './notion';

const router = Router();

// Date validation schema
const dateQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
});

// In-memory storage for fitness data (will replace with database later)
let workouts: any[] = [];
let bodyWeights: any[] = [];
let fitnessGoals: any[] = [];
let nutritionEntries: any[] = [];
let exercises: any[] = [];
let mealPlans: any[] = [];
let dietGoals: any[] = [];
let foodDatabase: any[] = [];
let currentId = 1;

// Middleware to require authentication
const requireAuth = (req: Request, res: Response, next: Function) => {
  const session = req.session as any;
  if (!session?.isAuthenticated || !session?.isAdmin) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// TODAY'S WORKOUTS FROM NOTION

// Get today's workouts
router.get('/todays-workouts', async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    
    // Validate date parameter
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

// WORKOUTS

// Get workouts by date
router.get('/workouts', (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    
    if (date) {
      const filteredWorkouts = workouts.filter(workout => workout.date === date);
      res.json(filteredWorkouts);
    } else {
      res.json(workouts);
    }
  } catch (error) {
    console.error('Error getting workouts:', error);
    res.status(500).json({ error: 'Failed to get workouts' });
  }
});

// Create workout
router.post('/workouts', requireAuth, (req: Request, res: Response) => {
  try {
    const validatedData = insertWorkoutSchema.parse(req.body);
    
    const newWorkout = {
      id: currentId++,
      ...validatedData,
      createdAt: new Date().toISOString()
    };
    
    workouts.push(newWorkout);
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

// Update workout
router.patch('/workouts/:id', requireAuth, (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const workoutIndex = workouts.findIndex(w => w.id === id);
    
    if (workoutIndex === -1) {
      return res.status(404).json({ error: 'Workout not found' });
    }
    
    const updatedWorkout = { ...workouts[workoutIndex], ...req.body };
    workouts[workoutIndex] = updatedWorkout;
    
    res.json(updatedWorkout);
  } catch (error) {
    console.error('Error updating workout:', error);
    res.status(500).json({ error: 'Failed to update workout' });
  }
});

// Delete workout
router.delete('/workouts/:id', requireAuth, (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const workoutIndex = workouts.findIndex(w => w.id === id);
    
    if (workoutIndex === -1) {
      return res.status(404).json({ error: 'Workout not found' });
    }
    
    workouts.splice(workoutIndex, 1);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting workout:', error);
    res.status(500).json({ error: 'Failed to delete workout' });
  }
});

// BODY WEIGHTS

// Get body weights
router.get('/body-weights', (req: Request, res: Response) => {
  try {
    // Sort by date descending (most recent first)
    const sortedWeights = bodyWeights.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    res.json(sortedWeights);
  } catch (error) {
    console.error('Error getting body weights:', error);
    res.status(500).json({ error: 'Failed to get body weights' });
  }
});

// Create body weight entry
router.post('/body-weights', requireAuth, (req: Request, res: Response) => {
  try {
    const validatedData = insertBodyWeightSchema.parse(req.body);
    
    const newWeight = {
      id: currentId++,
      ...validatedData,
      createdAt: new Date().toISOString()
    };
    
    bodyWeights.push(newWeight);
    res.status(201).json(newWeight);
  } catch (error) {
    console.error('Error creating body weight:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create body weight entry' });
    }
  }
});

// FITNESS GOALS

// Get fitness goals
router.get('/fitness-goals', (req: Request, res: Response) => {
  try {
    res.json(fitnessGoals);
  } catch (error) {
    console.error('Error getting fitness goals:', error);
    res.status(500).json({ error: 'Failed to get fitness goals' });
  }
});

// Create fitness goal
router.post('/fitness-goals', requireAuth, (req: Request, res: Response) => {
  try {
    const validatedData = insertFitnessGoalSchema.parse(req.body);
    
    const newGoal = {
      id: currentId++,
      ...validatedData,
      currentValue: validatedData.currentValue || 0,
      isCompleted: false,
      createdAt: new Date().toISOString()
    };
    
    fitnessGoals.push(newGoal);
    res.status(201).json(newGoal);
  } catch (error) {
    console.error('Error creating fitness goal:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create fitness goal' });
    }
  }
});

// Update fitness goal
router.patch('/fitness-goals/:id', requireAuth, (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const goalIndex = fitnessGoals.findIndex(g => g.id === id);
    
    if (goalIndex === -1) {
      return res.status(404).json({ error: 'Fitness goal not found' });
    }
    
    const updatedGoal = { ...fitnessGoals[goalIndex], ...req.body };
    fitnessGoals[goalIndex] = updatedGoal;
    
    res.json(updatedGoal);
  } catch (error) {
    console.error('Error updating fitness goal:', error);
    res.status(500).json({ error: 'Failed to update fitness goal' });
  }
});

// NUTRITION

// Get nutrition entries by date
router.get('/nutrition', (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    
    if (date) {
      const filteredEntries = nutritionEntries.filter(entry => entry.date === date);
      res.json(filteredEntries);
    } else {
      res.json(nutritionEntries);
    }
  } catch (error) {
    console.error('Error getting nutrition entries:', error);
    res.status(500).json({ error: 'Failed to get nutrition entries' });
  }
});

// Create nutrition entry
router.post('/nutrition', requireAuth, (req: Request, res: Response) => {
  try {
    const validatedData = insertNutritionEntrySchema.parse(req.body);
    
    const newEntry = {
      id: currentId++,
      ...validatedData,
      createdAt: new Date().toISOString()
    };
    
    nutritionEntries.push(newEntry);
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

// EXERCISES

// Get exercises
router.get('/exercises', (req: Request, res: Response) => {
  try {
    res.json(exercises);
  } catch (error) {
    console.error('Error getting exercises:', error);
    res.status(500).json({ error: 'Failed to get exercises' });
  }
});

// Create exercise
router.post('/exercises', requireAuth, (req: Request, res: Response) => {
  try {
    const validatedData = insertExerciseSchema.parse(req.body);
    
    const newExercise = {
      id: currentId++,
      ...validatedData,
      createdAt: new Date().toISOString()
    };
    
    exercises.push(newExercise);
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

// WORKOUT STATS - FROM NOTION

// Get workout statistics from Notion WORKOUTSTATS database
router.get('/workout-stats', async (req: Request, res: Response) => {
  try {
    console.log('📊 API: Getting workout stats from Notion WORKOUTSTATS database');
    
    if (!NOTION_WORKOUTSTATS_DATABASE_ID) {
      console.log('📊 No WORKOUTSTATS database ID found, returning empty stats');
      return res.json({
        totalWorkouts: 0,
        totalMinutes: 0,
        caloriesBurned: 0,
        avgDifficulty: 0.0
      });
    }

    console.log('📊 Retrieving Workout Stats database with ID:', NOTION_WORKOUTSTATS_DATABASE_ID);
    
    // First, check database connection and properties
    const database = await notion.databases.retrieve({
      database_id: NOTION_WORKOUTSTATS_DATABASE_ID,
    });
    
    console.log('📊 Found Workout Stats database:', database.title?.[0]?.plain_text);
    console.log('📊 Successfully connected to Workout Stats database!');
    console.log('📊 Database title:', database.title?.[0]?.plain_text);

    // Fetch all workout stats records (no sorting since rollup database may not have Date field)
    const response = await notion.databases.query({
      database_id: NOTION_WORKOUTSTATS_DATABASE_ID,
    });

    console.log('📊 Raw response: Found', response.results.length, 'total records in database');

    if (response.results.length > 0) {
      const firstRecord = response.results[0] as any;
      const properties = Object.keys(firstRecord.properties || {});
      console.log('📊 First record properties:', properties);
      
      // Debug field types for rollup fields
      if (firstRecord.properties['Total Workouts']) {
        console.log('📊 Total Workouts field type:', firstRecord.properties['Total Workouts'].type);
        console.log('📊 Total Workouts field structure:', JSON.stringify(firstRecord.properties['Total Workouts'], null, 2));
      }
      if (firstRecord.properties['Total Minutes']) {
        console.log('📊 Total Minutes field type:', firstRecord.properties['Total Minutes'].type);
      }
      if (firstRecord.properties['Calories Burned']) {
        console.log('📊 Calories Burned field type:', firstRecord.properties['Calories Burned'].type);
      }
      if (firstRecord.properties['Avg Difficulty']) {
        console.log('📊 Avg Difficulty field type:', firstRecord.properties['Avg Difficulty'].type);
      }
    }

    // Process the workout stats data
    let totalWorkouts = 0;
    let totalMinutes = 0;
    let totalCalories = 0;
    let totalDifficulty = 0;
    let validRecords = 0;

    response.results.forEach((record: any) => {
      const properties = record.properties;
      
      // Extract total workouts (handle rollup fields)
      if (properties['Total Workouts']) {
        if (properties['Total Workouts'].rollup && properties['Total Workouts'].rollup.number) {
          totalWorkouts += properties['Total Workouts'].rollup.number;
        } else if (properties['Total Workouts'].number) {
          totalWorkouts += properties['Total Workouts'].number;
        }
      }
      
      // Extract total minutes (handle rollup fields)
      if (properties['Total Minutes']) {
        if (properties['Total Minutes'].rollup && properties['Total Minutes'].rollup.number) {
          totalMinutes += properties['Total Minutes'].rollup.number;
        } else if (properties['Total Minutes'].number) {
          totalMinutes += properties['Total Minutes'].number;
        }
      }
      
      // Extract calories burned (handle rollup fields)
      if (properties['Calories Burned']) {
        if (properties['Calories Burned'].rollup && properties['Calories Burned'].rollup.number) {
          totalCalories += properties['Calories Burned'].rollup.number;
        } else if (properties['Calories Burned'].number) {
          totalCalories += properties['Calories Burned'].number;
        }
      }
      
      // Extract difficulty for average calculation (handle rollup fields)
      if (properties['Avg Difficulty']) {
        let difficulty = 0;
        if (properties['Avg Difficulty'].rollup && properties['Avg Difficulty'].rollup.number) {
          difficulty = properties['Avg Difficulty'].rollup.number;
        } else if (properties['Avg Difficulty'].number) {
          difficulty = properties['Avg Difficulty'].number;
        }
        
        if (difficulty > 0) {
          totalDifficulty += difficulty;
          validRecords++;
        }
      }
    });

    // Calculate average difficulty
    const avgDifficulty = validRecords > 0 ? (totalDifficulty / validRecords).toFixed(1) : '0.0';

    const stats = {
      totalWorkouts,
      totalMinutes,
      caloriesBurned: totalCalories,
      avgDifficulty: parseFloat(avgDifficulty)
    };

    console.log('📊 API: Successfully compiled workout stats:', stats);
    res.json(stats);

  } catch (error: any) {
    console.error('❌ Error fetching workout stats from Notion:', error);
    
    // Return default stats on error
    res.json({
      totalWorkouts: 0,
      totalMinutes: 0,
      caloriesBurned: 0,
      avgDifficulty: 0.0
    });
  }
});

// MEAL PLANNING

// Get meal plans by date range
router.get('/meal-plans', (req: Request, res: Response) => {
  try {
    const { startDate, endDate, date } = req.query;
    
    let filteredPlans = mealPlans;
    
    if (date) {
      filteredPlans = mealPlans.filter(plan => plan.date === date);
    } else if (startDate && endDate) {
      filteredPlans = mealPlans.filter(plan => 
        plan.date >= startDate && plan.date <= endDate
      );
    }
    
    // Sort by date and meal type
    const mealOrder: { [key: string]: number } = { breakfast: 1, lunch: 2, dinner: 3, snack: 4 };
    filteredPlans.sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return (mealOrder[a.mealType] || 5) - (mealOrder[b.mealType] || 5);
    });
    
    res.json(filteredPlans);
  } catch (error) {
    console.error('Error getting meal plans:', error);
    res.status(500).json({ error: 'Failed to get meal plans' });
  }
});

// Create meal plan
router.post('/meal-plans', requireAuth, (req: Request, res: Response) => {
  try {
    const validatedData = insertMealPlanSchema.parse(req.body);
    
    const newMealPlan = {
      id: currentId++,
      ...validatedData,
      createdAt: new Date().toISOString()
    };
    
    mealPlans.push(newMealPlan);
    res.status(201).json(newMealPlan);
  } catch (error) {
    console.error('Error creating meal plan:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create meal plan' });
    }
  }
});

// Update meal plan
router.patch('/meal-plans/:id', requireAuth, (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const planIndex = mealPlans.findIndex(p => p.id === id);
    
    if (planIndex === -1) {
      return res.status(404).json({ error: 'Meal plan not found' });
    }
    
    const updatedPlan = { ...mealPlans[planIndex], ...req.body };
    mealPlans[planIndex] = updatedPlan;
    
    res.json(updatedPlan);
  } catch (error) {
    console.error('Error updating meal plan:', error);
    res.status(500).json({ error: 'Failed to update meal plan' });
  }
});

// Delete meal plan
router.delete('/meal-plans/:id', requireAuth, (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const planIndex = mealPlans.findIndex(p => p.id === id);
    
    if (planIndex === -1) {
      return res.status(404).json({ error: 'Meal plan not found' });
    }
    
    mealPlans.splice(planIndex, 1);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting meal plan:', error);
    res.status(500).json({ error: 'Failed to delete meal plan' });
  }
});

// DIET GOALS

// Get diet goals
router.get('/diet-goals', (req: Request, res: Response) => {
  try {
    const activeDietGoals = dietGoals.filter(goal => goal.isActive);
    res.json(activeDietGoals);
  } catch (error) {
    console.error('Error getting diet goals:', error);
    res.status(500).json({ error: 'Failed to get diet goals' });
  }
});

// Create diet goal
router.post('/diet-goals', requireAuth, (req: Request, res: Response) => {
  try {
    const validatedData = insertDietGoalSchema.parse(req.body);
    
    const newDietGoal = {
      id: currentId++,
      ...validatedData,
      createdAt: new Date().toISOString()
    };
    
    dietGoals.push(newDietGoal);
    res.status(201).json(newDietGoal);
  } catch (error) {
    console.error('Error creating diet goal:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create diet goal' });
    }
  }
});

// FOOD DATABASE

// Get food database
router.get('/food-database', (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;
    
    let filteredFoods = foodDatabase;
    
    if (category) {
      filteredFoods = foodDatabase.filter(food => 
        food.category.toLowerCase() === category.toString().toLowerCase()
      );
    }
    
    if (search) {
      filteredFoods = filteredFoods.filter(food =>
        food.name.toLowerCase().includes(search.toString().toLowerCase())
      );
    }
    
    res.json(filteredFoods);
  } catch (error) {
    console.error('Error getting food database:', error);
    res.status(500).json({ error: 'Failed to get food database' });
  }
});

// Create food database entry
router.post('/food-database', requireAuth, (req: Request, res: Response) => {
  try {
    const validatedData = insertFoodDatabaseSchema.parse(req.body);
    
    const newFood = {
      id: currentId++,
      ...validatedData,
      createdAt: new Date().toISOString()
    };
    
    foodDatabase.push(newFood);
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

// AI FITNESS INSIGHTS (requires Gemini API key)
router.get('/fitness-insights', requireAuth, async (req: Request, res: Response) => {
  try {
    // Check if Gemini API key is available
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: 'Gemini API key not configured',
        message: 'Please add GEMINI_API_KEY to environment variables for AI insights'
      });
    }

    // Gather fitness data for AI analysis
    const recentWorkouts = workouts.slice(-10); // Last 10 workouts
    const recentWeights = bodyWeights.slice(-5); // Last 5 weight entries
    const activeGoals = fitnessGoals.filter(goal => !goal.isCompleted);
    const recentNutrition = nutritionEntries.slice(-7); // Last 7 nutrition entries
    const recentMealPlans = mealPlans.slice(-14); // Last 14 meal plans (2 weeks)
    const activeDietGoals = dietGoals.filter(goal => goal.isActive);

    const fitnessData = {
      workouts: recentWorkouts,
      weights: recentWeights,
      goals: activeGoals,
      nutrition: recentNutrition,
      mealPlans: recentMealPlans,
      dietGoals: activeDietGoals
    };

    // Use Gemini to analyze fitness data and provide insights
    const { generateFitnessInsights } = await import('./gemini.js');
    const insights = await generateFitnessInsights(fitnessData);

    res.json(insights);
  } catch (error) {
    console.error('Error generating fitness insights:', error);
    res.status(500).json({ error: 'Failed to generate fitness insights' });
  }
});

export default router;