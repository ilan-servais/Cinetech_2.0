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

console.log('✅ CORS configured for origin:', FRONTEND_URL);

// 1) CORS global pour toutes les routes (inclut simple GET/POST et pré-vol)
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','X-Requested-With','Accept'],
    optionsSuccessStatus: 204,
  })
);

// 2) S’assurer que les requêtes OPTIONS passent bien par CORS _avant_ vos routes
app.options('*', cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With','Accept'],
  optionsSuccessStatus: 204,
}));

app.use(express.json());
app.use(cookieParser());

// 3) Routes publiques
app.use('/api/auth', authRoutes);
app.get('/health', (_req: Request, res: Response) => {
  return res.status(200).json({ status: 'OK' });
});

// 4) Middleware de vérification du token pour tout le reste
app.use(verifyToken);
app.use('/api', apiRoutes);

// 5) Démarrage
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});
