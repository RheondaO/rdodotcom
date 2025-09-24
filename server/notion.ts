import { Client } from "@notionhq/client";

// Use the new Replit Notion integration for authentication
let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=notion',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Notion not connected');
  }
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getUncachableNotionClient() {
  const accessToken = await getAccessToken();
  return new Client({ auth: accessToken });
}

// Legacy export for backward compatibility
export const notion = {
  databases: {
    query: async (params: any) => {
      const client = await getUncachableNotionClient();
      return client.databases.query(params);
    },
    retrieve: async (params: any) => {
      const client = await getUncachableNotionClient();
      return client.databases.retrieve(params);
    },
    create: async (params: any) => {
      const client = await getUncachableNotionClient();
      return client.databases.create(params);
    }
  },
  pages: {
    create: async (params: any) => {
      const client = await getUncachableNotionClient();
      return client.pages.create(params);
    },
    update: async (params: any) => {
      const client = await getUncachableNotionClient();
      return client.pages.update(params);
    },
    retrieve: async (params: any) => {
      const client = await getUncachableNotionClient();
      return client.pages.retrieve(params);
    }
  }
};

// Environment variable logging
console.log("📋 NOTION_TASKS_URL configured:", !!process.env.NOTION_TASKS_URL);
console.log("📅 NOTION_TIMEBLOCKS_URL configured:", !!process.env.NOTION_TIMEBLOCKS_URL);
console.log("🎯 NOTION_ACTIVEGOALS_URL configured:", !!process.env.NOTION_ACTIVEGOALS_URL);
console.log("🏋️ NOTION_TODAYSWORKOUT_URL configured:", !!process.env.NOTION_TODAYSWORKOUT_URL);
console.log("📊 NOTION_WORKOUTSTATS_URL configured:", !!process.env.NOTION_WORKOUTSTATS_URL);

if (process.env.NOTION_TASKS_URL) {
    console.log("📋 Tasks URL length:", process.env.NOTION_TASKS_URL.length);
}

if (process.env.NOTION_TIMEBLOCKS_URL) {
    console.log("📅 Time Blocks URL length:", process.env.NOTION_TIMEBLOCKS_URL.length);
}

if (process.env.NOTION_ACTIVEGOALS_URL) {
    console.log("🎯 Active Goals URL length:", process.env.NOTION_ACTIVEGOALS_URL.length);
}

if (process.env.NOTION_TODAYSWORKOUT_URL) {
    console.log("🏋️ Today's Workout URL length:", process.env.NOTION_TODAYSWORKOUT_URL.length);
}

if (process.env.NOTION_WORKOUTSTATS_URL) {
    console.log("📊 Workout Stats URL length:", process.env.NOTION_WORKOUTSTATS_URL.length);
}

// Extract the page ID from the Notion page URL
function extractPageIdFromUrl(pageUrl: string): string {
    const match = pageUrl.match(/([a-f0-9]{32})(?:[?#]|$)/i);
    if (match && match[1]) {
        return match[1];
    }

    throw Error("Failed to extract page ID");
}

// Extract database IDs with error handling
let NOTION_DATABASE_ID: string | null = null;
let NOTION_TIMEBLOCKS_DATABASE_ID: string | null = null;
let NOTION_ACTIVEGOALS_DATABASE_ID: string | null = null;

export let NOTION_TASKS_DATABASE_ID: string | null = null;
export let NOTION_TODAYSWORKOUT_DATABASE_ID: string | null = null;
export let NOTION_WORKOUTSTATS_DATABASE_ID: string | null = null;

try {
    NOTION_DATABASE_ID = process.env.NOTION_TASKS_URL ? extractPageIdFromUrl(process.env.NOTION_TASKS_URL) : null;
    NOTION_TASKS_DATABASE_ID = NOTION_DATABASE_ID; // Assign the same value for export
    console.log("📋 Tasks database ID extracted:", NOTION_DATABASE_ID ? `${NOTION_DATABASE_ID.substring(0, 8)}...` : "null");
} catch (error: any) {
    console.error("❌ Failed to extract Tasks database ID:", error.message);
    console.error("📋 Tasks URL:", process.env.NOTION_TASKS_URL);
}

try {
    NOTION_TIMEBLOCKS_DATABASE_ID = process.env.NOTION_TIMEBLOCKS_URL ? extractPageIdFromUrl(process.env.NOTION_TIMEBLOCKS_URL) : null;
    console.log("📅 Time Blocks database ID extracted:", NOTION_TIMEBLOCKS_DATABASE_ID ? `${NOTION_TIMEBLOCKS_DATABASE_ID.substring(0, 8)}...` : "null");
} catch (error: any) {
    console.error("❌ Failed to extract Time Blocks database ID:", error.message);
    console.error("📅 Time Blocks URL:", process.env.NOTION_TIMEBLOCKS_URL);
}

try {
    NOTION_ACTIVEGOALS_DATABASE_ID = process.env.NOTION_ACTIVEGOALS_URL ? extractPageIdFromUrl(process.env.NOTION_ACTIVEGOALS_URL) : null;
    console.log("🎯 Active Goals database ID extracted:", NOTION_ACTIVEGOALS_DATABASE_ID ? `${NOTION_ACTIVEGOALS_DATABASE_ID.substring(0, 8)}...` : "null");
} catch (error: any) {
    console.error("❌ Failed to extract Active Goals database ID:", error.message);
    console.error("🎯 Active Goals URL:", process.env.NOTION_ACTIVEGOALS_URL);
}

// Timer Sessions Database ID
export let NOTION_TIMERSESSIONS_DATABASE_ID: string | null = null;

try {
    NOTION_TIMERSESSIONS_DATABASE_ID = process.env.NOTION_TIMERSESSIONS_URL ? extractPageIdFromUrl(process.env.NOTION_TIMERSESSIONS_URL) : null;
    console.log("⏱️ Timer Sessions database ID extracted:", NOTION_TIMERSESSIONS_DATABASE_ID ? `${NOTION_TIMERSESSIONS_DATABASE_ID.substring(0, 8)}...` : "null");
} catch (error: any) {
    console.error("❌ Failed to extract Timer Sessions database ID:", error.message);
    console.error("⏱️ Timer Sessions URL:", process.env.NOTION_TIMERSESSIONS_URL);
}

try {
    NOTION_TODAYSWORKOUT_DATABASE_ID = process.env.NOTION_TODAYSWORKOUT_URL ? extractPageIdFromUrl(process.env.NOTION_TODAYSWORKOUT_URL) : null;
    console.log("🏋️ Today's Workout database ID extracted:", NOTION_TODAYSWORKOUT_DATABASE_ID ? `${NOTION_TODAYSWORKOUT_DATABASE_ID.substring(0, 8)}...` : "null");
} catch (error: any) {
    console.error("❌ Failed to extract Today's Workout database ID:", error.message);
    console.error("🏋️ Today's Workout URL:", process.env.NOTION_TODAYSWORKOUT_URL);
}

try {
    NOTION_WORKOUTSTATS_DATABASE_ID = process.env.NOTION_WORKOUTSTATS_URL ? extractPageIdFromUrl(process.env.NOTION_WORKOUTSTATS_URL) : null;
    console.log("📊 Workout Stats database ID extracted:", NOTION_WORKOUTSTATS_DATABASE_ID ? `${NOTION_WORKOUTSTATS_DATABASE_ID.substring(0, 8)}...` : "null");
} catch (error: any) {
    console.error("❌ Failed to extract Workout Stats database ID:", error.message);
    console.error("📊 Workout Stats URL:", process.env.NOTION_WORKOUTSTATS_URL);
}

export { NOTION_DATABASE_ID, NOTION_TIMEBLOCKS_DATABASE_ID };

// Log database configuration
console.log("📋 NOTION_TASKS_URL configured:", !!process.env.NOTION_TASKS_URL);
console.log("📅 NOTION_TIMEBLOCKS_URL configured:", !!process.env.NOTION_TIMEBLOCKS_URL);
console.log("⏱️ NOTION_TIMERSESSIONS_URL configured:", !!process.env.NOTION_TIMERSESSIONS_URL);
console.log("🏋️ NOTION_TODAYSWORKOUT_URL configured:", !!process.env.NOTION_TODAYSWORKOUT_URL);

if (process.env.NOTION_TASKS_URL) {
    console.log("📋 Tasks URL length:", process.env.NOTION_TASKS_URL.length);
}

if (process.env.NOTION_TIMEBLOCKS_URL) {
    console.log("📅 Time Blocks URL length:", process.env.NOTION_TIMEBLOCKS_URL.length);
}

if (process.env.NOTION_TIMERSESSIONS_URL) {
    console.log("⏱️ Timer Sessions URL length:", process.env.NOTION_TIMERSESSIONS_URL.length);
}

if (process.env.NOTION_TODAYSWORKOUT_URL) {
    console.log("🏋️ Today's Workout URL length:", process.env.NOTION_TODAYSWORKOUT_URL.length);
}

/**
 * Get the main database info
 * @returns {Promise<{id: string, title: string}>} - Database object with id and title
 */
export async function getNotionDatabase() {
    try {
        if (!NOTION_DATABASE_ID) {
            throw new Error("NOTION_DATABASE_ID is not configured");
        }
        
        console.log("🔍 Attempting to retrieve database with ID:", NOTION_DATABASE_ID);
        
        const database = await notion.databases.retrieve({
            database_id: NOTION_DATABASE_ID,
        });
        
        console.log("✅ Successfully retrieved database:", (database as any).title?.[0]?.plain_text || "Unknown");
        return database;
    } catch (error: any) {
        console.error("❌ Error retrieving database:", error.message);
        console.error("Database ID:", NOTION_DATABASE_ID);
        console.error("Error code:", error.code);
        console.error("Error status:", error.status);
        
        // Provide more specific error messages
        if (error.code === 'unauthorized') {
            throw new Error("Notion integration secret is invalid or expired. Please update your NOTION_INTEGRATION_SECRET.");
        } else if (error.code === 'object_not_found') {
            throw new Error("Database not found. Please check your NOTION_PAGE_URL points to the correct database.");
        } else if (error.code === 'forbidden') {
            throw new Error("Notion integration doesn't have permission to access this database. Please share the database with your integration.");
        } else {
            throw new Error(`Notion API error: ${error.message}`);
        }
    }
}

/**
 * Lists all databases available (for now, just the main one)
 * @returns {Promise<Array<{id: string, title: string}>>} - Array of database objects with id and title
 */
export async function getNotionDatabases() {
    try {
        const database = await getNotionDatabase();
        return [database];
    } catch (error) {
        console.error("Error listing databases:", error);
        throw error;
    }
}

// Find get a Notion database with the matching title
export async function findDatabaseByTitle(title: string) {
    try {
        console.log(`🔍 Searching for database with title: "${title}"`);
        
        const client = await getUncachableNotionClient();
        
        // Search for the database by querying all accessible databases
        const response = await client.search({
            query: title,
            filter: {
                property: 'object',
                value: 'database'
            }
        });

        console.log(`📊 Found ${response.results.length} database(s) matching search for "${title}"`);
        
        // Look for exact title match
        for (const result of response.results) {
            if (result.object === 'database') {
                const dbTitle = (result as any).title?.[0]?.plain_text || "";
                console.log(`🏷️ Database found: "${dbTitle}"`);
                
                if (dbTitle.toLowerCase() === title.toLowerCase()) {
                    console.log(`✅ Found exact match for database: "${title}"`);
                    return result;
                }
            }
        }
        
        console.log(`❌ No exact match found for database: "${title}"`);
        return null;
    } catch (error: any) {
        console.error(`❌ Error searching for database "${title}":`, error.message);
        return null;
    }
}

// Create a new database if one with a matching title does not exist
export async function createDatabaseIfNotExists(title: string, properties: any, parentPageId?: string) {
    const existingDb = await findDatabaseByTitle(title);
    if (existingDb) {
        return existingDb;
    }
    
    // Use provided parentPageId or default to NOTION_DATABASE_ID for existing functionality
    const pageId = parentPageId || NOTION_DATABASE_ID!;
    
    return await notion.databases.create({
        parent: {
            type: "page_id",
            page_id: pageId
        },
        title: [
            {
                type: "text",
                text: {
                    content: title
                }
            }
        ],
        properties
    });
}

// Get all entries from your TABLEMAKER database
export async function getNotionTasks(tasksDatabaseId: string = NOTION_DATABASE_ID || "") {
    try {
        if (!tasksDatabaseId) {
            throw new Error("Database ID is required");
        }
        
        const response = await notion.databases.query({
            database_id: tasksDatabaseId,
        });

        return response.results.map((page: any) => {
            const properties = page.properties;

            return {
                notionId: page.id,
                title: properties.Name?.title?.[0]?.plain_text || "Untitled Entry",
                description: properties.Description?.rich_text?.[0]?.plain_text || "",
                category: properties.Category?.select?.name || "Personal",
                section: properties.Section?.select?.name || properties.Category?.select?.name || "General",
                isCompleted: properties.Completed?.checkbox || false,
                dueDate: properties["Due DateTime"]?.date?.start ? new Date(properties["Due DateTime"].date.start) : null,
                createdDate: properties["Created DateTime"]?.created_time ? new Date(properties["Created DateTime"].created_time) : null,
                completedAt: properties["Completed At"]?.date?.start ? new Date(properties["Completed At"].date.start) : null,
                priority: properties.Priority?.select?.name || null,
                status: properties.Status?.select?.name || "To Do",
                estimatedDuration: properties["Estimated Duration"]?.number || null,
            };
        });
    } catch (error) {
        console.error("Error fetching entries from Notion:", error);
        throw new Error("Failed to fetch entries from Notion");
    }
}

// Find the PRODUCTIVITYTIMEBLOCKS database using dedicated database ID
export async function findTimeBlocksDatabase() {
    try {
        if (!NOTION_TIMEBLOCKS_DATABASE_ID) {
            throw new Error("NOTION_TIMEBLOCKS_DATABASE_ID is not configured");
        }
        
        console.log("📅 Retrieving Time Blocks database with ID:", NOTION_TIMEBLOCKS_DATABASE_ID);
        
        const database = await notion.databases.retrieve({
            database_id: NOTION_TIMEBLOCKS_DATABASE_ID,
        });
        
        console.log("📅 Found Time Blocks database:", (database as any).title?.[0]?.plain_text || "Unknown");
        return database;
    } catch (error: any) {
        console.error("Error finding Time Blocks database:", error.message);
        console.error("Database ID:", NOTION_TIMEBLOCKS_DATABASE_ID);
        console.error("Error code:", error.code);
        console.error("Error status:", error.status);
        
        // Provide more specific error messages
        if (error.code === 'unauthorized') {
            throw new Error("Notion integration secret is invalid or expired for Time Blocks database.");
        } else if (error.code === 'object_not_found') {
            throw new Error("Time Blocks database not found. Please check your NOTION_TIMEBLOCKS_DATABASE_ID.");
        } else if (error.code === 'forbidden') {
            throw new Error("Notion integration doesn't have permission to access the Time Blocks database. Please share the database with your integration.");
        } else {
            throw new Error(`Notion API error for Time Blocks: ${error.message}`);
        }
    }
}

// Get all time blocks from the PRODUCTIVITYTIMEBLOCKS database
export async function getNotionTimeBlocks(date?: string) {
    try {
        const database = await findTimeBlocksDatabase();
        
        console.log("📅 Fetching time blocks from Notion database");
        
        const response = await notion.databases.query({
            database_id: database.id,
            filter: date ? {
                property: "Start Time",
                date: {
                    on_or_after: `${date}T00:00:00`,
                    before: `${date}T23:59:59`
                }
            } : undefined
        });

        const timeBlocks = response.results.map((page: any) => {
            const properties = page.properties;
            
            // Extract date and time from datetime fields
            const startDateTime = properties["Start Time"]?.date?.start || "";
            const endDateTime = properties["End Time"]?.date?.start || "";
            
            // Parse datetime to separate date and time, preserving user's local timezone
            let date = "", startTime = "", endTime = "";
            if (startDateTime) {
                // Convert UTC datetime back to Eastern Time for display
                const startDate = new Date(startDateTime);
                date = startDate.toISOString().split('T')[0];
                // Convert from UTC to Eastern Time (EDT is UTC-4)
                startTime = startDate.toLocaleTimeString('en-US', {
                    timeZone: 'America/New_York',
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit'
                });
                // Remove debug logging for production
            }
            if (endDateTime) {
                const endDate = new Date(endDateTime);
                // Convert from UTC to Eastern Time (EDT is UTC-4)
                endTime = endDate.toLocaleTimeString('en-US', {
                    timeZone: 'America/New_York',
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }

            // Get duration from Notion or calculate if not stored
            let duration = properties.Duration?.number || 0;
            if (!duration && startTime && endTime) {
                const start = new Date(`2000-01-01T${startTime}`);
                const end = new Date(`2000-01-01T${endTime}`);
                duration = Math.abs(end.getTime() - start.getTime()) / (1000 * 60);
            }

            return {
                notionId: page.id,
                title: properties.Title?.title?.[0]?.plain_text || "Untitled Time Block",
                description: properties.Description?.rich_text?.[0]?.plain_text || "",
                date: date,
                startTime: startTime,
                endTime: endTime,
                category: properties.Category?.select?.name || "Work",
                duration: duration,
                createdAt: properties["Created At"]?.created_time ? new Date(properties["Created At"].created_time) : new Date(),
            };
        });

        console.log(`📅 Retrieved ${timeBlocks.length} time blocks from Notion`);
        if (date) {
            console.log(`📅 Filtered for date: ${date}`);
        }
        
        return timeBlocks;
    } catch (error) {
        console.error("Error fetching time blocks from Notion:", error);
        throw new Error("Failed to fetch time blocks from Notion");
    }
}

// Create a new time block in the PRODUCTIVITYTIMEBLOCKS database
export async function createNotionTimeBlock(timeBlockData: {
    title: string;
    description?: string;
    date: string;
    startTime: string;
    endTime: string;
    category?: string;
}) {
    try {
        const database = await findTimeBlocksDatabase();
        
        console.log("📅 Creating time block in Notion:", timeBlockData.title);
        console.log("📅 Input data:", { date: timeBlockData.date, startTime: timeBlockData.startTime, endTime: timeBlockData.endTime });
        
        // Convert separate date and time to datetime strings for Notion
        // Assume user input is in Eastern Time (UTC-4 in summer, UTC-5 in winter)
        // For now, use EDT (UTC-4) - this should be configurable in a real app
        const timeZoneOffset = '-04:00'; // EDT offset
        
        const startDateTime = `${timeBlockData.date}T${timeBlockData.startTime}:00${timeZoneOffset}`;
        const endDateTime = `${timeBlockData.date}T${timeBlockData.endTime}:00${timeZoneOffset}`;
        
        // Calculate duration in minutes using the time strings directly
        const start = new Date(`2000-01-01T${timeBlockData.startTime}`);
        const end = new Date(`2000-01-01T${timeBlockData.endTime}`);
        const durationMinutes = Math.abs(end.getTime() - start.getTime()) / (1000 * 60);
        
        console.log("📅 Converted to datetime:", { 
            startDateTime, 
            endDateTime, 
            durationMinutes,
            timeZoneOffset,
            originalStartTime: timeBlockData.startTime,
            originalEndTime: timeBlockData.endTime
        });
        
        const response = await notion.pages.create({
            parent: {
                database_id: database.id
            },
            properties: {
                Title: {
                    title: [
                        {
                            text: {
                                content: timeBlockData.title
                            }
                        }
                    ]
                },
                Description: {
                    rich_text: [
                        {
                            text: {
                                content: timeBlockData.description || ""
                            }
                        }
                    ]
                },
                "Start Time": {
                    date: {
                        start: startDateTime
                    }
                },
                "End Time": {
                    date: {
                        start: endDateTime
                    }
                },
                Category: {
                    select: {
                        name: timeBlockData.category || "Work"
                    }
                },
                Duration: {
                    number: durationMinutes
                }
            }
        });

        console.log("✅ Successfully created time block in Notion");
        return {
            notionId: response.id,
            title: timeBlockData.title,
            description: timeBlockData.description || "",
            date: timeBlockData.date,
            startTime: timeBlockData.startTime,
            endTime: timeBlockData.endTime,
            category: timeBlockData.category || "Work",
            duration: durationMinutes,
            createdAt: new Date()
        };
    } catch (error) {
        console.error("Error creating time block in Notion:", error);
        throw new Error("Failed to create time block in Notion");
    }
}

// Update a time block in the PRODUCTIVITYTIMEBLOCKS database
export async function updateNotionTimeBlock(notionId: string, updates: {
    title?: string;
    description?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    category?: string;
}) {
    try {
        console.log("📅 Updating time block in Notion:", notionId);
        
        const properties: any = {};
        
        if (updates.title !== undefined) {
            properties.Title = {
                title: [{ text: { content: updates.title } }]
            };
        }
        
        if (updates.description !== undefined) {
            properties.Description = {
                rich_text: [{ text: { content: updates.description } }]
            };
        }
        
        if (updates.date !== undefined) {
            properties.Date = {
                date: { start: updates.date }
            };
        }
        
        if (updates.startTime !== undefined) {
            properties["Start Time"] = {
                rich_text: [{ text: { content: updates.startTime } }]
            };
        }
        
        if (updates.endTime !== undefined) {
            properties["End Time"] = {
                rich_text: [{ text: { content: updates.endTime } }]
            };
        }
        
        if (updates.category !== undefined) {
            properties.Category = {
                select: { name: updates.category }
            };
        }

        await notion.pages.update({
            page_id: notionId,
            properties
        });

        console.log("✅ Successfully updated time block in Notion");
        return true;
    } catch (error) {
        console.error("Error updating time block in Notion:", error);
        throw new Error("Failed to update time block in Notion");
    }
}

// Delete a time block from the PRODUCTIVITYTIMEBLOCKS database
export async function deleteNotionTimeBlock(notionId: string) {
    try {
        console.log("📅 Deleting time block from Notion:", notionId);
        
        await notion.pages.update({
            page_id: notionId,
            archived: true
        });

        console.log("✅ Successfully deleted time block from Notion");
        return true;
    } catch (error) {
        console.error("Error deleting time block from Notion:", error);
        throw new Error("Failed to delete time block from Notion");
    }
}

// =============================================================================
// TODAY'S WORKOUTS FUNCTIONS
// =============================================================================

// Find the TODAYSWORKOUT database using dedicated database ID
export async function findTodaysWorkoutDatabase() {
    try {
        if (!NOTION_TODAYSWORKOUT_DATABASE_ID) {
            throw new Error("NOTION_TODAYSWORKOUT_DATABASE_ID is not configured");
        }
        
        console.log("🏋️ Retrieving Today's Workout database with ID:", NOTION_TODAYSWORKOUT_DATABASE_ID);
        
        const database = await notion.databases.retrieve({
            database_id: NOTION_TODAYSWORKOUT_DATABASE_ID,
        });
        
        console.log("🏋️ Found Today's Workout database:", (database as any).title?.[0]?.plain_text || "Unknown");
        return database;
    } catch (error: any) {
        console.error("Error finding Today's Workout database:", error.message);
        console.error("Database ID:", NOTION_TODAYSWORKOUT_DATABASE_ID);
        console.error("Error code:", error.code);
        console.error("Error status:", error.status);
        
        // Provide more specific error messages
        if (error.code === 'unauthorized') {
            throw new Error("Notion integration secret is invalid or expired. Please update your NOTION_INTEGRATION_SECRET.");
        } else if (error.code === 'object_not_found') {
            throw new Error("Today's Workout database not found. Please check your NOTION_TODAYSWORKOUT_URL points to the correct database.");
        } else if (error.code === 'forbidden') {
            throw new Error("Notion integration doesn't have permission to access the Today's Workout database. Please share the database with your integration.");
        } else {
            throw new Error(`Notion API error: ${error.message}`);
        }
    }
}

// Get today's workouts from the TODAYSWORKOUT database
export async function getTodaysWorkouts(date: string) {
    try {
        const database = await findTodaysWorkoutDatabase();
        
        console.log("🏋️ Successfully connected to Today's Workout database!");
        console.log("🏋️ Database title:", (database as any).title?.[0]?.plain_text || "Unknown");
        console.log("🏋️ Fetching ALL workouts first to test connection...");
        
        // First try to get ALL records to test connection
        const response = await notion.databases.query({
            database_id: database.id,
            page_size: 10 // Limit to 10 records for testing
        });
        
        console.log(`🏋️ Raw response: Found ${response.results.length} total records in database`);
        
        // If we have records, let's see what they look like
        if (response.results.length > 0) {
            const firstRecord = response.results[0] as any;
            console.log("🏋️ First record properties:", Object.keys(firstRecord.properties));
            
            // Check if Dates field exists
            if (firstRecord.properties.Dates) {
                console.log("🏋️ ✅ 'Dates' field found!");
                console.log("🏋️ 'Dates' field type:", firstRecord.properties.Dates.type);
                console.log("🏋️ 'Dates' field value:", firstRecord.properties.Dates);
            } else {
                console.log("🏋️ ❌ 'Dates' field NOT found. Available fields:", Object.keys(firstRecord.properties));
            }
            
            // Check if Exercises field exists  
            if (firstRecord.properties.Exercises) {
                console.log("🏋️ ✅ 'Exercises' field found!");
                console.log("🏋️ 'Exercises' field type:", firstRecord.properties.Exercises.type);
            } else {
                console.log("🏋️ ❌ 'Exercises' field NOT found. Available fields:", Object.keys(firstRecord.properties));
            }
        }
        
        // Now try date filtering if we got this far
        console.log(`🏋️ Now attempting date filtering for: ${date}`);
        const filteredResponse = await notion.databases.query({
            database_id: database.id,
            filter: {
                property: "Dates",
                date: {
                    equals: date
                }
            }
        });

        console.log(`🏋️ Date filtering result: Found ${filteredResponse.results.length} records for ${date}`);
        
        const workouts = filteredResponse.results.map((page: any) => {
            const properties = page.properties;
            
            // Extract exercises as raw text - preserve original formatting
            let exercises = "";
            
            if (properties.Exercises) {
                if (properties.Exercises.rich_text && Array.isArray(properties.Exercises.rich_text)) {
                    // Handle rich_text format - return raw text with formatting preserved
                    exercises = properties.Exercises.rich_text
                        .map((item: any) => item.plain_text || "")
                        .join("")
                        .trim();
                } else if (properties.Exercises.title && Array.isArray(properties.Exercises.title)) {
                    // Handle title format - return raw text
                    exercises = properties.Exercises.title
                        .map((item: any) => item.plain_text || "")
                        .join("")
                        .trim();
                } else if (properties.Exercises.multi_select && Array.isArray(properties.Exercises.multi_select)) {
                    // Handle multi_select format - join as single string
                    exercises = properties.Exercises.multi_select
                        .map((item: any) => item.name || "")
                        .filter((name: string) => name.length > 0)
                        .join("\n");
                }
            }
            
            // Extract notes if available
            let notes = "";
            if (properties.Notes?.rich_text && Array.isArray(properties.Notes.rich_text)) {
                notes = properties.Notes.rich_text
                    .map((item: any) => item.plain_text || "")
                    .join("")
                    .trim();
            }

            // Extract the actual date from the Notion record
            let recordDate = date; // fallback to query date
            if (properties.Dates?.date?.start) {
                recordDate = properties.Dates.date.start;
            }

            return {
                id: page.id,
                date: recordDate,
                exercises: exercises || "", // Raw text from Notion
                notes: notes || undefined
            };
        });

        console.log(`🏋️ Retrieved ${workouts.length} workouts from Notion for ${date}`);
        
        return workouts;
    } catch (error) {
        console.error("Error fetching today's workouts from Notion:", error);
        // Return empty array instead of throwing error to match requirement
        return [];
    }
}

// =============================================================================
// TASKS FUNCTIONS
// =============================================================================

// Create a new entry in your TABLEMAKER database
export async function createNotionTask(tasksDatabaseId: string = NOTION_DATABASE_ID || "", task: {
    title: string;
    description?: string;
    category?: string;
    section?: string;
    priority?: string;
    dueDate?: Date;
    estimatedDuration?: number;
    status?: string;
}) {
    try {
        console.log("📋 createNotionTask called with:");
        console.log("  Database ID:", tasksDatabaseId);
        console.log("  Task data:", JSON.stringify(task, null, 2));
        
        if (!tasksDatabaseId) {
            throw new Error("Database ID is required but was null or undefined");
        }
        
        const properties: any = {
            Name: {
                title: [
                    {
                        text: {
                            content: task.title
                        }
                    }
                ]
            }
        };

        if (task.description) {
            properties.Description = {
                rich_text: [
                    {
                        text: {
                            content: task.description
                        }
                    }
                ]
            };
        }

        if (task.category) {
            properties.Category = {
                select: {
                    name: task.category
                }
            };
        }

        if (task.priority) {
            properties.Priority = {
                select: {
                    name: task.priority
                }
            };
        }

        if (task.status) {
            properties.Status = {
                select: {
                    name: task.status
                }
            };
        }

        if (task.estimatedDuration) {
            properties["Estimated Duration"] = {
                number: task.estimatedDuration
            };
        }

        if (task.dueDate) {
            // Handle both Date objects and ISO strings
            const dueDateStr = task.dueDate instanceof Date 
                ? task.dueDate.toISOString().split('T')[0]
                : new Date(task.dueDate).toISOString().split('T')[0];
            
            properties["Due DateTime"] = {
                date: {
                    start: dueDateStr
                }
            };
        }

        properties.Completed = {
            checkbox: task.status === "Done"
        };

        console.log("📋 Creating Notion page with properties:", JSON.stringify(properties, null, 2));
        
        const response = await notion.pages.create({
            parent: {
                database_id: tasksDatabaseId
            },
            properties
        });

        console.log("📋 Successfully created Notion page with ID:", response.id);
        return response;
    } catch (error: any) {
        console.error("❌ Error creating entry in Notion:", error.message);
        console.error("❌ Error code:", error.code);
        console.error("❌ Error status:", error.status);
        console.error("❌ Database ID used:", tasksDatabaseId);
        throw new Error(`Failed to create entry in Notion: ${error.message} (code: ${error.code})`);
    }
}

// Update an entry in your TABLEMAKER database
export async function updateNotionTask(pageId: string, updates: {
    title?: string;
    description?: string;
    category?: string;
    section?: string;
    priority?: string;
    isCompleted?: boolean;
    status?: string;
    dueDate?: Date;
    estimatedDuration?: number;
}) {
    try {
        const properties: any = {};

        if (updates.title) {
            properties.Name = {
                title: [
                    {
                        text: {
                            content: updates.title
                        }
                    }
                ]
            };
        }

        if (updates.description !== undefined) {
            properties.Description = {
                rich_text: updates.description ? [
                    {
                        text: {
                            content: updates.description
                        }
                    }
                ] : []
            };
        }

        if (updates.category) {
            properties.Category = {
                select: {
                    name: updates.category
                }
            };
        }

        if (updates.priority) {
            properties.Priority = {
                select: {
                    name: updates.priority
                }
            };
        }

        if (updates.status) {
            properties.Status = {
                select: {
                    name: updates.status
                }
            };
        }

        if (updates.estimatedDuration !== undefined) {
            properties["Estimated Duration"] = {
                number: updates.estimatedDuration
            };
        }

        if (updates.dueDate) {
            properties["Due DateTime"] = {
                date: {
                    start: updates.dueDate.toISOString().split('T')[0]
                }
            };
        }

        if (updates.isCompleted !== undefined) {
            properties.Completed = {
                checkbox: updates.isCompleted
            };
            
            if (updates.isCompleted) {
                properties["Completed At"] = {
                    date: {
                        start: new Date().toISOString().split('T')[0]
                    }
                };
            }
        }

        const response = await notion.pages.update({
            page_id: pageId,
            properties
        });

        return response;
    } catch (error) {
        console.error("Error updating entry in Notion:", error);
        throw new Error("Failed to update entry in Notion");
    }
}

// Delete an entry from Notion (archive it)
export async function deleteNotionTask(pageId: string) {
    try {
        const response = await notion.pages.update({
            page_id: pageId,
            archived: true
        });

        return response;
    } catch (error) {
        console.error("Error deleting entry from Notion:", error);
        throw new Error("Failed to delete entry from Notion");
    }
}

// Timer Sessions Database Integration
export async function getActiveNotionTimerSession(userId: string = "admin") {
    try {
        if (!NOTION_TIMERSESSIONS_DATABASE_ID) {
            return null;
        }

        const response = await notion.databases.query({
            database_id: NOTION_TIMERSESSIONS_DATABASE_ID,
            filter: {
                property: "Is Active",
                checkbox: {
                    equals: true
                }
            },
            sorts: [
                {
                    property: "Started At",
                    direction: "descending"
                }
            ],
            page_size: 1
        });

        if (response.results.length === 0) {
            return null;
        }

        const page = response.results[0] as any;
        const properties = page.properties;

        return {
            id: page.id,
            notionId: page.id,
            mode: properties.Mode?.select?.name || "focus",
            title: properties.Title?.title?.[0]?.plain_text || "Untitled Session",
            category: properties.Category?.select?.name || "General",
            totalDuration: properties["Total Duration"]?.number || 0,
            remainingTime: properties["Remaining Time"]?.number || 0,
            currentSession: properties["Current Session"]?.number || 1,
            totalSessions: properties["Total Sessions"]?.number || 1,
            isBreak: properties["Is Break"]?.checkbox || false,
            isActive: properties["Is Active"]?.checkbox || false,
            isPaused: properties["Is Paused"]?.checkbox || false,
            startedAt: properties["Started At"]?.date?.start || new Date().toISOString(),
            pausedAt: properties["Paused At"]?.date?.start || null,
            lastSync: properties["Last Sync"]?.date?.start || new Date().toISOString(),
            totalFocusTime: properties["Total Focus Time"]?.number || 0,
            completedSessions: properties["Completed Sessions"]?.number || 0,
            createdAt: properties["Created At"]?.date?.start || new Date().toISOString(),
            updatedAt: properties["Updated At"]?.date?.start || new Date().toISOString(),
            userId: properties["User ID"]?.rich_text?.[0]?.plain_text || userId
        };
    } catch (error: any) {
        console.error("❌ Error getting active timer session from Notion:", error.message);
        return null;
    }
}

export async function createNotionTimerSession(session: {
    userId: string;
    mode: string;
    title?: string;
    category?: string;
    totalDuration: number;
    remainingTime: number;
    currentSession: number;
    totalSessions: number;
    isBreak: boolean;
    isActive: boolean;
    isPaused: boolean;
    totalFocusTime: number;
    completedSessions: number;
}) {
    try {
        if (!NOTION_TIMERSESSIONS_DATABASE_ID) {
            throw new Error("Timer Sessions database not configured");
        }

        console.log("⏱️ Creating timer session in Notion:", session.title);

        const properties: any = {
            "Title": {
                title: [
                    {
                        text: {
                            content: session.title || `${session.mode} Session`
                        }
                    }
                ]
            },
            "Mode": {
                select: {
                    name: session.mode
                }
            },
            "Category": {
                select: {
                    name: session.category || "general"
                }
            },
            "Total Duration": {
                number: session.totalDuration
            },
            "Remaining Time": {
                number: session.remainingTime
            },
            "Current Session": {
                number: session.currentSession
            },
            "Total Sessions": {
                number: session.totalSessions
            },
            "Completed Sessions": {
                number: session.completedSessions
            },
            "Is Break": {
                checkbox: session.isBreak
            },
            "Is Active": {
                checkbox: session.isActive
            },

            "Total Focus Time": {
                number: session.totalFocusTime
            },
            "Started At": {
                date: {
                    start: new Date().toISOString()
                }
            },
            "Last Sync": {
                date: {
                    start: new Date().toISOString()
                }
            }
        };

        const response = await notion.pages.create({
            parent: {
                database_id: NOTION_TIMERSESSIONS_DATABASE_ID
            },
            properties
        });

        console.log("⏱️ Successfully created timer session in Notion:", response.id);
        return response;
    } catch (error: any) {
        console.error("❌ Error creating timer session in Notion:", error.message);
        throw new Error(`Failed to create timer session in Notion: ${error.message}`);
    }
}

export async function updateNotionTimerSession(pageId: string, updates: {
    remainingTime?: number;
    isActive?: boolean;
    isPaused?: boolean;
    pausedAt?: Date | null;
    totalFocusTime?: number;
    completedSessions?: number;
    currentSession?: number;
}) {
    try {
        if (!NOTION_TIMERSESSIONS_DATABASE_ID) {
            throw new Error("Timer Sessions database not configured");
        }

        console.log("⏱️ Updating timer session in Notion:", pageId);

        const properties: any = {
            "Last Sync": {
                date: {
                    start: new Date().toISOString()
                }
            }
        };

        if (updates.remainingTime !== undefined) {
            properties["Remaining Time"] = {
                number: updates.remainingTime
            };
        }

        if (updates.isActive !== undefined) {
            properties["Is Active"] = {
                checkbox: updates.isActive
            };
        }

        if (updates.isPaused !== undefined) {
            properties["Is Paused"] = {
                checkbox: updates.isPaused
            };
        }

        if (updates.pausedAt !== undefined) {
            if (updates.pausedAt) {
                properties["Paused At"] = {
                    date: {
                        start: updates.pausedAt.toISOString()
                    }
                };
            } else {
                properties["Paused At"] = {
                    date: null
                };
            }
        }

        if (updates.totalFocusTime !== undefined) {
            properties["Total Focus Time"] = {
                number: updates.totalFocusTime
            };
        }

        if (updates.completedSessions !== undefined) {
            properties["Completed Sessions"] = {
                number: updates.completedSessions
            };
        }

        if (updates.currentSession !== undefined) {
            properties["Current Session"] = {
                number: updates.currentSession
            };
        }

        const response = await notion.pages.update({
            page_id: pageId,
            properties
        });

        console.log("⏱️ Successfully updated timer session in Notion");
        return response;
    } catch (error: any) {
        console.error("❌ Error updating timer session in Notion:", error.message);
        throw new Error(`Failed to update timer session in Notion: ${error.message}`);
    }
}

// Store completed timer session in Notion for AI analytics
export async function storeCompletedTimerSession(sessionData: {
    title: string;
    mode: string;
    duration: number; // in seconds
    tasksCompleted: string[];
    habitsCompleted: string[];
    sessionContext: string;
    startedAt: Date;
    completedAt: Date;
}) {
    try {
        if (!NOTION_TIMERSESSIONS_DATABASE_ID) {
            console.log("⚠️ No Notion Timer Sessions database configured - skipping analytics storage");
            return null;
        }

        // Generate intelligent session title based on context
        const intelligentTitle = generateSessionTitle(sessionData);
        
        // Calculate productivity metrics
        const productivityScore = calculateProductivityScore(sessionData);
        
        console.log("📊 Storing completed timer session in Notion for AI analytics:", intelligentTitle);

        const notionPage = await notion.pages.create({
            parent: {
                database_id: NOTION_TIMERSESSIONS_DATABASE_ID,
            },
            properties: {
                "Title": {
                    title: [{
                        text: { content: intelligentTitle }
                    }]
                },
                "Mode": {
                    select: { name: sessionData.mode }
                },
                "Total Duration": {
                    number: Math.round(sessionData.duration / 60) // Convert to minutes
                },
                "Tasks Completed": {
                    number: sessionData.tasksCompleted.length
                },
                "Habits Completed": {
                    number: sessionData.habitsCompleted.length
                },
                "Session Context": {
                    rich_text: [{
                        text: { content: sessionData.sessionContext || "General focus session" }
                    }]
                },
                "Productivity Score": {
                    number: productivityScore
                },
                "Started At": {
                    date: { start: sessionData.startedAt.toISOString() }
                },
                "Completed At": {
                    date: { start: sessionData.completedAt.toISOString() }
                },
                "Is Active": {
                    checkbox: false // Always false for completed sessions
                },
                "Category": {
                    select: { name: inferCategoryFromContext(sessionData) }
                }
            }
        });

        console.log("✅ Timer session stored in Notion for AI analytics:", notionPage.id);
        return notionPage.id;
    } catch (error) {
        console.error("❌ Failed to store timer session in Notion:", error);
        return null;
    }
}

// Generate intelligent session titles based on completed tasks/habits
function generateSessionTitle(sessionData: any): string {
    const { mode, tasksCompleted, habitsCompleted, duration } = sessionData;
    const durationMins = Math.round(duration / 60);
    
    // If tasks or habits were completed, use them for context
    if (tasksCompleted.length > 0) {
        const taskContext = tasksCompleted.length === 1 
            ? `${tasksCompleted[0]} Task`
            : `${tasksCompleted.length} Tasks`;
        return `${mode} Session: ${taskContext} (${durationMins}min)`;
    }
    
    if (habitsCompleted.length > 0) {
        const habitContext = habitsCompleted.length === 1
            ? `${habitsCompleted[0]} Habit`
            : `${habitsCompleted.length} Habits`;
        return `${mode} Session: ${habitContext} (${durationMins}min)`;
    }
    
    // Default naming based on mode and duration
    const modeLabels = {
        focus: "Focus Session",
        pomodoro: "Pomodoro Session", 
        deepwork: "Deep Work Session",
        flowstate: "Flow State Session"
    };
    
    return `${modeLabels[mode as keyof typeof modeLabels] || "Focus Session"} (${durationMins}min)`;
}

// Calculate productivity score for AI insights
function calculateProductivityScore(sessionData: any): number {
    const { duration, tasksCompleted, habitsCompleted, mode } = sessionData;
    const durationMins = duration / 60;
    
    let score = 0;
    
    // Base score from duration (longer sessions = higher base score)
    if (durationMins >= 90) score += 40; // Deep work territory
    else if (durationMins >= 60) score += 30; 
    else if (durationMins >= 25) score += 20; // Pomodoro territory
    else score += 10;
    
    // Bonus points for task completion
    score += tasksCompleted.length * 15;
    
    // Bonus points for habit completion  
    score += habitsCompleted.length * 10;
    
    // Mode multipliers
    const modeMultipliers = {
        flowstate: 1.2, // Flow state sessions get highest multiplier
        deepwork: 1.1,
        focus: 1.0,
        pomodoro: 0.9
    };
    
    score *= modeMultipliers[mode as keyof typeof modeMultipliers] || 1.0;
    
    return Math.min(Math.round(score), 100); // Cap at 100
}

// Infer category from session context
function inferCategoryFromContext(sessionData: any): string {
    const { tasksCompleted, habitsCompleted, mode } = sessionData;
    
    // Analyze task titles for keywords
    const allText = [...tasksCompleted, ...habitsCompleted].join(' ').toLowerCase();
    
    if (allText.includes('workout') || allText.includes('exercise') || allText.includes('fitness')) return 'Health';
    if (allText.includes('code') || allText.includes('dev') || allText.includes('program')) return 'Development';
    if (allText.includes('write') || allText.includes('blog') || allText.includes('content')) return 'Creative';
    if (allText.includes('learn') || allText.includes('study') || allText.includes('research')) return 'Learning';
    if (allText.includes('meeting') || allText.includes('call') || allText.includes('business')) return 'Work';
    
    // Default categories by mode
    const modeCategories = {
        deepwork: 'Work',
        flowstate: 'Creative', 
        pomodoro: 'Productivity',
        focus: 'General'
    };
    
    return modeCategories[mode as keyof typeof modeCategories] || 'General';
}

// Cache for getNotionActiveGoals to improve performance
let notionGoalsCache: { data: any[]; timestamp: number } | null = null;
const NOTION_GOALS_CACHE_DURATION = 30000; // 30 seconds

// ACTIVEGOALS Database Functions
// Get all goals from the ACTIVEGOALS database with caching optimization
export async function getNotionActiveGoals() {
    const startTime = Date.now();
    
    try {
        if (!NOTION_ACTIVEGOALS_DATABASE_ID) {
            throw new Error("NOTION_ACTIVEGOALS_DATABASE_ID is not configured");
        }
        
        // Check internal cache first for even faster response
        if (notionGoalsCache && Date.now() - notionGoalsCache.timestamp < NOTION_GOALS_CACHE_DURATION) {
            const responseTime = Date.now() - startTime;
            console.log(`🎯 ⚡ NOTION CACHE HIT: Returning ${notionGoalsCache.data.length} cached goals in ${responseTime}ms`);
            return notionGoalsCache.data;
        }
        
        console.log("🎯 Notion cache miss, fetching from database:", NOTION_ACTIVEGOALS_DATABASE_ID);
        
        const response = await notion.databases.query({
            database_id: NOTION_ACTIVEGOALS_DATABASE_ID,
            // Add optimization for empty databases - limit initial query
            page_size: 100 // Reasonable limit for goals
        });

        // Early return optimization for empty lists
        if (!response.results || response.results.length === 0) {
            const responseTime = Date.now() - startTime;
            console.log(`🎯 ⚡ EMPTY LIST: No goals found in ${responseTime}ms`);
            // Cache empty result
            notionGoalsCache = { data: [], timestamp: Date.now() };
            return [];
        }

        const goals = response.results.map((page: any) => {
            const properties = page.properties;
            
            // Try different possible title field names
            let title = "Untitled Goal";
            const possibleTitleFields = ["title", "Name", "Title", "Goal", "Goal Name", "Task Name"];
            
            for (const fieldName of possibleTitleFields) {
                if (properties[fieldName]?.title?.[0]?.plain_text) {
                    title = properties[fieldName].title[0].plain_text;
                    break;
                }
            }
            
            // Map Notion properties to our Goal interface
            return {
                notionId: page.id,
                title: title,
                description: properties.description?.rich_text?.[0]?.plain_text || "",
                category: properties.category?.multi_select?.[0]?.name || "personal",
                targetValue: properties.targetValue?.number?.toString() || "0",
                currentValue: properties.currentValue?.number?.toString() || "0",
                unit: properties.unit?.rich_text?.[0]?.plain_text || "",
                targetDate: properties.targetDate?.date?.start || "",
                isCompleted: properties.isCompleted?.checkbox || false,
                createdAt: properties["Created Time"]?.created_time ? new Date(properties["Created Time"].created_time) : new Date(),
            };
        });

        const responseTime = Date.now() - startTime;
        console.log(`🎯 Retrieved ${goals.length} goals from Notion ACTIVEGOALS in ${responseTime}ms`);
        
        // Cache the result
        notionGoalsCache = { data: goals, timestamp: Date.now() };
        console.log(`🎯 💾 Cached ${goals.length} goals in Notion function for ${NOTION_GOALS_CACHE_DURATION/1000}s`);
        
        return goals;
    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error(`Error fetching goals from Notion ACTIVEGOALS after ${responseTime}ms:`, error);
        throw new Error("Failed to fetch goals from Notion ACTIVEGOALS");
    }
}

// Function to invalidate the Notion goals cache (call after write operations)
export function invalidateNotionGoalsCache() {
    notionGoalsCache = null;
    console.log("🎯 🗑️ Notion goals cache invalidated");
}

// Create a new goal in the ACTIVEGOALS database
export async function createNotionActiveGoal(goalData: {
    title: string;
    description?: string;
    category: string;
    targetValue: string;
    currentValue?: string;
    unit?: string;
    targetDate?: string;
    isCompleted?: boolean;
}) {
    try {
        if (!NOTION_ACTIVEGOALS_DATABASE_ID) {
            throw new Error("NOTION_ACTIVEGOALS_DATABASE_ID is not configured");
        }
        
        console.log("🎯 Creating goal in Notion ACTIVEGOALS:", goalData.title);
        
        const properties: any = {
            Name: {
                title: [
                    {
                        text: {
                            content: goalData.title
                        }
                    }
                ]
            }
        };

        if (goalData.description) {
            properties.Description = {
                rich_text: [
                    {
                        text: {
                            content: goalData.description
                        }
                    }
                ]
            };
        }

        if (goalData.category) {
            properties.Category = {
                select: {
                    name: goalData.category
                }
            };
        }

        if (goalData.targetValue) {
            properties["Target Value"] = {
                number: parseFloat(goalData.targetValue)
            };
        }

        if (goalData.currentValue) {
            properties["Current Value"] = {
                number: parseFloat(goalData.currentValue)
            };
        }

        if (goalData.unit) {
            properties.Unit = {
                rich_text: [
                    {
                        text: {
                            content: goalData.unit
                        }
                    }
                ]
            };
        }

        if (goalData.targetDate) {
            properties["Target Date"] = {
                date: {
                    start: goalData.targetDate
                }
            };
        }

        if (goalData.isCompleted !== undefined) {
            properties.Completed = {
                checkbox: goalData.isCompleted
            };
        }

        const response = await notion.pages.create({
            parent: {
                database_id: NOTION_ACTIVEGOALS_DATABASE_ID
            },
            properties
        });

        console.log("✅ Successfully created goal in Notion ACTIVEGOALS");
        return {
            notionId: response.id,
            title: goalData.title,
            description: goalData.description || "",
            category: goalData.category,
            targetValue: goalData.targetValue,
            currentValue: goalData.currentValue || "0",
            unit: goalData.unit || "",
            targetDate: goalData.targetDate || "",
            isCompleted: goalData.isCompleted || false,
            createdAt: new Date()
        };
    } catch (error) {
        console.error("Error creating goal in Notion ACTIVEGOALS:", error);
        throw new Error("Failed to create goal in Notion ACTIVEGOALS");
    }
}

// Update a goal in the ACTIVEGOALS database
export async function updateNotionActiveGoal(notionId: string, updates: {
    title?: string;
    description?: string;
    category?: string;
    targetValue?: string;
    currentValue?: string;
    unit?: string;
    targetDate?: string;
    isCompleted?: boolean;
}) {
    try {
        if (!NOTION_ACTIVEGOALS_DATABASE_ID) {
            throw new Error("NOTION_ACTIVEGOALS_DATABASE_ID is not configured");
        }
        
        console.log("🎯 Updating goal in Notion ACTIVEGOALS:", notionId);
        
        const properties: any = {};
        
        if (updates.title !== undefined) {
            properties.Name = {
                title: [{ text: { content: updates.title } }]
            };
        }
        
        if (updates.description !== undefined) {
            properties.Description = {
                rich_text: [{ text: { content: updates.description } }]
            };
        }
        
        if (updates.category !== undefined) {
            properties.Category = {
                select: { name: updates.category }
            };
        }
        
        if (updates.targetValue !== undefined) {
            properties["Target Value"] = {
                number: parseFloat(updates.targetValue)
            };
        }
        
        if (updates.currentValue !== undefined) {
            properties["Current Value"] = {
                number: parseFloat(updates.currentValue)
            };
        }
        
        if (updates.unit !== undefined) {
            properties.Unit = {
                rich_text: [{ text: { content: updates.unit } }]
            };
        }
        
        if (updates.targetDate !== undefined) {
            properties["Target Date"] = {
                date: { start: updates.targetDate }
            };
        }
        
        if (updates.isCompleted !== undefined) {
            properties.Completed = {
                checkbox: updates.isCompleted
            };
        }

        await notion.pages.update({
            page_id: notionId,
            properties
        });

        console.log("✅ Successfully updated goal in Notion ACTIVEGOALS");
        return true;
    } catch (error) {
        console.error("Error updating goal in Notion ACTIVEGOALS:", error);
        throw new Error("Failed to update goal in Notion ACTIVEGOALS");
    }
}

// Delete a goal from the ACTIVEGOALS database
export async function deleteNotionActiveGoal(notionId: string) {
    try {
        if (!NOTION_ACTIVEGOALS_DATABASE_ID) {
            throw new Error("NOTION_ACTIVEGOALS_DATABASE_ID is not configured");
        }
        
        console.log("🎯 Deleting goal from Notion ACTIVEGOALS:", notionId);
        
        await notion.pages.update({
            page_id: notionId,
            archived: true
        });

        console.log("✅ Successfully deleted goal from Notion ACTIVEGOALS");
        return true;
    } catch (error) {
        console.error("Error deleting goal from Notion ACTIVEGOALS:", error);
        throw new Error("Failed to delete goal from Notion ACTIVEGOALS");
    }
}