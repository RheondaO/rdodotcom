
import { db } from './db.js';
import { 
  appProjects, 
  appTasks, 
  appSprints, 
  appTimeEntries, 
  testCases, 
  qualityIssues, 
  autoDetectedIssues 
} from '../migrations/schema.js';

async function clearAppDevelopmentData() {
  try {
    console.log('Clearing app development data...');
    
    // Clear all app development related tables
    await db.delete(autoDetectedIssues);
    console.log('✓ Cleared auto_detected_issues');
    
    await db.delete(qualityIssues);
    console.log('✓ Cleared quality_issues');
    
    await db.delete(testCases);
    console.log('✓ Cleared test_cases');
    
    await db.delete(appTimeEntries);
    console.log('✓ Cleared app_time_entries');
    
    await db.delete(appTasks);
    console.log('✓ Cleared app_tasks');
    
    await db.delete(appSprints);
    console.log('✓ Cleared app_sprints');
    
    await db.delete(appProjects);
    console.log('✓ Cleared app_projects');
    
    console.log('\n🎉 All app development data cleared successfully!');
    console.log('The App Development Suite now displays Git commits and repository information.');
    
  } catch (error) {
    console.error('Error clearing app development data:', error);
  } finally {
    process.exit(0);
  }
}

clearAppDevelopmentData();
