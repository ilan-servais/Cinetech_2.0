import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import routes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

console.log('✅ CORS configured for origin:', frontendUrl);

const corsOptions = {
  origin: frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

// Appliquer CORS globalement AVANT tout autre middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Autres middlewares après CORS
app.use(cookieParser());
app.use(express.json());

// Servir le dossier uploads/avatars en statique
app.use('/uploads/avatars', express.static(path.join(__dirname, '../uploads/avatars')));

app.use((req: Request, res: Response, next) => {
  console.log('🌐 Requête entrante avec cookies :', req.cookies);
  console.log('Auth token cookie:', req.cookies?.auth_token || 'undefined');
  next();
});

// Monter les routes APRÈS les middlewares CORS
app.use('/api', routes);

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});
