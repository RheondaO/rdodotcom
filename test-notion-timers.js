// Test script to check Notion timer sessions database directly
import { Client } from '@notionhq/client';

const notion = new Client({
    auth: process.env.NOTION_INTEGRATION_SECRET,
});

async function testNotionTimerSessions() {
    try {
        console.log("🔍 Testing Notion Timer Sessions Database Access...");
        
        // Extract database ID from environment variable
        const timerSessionsUrl = process.env.NOTION_TIMERSESSIONS_URL;
        if (!timerSessionsUrl) {
            console.log("❌ NOTION_TIMERSESSIONS_URL not found");
            return;
        }
        
        const match = timerSessionsUrl.match(/([a-f0-9]{32})(?:[?#]|$)/i);
        if (!match) {
            console.log("❌ Could not extract database ID from URL");
            return;
        }
        
        const databaseId = match[1];
        console.log("📋 Database ID:", databaseId);
        
        // Query all timer sessions
        const response = await notion.databases.query({
            database_id: databaseId,
            sorts: [
                {
                    property: "Started At",
                    direction: "descending"
                }
            ],
            page_size: 10
        });
        
        console.log("📊 Total timer sessions found:", response.results.length);
        
        response.results.forEach((page, index) => {
            const properties = page.properties;
            console.log(`\n🔷 Session ${index + 1}:`);
            console.log("  - ID:", page.id);
            console.log("  - Title:", properties.Title?.title?.[0]?.plain_text || "No title");
            console.log("  - Mode:", properties.Mode?.select?.name || "No mode");
            console.log("  - Is Active:", properties["Is Active"]?.checkbox || false);
            console.log("  - Started At:", properties["Started At"]?.date?.start || "No date");
        });
        
        // Log the first session's full properties structure to understand schema
        if (response.results.length > 0) {
            console.log("\n📋 Full properties structure of first session:");
            console.log(JSON.stringify(Object.keys(response.results[0].properties), null, 2));
        }
        
        // Get database schema information
        console.log("\n🔧 Getting database schema...");
        const databaseInfo = await notion.databases.retrieve({
            database_id: databaseId
        });
        
        console.log("📋 Available database properties:");
        Object.keys(databaseInfo.properties).forEach(prop => {
            const propType = databaseInfo.properties[prop].type;
            console.log(`  - ${prop}: ${propType}`);
        });
        
    } catch (error) {
        console.error("❌ Error testing Notion timer sessions:", error.message);
        console.error("Full error:", error);
    }
}

testNotionTimerSessions();