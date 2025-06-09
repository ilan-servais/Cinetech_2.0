import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';
import apiRoutes from './routes';
import { verifyToken } from './middlewares/authMiddleware';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 8080;
const FRONTEND_URL = process.env.FRONTEND_URL!; // https://cinetech-2-0.vercel.app

console.log('✅ Starting backend with CORS origin =', FRONTEND_URL);

// ─── 1) HEADER-ONLY CORS ────────────────────────────────────────
//    (doit être **LA TOUTE PREMIÈRE** chose dans l’app)
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
    // on répond tout de suite aux pré-vols
    return res.sendStatus(204);
  }
  next();
});

// ─── 2) Body parsing & cookies ───────────────────────────────────
app.use(express.json());
app.use(cookieParser());

// ─── 3) Routes publiques ─────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.get('/health', (_req: Request, res: Response) =>
  res.status(200).json({ status: 'OK' })
);

// ─── 4) JWT middleware ────────────────────────────────────────────
app.use(verifyToken);

// ─── 5) Routes protégées ─────────────────────────────────────────
app.use('/api', apiRoutes);

// ─── 6) Démarrage ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});
