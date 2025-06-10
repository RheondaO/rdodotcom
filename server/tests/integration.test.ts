
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../routes';
import { MemStorage } from '../storage';

describe('API Integration Tests', () => {
  let app: express.Application;
  let server: any;

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    server = await registerRoutes(app);
  });

  afterEach(() => {
    if (server) {
      server.close();
    }
  });

  describe('Daily Entry Endpoints', () => {
    it('should create and retrieve daily entry via API', async () => {
      const entryData = {
        date: '2025-01-15',
        waterIntake: 8,
        exerciseCompleted: true,
        workHours: '8.5'
      };

      // Create entry
      const createResponse = await request(app)
        .post('/api/daily-entry')
        .send(entryData)
        .expect(200);

      expect(createResponse.body.waterIntake).toBe(8);
      expect(createResponse.body.exerciseCompleted).toBe(true);

      // Retrieve entry
      const getResponse = await request(app)
        .get('/api/daily-entry/2025-01-15')
        .expect(200);

      expect(getResponse.body.waterIntake).toBe(8);
      expect(getResponse.body.exerciseCompleted).toBe(true);
      expect(getResponse.body.workHours).toBe('8.5');
    });
  });

  describe('Goals Endpoints', () => {
    it('should handle goals CRUD operations', async () => {
      const goalData = {
        title: 'API Test Goal',
        description: 'Testing via API',
        category: 'health',
        targetValue: '100.00',
        currentValue: '25.00',
        targetDate: '2025-06-30'
      };

      // Create goal
      const createResponse = await request(app)
        .post('/api/goals')
        .send(goalData)
        .expect(200);

      const goalId = createResponse.body.id;
      expect(createResponse.body.title).toBe('API Test Goal');

      // Get all goals
      const getAllResponse = await request(app)
        .get('/api/goals')
        .expect(200);

      expect(Array.isArray(getAllResponse.body)).toBe(true);
      const foundGoal = getAllResponse.body.find((g: any) => g.id === goalId);
      expect(foundGoal).toBeDefined();

      // Update goal
      const updateResponse = await request(app)
        .patch(`/api/goals/${goalId}`)
        .send({ currentValue: '50.00' })
        .expect(200);

      expect(updateResponse.body.currentValue).toBe('50.00');
      expect(updateResponse.body.title).toBe('API Test Goal');

      // Delete goal
      await request(app)
        .delete(`/api/goals/${goalId}`)
        .expect(200);

      // Verify deletion
      const finalGetResponse = await request(app)
        .get('/api/goals')
        .expect(200);

      const deletedGoal = finalGetResponse.body.find((g: any) => g.id === goalId);
      expect(deletedGoal).toBeUndefined();
    });

    it('should enforce goal limit', async () => {
      // Create 5 goals (the limit)
      for (let i = 1; i <= 5; i++) {
        await request(app)
          .post('/api/goals')
          .send({
            title: `Goal ${i}`,
            category: 'test',
            targetValue: '100.00'
          })
          .expect(200);
      }

      // Try to create 6th goal - should fail
      await request(app)
        .post('/api/goals')
        .send({
          title: 'Goal 6',
          category: 'test',
          targetValue: '100.00'
        })
        .expect(400);
    });
  });

  describe('Habits Endpoints', () => {
    it('should manage habits and logs', async () => {
      const habitData = {
        name: 'API Test Habit',
        description: 'Testing habit via API',
        category: 'wellness',
        targetFrequency: 1,
        isActive: true
      };

      // Create habit
      const createResponse = await request(app)
        .post('/api/habits')
        .send(habitData)
        .expect(200);

      const habitId = createResponse.body.id;
      expect(createResponse.body.name).toBe('API Test Habit');

      // Create habit log
      const logData = {
        habitId: habitId,
        date: '2025-01-15',
        completed: true,
        notes: 'Completed successfully'
      };

      const logResponse = await request(app)
        .post('/api/habit-logs')
        .send(logData)
        .expect(200);

      expect(logResponse.body.completed).toBe(true);
      expect(logResponse.body.notes).toBe('Completed successfully');

      // Get habit logs
      const getLogsResponse = await request(app)
        .get(`/api/habit-logs/${habitId}/2025-01-15`)
        .expect(200);

      expect(Array.isArray(getLogsResponse.body)).toBe(true);
      expect(getLogsResponse.body.length).toBe(1);
      expect(getLogsResponse.body[0].completed).toBe(true);
    });
  });

  describe('Todos Endpoints', () => {
    it('should manage todos with date filtering', async () => {
      const todoData = {
        title: 'API Test Todo',
        description: 'Testing todo via API',
        priority: 'high',
        dueDate: '2025-01-15',
        estimatedDuration: 60
      };

      // Create todo
      const createResponse = await request(app)
        .post('/api/todos')
        .send(todoData)
        .expect(200);

      const todoId = createResponse.body.id;
      expect(createResponse.body.title).toBe('API Test Todo');
      expect(createResponse.body.priority).toBe('high');

      // Get todos by date
      const getResponse = await request(app)
        .get('/api/todos/2025-01-15')
        .expect(200);

      expect(Array.isArray(getResponse.body)).toBe(true);
      const foundTodo = getResponse.body.find((t: any) => t.id === todoId);
      expect(foundTodo).toBeDefined();
      expect(foundTodo.title).toBe('API Test Todo');

      // Update todo
      const updateResponse = await request(app)
        .patch(`/api/todos/${todoId}`)
        .send({ 
          isCompleted: true,
          actualDuration: 45
        })
        .expect(200);

      expect(updateResponse.body.isCompleted).toBe(true);
      expect(updateResponse.body.actualDuration).toBe(45);
      expect(updateResponse.body.title).toBe('API Test Todo');
    });
  });

  describe('Content Management Endpoints', () => {
    it('should handle content creation workflow', async () => {
      // Create category
      const categoryResponse = await request(app)
        .post('/api/content-categories')
        .send({
          name: 'API Test Category',
          description: 'Testing category',
          color: '#FF5733'
        })
        .expect(200);

      const categoryId = categoryResponse.body.id;

      // Create content type
      const typeResponse = await request(app)
        .post('/api/content-types')
        .send({
          categoryId: categoryId,
          name: 'API Blog Post',
          description: 'Testing content type',
          frequency: 'weekly',
          targetCount: 2
        })
        .expect(200);

      const typeId = typeResponse.body.id;

      // Create content piece
      const pieceResponse = await request(app)
        .post('/api/content-pieces')
        .send({
          contentTypeId: typeId,
          title: 'API Test Content',
          description: 'Testing content piece',
          status: 'draft',
          priority: 'medium'
        })
        .expect(200);

      const pieceId = pieceResponse.body.id;
      expect(pieceResponse.body.title).toBe('API Test Content');

      // Update content piece
      const updateResponse = await request(app)
        .patch(`/api/content-pieces/${pieceId}`)
        .send({
          status: 'published',
          publishedDate: '2025-01-16'
        })
        .expect(200);

      expect(updateResponse.body.status).toBe('published');
      expect(updateResponse.body.title).toBe('API Test Content');

      // Verify all data is accessible
      const categoriesResponse = await request(app)
        .get('/api/content-categories')
        .expect(200);

      const typesResponse = await request(app)
        .get('/api/content-types')
        .expect(200);

      const piecesResponse = await request(app)
        .get('/api/content-pieces')
        .expect(200);

      expect(categoriesResponse.body.some((c: any) => c.id === categoryId)).toBe(true);
      expect(typesResponse.body.some((t: any) => t.id === typeId)).toBe(true);
      expect(piecesResponse.body.some((p: any) => p.id === pieceId)).toBe(true);
    });
  });

  describe('Mini Game and Social Media Endpoints', () => {
    it('should handle mini game workflow with social media', async () => {
      // Create mini game block
      const blockResponse = await request(app)
        .post('/api/mini-game-blocks')
        .send({
          name: 'API Test Block',
          description: 'Testing block',
          frequency: 'weekly',
          frequencyValue: 4,
          category: 'engagement'
        })
        .expect(200);

      const blockId = blockResponse.body.id;

      // Create design
      const designResponse = await request(app)
        .post('/api/mini-game-designs')
        .send({
          miniGameBlockId: blockId,
          title: 'API Test Design',
          description: 'Testing design',
          status: 'designed',
          targetDate: '2025-02-01',
          version: 1
        })
        .expect(200);

      const designId = designResponse.body.id;

      // Create social media post
      const postResponse = await request(app)
        .post('/api/social-media-posts')
        .send({
          miniGameDesignId: designId,
          platform: 'instagram',
          scheduledDate: '2025-02-01T10:00:00Z',
          dayOfWeek: 'saturday',
          timeSlot: 'morning',
          postType: 'image',
          caption: 'API test post',
          hashtags: ['#test', '#api']
        })
        .expect(200);

      const postId = postResponse.body.id;
      expect(postResponse.body.caption).toBe('API test post');

      // Create analytics
      const analyticsResponse = await request(app)
        .post('/api/social-media-analytics')
        .send({
          postId: postId,
          impressions: 1000,
          reach: 800,
          likes: 50,
          comments: 10,
          shares: 5
        })
        .expect(200);

      expect(analyticsResponse.body.impressions).toBe(1000);

      // Verify data relationships
      const designsResponse = await request(app)
        .get('/api/mini-game-designs')
        .expect(200);

      const postsResponse = await request(app)
        .get('/api/social-media-posts')
        .expect(200);

      const analyticsGetResponse = await request(app)
        .get('/api/social-media-analytics')
        .expect(200);

      expect(designsResponse.body.some((d: any) => d.id === designId)).toBe(true);
      expect(postsResponse.body.some((p: any) => p.id === postId)).toBe(true);
      expect(analyticsGetResponse.body.some((a: any) => a.postId === postId)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid data gracefully', async () => {
      // Invalid goal data
      await request(app)
        .post('/api/goals')
        .send({
          // Missing required fields
          description: 'Invalid goal'
        })
        .expect(400);

      // Invalid daily entry date
      await request(app)
        .post('/api/daily-entry')
        .send({
          date: 'invalid-date',
          waterIntake: 8
        })
        .expect(400);

      // Non-existent resource
      await request(app)
        .get('/api/daily-entry/2050-01-01')
        .expect(200); // Returns null for non-existent entries

      await request(app)
        .patch('/api/goals/999999')
        .send({ currentValue: '50.00' })
        .expect(500); // Should handle non-existent goal
    });
  });
});
