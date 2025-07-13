import express from 'express';
import { Client } from '@notionhq/client';

// Production-specific fix for Notion connection issues
const app = express();

// Test endpoint to verify production environment
app.get('/api/notion/production-test', async (req, res) => {
    try {
        const results = {
            environment: process.env.NODE_ENV,
            hasSecret: !!process.env.NOTION_INTEGRATION_SECRET,
            hasUrl: !!process.env.NOTION_PAGE_URL,
            timestamp: new Date().toISOString(),
            tests: []
        };
        
        // Test 1: Environment variable validation
        if (!process.env.NOTION_INTEGRATION_SECRET) {
            results.tests.push({
                name: 'Environment Variables',
                status: 'FAILED',
                error: 'NOTION_INTEGRATION_SECRET not configured'
            });
            return res.json(results);
        }
        
        if (!process.env.NOTION_PAGE_URL) {
            results.tests.push({
                name: 'Environment Variables',
                status: 'FAILED',
                error: 'NOTION_PAGE_URL not configured'
            });
            return res.json(results);
        }
        
        results.tests.push({
            name: 'Environment Variables',
            status: 'PASSED',
            details: {
                secretLength: process.env.NOTION_INTEGRATION_SECRET.length,
                secretFormat: process.env.NOTION_INTEGRATION_SECRET.startsWith('ntn_'),
                urlFormat: process.env.NOTION_PAGE_URL.includes('notion.so')
            }
        });
        
        // Test 2: Database ID extraction
        function extractPageIdFromUrl(pageUrl) {
            const match = pageUrl.match(/([a-f0-9]{32})(?:[?#]|$)/i);
            if (match && match[1]) {
                return match[1];
            }
            throw new Error("Failed to extract page ID from URL");
        }
        
        let databaseId;
        try {
            databaseId = extractPageIdFromUrl(process.env.NOTION_PAGE_URL);
            results.tests.push({
                name: 'Database ID Extraction',
                status: 'PASSED',
                details: { databaseId }
            });
        } catch (error) {
            results.tests.push({
                name: 'Database ID Extraction',
                status: 'FAILED',
                error: error.message
            });
            return res.json(results);
        }
        
        // Test 3: Notion client initialization
        let notion;
        try {
            notion = new Client({
                auth: process.env.NOTION_INTEGRATION_SECRET,
            });
            results.tests.push({
                name: 'Notion Client',
                status: 'PASSED'
            });
        } catch (error) {
            results.tests.push({
                name: 'Notion Client',
                status: 'FAILED',
                error: error.message
            });
            return res.json(results);
        }
        
        // Test 4: Database access
        try {
            const database = await notion.databases.retrieve({
                database_id: databaseId,
            });
            
            results.tests.push({
                name: 'Database Access',
                status: 'PASSED',
                details: {
                    title: database.title?.[0]?.plain_text || 'Unknown',
                    properties: Object.keys(database.properties || {})
                }
            });
        } catch (error) {
            results.tests.push({
                name: 'Database Access',
                status: 'FAILED',
                error: error.message,
                code: error.code,
                status: error.status
            });
            return res.json(results);
        }
        
        // Test 5: Query test
        try {
            const response = await notion.databases.query({
                database_id: databaseId,
                page_size: 1,
            });
            
            results.tests.push({
                name: 'Database Query',
                status: 'PASSED',
                details: {
                    entryCount: response.results.length,
                    hasEntries: response.results.length > 0
                }
            });
        } catch (error) {
            results.tests.push({
                name: 'Database Query',
                status: 'FAILED',
                error: error.message,
                code: error.code,
                status: error.status
            });
        }
        
        res.json(results);
        
    } catch (error) {
        res.status(500).json({
            error: 'Production test failed',
            message: error.message,
            stack: error.stack
        });
    }
});

// Enhanced error handling for production
app.use((err, req, res, next) => {
    console.error('Production error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
    });
});

export default app;