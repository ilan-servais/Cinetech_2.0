import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/authRoutes'
import apiRoutes from './routes'
import { verifyToken } from './middlewares/authMiddleware'

dotenv.config()
const app = express()
const PORT = Number(process.env.PORT) || 8080

// Ton domaine prod fixe
const FRONTEND_URL = process.env.FRONTEND_URL!  
if (!FRONTEND_URL) {
  console.error('❌ Missing FRONTEND_URL env var')
  process.exit(1)
}

// 1) CORS global, avant toutes les routes
app.use(cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`Not allowed by CORS: ${origin}`), false);
  },
  credentials: true,
}));
const allowedOrigins = [
  'http://localhost:3000',
  'https://cinetech-2-0.vercel.app',
  FRONTEND_URL,
];

app.use(express.json())
app.use(cookieParser())

// 2) Routes publiques
app.get('/health', (_req, res) => res.json({ status: 'OK' }))
app.use('/api/auth', authRoutes)

// 3) Protéger le reste
app.use(verifyToken)
app.use('/api', apiRoutes)

// 4) Démarrage
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`)
})

export default app
