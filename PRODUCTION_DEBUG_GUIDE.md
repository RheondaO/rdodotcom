# Production Debug Guide: Notion Connection Issues

## The Problem
Your Notion tasks widget works perfectly in development but shows "Connection Failed" in production, even after re-entering secrets.

## Root Cause Analysis
Since development works but production fails, the issue is **environment-specific**, not related to database design or memory storage. The Notion integration is completely independent of your local database.

## Debugging Steps

### Step 1: Test Production Environment
Use this endpoint to test your production deployment:
```
GET https://your-production-app.replit.app/api/notion/production-test
```

This will return detailed test results showing exactly what's failing.

### Step 2: Check Server Logs
Look for these specific messages in your production server logs:

**Success indicators:**
- `🔑 NOTION_INTEGRATION_SECRET configured: true`
- `🔗 NOTION_PAGE_URL configured: true`
- `🔑 Secret length: 50`
- `✅ Successfully retrieved database: TABLEMAKER`

**Error indicators:**
- `❌ NOTION_INTEGRATION_SECRET seems too short`
- `❌ NOTION_INTEGRATION_SECRET should start with 'ntn_'`
- `❌ Error retrieving database: unauthorized`

### Step 3: Environment Variable Issues
Common production environment problems:

#### Issue 1: Truncated Secrets
**Problem**: Production environment cuts off long environment variables
**Solution**: Verify full secret length in production logs

#### Issue 2: Character Encoding
**Problem**: Special characters in secrets get encoded differently
**Solution**: Re-copy secrets directly from Notion integration page

#### Issue 3: Deployment Timing
**Problem**: Secrets added after deployment, not loaded properly
**Solution**: Add secrets, then fully redeploy (not just restart)

## Common Production-Specific Solutions

### Solution 1: Full Redeploy After Secrets
1. Delete existing environment variables
2. Re-add both secrets
3. Deploy application (not just restart)
4. Check logs for connection success

### Solution 2: Secret Regeneration
1. Go to https://www.notion.so/my-integrations
2. Find your integration
3. Click "Show" then "Regenerate"
4. Copy new secret immediately
5. Update production environment
6. Redeploy

### Solution 3: Database Re-sharing
1. Open TABLEMAKER database in Notion
2. Click "..." → "Connections" 
3. Remove existing integration
4. Re-add integration with full permissions
5. Test connection

## Production Environment Differences

### Development Environment
- Environment variables loaded from `.env` file
- Immediate variable updates
- Full debug logging available
- No deployment constraints

### Production Environment
- Environment variables set in deployment settings
- Requires redeploy for changes
- Limited logging visibility
- Potential character encoding issues

## Testing Commands

Run these against your production URL:

```bash
# Replace with your actual production URL
PROD_URL="https://your-app.replit.app"

# Test environment setup
curl "$PROD_URL/api/notion/production-test"

# Test basic connection
curl "$PROD_URL/api/notion/setup"

# Test tasks endpoint
curl "$PROD_URL/api/notion/tasks?date=$(date +%Y-%m-%d)&view=day"
```

## Expected Success Response

When working correctly, you should see:

```json
{
  "environment": "production",
  "hasSecret": true,
  "hasUrl": true,
  "tests": [
    {
      "name": "Environment Variables",
      "status": "PASSED",
      "details": {
        "secretLength": 50,
        "secretFormat": true,
        "urlFormat": true
      }
    },
    {
      "name": "Database Connection",
      "status": "PASSED",
      "details": {
        "databaseCount": 1,
        "databases": [{"id": "22ef3f41...", "title": "TABLEMAKER"}]
      }
    },
    {
      "name": "Task Retrieval",
      "status": "PASSED",
      "details": {"taskCount": 5}
    }
  ]
}
```

## If Still Failing

### Nuclear Option: Complete Reset
1. Delete the integration at https://www.notion.so/my-integrations
2. Create a new integration
3. Share TABLEMAKER database with new integration
4. Copy new secret and database URL
5. Update production environment variables
6. Full redeploy

### Alternative: Use Different Environment
Since the issue seems environment-specific, you might need to:
1. Use a different deployment service temporarily
2. Check if Replit has specific environment variable limitations
3. Contact Replit support about environment variable handling

## Success Verification

Once fixed, you should see:
- No "Connection Failed" error in widget
- Tasks populate for today/yesterday/tomorrow
- Create/edit functions work (when logged in)
- Production test endpoint returns all "PASSED" status