# replit.md

## Overview

Belle Journal is a digital wellness and productivity platform designed to track health, habits, productivity, finances, and content creation. It provides reliable AI responses and analytics by prioritizing data integrity. The platform uses a React frontend, Express backend, and Notion for primary data storage, aiming to be a robust tool for personal and professional organization with continuous integration of advanced features and data-driven insights.

## User Preferences

Preferred communication style: Simple, everyday language.

### Real-Time Update Requirements
- **Critical User Requirement**: ALL widgets throughout Belle Journal must use real-time updates without page refresh
- **Universal Implementation**: Every widget should show instant updates when items are added, modified, or deleted
- **Auto-Save Behavior**: All forms should immediately show optimistic updates with "Saving..." indicators
- **Status Detection**: Widgets should automatically detect state changes (like time blocks becoming active)
- **Production Priority**: Real-time updates must work reliably in production environments

### Component Separation Requirements
- **Critical**: The two content studios must remain completely separate and independent
- **BlogContentStudio**: Original design, handles professional blog content creation and workflow management
- **ContentManagementSuite**: Simplified neutral gray design, handles mini-game blocks and @rotationonly content
- **Rule**: When editing one content studio, the other must remain unchanged

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Radix UI components with Tailwind CSS (shadcn/ui design system)
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter
- **Styling**: Tailwind CSS, consistent dark mode (`#17111d`)
- **UI/UX Decisions**: Multi-view dashboard, collapsible sidebar, modal system, Recharts for data visualization, responsive design, custom Godzilla cursor (admin face cursor on About page).

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with TSX
- **Primary Storage**: Notion databases
- **Fallback Storage**: In-memory MemStorage system for Notion unavailability
- **Session Management**: Express sessions with in-memory store
- **Authentication**: Simple admin-based authentication
- **API Structure**: RESTful API design with `/api` prefix, authentication middleware, CRUD operations.

### System Design Choices
- **Data Flow**: React components (TanStack Query) -> Express routes (business logic, storage) -> In-memory storage/Notion -> JSON responses.
- **Data Models**: TypeScript interfaces with Drizzle ORM schemas.
- **Authentication & Authorization**: Admin login, protected routes, 24-hour session persistence. All components use functional admin validation instead of read-only restrictions.
- **SEO Implementation**: Dynamic SEO Head component, structured data (JSON-LD), comprehensive meta tags, sitemap.xml, robots.txt.

### Core Features & Technical Implementations
- **Daily Entry System**: Tracking health, productivity, wellness.
- **Habit Tracking**: Streak counting.
- **Goal Management**: Setting and tracking personal goals.
- **Task Management**: Todo lists with date-based organization, Jira integration for project and task management.
- **Finance Tracking**: Income, expenses, bill, budget, and investment management with analytics.
- **Content Management**: Creation pipeline for social media and digital content, including a comprehensive blogging workflow and a separate CMS for mini-game blocks.
- **Health Monitoring**: Water intake, exercise, meals, sleep, and wellness metrics.
- **Productivity Tools**: Time blocking, focus sessions, and work tracking.
- **Comprehensive Focus Timer System**: Integrated with time blocks, offering Focus, Pomodoro, Deep Work, and Flow State modes with interactive display, session tracking, and audio notifications.
- **Time Block Scheduling**: UI with modal forms, smart suggested time slots, real-time status detection, and duration calculations.
- **Real-time Updates**: Critical across all widgets, with optimistic updates and "Saving..." indicators.
- **Deployment Health**: `/health` and `/` endpoints for quick response times, 2-second caching for `/api/public/active-timer`.

## External Dependencies

- **Notion**: Primary persistent database for core application data (e.g., PRODUCTIVITYTASKS, PRODUCTIVITYTIMEBLOCKS, PRODUCTIVITYTIMERSESSIONS, AIDEVPROJECTS, AIDEVQATESTING).
- **Jira API**: Integrated for comprehensive CRUD operations on issues, projects, and comments, including bidirectional sync.
- **Replit**: Development environment integration.
- **Recharts**: Data visualization library.
- **Web Standards**: Utilizes modern web APIs and standards.
- **@tanstack/react-query**: Server state management.
- **@radix-ui/react-***: UI component primitives.
- **express**: Web server framework.
- **typescript**: Type safety.
- **zod**: Runtime type validation.
- **tsx**: TypeScript execution.
- **vite**: Frontend build tool.
- **vitest**: Testing framework.
- **tailwindcss**: Utility-first CSS framework.