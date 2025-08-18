import { Client } from "@notionhq/client";

/**
 * AIDEVQATESTING Notion Database Integration
 * Handles QA testing data operations for AI development projects
 */

const notion = new Client({
    auth: process.env.NOTION_INTEGRATION_SECRET,
});

/**
 * Extract database ID from NOTION_AIDEV_QATESTING_URL
 */
function getQATestingDatabaseId(): string {
    const url = process.env.NOTION_AIDEV_QATESTING_URL;
    if (!url) {
        console.error("❌ NOTION_AIDEV_QATESTING_URL not found in environment variables");
        throw new Error("NOTION_AIDEV_QATESTING_URL environment variable is required");
    }
    
    // Extract database ID from Notion URL
    const match = url.match(/([a-f0-9]{32})/);
    if (!match) {
        console.error("❌ Invalid Notion URL format for AIDEV QA Testing database");
        throw new Error("Invalid Notion URL format for AIDEV QA Testing database");
    }
    
    const databaseId = match[1];
    console.log(`🧪 QA Testing database ID extracted: ${databaseId.substring(0, 8)}...`);
    return databaseId;
}

/**
 * Fetch all QA testing records from AIDEVQATESTING database
 */
export async function fetchQATestingRecords() {
    try {
        console.log("🔍 Getting QA Testing Database ID...");
        const databaseId = getQATestingDatabaseId();
        
        console.log("🧪 Fetching QA testing records from Notion database");
        const response = await notion.databases.query({
            database_id: databaseId,
            sorts: [
                {
                    property: "CreatedDate",
                    direction: "descending"
                }
            ]
        });

        console.log(`✅ Retrieved ${response.results.length} QA testing records from Notion`);
        
        // Debug: Log first item properties
        if (response.results.length > 0) {
            const firstItem = response.results[0] as any;
            console.log("First item properties:", Object.keys(firstItem.properties));
        }

        return response.results.map((page: any) => {
            const properties = page.properties;
            
            // Try different possible name property names
            const nameProperty = properties.Name || properties.Title || properties.name || properties.title;
            
            return {
                notionId: page.id,
                name: nameProperty?.title?.[0]?.plain_text || nameProperty?.rich_text?.[0]?.plain_text || "Untitled Test",
                description: properties.Description?.rich_text?.[0]?.plain_text || "",
                testType: properties.TestType?.select?.name || "Manual",
                status: properties.Status?.select?.name || "Pending",
                priority: properties.Priority?.select?.name || "Medium",
                projectId: properties.ProjectId?.relation?.[0]?.id || null,
                projectName: properties.ProjectName?.rich_text?.[0]?.plain_text || "",
                testCase: properties.TestCase?.rich_text?.[0]?.plain_text || "",
                expectedResult: properties.ExpectedResult?.rich_text?.[0]?.plain_text || "",
                actualResult: properties.ActualResult?.rich_text?.[0]?.plain_text || "",
                steps: properties.Steps?.rich_text?.[0]?.plain_text || "",
                severity: properties.Severity?.select?.name || "Low",
                tags: properties.Tags?.multi_select?.map((tag: any) => tag.name) || [],
                createdDate: properties.CreatedDate?.date?.start || null,
                updatedDate: properties.UpdatedDate?.date?.start || null,
                resolvedDate: properties.ResolvedDate?.date?.start || null,
                isActive: properties.IsActive?.checkbox || true,
                createdAt: (page as any).created_time,
                updatedAt: (page as any).last_edited_time
            };
        });
    } catch (error) {
        console.error("Error fetching QA Testing records from Notion:", error);
        throw new Error("Failed to fetch QA Testing records from Notion");
    }
}

/**
 * Create a new QA testing record in AIDEVQATESTING database
 */
export async function createQATestingRecord(recordData: any) {
    let database: any = null;
    let properties: any = {};
    
    try {
        console.log("🚀 Starting QA Testing record creation...");
        const databaseId = getQATestingDatabaseId();
        
        if (!databaseId) {
            throw new Error("Database ID is null or undefined. Check environment variable configuration.");
        }

        console.log("📋 Building QA Testing record properties...");
        
        // Build properties object for Notion API
        properties = {
            Name: {
                title: [{ text: { content: recordData.name || "New Test" } }]
            }
        };

        // Add optional properties
        if (recordData.description) {
            properties.Description = {
                rich_text: [{ text: { content: recordData.description } }]
            };
        }

        if (recordData.testType) {
            properties.TestType = {
                select: { name: recordData.testType }
            };
        }

        if (recordData.status) {
            properties.Status = {
                select: { name: recordData.status }
            };
        }

        if (recordData.priority) {
            properties.Priority = {
                select: { name: recordData.priority }
            };
        }

        if (recordData.testCase) {
            properties.TestCase = {
                rich_text: [{ text: { content: recordData.testCase } }]
            };
        }

        if (recordData.expectedResult) {
            properties.ExpectedResult = {
                rich_text: [{ text: { content: recordData.expectedResult } }]
            };
        }

        if (recordData.actualResult) {
            properties.ActualResult = {
                rich_text: [{ text: { content: recordData.actualResult } }]
            };
        }

        if (recordData.steps) {
            properties.Steps = {
                rich_text: [{ text: { content: recordData.steps } }]
            };
        }

        if (recordData.severity) {
            properties.Severity = {
                select: { name: recordData.severity }
            };
        }

        if (recordData.createdDate) {
            properties.CreatedDate = {
                date: { start: recordData.createdDate }
            };
        }

        if (recordData.isActive !== undefined) {
            properties.IsActive = {
                checkbox: recordData.isActive
            };
        }

        console.log("🧪 Creating QA Testing record in Notion...");
        const response = await notion.pages.create({
            parent: { database_id: databaseId },
            properties: properties
        });

        console.log("✅ QA Testing record created successfully:", response.id);
        return {
            success: true,
            notionId: response.id,
            message: "QA Testing record created successfully"
        };

    } catch (error: any) {
        console.error("❌ Error creating QA Testing record:", error);
        console.error("Database ID:", getQATestingDatabaseId());
        console.error("Properties sent:", JSON.stringify(properties, null, 2));
        
        throw new Error(`Failed to create QA Testing record: ${error.message}`);
    }
}

/**
 * Update an existing QA testing record in AIDEVQATESTING database
 */
export async function updateQATestingRecord(notionId: string, updateData: any) {
    try {
        console.log(`🔄 Updating QA Testing record: ${notionId}`);
        
        const properties: any = {};

        // Build update properties
        if (updateData.name) {
            properties.Name = {
                title: [{ text: { content: updateData.name } }]
            };
        }

        if (updateData.description) {
            properties.Description = {
                rich_text: [{ text: { content: updateData.description } }]
            };
        }

        if (updateData.status) {
            properties.Status = {
                select: { name: updateData.status }
            };
        }

        if (updateData.actualResult) {
            properties.ActualResult = {
                rich_text: [{ text: { content: updateData.actualResult } }]
            };
        }

        if (updateData.notes) {
            properties.Notes = {
                rich_text: [{ text: { content: updateData.notes } }]
            };
        }

        if (updateData.resolvedDate) {
            properties.ResolvedDate = {
                date: { start: updateData.resolvedDate }
            };
        }

        const response = await notion.pages.update({
            page_id: notionId,
            properties: properties
        });

        console.log("✅ QA Testing record updated successfully");
        return {
            success: true,
            notionId: response.id,
            message: "QA Testing record updated successfully"
        };

    } catch (error: any) {
        console.error("❌ Error updating QA Testing record:", error);
        throw new Error(`Failed to update QA Testing record: ${error.message}`);
    }
}