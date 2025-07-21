import { notion, NOTION_PAGE_ID, createDatabaseIfNotExists } from "./notion";

// Environment variables validation
if (!process.env.NOTION_INTEGRATION_SECRET) {
    throw new Error("NOTION_INTEGRATION_SECRET is not defined. Please add it to your environment variables.");
}

if (!process.env.NOTION_PAGE_URL) {
    throw new Error("NOTION_PAGE_URL is not defined. Please add it to your environment variables.");
}

// Setup Timer Sessions database for persistent focus timer
async function setupTimerSessionsDatabase() {
    console.log("Setting up Timer Sessions database...");

    // Create Timer Sessions database with all required properties
    const timerSessionsDb = await createDatabaseIfNotExists("PRODUCTIVITYTIMERSESSIONS", {
        // Primary title field
        Title: {
            title: {}
        },
        // User identification
        "User ID": {
            rich_text: {}
        },
        // Timer mode (focus, pomodoro, deepwork, flowstate)
        Mode: {
            select: {
                options: [
                    { name: "focus", color: "blue" },
                    { name: "pomodoro", color: "red" },
                    { name: "deepwork", color: "purple" },
                    { name: "flowstate", color: "green" }
                ]
            }
        },
        // Category for organization
        Category: {
            select: {
                options: [
                    { name: "Work", color: "blue" },
                    { name: "Personal", color: "green" },
                    { name: "Health", color: "pink" },
                    { name: "Learning", color: "purple" },
                    { name: "Creative", color: "orange" },
                    { name: "General", color: "gray" }
                ]
            }
        },
        // Timer duration tracking
        "Total Duration": {
            number: {
                format: "number"
            }
        },
        "Remaining Time": {
            number: {
                format: "number"
            }
        },
        // Session tracking
        "Current Session": {
            number: {
                format: "number"
            }
        },
        "Total Sessions": {
            number: {
                format: "number"
            }
        },
        "Completed Sessions": {
            number: {
                format: "number"
            }
        },
        // State tracking
        "Is Break": {
            checkbox: {}
        },
        "Is Active": {
            checkbox: {}
        },
        "Is Paused": {
            checkbox: {}
        },
        // Time tracking
        "Started At": {
            date: {}
        },
        "Paused At": {
            date: {}
        },
        "Last Sync": {
            date: {}
        },
        // Progress tracking
        "Total Focus Time": {
            number: {
                format: "number"
            }
        },
        // Timestamps
        "Created At": {
            date: {}
        },
        "Updated At": {
            date: {}
        }
    });

    console.log("✅ Timer Sessions database setup complete!");
    console.log("📝 Database ID:", timerSessionsDb.id);

    return timerSessionsDb;
}

// Run the setup
setupTimerSessionsDatabase().then((db) => {
    console.log("🎉 Timer Sessions database setup successful!");
    console.log("🔗 Database URL:", `https://notion.so/${db.id.replace(/-/g, '')}`);
    console.log("💡 Copy this URL and set it as your NOTION_TIMERSESSIONS_URL secret");
    process.exit(0);
}).catch(error => {
    console.error("❌ Timer Sessions database setup failed:", error);
    process.exit(1);
});