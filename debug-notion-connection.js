import { Client } from '@notionhq/client';

// Debug script to test Notion connection with detailed error reporting
async function debugNotionConnection() {
    console.log('🔧 Debugging Notion Connection');
    console.log('================================');
    
    // Check environment variables
    console.log('Environment Variables:');
    console.log('NOTION_INTEGRATION_SECRET configured:', !!process.env.NOTION_INTEGRATION_SECRET);
    console.log('NOTION_PAGE_URL configured:', !!process.env.NOTION_PAGE_URL);
    
    if (!process.env.NOTION_INTEGRATION_SECRET) {
        console.error('❌ NOTION_INTEGRATION_SECRET is missing');
        return;
    }
    
    if (!process.env.NOTION_PAGE_URL) {
        console.error('❌ NOTION_PAGE_URL is missing');
        return;
    }
    
    // Initialize client
    const notion = new Client({
        auth: process.env.NOTION_INTEGRATION_SECRET,
    });
    
    // Extract database ID from URL
    function extractPageIdFromUrl(pageUrl) {
        const match = pageUrl.match(/([a-f0-9]{32})(?:[?#]|$)/i);
        if (match && match[1]) {
            return match[1];
        }
        throw new Error("Failed to extract page ID from URL");
    }
    
    try {
        const databaseId = extractPageIdFromUrl(process.env.NOTION_PAGE_URL);
        console.log('✅ Successfully extracted database ID:', databaseId);
        
        // Test database access
        console.log('🔍 Testing database access...');
        const database = await notion.databases.retrieve({
            database_id: databaseId,
        });
        
        console.log('✅ Database access successful!');
        console.log('Database title:', database.title?.[0]?.plain_text || 'Unknown');
        console.log('Database ID:', database.id);
        
        // Test querying database
        console.log('🔍 Testing database query...');
        const response = await notion.databases.query({
            database_id: databaseId,
            page_size: 5,
        });
        
        console.log('✅ Database query successful!');
        console.log('Number of entries found:', response.results.length);
        
        if (response.results.length > 0) {
            console.log('Sample entry:', {
                id: response.results[0].id,
                properties: Object.keys(response.results[0].properties),
            });
        }
        
    } catch (error) {
        console.error('❌ Connection test failed:', error.message);
        console.error('Error code:', error.code);
        console.error('Error status:', error.status);
        
        if (error.code === 'unauthorized') {
            console.error('🔑 The integration secret is invalid or expired');
            console.error('Solution: Generate a new integration secret at https://www.notion.so/my-integrations');
        } else if (error.code === 'object_not_found') {
            console.error('🔗 The database URL is incorrect or the database doesn\'t exist');
            console.error('Solution: Verify the NOTION_PAGE_URL points to your TABLEMAKER database');
        } else if (error.code === 'forbidden') {
            console.error('🔒 The integration doesn\'t have permission to access this database');
            console.error('Solution: Share the database with your integration from within Notion');
        } else {
            console.error('🔧 Unknown error occurred');
            console.error('Full error details:', error);
        }
    }
}

// Run the debug script
debugNotionConnection().catch(console.error);