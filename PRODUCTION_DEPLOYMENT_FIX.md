# Production Deployment Fix for Notion Tasks Widget

## Issue Confirmed
The problem is **NOT** with the UI or field connections. The issue is that the production environment can't reach the API endpoints properly.

## Evidence
- ✅ Development API works: Returns 6 tasks with complete data structure
- ✅ UI integration works: `ProductivityTasks` component is properly connected in `ProductivitySection`
- ✅ Field mapping works: All Notion database fields are correctly mapped to UI components
- ❌ Production API fails: Returns HTML instead of JSON when accessing `/api/notion/tasks`

## Root Cause
The production environment is having routing issues where API endpoints are not being reached correctly. This is a deployment/server configuration issue, not a code issue.

## Immediate Fix Steps

### Step 1: Check Production Route Registration
The issue is likely that the Notion API routes are not being registered properly in production.

1. Verify that `server/routes.ts` is being imported correctly in production
2. Check that the Notion routes are registered after the database routes
3. Ensure production build includes all route definitions

### Step 2: Test Production API Directly
Use these exact commands to test your production deployment:

```bash
# Replace with your actual production URL
PROD_URL="https://your-app.replit.app"

# Test if routes are registered
curl -v "$PROD_URL/api/notion/setup"

# Test if environment variables are loaded
curl -v "$PROD_URL/api/notion/production-test"

# Test tasks endpoint
curl -v "$PROD_URL/api/notion/tasks"
```

### Step 3: Check Build Process
The issue might be in the build process:

1. Make sure `server/routes.ts` includes all Notion routes
2. Verify that the production build compiles correctly
3. Check that all imports are resolved in production

## Quick Fix Implementation

Add this to your production startup to ensure routes are registered:

```typescript
// In server/index.ts - ensure this runs in production
import { registerRoutes } from "./routes";

// Make sure this is called
const server = await registerRoutes(app);
```

## Production Environment Verification

The widget should work once the API routes are properly accessible in production. The complete data flow is:

1. User opens Belle Journal in production
2. `ProductivitySection` renders with selected date
3. `ProductivityTasks` component makes API call to `/api/notion/tasks`
4. API returns task data from Notion database
5. UI displays tasks with proper formatting

Since steps 1-2 and 5 work correctly, the problem is specifically step 3-4 in production.

## Success Indicators

Once fixed, you should see:
- Production API endpoints return JSON (not HTML)
- Tasks populate in the "Notion Tasks - Today" widget
- No "Connection Failed" error messages
- Full CRUD functionality works when logged in as admin