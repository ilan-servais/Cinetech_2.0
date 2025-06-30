import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';
import apiRoutes from './routes';
import { verifyToken } from './middlewares/authMiddleware';

dotenv.config();
const app = express();
const PORT = Number(process.env.PORT) || 8080;
const FRONTEND_URL = process.env.FRONTEND_URL!;
if (!FRONTEND_URL) {
  console.error('❌ Missing FRONTEND_URL env var');
  process.exit(1);
}

// 🎯 1) CORS global, avant tout
app.use(cors({
  origin(origin, cb) {
    // si curl/postman (pas d'origin) ou origine incluse, ok
    if (!origin || [FRONTEND_URL, 'http://localhost:3000'].includes(origin)) 
      return cb(null, true);
    cb(new Error(`Not allowed by CORS: ${origin}`), false);
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With','Accept'],
}));
app.options('*', cors());  // pré-flight

// 🎯 2) JSON body + cookies PARSER
app.use(express.json());
app.use(cookieParser());

// 🎯 3) Routes publiques (pas de JWT)
app.get('/health', (_req, res: Response) => res.json({ status: 'OK' }));
app.use('/api/auth', authRoutes);

// 🎯 4) Toutes les autres routes passent par verifyToken
app.use('/api', verifyToken, apiRoutes);

// 🎯 5) Démarrage
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
