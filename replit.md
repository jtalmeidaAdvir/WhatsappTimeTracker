# WhatsApp Time Tracking System

## Overview

This is a full-stack web application that provides employee time tracking functionality through WhatsApp integration. The system allows employees to clock in/out using simple WhatsApp commands and provides a comprehensive dashboard for administrators to manage employees and view attendance records.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: Built-in session handling for development

### Key Components

#### Database Schema
The system uses three main tables:
1. **employees**: Stores employee information (name, phone, department, active status)
2. **attendance_records**: Tracks all time entries (entrada, saida, pausa, volta) with timestamps
3. **whatsapp_messages**: Logs all WhatsApp interactions for audit and processing

#### WhatsApp Integration
- Command processing service that handles incoming WhatsApp messages
- Supports four main commands: `entrada`, `saida`, `pausa`, `volta`
- Automatic employee validation and status tracking
- Message logging and response generation

#### Frontend Pages
- **Dashboard**: Overview with statistics and recent activity
- **Employees**: CRUD operations for employee management
- **Time Records**: View and filter attendance records
- **Reports**: Generate and export time tracking reports
- **WhatsApp Integration**: Test and configure WhatsApp functionality
- **Settings**: System configuration options

## Data Flow

1. **Employee Registration**: Administrators add employees through the web interface
2. **WhatsApp Commands**: Employees send messages to the WhatsApp bot with time tracking commands
3. **Message Processing**: The backend validates commands, checks employee status, and records attendance
4. **Real-time Updates**: The dashboard shows live statistics and recent activities
5. **Reporting**: Administrators can generate reports based on date ranges and employee filters

## External Dependencies

### Production Dependencies
- **UI Components**: Extensive Radix UI component library for accessible interfaces
- **Database**: Neon serverless PostgreSQL for data persistence
- **ORM**: Drizzle ORM for type-safe database operations
- **Validation**: Zod for runtime type validation and schema generation
- **Date Handling**: date-fns for date manipulation and formatting

### Development Dependencies
- **Build Tools**: Vite with React plugin and TypeScript support
- **Code Quality**: ESLint and TypeScript for type checking
- **Runtime**: tsx for TypeScript execution in development

## Deployment Strategy

### Development
- Runs on port 5000 with Vite dev server proxy
- Hot module replacement for frontend development
- TypeScript compilation in watch mode for backend
- PostgreSQL database connection via environment variables

### Production
- **Build Process**: 
  1. Frontend built with Vite to static assets
  2. Backend bundled with esbuild for Node.js execution
- **Deployment Target**: Autoscale deployment on Replit
- **Port Configuration**: External port 80 mapping to internal port 5000
- **Environment**: Production mode with optimized builds

### Configuration Files
- **Drizzle**: Configured for PostgreSQL with migration support
- **Tailwind**: Custom theme with CSS variables for design system
- **TypeScript**: Strict mode with path mapping for clean imports
- **Vite**: Optimized for development with Replit integration

## Changelog
```
Changelog:
- June 26, 2025. Initial setup
- June 26, 2025. Integrated Z-API WhatsApp service with manual processing endpoint
- June 26, 2025. Successfully tested employee time tracking via WhatsApp commands
- June 26, 2025. Fixed webhook automation - Z-API now processes WhatsApp messages automatically
- June 26, 2025. José Vale employee successfully tested automatic point registration via WhatsApp
- June 26, 2025. Enhanced help system - automatic detailed instructions for invalid commands
- June 26, 2025. System fully functional - employees can use entrada/saida/pausa/volta commands via WhatsApp
- June 26, 2025. Successfully migrated from Replit Agent to standard Replit environment
- June 26, 2025. Webhook URL updated for new deployment: https://2b9aa4a1-e1f3-4c79-bbd4-343180632163-00-2p74rqczsfiye.riker.replit.dev/api/whatsapp/webhook
- June 26, 2025. Fixed spam issue - system now properly filters bot messages and test messages to prevent loops
- June 26, 2025. Adjusted filtering logic to allow user messages while preventing bot response loops
- June 26, 2025. System now properly shows help options for invalid commands while preventing spam
- June 26, 2025. Simplified help message to be shorter and clearer for users
- June 26, 2025. Fixed Z-API response handling to eliminate false error messages in logs
- June 26, 2025. Successfully migrated from in-memory storage to PostgreSQL database
- June 26, 2025. All employee data, attendance records, and WhatsApp messages now persist in database
- June 26, 2025. Implemented complete edit/remove functionality for employees with confirmation dialogs
- June 26, 2025. Added employee reactivation feature for previously deactivated employees
- June 26, 2025. Built full settings page with persistent database storage for all configurations
- June 26, 2025. Implemented work hours validation - blocks WhatsApp entries outside configured business hours
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
```