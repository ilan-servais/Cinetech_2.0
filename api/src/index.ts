import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { prisma } from './lib/prisma';
import authRoutes from './routes/auth';

// Load environment variables
dotenv.config();

// Log important environment variables (without sensitive info)
console.log('Environment Variables Check:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('- DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('- JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('- TMDB_API_KEY exists:', !!process.env.TMDB_API_KEY);

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Cinetech API is running',
    timestamp: new Date()
  });
});

// Routes
app.use('/api/auth', authRoutes);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Erreur serveur'
  });
});

// Tester la connexion Prisma avant de démarrer le serveur
async function startServer() {
  try {
    // Vérifier la connexion à la BDD
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful!');

    // Démarrer le serveur si la connexion est réussie
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to the database:', error);
    process.exit(1);
  }
}

// Démarrer l'application
startServer();

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Disconnected from database');
  process.exit(0);
});
