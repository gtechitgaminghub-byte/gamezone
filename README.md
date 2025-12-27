# GameZone - PC Gaming Rental Management System

A full-stack web application for managing PC gaming rental operations. Built with React (Frontend), Express (Backend), PostgreSQL (Database), and TypeScript.

## Project Overview

GameZone is a comprehensive management system for PC gaming rental businesses. It allows you to:
- **Manage PCs**: Track inventory, status, and configuration of gaming PCs
- **Handle Sessions**: Monitor rental sessions and track usage
- **Manage Users**: Handle customer and staff accounts
- **View Analytics**: Get insights into rental statistics and performance

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Backend** | Express.js + TypeScript |
| **Database** | PostgreSQL |
| **ORM** | Drizzle ORM |
| **UI Components** | Shadcn UI + Tailwind CSS |
| **State Management** | React Query (TanStack Query) |
| **Authentication** | Passport.js |

---

## Project Structure

```
gamezone/
├── client/                      # Frontend (React)
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── ui/             # Shadcn UI components
│   │   │   └── *.tsx           # Custom components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Utilities and helpers
│   │   ├── pages/              # Page components
│   │   │   ├── Auth.tsx        # Login page
│   │   │   ├── Dashboard.tsx   # Main dashboard
│   │   │   ├── Pcs.tsx         # PC management
│   │   │   ├── Sessions.tsx    # Session management
│   │   │   └── Users.tsx       # User management
│   │   ├── App.tsx             # Main app component
│   │   ├── main.tsx            # Entry point
│   │   └── index.css           # Global styles
│   ├── index.html              # HTML template
│   └── package.json
│
├── server/                      # Backend (Express)
│   ├── index.ts                # Main server entry
│   ├── routes.ts               # API routes
│   ├── storage.ts              # Data storage interface
│   ├── db.ts                   # Database configuration
│   └── vite.ts                 # Vite integration
│
├── shared/                      # Shared code
│   ├── schema.ts               # Data models/schemas
│   └── routes.ts               # API route types
│
├── vite.config.ts              # Vite configuration
├── tailwind.config.ts          # Tailwind CSS config
├── tsconfig.json               # TypeScript config
├── drizzle.config.ts           # Database migration config
└── package.json                # Project dependencies
```

---

## Prerequisites

Before you begin, ensure you have the following installed on your PC:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (v9 or higher) - Comes with Node.js
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)

### Check Installation

```bash
# Verify Node.js
node --version

# Verify npm
npm --version

# Verify PostgreSQL
psql --version
```

---

## Installation Guide

### Step 1: Clone the Repository

```bash
git clone https://github.com/gtechitgaminghub-byte/gamezone.git
cd gamezone
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages for both frontend and backend.

### Step 3: Set Up PostgreSQL Database

#### Option A: Using Default PostgreSQL Installation (Recommended)

```bash
# Connect to PostgreSQL
psql -U postgres

# In the PostgreSQL terminal, create a database:
CREATE DATABASE gamezone_db;

# Exit PostgreSQL
\q
```

#### Option B: Using PostgreSQL CLI (Windows)

If you installed PostgreSQL via installer, use pgAdmin or:

```bash
# Navigate to PostgreSQL bin directory and run:
createdb -U postgres gamezone_db
```

### Step 4: Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Database Connection String
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/gamezone_db"

# Session Secret (generate any random string)
SESSION_SECRET="your-super-secret-key-here-change-this"

# Environment
NODE_ENV="development"
```

**Replace `YOUR_PASSWORD` with your PostgreSQL password.**

### Step 5: Initialize Database

```bash
npm run db:push
```

This will create all necessary tables in your PostgreSQL database.

---

## Running the Application

### Development Mode (Recommended)

Run both frontend and backend together:

```bash
npm run dev
```

This will:
- Start the Express backend on `http://localhost:5000`
- Start the Vite frontend dev server (served through the same port)
- Open the app in your browser automatically

**The app will be available at: `http://localhost:5000`**

### Production Build

```bash
# Build the application
npm run build

# Start the production server
npm start
```

---

## Server Code Details

### Backend Structure

**File:** `server/index.ts`
- Main Express server setup
- Port configuration (5000)
- Middleware setup (sessions, authentication)
- Vite integration for serving frontend

**File:** `server/routes.ts`
- All API endpoints
- Request/response handling
- Data validation

**File:** `server/storage.ts`
- Database interface/abstraction
- CRUD operations
- Business logic

**File:** `server/db.ts`
- PostgreSQL connection setup
- Database initialization

### Key API Routes

```
POST   /api/auth/login           - User login
POST   /api/auth/logout          - User logout
GET    /api/users                - Get all users
POST   /api/users                - Create user
GET    /api/pcs                  - Get all PCs
POST   /api/pcs                  - Create PC
PATCH  /api/pcs/:id              - Update PC
GET    /api/sessions             - Get all sessions
POST   /api/sessions             - Create session
GET    /api/stats                - Get statistics
```

---

## Client Code Details

### Frontend Structure

**File:** `client/src/App.tsx`
- Main app component
- Route configuration
- Theme provider setup

**Directory:** `client/src/pages/`
- `Auth.tsx` - Login/authentication page
- `Dashboard.tsx` - Main dashboard with analytics
- `Pcs.tsx` - PC inventory management
- `Sessions.tsx` - Session management
- `Users.tsx` - User management

**Directory:** `client/src/components/`
- Reusable React components
- `PcCard.tsx` - PC card display
- `StatusBadge.tsx` - Status indicator
- `Sidebar.tsx` - Navigation sidebar
- `ui/` - Shadcn UI components

**Directory:** `client/src/hooks/`
- Custom React hooks for data fetching
- `use-pcs.ts` - PC data operations
- `use-sessions.ts` - Session data operations
- `use-users.ts` - User data operations
- `use-stats.ts` - Statistics data

### Frontend Features

- **Authentication**: Login/logout with session management
- **Dashboard**: Real-time analytics and statistics
- **PC Management**: Add, edit, delete, and track PCs
- **Session Management**: Monitor rental sessions
- **User Management**: Manage customers and staff
- **Dark Mode**: Theme toggle support

---

## Database Schema

### Main Tables

**users**
```sql
- id (PK)
- username (unique)
- password (hashed)
- email
- role (admin/user)
- createdAt
```

**pcs**
```sql
- id (PK)
- name
- model
- status (available/rented/maintenance)
- specs (GPU, CPU, RAM)
- hourlyRate
```

**sessions**
```sql
- id (PK)
- pcId (FK)
- userId (FK)
- startTime
- endTime
- status (active/completed)
```

---

## Common Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Check TypeScript compilation
npm run check

# Push database changes
npm run db:push
```

---

## Troubleshooting

### Issue: "Cannot find module 'pg'"

**Solution:**
```bash
npm install pg
```

### Issue: PostgreSQL Connection Error

**Check:**
1. PostgreSQL service is running
2. Database exists: `createdb -U postgres gamezone_db`
3. DATABASE_URL in `.env` is correct
4. Check PostgreSQL is listening on `localhost:5432`

**On Windows:**
- Open Services (services.msc)
- Find "postgresql-x64-xx" and ensure it's running

### Issue: Port 5000 Already in Use

**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### Issue: npm install fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

---

## Development Workflow

### Adding a New Feature

1. **Update Database Schema** (if needed):
   ```bash
   # Edit shared/schema.ts
   # Then run:
   npm run db:push
   ```

2. **Create Backend API** (server/routes.ts):
   - Add new endpoint
   - Implement business logic

3. **Update Storage Interface** (server/storage.ts):
   - Add CRUD methods

4. **Create Frontend Components** (client/src/components/):
   - Build UI components

5. **Add Page or Hook** (client/src/pages/ or client/src/hooks/):
   - Implement page logic
   - Fetch data using React Query

---

## Environment Variables Reference

```
DATABASE_URL          - PostgreSQL connection string
SESSION_SECRET        - Secret key for session encryption
NODE_ENV              - Environment (development/production)
```

---

## Deployment

For deploying to production, refer to your hosting provider's documentation:
- **Heroku**: [Node.js Deployment](https://devcenter.heroku.com/articles/nodejs-support)
- **Railway**: [Railway Docs](https://docs.railway.app/)
- **Render**: [Render Docs](https://render.com/docs)

---

## Support & Contribution

For issues or contributions, please visit the [GitHub repository](https://github.com/gtechitgaminghub-byte/gamezone).

---

## License

This project is licensed under the MIT License - see LICENSE file for details.

---

## Quick Start Summary

```bash
# 1. Clone
git clone https://github.com/gtechitgaminghub-byte/gamezone.git
cd gamezone

# 2. Install
npm install

# 3. Setup Database
# Create database in PostgreSQL:
createdb -U postgres gamezone_db

# 4. Create .env file with DATABASE_URL

# 5. Run
npm run db:push
npm run dev

# 6. Open browser to http://localhost:5000
```

That's it! Your gaming rental management system is ready to use.
