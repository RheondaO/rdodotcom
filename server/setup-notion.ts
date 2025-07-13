import { notion, NOTION_PAGE_ID, createDatabaseIfNotExists, findDatabaseByTitle } from "./notion";

// Environment variables validation
if (!process.env.NOTION_INTEGRATION_SECRET) {
    throw new Error("NOTION_INTEGRATION_SECRET is not defined. Please add it to your environment variables.");
}

if (!process.env.NOTION_PAGE_URL) {
    throw new Error("NOTION_PAGE_URL is not defined. Please add it to your environment variables.");
}

// Setup databases for Belle Journal
async function setupNotionDatabases() {
    console.log("Setting up Notion databases...");

    // Create Tasks database
    await createDatabaseIfNotExists("Belle Journal Tasks", {
        Title: {
            title: {}
        },
        Description: {
            rich_text: {}
        },
        Section: {
            select: {
                options: [
                    { name: "Personal", color: "blue" },
                    { name: "Work", color: "green" },
                    { name: "Health", color: "pink" },
                    { name: "Finance", color: "yellow" },
                    { name: "Content", color: "orange" },
                    { name: "Learning", color: "purple" },
                    { name: "Uncategorized", color: "gray" }
                ]
            }
        },
        Completed: {
            checkbox: {}
        },
        DueDate: {
            date: {}
        },
        CompletedAt: {
            date: {}
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
        Status: {
            select: {
                options: [
                    { name: "To Do", color: "gray" },
                    { name: "In Progress", color: "blue" },
                    { name: "Done", color: "green" },
                    { name: "Blocked", color: "red" }
                ]
            }
        }
    });

    // Create Habits database
    await createDatabaseIfNotExists("Belle Journal Habits", {
        Title: {
            title: {}
        },
        Description: {
            rich_text: {}
        },
        Category: {
            select: {
                options: [
                    { name: "Health", color: "pink" },
                    { name: "Productivity", color: "blue" },
                    { name: "Wellness", color: "green" },
                    { name: "Learning", color: "purple" },
                    { name: "Finance", color: "yellow" },
                    { name: "Social", color: "orange" }
                ]
            }
        },
        Frequency: {
            select: {
                options: [
                    { name: "Daily", color: "green" },
                    { name: "Weekly", color: "blue" },
                    { name: "Monthly", color: "purple" }
                ]
            }
        },
        CurrentStreak: {
            number: {}
        },
        BestStreak: {
            number: {}
        },
        IsActive: {
            checkbox: {}
        },
        LastCompleted: {
            date: {}
        }
    });

    // Create Goals database
    await createDatabaseIfNotExists("Belle Journal Goals", {
        Title: {
            title: {}
        },
        Description: {
            rich_text: {}
        },
        Category: {
            select: {
                options: [
                    { name: "Health", color: "pink" },
                    { name: "Career", color: "blue" },
                    { name: "Finance", color: "yellow" },
                    { name: "Learning", color: "purple" },
                    { name: "Personal", color: "green" },
                    { name: "Relationships", color: "orange" }
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
        Status: {
            select: {
                options: [
                    { name: "Not Started", color: "gray" },
                    { name: "In Progress", color: "blue" },
                    { name: "Completed", color: "green" },
                    { name: "On Hold", color: "yellow" },
                    { name: "Cancelled", color: "red" }
                ]
            }
        },
        Progress: {
            number: {}
        },
        Target: {
            number: {}
        },
        DueDate: {
            date: {}
        },
        CompletedAt: {
            date: {}
        }
    });

    // Create Journal Entries database
    await createDatabaseIfNotExists("Belle Journal Entries", {
        Title: {
            title: {}
        },
        Date: {
            date: {}
        },
        Content: {
            rich_text: {}
        },
        Mood: {
            select: {
                options: [
                    { name: "Great", color: "green" },
                    { name: "Good", color: "blue" },
                    { name: "Okay", color: "yellow" },
                    { name: "Bad", color: "orange" },
                    { name: "Terrible", color: "red" }
                ]
            }
        },
        EnergyLevel: {
            select: {
                options: [
                    { name: "Very High", color: "green" },
                    { name: "High", color: "blue" },
                    { name: "Medium", color: "yellow" },
                    { name: "Low", color: "orange" },
                    { name: "Very Low", color: "red" }
                ]
            }
        },
        SleepHours: {
            number: {}
        },
        WaterIntake: {
            number: {}
        },
        Exercise: {
            checkbox: {}
        },
        Meditation: {
            checkbox: {}
        },
        Gratitude: {
            rich_text: {}
        },
        Reflection: {
            rich_text: {}
        }
    });

    console.log("Notion databases setup complete!");
}

async function createSampleData() {
    try {
        console.log("Adding sample data...");

        // Find the databases
        const tasksDb = await findDatabaseByTitle("Belle Journal Tasks");
        const habitsDb = await findDatabaseByTitle("Belle Journal Habits");
        const goalsDb = await findDatabaseByTitle("Belle Journal Goals");
        const journalDb = await findDatabaseByTitle("Belle Journal Entries");

        if (!tasksDb || !habitsDb || !goalsDb || !journalDb) {
            throw new Error("Could not find the required databases.");
        }

        // Sample tasks
        const tasks = [
            {
                title: "Review monthly budget",
                description: "Analyze spending patterns and adjust budget for next month",
                section: "Finance",
                priority: "High"
            },
            {
                title: "Write blog post about productivity",
                description: "Share insights on time management and focus techniques",
                section: "Content",
                priority: "Medium"
            },
            {
                title: "Schedule annual health checkup",
                description: "Book appointment with doctor for routine health screening",
                section: "Health",
                priority: "Medium"
            },
            {
                title: "Complete online course module",
                description: "Finish module 3 of the web development course",
                section: "Learning",
                priority: "Low"
            }
        ];

        for (let task of tasks) {
            await notion.pages.create({
                parent: {
                    database_id: tasksDb.id
                },
                properties: {
                    Title: {
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
                    Section: {
                        select: {
                            name: task.section
                        }
                    },
                    Completed: {
                        checkbox: false
                    },
                    Priority: {
                        select: {
                            name: task.priority
                        }
                    },
                    Status: {
                        select: {
                            name: "To Do"
                        }
                    }
                }
            });
        }

        // Sample habits
        const habits = [
            {
                title: "Daily meditation",
                description: "10 minutes of mindfulness meditation",
                category: "Wellness",
                frequency: "Daily",
                currentStreak: 5,
                bestStreak: 12
            },
            {
                title: "Exercise",
                description: "30 minutes of physical activity",
                category: "Health",
                frequency: "Daily",
                currentStreak: 3,
                bestStreak: 21
            },
            {
                title: "Read for 30 minutes",
                description: "Read books or articles for personal development",
                category: "Learning",
                frequency: "Daily",
                currentStreak: 7,
                bestStreak: 15
            }
        ];

        for (let habit of habits) {
            await notion.pages.create({
                parent: {
                    database_id: habitsDb.id
                },
                properties: {
                    Title: {
                        title: [
                            {
                                text: {
                                    content: habit.title
                                }
                            }
                        ]
                    },
                    Description: {
                        rich_text: [
                            {
                                text: {
                                    content: habit.description
                                }
                            }
                        ]
                    },
                    Category: {
                        select: {
                            name: habit.category
                        }
                    },
                    Frequency: {
                        select: {
                            name: habit.frequency
                        }
                    },
                    CurrentStreak: {
                        number: habit.currentStreak
                    },
                    BestStreak: {
                        number: habit.bestStreak
                    },
                    IsActive: {
                        checkbox: true
                    }
                }
            });
        }

        // Sample goals
        const goals = [
            {
                title: "Save $10,000 for emergency fund",
                description: "Build up emergency savings to cover 6 months of expenses",
                category: "Finance",
                priority: "High",
                status: "In Progress",
                progress: 3500,
                target: 10000
            },
            {
                title: "Complete web development certification",
                description: "Finish online course and obtain certification",
                category: "Learning",
                priority: "Medium",
                status: "In Progress",
                progress: 60,
                target: 100
            },
            {
                title: "Run a 5K race",
                description: "Train for and complete a 5K running race",
                category: "Health",
                priority: "Medium",
                status: "Not Started",
                progress: 0,
                target: 1
            }
        ];

        for (let goal of goals) {
            await notion.pages.create({
                parent: {
                    database_id: goalsDb.id
                },
                properties: {
                    Title: {
                        title: [
                            {
                                text: {
                                    content: goal.title
                                }
                            }
                        ]
                    },
                    Description: {
                        rich_text: [
                            {
                                text: {
                                    content: goal.description
                                }
                            }
                        ]
                    },
                    Category: {
                        select: {
                            name: goal.category
                        }
                    },
                    Priority: {
                        select: {
                            name: goal.priority
                        }
                    },
                    Status: {
                        select: {
                            name: goal.status
                        }
                    },
                    Progress: {
                        number: goal.progress
                    },
                    Target: {
                        number: goal.target
                    }
                }
            });
        }

        // Sample journal entry
        const today = new Date();
        await notion.pages.create({
            parent: {
                database_id: journalDb.id
            },
            properties: {
                Title: {
                    title: [
                        {
                            text: {
                                content: `Journal Entry - ${today.toLocaleDateString()}`
                            }
                        }
                    ]
                },
                Date: {
                    date: {
                        start: today.toISOString().split('T')[0]
                    }
                },
                Content: {
                    rich_text: [
                        {
                            text: {
                                content: "Today was a productive day. I made progress on several goals and maintained my daily habits. Looking forward to continuing this momentum tomorrow."
                            }
                        }
                    ]
                },
                Mood: {
                    select: {
                        name: "Good"
                    }
                },
                EnergyLevel: {
                    select: {
                        name: "High"
                    }
                },
                SleepHours: {
                    number: 7.5
                },
                WaterIntake: {
                    number: 8
                },
                Exercise: {
                    checkbox: true
                },
                Meditation: {
                    checkbox: true
                },
                Gratitude: {
                    rich_text: [
                        {
                            text: {
                                content: "Grateful for good health, supportive friends, and the opportunity to learn new things."
                            }
                        }
                    ]
                },
                Reflection: {
                    rich_text: [
                        {
                            text: {
                                content: "I'm noticing that my morning routine really sets the tone for the entire day. When I start with meditation and exercise, I feel more focused and energized."
                            }
                        }
                    ]
                }
            }
        });

        console.log("Sample data creation complete.");
    } catch (error) {
        console.error("Error creating sample data:", error);
    }
}

// Run the setup
setupNotionDatabases().then(() => {
    return createSampleData();
}).then(() => {
    console.log("Setup complete!");
    process.exit(0);
}).catch(error => {
    console.error("Setup failed:", error);
    process.exit(1);
});