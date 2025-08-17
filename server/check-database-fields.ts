import { notion } from "./notion";
import { NOTION_AI_DEV_TASKS_DATABASE_ID } from "./app-development-notion";

async function checkDatabaseFields() {
    try {
        if (!NOTION_AI_DEV_TASKS_DATABASE_ID) {
            throw new Error("NOTION_AI_DEV_TASKS_DATABASE_ID not configured");
        }

        console.log("🔍 Checking database fields...");
        console.log("📊 Database ID:", NOTION_AI_DEV_TASKS_DATABASE_ID);

        const db = await notion.databases.retrieve({
            database_id: NOTION_AI_DEV_TASKS_DATABASE_ID
        });

        console.log("\n=== ALL DATABASE PROPERTIES ===");
        Object.entries(db.properties).forEach(([key, prop]: [string, any]) => {
            console.log(`${key}: ${prop.type}`);
        });

        console.log("\n=== PROJECT-RELATED FIELDS ===");
        const projectFields = Object.entries(db.properties).filter(([key]) => 
            key.toLowerCase().includes('project')
        );
        
        if (projectFields.length === 0) {
            console.log("❌ No project-related fields found!");
        } else {
            projectFields.forEach(([key, prop]: [string, any]) => {
                console.log(`✓ ${key}: ${prop.type}`);
            });
        }

        // Check specifically for the expected field
        if (db.properties.ProjectId) {
            console.log("\n✅ FOUND: ProjectId field exists!");
            console.log(`   Type: ${db.properties.ProjectId.type}`);
        } else {
            console.log("\n❌ MISSING: ProjectId field not found!");
            console.log("   Expected field name: 'ProjectId' (case-sensitive)");
        }

        // Test a sample task to see what data is returned
        console.log("\n=== TESTING SAMPLE TASK DATA ===");
        const response = await notion.databases.query({
            database_id: NOTION_AI_DEV_TASKS_DATABASE_ID,
            page_size: 1
        });

        if (response.results.length > 0) {
            const sampleTask = response.results[0] as any;
            const properties = sampleTask.properties;
            console.log("Sample task ProjectId value:", properties.ProjectId);
        } else {
            console.log("No tasks found in database");
        }

    } catch (error: any) {
        console.error("❌ Error:", error.message);
    }
}

checkDatabaseFields().then(() => {
    console.log("\n🎉 Database field check complete!");
    process.exit(0);
}).catch(error => {
    console.error("💥 Check failed:", error);
    process.exit(1);
});