# Cinetech_2.0

A full-stack movie and TV show database application with Next.js, TypeScript, and Node.js.

## Setup Instructions

### Option 1: Manual Setup (Recommended)

1. **Frontend Setup**:
   ```bash
   cd frontend
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   npm install
   npm run dev
   ```

   If you encounter conflicts when running `npx create-next-app@latest . --typescript`, it means the Next.js files are already set up.

2. **Backend Setup**:
   ```bash
   cd api
   npm init -y  # If package.json doesn't exist yet
   npm install typescript ts-node-dev prisma @prisma/client express zod bcrypt jsonwebtoken cors
   npm install -D @types/node @types/express @types/bcrypt @types/cors @types/jsonwebtoken
   ```

3. **Database Setup**:
   - SQLite (Default for development):
     ```bash
     cd api
     # Make sure .env contains: DATABASE_URL="file:./dev.db"
     npx prisma migrate dev --name init
     npx prisma generate
     ```
   - PostgreSQL (Optional):
     - Update `.env` with your PostgreSQL connection string
     - Example: `DATABASE_URL="postgresql://user:password@localhost:5432/cinetech?schema=public"`
     - Make sure PostgreSQL is running at localhost:5432

4. **Starting the Servers**:
   - Frontend: `cd frontend && npm run dev` (runs at http://localhost:3000)
   - Backend: `cd api && npm run dev` (runs at http://localhost:3001)

### Troubleshooting

- **PostgreSQL Connection Issues**: If you see `Error: P1001: Can't reach database server`, ensure your PostgreSQL server is running or switch to SQLite for development.
- **Prisma Folder Exists**: If you see `ERROR A folder called prisma already exists in your project`, you can skip `npx prisma init` and directly run migrations.
- **Next.js Setup Conflicts**: If you see file conflicts when running `create-next-app`, the Next.js project is already set up. Skip this step and proceed with installing dependencies.

## Verification

After setup, you should be able to access:
- Frontend: http://localhost:3000 - Shows the Cinetech 2.0 welcome page
- Backend: http://localhost:3001 - Returns a JSON response confirming the API is running

## Key Features

- Browse movies and TV shows
- User authentication
- Save favorites
- Leave comments and ratings
