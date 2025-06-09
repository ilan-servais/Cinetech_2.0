import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';
import apiRoutes from './routes';
import { verifyToken } from './middlewares/authMiddleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const FRONTEND_URL = process.env.FRONTEND_URL!; // doit être exactement "https://cinetech-2-0.vercel.app"

console.log('✅ CORS origin:', FRONTEND_URL);

// Configuration CORS commune
const corsOptions = {
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 204 as const,
};

// 1) Middleware global CORS (inclut automatiquement la gestion des OPTIONS)
app.use(cors(corsOptions));

// 2) Explicitement autoriser tous les OPTIONS sur toutes les routes
app.options('*', cors(corsOptions));

// 3) Parser JSON et cookies
app.use(express.json());
app.use(cookieParser());

// 4) Routes publiques (pas encore de vérification de token)
app.use('/api/auth', authRoutes);
app.get('/health', (_req: Request, res: Response) => {
  return res.status(200).json({ status: 'OK' });
});

// 5) Middleware de vérification de token pour toutes les autres routes
app.use(verifyToken);

// 6) Routes protégées
app.use('/api', apiRoutes);

// 7) Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});
