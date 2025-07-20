# Notion Integration Testing Guide

## Current Status
- **Tasks Database**: PRODUCTIVITYTASKS (ID: 22ef3f41...)
- **Time Blocks Database**: PRODUCTIVITYTIMEBLOCKS (ID: 236f3f41...)
- **Environment Variables**: All properly configured
- **Issue**: Both integrations returning empty arrays and "Failed to create" errors

## Step 1: Verify Database Access
Test if the integration can connect to each database:

```bash
# Test Tasks database connection
curl -X GET "http://localhost:5000/api/tasks/notion-debug"

# Test Time Blocks database connection  
curl -X GET "http://localhost:5000/api/debug/notion"
```

**Expected Response**: Should show connection status and any error details.

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
Log in as admin first:

```bash
# Login as admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin"}' \
  -c cookies.txt

# Verify login
curl -X GET http://localhost:5000/api/auth/status -b cookies.txt
```

**Expected Response**: Should confirm authentication success.

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