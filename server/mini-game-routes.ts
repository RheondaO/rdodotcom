import { Router } from 'express';
import { z } from 'zod';
import { notion } from './notion';
import { MINI_GAME_TITLES, PAGE_OPTIONS } from '../shared/dropdown-constants';
import fs from 'fs/promises';
import path from 'path';

const router = Router();

// Validation schema for mini game blocks
const miniGameBlockSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  rotationOnlyTags: z.array(z.enum(PAGE_OPTIONS as unknown as [string, ...string[]])).optional().default([]),
  status: z.enum(['active', 'paused', 'completed']).default('active'),
  color: z.string().default('#6B7280'),
  icon: z.string().max(5).default('M'),
  notionDatabaseId: z.string().optional()
});

// In-memory storage for mini game blocks (replace with actual database)
let miniGameBlocks: any[] = [];
let nextId = 1;

/**
 * GET /api/mini-game-blocks
 * Get all mini game blocks
 */
router.get('/mini-game-blocks', async (req, res) => {
  try {
    res.json(miniGameBlocks);
  } catch (error: any) {
    console.error('Error fetching mini game blocks:', error);
    res.status(500).json({ error: 'Failed to fetch mini game blocks' });
  }
});

/**
 * POST /api/mini-game-blocks
 * Create a new mini game block and sync with Notion
 */
router.post('/mini-game-blocks', async (req, res) => {
  try {
    const validatedData = miniGameBlockSchema.parse(req.body);
    
    // Create Notion database for this mini game block
    let notionDatabaseId = null;
    try {
      // Create a new database in Notion for this mini game block
      const database = await notion.databases.create({
        parent: { type: 'page_id', page_id: process.env.NOTION_PARENT_PAGE_ID || '' },
        title: [{ type: 'text', text: { content: validatedData.title } }],
        properties: {
          'Title': { type: 'title', title: {} },
          'Status': {
            type: 'select',
            select: {
              options: [
                { name: 'Scheduled', color: 'blue' },
                { name: 'In Progress', color: 'yellow' },
                { name: 'Published', color: 'green' },
                { name: 'Archived', color: 'gray' }
              ]
            }
          },
          'Scheduled Date': { type: 'date', date: {} },
          'Page': {
            type: 'select',
            select: {
              options: PAGE_OPTIONS.map(page => ({ name: page, color: 'default' }))
            }
          },
          'Month': { type: 'rich_text', rich_text: {} },
          'Day of Week': { type: 'rich_text', rich_text: {} },
          'Moon Phase': { type: 'rich_text', rich_text: {} },
          'Square Type': { type: 'rich_text', rich_text: {} },
          'Description': { type: 'rich_text', rich_text: {} }
        }
      });
      
      notionDatabaseId = database.id;
      console.log(`✅ Created Notion database for mini game: ${validatedData.title}`);
    } catch (notionError: any) {
      console.warn('⚠️ Failed to create Notion database:', notionError.message);
      // Continue without Notion integration
    }

    const newMiniGameBlock = {
      id: nextId++,
      title: validatedData.title,
      description: validatedData.description,
      category: validatedData.category,
      notionDatabaseId,
      rotationOnlyTags: validatedData.rotationOnlyTags,
      status: validatedData.status,
      color: validatedData.color,
      icon: validatedData.icon,
      totalPosts: 0,
      scheduledPosts: 0,
      publishedPosts: 0,
      designedPosts: 0,
      reviewedPosts: 0,
      approvedPosts: 0,
      engagement: 0,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    miniGameBlocks.push(newMiniGameBlock);

    // Update the constants file to include the new mini game title
    await updateConstantsFile();

    console.log(`✅ Created mini game block: ${newMiniGameBlock.title}`);
    res.status(201).json(newMiniGameBlock);
  } catch (error: any) {
    console.error('Error creating mini game block:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * PUT /api/mini-game-blocks/:id
 * Update a mini game block
 */
router.put('/mini-game-blocks/:id', async (req, res) => {
  try {
    const blockId = parseInt(req.params.id);
    const updates = miniGameBlockSchema.partial().parse(req.body);

    const blockIndex = miniGameBlocks.findIndex(block => block.id === blockId);
    if (blockIndex === -1) {
      return res.status(404).json({ error: 'Mini game block not found' });
    }

    const updatedBlock = {
      ...miniGameBlocks[blockIndex],
      ...updates,
      updatedAt: new Date()
    };

    miniGameBlocks[blockIndex] = updatedBlock;

    // Update constants file if title changed
    if (updates.title) {
      await updateConstantsFile();
    }

    console.log(`✅ Updated mini game block: ${updatedBlock.title}`);
    res.json(updatedBlock);
  } catch (error: any) {
    console.error('Error updating mini game block:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * DELETE /api/mini-game-blocks/:id
 * Delete a mini game block
 */
router.delete('/mini-game-blocks/:id', async (req, res) => {
  try {
    const blockId = parseInt(req.params.id);

    const blockIndex = miniGameBlocks.findIndex(block => block.id === blockId);
    if (blockIndex === -1) {
      return res.status(404).json({ error: 'Mini game block not found' });
    }

    const deletedBlock = miniGameBlocks.splice(blockIndex, 1)[0];

    // Update constants file
    await updateConstantsFile();

    console.log(`✅ Deleted mini game block: ${deletedBlock.title}`);
    res.json({ message: 'Mini game block deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting mini game block:', error);
    res.status(500).json({ error: 'Failed to delete mini game block' });
  }
});

/**
 * Update the constants file with current mini game titles (DISABLED for security)
 * TODO: Replace with safer persistence mechanism
 */
async function updateConstantsFile(): Promise<void> {
  try {
    // SECURITY: Disabled runtime file modification to prevent code injection
    // Instead, mini game titles should be stored in database/storage and consumed via API
    console.log('⚠️ Constants file update disabled for security. Titles should be managed via database.');
    
    // Log the current titles for debugging
    const currentTitles = miniGameBlocks.map(block => block.title);
    console.log('📋 Current mini game titles:', currentTitles);
  } catch (error: any) {
    console.error('⚠️ Failed to log mini game titles:', error.message);
  }
}

export default router;