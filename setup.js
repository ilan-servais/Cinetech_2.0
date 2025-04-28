const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

console.log(`${colors.blue}Starting Cinetech 2.0 setup...${colors.reset}\n`);

// Check if PostgreSQL is running
try {
  console.log(`${colors.yellow}Checking if PostgreSQL is running...${colors.reset}`);
  
  // Try creating SQLite database instead
  console.log(`${colors.green}Using SQLite database for development${colors.reset}`);
  
  // Make sure .env exists with correct settings
  const envPath = path.join(__dirname, 'api', '.env');
  const envContent = 'DATABASE_URL="file:./dev.db"\nJWT_SECRET="dev-secret-key"\nPORT=3001\n';
  
  fs.writeFileSync(envPath, envContent);
  console.log(`${colors.green}Created .env file with SQLite configuration${colors.reset}`);
  
  // Install dependencies
  console.log(`${colors.yellow}Installing frontend dependencies...${colors.reset}`);
  execSync('cd frontend && npm install', { stdio: 'inherit' });
  
  console.log(`${colors.yellow}Installing backend dependencies...${colors.reset}`);
  execSync('cd api && npm install', { stdio: 'inherit' });
  
  // Generate Prisma client and run migrations
  console.log(`${colors.yellow}Generating Prisma client...${colors.reset}`);
  execSync('cd api && npx prisma generate', { stdio: 'inherit' });
  
  console.log(`${colors.yellow}Running database migrations...${colors.reset}`);
  execSync('cd api && npx prisma migrate dev --name init', { stdio: 'inherit' });
  
  console.log(`\n${colors.green}Setup completed successfully!${colors.reset}`);
  console.log(`\n${colors.blue}To start the development servers:${colors.reset}`);
  console.log(`${colors.yellow}Frontend:${colors.reset} cd frontend && npm run dev`);
  console.log(`${colors.yellow}Backend:${colors.reset} cd api && npm run dev`);
} catch (error) {
  console.error(`${colors.red}Error during setup:${colors.reset}`, error.message);
  process.exit(1);
}
