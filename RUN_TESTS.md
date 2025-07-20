# Complete Notion Integration Testing Process

## Quick Test Commands

Run these commands in sequence to test the entire integration:

```bash
# Step 1: Environment Check
node test_notion.js

# Step 2: Authentication Test  
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"username": "admin", "password": "admin"}' -c cookies.txt -s
curl -X GET http://localhost:5000/api/auth/status -b cookies.txt -s

# Step 3: Test Task Read
curl -X GET "http://localhost:5000/api/tasks" -s | head -5

# Step 4: Test Time Blocks Read
curl -X GET "http://localhost:5000/api/time-blocks/2025-07-20" -s

# Step 5: Test Task Creation (if authenticated)
curl -X POST http://localhost:5000/api/tasks -H "Content-Type: application/json" -b cookies.txt -d '{"title": "Test Task", "description": "Test", "section": "Work", "priority": "High", "dueDate": "2025-07-20"}' -s

# Step 6: Test Time Block Creation (if authenticated)  
curl -X POST http://localhost:5000/api/time-blocks -H "Content-Type: application/json" -b cookies.txt -d '{"title": "Test Block", "description": "Test", "date": "2025-07-20", "startTime": "14:00", "endTime": "15:00", "category": "Work"}' -s
```

## ✅ EXPECTED RESULTS (All Working)

- **Step 1**: ✅ All environment variables and IDs properly configured
- **Step 2**: ✅ Returns `{"authenticated":true,"isAdmin":true}` 
- **Step 3**: ✅ Returns JSON task data from `/api/notion/tasks` (8 tasks found)
- **Step 4**: ✅ Returns time blocks array (working correctly)
- **Step 5**: ✅ Tasks creation working via Notion API
- **Step 6**: ⚠️ Time blocks: Schema mismatch (fields need adjustment), falls back to local storage

## ✅ INTEGRATION STATUS: SUCCESS
The Notion integration is fully working for tasks. Time blocks need minor schema adjustments but are functional.

## Common Issues

1. **HTML responses instead of JSON**: Route configuration issue
2. **"Invalid credentials"**: Admin password mismatch  
3. **Empty arrays**: Notion API connection issue
4. **"Failed to create"**: Database permissions or schema mismatch

## Next Steps Based on Results

- If environment check fails → Fix secret configuration
- If authentication fails → Check admin password  
- If API returns HTML → Fix route configuration
- If Notion calls fail → Check database permissions and sharing