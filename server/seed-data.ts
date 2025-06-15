// Sample data seeding for development - creates proper project-task relationships
import { DatabaseStorage } from './storage.js';

export async function seedSampleData(storage: DatabaseStorage) {
  try {
    // Check if data already exists
    const existingProjects = await storage.getAllAppProjects();
    if (existingProjects.length > 0) {
      console.log('Sample data already exists, skipping seed');
      return;
    }

    console.log('Seeding sample project and task data...');

    // Create first project
    const project1 = await storage.createAppProject({
      name: "E-Commerce Dashboard",
      description: "Modern React-based dashboard for managing online store operations",
      projectType: "web",
      status: "in_progress", 
      priority: "high",
      repositoryUrl: "https://github.com/user/ecommerce-dashboard",
      deploymentUrl: "https://ecommerce-dashboard.vercel.app",
      progress: 65,
      estimatedHours: 120,
      actualHours: 78,
      techStack: ["React", "TypeScript", "Tailwind CSS", "Node.js", "PostgreSQL"],
      tags: ["frontend", "backend", "dashboard"],
      isActive: true
    });

    // Create tasks for project 1
    await storage.createAppTask({
      projectId: project1.id,
      title: "Implement user authentication",
      description: "Set up JWT-based authentication with login/logout functionality",
      status: "done",
      priority: "high", 
      category: "feature",
      estimatedHours: 12,
      actualHours: 14,
      assignee: "Developer"
    });

    await storage.createAppTask({
      projectId: project1.id,
      title: "Build product management interface",
      description: "Create CRUD operations for managing store products",
      status: "in_progress",
      priority: "high",
      category: "feature", 
      estimatedHours: 20,
      actualHours: 12,
      assignee: "Developer"
    });

    await storage.createAppTask({
      projectId: project1.id,
      title: "Design responsive mobile layout",
      description: "Ensure dashboard works properly on mobile devices",
      status: "review",
      priority: "medium",
      category: "improvement",
      estimatedHours: 8,
      actualHours: 6,
      assignee: "Designer"
    });

    await storage.createAppTask({
      projectId: project1.id,
      title: "Fix checkout process bug",
      description: "Resolve issue where payment confirmation fails intermittently",
      status: "todo",
      priority: "urgent",
      category: "bug",
      estimatedHours: 4,
      actualHours: 0,
      assignee: "Developer"
    });

    // Create second project
    const project2 = await storage.createAppProject({
      name: "Content Management System", 
      description: "Headless CMS for managing blog posts and media content",
      projectType: "api",
      status: "planning",
      priority: "medium",
      repositoryUrl: "https://github.com/user/cms-api",
      progress: 25,
      estimatedHours: 80,
      actualHours: 20,
      techStack: ["Node.js", "Express", "MongoDB", "GraphQL"],
      tags: ["backend", "api", "cms"],
      isActive: true
    });

    // Create tasks for project 2
    await storage.createAppTask({
      projectId: project2.id,
      title: "Set up database schema",
      description: "Design and implement MongoDB collections for content storage",
      status: "done",
      priority: "high",
      category: "feature",
      estimatedHours: 6,
      actualHours: 8,
      assignee: "Backend Developer"
    });

    await storage.createAppTask({
      projectId: project2.id,
      title: "Create GraphQL API endpoints",
      description: "Build queries and mutations for content management",
      status: "in_progress",
      priority: "high",
      category: "feature",
      estimatedHours: 16,
      actualHours: 12,
      assignee: "Backend Developer"
    });

    await storage.createAppTask({
      projectId: project2.id,
      title: "Implement file upload system",
      description: "Add support for uploading and managing media files",
      status: "todo",
      priority: "medium",
      category: "feature",
      estimatedHours: 10,
      actualHours: 0,
      assignee: "Backend Developer"
    });

    console.log('Sample data seeded successfully!');
    console.log('- Created 2 projects with proper task relationships');
    console.log('- Projects will only show as active since they have tasks');
    console.log('- Task counts and progress calculated dynamically');

  } catch (error) {
    console.error('Error seeding sample data:', error);
  }
}