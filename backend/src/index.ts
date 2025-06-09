import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import routes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const FRONTEND_URL = process.env.FRONTEND_URL!; // e.g. "https://cinetech-2-0.vercel.app"

// 1) Middleware global pour activer CORS sur toutes les routes, y compris OPTIONS
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    optionsSuccessStatus: 204,
  })
);

// 2) S'assurer que toutes les requêtes OPTIONS passent par CORS avant les routes
app.options('*', cors());

app.use(cookieParser());
app.use(express.json());

// Log des cookies pour debug
app.use((req: Request, res: Response, next) => {
  console.log('🌐 Requête entrante avec cookies :', req.cookies);
  console.log('Auth token cookie:', req.cookies.auth_token || 'undefined');
  next();
});

// Route API
app.use('/api', routes);

// Simple health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log('✅ CORS origin:', FRONTEND_URL);
});
