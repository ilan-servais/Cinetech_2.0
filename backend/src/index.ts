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
const FRONTEND_URL = process.env.FRONTEND_URL!; // ex. "https://cinetech-2-0.vercel.app"

console.log('✅ CORS origin:', FRONTEND_URL);

// 1) Définition des options CORS
const corsOptions = {
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With','Accept'],
  optionsSuccessStatus: 204,
};

// 2) Middleware CORS global (gère aussi preflight pour les routes normales)
app.use(cors(corsOptions));

// 3) Handler explicite pour toutes les requêtes OPTIONS **avant** vos routes
app.options('*', cors(corsOptions));

// 4) Parser JSON + cookies
app.use(express.json());
app.use(cookieParser());

// 5) Routes publiques (inscription, connexion, healthcheck)
app.use('/api/auth', authRoutes);
app.get('/health', (_req: Request, res: Response) =>
  res.status(200).json({ status: 'OK' })
);

// 6) Middleware de vérification du token pour le reste
app.use(verifyToken);
app.use('/api', apiRoutes);

// 7) Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});
