import { notion } from "./notion";

// Extract the database ID from the Notion database URL
function extractDatabaseIdFromUrl(databaseUrl: string): string {
    const match = databaseUrl.match(/([a-f0-9]{32})(?:[?#]|$)/i);
    if (match && match[1]) {
        return match[1];
    }
    throw Error("Failed to extract database ID");
}

// Get the AIDEVPROJECTS database ID
export function getAIDevProjectsDatabaseId(): string {
    console.log("🔍 Getting AI Dev Projects Database ID...");
    console.log("Environment variables check:");
    console.log("  NOTION_AI_DEV_PAGE_URL:", !!process.env.NOTION_AI_DEV_PAGE_URL);
    console.log("  NOTION_PAGE_URL:", !!process.env.NOTION_PAGE_URL);
    
    // Try NOTION_AI_DEV_PAGE_URL first (if it's a database URL)
    if (process.env.NOTION_AI_DEV_PAGE_URL) {
        console.log("  Using NOTION_AI_DEV_PAGE_URL:", process.env.NOTION_AI_DEV_PAGE_URL.substring(0, 50) + "...");
        try {
            const id = extractDatabaseIdFromUrl(process.env.NOTION_AI_DEV_PAGE_URL);
            console.log("  ✅ Extracted database ID:", id.substring(0, 8) + "...");
            return id;
        } catch (error: any) {
            console.error("  ❌ Failed to extract from NOTION_AI_DEV_PAGE_URL:", error.message);
        }
    }
    
    // Fallback to checking if NOTION_PAGE_URL points to the database
    if (process.env.NOTION_PAGE_URL) {
        console.log("  Falling back to NOTION_PAGE_URL:", process.env.NOTION_PAGE_URL.substring(0, 50) + "...");
        try {
            const id = extractDatabaseIdFromUrl(process.env.NOTION_PAGE_URL);
            console.log("  ✅ Extracted database ID from fallback:", id.substring(0, 8) + "...");
            return id;
        } catch (error: any) {
            console.error("  ❌ Failed to extract from NOTION_PAGE_URL:", error.message);
        }
    }
    
    const errorMsg = "Either NOTION_AI_DEV_PAGE_URL or NOTION_PAGE_URL environment variable is required and must point to the AIDEVPROJECTS database";
    console.error("  ❌", errorMsg);
    throw new Error(errorMsg);
}

/**
 * Get all items from AIDEVPROJECTS database
 */
export async function getAIDevProjects() {
    try {
        const databaseId = getAIDevProjectsDatabaseId();
        
        let allResults: any[] = [];
        let hasMore = true;
        let startCursor: string | undefined = undefined;

        // Fetch all pages with pagination
        while (hasMore) {
            const queryParams: any = {
                database_id: databaseId,
                page_size: 100
            };

            if (startCursor) {
                queryParams.start_cursor = startCursor;
            }

            const response = await notion.databases.query(queryParams);
            
            allResults = allResults.concat(response.results);
            hasMore = response.has_more;
            startCursor = response.next_cursor || undefined;
            
            console.log(`📄 Fetched ${response.results.length} projects, total: ${allResults.length}, has more: ${hasMore}`);
        }

        console.log(`✅ Total projects fetched: ${allResults.length}`);

        // Debug: log the structure of the first item
        if (allResults.length > 0) {
            const firstItem = allResults[0] as any;
            console.log("First item properties:", Object.keys(firstItem.properties || {}));
        }

        return allResults.map((page: any) => {
            const properties = page.properties;
            
            // Try different possible name property names
            const nameProperty = properties.Name || properties.Title || properties.name || properties.title;
            
            return {
                notionId: page.id,
                name: nameProperty?.title?.[0]?.plain_text || nameProperty?.rich_text?.[0]?.plain_text || "Untitled",
                description: properties.Description?.rich_text?.[0]?.plain_text || "",
                type: properties.Type?.select?.name || "Project",
                status: properties.Status?.select?.name || "Planning",
                category: properties.Category?.select?.name || "",
                priority: properties.Priority?.select?.name || "Medium",
                tags: properties.Tags?.multi_select?.map((tag: any) => tag.name) || [],
                startDate: properties.StartDate?.date?.start || null,
                endDate: properties.EndDate?.date?.start || null,
                targetDate: properties.TargetDate?.date?.start || null,
                dueDate: properties.DueDate?.date?.start || null,
                completedDate: properties.CompletedDate?.date?.start || null,
                createdDate: properties.CreatedDate?.date?.start || null,
                lastUsed: properties.LastUsed?.date?.start || null,
                lastRun: properties.LastRun?.date?.start || null,
                estimatedHours: properties.EstimatedHours?.number || 0,
                actualHours: properties.ActualHours?.number || 0,
                taskCount: properties.TaskCount?.formula?.number || 0,
                projectLength: properties.ProjectLength?.number || 0,
                executionTime: properties.ExecutionTime?.number || 0,
                projectName: properties.ProjectName?.rich_text?.[0]?.plain_text || "",
                testEnvironment: properties.TestEnvironment?.rich_text?.[0]?.plain_text || "",
                expectedResult: properties.ExpectedResult?.rich_text?.[0]?.plain_text || "",
                actualResult: properties.ActualResult?.rich_text?.[0]?.plain_text || "",
                notes: properties.Notes?.rich_text?.[0]?.plain_text || "",
                repositoryUrl: properties.RepositoryUrl?.url || "",
                deploymentUrl: properties.DeploymentUrl?.url || "",
                promptFile: properties.PromptFile?.files || [],
                documents: properties.Documents?.files || [],
                isActive: properties.IsActive?.checkbox || false,
                isCustom: properties.IsCustom?.checkbox || false,
                createdAt: (page as any).created_time,
                updatedAt: (page as any).last_edited_time
            };
        });
    } catch (error) {
        console.error("Error fetching AI Dev Projects from Notion:", error);
        throw new Error("Failed to fetch AI Dev Projects from Notion");
    }
}

/**
 * Create a new item in AIDEVPROJECTS database
 */
export async function createAIDevProject(itemData: any) {
    let database: any = null;
    let properties: any = {};
    
    try {
        console.log("🚀 Starting AI Dev Project creation...");
        const databaseId = getAIDevProjectsDatabaseId();
        
        if (!databaseId) {
            throw new Error("Database ID is null or undefined. Check environment variable configuration.");
        }
        
        console.log("✅ Database ID obtained successfully:", databaseId.substring(0, 8) + "...");
        
        // First retrieve the database to ensure it exists and we have access
        console.log("🔍 Retrieving database to verify access...");
        database = await notion.databases.retrieve({
            database_id: databaseId,
        });
        console.log("✅ Database retrieved successfully:", (database as any).title?.[0]?.plain_text || "Unknown");

        properties = {
            Name: {
                title: [{ text: { content: itemData.name } }]
            }
        };

        // Add optional properties only if they exist
        if (itemData.description) {
            properties.Description = {
                rich_text: [{ text: { content: itemData.description } }]
            };
        }

        if (itemData.type) {
            properties.Type = { select: { name: itemData.type } };
        }

        if (itemData.status) {
            properties.Status = { select: { name: itemData.status } };
        }

        if (itemData.category) {
            properties.Category = { select: { name: itemData.category } };
        }

        if (itemData.priority) {
            properties.Priority = { select: { name: itemData.priority } };
        }

        if (itemData.tags && itemData.tags.length > 0) {
            properties.Tags = {
                multi_select: itemData.tags.map((tag: string) => ({ name: tag }))
            };
        }

        if (itemData.startDate) {
            properties.StartDate = { date: { start: itemData.startDate } };
        }

        if (itemData.endDate) {
            properties.EndDate = { date: { start: itemData.endDate } };
        }

        if (itemData.targetDate) {
            properties.TargetDate = { date: { start: itemData.targetDate } };
        }

        if (itemData.dueDate) {
            properties.DueDate = { date: { start: itemData.dueDate } };
        }

        if (itemData.estimatedHours) {
            properties.EstimatedHours = { number: itemData.estimatedHours };
        }

        if (itemData.actualHours) {
            properties.ActualHours = { number: itemData.actualHours };
        }

        if (itemData.projectName) {
            properties.ProjectName = {
                rich_text: [{ text: { content: itemData.projectName } }]
            };
        }

        if (itemData.repositoryUrl) {
            properties.RepositoryUrl = { url: itemData.repositoryUrl };
        }

        if (itemData.deploymentUrl) {
            properties.DeploymentUrl = { url: itemData.deploymentUrl };
        }

        if (itemData.notes) {
            properties.Notes = {
                rich_text: [{ text: { content: itemData.notes } }]
            };
        }

        if (itemData.testEnvironment) {
            properties.TestEnvironment = {
                rich_text: [{ text: { content: itemData.testEnvironment } }]
            };
        }

        if (itemData.expectedResult) {
            properties.ExpectedResult = {
                rich_text: [{ text: { content: itemData.expectedResult } }]
            };
        }

        if (itemData.actualResult) {
            properties.ActualResult = {
                rich_text: [{ text: { content: itemData.actualResult } }]
            };
        }

        if (typeof itemData.isActive === 'boolean') {
            properties.IsActive = { checkbox: itemData.isActive };
        }

        if (typeof itemData.isCustom === 'boolean') {
            properties.IsCustom = { checkbox: itemData.isCustom };
        }

        // Set creation date if it's a new item
        if (itemData.type === 'Library Prompt') {
            properties.CreatedDate = { date: { start: new Date().toISOString().split('T')[0] } };
        }

        console.log("📝 Creating new page in database...");
        const response = await notion.pages.create({
            parent: {
                database_id: database.id
            },
            properties
        });
        console.log("✅ Page created successfully with ID:", response.id);

        return {
            notionId: response.id,
            ...itemData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    } catch (error: any) {
        console.error("Error creating AI Dev Project in Notion:", error);
        console.error("Error details:", error.message);
        console.error("Error code:", error.code);
        console.error("Error status:", error.status);
        console.error("Database ID:", database?.id || "undefined");
        console.error("Environment check:");
        console.error("  NOTION_AI_DEV_PAGE_URL:", !!process.env.NOTION_AI_DEV_PAGE_URL);
        console.error("  NOTION_PAGE_URL:", !!process.env.NOTION_PAGE_URL);
        console.error("Properties being sent:", JSON.stringify(properties, null, 2));
        
        // Provide specific error guidance based on successful patterns
        if (error.code === 'object_not_found') {
            throw new Error(`Database not found. Please ensure your environment variable points to the AIDEVPROJECTS database URL (not a page URL). Current database ID: ${database?.id || "undefined"}`);
        } else if (error.code === 'unauthorized') {
            throw new Error(`Notion integration unauthorized. Please check NOTION_INTEGRATION_SECRET is valid and the integration has access to the AIDEVPROJECTS database.`);
        } else if (error.code === 'forbidden') {
            throw new Error(`Permission denied. Please share the AIDEVPROJECTS database with your Notion integration.`);
        } else if (error.code === 'validation_error') {
            throw new Error(`Database schema mismatch: ${error.message}. Please ensure the database has the required properties.`);
        } else {
            throw new Error(`Failed to create AI Dev Project in Notion: ${error.message || error.code || 'Unknown error'}`);
        }
    }
}

/**
 * Update an existing item in AIDEVPROJECTS database
 */
export async function updateAIDevProject(notionId: string, updateData: any) {
    try {
        const properties: any = {};

        // Build properties object only with fields that need updating
        if (updateData.name) {
            properties.Name = {
                title: [{ text: { content: updateData.name } }]
            };
        }

        if (updateData.description !== undefined) {
            properties.Description = {
                rich_text: [{ text: { content: updateData.description } }]
            };
        }

        if (updateData.status) {
            properties.Status = { select: { name: updateData.status } };
        }

        if (updateData.priority) {
            properties.Priority = { select: { name: updateData.priority } };
        }

        if (updateData.startDate !== undefined) {
            properties.StartDate = updateData.startDate ? { date: { start: updateData.startDate } } : { date: null };
        }

        if (updateData.endDate !== undefined) {
            properties.EndDate = updateData.endDate ? { date: { start: updateData.endDate } } : { date: null };
        }

        if (updateData.targetDate !== undefined) {
            properties.TargetDate = updateData.targetDate ? { date: { start: updateData.targetDate } } : { date: null };
        }

        if (updateData.actualHours !== undefined) {
            properties.ActualHours = { number: updateData.actualHours };
        }

        if (updateData.estimatedHours !== undefined) {
            properties.EstimatedHours = { number: updateData.estimatedHours };
        }

        if (updateData.repositoryUrl !== undefined) {
            properties.RepositoryUrl = updateData.repositoryUrl ? { url: updateData.repositoryUrl } : { url: null };
        }

        if (updateData.deploymentUrl !== undefined) {
            properties.DeploymentUrl = updateData.deploymentUrl ? { url: updateData.deploymentUrl } : { url: null };
        }

        if (updateData.isActive !== undefined) {
            properties.IsActive = { checkbox: updateData.isActive };
        }

        if (updateData.completedDate !== undefined) {
            properties.CompletedDate = updateData.completedDate ? { date: { start: updateData.completedDate } } : { date: null };
        }

        const response = await notion.pages.update({
            page_id: notionId,
            properties
        });

        return response as any;
    } catch (error) {
        console.error("Error updating AI Dev Project in Notion:", error);
        throw new Error("Failed to update AI Dev Project in Notion");
    }
}

/**
 * Delete an item from AIDEVPROJECTS database
 */
export async function deleteAIDevProject(notionId: string) {
    try {
        await notion.pages.update({
            page_id: notionId,
            archived: true
        });

        return { success: true };
    } catch (error) {
        console.error("Error deleting AI Dev Project in Notion:", error);
        throw new Error("Failed to delete AI Dev Project from Notion");
    }
}

/**
 * Get items by type (Project, Task, Test Item, Library Prompt)
 */
export async function getAIDevProjectsByType(type: string) {
    try {
        const databaseId = getAIDevProjectsDatabaseId();
        
        let allResults: any[] = [];
        let hasMore = true;
        let startCursor: string | undefined = undefined;

        // Fetch all pages with pagination and filtering
        while (hasMore) {
            const queryParams: any = {
                database_id: databaseId,
                page_size: 100,
                filter: {
                    property: "Type",
                    select: {
                        equals: type
                    }
                }
            };

            if (startCursor) {
                queryParams.start_cursor = startCursor;
            }

            const response = await notion.databases.query(queryParams);
            
            allResults = allResults.concat(response.results);
            hasMore = response.has_more;
            startCursor = response.next_cursor || undefined;
            
            console.log(`📄 Fetched ${response.results.length} ${type} items, total: ${allResults.length}, has more: ${hasMore}`);
        }

        console.log(`✅ Total ${type} items fetched: ${allResults.length}`);

        return allResults.map((page: any) => {
            const properties = page.properties;
            
            // Try different possible name property names
            const nameProperty = properties.Name || properties.Title || properties.name || properties.title;
            
            return {
                notionId: page.id,
                name: nameProperty?.title?.[0]?.plain_text || nameProperty?.rich_text?.[0]?.plain_text || "Untitled",
                description: properties.Description?.rich_text?.[0]?.plain_text || "",
                type: properties.Type?.select?.name || "Project",
                status: properties.Status?.select?.name || "Planning",
                category: properties.Category?.select?.name || "",
                priority: properties.Priority?.select?.name || "Medium",
                tags: properties.Tags?.multi_select?.map((tag: any) => tag.name) || [],
                startDate: properties.StartDate?.date?.start || null,
                endDate: properties.EndDate?.date?.start || null,
                targetDate: properties.TargetDate?.date?.start || null,
                dueDate: properties.DueDate?.date?.start || null,
                estimatedHours: properties.EstimatedHours?.number || 0,
                actualHours: properties.ActualHours?.number || 0,
                repositoryUrl: properties.RepositoryUrl?.url || "",
                deploymentUrl: properties.DeploymentUrl?.url || "",
                isActive: properties.IsActive?.checkbox || false,
                createdAt: (page as any).created_time,
                updatedAt: (page as any).last_edited_time
            };
        });
    } catch (error) {
        console.error(`Error fetching ${type} items from Notion:`, error);
        throw new Error(`Failed to fetch ${type} items from Notion`);
    }
}

/**
 * Update project documents in AIDEVPROJECTS database
 */
export async function updateProjectDocuments(projectId: string, documents: any[]) {
    try {
        console.log("📄 Updating project documents for:", projectId.substring(0, 8) + "...");
        
        const response = await notion.pages.update({
            page_id: projectId,
            properties: {
                Documents: {
                    files: documents
                }
            }
        });

        console.log("✅ Project documents updated successfully");
        return response;
    } catch (error) {
        console.error("Error updating project documents in Notion:", error);
        throw new Error("Failed to update project documents in Notion");
    }
}