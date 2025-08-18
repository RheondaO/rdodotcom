import { getAIDevProjects, updateAIDevProject } from './aidevprojects-integration.ts';
import { getAIDevTasks } from './aidevprojects-integration.ts';

/**
 * Sync TaskCount field in AIDEVPROJECTS Notion database with actual task counts
 */
export async function syncTaskCounts() {
    try {
        console.log('🔄 Starting task count synchronization...');
        
        // Get all projects from AIDEVPROJECTS
        const projects = await getAIDevProjects();
        console.log(`📋 Found ${projects.length} projects to sync`);
        
        // Get all tasks from AIDEVTASKS
        const tasks = await getAIDevTasks();
        console.log(`📝 Found ${tasks.length} total tasks`);
        
        // Count tasks per project
        const taskCounts = new Map<string, number>();
        tasks.forEach((task: any) => {
            const projectId = task.projectId;
            taskCounts.set(projectId, (taskCounts.get(projectId) || 0) + 1);
        });
        
        console.log('📊 Task counts per project:');
        taskCounts.forEach((count, projectId) => {
            const project = projects.find(p => p.notionId === projectId);
            console.log(`  - ${project?.name || projectId}: ${count} tasks`);
        });
        
        // Update each project's TaskCount field
        for (const project of projects) {
            const actualTaskCount = taskCounts.get(project.notionId) || 0;
            const currentTaskCount = project.taskCount || 0;
            
            if (actualTaskCount !== currentTaskCount) {
                console.log(`🔄 Updating "${project.name}": ${currentTaskCount} → ${actualTaskCount} tasks`);
                
                try {
                    await updateAIDevProject(project.notionId, {
                        taskCount: actualTaskCount
                    });
                    console.log(`✅ Successfully updated "${project.name}"`);
                } catch (error) {
                    console.error(`❌ Failed to update "${project.name}":`, error);
                }
            } else {
                console.log(`✓ "${project.name}" already has correct count: ${actualTaskCount}`);
            }
        }
        
        console.log('🎉 Task count synchronization completed');
        
    } catch (error) {
        console.error('❌ Error during task count synchronization:', error);
        throw error;
    }
}

// Run sync if called directly
if (import.meta.main) {
    syncTaskCounts()
        .then(() => {
            console.log('Done!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Failed:', error);
            process.exit(1);
        });
}