import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import routes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
// Ton front Vercel
const FRONTEND_URL = process.env.FRONTEND_URL!; // ex: "https://cinetech-2-0.vercel.app"

console.log('✅ CORS configured for origin:', FRONTEND_URL);

// 1) CORS global
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','X-Requested-With','Accept'],
  })
);

// 2) Autoriser explicitement toutes les pré-vols
app.options('*', cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With','Accept'],
}));

// Les autres middlewares
app.use(cookieParser());
app.use(express.json());

app.use((req: Request, res: Response, next) => {
  console.log('🌐 Requête entrante – cookies :', req.cookies);
  next();
});

// Montée des routes
app.use('/api', routes);

app.get('/health', (_: Request, res: Response) => {
  res.status(200).json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});
