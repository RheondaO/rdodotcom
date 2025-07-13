import { Client } from '@notionhq/client';

// Production-specific connection test
async function testProductionConnection() {
    console.log('🚀 Testing Production Notion Connection');
    console.log('=====================================');
    
    // Environment validation
    console.log('Environment Variables:');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- NOTION_INTEGRATION_SECRET exists:', !!process.env.NOTION_INTEGRATION_SECRET);
    console.log('- NOTION_PAGE_URL exists:', !!process.env.NOTION_PAGE_URL);
    
    if (!process.env.NOTION_INTEGRATION_SECRET) {
        console.error('❌ NOTION_INTEGRATION_SECRET is missing');
        return;
    }
    
    if (!process.env.NOTION_PAGE_URL) {
        console.error('❌ NOTION_PAGE_URL is missing');
        return;
    }
    
    // Format validation
    console.log('Format Validation:');
    console.log('- Secret length:', process.env.NOTION_INTEGRATION_SECRET.length);
    console.log('- Secret format valid:', process.env.NOTION_INTEGRATION_SECRET.startsWith('ntn_'));
    console.log('- URL contains notion.so:', process.env.NOTION_PAGE_URL.includes('notion.so'));
    
    // Extract database ID
    function extractPageIdFromUrl(pageUrl) {
        const match = pageUrl.match(/([a-f0-9]{32})(?:[?#]|$)/i);
        if (match && match[1]) {
            return match[1];
        }
        throw new Error("Failed to extract page ID from URL");
    }
    
    try {
        const databaseId = extractPageIdFromUrl(process.env.NOTION_PAGE_URL);
        console.log('✅ Database ID extracted:', databaseId);
    } catch (error) {
        console.error('❌ Failed to extract database ID:', error.message);
        return;
    }
    
    // Test Notion client initialization
    let notion;
    try {
        notion = new Client({
            auth: process.env.NOTION_INTEGRATION_SECRET,
        });
        console.log('✅ Notion client initialized');
    } catch (error) {
        console.error('❌ Failed to initialize Notion client:', error.message);
        return;
    }
    
    // Test basic API call
    try {
        console.log('🔍 Testing basic API access...');
        const databaseId = extractPageIdFromUrl(process.env.NOTION_PAGE_URL);
        
        const database = await notion.databases.retrieve({
            database_id: databaseId,
        });
        
        console.log('✅ Database access successful');
        console.log('- Database title:', database.title?.[0]?.plain_text || 'Unknown');
        console.log('- Database properties:', Object.keys(database.properties || {}));
        
        // Test query
        const response = await notion.databases.query({
            database_id: databaseId,
            page_size: 3,
        });
        
        console.log('✅ Database query successful');
        console.log('- Total entries:', response.results.length);
        
        if (response.results.length > 0) {
            const firstEntry = response.results[0];
            console.log('- Sample entry properties:', Object.keys(firstEntry.properties || {}));
        }
        
    } catch (error) {
        console.error('❌ API test failed:', error.message);
        console.error('- Error code:', error.code);
        console.error('- Error status:', error.status);
        
        // Specific error handling
        if (error.code === 'unauthorized') {
            console.error('🔑 Authentication failed - check your integration secret');
        } else if (error.code === 'object_not_found') {
            console.error('🔗 Database not found - check your page URL');
        } else if (error.code === 'forbidden') {
            console.error('🔒 Access denied - integration may not have permissions');
        }
    }
    
    console.log('🏁 Test complete');
}

// Run the test
testProductionConnection().catch(console.error);