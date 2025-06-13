import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// Routes and middleware
import authRoutes from './routes/authRoutes';
import apiRoutes from './routes';
import { verifyToken } from './middlewares/authMiddleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const FRONTEND_URL = process.env.FRONTEND_URL!; // e.g. "https://cinetech-2-0.vercel.app"

// 1) CORS global — handles simple and preflight (OPTIONS) requests
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    optionsSuccessStatus: 204,
  })
);

// 2) Explicitly ensure OPTIONS on all routes are handled
app.options('*',
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    optionsSuccessStatus: 204,
  })
);

// 3) Body parsing and cookies
app.use(express.json());
app.use(cookieParser());

// 4) Public routes (no token check)
app.get('/health', (_req: Request, res: Response) =>
  res.status(200).json({ status: 'OK' })
);
app.use('/api/auth', authRoutes);

// 5) Protect all remaining /api routes
app.use(verifyToken);
app.use('/api', apiRoutes);

// 6) Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});
