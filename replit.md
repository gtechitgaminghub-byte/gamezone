# GameZone - PC Gaming Rental Management System

## Project Overview
A full-stack web application for managing PC gaming rental operations.

## GitHub Repository
- **Repository**: https://github.com/gtechitgaminghub-byte/gamezone/
- **Connection Type**: Manual Git setup (no OAuth integration)

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js + TypeScript + Passport.js
- **Database**: PostgreSQL + Drizzle ORM
- **UI Framework**: Shadcn UI

## Current Features
1. **Authentication**: User login with session management
2. **Dashboard**: Analytics and statistics view
3. **PC Management**: Add, edit, delete gaming PCs
4. **Session Management**: Track rental sessions
5. **User Management**: Manage customers and staff
6. **Dark Mode**: Theme toggle support

## Architecture

### Backend (Server)
- Location: `/server`
- Entry point: `server/index.ts`
- Main files:
  - `routes.ts` - API endpoints
  - `storage.ts` - Data access layer
  - `db.ts` - Database connection

### Frontend (Client)
- Location: `/client/src`
- Main app: `App.tsx`
- Pages: `/pages` directory
- Components: `/components` directory
- Hooks: `/hooks` directory

### Shared
- Location: `/shared`
- Contains: Data schemas and types

## Development Commands

```bash
npm run dev      # Start dev server (frontend + backend)
npm run build    # Build for production
npm start        # Run production build
npm run db:push  # Push database schema changes
npm run check    # TypeScript type checking
```

## Key Notes for Future Development
- Always update `/shared/schema.ts` first when adding new data models
- Backend handles API routes in `/server/routes.ts`
- Frontend uses React Query for data fetching
- Tailwind CSS for styling with shadcn/ui components
- Use Drizzle ORM for database operations

## Environment Setup
- Requires PostgreSQL running locally or accessible
- All env vars documented in README.md
- Database migrations handled by Drizzle ORM

## User Preferences
- Full-stack JavaScript with TypeScript
- Modern React patterns
- Minimal file organization (collapse similar components)
- Backend should focus on data persistence and API calls
