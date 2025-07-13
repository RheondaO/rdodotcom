# Notion Integration Production Deployment Guide

## Required Environment Variables

For the Notion tasks widget to work in production, you must configure these environment variables:

### 1. NOTION_INTEGRATION_SECRET
- **Value**: Your Notion integration token
- **How to get**: From https://www.notion.so/my-integrations
- **Required**: Yes - without this, the widget will show "Connection failed"

### 2. NOTION_PAGE_URL
- **Value**: Your TABLEMAKER database URL
- **Current Value**: The URL of your existing TABLEMAKER database
- **Required**: Yes - this tells the app which database to connect to

## Production Deployment Steps

### Step 1: Set Environment Variables
In your Replit deployment settings, add:
```
NOTION_INTEGRATION_SECRET=your_integration_secret_here
NOTION_PAGE_URL=your_tablemaker_database_url_here
```

### Step 2: Verify Database Connection
After deployment, check these endpoints:
- `/api/notion/setup` - Should return `{"isSetup": true}`
- `/api/notion/tasks` - Should return your tasks array

### Step 3: Test Widget Functionality
1. Go to Productivity section
2. Check "Notion Tasks - Today" widget
3. Verify tasks are loading for current date

## Troubleshooting Common Issues

### Issue 1: Widget Shows "Loading..." Forever
**Cause**: Missing NOTION_INTEGRATION_SECRET
**Solution**: Add the secret to production environment variables

### Issue 2: "Connection Failed" Error
**Cause**: Invalid NOTION_INTEGRATION_SECRET or missing permissions
**Solution**: 
1. Verify secret is correct
2. Check that integration has access to your database
3. Ensure database URL is correct

### Issue 3: Widget Shows "No tasks for today"
**Cause**: No tasks with today's due date, or date filtering issue
**Solution**: 
1. Check if tasks exist in Notion with today's date
2. Verify "Due DateTime" field has proper dates
3. Check server logs for filtering errors

### Issue 4: Tasks Not Updating
**Cause**: Caching or authentication issues
**Solution**:
1. Clear browser cache
2. Check if admin login is working
3. Verify API endpoints are responding

## Database Schema Verification

Your TABLEMAKER database should have these properties:
- **Name** (Title)
- **Description** (Rich Text)
- **Category** (Select: Personal, Work, Health, Finance, Content, Learning, Projects, Habits)
- **Estimated Duration** (Number)
- **Created DateTime** (Created Time)
- **Due DateTime** (Date)
- **Status** (Select: To Do, In Progress, Done, Blocked)
- **Priority** (Select: High, Medium, Low)
- **Completed** (Checkbox)
- **Completed At** (Date)

## Testing Commands

Use these to verify production deployment:

```bash
# Test database connection
curl https://your-app.replit.app/api/notion/setup

# Test today's tasks
curl "https://your-app.replit.app/api/notion/tasks?date=$(date +%Y-%m-%d)&view=day"

# Test all tasks
curl https://your-app.replit.app/api/notion/tasks
```

## Success Indicators

✅ **Working correctly when:**
- Setup endpoint returns `{"isSetup": true}`
- Tasks endpoint returns array of tasks
- Widget shows tasks for selected date
- Create/edit/delete works when logged in as admin

❌ **Not working when:**
- Widget shows "Loading..." indefinitely
- Setup endpoint returns `{"isSetup": false}`
- Tasks endpoint returns error
- Console shows authentication or connection errors