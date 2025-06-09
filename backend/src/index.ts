// backend/src/index.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes';
import apiRoutes from './routes';            // toutes tes autres routes (users, media, favoris…)
import { verifyToken } from './middlewares/authMiddleware';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;
const FRONTEND_URL = process.env.FRONTEND_URL!;  // ex. "https://cinetech-2-0.vercel.app"

const corsOptions = {
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With','Accept'],
  optionsSuccessStatus: 204,
};

// 1️⃣ CORS global & pré-vol pour OPTIONS
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// 2️⃣ Middleware pour parser JSON + cookies
app.use(express.json());
app.use(cookieParser());

// 3️⃣ Routes publiques (inscription, login…)
app.use('/api/auth', authRoutes);
app.get('/health', (_req: Request, res: Response) =>
  res.status(200).json({ status: 'OK' })
);

// 4️⃣ Middleware de vérification du token pour toutes les routes suivantes
app.use(verifyToken);

// 5️⃣ Routes protégées
app.use('/api', apiRoutes);

// 6️⃣ Lancement du serveur
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});
