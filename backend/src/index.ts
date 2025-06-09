import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';
import apiRoutes from './routes'; // vos autres routes protégées
import { verifyToken } from './middlewares/authMiddleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const FRONTEND_URL = process.env.FRONTEND_URL!; // doit être exactement "https://cinetech-2-0.vercel.app"

// 1) CORS global pour toutes les routes (inclut OPTIONS)
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With','Accept'],
  optionsSuccessStatus: 204,
}));

app.use(express.json());
app.use(cookieParser());

// 2) Définition des routes publiques (pas de vérification de token)
app.use('/api/auth', authRoutes);
app.get('/health', (_req: Request, res: Response) => {
  return res.status(200).json({ status: 'OK' });
});

// 3) Appliquer le middleware de vérification de token uniquement aux routes suivantes
app.use(verifyToken);

// 4) Tous les autres endpoints passent par la vérification
app.use('/api', apiRoutes);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});
