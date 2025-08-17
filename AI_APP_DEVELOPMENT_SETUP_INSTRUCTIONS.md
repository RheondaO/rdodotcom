# AI App Development Notion Setup Instructions

## Current Issue
The NOTION_PAGE_URL environment variable is currently pointing to a database instead of a page. To create the AI App Development databases, we need a Notion page as the parent.

## Solution Options

### Option 1: Create a New Notion Page (Recommended)
1. Go to your Notion workspace
2. Create a new page called "AI App Development"
3. Share this page with your integration (connect your integration to this page)
4. Copy the page URL and set it as NOTION_AI_DEV_PAGE_URL

### Option 2: Use the Root Page
If you have a root page that contains your existing databases, you can:
1. Navigate to the parent page of your current databases
2. Share that page with your integration
3. Use that page URL as NOTION_AI_DEV_PAGE_URL

### Option 3: Create Databases in Current Structure
Alternatively, we can create the AI Development databases as standalone databases and reference them directly like the existing PRODUCTIVITYTASKS, PRODUCTIVITYTIMEBLOCKS, and PRODUCTIVITYTIMERSESSIONS.

## Required Environment Variables
After creating the page, add this to your environment:
```
NOTION_AI_DEV_PAGE_URL=https://www.notion.so/your-page-id-here
```

## Database Schema
The setup will create four databases:
1. **App Development Projects** - Main project tracking
2. **App Development Tasks** - Task management per project
3. **App Development Test Items** - Testing scenarios and results
4. **App Development Library** - Prompt library with text file attachments

## Next Steps
1. Create the Notion page
2. Add the NOTION_AI_DEV_PAGE_URL environment variable
3. Run the setup script: `tsx server/setup-app-development-notion.ts`