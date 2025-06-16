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
const FRONTEND_URL = process.env.FRONTEND_URL!
if (!FRONTEND_URL) {
  console.error('❌ Missing FRONTEND_URL env var')
  process.exit(1)
}

const corsOptions = {
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With','Accept'],
  optionsSuccessStatus: 204,
}

// 1) CORS global (y compris préflight)
app.use(cors(corsOptions))
// 1bis) explicitement pour toutes les OPTIONS
app.options('*', cors(corsOptions))

// 2) JSON + cookies
app.use(express.json())
app.use(cookieParser())

// 3) routes publiques
app.get('/health', (_req, res) => res.json({ status: 'OK' }))
app.use('/api/auth', authRoutes)

// 4) JWT sur tout le reste
app.use(verifyToken)
app.use('/api', apiRoutes)

// 5) démarrage
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`)
})
