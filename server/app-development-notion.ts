import { Client } from "@notionhq/client";
import { notion, findDatabaseByTitle } from "./notion";

// Extract AI Development Tasks database ID from URL
function extractAIDevTasksDatabaseId(): string | null {
    const url = process.env.NOTION_AI_DEV_TASKS_URL;
    if (!url) {
        console.warn("⚠️ NOTION_AI_DEV_TASKS_URL not found in environment variables");
        return null;
    }

    try {
        // Extract database ID from Notion URL
        const match = url.match(/([a-f0-9]{32})/i);
        if (match && match[1]) {
            const databaseId = match[1];
            console.log(`🗂️ AI Dev Tasks database ID extracted: ${databaseId.substring(0, 8)}...`);
            return databaseId;
        }
    } catch (error) {
        console.error("❌ Error extracting AI Dev Tasks database ID:", error);
    }

    console.error("❌ Failed to extract AI Dev Tasks database ID from URL:", url);
    return null;
}

export const NOTION_AI_DEV_TASKS_DATABASE_ID = extractAIDevTasksDatabaseId();

// App Development Notion Integration Functions

/**
 * Get all projects from the App Development Projects database
 */
export async function getAppDevelopmentProjects() {
    try {
        const projectsDb = await findDatabaseByTitle("App Development Projects");
        if (!projectsDb) {
            throw new Error("App Development Projects database not found");
        }

        const response = await notion.databases.query({
            database_id: projectsDb.id,
            sorts: [
                {
                    property: "Name",
                    direction: "ascending"
                }
            ]
        });

        return response.results.map((page: any) => {
            const properties = page.properties;
            return {
                notionId: page.id,
                name: properties.Name?.title?.[0]?.plain_text || "Untitled Project",
                description: properties.Description?.rich_text?.[0]?.plain_text || "",
                status: properties.Status?.select?.name || "planning",
                projectType: properties.ProjectType?.select?.name || "web",
                priority: properties.Priority?.select?.name || "medium",
                startDate: properties.StartDate?.date?.start || null,
                endDate: properties.EndDate?.date?.start || null,
                targetDate: properties.TargetDate?.date?.start || null,
                repositoryUrl: properties.RepositoryUrl?.url || "",
                deploymentUrl: properties.DeploymentUrl?.url || "",
                techStack: properties.TechStack?.multi_select?.map((tech: any) => tech.name) || [],
                isActive: properties.IsActive?.checkbox || false,
                createdAt: page.created_time,
                updatedAt: page.last_edited_time
            };
        });
    } catch (error) {
        console.error("Error fetching projects from Notion:", error);
        throw new Error("Failed to fetch projects from Notion");
    }
}

/**
 * Create a new project in Notion
 */
export async function createAppDevelopmentProject(projectData: any) {
    try {
        const projectsDb = await findDatabaseByTitle("App Development Projects");
        if (!projectsDb) {
            throw new Error("App Development Projects database not found");
        }

        const response = await notion.pages.create({
            parent: {
                database_id: projectsDb.id
            },
            properties: {
                Name: {
                    title: [{ text: { content: projectData.name } }]
                },
                Description: {
                    rich_text: [{ text: { content: projectData.description || "" } }]
                },
                Status: {
                    select: { name: projectData.status }
                },
                ProjectType: {
                    select: { name: projectData.projectType }
                },
                Priority: projectData.priority ? {
                    select: { name: projectData.priority }
                } : { select: null },
                StartDate: projectData.startDate ? {
                    date: { start: projectData.startDate }
                } : { date: null },
                EndDate: projectData.endDate ? {
                    date: { start: projectData.endDate }
                } : { date: null },
                TargetDate: projectData.targetDate ? {
                    date: { start: projectData.targetDate }
                } : { date: null },
                RepositoryUrl: projectData.repositoryUrl ? {
                    url: projectData.repositoryUrl
                } : { url: null },
                DeploymentUrl: projectData.deploymentUrl ? {
                    url: projectData.deploymentUrl
                } : { url: null },
                TechStack: projectData.techStack ? {
                    multi_select: projectData.techStack.map((tech: string) => ({ name: tech }))
                } : { multi_select: [] },
                IsActive: {
                    checkbox: projectData.isActive || false
                }
            }
        });

        return response.id;
    } catch (error) {
        console.error("Error creating project in Notion:", error);
        throw new Error("Failed to create project in Notion");
    }
}

/**
 * Update a project in Notion
 */
export async function updateAppDevelopmentProject(notionId: string, projectData: any) {
    try {
        const properties: any = {};

        if (projectData.name !== undefined) {
            properties.Name = { title: [{ text: { content: projectData.name } }] };
        }
        if (projectData.description !== undefined) {
            properties.Description = { rich_text: [{ text: { content: projectData.description } }] };
        }
        if (projectData.status !== undefined) {
            properties.Status = { select: { name: projectData.status } };
        }
        if (projectData.projectType !== undefined) {
            properties.ProjectType = { select: { name: projectData.projectType } };
        }
        if (projectData.priority !== undefined) {
            properties.Priority = { select: { name: projectData.priority } };
        }
        if (projectData.startDate !== undefined) {
            properties.StartDate = projectData.startDate ? { date: { start: projectData.startDate } } : { date: null };
        }
        if (projectData.endDate !== undefined) {
            properties.EndDate = projectData.endDate ? { date: { start: projectData.endDate } } : { date: null };
        }
        if (projectData.targetDate !== undefined) {
            properties.TargetDate = projectData.targetDate ? { date: { start: projectData.targetDate } } : { date: null };
        }
        if (projectData.repositoryUrl !== undefined) {
            properties.RepositoryUrl = projectData.repositoryUrl ? { url: projectData.repositoryUrl } : { url: null };
        }
        if (projectData.deploymentUrl !== undefined) {
            properties.DeploymentUrl = projectData.deploymentUrl ? { url: projectData.deploymentUrl } : { url: null };
        }
        if (projectData.techStack !== undefined) {
            properties.TechStack = { multi_select: projectData.techStack.map((tech: string) => ({ name: tech })) };
        }
        if (projectData.isActive !== undefined) {
            properties.IsActive = { checkbox: projectData.isActive };
        }

        await notion.pages.update({
            page_id: notionId,
            properties
        });

        return true;
    } catch (error) {
        console.error("Error updating project in Notion:", error);
        throw new Error("Failed to update project in Notion");
    }
}

/**
 * Delete a project from Notion (archive it)
 */
export async function deleteAppDevelopmentProject(notionId: string) {
    try {
        await notion.pages.update({
            page_id: notionId,
            archived: true
        });
        return true;
    } catch (error) {
        console.error("Error deleting project from Notion:", error);
        throw new Error("Failed to delete project from Notion");
    }
}

/**
 * Get all tasks from the App Development Tasks database
 */
export async function getAppDevelopmentTasks() {
    try {
        if (!NOTION_AI_DEV_TASKS_DATABASE_ID) {
            throw new Error("NOTION_AI_DEV_TASKS_URL not configured or invalid");
        }

        const response = await notion.databases.query({
            database_id: NOTION_AI_DEV_TASKS_DATABASE_ID,
            sorts: [
                {
                    property: "Priority",
                    direction: "descending"
                },
                {
                    property: "DueDate",
                    direction: "ascending"
                }
            ]
        });

        return response.results.map((page: any) => {
            const properties = page.properties;
            return {
                notionId: page.id,
                title: properties.Title?.title?.[0]?.plain_text || "Untitled Task",
                description: properties.Description?.rich_text?.[0]?.plain_text || "",
                status: properties.Status?.select?.name || "todo",
                priority: properties.Priority?.select?.name || "medium",
                category: properties.Category?.select?.name || "general",
                dueDate: properties.DueDate?.date?.start || null,
                createdAt: page.created_time,
                updatedAt: page.last_edited_time
            };
        });
    } catch (error) {
        console.error("Error fetching tasks from Notion:", error);
        throw new Error("Failed to fetch tasks from Notion");
    }
}

/**
 * Get all test items from the App Development Test Items database
 */
export async function getAppDevelopmentTestItems() {
    try {
        const testItemsDb = await findDatabaseByTitle("App Development Test Items");
        if (!testItemsDb) {
            throw new Error("App Development Test Items database not found");
        }

        const response = await notion.databases.query({
            database_id: testItemsDb.id,
            sorts: [
                {
                    property: "Priority",
                    direction: "descending"
                },
                {
                    property: "LastRun",
                    direction: "descending"
                }
            ]
        });

        return response.results.map((page: any) => {
            const properties = page.properties;
            return {
                notionId: page.id,
                testName: properties.TestName?.title?.[0]?.plain_text || "Untitled Test",
                description: properties.Description?.rich_text?.[0]?.plain_text || "",
                testType: properties.TestType?.select?.name || "unit",
                status: properties.Status?.select?.name || "not_started",
                priority: properties.Priority?.select?.name || "medium",
                lastRun: properties.LastRun?.date?.start || null,
                executionTime: properties.ExecutionTime?.number || 0,
                createdAt: page.created_time,
                updatedAt: page.last_edited_time
            };
        });
    } catch (error) {
        console.error("Error fetching test items from Notion:", error);
        throw new Error("Failed to fetch test items from Notion");
    }
}

/**
 * Get all library items from the App Development Library database
 */
export async function getAppDevelopmentLibrary() {
    try {
        const libraryDb = await findDatabaseByTitle("App Development Library");
        if (!libraryDb) {
            throw new Error("App Development Library database not found");
        }

        const response = await notion.databases.query({
            database_id: libraryDb.id,
            sorts: [
                {
                    property: "Usage",
                    direction: "ascending"
                },
                {
                    property: "LastUsed",
                    direction: "descending"
                }
            ]
        });

        return response.results.map((page: any) => {
            const properties = page.properties;
            return {
                notionId: page.id,
                promptName: properties.PromptName?.title?.[0]?.plain_text || "Untitled Prompt",
                description: properties.Description?.rich_text?.[0]?.plain_text || "",
                category: properties.Category?.select?.name || "general",
                tags: properties.Tags?.multi_select?.map((tag: any) => tag.name) || [],
                usage: properties.Usage?.select?.name || "new",
                createdDate: properties.CreatedDate?.date?.start || null,
                lastUsed: properties.LastUsed?.date?.start || null,
                promptFiles: properties.PromptFile?.files || [],
                createdAt: page.created_time,
                updatedAt: page.last_edited_time
            };
        });
    } catch (error) {
        console.error("Error fetching library items from Notion:", error);
        throw new Error("Failed to fetch library items from Notion");
    }
}

/**
 * Create a new task in Notion
 */
export async function createAppDevelopmentTask(taskData: any) {
    try {
        if (!NOTION_AI_DEV_TASKS_DATABASE_ID) {
            throw new Error("NOTION_AI_DEV_TASKS_URL not configured or invalid");
        }

        const response = await notion.pages.create({
            parent: {
                database_id: NOTION_AI_DEV_TASKS_DATABASE_ID
            },
            properties: {
                Title: {
                    title: [{ text: { content: taskData.title } }]
                },
                Description: {
                    rich_text: [{ text: { content: taskData.description || "" } }]
                },
                Status: {
                    select: { name: taskData.status }
                },
                Priority: {
                    select: { name: taskData.priority }
                },
                Category: {
                    select: { name: taskData.category }
                },
                ...(taskData.dueDate && {
                    DueDate: {
                        date: { start: taskData.dueDate }
                    }
                })
            }
        });

        return response.id;
    } catch (error) {
        console.error("Error creating task in Notion:", error);
        throw new Error("Failed to create task in Notion");
    }
}

/**
 * Create a new test item in Notion
 */
export async function createAppDevelopmentTestItem(testData: any) {
    try {
        const testItemsDb = await findDatabaseByTitle("App Development Test Items");
        if (!testItemsDb) {
            throw new Error("App Development Test Items database not found");
        }

        const response = await notion.pages.create({
            parent: {
                database_id: testItemsDb.id
            },
            properties: {
                TestName: {
                    title: [{ text: { content: testData.testName } }]
                },
                Description: {
                    rich_text: [{ text: { content: testData.description || "" } }]
                },
                TestType: {
                    select: { name: testData.testType }
                },
                Status: {
                    select: { name: testData.status }
                },
                Priority: {
                    select: { name: testData.priority }
                }
            }
        });

        return response.id;
    } catch (error) {
        console.error("Error creating test item in Notion:", error);
        throw new Error("Failed to create test item in Notion");
    }
}

/**
 * Create a new library item in Notion
 */
export async function createAppDevelopmentLibraryItem(libraryData: any) {
    try {
        const libraryDb = await findDatabaseByTitle("App Development Library");
        if (!libraryDb) {
            throw new Error("App Development Library database not found");
        }

        const response = await notion.pages.create({
            parent: {
                database_id: libraryDb.id
            },
            properties: {
                PromptName: {
                    title: [{ text: { content: libraryData.promptName } }]
                },
                Description: {
                    rich_text: [{ text: { content: libraryData.description || "" } }]
                },
                Category: {
                    select: { name: libraryData.category }
                },
                Tags: libraryData.tags ? {
                    multi_select: libraryData.tags.map((tag: string) => ({ name: tag }))
                } : undefined,
                Usage: {
                    select: { name: libraryData.usage || "New" }
                },
                CreatedDate: {
                    date: { start: new Date().toISOString().split('T')[0] }
                }
            }
        });

        return response.id;
    } catch (error) {
        console.error("Error creating library item in Notion:", error);
        throw new Error("Failed to create library item in Notion");
    }
}