import { Client } from "@notionhq/client";

// Initialize Notion client with better error handling
if (!process.env.NOTION_INTEGRATION_SECRET) {
    console.error("❌ NOTION_INTEGRATION_SECRET is not configured");
    console.error("Please add your Notion integration secret to environment variables");
}

if (!process.env.NOTION_TASKS_URL) {
    console.error("❌ NOTION_TASKS_URL is not configured");
    console.error("Please add your Notion tasks database URL to environment variables");
}

if (!process.env.NOTION_TIMEBLOCKS_URL) {
    console.error("❌ NOTION_TIMEBLOCKS_URL is not configured"); 
    console.error("Please add your Notion time blocks database URL to environment variables");
}

// Log environment variable status (without exposing actual values)
console.log("🔑 NOTION_INTEGRATION_SECRET configured:", !!process.env.NOTION_INTEGRATION_SECRET);
console.log("📋 NOTION_TASKS_URL configured:", !!process.env.NOTION_TASKS_URL);
console.log("📅 NOTION_TIMEBLOCKS_URL configured:", !!process.env.NOTION_TIMEBLOCKS_URL);

if (process.env.NOTION_INTEGRATION_SECRET) {
    console.log("🔑 Secret length:", process.env.NOTION_INTEGRATION_SECRET.length);
    console.log("🔑 Secret starts with:", process.env.NOTION_INTEGRATION_SECRET.substring(0, 10) + "...");
    
    // Additional validation
    if (process.env.NOTION_INTEGRATION_SECRET.length < 40) {
        console.error("❌ NOTION_INTEGRATION_SECRET seems too short - should be ~50 characters");
    }
    
    if (!process.env.NOTION_INTEGRATION_SECRET.startsWith('ntn_')) {
        console.error("❌ NOTION_INTEGRATION_SECRET should start with 'ntn_'");
    }
}

if (process.env.NOTION_TASKS_URL) {
    console.log("📋 Tasks URL length:", process.env.NOTION_TASKS_URL.length);
    console.log("📋 Tasks URL domain:", process.env.NOTION_TASKS_URL.includes('notion.so') ? 'notion.so' : 'other');
}

if (process.env.NOTION_TIMEBLOCKS_URL) {
    console.log("📅 Time Blocks URL length:", process.env.NOTION_TIMEBLOCKS_URL.length);
    console.log("📅 Time Blocks URL domain:", process.env.NOTION_TIMEBLOCKS_URL.includes('notion.so') ? 'notion.so' : 'other');
}

export const notion = new Client({
    auth: process.env.NOTION_INTEGRATION_SECRET!,
});

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

try {
    NOTION_DATABASE_ID = process.env.NOTION_TASKS_URL ? extractPageIdFromUrl(process.env.NOTION_TASKS_URL) : null;
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

export { NOTION_DATABASE_ID, NOTION_TIMEBLOCKS_DATABASE_ID };

// Log database configuration
console.log("📋 NOTION_TASKS_URL configured:", !!process.env.NOTION_TASKS_URL);
console.log("📅 NOTION_TIMEBLOCKS_URL configured:", !!process.env.NOTION_TIMEBLOCKS_URL);

if (process.env.NOTION_TASKS_URL) {
    console.log("📋 Tasks URL length:", process.env.NOTION_TASKS_URL.length);
}

if (process.env.NOTION_TIMEBLOCKS_URL) {
    console.log("📅 Time Blocks URL length:", process.env.NOTION_TIMEBLOCKS_URL.length);
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
    const database = await getNotionDatabase();
    
    const dbTitle = (database as any).title?.[0]?.plain_text?.toLowerCase() || "";
    if (dbTitle === title.toLowerCase()) {
        return database;
    }

    return null;
}

// Create a new database if one with a matching title does not exist
export async function createDatabaseIfNotExists(title: string, properties: any) {
    const existingDb = await findDatabaseByTitle(title);
    if (existingDb) {
        return existingDb;
    }
    return await notion.databases.create({
        parent: {
            type: "page_id",
            page_id: NOTION_DATABASE_ID!
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
            
            // Parse datetime to separate date and time
            let date = "", startTime = "", endTime = "";
            if (startDateTime) {
                const startDate = new Date(startDateTime);
                date = startDate.toISOString().split('T')[0];
                startTime = startDate.toTimeString().substring(0, 5); // HH:MM format
            }
            if (endDateTime) {
                const endDate = new Date(endDateTime);
                endTime = endDate.toTimeString().substring(0, 5); // HH:MM format
            }

            return {
                notionId: page.id,
                title: properties.Title?.title?.[0]?.plain_text || "Untitled Time Block",
                description: properties.Description?.rich_text?.[0]?.plain_text || "",
                date: date,
                startTime: startTime,
                endTime: endTime,
                category: properties.Category?.select?.name || "Work",
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
        const startDateTime = `${timeBlockData.date}T${timeBlockData.startTime}:00`;
        const endDateTime = `${timeBlockData.date}T${timeBlockData.endTime}:00`;
        
        console.log("📅 Converted to datetime:", { startDateTime, endDateTime });
        
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
            properties["Due DateTime"] = {
                date: {
                    start: task.dueDate.toISOString().split('T')[0]
                }
            };
        }

        properties.Completed = {
            checkbox: task.status === "Done"
        };

        if (!tasksDatabaseId) {
            throw new Error("Database ID is required");
        }
        
        const response = await notion.pages.create({
            parent: {
                database_id: tasksDatabaseId
            },
            properties
        });

        return response;
    } catch (error) {
        console.error("Error creating entry in Notion:", error);
        throw new Error("Failed to create entry in Notion");
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