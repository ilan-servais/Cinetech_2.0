# Cinetech_2.0

A full-stack movie and TV show database application with Next.js, TypeScript, and Node.js.

## Setup Instructions

### Option 1: Automated Setup

Run the setup script to automatically install dependencies and set up the database:

```bash
node setup.js
```

### Option 2: Manual Setup

1. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   ```

2. **Backend Setup**:
   ```bash
   cd api
   npm install
   ```

3. **Database Setup**:
   - For SQLite (development):
     - Make sure your `.env` file contains: `DATABASE_URL="file:./dev.db"`
   - For PostgreSQL:
     - Update `.env` with your PostgreSQL connection string
     - Example: `DATABASE_URL="postgresql://user:password@localhost:5432/cinetech?schema=public"`

4. **Prisma Setup**:
   ```bash
   cd api
   npx prisma generate
   npx prisma migrate dev --name init
   ```

## Development

- **Frontend**: `cd frontend && npm run dev`
  - Runs at http://localhost:3000

- **Backend**: `cd api && npm run dev`
  - Runs at http://localhost:3001

## Key Features

- Browse movies and TV shows
- User authentication
- Save favorites
- Leave comments and ratings
