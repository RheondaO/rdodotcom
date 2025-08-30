import { Router } from 'express';
import { jiraService } from './jira-integration';
import { jiraSyncService } from './jira-sync';
import { requireAuth } from './auth';

const router = Router();

// Check if Jira is configured
router.get('/status', requireAuth, async (req, res) => {
  try {
    const isConfigured = jiraService.isConfigured();
    const syncStatus = jiraSyncService.getSyncStatus();
    
    res.json({
      configured: isConfigured,
      syncStatus,
      connectionDetails: isConfigured ? {
        domain: process.env.JIRA_DOMAIN,
        email: process.env.JIRA_EMAIL
      } : null
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Check user permissions in Jira
router.get('/permissions', requireAuth, async (req, res) => {
  try {
    if (!jiraService.isConfigured()) {
      return res.status(400).json({ error: 'Jira integration not configured' });
    }
    
    const permissions = await jiraService.checkUserPermissions();
    res.json(permissions);
  } catch (error: any) {
    console.error('Error checking permissions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all Jira projects
router.get('/projects', requireAuth, async (req, res) => {
  try {
    if (!jiraService.isConfigured()) {
      return res.status(400).json({ error: 'Jira integration not configured' });
    }
    
    const projects = await jiraService.getProjects();
    res.json(projects);
  } catch (error: any) {
    console.error('Error fetching Jira projects:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new Jira project
router.post('/projects', requireAuth, async (req, res) => {
  try {
    if (!jiraService.isConfigured()) {
      return res.status(400).json({ error: 'Jira integration not configured' });
    }
    
    const { name, key, projectTypeKey, description } = req.body;
    
    if (!name || !key) {
      return res.status(400).json({ error: 'Project name and key are required' });
    }
    
    const project = await jiraService.createProject({
      name,
      key,
      projectTypeKey,
      description
    });
    
    res.json(project);
  } catch (error: any) {
    console.error('Error creating Jira project:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all Jira issues
router.get('/issues', async (req, res) => {
  try {
    if (!jiraService.isConfigured()) {
      return res.status(400).json({ error: 'Jira integration not configured' });
    }
    
    const issues = await jiraService.getIssues();
    res.json(issues);
  } catch (error: any) {
    console.error('Error fetching Jira issues:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new Jira issue
router.post('/issues', requireAuth, async (req, res) => {
  try {
    if (!jiraService.isConfigured()) {
      return res.status(400).json({ error: 'Jira integration not configured' });
    }
    
    const { projectKey, summary, description, issueType, priority } = req.body;
    
    if (!projectKey || !summary || !issueType) {
      return res.status(400).json({ error: 'Project key, summary, and issue type are required' });
    }
    
    const issue = await jiraService.createIssue({
      projectKey,
      summary,
      description,
      issueType,
      priority
    });
    
    res.json(issue);
  } catch (error: any) {
    console.error('Error creating Jira issue:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get issues for a specific project
router.get('/projects/:projectKey/issues', requireAuth, async (req, res) => {
  try {
    if (!jiraService.isConfigured()) {
      return res.status(400).json({ error: 'Jira integration not configured' });
    }
    
    const { projectKey } = req.params;
    const { maxResults = 50 } = req.query;
    
    const issues = await jiraService.getProjectIssues(
      projectKey, 
      parseInt(maxResults as string)
    );
    
    res.json(issues);
  } catch (error: any) {
    console.error('Error fetching project issues:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get issues assigned to current user
router.get('/my-issues', requireAuth, async (req, res) => {
  try {
    if (!jiraService.isConfigured()) {
      return res.status(400).json({ error: 'Jira integration not configured' });
    }
    
    const { maxResults = 50 } = req.query;
    const issues = await jiraService.getMyIssues(parseInt(maxResults as string));
    
    res.json(issues);
  } catch (error: any) {
    console.error('Error fetching user issues:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific issue
router.get('/issues/:issueKey', requireAuth, async (req, res) => {
  try {
    if (!jiraService.isConfigured()) {
      return res.status(400).json({ error: 'Jira integration not configured' });
    }
    
    const { issueKey } = req.params;
    const issue = await jiraService.getIssue(issueKey);
    
    res.json(issue);
  } catch (error: any) {
    console.error('Error fetching issue:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new issue
router.post('/issues', requireAuth, async (req, res) => {
  try {
    if (!jiraService.isConfigured()) {
      return res.status(400).json({ error: 'Jira integration not configured' });
    }
    
    const issue = await jiraService.createIssue(req.body);
    res.json(issue);
  } catch (error: any) {
    console.error('Error creating issue:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update an existing issue
router.put('/issues/:issueKey', requireAuth, async (req, res) => {
  try {
    if (!jiraService.isConfigured()) {
      return res.status(400).json({ error: 'Jira integration not configured' });
    }
    
    const { issueKey } = req.params;
    await jiraService.updateIssue(issueKey, req.body);
    
    res.json({ success: true, message: `Issue ${issueKey} updated successfully` });
  } catch (error: any) {
    console.error('Error updating issue:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete an issue
router.delete('/issues/:issueKey', requireAuth, async (req, res) => {
  try {
    if (!jiraService.isConfigured()) {
      return res.status(400).json({ error: 'Jira integration not configured' });
    }
    
    const { issueKey } = req.params;
    await jiraService.deleteIssue(issueKey);
    
    res.json({ success: true, message: `Issue ${issueKey} deleted successfully` });
  } catch (error: any) {
    console.error('Error deleting issue:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sync endpoints
// Sync from Jira to Belle Journal
router.post('/sync/from-jira', requireAuth, async (req, res) => {
  try {
    if (!jiraService.isConfigured()) {
      return res.status(400).json({ error: 'Jira integration not configured' });
    }
    
    const { projectKey } = req.body;
    const result = await jiraSyncService.syncJiraToBelleJournal(projectKey);
    
    res.json(result);
  } catch (error: any) {
    console.error('Error syncing from Jira:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sync from Belle Journal to Jira
router.post('/sync/to-jira', requireAuth, async (req, res) => {
  try {
    if (!jiraService.isConfigured()) {
      return res.status(400).json({ error: 'Jira integration not configured' });
    }
    
    const { projectKey } = req.body;
    if (!projectKey) {
      return res.status(400).json({ error: 'Project key is required' });
    }
    
    const result = await jiraSyncService.syncBelleJournalToJira(projectKey);
    
    res.json(result);
  } catch (error: any) {
    console.error('Error syncing to Jira:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook endpoint for Jira (for real-time updates)
router.post('/webhook', async (req, res) => {
  try {
    // Verify webhook signature if configured
    // For now, we'll process all webhooks
    
    await jiraSyncService.handleJiraWebhook(req.body);
    res.status(200).send('OK');
  } catch (error: any) {
    console.error('Error processing Jira webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get priorities
router.get('/priorities', requireAuth, async (req, res) => {
  try {
    if (!jiraService.isConfigured()) {
      return res.status(400).json({ error: 'Jira integration not configured' });
    }
    
    const priorities = await jiraService.getPriorities();
    res.json(priorities);
  } catch (error: any) {
    console.error('Error fetching priorities:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get issue types for a project
router.get('/projects/:projectKey/issue-types', requireAuth, async (req, res) => {
  try {
    if (!jiraService.isConfigured()) {
      return res.status(400).json({ error: 'Jira integration not configured' });
    }
    
    const { projectKey } = req.params;
    const issueTypes = await jiraService.getProjectIssueTypes(projectKey);
    
    res.json(issueTypes);
  } catch (error: any) {
    console.error('Error fetching issue types:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search issues with JQL
router.post('/search', requireAuth, async (req, res) => {
  try {
    if (!jiraService.isConfigured()) {
      return res.status(400).json({ error: 'Jira integration not configured' });
    }
    
    const { jql, maxResults = 50 } = req.body;
    if (!jql) {
      return res.status(400).json({ error: 'JQL query is required' });
    }
    
    const issues = await jiraService.searchIssues(jql, maxResults);
    res.json(issues);
  } catch (error: any) {
    console.error('Error searching issues:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;