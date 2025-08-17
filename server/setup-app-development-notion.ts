import { Client } from "@notionhq/client";
import { notion } from "./notion";

// Extract the page ID from the Notion page URL
function extractPageIdFromUrl(pageUrl: string): string {
    const match = pageUrl.match(/([a-f0-9]{32})(?:[?#]|$)/i);
    if (match && match[1]) {
        return match[1];
    }
    throw Error("Failed to extract page ID");
}

// Use separate environment variable for AI Development page
const AI_DEV_PAGE_URL = process.env.NOTION_AI_DEV_PAGE_URL || process.env.NOTION_PAGE_URL!;
const APP_DEV_PAGE_ID = extractPageIdFromUrl(AI_DEV_PAGE_URL);

// Create a database under the app development page
async function createAppDevDatabase(title: string, properties: any) {
    console.log(`📋 Creating database: ${title}`);
    return await notion.databases.create({
        parent: {
            type: "page_id",
            page_id: APP_DEV_PAGE_ID
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

// Find databases under the app development page
async function findAppDevDatabaseByTitle(title: string) {
    try {
        const response = await notion.blocks.children.list({
            block_id: APP_DEV_PAGE_ID,
        });

        for (const block of response.results) {
            if (block.type === "child_database") {
                const databaseInfo = await notion.databases.retrieve({
                    database_id: block.id,
                });

                const dbTitle = (databaseInfo as any).title?.[0]?.plain_text?.toLowerCase() || "";
                if (dbTitle === title.toLowerCase()) {
                    return databaseInfo;
                }
            }
        }
        return null;
    } catch (error) {
        console.error(`Error finding database ${title}:`, error);
        return null;
    }
}

// Environment variables validation
if (!process.env.NOTION_INTEGRATION_SECRET) {
    throw new Error("NOTION_INTEGRATION_SECRET is not defined. Please add it to your environment variables.");
}

if (!process.env.NOTION_AI_DEV_PAGE_URL && !process.env.NOTION_PAGE_URL) {
    throw new Error("NOTION_AI_DEV_PAGE_URL or NOTION_PAGE_URL must be defined. Please add it to your environment variables.");
}

// Setup databases for AI App Development section
async function setupAppDevelopmentNotionDatabases() {
    console.log("🚀 Setting up AI App Development Notion databases...");
    console.log("📍 Using page ID:", APP_DEV_PAGE_ID);
    
    // Check if the parent is actually a page
    try {
        const parentCheck = await notion.pages.retrieve({ page_id: APP_DEV_PAGE_ID });
        console.log("✅ Confirmed parent is a page:", parentCheck.object);
    } catch (error) {
        console.log("❌ Parent might not be a page, checking if it's a database...");
        try {
            const dbCheck = await notion.databases.retrieve({ database_id: APP_DEV_PAGE_ID });
            console.log("❌ ERROR: Parent is a database, not a page:", dbCheck.object);
            throw new Error("Cannot create databases under a database. Please provide a Notion page URL, not a database URL.");
        } catch (dbError) {
            console.log("❌ Unknown parent type error:", error);
            throw error;
        }
    }

    // Projects Database
    await createAppDevDatabase("App Development Projects", {
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
                    { name: "High", color: "red" }
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
        ActualHours: {
            number: {}
        },
        IsActive: {
            checkbox: {}
        }
    });

    // Tasks Database
    await createAppDevDatabase("App Development Tasks", {
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
        AssignedProject: {
            relation: {
                database_id: "" // Will be updated after projects database is created
            }
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
    await createAppDevDatabase("App Development Test Items", {
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
        AssignedProject: {
            relation: {
                database_id: "" // Will be updated after projects database is created
            }
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
    await createAppDevDatabase("App Development Library", {
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
}

async function createSampleAppDevelopmentData() {
    try {
        console.log("📝 Adding sample data for AI App Development...");

        // Find the databases
        const projectsDb = await findAppDevDatabaseByTitle("App Development Projects");
        const tasksDb = await findAppDevDatabaseByTitle("App Development Tasks");
        const testItemsDb = await findAppDevDatabaseByTitle("App Development Test Items");
        const libraryDb = await findAppDevDatabaseByTitle("App Development Library");

        if (!projectsDb || !tasksDb || !testItemsDb || !libraryDb) {
            throw new Error("Could not find all required databases.");
        }

        // Sample Projects
        const sampleProjects = [
            {
                name: "Belle Journal Enhancement",
                description: "Adding new features to the comprehensive wellness platform",
                status: "In Progress",
                projectType: "Web",
                priority: "High",
                startDate: "2025-01-15",
                targetDate: "2025-03-01",
                repositoryUrl: "https://github.com/user/belle-journal",
                techStack: ["React", "TypeScript", "Tailwind CSS", "Express"]
            },
            {
                name: "Mobile App Development",
                description: "Creating a mobile companion app for Belle Journal",
                status: "Planning",
                projectType: "Mobile",
                priority: "Medium",
                startDate: "2025-02-01",
                targetDate: "2025-05-01",
                techStack: ["React", "TypeScript"]
            }
        ];

        for (let project of sampleProjects) {
            await notion.pages.create({
                parent: {
                    database_id: projectsDb.id
                },
                properties: {
                    Name: {
                        title: [{ text: { content: project.name } }]
                    },
                    Description: {
                        rich_text: [{ text: { content: project.description } }]
                    },
                    Status: {
                        select: { name: project.status }
                    },
                    ProjectType: {
                        select: { name: project.projectType }
                    },
                    Priority: {
                        select: { name: project.priority }
                    },
                    StartDate: {
                        date: { start: project.startDate }
                    },
                    TargetDate: {
                        date: { start: project.targetDate }
                    },
                    RepositoryUrl: project.repositoryUrl ? {
                        url: project.repositoryUrl
                    } : undefined,
                    TechStack: {
                        multi_select: project.techStack.map(tech => ({ name: tech }))
                    },
                    IsActive: {
                        checkbox: project.status === "In Progress"
                    }
                }
            });
        }

        // Sample Tasks
        const sampleTasks = [
            {
                title: "Implement user authentication",
                description: "Add secure login and registration functionality",
                status: "In Progress",
                priority: "High",
                category: "Backend",
                dueDate: "2025-01-25",
                estimatedHours: 16
            },
            {
                title: "Create responsive dashboard",
                description: "Design and implement the main dashboard interface",
                status: "Todo",
                priority: "High",
                category: "Frontend",
                dueDate: "2025-01-30",
                estimatedHours: 24
            },
            {
                title: "Setup database migrations",
                description: "Create and configure database migration system",
                status: "Done",
                priority: "Medium",
                category: "Database",
                estimatedHours: 8,
                actualHours: 6,
                completedDate: "2025-01-10"
            }
        ];

        for (let task of sampleTasks) {
            await notion.pages.create({
                parent: {
                    database_id: tasksDb.id
                },
                properties: {
                    Title: {
                        title: [{ text: { content: task.title } }]
                    },
                    Description: {
                        rich_text: [{ text: { content: task.description } }]
                    },
                    Status: {
                        select: { name: task.status }
                    },
                    Priority: {
                        select: { name: task.priority }
                    },
                    Category: {
                        select: { name: task.category }
                    },
                    DueDate: task.dueDate ? {
                        date: { start: task.dueDate }
                    } : undefined,
                    EstimatedHours: {
                        number: task.estimatedHours
                    },
                    ActualHours: task.actualHours ? {
                        number: task.actualHours
                    } : undefined,
                    CompletedDate: task.completedDate ? {
                        date: { start: task.completedDate }
                    } : undefined
                }
            });
        }

        // Sample Test Items
        const sampleTestItems = [
            {
                testName: "User Login Flow",
                description: "Test complete user authentication process",
                testType: "E2E Test",
                status: "Passed",
                priority: "High",
                testEnvironment: "Development",
                expectedResult: "User can successfully log in with valid credentials",
                actualResult: "Login successful, redirected to dashboard",
                lastRun: "2025-01-15",
                executionTime: 45
            },
            {
                testName: "API Response Time",
                description: "Measure API endpoint response times",
                testType: "Performance Test",
                status: "In Progress",
                priority: "Medium",
                testEnvironment: "Staging",
                expectedResult: "API responses under 200ms",
                lastRun: "2025-01-16",
                executionTime: 120
            }
        ];

        for (let testItem of sampleTestItems) {
            await notion.pages.create({
                parent: {
                    database_id: testItemsDb.id
                },
                properties: {
                    TestName: {
                        title: [{ text: { content: testItem.testName } }]
                    },
                    Description: {
                        rich_text: [{ text: { content: testItem.description } }]
                    },
                    TestType: {
                        select: { name: testItem.testType }
                    },
                    Status: {
                        select: { name: testItem.status }
                    },
                    Priority: {
                        select: { name: testItem.priority }
                    },
                    TestEnvironment: {
                        select: { name: testItem.testEnvironment }
                    },
                    ExpectedResult: {
                        rich_text: [{ text: { content: testItem.expectedResult } }]
                    },
                    ActualResult: {
                        rich_text: [{ text: { content: testItem.actualResult } }]
                    },
                    LastRun: {
                        date: { start: testItem.lastRun }
                    },
                    ExecutionTime: {
                        number: testItem.executionTime
                    }
                }
            });
        }

        // Sample Library Items (without file attachments for now)
        const sampleLibraryItems = [
            {
                promptName: "React Component Generator",
                description: "Generate React functional components with TypeScript",
                category: "Code Generation",
                tags: ["React", "TypeScript", "Frontend"],
                usage: "Frequently Used",
                createdDate: "2025-01-01",
                lastUsed: "2025-01-16",
                notes: "Useful for creating consistent component structure"
            },
            {
                promptName: "API Endpoint Documentation",
                description: "Generate comprehensive API documentation",
                category: "Documentation",
                tags: ["API", "Backend", "Documentation"],
                usage: "Occasionally Used",
                createdDate: "2025-01-05",
                lastUsed: "2025-01-12",
                notes: "Helps maintain consistent API docs"
            }
        ];

        for (let libraryItem of sampleLibraryItems) {
            await notion.pages.create({
                parent: {
                    database_id: libraryDb.id
                },
                properties: {
                    PromptName: {
                        title: [{ text: { content: libraryItem.promptName } }]
                    },
                    Description: {
                        rich_text: [{ text: { content: libraryItem.description } }]
                    },
                    Category: {
                        select: { name: libraryItem.category }
                    },
                    Tags: {
                        multi_select: libraryItem.tags.map(tag => ({ name: tag }))
                    },
                    Usage: {
                        select: { name: libraryItem.usage }
                    },
                    CreatedDate: {
                        date: { start: libraryItem.createdDate }
                    },
                    LastUsed: {
                        date: { start: libraryItem.lastUsed }
                    },
                    Notes: {
                        rich_text: [{ text: { content: libraryItem.notes } }]
                    }
                }
            });
        }

        console.log("✅ Sample data creation complete!");
    } catch (error) {
        console.error("❌ Error creating sample data:", error);
        throw error;
    }
}

// Run the setup
setupAppDevelopmentNotionDatabases().then(() => {
    return createSampleAppDevelopmentData();
}).then(() => {
    console.log("🎉 AI App Development Notion setup complete!");
    process.exit(0);
}).catch(error => {
    console.error("💥 Setup failed:", error);
    process.exit(1);
});