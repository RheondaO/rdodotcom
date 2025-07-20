# replit.md

## Overview

This is a comprehensive digital wellness and productivity platform called "Belle Journal" built with modern web technologies. It features a full-stack architecture with a React frontend, Express backend, and PostgreSQL database using Drizzle ORM. The application provides personal tracking capabilities for health metrics, habits, productivity, finances, and content management.

## User Preferences

Preferred communication style: Simple, everyday language.

### Component Separation Requirements
- **Critical**: The two content studios must remain completely separate and independent
- **BlogContentStudio**: Original design, handles professional blog content creation and workflow management
- **ContentManagementSuite**: Simplified neutral gray design, handles mini-game blocks and @rotationonly content
- **Rule**: When editing one content studio, the other must remain unchanged

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI components with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with shadcn/ui design system

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with TSX for compilation
- **Storage**: In-memory storage for data persistence
- **Session Management**: Express sessions with in-memory store
- **Authentication**: Simple admin-based authentication system

### Data Storage Solutions
- **Primary Storage**: In-memory storage for data persistence with sample data initialization
- **Session Storage**: In-memory session store
- **Data Models**: TypeScript interfaces for type safety
- **Blogging Content Studio**: Complete blogging workflow with posts, ideas, and calendar management

## Key Components

### Core Features
1. **Daily Entry System**: Comprehensive daily tracking for health, productivity, and wellness metrics
2. **Habit Tracking**: Create and monitor daily habits with streak counting
3. **Goal Management**: Set and track personal goals with progress monitoring
4. **Task Management**: Todo lists with date-based organization
5. **Finance Tracking**: Income, expenses, and bill management
6. **Content Management**: Creation pipeline for social media and digital content
7. **Blogging Content Studio**: Complete blogging workflow with post development tracking, AI content generation, and content calendar
8. **Health Monitoring**: Water intake, exercise, meals, sleep, and wellness metrics
9. **Productivity Tools**: Time blocking, focus sessions, and work tracking

### User Interface Components
- **Dashboard**: Multi-view dashboard with day/week/month perspectives
- **Sidebar Navigation**: Collapsible sidebar with theme toggle
- **Modal System**: Quick-add functionality and detailed forms
- **Chart Components**: Data visualization using Recharts
- **Responsive Design**: Mobile-friendly interface

### Authentication & Authorization
- **Simple Authentication**: Admin login with session management
- **Public Views**: Limited public access to certain statistics
- **Protected Routes**: Admin-only dashboard access
- **Session Persistence**: 24-hour session duration

## Data Flow

1. **Client Requests**: React components make API calls via TanStack Query
2. **Server Processing**: Express routes handle business logic and storage operations
3. **Storage Operations**: In-memory storage manages data persistence
4. **Response Handling**: JSON responses with proper error handling
5. **State Management**: Client-side caching and synchronization via React Query

### API Structure
- RESTful API design with `/api` prefix
- Authentication middleware on protected routes
- CRUD operations for all major entities
- Public endpoints for limited data access

## External Dependencies

### Core Dependencies
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: UI component primitives
- **express**: Web server framework
- **typescript**: Type safety across the stack
- **zod**: Runtime type validation

### Development Dependencies
- **tsx**: TypeScript execution for development
- **vite**: Frontend build tool
- **vitest**: Testing framework
- **tailwindcss**: Utility-first CSS framework

### Third-party Integrations
- **Replit**: Development environment integration
- **Web Standards**: Uses modern web APIs and standards

## Deployment Strategy

### Production Deployment
- **Primary Command**: `npx tsx server/index.ts`
- **Alternative Commands**: Multiple startup options available for different environments
- **Static Assets**: Vite builds to `dist/public` directory
- **Environment Variables**: Session secret configuration for production security

### Development Workflow
- **Development Server**: `npm run dev` for local development
- **Testing**: Vitest for unit and integration tests
- **Build Process**: Vite for optimized production builds

### Deployment Considerations
- Node.js v20+ compatibility with modern ES modules
- Environment-specific configuration via environment variables
- Session secret configuration for production security
- In-memory storage resets on deployment (data is not persistent)
- Static file serving handled by Express in production
- Blogging content studio with workflow tracking and AI content generation capabilities

### Scalability Features
- Connection pooling for database efficiency
- Session-based authentication for horizontal scaling
- Modular component architecture for maintainability
- Type-safe API contracts between frontend and backend

## Recent Changes (2025)

### Time Block Scheduling Feature & Header Improvements (July 20, 2025)
- **Complete Time Block UI**: Built comprehensive Time Block scheduling feature in ProductivitySection
  - Modal form with title, description, start/end time, category selection, and validation
  - Smart suggested time slots that avoid conflicts with existing blocks
  - Enhanced visual display with status indicators (Active, Done, Upcoming)
  - Real-time status detection based on current time and selected date
  - Duration calculations and category icons for better UX
- **Header Date & Time Enhancement**: Improved header display functionality
  - Right-side date now always shows today's actual date regardless of Yesterday/Tomorrow selection
  - Added live Universal Time with seconds precision (e.g., "Jul 20, 2025 • 15:52:30 UTC")
  - Implemented real-time clock that updates every second without page refresh
  - Left-side contextual date format remains unchanged and functional
- **Dark Mode Consistency**: All new components use custom dark color #17111d for proper styling
- **Notion Integration Update**: Updated to use new secret names NOTION_TASKS_URL and NOTION_TIMEBLOCKS_URL with proper database ID extraction
  - Tasks database: PRODUCTIVITYTASKS (ID: 22ef3f41...)
  - Time Blocks database: PRODUCTIVITYTIMEBLOCKS (ID: 236f3f41...)
  - Environment variables properly configured and detected by server
  - Resolution: ✅ Tasks integration fully working with 8+ tasks retrieved from Notion
  - Status: ✅ Authentication resolved, database access updated, API routes functioning correctly  
  - Time Blocks Fix: ✅ Schema mapping resolved - UI date/time fields now convert to Notion datetime format  
  - Complete Success: Both tasks and time blocks now fully integrated with Notion databases

#### **Notion Integration Naming Conventions & Standards**
- **Environment Variables**: Use `NOTION_[FEATURE]_URL` format (e.g., `NOTION_TASKS_URL`, `NOTION_TIMEBLOCKS_URL`)
- **Database Names**: Use `PRODUCTIVITY[FEATURE]` format (e.g., `PRODUCTIVITYTASKS`, `PRODUCTIVITYTIMEBLOCKS`)  
- **API Routes**: Primary routes use `/api/[feature]` with Notion fallback logic built-in
- **Schema Mapping**: UI date/time separation converts to Notion datetime format (`YYYY-MM-DDTHH:mm:ss`)
- **Property Names**: Notion uses "Start Time" and "End Time" as **date** properties, not text
- **Date Filtering**: Use `on_or_after` and `before` with datetime ranges for date-specific queries
- **Duplicate Route Prevention**: Only one route per endpoint - enhanced version with Notion integration
- **Error Handling**: Graceful fallback to local storage when Notion integration fails
- **ID Handling**: String IDs indicate Notion records, numeric IDs indicate local storage records
- **Duration Calculation**: UI calculates duration, stored as minutes in Notion `Duration` number property
- **Duration Display**: Backend calculates and returns duration for both creation and retrieval operations

### System-Wide Dark Mode CSS Fix (July 20, 2025)
- **Complete CSS Syntax Resolution**: Fixed all instances of problematic `dark:[background-color:var(--custom-dark)]` syntax
- **Systematic Search & Replace**: Updated all components to use proper `dark:bg-[#17111d]` syntax
- **Comprehensive Coverage**: Fixed white background issues across all pages and components
- **Components Updated**: ProductivitySection, HealthSection, AppDevelopmentSection, BlogContentStudio, ContentManagementSuite, and all page components

### ContentManagementSuite Dark Mode Enhancement (July 16, 2025)
- **Complete Dark Mode Styling**: Applied consistent `#0c0910` darker background to all containers in Mini-Game Block Studio
- **Visual Depth Enhancement**: Used darker shade `#0c0910` for cards to create layered depth effect against `#17111d` main background
- **Pink Border Accent**: Added thin pink borders `border-pink-200/50 dark:border-pink-800/50` to all containers matching PublicView design
- **Gradient Category Pills**: Enhanced @rotationonly brand filter pills with distinct gradient backgrounds:
  - `@rotationonly.mag` (📰): Blue gradient
  - `@rotationonly.econ` (💰): Green gradient  
  - `@rotationonly.xxx` (🔥): Red gradient
  - `@rotationonly.ext` (🌐): Purple gradient
  - `@rotationonly.stem` (🔬): Orange gradient
  - `@rotationonly.music` (🎵): Pink gradient
  - `@rotationonly.ceo` (💼): Yellow gradient
- **Interactive Effects**: Added hover states, scaling, and shadow effects for better user experience
- **Comprehensive Coverage**: Applied styling to stats cards, block containers, and form sections (Create, Analytics, Progress)

### Complete Dark Mode Standardization to Custom Color (July 16, 2025)
- **Global Dark Mode Update**: Implemented custom dark color `#17111d` across the entire platform
- **Comprehensive Color Replacement**: Updated all components to use consistent dark mode background
- **Technical Implementation**:
  - Added `--custom-dark: #17111d` CSS variable to root and dark theme
  - Replaced all instances of `dark:bg-gray-900`, `dark:bg-gray-800`, `dark:bg-gray-700`, `dark:bg-gray-600`
  - Updated hover states, badges, and form elements to use custom color
  - Applied changes to all 50+ components including Blog Studio, Content Management, Finance, Health, Productivity sections
- **User Experience**: Uniform dark mode appearance across all sections and components
- **Coverage**: Updated all `.tsx` files in components, pages, and UI elements
- **Consistent Styling**: All dark mode backgrounds now use `dark:[background-color:var(--custom-dark)]`

### Comprehensive SEO Implementation (July 16, 2025)
- **Complete SEO Optimization**: Built comprehensive SEO system targeting "Rheonda Ogletree", "Rheonda D Ogletree", and "Rheonda" search terms
- **Core Components**:
  - Dynamic SEO Head component with real-time meta tag management
  - Structured data (JSON-LD) implementation for Person, Website, and BlogPost schemas
  - Comprehensive meta tags including Open Graph and Twitter Card optimization
  - Sitemap.xml and robots.txt for search engine crawling
- **Content Strategy**:
  - About page with detailed biography and expertise showcase
  - Featured blog article with SEO-optimized content
  - Cross-linking strategy between all pages
  - Target keyword integration throughout content
- **Technical SEO**:
  - Clean URL structure with keyword-rich paths
  - Mobile optimization and responsive design
  - Page load speed optimization
  - Canonical URL implementation
- **Search Engine Optimization**:
  - Primary targeting: "Rheonda Ogletree", "Rheonda D Ogletree", "Rheonda"
  - Secondary targeting: "digital wellness", "productivity expert", "Belle Journal"
  - Business & Tech targeting: "Entrepreneurship", "Vibe Coding", "Replit", "Web App", "Prompt Engineer", "AI", "girl boss", "business"
  - Brand targeting: "really obvious media lab", "rotationonly", "rotationonly.mag", "RODML", "@rotationonly on apple music"
  - Rich snippets and enhanced search results appearance
  - Social media sharing optimization
- **Implementation Files**:
  - `SEOHead.tsx` - Dynamic SEO management component
  - `structuredData.ts` - JSON-LD schema generators
  - `About.tsx` - Comprehensive biography page
  - `RheondaOgletreeBlog.tsx` - SEO-optimized blog article
  - `sitemap.xml` and `robots.txt` - Search engine directives

### Security Updates
- **CVE-2025-30208 Fix (July 13, 2025)**: Updated Vite from 5.4.14 to 5.4.15 to resolve security vulnerability
- **Impact**: Minimal patch with no breaking changes, application functionality preserved

### Notion Integration Implementation & Standards (July 13-20, 2025)
- **Complete Notion Integration**: Built full-featured Notion API integration with existing PRODUCTIVITYTASKS database
- **Core Features**: 
  - Read/write access to existing Notion database entries
  - Real-time synchronization between Belle Journal and Notion
  - Task management with create, update, and delete operations
  - Seamless authentication integration with admin controls
- **Technical Components**:
  - Notion API client setup with credential management
  - Database schema adaptation for existing TABLEMAKER structure
  - REST API endpoints for full CRUD operations
  - React frontend component with modern UI
  - Error handling and connection status monitoring
- **User Experience**: 
  - Integrated as primary task widget in ProductivitySection
  - Real-time task list showing existing Notion entries
  - Create/edit forms with proper validation
  - Connection status indicators and setup verification
- **Database Integration**: Successfully connected to user's existing PRODUCTIVITYTASKS database
- **Enhanced Database Schema**: Added complete productivity task properties including:
  - Task title, description, and category fields
  - Priority levels (High, Medium, Low) and status tracking
  - Estimated duration in minutes and due date/time
  - Created and completed date tracking
  - 8 predefined categories for task organization
- **Productivity Widget**: Built comprehensive daily task management with:
  - Date-based task filtering (today, yesterday, tomorrow views)
  - Real-time task completion tracking with progress indicators
  - Task duration estimation and time tracking
  - Priority-based task organization and filtering
  - Full CRUD operations with proper authentication
- **UI Integration**: Replaced main "Today's Tasks" widget in ProductivitySection with Notion integration
- **Navigation**: Hidden Notion integration from sidebar navigation for cleaner interface
- **Simplified Interface**: Removed redundant local tasks section, using only Notion tasks as primary task management

### Production Deployment Resolution (July 13, 2025)
- **Issue**: Notion tasks widget showing "Connection Failed" in production despite environment variables being configured
- **Root Cause**: Environment variables needed to be refreshed/re-entered in production deployment
- **Solution**: Enhanced error handling and debugging capabilities added to diagnose production issues
- **Resolution**: User re-entered secrets in production environment, resolving the connection issue
- **Improvements**: Added comprehensive logging, specific error messages, and production debugging tools

### Major Feature Enhancements (July 13, 2025)

#### Advanced Financial Management System
- **Budget Management**: Complete budget tracking with category management and spending analytics
- **Investment Tracking**: Portfolio management with performance metrics and goal monitoring
- **Bill Management**: Automated bill tracking with due dates and payment reminders
- **Income Tracking**: Multiple income source management with recurring and one-time entries
- **Financial Analytics**: Advanced spending pattern analysis and trend visualization
- **Access Control**: Full CRUD operations for admins, read-only access for public users

#### Blog Content Studio Enhancement
- **Grid/List View Toggle**: Flexible content display with responsive grid cards and structured list view
- **Comprehensive Workflow**: Ideas management, post creation, and content calendar integration
- **Visual Improvements**: Line-clamp text truncation, badge system, and enhanced metadata display
- **Access Control**: Admin-only editing capabilities with proper authentication integration

#### ContentManagementSuite Updates
- **Color Scheme**: Simplified from bright gradients to neutral gray design for professional appearance
- **Header Layout**: Reduced header size from large to compact layout
- **Brand Categories**: Updated to seven specific @rotationonly categories:
  - @rotationonly.mag (📰 Magazine content)
  - @rotationonly.econ (💰 Economic content)
  - @rotationonly.xxx (🔥 Adult content)
  - @rotationonly.ext (🌐 External content)
  - @rotationonly.stem (🔬 Science/Tech content)
  - @rotationonly.music (🎵 Music content)
  - @rotationonly.ceo (💼 Executive content)

#### Analytics & Reporting Enhancements
- **Social Media Analytics**: Content performance tracking with engagement metrics
- **Financial Analytics**: Advanced financial insights with spending patterns
- **Productivity Analytics**: Work efficiency metrics and time allocation analysis
- **Comprehensive Reports**: Multi-dimensional progress tracking and insights

#### Access Control Implementation
- **Authentication System**: Proper admin/public user differentiation across all components
- **CRUD Restrictions**: Read-only access for public users, full operations for authenticated admins
- **Security Pattern**: Consistent isReadOnly prop implementation throughout application
- **User Experience**: Disabled buttons and visual indicators for restricted actions

#### Site Map Enhancement
- **Comprehensive Navigation**: Updated with all new features and capabilities
- **Quick Actions**: Enhanced shortcuts for common tasks across all sections
- **Feature Documentation**: Detailed descriptions of new functionality and improvements