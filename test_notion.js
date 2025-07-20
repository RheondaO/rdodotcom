// Simple test script for Notion integration
import { Client } from "@notionhq/client";

console.log("=== NOTION INTEGRATION TEST ===");

// Check environment variables
console.log("Environment Variables:");
console.log("- NOTION_INTEGRATION_SECRET:", !!process.env.NOTION_INTEGRATION_SECRET);
console.log("- NOTION_TASKS_URL:", !!process.env.NOTION_TASKS_URL);
console.log("- NOTION_TIMEBLOCKS_URL:", !!process.env.NOTION_TIMEBLOCKS_URL);

if (process.env.NOTION_INTEGRATION_SECRET) {
    console.log("- Secret length:", process.env.NOTION_INTEGRATION_SECRET.length);
    console.log("- Secret format:", process.env.NOTION_INTEGRATION_SECRET.startsWith('ntn_') ? 'Valid' : 'Invalid');
}

// Extract database IDs
function extractPageIdFromUrl(pageUrl) {
    const match = pageUrl.match(/([a-f0-9]{32})(?:[?#]|$)/i);
    if (match && match[1]) {
        return match[1];
    }
    throw new Error("Failed to extract page ID from: " + pageUrl);
}

try {
    if (process.env.NOTION_TASKS_URL) {
        const tasksId = extractPageIdFromUrl(process.env.NOTION_TASKS_URL);
        console.log("- Tasks DB ID:", tasksId.substring(0, 8) + "...");
    }
} catch (error) {
    console.log("- Tasks ID extraction failed:", error.message);
}

try {
    if (process.env.NOTION_TIMEBLOCKS_URL) {
        const timeBlocksId = extractPageIdFromUrl(process.env.NOTION_TIMEBLOCKS_URL);
        console.log("- Time Blocks DB ID:", timeBlocksId.substring(0, 8) + "...");
    }
} catch (error) {
    console.log("- Time Blocks ID extraction failed:", error.message);
}

// Test Notion client initialization
if (process.env.NOTION_INTEGRATION_SECRET) {
    const notion = new Client({
        auth: process.env.NOTION_INTEGRATION_SECRET,
    });
    console.log("✅ Notion client initialized successfully");
} else {
    console.log("❌ Cannot initialize Notion client - missing secret");
}

console.log("=== TEST COMPLETE ===");