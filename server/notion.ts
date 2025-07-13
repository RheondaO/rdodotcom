import { Client } from "@notionhq/client";

// Initialize Notion client with better error handling
if (!process.env.NOTION_INTEGRATION_SECRET) {
    console.error("❌ NOTION_INTEGRATION_SECRET is not configured");
    console.error("Please add your Notion integration secret to environment variables");
}

if (!process.env.NOTION_PAGE_URL) {
    console.error("❌ NOTION_PAGE_URL is not configured");
    console.error("Please add your Notion database URL to environment variables");
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

export const NOTION_DATABASE_ID = extractPageIdFromUrl(process.env.NOTION_PAGE_URL!);

/**
 * Get the main database info
 * @returns {Promise<{id: string, title: string}>} - Database object with id and title
 */
export async function getNotionDatabase() {
    try {
        const database = await notion.databases.retrieve({
            database_id: NOTION_DATABASE_ID,
        });
        return database;
    } catch (error) {
        console.error("Error retrieving database:", error);
        throw error;
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
    
    if (database.title && Array.isArray(database.title) && database.title.length > 0) {
        const dbTitle = database.title[0]?.plain_text?.toLowerCase() || "";
        if (dbTitle === title.toLowerCase()) {
            return database;
        }
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
            page_id: NOTION_PAGE_ID
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
export async function getNotionTasks(tasksDatabaseId: string = NOTION_DATABASE_ID) {
    try {
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

// Create a new entry in your TABLEMAKER database
export async function createNotionTask(tasksDatabaseId: string = NOTION_DATABASE_ID, task: {
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