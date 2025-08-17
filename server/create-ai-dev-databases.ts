import { Client } from "@notionhq/client";
import { notion } from "./notion";

// Environment variables validation
if (!process.env.NOTION_INTEGRATION_SECRET) {
    throw new Error("NOTION_INTEGRATION_SECRET is not defined. Please add it to your environment variables.");
}

// Create standalone databases (like existing PRODUCTIVITYTASKS approach)
async function createStandaloneDatabase(title: string, properties: any) {
    console.log(`📋 Creating standalone database: ${title}`);
    
    try {
        // Create database without a parent (standalone workspace database)
        const response = await notion.databases.create({
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
        
        console.log(`✅ Created database: ${title} with ID: ${response.id}`);
        return response;
    } catch (error) {
        console.error(`❌ Failed to create database ${title}:`, error);
        throw error;
    }
}

// Setup AI Development databases as standalone databases
async function setupAIDevDatabases() {
    console.log("🚀 Setting up AI App Development Notion databases as standalone databases...");

    try {
        // Projects Database
        const projectsDb = await createStandaloneDatabase("AI Development Projects", {
            Name: {
                title: {}
            },
            Description: {
                rich_text: {}
            },
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
            StartDate: {
                date: {}
            },
            EndDate: {
                date: {}
            },
            TargetDate: {
                date: {}
            },
            RepositoryUrl: {
                url: {}
            },
            DeploymentUrl: {
                url: {}
            },
            TechStack: {
                multi_select: {
                    options: [
                        { name: "React", color: "blue" },
                        { name: "TypeScript", color: "blue" },
                        { name: "Node.js", color: "green" },
                        { name: "Express", color: "gray" },
                        { name: "PostgreSQL", color: "blue" },
                        { name: "Tailwind CSS", color: "blue" },
                        { name: "Vite", color: "purple" },
                        { name: "Drizzle ORM", color: "green" }
                    ]
                }
            },
            EstimatedHours: {
                number: {}
            },
            ActualHours: {
                number: {}
            },
            IsActive: {
                checkbox: {}
            }
        });

        // Tasks Database
        const tasksDb = await createStandaloneDatabase("AI Development Tasks", {
            Title: {
                title: {}
            },
            Description: {
                rich_text: {}
            },
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
            ProjectId: {
                rich_text: {} // Will store project ID reference
            },
            DueDate: {
                date: {}
            },
            EstimatedHours: {
                number: {}
            },
            ActualHours: {
                number: {}
            },
            CompletedDate: {
                date: {}
            }
        });

        // Test Items Database
        const testItemsDb = await createStandaloneDatabase("AI Development Test Items", {
            TestName: {
                title: {}
            },
            Description: {
                rich_text: {}
            },
            TestType: {
                select: {
                    options: [
                        { name: "Unit Test", color: "blue" },
                        { name: "Integration Test", color: "green" },
                        { name: "E2E Test", color: "purple" },
                        { name: "Performance Test", color: "orange" },
                        { name: "Security Test", color: "red" },
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
            ProjectId: {
                rich_text: {} // Will store project ID reference
            },
            TestEnvironment: {
                select: {
                    options: [
                        { name: "Development", color: "blue" },
                        { name: "Staging", color: "orange" },
                        { name: "Production", color: "red" }
                    ]
                }
            },
            ExpectedResult: {
                rich_text: {}
            },
            ActualResult: {
                rich_text: {}
            },
            LastRun: {
                date: {}
            },
            ExecutionTime: {
                number: {}
            }
        });

        // Library Database (for prompts as attachments)
        const libraryDb = await createStandaloneDatabase("AI Development Library", {
            PromptName: {
                title: {}
            },
            Description: {
                rich_text: {}
            },
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
            CreatedDate: {
                date: {}
            },
            LastUsed: {
                date: {}
            },
            PromptFile: {
                files: {} // This will store the .txt file attachments
            },
            Notes: {
                rich_text: {}
            }
        });

        console.log("✅ All AI App Development databases created successfully!");
        console.log("\n📋 Database URLs:");
        console.log(`Projects: https://notion.so/${projectsDb.id.replace(/-/g, '')}`);
        console.log(`Tasks: https://notion.so/${tasksDb.id.replace(/-/g, '')}`);
        console.log(`Test Items: https://notion.so/${testItemsDb.id.replace(/-/g, '')}`);
        console.log(`Library: https://notion.so/${libraryDb.id.replace(/-/g, '')}`);
        
        console.log("\n⚙️ Environment Variables to Add:");
        console.log(`NOTION_AI_PROJECTS_URL=https://notion.so/${projectsDb.id.replace(/-/g, '')}`);
        console.log(`NOTION_AI_TASKS_URL=https://notion.so/${tasksDb.id.replace(/-/g, '')}`);
        console.log(`NOTION_AI_TESTITEMS_URL=https://notion.so/${testItemsDb.id.replace(/-/g, '')}`);
        console.log(`NOTION_AI_LIBRARY_URL=https://notion.so/${libraryDb.id.replace(/-/g, '')}`);

        return {
            projectsDb,
            tasksDb,
            testItemsDb,
            libraryDb
        };
    } catch (error) {
        console.error("💥 Setup failed:", error);
        throw error;
    }
}

// Add sample data
async function createSampleData(databases: any) {
    console.log("📝 Creating sample AI Development data...");

    try {
        // Create a sample project
        const sampleProject = await notion.pages.create({
            parent: {
                database_id: databases.projectsDb.id
            },
            properties: {
                Name: {
                    title: [
                        {
                            text: {
                                content: "Belle Journal AI Enhancement"
                            }
                        }
                    ]
                },
                Description: {
                    rich_text: [
                        {
                            text: {
                                content: "Enhance Belle Journal with AI-powered features for better productivity tracking and analytics."
                            }
                        }
                    ]
                },
                Status: {
                    select: {
                        name: "In Progress"
                    }
                },
                ProjectType: {
                    select: {
                        name: "Web"
                    }
                },
                Priority: {
                    select: {
                        name: "High"
                    }
                },
                TechStack: {
                    multi_select: [
                        { name: "React" },
                        { name: "TypeScript" },
                        { name: "Node.js" }
                    ]
                },
                EstimatedHours: {
                    number: 80
                },
                IsActive: {
                    checkbox: true
                }
            }
        });

        console.log("✅ Sample data created successfully!");
        
    } catch (error) {
        console.error("❌ Failed to create sample data:", error);
    }
}

// Run the setup
setupAIDevDatabases()
    .then((databases) => {
        return createSampleData(databases);
    })
    .then(() => {
        console.log("\n🎉 AI Development Notion setup complete!");
        console.log("Next steps:");
        console.log("1. Copy the environment variables above to your .env file");
        console.log("2. Update your app-development-notion.ts to use the new database URLs");
        console.log("3. Test the integration with the AI App Development section");
        process.exit(0);
    })
    .catch((error) => {
        console.error("💥 Setup failed:", error);
        process.exit(1);
    });