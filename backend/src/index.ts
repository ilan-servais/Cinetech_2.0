import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';
import testRoutes from './routes/testRoutes';
import routes from './routes';

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
console.log('CORS configured for origin:', frontendUrl);
app.use('/api', routes); // ← Ce préfixe est important

// ✅ CORS middleware à mettre en haut
app.use(cors({
  origin: frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Debug-Cookies'],
}));

// ✅ OPTIONS preflight requests
app.options('*', cors());

// ✅ Cookie parser et JSON parser
app.use(cookieParser());
app.use(express.json());

// ✅ Debug cookies (optionnel)
app.use((req: Request, res: Response, next) => {
  console.log('🌐 Requête entrante avec cookies :', req.cookies);
  console.log('Auth token cookie:', req.cookies.auth_token || 'undefined');
  next();
});

// ✅ Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK' });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
