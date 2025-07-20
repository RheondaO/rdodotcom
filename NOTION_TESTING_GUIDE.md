# Notion Integration Testing Guide

## ✅ INTEGRATION STATUS: SUCCESS 

- **Tasks Database**: PRODUCTIVITYTASKS (ID: 22ef3f41...) - ✅ WORKING
- **Time Blocks Database**: PRODUCTIVITYTIMEBLOCKS (ID: 236f3f41...) - ✅ WORKING  
- **Secret Names**: NOTION_TASKS_URL, NOTION_TIMEBLOCKS_URL, NOTION_INTEGRATION_SECRET - ✅ CONFIGURED
- **Authentication**: Admin password working - ✅ RESOLVED
- **Database Access**: Updated permissions in Notion - ✅ RESOLVED
- **API Routes**: All `/api/notion/*` routes working correctly - ✅ WORKING

**Status**: All Notion integration issues have been resolved and the system is fully functional.

## Step 1: Verify Environment Configuration
First, test the basic environment setup:

```bash
# Check environment variables manually
echo "NOTION_INTEGRATION_SECRET: $(printenv NOTION_INTEGRATION_SECRET | cut -c1-10)..."
echo "NOTION_TASKS_URL: $(printenv NOTION_TASKS_URL | wc -c) characters"  
echo "NOTION_TIMEBLOCKS_URL: $(printenv NOTION_TIMEBLOCKS_URL | wc -c) characters"

# Run the test script
node test_notion.js
```

**Expected Results**:
- Integration secret: 50 characters, starts with `ntn_`
- URLs: ~90 characters each
- Database IDs: Successfully extracted (22ef3f41..., 236f3f41...)
- Notion client: Initializes successfully

## Step 2: Test Basic Read Operations
Verify we can read existing data from databases:

```bash
# Get existing tasks
curl -X GET "http://localhost:5000/api/tasks"

# Get existing time blocks for today
curl -X GET "http://localhost:5000/api/time-blocks/2025-07-20"
```

**Expected Response**: Should return existing data or specific error messages.

## Step 3: Test Authentication (Required for Create Operations)
**Note**: Authentication credentials may vary between development and production.

```bash
# For production, check what admin password is configured
echo "Admin password configured: $(printenv ADMIN_PASSWORD | wc -c) characters"

# Try login (password may need to be different in production)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin"}' \
  -c cookies.txt -s

# Verify login
curl -X GET http://localhost:5000/api/auth/status -b cookies.txt -s
```

**Expected Response**: `{"authenticated":true,"isAdmin":true}`
**If fails**: Check production admin password configuration.

## Step 4: Test Task Creation
Create a test task:

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Test Task - Integration Check",
    "description": "Testing Notion integration",
    "section": "Work", 
    "priority": "High",
    "dueDate": "2025-07-20"
  }'
```

**Expected Response**: Should return created task data or specific error message.

## Step 5: Test Time Block Creation
Create a test time block:

```bash
curl -X POST http://localhost:5000/api/time-blocks \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Test Time Block - Integration Check",
    "description": "Testing Time Blocks integration",
    "date": "2025-07-20",
    "startTime": "14:00",
    "endTime": "15:00",
    "category": "Work"
  }'
```

**Expected Response**: Should return created time block data or specific error message.

## Common Issues to Check

### 1. Permission Issues
- Databases not shared with Notion integration
- Integration doesn't have write permissions

### 2. Database Schema Issues
- Property names don't match expected schema
- Required properties missing

### 3. Authentication Issues
- Integration secret invalid or expired
- Database IDs incorrect

## Debugging Commands

```bash
# Check server logs for detailed error messages
# Console logs will show:
# - Database connection attempts
# - Notion API error codes
# - Specific failure reasons

# Check environment variables
curl -X GET "http://localhost:5000/api/debug/notion"
```

## Next Steps Based on Results
- **If connection fails**: Check database sharing and permissions
- **If read works but write fails**: Check database schema and property names
- **If all operations fail**: Verify integration secret and database IDs