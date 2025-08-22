import { jiraService } from './jira-integration';
import { 
  getAppDevelopmentTasks,
  createAppDevelopmentTask,
  getAppDevelopmentProjects,
  createAppDevelopmentProject,
  updateAppDevelopmentProject
} from './app-development-notion';
import { storage } from './storage';

interface SyncMapping {
  belleJournalId: string;
  jiraKey: string;
  lastSyncedAt: string;
  syncDirection: 'belle-to-jira' | 'jira-to-belle' | 'bidirectional';
}

interface SyncResult {
  success: boolean;
  synced: number;
  errors: string[];
  details: any[];
}

export class JiraSyncService {
  private syncMappings: Map<string, SyncMapping> = new Map();
  private isSyncing: boolean = false;

  constructor() {
    // Load sync mappings from storage on initialization
    this.loadSyncMappings();
  }

  private async loadSyncMappings() {
    try {
      // In a production environment, you would load these from a database
      // For now, we'll use in-memory storage
      const mappings = await storage.getJiraSyncMappings?.() || [];
      mappings.forEach((mapping: SyncMapping) => {
        this.syncMappings.set(mapping.belleJournalId, mapping);
      });
    } catch (error) {
      console.error('Failed to load sync mappings:', error);
    }
  }

  private async saveSyncMapping(mapping: SyncMapping) {
    this.syncMappings.set(mapping.belleJournalId, mapping);
    // Save to storage
    try {
      await storage.saveJiraSyncMapping?.(mapping);
    } catch (error) {
      console.error('Failed to save sync mapping:', error);
    }
  }

  // Sync all tasks from Jira to Belle Journal
  async syncJiraToBelleJournal(projectKey?: string): Promise<SyncResult> {
    if (!jiraService.isConfigured()) {
      return {
        success: false,
        synced: 0,
        errors: ['Jira integration not configured'],
        details: []
      };
    }

    if (this.isSyncing) {
      return {
        success: false,
        synced: 0,
        errors: ['Sync already in progress'],
        details: []
      };
    }

    this.isSyncing = true;
    const result: SyncResult = {
      success: true,
      synced: 0,
      errors: [],
      details: []
    };

    try {
      // Fetch issues from Jira
      const jiraIssues = projectKey 
        ? await jiraService.getProjectIssues(projectKey)
        : await jiraService.getMyIssues();

      console.log(`📥 Syncing ${jiraIssues.length} issues from Jira to Belle Journal`);

      // Get existing Belle Journal tasks
      const existingTasks = await getAppDevelopmentTasks();

      for (const jiraIssue of jiraIssues) {
        try {
          // Check if this issue is already synced
          const existingMapping = Array.from(this.syncMappings.values())
            .find(m => m.jiraKey === jiraIssue.key);

          if (existingMapping) {
            // Update existing task
            const existingTask = existingTasks.find(t => t.id === existingMapping.belleJournalId);
            if (existingTask) {
              await this.updateBelleJournalTask(existingTask.id, jiraIssue);
              result.details.push({
                action: 'updated',
                jiraKey: jiraIssue.key,
                title: jiraIssue.fields.summary
              });
            }
          } else {
            // Create new task in Belle Journal
            const newTask = await this.createBelleJournalTask(jiraIssue);
            if (newTask) {
              result.details.push({
                action: 'created',
                jiraKey: jiraIssue.key,
                title: jiraIssue.fields.summary
              });
            }
          }
          result.synced++;
        } catch (error: any) {
          console.error(`Failed to sync issue ${jiraIssue.key}:`, error);
          result.errors.push(`Failed to sync ${jiraIssue.key}: ${error.message}`);
        }
      }
    } catch (error: any) {
      console.error('Sync failed:', error);
      result.success = false;
      result.errors.push(error.message);
    } finally {
      this.isSyncing = false;
    }

    return result;
  }

  // Sync all tasks from Belle Journal to Jira
  async syncBelleJournalToJira(projectKey: string): Promise<SyncResult> {
    if (!jiraService.isConfigured()) {
      return {
        success: false,
        synced: 0,
        errors: ['Jira integration not configured'],
        details: []
      };
    }

    if (this.isSyncing) {
      return {
        success: false,
        synced: 0,
        errors: ['Sync already in progress'],
        details: []
      };
    }

    this.isSyncing = true;
    const result: SyncResult = {
      success: true,
      synced: 0,
      errors: [],
      details: []
    };

    try {
      // Get all Belle Journal tasks
      const tasks = await getAppDevelopmentTasks();
      
      console.log(`📤 Syncing ${tasks.length} tasks from Belle Journal to Jira`);

      for (const task of tasks) {
        try {
          const mapping = this.syncMappings.get(task.id);

          if (mapping) {
            // Update existing Jira issue
            await this.updateJiraIssue(mapping.jiraKey, task);
            result.details.push({
              action: 'updated',
              jiraKey: mapping.jiraKey,
              title: task.title
            });
          } else {
            // Create new Jira issue
            const jiraIssue = await this.createJiraIssue(projectKey, task);
            if (jiraIssue) {
              result.details.push({
                action: 'created',
                jiraKey: jiraIssue.key,
                title: task.title
              });
            }
          }
          result.synced++;
        } catch (error: any) {
          console.error(`Failed to sync task ${task.id}:`, error);
          result.errors.push(`Failed to sync task "${task.title}": ${error.message}`);
        }
      }
    } catch (error: any) {
      console.error('Sync failed:', error);
      result.success = false;
      result.errors.push(error.message);
    } finally {
      this.isSyncing = false;
    }

    return result;
  }

  // Create a Belle Journal task from a Jira issue
  private async createBelleJournalTask(jiraIssue: any): Promise<any> {
    try {
      const taskData = {
        title: jiraIssue.fields.summary,
        description: this.extractTextFromJiraDescription(jiraIssue.fields.description),
        status: this.mapJiraStatusToBelleJournal(jiraIssue.fields.status.name),
        priority: jiraIssue.fields.priority?.name || 'Medium',
        dueDate: jiraIssue.fields.duedate || null,
        projectId: null, // Will need to map this based on project
        jiraKey: jiraIssue.key,
        jiraId: jiraIssue.id
      };

      const newTask = await createAppDevelopmentTask(taskData);

      // Save sync mapping
      await this.saveSyncMapping({
        belleJournalId: newTask.id,
        jiraKey: jiraIssue.key,
        lastSyncedAt: new Date().toISOString(),
        syncDirection: 'jira-to-belle'
      });

      return newTask;
    } catch (error) {
      console.error('Failed to create Belle Journal task:', error);
      throw error;
    }
  }

  // Update a Belle Journal task from a Jira issue
  private async updateBelleJournalTask(taskId: string, jiraIssue: any): Promise<void> {
    try {
      const updates = {
        title: jiraIssue.fields.summary,
        description: this.extractTextFromJiraDescription(jiraIssue.fields.description),
        status: this.mapJiraStatusToBelleJournal(jiraIssue.fields.status.name),
        priority: jiraIssue.fields.priority?.name || 'Medium',
        dueDate: jiraIssue.fields.duedate || null
      };

      // TODO: Implement updateAppDevelopmentTask function in app-development-notion.ts
      // For now, we'll skip updating existing tasks
      console.log('Task update skipped - updateAppDevelopmentTask not yet implemented:', taskId);

      // Update sync mapping
      const mapping = this.syncMappings.get(taskId);
      if (mapping) {
        mapping.lastSyncedAt = new Date().toISOString();
        await this.saveSyncMapping(mapping);
      }
    } catch (error) {
      console.error('Failed to update Belle Journal task:', error);
      throw error;
    }
  }

  // Create a Jira issue from a Belle Journal task
  private async createJiraIssue(projectKey: string, task: any): Promise<any> {
    try {
      const jiraIssue = await jiraService.createIssue({
        projectKey,
        summary: task.title,
        description: task.description || '',
        issueType: 'Task',
        priority: task.priority || 'Medium',
        dueDate: task.dueDate || undefined,
        labels: task.tags || []
      });

      // Save sync mapping
      await this.saveSyncMapping({
        belleJournalId: task.id,
        jiraKey: jiraIssue.key,
        lastSyncedAt: new Date().toISOString(),
        syncDirection: 'belle-to-jira'
      });

      return jiraIssue;
    } catch (error) {
      console.error('Failed to create Jira issue:', error);
      throw error;
    }
  }

  // Update a Jira issue from a Belle Journal task
  private async updateJiraIssue(jiraKey: string, task: any): Promise<void> {
    try {
      await jiraService.updateIssue(jiraKey, {
        summary: task.title,
        description: task.description || '',
        status: this.mapBelleJournalStatusToJira(task.status),
        priority: task.priority || 'Medium',
        dueDate: task.dueDate || undefined,
        labels: task.tags || []
      });

      // Update sync mapping
      const mapping = Array.from(this.syncMappings.values())
        .find(m => m.jiraKey === jiraKey);
      if (mapping) {
        mapping.lastSyncedAt = new Date().toISOString();
        await this.saveSyncMapping(mapping);
      }
    } catch (error) {
      console.error('Failed to update Jira issue:', error);
      throw error;
    }
  }

  // Handle Jira webhook events for real-time sync
  async handleJiraWebhook(webhook: any): Promise<void> {
    if (!webhook.issue) return;

    const jiraKey = webhook.issue.key;
    const eventType = webhook.webhookEvent;

    console.log(`🔄 Handling Jira webhook: ${eventType} for ${jiraKey}`);

    try {
      switch (eventType) {
        case 'jira:issue_created':
          await this.createBelleJournalTask(webhook.issue);
          break;
        
        case 'jira:issue_updated':
          const mapping = Array.from(this.syncMappings.values())
            .find(m => m.jiraKey === jiraKey);
          if (mapping) {
            await this.updateBelleJournalTask(mapping.belleJournalId, webhook.issue);
          }
          break;
        
        case 'jira:issue_deleted':
          // Handle deletion if needed
          break;
      }
    } catch (error) {
      console.error('Failed to handle Jira webhook:', error);
    }
  }

  // Helper methods
  private extractTextFromJiraDescription(description: any): string {
    if (!description) return '';
    if (typeof description === 'string') return description;
    
    // Handle Atlassian Document Format
    if (description.content) {
      return description.content
        .map((block: any) => {
          if (block.content) {
            return block.content
              .map((item: any) => item.text || '')
              .join('');
          }
          return '';
        })
        .join('\n');
    }
    
    return '';
  }

  private mapJiraStatusToBelleJournal(jiraStatus: string): string {
    const statusMap: { [key: string]: string } = {
      'To Do': 'todo',
      'In Progress': 'active',
      'Done': 'completed',
      'Closed': 'completed',
      'Open': 'todo',
      'Resolved': 'completed',
      'In Review': 'active',
      'Testing': 'active',
      'Blocked': 'blocked'
    };
    
    return statusMap[jiraStatus] || 'todo';
  }

  private mapBelleJournalStatusToJira(status: string): string {
    const statusMap: { [key: string]: string } = {
      'todo': 'To Do',
      'active': 'In Progress',
      'completed': 'Done',
      'blocked': 'Blocked',
      'in_progress': 'In Progress',
      'inactive': 'To Do'
    };
    
    return statusMap[status] || 'To Do';
  }

  // Get sync status
  getSyncStatus(): { mappings: number; lastSync: string | null } {
    const lastSync = Array.from(this.syncMappings.values())
      .reduce((latest, mapping) => {
        if (!latest || mapping.lastSyncedAt > latest) {
          return mapping.lastSyncedAt;
        }
        return latest;
      }, null as string | null);

    return {
      mappings: this.syncMappings.size,
      lastSync
    };
  }

  // Get mapping for a Belle Journal task
  getMappingForTask(taskId: string): SyncMapping | undefined {
    return this.syncMappings.get(taskId);
  }

  // Get mapping for a Jira issue
  getMappingForJiraIssue(jiraKey: string): SyncMapping | undefined {
    return Array.from(this.syncMappings.values())
      .find(m => m.jiraKey === jiraKey);
  }
}

// Singleton instance
export const jiraSyncService = new JiraSyncService();