# Production Deployment Solution: Notion Tasks Widget

## Problem Analysis
The widget shows "Connection Failed" in production despite environment variables being configured correctly. Development environment works perfectly.

## Root Cause
The issue is likely one of these production-specific problems:

1. **Environment Variable Format**: Production might have different environment variable handling
2. **Network Restrictions**: Production environment may have different network access
3. **API Rate Limits**: Production might be hitting Notion API rate limits
4. **Authentication Context**: Different authentication handling in production

## Immediate Solution Steps

### Step 1: Verify Environment Variables in Production
Check that these exact values are set in your production deployment:

```bash
# Check these in your production environment
echo "NOTION_INTEGRATION_SECRET length: ${#NOTION_INTEGRATION_SECRET}"
echo "NOTION_PAGE_URL configured: ${NOTION_PAGE_URL:0:50}..."
```

### Step 2: Test Production Endpoints Directly
Run these curl commands against your production URL:

```bash
# Replace with your actual production URL
PROD_URL="https://your-app.replit.app"

# Test setup endpoint
curl -v "$PROD_URL/api/notion/setup"

# Test tasks endpoint
curl -v "$PROD_URL/api/notion/tasks?date=$(date +%Y-%m-%d)&view=day"
```

### Step 3: Check Server Logs
Look for these specific log messages in your production server logs:

**Success indicators:**
- "🔑 NOTION_INTEGRATION_SECRET configured: true"
- "🔗 NOTION_PAGE_URL configured: true"
- "✅ Successfully retrieved database: TABLEMAKER"

**Error indicators:**
- "❌ NOTION_INTEGRATION_SECRET is not configured"
- "❌ Error retrieving database: unauthorized"
- "❌ Error retrieving database: object_not_found"

## Common Production Issues and Solutions

### Issue 1: Environment Variables Not Loading
**Symptoms**: Widget shows "Connection Failed" immediately
**Solution**: 
1. Verify secrets are added to deployment environment variables
2. Restart the deployment after adding secrets
3. Check for trailing spaces or quotes in environment variables

### Issue 2: Invalid or Expired Integration Secret
**Symptoms**: "unauthorized" error in logs
**Solution**:
1. Generate a new integration secret at https://www.notion.so/my-integrations
2. Update the NOTION_INTEGRATION_SECRET in production
3. Redeploy the application

### Issue 3: Database Access Permission
**Symptoms**: "forbidden" error in logs
**Solution**:
1. Go to your TABLEMAKER database in Notion
2. Click "..." → "Connections"
3. Add your integration to the database
4. Verify integration has read/write permissions

### Issue 4: Incorrect Database URL
**Symptoms**: "object_not_found" error in logs
**Solution**:
1. Verify NOTION_PAGE_URL points to your TABLEMAKER database
2. Ensure URL format is correct (should contain 32-character database ID)
3. Test URL access manually in browser

## Production-Specific Debugging

### Enhanced Error Logging
The system now includes detailed logging:
- Environment variable validation
- Database connection attempts
- Specific error codes and messages
- Authentication status

### Debug Commands
Use these in production to diagnose issues:

```bash
# Test environment variables
node -e "console.log('Secret:', !!process.env.NOTION_INTEGRATION_SECRET); console.log('URL:', !!process.env.NOTION_PAGE_URL);"

# Test database ID extraction
node -e "const url = process.env.NOTION_PAGE_URL; console.log('ID:', url.match(/([a-f0-9]{32})/i)?.[1]);"
```

## Deployment Checklist

### Before Deployment
- [ ] Environment variables added to production settings
- [ ] Integration secret is valid and not expired
- [ ] Database URL is correct and accessible
- [ ] Integration has proper permissions

### After Deployment
- [ ] Check setup endpoint returns `{"isSetup": true}`
- [ ] Verify tasks endpoint returns task data
- [ ] Test widget functionality in browser
- [ ] Monitor server logs for errors

### If Still Failing
- [ ] Regenerate Notion integration secret
- [ ] Verify database sharing settings
- [ ] Check for API rate limits
- [ ] Review network connectivity

## Quick Fix for Common Cases

### Fix 1: Regenerate Integration Secret
1. Go to https://www.notion.so/my-integrations
2. Find your integration
3. Click "Regenerate Secret"
4. Update NOTION_INTEGRATION_SECRET in production
5. Redeploy

### Fix 2: Re-share Database
1. Open TABLEMAKER database in Notion
2. Click "Share" → "Invite"
3. Select your integration
4. Grant "Full access" permissions
5. Save changes

### Fix 3: Environment Variable Reset
1. Delete existing environment variables
2. Re-add with fresh values
3. Restart deployment
4. Test endpoints

## Success Verification
Once fixed, you should see:
- Widget loads without "Connection Failed" error
- Tasks appear for today/yesterday/tomorrow
- Create/edit/delete functions work (when logged in as admin)
- Server logs show successful database connections