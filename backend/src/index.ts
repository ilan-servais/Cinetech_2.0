import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/authRoutes'
import apiRoutes from './routes'
import { verifyToken } from './middlewares/authMiddleware'

dotenv.config()
const app = express()
const PORT = Number(process.env.PORT) || 8080

// Ton domaine prod fixe
const FRONTEND_URL = process.env.FRONTEND_URL!  
if (!FRONTEND_URL) {
  console.error('❌ Missing FRONTEND_URL env var')
  process.exit(1)
}

// Ajouter au début du fichier, après dotenv.config()
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL missing. Checking alternative variables...');
  
  // Vérifier les alternatives fournies par Railway
  if (process.env.POSTGRES_URL) {
    console.log('✅ Using POSTGRES_URL as DATABASE_URL');
    process.env.DATABASE_URL = process.env.POSTGRES_URL;
  } else if (process.env.DATABASE_PUBLIC_URL) {
    console.log('✅ Using DATABASE_PUBLIC_URL as DATABASE_URL');
    process.env.DATABASE_URL = process.env.DATABASE_PUBLIC_URL;
  } else {
    console.error('❌ No database URL found. Application will likely fail.');
  }
}

// Définir les origines autorisées AVANT de les utiliser
const allowedOrigins = [
  'http://localhost:3000',
  'https://cinetech-2-0.vercel.app',
  FRONTEND_URL,
];

// 1) CORS global, avant toutes les routes
app.use(cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`Not allowed by CORS: ${origin}`), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Gestion explicite des requêtes OPTIONS pour les preflight CORS
app.options('*', cors());

app.use(express.json())
app.use(cookieParser())

// 2) Routes publiques
app.get('/health', (_req, res) => res.json({ status: 'OK' }))
app.use('/api/auth', authRoutes)

// 3) Protéger le reste
app.use('/api', verifyToken, apiRoutes)

// 4) Démarrage
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Si c'est une erreur Prisma, afficher plus de détails
  if (reason instanceof Error && reason.name.startsWith('Prisma')) {
    console.error('Prisma Error Details:', {
      name: reason.name,
      code: (reason as any).code,
      meta: (reason as any).meta,
      databaseURL: process.env.DATABASE_URL ? 
        process.env.DATABASE_URL.replace(/\/\/.*:.*@/, '//***:***@') : 'Not set'
    });
  }
});

export default app
