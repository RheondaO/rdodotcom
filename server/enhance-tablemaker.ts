import { notion, NOTION_DATABASE_ID } from "./notion";

// Environment variables validation
if (!process.env.NOTION_INTEGRATION_SECRET) {
    throw new Error("NOTION_INTEGRATION_SECRET is not defined. Please add it to your environment variables.");
}

// Enhance TABLEMAKER database with productivity task fields
async function enhanceTablemakerDatabase() {
    console.log("Enhancing TABLEMAKER database for productivity tasks...");

    try {
        // Get current database properties
        const database = await notion.databases.retrieve({
            database_id: NOTION_DATABASE_ID
        });

        console.log("Current database properties:", Object.keys(database.properties));

        // Add new properties to the existing TABLEMAKER database
        const updatedDatabase = await notion.databases.update({
            database_id: NOTION_DATABASE_ID,
            properties: {
                // Keep existing Name property
                Name: {
                    title: {}
                },
                // Add new properties for productivity tasks
                Description: {
                    rich_text: {}
                },
                Category: {
                    select: {
                        options: [
                            { name: "Personal", color: "blue" },
                            { name: "Work", color: "green" },
                            { name: "Health", color: "pink" },
                            { name: "Finance", color: "yellow" },
                            { name: "Content", color: "orange" },
                            { name: "Learning", color: "purple" },
                            { name: "Projects", color: "red" },
                            { name: "Habits", color: "gray" }
                        ]
                    }
                },
                "Estimated Duration": {
                    number: {
                        format: "number"
                    }
                },
                "Created DateTime": {
                    created_time: {}
                },
                "Due DateTime": {
                    date: {}
                },
                Status: {
                    select: {
                        options: [
                            { name: "To Do", color: "gray" },
                            { name: "In Progress", color: "blue" },
                            { name: "Done", color: "green" },
                            { name: "Blocked", color: "red" }
                        ]
                    }
                },
                Priority: {
                    select: {
                        options: [
                            { name: "High", color: "red" },
                            { name: "Medium", color: "yellow" },
                            { name: "Low", color: "green" }
                        ]
                    }
                },
                Completed: {
                    checkbox: {}
                },
                "Completed At": {
                    date: {}
                }
            }
        });

        console.log("Successfully enhanced TABLEMAKER database!");
        console.log("New properties added:", Object.keys(updatedDatabase.properties));

        return updatedDatabase;
    } catch (error) {
        console.error("Error enhancing TABLEMAKER database:", error);
        throw error;
    }
}

// Add sample productivity tasks
async function addSampleTasks() {
    try {
        console.log("Adding sample productivity tasks...");

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const sampleTasks = [
            {
                title: "Review daily dashboard",
                description: "Check productivity metrics and plan the day",
                category: "Personal",
                estimatedDuration: 15,
                dueDate: today,
                priority: "Medium",
                status: "To Do"
            },
            {
                title: "Complete project proposal",
                description: "Finalize the Q4 project proposal document",
                category: "Work",
                estimatedDuration: 120,
                dueDate: tomorrow,
                priority: "High",
                status: "In Progress"
            },
            {
                title: "Update task tracking system",
                description: "Completed integration with Notion database",
                category: "Projects",
                estimatedDuration: 180,
                dueDate: yesterday,
                priority: "Medium",
                status: "Done"
            },
            {
                title: "Exercise routine",
                description: "30-minute workout session",
                category: "Health",
                estimatedDuration: 30,
                dueDate: today,
                priority: "High",
                status: "To Do"
            }
        ];

        for (const task of sampleTasks) {
            await notion.pages.create({
                parent: {
                    database_id: NOTION_DATABASE_ID
                },
                properties: {
                    Name: {
                        title: [
                            {
                                text: {
                                    content: task.title
                                }
                            }
                        ]
                    },
                    Description: {
                        rich_text: [
                            {
                                text: {
                                    content: task.description
                                }
                            }
                        ]
                    },
                    Category: {
                        select: {
                            name: task.category
                        }
                    },
                    "Estimated Duration": {
                        number: task.estimatedDuration
                    },
                    "Due DateTime": {
                        date: {
                            start: task.dueDate.toISOString().split('T')[0]
                        }
                    },
                    Priority: {
                        select: {
                            name: task.priority
                        }
                    },
                    Status: {
                        select: {
                            name: task.status
                        }
                    },
                    Completed: {
                        checkbox: task.status === "Done"
                    },
                    ...(task.status === "Done" && {
                        "Completed At": {
                            date: {
                                start: task.dueDate.toISOString().split('T')[0]
                            }
                        }
                    })
                }
            });

            console.log(`Created task: ${task.title}`);
        }

        console.log("Sample productivity tasks added successfully!");
    } catch (error) {
        console.error("Error adding sample tasks:", error);
        throw error;
    }
}

// Run the enhancement
enhanceTablemakerDatabase()
    .then(() => addSampleTasks())
    .then(() => {
        console.log("\n✅ TABLEMAKER database enhancement complete!");
        console.log("Your database now supports:");
        console.log("- Task title and description");
        console.log("- Categories (Personal, Work, Health, etc.)");
        console.log("- Estimated duration in minutes");
        console.log("- Created and due date/time tracking");
        console.log("- Priority levels and status tracking");
        console.log("- Completion tracking");
        console.log("\nReady for Belle Journal Productivity widget integration!");
        process.exit(0);
    })
    .catch(error => {
        console.error("Enhancement failed:", error);
        process.exit(1);
    });