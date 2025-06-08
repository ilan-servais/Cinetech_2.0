import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import routes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL!;  
// 👉 doit être exactement "https://cinetech-2-0.vercel.app"

console.log('✅ CORS configured for origin:', FRONTEND_URL);

// 1) middleware global pour tout (y compris OPTIONS)
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

// 2) s’assurer que les OPTIONS ciblant * passent aussi par CORS
app.options('*', cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With','Accept'],
}));

app.use(cookieParser());
app.use(express.json());
app.use('/api', routes);

app.get('/health', (_req:Request, res:Response) => {
  res.status(200).json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});
