import { notion } from "./notion";
import { NOTION_AI_DEV_TASKS_DATABASE_ID } from "./app-development-notion";

async function addProjectIdField() {
    try {
        if (!NOTION_AI_DEV_TASKS_DATABASE_ID) {
            throw new Error("NOTION_AI_DEV_TASKS_DATABASE_ID not configured");
        }

        console.log("🔧 Adding ProjectId field to tasks database...");
        console.log("📊 Database ID:", NOTION_AI_DEV_TASKS_DATABASE_ID);

        // First, let's check the current properties
        const currentDb = await notion.databases.retrieve({
            database_id: NOTION_AI_DEV_TASKS_DATABASE_ID
        });

        console.log("📋 Current properties:", Object.keys(currentDb.properties));

        // Check if ProjectId already exists
        if (currentDb.properties.ProjectId) {
            console.log("✅ ProjectId field already exists");
            console.log("🔍 ProjectId field type:", currentDb.properties.ProjectId.type);
            return;
        }

        // Add ProjectId as a rich text field
        console.log("➕ Adding ProjectId rich text field...");
        
        const updatedDb = await notion.databases.update({
            database_id: NOTION_AI_DEV_TASKS_DATABASE_ID,
            properties: {
                ...currentDb.properties,
                ProjectId: {
                    rich_text: {}
                }
            }
        });

        console.log("✅ ProjectId field added successfully!");
        console.log("📋 Updated properties:", Object.keys(updatedDb.properties));

    } catch (error: any) {
        console.error("❌ Error adding ProjectId field:", error.message);
        console.error("🔍 Full error:", error);
    }
}

// Run the field addition
addProjectIdField().then(() => {
    console.log("🎉 Field addition complete!");
    process.exit(0);
}).catch(error => {
    console.error("💥 Field addition failed:", error);
    process.exit(1);
});