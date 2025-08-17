import { notion } from "./notion";

// Extract the page ID from the Notion page URL
function extractPageIdFromUrl(pageUrl: string): string {
    const match = pageUrl.match(/([a-f0-9]{32})(?:[?#]|$)/i);
    if (match && match[1]) {
        return match[1];
    }
    throw Error("Failed to extract page ID");
}

// Create AI Development databases under separate pages
async function createAIDevStandaloneDatabases() {
    console.log("🚀 Creating AI App Development databases...");

    if (!process.env.NOTION_AI_DEV_PAGE_URL) {
        throw new Error("NOTION_AI_DEV_PAGE_URL environment variable is required");
    }

    const parentPageId = extractPageIdFromUrl(process.env.NOTION_AI_DEV_PAGE_URL);
    console.log("📍 Using parent page ID:", parentPageId);

    try {
        console.log("📋 Creating AI Development Projects database...");
        const projectsDb = await notion.databases.create({
            parent: {
                type: "page_id",
                page_id: parentPageId
            },
            title: [{ type: "text", text: { content: "AI Development Projects" } }],
            properties: {
                Name: { title: {} },
                Description: { rich_text: {} },
                Status: {
                    select: {
                        options: [
                            { name: "Planning", color: "gray" },
                            { name: "In Progress", color: "blue" },
                            { name: "Testing", color: "orange" },
                            { name: "Deployed", color: "green" },
                            { name: "On Hold", color: "red" }
                        ]
                    }
                },
                ProjectType: {
                    select: {
                        options: [
                            { name: "Web", color: "blue" },
                            { name: "Mobile", color: "green" },
                            { name: "Desktop", color: "purple" },
                            { name: "API", color: "orange" }
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
                StartDate: { date: {} },
                EndDate: { date: {} },
                TargetDate: { date: {} },
                RepositoryUrl: { url: {} },
                DeploymentUrl: { url: {} },
                TechStack: {
                    multi_select: {
                        options: [
                            { name: "React", color: "blue" },
                            { name: "TypeScript", color: "blue" },
                            { name: "Node.js", color: "green" },
                            { name: "Express", color: "gray" },
                            { name: "PostgreSQL", color: "blue" },
                            { name: "Tailwind CSS", color: "blue" }
                        ]
                    }
                },
                EstimatedHours: { number: {} },
                ActualHours: { number: {} },
                IsActive: { checkbox: {} }
            }
        });

        console.log("📋 Creating child page for Tasks database...");
        const tasksPage = await notion.pages.create({
            parent: {
                type: "page_id",
                page_id: parentPageId
            },
            properties: {
                title: {
                    title: [{ type: "text", text: { content: "AI Development Tasks" } }]
                }
            }
        });

        console.log("📋 Creating AI Development Tasks database...");
        const tasksDb = await notion.databases.create({
            parent: {
                type: "page_id",
                page_id: tasksPage.id
            },
            title: [{ type: "text", text: { content: "AI Development Tasks" } }],
            properties: {
                Title: { title: {} },
                Description: { rich_text: {} },
                Status: {
                    select: {
                        options: [
                            { name: "Todo", color: "gray" },
                            { name: "In Progress", color: "blue" },
                            { name: "Review", color: "orange" },
                            { name: "Done", color: "green" },
                            { name: "Blocked", color: "red" }
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
                            { name: "Frontend", color: "blue" },
                            { name: "Backend", color: "green" },
                            { name: "Database", color: "purple" },
                            { name: "Testing", color: "orange" },
                            { name: "Deployment", color: "red" },
                            { name: "Documentation", color: "gray" }
                        ]
                    }
                },
                ProjectName: { rich_text: {} },
                DueDate: { date: {} },
                EstimatedHours: { number: {} },
                ActualHours: { number: {} },
                CompletedDate: { date: {} }
            }
        });

        console.log("📋 Creating child page for Test Items database...");
        const testItemsPage = await notion.pages.create({
            parent: {
                type: "page_id",
                page_id: parentPageId
            },
            properties: {
                title: {
                    title: [{ type: "text", text: { content: "AI Development Test Items" } }]
                }
            }
        });

        console.log("📋 Creating AI Development Test Items database...");
        const testItemsDb = await notion.databases.create({
            parent: {
                type: "page_id",
                page_id: testItemsPage.id
            },
            title: [{ type: "text", text: { content: "AI Development Test Items" } }],
            properties: {
                TestName: { title: {} },
                Description: { rich_text: {} },
                TestType: {
                    select: {
                        options: [
                            { name: "Unit Test", color: "blue" },
                            { name: "Integration Test", color: "green" },
                            { name: "E2E Test", color: "purple" },
                            { name: "Performance Test", color: "orange" },
                            { name: "Manual Test", color: "gray" }
                        ]
                    }
                },
                Status: {
                    select: {
                        options: [
                            { name: "Not Started", color: "gray" },
                            { name: "In Progress", color: "blue" },
                            { name: "Passed", color: "green" },
                            { name: "Failed", color: "red" },
                            { name: "Blocked", color: "orange" }
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
                ProjectName: { rich_text: {} },
                TestEnvironment: {
                    select: {
                        options: [
                            { name: "Development", color: "blue" },
                            { name: "Staging", color: "orange" },
                            { name: "Production", color: "red" }
                        ]
                    }
                },
                ExpectedResult: { rich_text: {} },
                ActualResult: { rich_text: {} },
                LastRun: { date: {} },
                ExecutionTime: { number: {} }
            }
        });

        console.log("📋 Creating child page for Library database...");
        const libraryPage = await notion.pages.create({
            parent: {
                type: "page_id",
                page_id: parentPageId
            },
            properties: {
                title: {
                    title: [{ type: "text", text: { content: "AI Development Library" } }]
                }
            }
        });

        console.log("📋 Creating AI Development Library database...");
        const libraryDb = await notion.databases.create({
            parent: {
                type: "page_id",
                page_id: libraryPage.id
            },
            title: [{ type: "text", text: { content: "AI Development Library" } }],
            properties: {
                PromptName: { title: {} },
                Description: { rich_text: {} },
                Category: {
                    select: {
                        options: [
                            { name: "Code Generation", color: "blue" },
                            { name: "Documentation", color: "green" },
                            { name: "Testing", color: "orange" },
                            { name: "Debugging", color: "red" },
                            { name: "Architecture", color: "purple" },
                            { name: "UI/UX", color: "pink" },
                            { name: "General", color: "gray" }
                        ]
                    }
                },
                Tags: {
                    multi_select: {
                        options: [
                            { name: "React", color: "blue" },
                            { name: "TypeScript", color: "blue" },
                            { name: "Backend", color: "green" },
                            { name: "Frontend", color: "blue" },
                            { name: "Database", color: "purple" },
                            { name: "API", color: "orange" },
                            { name: "Testing", color: "red" }
                        ]
                    }
                },
                Usage: {
                    select: {
                        options: [
                            { name: "Frequently Used", color: "green" },
                            { name: "Occasionally Used", color: "yellow" },
                            { name: "Rarely Used", color: "red" },
                            { name: "New", color: "blue" }
                        ]
                    }
                },
                CreatedDate: { date: {} },
                LastUsed: { date: {} },
                PromptFile: { files: {} },
                Notes: { rich_text: {} }
            }
        });

        console.log("\n✅ All AI Development databases created successfully!");
        
        // Generate URLs
        const projectsUrl = `https://notion.so/${projectsDb.id.replace(/-/g, '')}`;
        const tasksUrl = `https://notion.so/${tasksDb.id.replace(/-/g, '')}`;
        const testItemsUrl = `https://notion.so/${testItemsDb.id.replace(/-/g, '')}`;
        const libraryUrl = `https://notion.so/${libraryDb.id.replace(/-/g, '')}`;

        console.log("\n📋 Database URLs:");
        console.log(`Projects: ${projectsUrl}`);
        console.log(`Tasks: ${tasksUrl}`);
        console.log(`Test Items: ${testItemsUrl}`);
        console.log(`Library: ${libraryUrl}`);
        
        console.log("\n⚙️ Add these to your Replit Secrets:");
        console.log(`NOTION_AI_PROJECTS_URL=${projectsUrl}`);
        console.log(`NOTION_AI_TASKS_URL=${tasksUrl}`);
        console.log(`NOTION_AI_TESTITEMS_URL=${testItemsUrl}`);
        console.log(`NOTION_AI_LIBRARY_URL=${libraryUrl}`);

        return { projectsDb, tasksDb, testItemsDb, libraryDb };
        
    } catch (error) {
        console.error("💥 Setup failed:", error);
        throw error;
    }
}

// Create sample data
async function createSampleData(databases: any) {
    console.log("\n📝 Creating sample data...");

    try {
        await notion.pages.create({
            parent: { database_id: databases.projectsDb.id },
            properties: {
                Name: { title: [{ text: { content: "Belle Journal AI Enhancement" } }] },
                Description: { rich_text: [{ text: { content: "Add AI-powered features to Belle Journal for better productivity insights." } }] },
                Status: { select: { name: "In Progress" } },
                ProjectType: { select: { name: "Web" } },
                Priority: { select: { name: "High" } },
                TechStack: { multi_select: [{ name: "React" }, { name: "TypeScript" }, { name: "Node.js" }] },
                EstimatedHours: { number: 80 },
                IsActive: { checkbox: true }
            }
        });

        console.log("✅ Sample project created!");
        
    } catch (error) {
        console.error("❌ Failed to create sample data:", error);
    }
}

// Run setup
createAIDevStandaloneDatabases()
    .then(createSampleData)
    .then(() => {
        console.log("\n🎉 Setup complete! Your databases are ready.");
        console.log("Next steps:");
        console.log("1. Add the environment variables to Replit Secrets");
        console.log("2. Make sure each database is connected to your Notion integration");
        console.log("3. The AI App Development section will sync with these databases");
        process.exit(0);
    })
    .catch((error) => {
        console.error("💥 Setup failed:", error);
        process.exit(1);
    });