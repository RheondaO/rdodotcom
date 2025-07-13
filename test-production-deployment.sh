#!/bin/bash

# Production Deployment Test Script for Notion Integration
# Run this after deploying to production to verify everything works

echo "🚀 Testing Notion Integration Production Deployment"
echo "=================================================="

# Get the base URL (replace with your actual production URL)
BASE_URL="https://your-app.replit.app"

# If running locally for testing
if [[ "$1" == "local" ]]; then
    BASE_URL="http://localhost:5000"
fi

echo "Testing against: $BASE_URL"
echo ""

# Test 1: Check setup endpoint
echo "1. Testing Notion setup endpoint..."
SETUP_RESPONSE=$(curl -s "$BASE_URL/api/notion/setup")
echo "Response: $SETUP_RESPONSE"

# Check if setup is successful
if echo "$SETUP_RESPONSE" | grep -q '"isSetup":true'; then
    echo "✅ Setup test PASSED"
else
    echo "❌ Setup test FAILED"
    if echo "$SETUP_RESPONSE" | grep -q "NOTION_INTEGRATION_SECRET not configured"; then
        echo "   → Missing NOTION_INTEGRATION_SECRET environment variable"
    elif echo "$SETUP_RESPONSE" | grep -q "NOTION_PAGE_URL not configured"; then
        echo "   → Missing NOTION_PAGE_URL environment variable"
    else
        echo "   → Unknown setup error"
    fi
fi

echo ""

# Test 2: Check tasks endpoint
echo "2. Testing Notion tasks endpoint..."
TODAY=$(date +%Y-%m-%d)
TASKS_RESPONSE=$(curl -s "$BASE_URL/api/notion/tasks?date=$TODAY&view=day")
echo "Response: $TASKS_RESPONSE"

# Check if tasks are returned
if echo "$TASKS_RESPONSE" | grep -q "notionId"; then
    TASK_COUNT=$(echo "$TASKS_RESPONSE" | grep -o '"notionId"' | wc -l)
    echo "✅ Tasks test PASSED - Found $TASK_COUNT tasks for today"
else
    echo "❌ Tasks test FAILED"
    if echo "$TASKS_RESPONSE" | grep -q "error"; then
        echo "   → API returned error"
    else
        echo "   → No tasks found or API not responding"
    fi
fi

echo ""

# Test 3: Check general tasks endpoint
echo "3. Testing all tasks endpoint..."
ALL_TASKS_RESPONSE=$(curl -s "$BASE_URL/api/notion/tasks")
echo "Response: $ALL_TASKS_RESPONSE"

if echo "$ALL_TASKS_RESPONSE" | grep -q "notionId"; then
    ALL_TASK_COUNT=$(echo "$ALL_TASKS_RESPONSE" | grep -o '"notionId"' | wc -l)
    echo "✅ All tasks test PASSED - Found $ALL_TASK_COUNT total tasks"
else
    echo "❌ All tasks test FAILED"
fi

echo ""
echo "🏁 Testing complete!"
echo ""
echo "If tests failed, check:"
echo "1. Environment variables are set in production deployment"
echo "2. Notion integration has access to your TABLEMAKER database"
echo "3. Database ID is correct in NOTION_PAGE_URL"
echo "4. Server logs for detailed error messages"