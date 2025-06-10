
import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseStorage } from '../storage';
import type { InsertGoal } from '@shared/schema';

describe('Database Storage Tests', () => {
  let storage: DatabaseStorage;

  beforeEach(() => {
    storage = new DatabaseStorage();
  });

  describe('Database Goals Integration', () => {
    it('should persist goals to database', async () => {
      const goalData: InsertGoal = {
        title: 'Database Test Goal',
        description: 'Testing database persistence',
        category: 'health',
        targetValue: '100.00',
        currentValue: '0.00',
        targetDate: '2025-06-30'
      };

      // Create goal
      const created = await storage.createGoal(goalData);
      expect(created.title).toBe('Database Test Goal');
      expect(created.id).toBeDefined();

      // Retrieve goals
      const allGoals = await storage.getAllGoals();
      const foundGoal = allGoals.find(g => g.id === created.id);
      expect(foundGoal).toBeDefined();
      expect(foundGoal!.title).toBe('Database Test Goal');

      // Update goal
      const updated = await storage.updateGoal(created.id, {
        currentValue: '25.00'
      });
      expect(updated.currentValue).toBe('25.00');
      expect(updated.title).toBe('Database Test Goal');

      // Verify persistence
      const reloaded = await storage.getAllGoals();
      const reloadedGoal = reloaded.find(g => g.id === created.id);
      expect(reloadedGoal!.currentValue).toBe('25.00');

      // Delete goal
      await storage.deleteGoal(created.id);

      // Verify deletion
      const afterDelete = await storage.getAllGoals();
      const deletedGoal = afterDelete.find(g => g.id === created.id);
      expect(deletedGoal).toBeUndefined();
    });
  });

  describe('Memory Storage Fallback', () => {
    it('should handle other data types through memory storage', async () => {
      // Test that non-goals data still works through memory storage
      const habit = await storage.createHabit({
        name: 'Database Test Habit',
        description: 'Testing fallback',
        category: 'wellness',
        targetFrequency: 1,
        isActive: true
      });

      expect(habit.name).toBe('Database Test Habit');

      const allHabits = await storage.getAllHabits();
      const foundHabit = allHabits.find(h => h.id === habit.id);
      expect(foundHabit).toBeDefined();
    });
  });
});
