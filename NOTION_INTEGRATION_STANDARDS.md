# Notion Integration Standards & Best Practices

## Overview
This document establishes the naming conventions, patterns, and standards for integrating Notion databases with the Belle Journal application.

## Environment Variables

### Naming Convention
- Format: `NOTION_[FEATURE]_URL`
- Examples:
  - `NOTION_TASKS_URL` - URL to tasks database
  - `NOTION_TIMEBLOCKS_URL` - URL to time blocks database
  - `NOTION_INTEGRATION_SECRET` - Notion API integration token

### Setup Process
1. Create Notion integration at https://www.notion.so/my-integrations
2. Share target database with the integration
3. Copy database URL from Notion
4. Set environment variables in deployment

## Database Naming Conventions

### Notion Database Names
- Format: `PRODUCTIVITY[FEATURE]` (all caps, no spaces)
- Examples:
  - `PRODUCTIVITYTASKS` - Task management database
  - `PRODUCTIVITYTIMEBLOCKS` - Time blocking database

### Database ID Extraction
- Extract ID from URL: `https://notion.so/[DATABASE_ID]?v=...`
- Store in format: `NOTION_[FEATURE]_DATABASE_ID`

## API Route Structure

### Route Naming
- Primary routes: `/api/[feature]` (e.g., `/api/tasks`, `/api/time-blocks`)
- Notion-specific routes: `/api/notion/[feature]` (for debugging only)

### Implementation Pattern
```typescript
app.get("/api/[feature]/:date", async (req, res) => {
  try {
    // Check if Notion is configured
    if (!process.env.NOTION_[FEATURE]_URL) {
      // Fallback to local storage
      const items = await storage.get[Feature]sByDate(date);
      return res.json(items);
    }
    
    // Try Notion first
    try {
      const { getNotion[Feature]s } = await import('./notion');
      const notionItems = await getNotion[Feature]s(date);
      res.json(notionItems);
    } catch (notionError) {
      console.error("Notion error, falling back:", notionError);
      // Graceful fallback to local storage
      const items = await storage.get[Feature]sByDate(date);
      res.json(items);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch [feature]" });
  }
});
```

## Schema Mapping Standards

### Date/Time Handling
- **UI Format**: Separate date and time fields
  - Date: `YYYY-MM-DD` (string)
  - Time: `HH:MM` (string)
  
- **Notion Format**: Combined datetime properties
  - Property Type: `date`
  - Value: `YYYY-MM-DDTHH:mm:ss` (ISO datetime string)

### Conversion Functions
```typescript
// UI to Notion conversion
const startDateTime = `${date}T${startTime}:00`;
const endDateTime = `${date}T${endTime}:00`;

// Notion to UI conversion
const startDate = new Date(startDateTime);
const date = startDate.toISOString().split('T')[0];
const startTime = startDate.toTimeString().substring(0, 5);
```

### Property Name Standards
- **Title**: Use `Title` for main text field
- **Description**: Use `Description` for rich text content
- **Category**: Use `Category` for select dropdown
- **Dates**: Use descriptive names like `Start Time`, `End Time`
- **Status**: Use `Status` for workflow states
- **Priority**: Use `Priority` for importance levels

## Date Filtering Patterns

### Single Date Query
```typescript
filter: {
  property: "Start Time",
  date: {
    on_or_after: `${date}T00:00:00`,
    before: `${date}T23:59:59`
  }
}
```

### Date Range Query
```typescript
filter: {
  and: [
    {
      property: "Start Time",
      date: { on_or_after: startDate }
    },
    {
      property: "End Time", 
      date: { on_or_before: endDate }
    }
  ]
}
```

## Error Handling Standards

### Authentication Errors
```typescript
if (error.code === 'unauthorized') {
  throw new Error("Notion integration secret is invalid or expired");
}
```

### Permission Errors
```typescript
if (error.code === 'forbidden') {
  throw new Error("Notion integration doesn't have permission to access the database");
}
```

### Not Found Errors
```typescript
if (error.code === 'object_not_found') {
  throw new Error("Database not found. Please check your database ID");
}
```

## ID Management

### ID Types
- **Notion IDs**: String format (UUID-like)
- **Local Storage IDs**: Numeric format

### ID Detection
```typescript
// Detect ID type for update/delete operations
if (isNaN(Number(id))) {
  // Handle as Notion ID (string)
  await updateNotionRecord(id, updates);
} else {
  // Handle as local storage ID (number)
  await storage.updateRecord(Number(id), updates);
}
```

## Testing & Debugging

### Debug Endpoints
- `/api/notion/databases` - List all available databases
- `/api/notion/production-test` - Environment variable validation

### Logging Standards
- Use prefixes: `📅` for time blocks, `📋` for tasks
- Log key actions: creation, fetching, errors
- Include record counts and identifiers

### Testing Process
1. Test environment variable configuration
2. Test database permissions
3. Test CRUD operations
4. Test fallback mechanisms
5. Test UI integration

## Common Pitfalls & Solutions

### Duplicate Routes
**Problem**: Multiple routes with same endpoint cause conflicts
**Solution**: Remove duplicate routes, use enhanced version with Notion integration

### Schema Mismatches
**Problem**: UI expects text fields but Notion uses date properties
**Solution**: Use proper datetime conversion in schema mapping

### Date Filter Issues
**Problem**: Using `equals` with date-only strings on datetime properties
**Solution**: Use `on_or_after` and `before` with full datetime ranges

### Property Type Errors
**Problem**: "Property is not a property that exists" or type mismatch errors
**Solution**: Verify actual database schema, match property names and types exactly

## Future Integration Checklist

When adding new Notion integrations:

1. **Environment Setup**
   - [ ] Add `NOTION_[FEATURE]_URL` environment variable
   - [ ] Extract database ID properly
   - [ ] Test database permissions

2. **API Implementation** 
   - [ ] Create Notion helper functions in `server/notion.ts`
   - [ ] Implement API routes with fallback logic
   - [ ] Remove any duplicate simple routes

3. **Schema Mapping**
   - [ ] Map UI fields to Notion properties
   - [ ] Handle date/time conversions properly
   - [ ] Test create and retrieve operations

4. **Error Handling**
   - [ ] Implement graceful fallbacks
   - [ ] Add proper error messages
   - [ ] Test connection failures

5. **Frontend Integration**
   - [ ] Update React components to use new API
   - [ ] Test UI display with Notion data
   - [ ] Verify CRUD operations work

This standards document ensures consistent, reliable Notion integrations across all features.