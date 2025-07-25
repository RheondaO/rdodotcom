// Test creating a timer session directly in Notion
import { Client } from '@notionhq/client';

const notion = new Client({
    auth: process.env.NOTION_INTEGRATION_SECRET,
});

const timerSessionsUrl = process.env.NOTION_TIMERSESSIONS_URL;
const match = timerSessionsUrl.match(/([a-f0-9]{32})(?:[?#]|$)/i);
const databaseId = match[1];

async function testCreateTimer() {
    try {
        console.log("🧪 Testing direct Notion timer creation...");
        
        const testSession = await notion.pages.create({
            parent: {
                database_id: databaseId
            },
            properties: {
                "Title": {
                    title: [
                        {
                            text: {
                                content: "Direct API Test Timer"
                            }
                        }
                    ]
                },
                "Mode": {
                    select: {
                        name: "test"
                    }
                },
                "Category": {
                    select: {
                        name: "Testing"
                    }
                },
                "Total Duration": {
                    number: 30
                },
                "Remaining Time": {
                    number: 30
                },
                "Current Session": {
                    number: 1
                },
                "Total Sessions": {
                    number: 1
                },
                "Completed Sessions": {
                    number: 0
                },
                "Is Break": {
                    checkbox: false
                },
                "Is Active": {
                    checkbox: true
                },
                "Total Focus Time": {
                    number: 0
                },
                "Started At": {
                    date: {
                        start: new Date().toISOString()
                    }
                },
                "Last Sync": {
                    date: {
                        start: new Date().toISOString()
                    }
                }
            }
        });
        
        console.log("✅ Successfully created timer directly in Notion:", testSession.id);
        
        // Verify it appears in queries
        const response = await notion.databases.query({
            database_id: databaseId,
            sorts: [
                {
                    property: "Started At",
                    direction: "descending"
                }
            ],
            page_size: 1
        });
        
        if (response.results.length > 0) {
            const latestSession = response.results[0];
            const title = latestSession.properties.Title?.title?.[0]?.plain_text;
            console.log("🔍 Latest session in database:", title);
            console.log("📋 Session ID:", latestSession.id);
        }
        
        // Clean up
        await notion.pages.update({
            page_id: testSession.id,
            archived: true
        });
        console.log("🗑️ Test session cleaned up");
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

testCreateTimer();