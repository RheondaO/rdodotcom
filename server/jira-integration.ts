import axios, { AxiosInstance } from 'axios';

interface JiraConfig {
  domain: string;
  email: string;
  apiToken: string;
}

interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    description?: string;
    status: {
      name: string;
      id: string;
    };
    assignee?: {
      displayName: string;
      emailAddress: string;
    };
    priority?: {
      name: string;
      id: string;
    };
    project: {
      key: string;
      name: string;
    };
    issuetype: {
      name: string;
      id: string;
    };
    created: string;
    updated: string;
    duedate?: string;
    labels?: string[];
    components?: Array<{
      name: string;
    }>;
    customfield_10001?: string; // Epic link
    customfield_10014?: number; // Story points
  };
}

interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
}

interface JiraWebhook {
  webhookEvent: string;
  issue?: JiraIssue;
  issue_event_type_name?: string;
  changelog?: {
    items: Array<{
      field: string;
      fromString?: string;
      toString?: string;
    }>;
  };
}

export class JiraIntegrationService {
  private client: AxiosInstance;
  private config: JiraConfig;

  constructor() {
    // Use the provided scoped API token if available, otherwise fall back to environment variables
    const scopedToken = 'ATATT3xFfGF0gfyW7g8H0FiOqGUZLBu4__bREKsW-qmDNaC6POQXLyvv620mkP6_iuqH-XC6IBDjlRd9VQDaz8Gg7NNeBHGMNaEM_AHiAzcjYcoe4ULx85PC7EenMvItJ4W0t003myN0oGAj_fTLKF45bnEHoxDA4OBdc21ELWd2UbC4qR8PozM=E2B9F503';
    
    this.config = {
      domain: 'https://rheondasaasogletree.atlassian.net',
      email: process.env.JIRA_EMAIL || 'rheondao@gmail.com',
      apiToken: scopedToken || process.env.JIRA_API_TOKEN || ''
    };

    if (!this.config.domain || !this.config.email || !this.config.apiToken) {
      console.warn('⚠️ Jira integration not configured. Missing required configuration.');
    } else {
      console.log('✅ Jira integration configured with scoped API token');
    }

    // Create axios instance with auth headers
    // Ensure domain doesn't include protocol
    const domain = this.config.domain.replace(/^https?:\/\//, '');
    
    this.client = axios.create({
      baseURL: `https://${domain}/rest/api/3`,
      headers: {
        'Authorization': `Basic ${Buffer.from(`${this.config.email}:${this.config.apiToken}`).toString('base64')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }

  isConfigured(): boolean {
    return !!(this.config.domain && this.config.email && this.config.apiToken);
  }

  // Check user permissions in Jira
  async checkUserPermissions(): Promise<any> {
    try {
      const response = await this.client.get('/mypermissions', {
        params: {
          permissions: 'ADMINISTER,CREATE_PROJECTS,BROWSE_PROJECTS,ADMINISTER_PROJECTS'
        }
      });
      
      const permissions = response.data.permissions;
      const result = {
        canCreateProjects: permissions.CREATE_PROJECTS?.havePermission || false,
        canAdministerProjects: permissions.ADMINISTER_PROJECTS?.havePermission || false,
        canBrowseProjects: permissions.BROWSE_PROJECTS?.havePermission || false,
        isJiraAdmin: permissions.ADMINISTER?.havePermission || false,
      };
      
      console.log('🔐 Jira permissions check:', result);
      return result;
    } catch (error: any) {
      console.error('Error checking Jira permissions:', error.message);
      throw new Error(`Failed to check Jira permissions: ${error.message}`);
    }
  }

  // Get all projects from Jira
  async getProjects(): Promise<JiraProject[]> {
    try {
      const response = await this.client.get('/project');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching Jira projects:', error.message);
      throw new Error(`Failed to fetch Jira projects: ${error.message}`);
    }
  }

  // Create a new Jira project
  async createProject(data: {
    name: string;
    key: string;
    projectTypeKey?: string;
    description?: string;
    leadAccountId?: string;
  }): Promise<JiraProject> {
    try {
      console.log('🚀 Creating Jira project with data:', { 
        name: data.name, 
        key: data.key, 
        projectTypeKey: data.projectTypeKey 
      });

      // First check if user has permission to create projects
      try {
        const permissions = await this.checkUserPermissions();
        if (!permissions.canCreateProjects && !permissions.isJiraAdmin) {
          throw new Error('You do not have permission to create projects in Jira. Please contact your Jira administrator to grant you the "Create Projects" permission. Your current Jira user: ' + this.config.email);
        }
      } catch (permError) {
        console.log('⚠️ Could not verify permissions, attempting to create project anyway...');
      }

      // Validate project key (must be uppercase, 2-10 characters, alphanumeric)
      const projectKey = data.key.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10);
      if (projectKey.length < 2) {
        throw new Error('Project key must be at least 2 characters long');
      }

      const payload: any = {
        key: projectKey,
        name: data.name,
        projectTypeKey: data.projectTypeKey || 'business'
      };

      if (data.description) {
        payload.description = data.description;
      }

      if (data.leadAccountId) {
        payload.leadAccountId = data.leadAccountId;
      }

      console.log('📦 Sending payload to Jira API:', payload);

      const response = await this.client.post('/project', payload);
      console.log(`✅ Successfully created Jira project: ${response.data.name} (${response.data.key})`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating Jira project:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        errors: error.response?.data?.errors,
        errorMessages: error.response?.data?.errorMessages
      });
      
      // Provide more helpful error messages
      if (error.response?.status === 400) {
        const errors = error.response.data?.errors;
        if (errors?.projectKey) {
          throw new Error(`Invalid project key: ${errors.projectKey}`);
        }
        if (errors?.projectName) {
          throw new Error(`Invalid project name: ${errors.projectName}`);
        }
        if (errors?.projectTypeKey) {
          throw new Error(`Invalid project type: ${errors.projectTypeKey}`);
        }
      }
      
      if (error.response?.status === 401) {
        throw new Error('Jira authentication failed. Please check your API credentials.');
      }
      
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to create projects in Jira. You need Jira admin or project creation permissions. Please contact your Jira administrator to grant you the "Create Projects" permission.');
      }
      
      throw new Error(`Failed to create Jira project: ${error.response?.data?.errorMessages?.[0] || error.response?.data?.message || error.message}`);
    }
  }

  // Get issues for a project
  async getProjectIssues(projectKey: string, maxResults: number = 50): Promise<JiraIssue[]> {
    try {
      const jql = `project = ${projectKey} ORDER BY created DESC`;
      const response = await this.client.get('/search', {
        params: {
          jql,
          maxResults,
          fields: 'summary,description,status,assignee,priority,project,issuetype,created,updated,duedate,labels,components,customfield_10001,customfield_10014'
        }
      });
      return response.data.issues;
    } catch (error: any) {
      console.error('Error fetching Jira issues:', error.message);
      throw new Error(`Failed to fetch Jira issues: ${error.message}`);
    }
  }

  // Get all issues assigned to the current user
  async getMyIssues(maxResults: number = 50): Promise<JiraIssue[]> {
    try {
      const jql = `assignee = currentUser() ORDER BY updated DESC`;
      const response = await this.client.get('/search', {
        params: {
          jql,
          maxResults,
          fields: 'summary,description,status,assignee,priority,project,issuetype,created,updated,duedate,labels,components,customfield_10001,customfield_10014'
        }
      });
      return response.data.issues;
    } catch (error: any) {
      console.error('Error fetching user issues:', error.message);
      throw new Error(`Failed to fetch user issues: ${error.message}`);
    }
  }

  // Get a single issue by key
  async getIssue(issueKey: string): Promise<JiraIssue> {
    try {
      const response = await this.client.get(`/issue/${issueKey}`, {
        params: {
          fields: 'summary,description,status,assignee,priority,project,issuetype,created,updated,duedate,labels,components,customfield_10001,customfield_10014'
        }
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching Jira issue ${issueKey}:`, error.message);
      throw new Error(`Failed to fetch Jira issue: ${error.message}`);
    }
  }

  // Create a new issue in Jira
  async createIssue(data: {
    projectKey: string;
    summary: string;
    description?: string;
    issueType?: string;
    priority?: string;
    dueDate?: string;
    labels?: string[];
    storyPoints?: number;
  }): Promise<JiraIssue> {
    try {
      const payload: any = {
        fields: {
          project: { key: data.projectKey },
          summary: data.summary,
          issuetype: { name: data.issueType || 'Task' }
        }
      };

      if (data.description) {
        payload.fields.description = {
          type: 'doc',
          version: 1,
          content: [{
            type: 'paragraph',
            content: [{
              type: 'text',
              text: data.description
            }]
          }]
        };
      }

      if (data.priority) {
        payload.fields.priority = { name: data.priority };
      }

      if (data.dueDate) {
        payload.fields.duedate = data.dueDate;
      }

      if (data.labels) {
        payload.fields.labels = data.labels;
      }

      if (data.storyPoints) {
        payload.fields.customfield_10014 = data.storyPoints;
      }

      const response = await this.client.post('/issue', payload);
      return response.data;
    } catch (error: any) {
      console.error('Error creating Jira issue:', error.response?.data || error.message);
      throw new Error(`Failed to create Jira issue: ${error.message}`);
    }
  }

  // Update an existing issue
  async updateIssue(issueKey: string, updates: {
    summary?: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: string;
    labels?: string[];
    storyPoints?: number;
  }): Promise<void> {
    try {
      const payload: any = { fields: {} };

      if (updates.summary) {
        payload.fields.summary = updates.summary;
      }

      if (updates.description !== undefined) {
        payload.fields.description = {
          type: 'doc',
          version: 1,
          content: [{
            type: 'paragraph',
            content: [{
              type: 'text',
              text: updates.description || ''
            }]
          }]
        };
      }

      if (updates.priority) {
        payload.fields.priority = { name: updates.priority };
      }

      if (updates.dueDate !== undefined) {
        payload.fields.duedate = updates.dueDate || null;
      }

      if (updates.labels) {
        payload.fields.labels = updates.labels;
      }

      if (updates.storyPoints !== undefined) {
        payload.fields.customfield_10014 = updates.storyPoints;
      }

      await this.client.put(`/issue/${issueKey}`, payload);

      // Handle status transition separately
      if (updates.status) {
        await this.transitionIssue(issueKey, updates.status);
      }
    } catch (error: any) {
      console.error(`Error updating Jira issue ${issueKey}:`, error.response?.data || error.message);
      throw new Error(`Failed to update Jira issue: ${error.message}`);
    }
  }

  // Transition issue to a different status
  async transitionIssue(issueKey: string, statusName: string): Promise<void> {
    try {
      // Get available transitions
      const transitionsResponse = await this.client.get(`/issue/${issueKey}/transitions`);
      const transitions = transitionsResponse.data.transitions;

      // Find the transition that matches the desired status
      const transition = transitions.find((t: any) => 
        t.to.name.toLowerCase() === statusName.toLowerCase()
      );

      if (!transition) {
        console.warn(`No transition found to status "${statusName}" for issue ${issueKey}`);
        return;
      }

      // Execute the transition
      await this.client.post(`/issue/${issueKey}/transitions`, {
        transition: { id: transition.id }
      });
    } catch (error: any) {
      console.error(`Error transitioning Jira issue ${issueKey}:`, error.message);
      // Don't throw, as transition might not be available
    }
  }

  // Delete an issue
  async deleteIssue(issueKey: string): Promise<void> {
    try {
      await this.client.delete(`/issue/${issueKey}`);
    } catch (error: any) {
      console.error(`Error deleting Jira issue ${issueKey}:`, error.message);
      throw new Error(`Failed to delete Jira issue: ${error.message}`);
    }
  }

  // Search issues with JQL
  async searchIssues(jql: string, maxResults: number = 50): Promise<JiraIssue[]> {
    try {
      const response = await this.client.get('/search', {
        params: {
          jql,
          maxResults,
          fields: 'summary,description,status,assignee,priority,project,issuetype,created,updated,duedate,labels,components'
        }
      });
      return response.data.issues;
    } catch (error: any) {
      console.error('Error searching Jira issues:', error.message);
      throw new Error(`Failed to search Jira issues: ${error.message}`);
    }
  }

  // Get issue types for a project
  async getProjectIssueTypes(projectKey: string): Promise<any[]> {
    try {
      const response = await this.client.get(`/project/${projectKey}/statuses`);
      const issueTypes = response.data.map((it: any) => ({
        id: it.id,
        name: it.name,
        subtask: it.subtask
      }));
      return [...new Map(issueTypes.map((item: any) => [item.id, item])).values()];
    } catch (error: any) {
      console.error('Error fetching issue types:', error.message);
      throw new Error(`Failed to fetch issue types: ${error.message}`);
    }
  }

  // Get priorities
  async getPriorities(): Promise<any[]> {
    try {
      const response = await this.client.get('/priority');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching priorities:', error.message);
      throw new Error(`Failed to fetch priorities: ${error.message}`);
    }
  }

  // Convert Jira issue to Belle Journal format
  convertToInternalFormat(jiraIssue: JiraIssue): any {
    return {
      jiraKey: jiraIssue.key,
      jiraId: jiraIssue.id,
      title: jiraIssue.fields.summary,
      description: this.extractTextFromDescription(jiraIssue.fields.description),
      status: this.mapJiraStatus(jiraIssue.fields.status.name),
      priority: jiraIssue.fields.priority?.name || 'Medium',
      projectKey: jiraIssue.fields.project.key,
      projectName: jiraIssue.fields.project.name,
      issueType: jiraIssue.fields.issuetype.name,
      assignee: jiraIssue.fields.assignee?.displayName || null,
      dueDate: jiraIssue.fields.duedate || null,
      labels: jiraIssue.fields.labels || [],
      storyPoints: jiraIssue.fields.customfield_10014 || null,
      createdAt: jiraIssue.fields.created,
      updatedAt: jiraIssue.fields.updated,
      syncedAt: new Date().toISOString()
    };
  }

  // Extract text from Jira's document format
  private extractTextFromDescription(description: any): string {
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

  // Map Jira status to Belle Journal status
  private mapJiraStatus(jiraStatus: string): string {
    const statusMap: { [key: string]: string } = {
      'To Do': 'todo',
      'In Progress': 'in_progress',
      'Done': 'completed',
      'Closed': 'completed',
      'Open': 'todo',
      'Resolved': 'completed',
      'In Review': 'in_progress',
      'Testing': 'in_progress',
      'Blocked': 'blocked'
    };
    
    return statusMap[jiraStatus] || 'todo';
  }

  // Map Belle Journal status to Jira status
  mapToJiraStatus(internalStatus: string): string {
    const statusMap: { [key: string]: string } = {
      'todo': 'To Do',
      'in_progress': 'In Progress',
      'completed': 'Done',
      'blocked': 'Blocked',
      'active': 'In Progress',
      'inactive': 'To Do'
    };
    
    return statusMap[internalStatus] || 'To Do';
  }
}

// Singleton instance
export const jiraService = new JiraIntegrationService();