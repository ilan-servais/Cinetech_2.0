import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import routes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL!; // https://cinetech-2-0.vercel.app

console.log('✅ CORS configured for origin:', FRONTEND_URL);

// 1) Middleware global pour CORS (inclut OPTIONS automatiquement)
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
    ],
  })
);

app.use(cookieParser());
app.use(express.json());

app.use((req: Request, res: Response, next) => {
  console.log('🌐 Requête entrante avec cookies :', req.cookies);
  console.log('Auth token cookie:', req.cookies.auth_token || 'undefined');
  next();
});

app.use('/api', routes);

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});
