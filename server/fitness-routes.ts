import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { 
  insertWorkoutSchema,
  insertBodyWeightSchema, 
  insertFitnessGoalSchema,
  insertNutritionEntrySchema,
  insertExerciseSchema
} from '@shared/schema';

const router = Router();

// In-memory storage for fitness data (will replace with database later)
let workouts: any[] = [];
let bodyWeights: any[] = [];
let fitnessGoals: any[] = [];
let nutritionEntries: any[] = [];
let exercises: any[] = [];
let currentId = 1;

// Middleware to require authentication
const requireAuth = (req: Request, res: Response, next: Function) => {
  const session = req.session as any;
  if (!session?.isAuthenticated || !session?.isAdmin) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

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

// AI FITNESS INSIGHTS (requires OpenAI API key)
router.get('/fitness-insights', requireAuth, async (req: Request, res: Response) => {
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        error: 'OpenAI API key not configured',
        message: 'Please add OPENAI_API_KEY to environment variables for AI insights'
      });
    }

    // Gather fitness data for AI analysis
    const recentWorkouts = workouts.slice(-10); // Last 10 workouts
    const recentWeights = bodyWeights.slice(-5); // Last 5 weight entries
    const activeGoals = fitnessGoals.filter(goal => !goal.isCompleted);
    const recentNutrition = nutritionEntries.slice(-7); // Last 7 nutrition entries

    const fitnessData = {
      workouts: recentWorkouts,
      weights: recentWeights,
      goals: activeGoals,
      nutrition: recentNutrition
    };

    // This would use OpenAI to analyze fitness data and provide insights
    // For now, return basic analysis
    const insights = {
      summary: "Fitness tracking active",
      recommendations: [
        "Continue logging workouts consistently",
        "Monitor weight trends weekly", 
        "Track nutrition for better results"
      ],
      progress: {
        workoutsThisWeek: recentWorkouts.length,
        weightTrend: recentWeights.length > 1 ? "stable" : "insufficient data",
        goalProgress: activeGoals.length > 0 ? "on track" : "no active goals"
      }
    };

    res.json(insights);
  } catch (error) {
    console.error('Error generating fitness insights:', error);
    res.status(500).json({ error: 'Failed to generate fitness insights' });
  }
});

export default router;