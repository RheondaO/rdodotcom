# replit.md

## Overview

This is a comprehensive digital wellness and productivity platform called "Belle Journal" built with modern web technologies. It features a full-stack architecture with a React frontend, Express backend, and PostgreSQL database using Drizzle ORM. The application provides personal tracking capabilities for health metrics, habits, productivity, finances, and content management.

## User Preferences

Preferred communication style: Simple, everyday language.

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
- **Blog Content Studio**: Complete blogging workflow with posts, ideas, and calendar management

## Key Components

### Core Features
1. **Daily Entry System**: Comprehensive daily tracking for health, productivity, and wellness metrics
2. **Habit Tracking**: Create and monitor daily habits with streak counting
3. **Goal Management**: Set and track personal goals with progress monitoring
4. **Task Management**: Todo lists with date-based organization
5. **Finance Tracking**: Income, expenses, and bill management
6. **Content Management**: Creation pipeline for social media and digital content
7. **Blog Content Studio**: Complete blogging workflow with post development tracking, AI content generation, and content calendar
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
- Blog content studio with workflow tracking and AI content generation capabilities

### Scalability Features
- Connection pooling for database efficiency
- Session-based authentication for horizontal scaling
- Modular component architecture for maintainability
- Type-safe API contracts between frontend and backend