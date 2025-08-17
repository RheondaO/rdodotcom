# AI App Development - Notion Database Setup Guide

## Current Issue
Your NOTION_PAGE_URL points to a database instead of a page. Notion requires a page as the parent to create child databases.

## Quick Setup Steps

### Step 1: Create AI Development Page
1. Go to your Notion workspace
2. Create a new page titled "AI App Development"
3. Click the "..." menu on the page
4. Select "Connections" 
5. Add your existing Notion integration to this page

### Step 2: Get the Page URL
1. Copy the URL of your new "AI App Development" page
2. The URL should look like: `https://www.notion.so/AI-App-Development-[32-character-id]`

### Step 3: Add Environment Variable
Add this line to your `.env` file:
```
NOTION_AI_DEV_PAGE_URL=https://www.notion.so/AI-App-Development-[your-page-id-here]
```

### Step 4: Run Setup
Once you've added the environment variable, run:
```bash
cd server && tsx setup-app-development-notion.ts
```

## What This Will Create
The setup will create four databases under your AI Development page:
1. **App Development Projects** - Project tracking with dates, status, tech stack
2. **App Development Tasks** - Task management linked to projects  
3. **App Development Test Items** - Testing scenarios and results
4. **App Development Library** - Prompt library with text file attachments

## Alternative: Manual Database Creation
If you prefer to create databases manually:
1. Create four new databases in your Notion workspace
2. Configure them with the properties shown in `setup-app-development-notion.ts`
3. Add their URLs as environment variables:
   - `NOTION_AI_PROJECTS_URL`
   - `NOTION_AI_TASKS_URL` 
   - `NOTION_AI_TESTITEMS_URL`
   - `NOTION_AI_LIBRARY_URL`

## Integration with Belle Journal
Once the databases are created, the AI App Development section will automatically sync with your Notion data, allowing you to:
- Track projects with start/end/target dates
- Manage tasks and their completion status
- Store testing scenarios and results
- Build a library of reusable AI prompts as text file attachments

## Need Help?
If you encounter any issues:
1. Verify your Notion integration has access to the new page
2. Check that the page URL is correct (should be a page, not a database)
3. Ensure your NOTION_INTEGRATION_SECRET is still valid