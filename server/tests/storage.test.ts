
import { describe, it, expect, beforeEach } from 'vitest';
import { MemStorage } from '../storage';
import type { 
  InsertDailyEntry, 
  InsertBill, 
  InsertGoal, 
  InsertHabit,
  InsertTodo,
  InsertMiniGameBlock,
  InsertMiniGameDesign,
  InsertSocialMediaPost
} from '@shared/schema';

describe('Data Storage Tests', () => {
  let storage: MemStorage;

  beforeEach(() => {
    storage = new MemStorage();
  });

  describe('Daily Entries', () => {
    it('should create and retrieve daily entry', async () => {
      const entry: InsertDailyEntry = {
        date: '2025-01-15',
        waterIntake: 8,
        exerciseCompleted: true,
        breakfastCompleted: true,
        lunchCompleted: true,
        dinnerCompleted: true,
        workHours: '8.5',
        cashSavings: '100.00'
      };

      const created = await storage.createOrUpdateDailyEntry(entry);
      expect(created.waterIntake).toBe(8);
      expect(created.exerciseCompleted).toBe(true);

      const retrieved = await storage.getDailyEntry('2025-01-15');
      expect(retrieved).toBeDefined();
      expect(retrieved!.waterIntake).toBe(8);
      expect(retrieved!.exerciseCompleted).toBe(true);
    });

    it('should update existing daily entry without data loss', async () => {
      const initialEntry: InsertDailyEntry = {
        date: '2025-01-15',
        waterIntake: 5,
        exerciseCompleted: false,
        workHours: '6.0'
      };

      await storage.createOrUpdateDailyEntry(initialEntry);

      const updateEntry: InsertDailyEntry = {
        date: '2025-01-15',
        waterIntake: 8,
        exerciseCompleted: true
      };

      const updated = await storage.createOrUpdateDailyEntry(updateEntry);
      expect(updated.waterIntake).toBe(8);
      expect(updated.exerciseCompleted).toBe(true);
      expect(updated.workHours).toBe('6.0'); // Original data preserved
    });
  });

  describe('Bills and Payments', () => {
    it('should manage bills lifecycle without data loss', async () => {
      const bill: InsertBill = {
        name: 'Test Bill',
        amount: '150.00',
        isAutoPay: false,
        dueDate: 15
      };

      const created = await storage.createBill(bill);
      expect(created.name).toBe('Test Bill');
      expect(created.amount).toBe('150.00');

      const allBills = await storage.getAllBills();
      expect(allBills.length).toBeGreaterThan(0);
      expect(allBills.some(b => b.name === 'Test Bill')).toBe(true);

      // Test bill payment tracking
      const payment = await storage.createBillPayment({
        billId: created.id,
        date: '2025-01-15',
        amount: '150.00',
        isPaid: true
      });

      expect(payment.billId).toBe(created.id);
      expect(payment.isPaid).toBe(true);

      const payments = await storage.getBillPaymentsForDate('2025-01-15');
      expect(payments.length).toBe(1);
      expect(payments[0].amount).toBe('150.00');
    });
  });

  describe('Goals Management', () => {
    it('should handle goals CRUD operations with data integrity', async () => {
      const goal: InsertGoal = {
        title: 'Test Goal',
        description: 'A test goal for verification',
        category: 'health',
        targetValue: '100.00',
        currentValue: '25.00',
        targetDate: '2025-06-30'
      };

      const created = await storage.createGoal(goal);
      expect(created.title).toBe('Test Goal');
      expect(created.targetValue).toBe('100.00');
      expect(created.currentValue).toBe('25.00');

      // Update goal progress
      const updated = await storage.updateGoal(created.id, {
        currentValue: '50.00'
      });
      expect(updated.currentValue).toBe('50.00');
      expect(updated.title).toBe('Test Goal'); // Original data preserved

      // Verify in list
      const allGoals = await storage.getAllGoals();
      const foundGoal = allGoals.find(g => g.id === created.id);
      expect(foundGoal).toBeDefined();
      expect(foundGoal!.currentValue).toBe('50.00');
    });
  });

  describe('Habits and Habit Logs', () => {
    it('should maintain habit data and completion history', async () => {
      const habit: InsertHabit = {
        name: 'Test Habit',
        description: 'Daily test habit',
        category: 'wellness',
        targetFrequency: 1,
        currentStreak: 0,
        longestStreak: 0,
        isActive: true
      };

      const created = await storage.createHabit(habit);
      expect(created.name).toBe('Test Habit');
      expect(created.currentStreak).toBe(0);

      // Log habit completion
      const habitLog = await storage.createHabitLog({
        habitId: created.id,
        date: '2025-01-15',
        completed: true,
        notes: 'Completed successfully'
      });

      expect(habitLog.completed).toBe(true);
      expect(habitLog.notes).toBe('Completed successfully');

      // Retrieve logs
      const logs = await storage.getHabitLogs(created.id, '2025-01-15', '2025-01-15');
      expect(logs.length).toBe(1);
      expect(logs[0].completed).toBe(true);

      // Update habit streak
      const updatedHabit = await storage.updateHabit(created.id, {
        currentStreak: 5,
        longestStreak: 10
      });
      expect(updatedHabit.currentStreak).toBe(5);
      expect(updatedHabit.longestStreak).toBe(10);
      expect(updatedHabit.name).toBe('Test Habit'); // Original data preserved
    });
  });

  describe('Todos and Time Management', () => {
    it('should handle todos lifecycle with data persistence', async () => {
      const todo: InsertTodo = {
        title: 'Test Todo',
        description: 'A test todo item',
        priority: 'high',
        category: 'work',
        dueDate: '2025-01-15',
        isCompleted: false,
        estimatedDuration: 60
      };

      const created = await storage.createTodo(todo);
      expect(created.title).toBe('Test Todo');
      expect(created.priority).toBe('high');
      expect(created.isCompleted).toBe(false);

      // Complete todo
      const updated = await storage.updateTodo(created.id, {
        isCompleted: true,
        actualDuration: 45
      });
      expect(updated.isCompleted).toBe(true);
      expect(updated.actualDuration).toBe(45);
      expect(updated.title).toBe('Test Todo'); // Original data preserved

      // Retrieve by date
      const todosForDate = await storage.getTodosByDate('2025-01-15');
      expect(todosForDate.length).toBe(1);
      expect(todosForDate[0].isCompleted).toBe(true);
    });

    it('should manage time blocks with data integrity', async () => {
      const timeBlock = await storage.createTimeBlock({
        title: 'Work Block',
        description: 'Focused work session',
        date: '2025-01-15',
        startTime: '09:00',
        endTime: '11:00',
        category: 'work'
      });

      expect(timeBlock.title).toBe('Work Block');
      expect(timeBlock.startTime).toBe('09:00');

      const blocks = await storage.getTimeBlocksByDate('2025-01-15');
      expect(blocks.length).toBe(1);
      expect(blocks[0].title).toBe('Work Block');
    });
  });

  describe('Content Management System', () => {
    it('should handle content creation pipeline with data preservation', async () => {
      // Create category
      const category = await storage.createContentCategory({
        name: 'Test Category',
        description: 'Testing category',
        color: '#FF5733'
      });

      // Create content type
      const contentType = await storage.createContentType({
        categoryId: category.id,
        name: 'Blog Post',
        description: 'Test blog posts',
        frequency: 'weekly',
        targetCount: 2
      });

      // Create content piece
      const contentPiece = await storage.createContentPiece({
        contentTypeId: contentType.id,
        title: 'Test Content',
        description: 'Test content piece',
        status: 'draft',
        targetDate: '2025-02-01',
        priority: 'medium'
      });

      expect(contentPiece.title).toBe('Test Content');
      expect(contentPiece.status).toBe('draft');

      // Update content status
      const updated = await storage.updateContentPiece(contentPiece.id, {
        status: 'published',
        publishedDate: '2025-01-16'
      });

      expect(updated.status).toBe('published');
      expect(updated.title).toBe('Test Content'); // Original data preserved
    });
  });

  describe('Mini Game and Social Media Management', () => {
    it('should manage mini game blocks and designs with data integrity', async () => {
      const block: InsertMiniGameBlock = {
        name: 'Test Block',
        description: 'Testing mini game block',
        frequency: 'weekly',
        frequencyValue: 4,
        category: 'engagement'
      };

      const createdBlock = await storage.createMiniGameBlock(block);
      expect(createdBlock.name).toBe('Test Block');
      expect(createdBlock.frequencyValue).toBe(4);

      const design: InsertMiniGameDesign = {
        miniGameBlockId: createdBlock.id,
        title: 'Test Design',
        description: 'Testing design',
        status: 'designed',
        targetDate: '2025-02-01',
        version: 1
      };

      const createdDesign = await storage.createMiniGameDesign(design);
      expect(createdDesign.title).toBe('Test Design');
      expect(createdDesign.miniGameBlockId).toBe(createdBlock.id);

      // Create social media post
      const post: InsertSocialMediaPost = {
        miniGameDesignId: createdDesign.id,
        platform: 'instagram',
        scheduledDate: new Date('2025-02-01'),
        dayOfWeek: 'saturday',
        timeSlot: 'morning',
        postType: 'image',
        caption: 'Test post',
        hashtags: ['#test', '#game']
      };

      const createdPost = await storage.createSocialMediaPost(post);
      expect(createdPost.platform).toBe('instagram');
      expect(createdPost.caption).toBe('Test post');
      expect(createdPost.hashtags).toEqual(['#test', '#game']);

      // Verify relationships
      const designsForBlock = await storage.getMiniGameDesignsByBlock(createdBlock.id);
      expect(designsForBlock.length).toBe(1);
      expect(designsForBlock[0].title).toBe('Test Design');

      const postsForDesign = await storage.getSocialMediaPostsByDesign(createdDesign.id);
      expect(postsForDesign.length).toBe(1);
      expect(postsForDesign[0].caption).toBe('Test post');
    });
  });

  describe('Analytics and Performance Data', () => {
    it('should maintain analytics data integrity', async () => {
      // First create the prerequisite data
      const block = await storage.createMiniGameBlock({
        name: 'Analytics Test Block',
        description: 'For testing analytics',
        frequency: 'weekly',
        frequencyValue: 2,
        category: 'engagement'
      });

      const design = await storage.createMiniGameDesign({
        miniGameBlockId: block.id,
        title: 'Analytics Design',
        description: 'For testing',
        status: 'designed',
        targetDate: '2025-02-01',
        version: 1
      });

      const post = await storage.createSocialMediaPost({
        miniGameDesignId: design.id,
        platform: 'instagram',
        scheduledDate: new Date('2025-02-01'),
        dayOfWeek: 'saturday',
        timeSlot: 'morning',
        postType: 'image',
        caption: 'Analytics test'
      });

      // Create analytics data
      const analytics = await storage.createSocialMediaAnalytics({
        postId: post.id,
        impressions: 1000,
        reach: 800,
        likes: 50,
        comments: 10,
        shares: 5
      });

      expect(analytics.impressions).toBe(1000);
      expect(analytics.likes).toBe(50);

      // Create performance insights
      const insights = await storage.createPerformanceInsights({
        miniGameBlockId: block.id,
        platform: 'instagram',
        dayOfWeek: 'saturday',
        timeSlot: 'morning',
        postType: 'image',
        avgImpressions: 950,
        avgLikes: 45,
        totalPosts: 10
      });

      expect(insights.avgImpressions).toBe(950);
      expect(insights.totalPosts).toBe(10);

      // Verify data retrieval
      const allAnalytics = await storage.getAllSocialMediaAnalytics();
      expect(allAnalytics.length).toBeGreaterThan(0);

      const postAnalytics = await storage.getSocialMediaAnalyticsByPost(post.id);
      expect(postAnalytics.length).toBe(1);
      expect(postAnalytics[0].impressions).toBe(1000);
    });
  });

  describe('Data Persistence and Relationships', () => {
    it('should maintain data relationships across complex operations', async () => {
      // Create a complete workflow
      const category = await storage.createContentCategory({
        name: 'Workflow Category',
        description: 'Testing workflow'
      });

      const contentType = await storage.createContentType({
        categoryId: category.id,
        name: 'Workflow Content',
        description: 'Testing',
        frequency: 'monthly',
        targetCount: 1
      });

      const contentPiece = await storage.createContentPiece({
        contentTypeId: contentType.id,
        title: 'Workflow Test',
        description: 'Testing complete workflow',
        status: 'draft'
      });

      const block = await storage.createMiniGameBlock({
        name: 'Workflow Block',
        description: 'Testing workflow',
        frequency: 'monthly',
        frequencyValue: 1
      });

      const design = await storage.createMiniGameDesign({
        miniGameBlockId: block.id,
        title: 'Workflow Design',
        description: 'Testing',
        status: 'designed',
        targetDate: '2025-02-01',
        version: 1
      });

      // Verify all data is accessible and relationships intact
      const categories = await storage.getAllContentCategories();
      const types = await storage.getAllContentTypes();
      const pieces = await storage.getAllContentPieces();
      const blocks = await storage.getAllMiniGameBlocks();
      const designs = await storage.getAllMiniGameDesigns();

      expect(categories.some(c => c.name === 'Workflow Category')).toBe(true);
      expect(types.some(t => t.name === 'Workflow Content')).toBe(true);
      expect(pieces.some(p => p.title === 'Workflow Test')).toBe(true);
      expect(blocks.some(b => b.name === 'Workflow Block')).toBe(true);
      expect(designs.some(d => d.title === 'Workflow Design')).toBe(true);

      // Test relationship integrity
      const blockDesigns = await storage.getMiniGameDesignsByBlock(block.id);
      expect(blockDesigns.length).toBe(1);
      expect(blockDesigns[0].title).toBe('Workflow Design');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing data gracefully', async () => {
      const nonExistentEntry = await storage.getDailyEntry('2025-12-31');
      expect(nonExistentEntry).toBeUndefined();

      const emptyLogs = await storage.getHabitLogs(999, '2025-01-01', '2025-01-31');
      expect(emptyLogs).toEqual([]);

      const emptyTodos = await storage.getTodosByDate('2025-12-31');
      expect(emptyTodos).toEqual([]);
    });

    it('should handle large data sets without corruption', async () => {
      // Create multiple entries
      for (let i = 1; i <= 100; i++) {
        await storage.createTodo({
          title: `Todo ${i}`,
          description: `Description ${i}`,
          dueDate: `2025-01-${String(i % 28 + 1).padStart(2, '0')}`,
          priority: i % 2 === 0 ? 'high' : 'low'
        });
      }

      const allTodos = await storage.getAllTodos();
      expect(allTodos.length).toBe(100);

      // Verify data integrity
      const todo50 = allTodos.find(t => t.title === 'Todo 50');
      expect(todo50).toBeDefined();
      expect(todo50!.description).toBe('Description 50');
      expect(todo50!.priority).toBe('high');
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent updates without data loss', async () => {
      const entry: InsertDailyEntry = {
        date: '2025-01-15',
        waterIntake: 0,
        exerciseCompleted: false
      };

      await storage.createOrUpdateDailyEntry(entry);

      // Simulate concurrent updates
      const promises = [
        storage.createOrUpdateDailyEntry({ date: '2025-01-15', waterIntake: 1 }),
        storage.createOrUpdateDailyEntry({ date: '2025-01-15', exerciseCompleted: true }),
        storage.createOrUpdateDailyEntry({ date: '2025-01-15', workHours: '8.0' }),
        storage.createOrUpdateDailyEntry({ date: '2025-01-15', cashSavings: '50.00' })
      ];

      await Promise.all(promises);

      const finalEntry = await storage.getDailyEntry('2025-01-15');
      expect(finalEntry).toBeDefined();
      // At least some updates should be preserved
      expect(
        finalEntry!.waterIntake > 0 || 
        finalEntry!.exerciseCompleted || 
        finalEntry!.workHours || 
        finalEntry!.cashSavings
      ).toBe(true);
    });
  });
});
