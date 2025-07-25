import { notion, NOTION_TIMERSESSIONS_DATABASE_ID } from './server/notion.js';

async function verifyNotionFields() {
  console.log('🔍 Verifying Notion Database Fields for Session Testing...');
  console.log('📋 Database ID:', NOTION_TIMERSESSIONS_DATABASE_ID);
  
  try {
    const response = await notion.databases.query({
      database_id: NOTION_TIMERSESSIONS_DATABASE_ID,
      sorts: [{ timestamp: 'created_time', direction: 'descending' }],
      page_size: 10
    });

    console.log('📊 Total timer sessions found:', response.results.length);
    console.log('\n=== RECENT SESSION ANALYSIS ===\n');

    response.results.forEach((session, index) => {
      const properties = session.properties;
      
      console.log(`🔷 Session ${index + 1}:`);
      console.log(`  - ID: ${session.id}`);
      console.log(`  - Title: ${properties.Title?.title?.[0]?.plain_text || 'No title'}`);
      console.log(`  - Mode: ${properties.Mode?.select?.name || 'No mode'}`);
      console.log(`  - Is Active: ${properties['Is Active']?.checkbox || false}`);
      console.log(`  - Is Break: ${properties['Is Break']?.checkbox || false}`);
      console.log(`  - Current Session: ${properties['Current Session']?.number || 0}`);
      console.log(`  - Total Sessions: ${properties['Total Sessions']?.number || 0}`);
      console.log(`  - Total Focus Time: ${properties['Total Focus Time']?.number || 0} seconds`);
      console.log(`  - Started At: ${properties['Started At']?.date?.start || 'No date'}`);
      console.log('');
    });

    console.log('\n=== KEY FIELDS VALIDATION ===');
    
    const testSessions = response.results.filter(s => 
      s.properties.Title?.title?.[0]?.plain_text?.includes('📊 Notion Test')
    );
    
    console.log(`📊 Found ${testSessions.length} test sessions with required fields:`);
    
    testSessions.forEach((session, index) => {
      const props = session.properties;
      const title = props.Title?.title?.[0]?.plain_text;
      
      console.log(`\n✅ ${title}:`);
      console.log(`   • Is Active: ${props['Is Active']?.checkbox} (${typeof props['Is Active']?.checkbox})`);
      console.log(`   • Is Break: ${props['Is Break']?.checkbox} (${typeof props['Is Break']?.checkbox})`);
      console.log(`   • Current Session: ${props['Current Session']?.number} (${typeof props['Current Session']?.number})`);
      console.log(`   • Total Sessions: ${props['Total Sessions']?.number} (${typeof props['Total Sessions']?.number})`);
      console.log(`   • Total Focus Time: ${props['Total Focus Time']?.number} seconds (${typeof props['Total Focus Time']?.number})`);
    });
    
  } catch (error) {
    console.error('❌ Error verifying Notion fields:', error.message);
  }
}

verifyNotionFields().catch(console.error);