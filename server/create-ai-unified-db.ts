import { notion } from "./notion";

// Extract the page ID from the Notion page URL
function extractPageIdFromUrl(pageUrl: string): string {
    const match = pageUrl.match(/([a-f0-9]{32})(?:[?#]|$)/i);
    if (match && match[1]) {
        return match[1];
    }
    throw Error("Failed to extract page ID");
}

// Create a single unified AI Development database that handles all types
async function createUnifiedAIDevelopmentDatabase() {
    console.log("🚀 Creating unified AI Development database...");

    if (!process.env.NOTION_AI_DEV_PAGE_URL) {
        throw new Error("NOTION_AI_DEV_PAGE_URL environment variable is required. Please provide a Notion PAGE URL (not database).");
    }

    const parentPageId = extractPageIdFromUrl(process.env.NOTION_AI_DEV_PAGE_URL);
    console.log("📍 Using parent page ID:", parentPageId);

    // First, check if the parent is actually a page
    try {
        const parentCheck = await notion.pages.retrieve({ page_id: parentPageId });
        console.log("✅ Parent is a valid page");
    } catch (error: any) {
        if (error.message?.includes('database')) {
            console.log("❌ ERROR: The provided NOTION_AI_DEV_PAGE_URL points to a database, not a page.");
            console.log("📝 You need to:");
            console.log("1. Create a NEW Notion page called 'AI App Development'");
            console.log("2. Share it with your Notion integration");
            console.log("3. Copy the PAGE URL (not database URL)");
            console.log("4. Update NOTION_AI_DEV_PAGE_URL with the new page URL");
            throw new Error("NOTION_AI_DEV_PAGE_URL must point to a page, not a database");
        }
        throw error;
    }

    try {
        console.log("📋 Creating unified AI Development database...");
        const unifiedDb = await notion.databases.create({
            parent: {
                type: "page_id",
                page_id: parentPageId
            },
            title: [{ type: "text", text: { content: "AI Development Hub" } }],
            properties: {
                Name: { title: {} },
                Description: { rich_text: {} },
                Type: {
                    select: {
                        options: [
                            { name: "Project", color: "blue" },
                            { name: "Task", color: "green" },
                            { name: "Test Item", color: "orange" },
                            { name: "Library Prompt", color: "purple" }
                        ]
                    }
                },
                Status: {
                    select: {
                        options: [
                            { name: "Planning", color: "gray" },
                            { name: "Todo", color: "gray" },
                            { name: "In Progress", color: "blue" },
                            { name: "Testing", color: "orange" },
                            { name: "Review", color: "orange" },
                            { name: "Done", color: "green" },
                            { name: "Deployed", color: "green" },
                            { name: "Failed", color: "red" },
                            { name: "Blocked", color: "red" },
                            { name: "On Hold", color: "red" },
                            { name: "Passed", color: "green" },
                            { name: "Active", color: "blue" },
                            { name: "Archived", color: "gray" }
                        ]
                    }
                },
                Priority: {
                    select: {
                        options: [
                            { name: "Low", color: "green" },
                            { name: "Medium", color: "yellow" },
                            { name: "High", color: "red" },
                            { name: "Critical", color: "red" }
                        ]
                    }
                },
                Category: {
                    select: {
                        options: [
                            // Project types
                            { name: "Web App", color: "blue" },
                            { name: "Mobile App", color: "green" },
                            { name: "Desktop App", color: "purple" },
                            { name: "API", color: "orange" },
                            // Task categories
                            { name: "Frontend", color: "blue" },
                            { name: "Backend", color: "green" },
                            { name: "Database", color: "purple" },
                            { name: "Testing", color: "orange" },
                            { name: "Deployment", color: "red" },
                            { name: "Documentation", color: "gray" },
                            // Test types
                            { name: "Unit Test", color: "blue" },
                            { name: "Integration Test", color: "green" },
                            { name: "E2E Test", color: "purple" },
                            { name: "Performance Test", color: "orange" },
                            { name: "Manual Test", color: "gray" },
                            // Library categories
                            { name: "Code Generation", color: "blue" },
                            { name: "Debugging", color: "red" },
                            { name: "Architecture", color: "purple" },
                            { name: "UI/UX", color: "pink" }
                        ]
                    }
                },
                Tags: {
                    multi_select: {
                        options: [
                            { name: "React", color: "blue" },
                            { name: "TypeScript", color: "blue" },
                            { name: "Node.js", color: "green" },
                            { name: "Express", color: "gray" },
                            { name: "PostgreSQL", color: "blue" },
                            { name: "Tailwind CSS", color: "blue" },
                            { name: "API", color: "orange" },
                            { name: "Frontend", color: "blue" },
                            { name: "Backend", color: "green" },
                            { name: "Database", color: "purple" },
                            { name: "Testing", color: "red" },
                            { name: "Urgent", color: "red" },
                            { name: "Bug", color: "red" },
                            { name: "Feature", color: "green" },
                            { name: "Enhancement", color: "yellow" }
                        ]
                    }
                },
                // Date fields
                StartDate: { date: {} },
                EndDate: { date: {} },
                TargetDate: { date: {} },
                DueDate: { date: {} },
                CompletedDate: { date: {} },
                LastRun: { date: {} },
                CreatedDate: { date: {} },
                LastUsed: { date: {} },
                // Numeric fields
                EstimatedHours: { number: {} },
                ActualHours: { number: {} },
                ExecutionTime: { number: {} },
                // Text fields
                ProjectName: { rich_text: {} },
                TestEnvironment: { rich_text: {} },
                ExpectedResult: { rich_text: {} },
                ActualResult: { rich_text: {} },
                Notes: { rich_text: {} },
                // URL fields
                RepositoryUrl: { url: {} },
                DeploymentUrl: { url: {} },
                // File fields (for library prompts)
                PromptFile: { files: {} },
                // Boolean fields
                IsActive: { checkbox: {} },
                IsCustom: { checkbox: {} }
            }
        });

        console.log("\n✅ Unified AI Development database created successfully!");
        
        // Generate URL
        const dbUrl = `https://notion.so/${unifiedDb.id.replace(/-/g, '')}`;
        
        console.log("\n📋 Database URL:");
        console.log(`AI Development Hub: ${dbUrl}`);
        
        console.log("\n⚙️ Add this to your Replit Secrets:");
        console.log(`NOTION_AI_DEVELOPMENT_URL=${dbUrl}`);

        // Create sample data to demonstrate the structure
        await createSampleData(unifiedDb.id);

        return unifiedDb;
        
    } catch (error) {
        console.error("💥 Setup failed:", error);
        throw error;
    }
}

// Create sample data
async function createSampleData(databaseId: string) {
    console.log("\n📝 Creating sample data...");

    try {
        // Sample Project
        await notion.pages.create({
            parent: { database_id: databaseId },
            properties: {
                Name: { title: [{ text: { content: "Belle Journal AI Enhancement" } }] },
                Description: { rich_text: [{ text: { content: "Add AI-powered features to Belle Journal for better productivity insights and automated task management." } }] },
                Type: { select: { name: "Project" } },
                Status: { select: { name: "In Progress" } },
                Category: { select: { name: "Web App" } },
                Priority: { select: { name: "High" } },
                Tags: { multi_select: [{ name: "React" }, { name: "TypeScript" }, { name: "API" }] },
                EstimatedHours: { number: 80 },
                StartDate: { date: { start: new Date().toISOString().split('T')[0] } },
                IsActive: { checkbox: true }
            }
        });

        // Sample Task
        await notion.pages.create({
            parent: { database_id: databaseId },
            properties: {
                Name: { title: [{ text: { content: "Implement Notion Integration for AI Section" } }] },
                Description: { rich_text: [{ text: { content: "Connect the AI App Development section to Notion databases for persistent data storage." } }] },
                Type: { select: { name: "Task" } },
                Status: { select: { name: "In Progress" } },
                Category: { select: { name: "Backend" } },
                Priority: { select: { name: "High" } },
                ProjectName: { rich_text: [{ text: { content: "Belle Journal AI Enhancement" } }] },
                Tags: { multi_select: [{ name: "Backend" }, { name: "API" }] },
                EstimatedHours: { number: 8 },
                DueDate: { date: { start: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] } }
            }
        });

        // Sample Test Item
        await notion.pages.create({
            parent: { database_id: databaseId },
            properties: {
                Name: { title: [{ text: { content: "Test AI Database CRUD Operations" } }] },
                Description: { rich_text: [{ text: { content: "Verify that all CRUD operations work correctly with the AI Development database." } }] },
                Type: { select: { name: "Test Item" } },
                Status: { select: { name: "Todo" } },
                Category: { select: { name: "Integration Test" } },
                Priority: { select: { name: "Medium" } },
                ProjectName: { rich_text: [{ text: { content: "Belle Journal AI Enhancement" } }] },
                TestEnvironment: { rich_text: [{ text: { content: "Development" } }] },
                ExpectedResult: { rich_text: [{ text: { content: "All CRUD operations should complete successfully without errors." } }] }
            }
        });

        // Sample Library Prompt
        await notion.pages.create({
            parent: { database_id: databaseId },
            properties: {
                Name: { title: [{ text: { content: "React Component Generator" } }] },
                Description: { rich_text: [{ text: { content: "Generate a functional React component with TypeScript and proper types." } }] },
                Type: { select: { name: "Library Prompt" } },
                Status: { select: { name: "Active" } },
                Category: { select: { name: "Code Generation" } },
                Tags: { multi_select: [{ name: "React" }, { name: "TypeScript" }, { name: "Frontend" }] },
                Notes: { rich_text: [{ text: { content: "Create a React functional component in TypeScript that uses proper types and follows modern React patterns." } }] },
                CreatedDate: { date: { start: new Date().toISOString().split('T')[0] } },
                IsCustom: { checkbox: false }
            }
        });

        console.log("✅ Sample data created successfully!");
        
    } catch (error) {
        console.error("❌ Failed to create sample data:", error);
    }
}

// Run setup
createUnifiedAIDevelopmentDatabase()
    .then(() => {
        console.log("\n🎉 Setup complete! Your unified AI Development database is ready.");
        console.log("\nNext steps:");
        console.log("1. Add NOTION_AI_DEVELOPMENT_URL to your Replit Secrets");
        console.log("2. Make sure the database is connected to your Notion integration");
        console.log("3. The AI App Development section will sync with this unified database");
        console.log("4. Use the Type field to filter between Projects, Tasks, Test Items, and Library Prompts");
        process.exit(0);
    })
    .catch((error) => {
        console.error("💥 Setup failed:", error);
        process.exit(1);
    });