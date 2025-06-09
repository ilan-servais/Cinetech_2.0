import express, { Request, Response } from 'express';
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

// –––––––––––––––––––––––––––––––––––––––––––––––––––––
// 1) HEADER-BASED CORS (doit être **avant** express.json, cookieParser, routes)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', FRONTEND_URL);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,POST,PUT,PATCH,DELETE,OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type,Authorization,X-Requested-With,Accept'
  );

  if (req.method === 'OPTIONS') {
    // répond directement aux pré-vols
    return res.sendStatus(204);
  }
  next();
});
// –––––––––––––––––––––––––––––––––––––––––––––––––––––

app.use(express.json());
app.use(cookieParser());

// Routes publiques
app.use('/api/auth', authRoutes);
app.get('/health', (_req: Request, res: Response) =>
  res.status(200).json({ status: 'OK' })
);

// Middleware de vérification des JWT pour tout le reste
app.use(verifyToken);
app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});
