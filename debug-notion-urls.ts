// Debug script to check Notion URLs
console.log("=== Notion URL Debugging ===");
console.log("NOTION_PAGE_URL:", process.env.NOTION_PAGE_URL);
console.log("NOTION_AI_DEV_PAGE_URL:", process.env.NOTION_AI_DEV_PAGE_URL);

function extractPageIdFromUrl(pageUrl: string): string {
    const match = pageUrl.match(/([a-f0-9]{32})(?:[?#]|$)/i);
    if (match && match[1]) {
        return match[1];
    }
    throw Error("Failed to extract page ID");
}

const pageId1 = extractPageIdFromUrl(process.env.NOTION_PAGE_URL!);
const pageId2 = extractPageIdFromUrl(process.env.NOTION_AI_DEV_PAGE_URL!);

console.log("NOTION_PAGE_URL ID:", pageId1);
console.log("NOTION_AI_DEV_PAGE_URL ID:", pageId2);
console.log("Same ID?", pageId1 === pageId2);

console.log("\n=== What You Need ===");
console.log("1. Create a NEW Notion page called 'AI App Development'");
console.log("2. Share it with your Notion integration");
console.log("3. Copy the page URL (NOT database URL)");
console.log("4. Update NOTION_AI_DEV_PAGE_URL with the new page URL");
console.log("\nCurrent URLs are both pointing to databases, but we need a page for the AI Dev setup.");