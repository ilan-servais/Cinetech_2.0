// Charger dotenv AVANT tous les autres imports
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';
import apiRoutes from './routes';
import { verifyToken } from './middlewares/authMiddleware';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Configuration stricte des origines CORS
const allowedOrigins = [
  'http://localhost:3000',
  'https://cinetech-2-0.vercel.app',
  process.env.FRONTEND_URL || ''
].filter(Boolean);

console.log('🔒 CORS configured for origins:', allowedOrigins);
console.log('🚀 Build version:', new Date().toISOString());
console.log('🔧 Railway rebuild test:', process.env.NODE_ENV);

// Options CORS avec gestion stricte de l'origine
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Permettre les requêtes sans origine (comme Postman)
    if (!origin) {
      console.log('🔓 CORS: Request without origin allowed (Postman/curl)');
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS: Origin allowed:', origin);
      callback(null, true);
    } else {
      console.warn('❌ CORS blocked:', origin);
      callback(new Error(`CORS blocked: ${origin} not allowed`), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// 1) CORS doit être appliqué AVANT toute autre middleware
app.use(cors(corsOptions));

// Gestion explicite des preflight OPTIONS pour le CORS
app.options('*', cors(corsOptions));

// 2) Parsers JSON et cookies APRÈS CORS
app.use(express.json());
app.use(cookieParser());

// 3) Routes publiques non protégées par JWT
app.get('/health', (_req, res) => res.json({ status: 'OK' }));
app.use('/api/auth', authRoutes);

// 4) Routes API protégées par JWT
app.use('/api', verifyToken, apiRoutes);

// 5) Gestion d'erreurs globale
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    message: 'Une erreur est survenue sur le serveur',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// 6) Surveillance des erreurs Prisma non gérées
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Afficher plus de détails pour les erreurs Prisma
  if (reason instanceof Error && reason.name.includes('Prisma')) {
    console.error('Prisma Error Details:', {
      name: reason.name,
      code: (reason as any).code,
      meta: (reason as any).meta
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔧 Build timestamp: ${new Date().toISOString()}`);
});

export default app;
// Force rebuild - Fix req.body undefined & CORS headers $(date)
