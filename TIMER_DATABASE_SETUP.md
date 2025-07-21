# Timer Database Setup Instructions

## Required Properties for PRODUCTIVITYTIMERSESSIONS

To enable full Notion persistence for the focus timer, add these properties to your PRODUCTIVITYTIMERSESSIONS database:

### Essential Properties:
1. **Title** (Title field) - ✅ Already exists
2. **Started At** (Date field) - ✅ You added this
3. **Completed At** (Date field) - ✅ You added this

### Missing Properties to Add:
4. **Total Duration** (Number field) - Stores timer duration in seconds
5. **Remaining Time** (Number field) - Tracks countdown progress
6. **Is Active** (Checkbox field) - Shows if timer is currently running
7. **Is Paused** (Checkbox field) - Shows if timer is paused
8. **Mode** (Select field) - Timer type with options:
   - focus
   - pomodoro  
   - deepwork
   - flowstate

### Optional Properties:
9. **Current Session** (Number field) - For Pomodoro session tracking
10. **Total Sessions** (Number field) - For Pomodoro cycle management
11. **Category** (Select field) - Work, Personal, Health, Learning, Creative, General

## Steps to Add Properties:
1. Open your PRODUCTIVITYTIMERSESSIONS database in Notion
2. Click the "+" next to the last column to add new properties
3. Add each missing property with the correct type
4. For the Mode select field, add the four options listed above

Once these properties are added, the timer will automatically sync to Notion and persist across devices and browser sessions.