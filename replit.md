# replit.md

## Overview

Belle Journal is a comprehensive digital wellness and productivity platform designed to help users track various aspects of their lives, including health, habits, productivity, finances, and content creation. It aims to provide reliable AI responses and analytics by prioritizing data integrity across all its features. The platform is built with a modern web stack, featuring a React frontend, Express backend, and leverages Notion for primary data storage. The project envisions significant market potential as a robust tool for personal and professional organization, with ambitions to continually integrate advanced features for enhanced user experience and data-driven insights.

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

## Recent Changes
- **August 18, 2025**: ✅ **COMPLETED** - AIDEVQATESTING Notion Database Integration
- **IMPLEMENTATION**: Created complete QA testing integration with server routes, API endpoints, and data models
- **FEATURES**: Full CRUD operations for QA testing records (fetch, create, update), comprehensive QA testing data model with test types, status tracking, priority levels
- **API ENDPOINTS**: `/api/ai-development/qa-testing` (GET, POST, PATCH) with proper error handling and logging
- **DATA MODEL**: QATestingRecord interface with 25+ fields including test cases, environments, browsers, devices, assignments, severity levels
- **FRONTEND INTEGRATION**: ✅ **COMPLETED** - Fixed field mapping issues and project name resolution
- **RESOLVED ISSUES**: Test titles displaying correctly, test types showing properly, project names resolved instead of "No Project"
- **REAL-TIME DATA**: Testing & QA section now displays live Notion data with 3 active test records including "REWIND TIME", "put the ga in qa", and "testing qa ga testing"
- **August 18, 2025**: ✅ **COMPLETED** - TaskCount Field Integration for Project Dashboard
- **RESOLVED**: Dashboard now correctly displays task counts from TaskCount field in AIDEVPROJECTS Notion database
- **IMPLEMENTATION**: Added taskCount property to API integration and frontend components
- **VERIFIED**: Project Portfolio Overview section successfully uses Notion TaskCount values instead of calculated counts
- **August 18, 2025**: ✅ **COMPLETED** - ProjectLength Integration for Average Project Duration
- **REPLACED**: "Time Tracked" metric with "Average Length of Projects" using ProjectLength field from AIDEVPROJECTS
- **CALCULATION**: Updated statistics to calculate average project length across all projects
- **DISPLAY**: Updated Development Insights section to show project length metrics instead of time tracking
- **August 18, 2025**: ✅ **COMPLETED** - Custom Godzilla Cursor Implementation
- **UPDATED**: Replaced purple cursor with user-provided Godzilla image for fun, unique experience
- **SPECIAL FEATURE**: About page (/about) uses admin face image as 70px cursor instead of Godzilla
- **FEATURES**: 60px Godzilla cursor site-wide, 70px admin face cursor on About page
- **TECHNICAL**: React component with RAF animation loop, page-aware cursor switching, completely hides system cursor
- **ASSETS**: Godzilla images (cursor-move.png, cursor-click.png) and admin face images (cursor-admin-move.png, cursor-admin-click.png) in client/public/
- **ANIMATIONS**: Scale down to 0.85x and 5-degree rotation on click with brightness increase
- **August 17, 2025**: ✅ **COMPLETED** - AI App Development Tasks Integration fully working
- **RESOLVED**: Added dedicated tasks database query (`/api/ai-development/tasks`) 
- **RESOLVED**: Fixed task creation to use correct API endpoint instead of projects endpoint
- **RESOLVED**: Updated frontend to fetch existing Notion tasks using separate query
- **RESOLVED**: Fixed TypeScript errors in app-development-notion.ts library function
- **VERIFIED**: Tasks API working correctly - existing tasks being fetched from Notion (confirmed via curl test)
- **FIELD REFERENCE**: Task title field name is consistently **"title"** across frontend form, API, and Notion integration
- **FINAL FIX**: ProjectId field mapping completely resolved - fixed relation field handling and frontend display logic
- **PRODUCTION VERIFIED**: Tasks now show correct project names instead of "No Project" in production interface

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Radix UI components with Tailwind CSS (shadcn/ui design system)
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter
- **Styling**: Tailwind CSS

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with TSX
- **Primary Storage**: Notion databases
- **Fallback Storage**: In-memory MemStorage system for Notion unavailability
- **Session Management**: Express sessions with in-memory store
- **Authentication**: Simple admin-based authentication

### Data Storage Solutions
- **Primary Persistent Storage**: Notion databases (PRODUCTIVITYTASKS, PRODUCTIVITYTIMEBLOCKS, PRODUCTIVITYTIMERSESSIONS)
- **Local Fallback**: MemStorage for temporary data
- **Session Storage**: In-memory session store for authentication
- **Data Models**: TypeScript interfaces with Drizzle ORM schemas
- **Blogging Content Studio**: Complete blogging workflow with posts, ideas, and calendar management.

### Key Components & Features
- **Daily Entry System**: Tracking for health, productivity, and wellness.
- **Habit Tracking**: Monitoring habits with streak counting.
- **Goal Management**: Setting and tracking personal goals.
- **Task Management**: Todo lists with date-based organization.
- **Finance Tracking**: Income, expenses, and bill management.
- **Content Management**: Creation pipeline for social media and digital content.
- **Health Monitoring**: Water intake, exercise, meals, sleep, and wellness metrics.
- **Productivity Tools**: Time blocking, focus sessions, and work tracking.
- **User Interface**: Multi-view dashboard, collapsible sidebar, modal system, Recharts for data visualization, responsive design.
- **Authentication & Authorization**: Admin login, protected routes, 24-hour session persistence.
- **Data Flow**: React components (TanStack Query) -> Express routes (business logic, storage) -> In-memory storage/Notion -> JSON responses.
- **API Structure**: RESTful API design with `/api` prefix, authentication middleware, CRUD operations.
- **Comprehensive Focus Timer System**: Integrated with time blocks, offering Focus, Pomodoro, Deep Work, and Flow State modes. Features include interactive circular display, session tracking, audio notifications, and real-time progress bars.
- **Time Block Scheduling**: Comprehensive UI with modal forms, smart suggested time slots, real-time status detection, and duration calculations.
- **Advanced Financial Management System**: Budget tracking, investment tracking, bill management, income tracking, and financial analytics.
- **Content Management Suite (CMS)**: Simplified neutral gray design for mini-game blocks and @rotationonly content. Features include brand category filtering and interactive effects.
- **SEO Implementation**: Dynamic SEO Head component, structured data (JSON-LD), comprehensive meta tags, sitemap.xml, robots.txt.
- **System-Wide Dark Mode**: Consistent dark mode styling using custom color `#17111d` across all components.

## External Dependencies

### Core Dependencies
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: UI component primitives
- **express**: Web server framework
- **typescript**: Type safety
- **zod**: Runtime type validation

### Development Dependencies
- **tsx**: TypeScript execution
- **vite**: Frontend build tool
- **vitest**: Testing framework
- **tailwindcss**: Utility-first CSS framework

### Third-party Integrations
- **Notion**: Primary persistent database for core application data (PRODUCTIVITYTASKS, PRODUCTIVITYTIMEBLOCKS, PRODUCTIVITYTIMERSESSIONS).
- **Replit**: Development environment integration.
- **Web Standards**: Utilizes modern web APIs and standards.
- **Recharts**: Data visualization library.