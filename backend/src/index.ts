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

// 1) Autoriser une origine fixe (simplifié)
const FRONTEND_URL = process.env.FRONTEND_URL!
if (!FRONTEND_URL) {
  console.error('❌ Missing FRONTEND_URL env var')
  process.exit(1)
}

// ==> CONFIG CORS LA PLUS BASIQUE
const corsOptions = {
  origin: FRONTEND_URL,
  credentials: true,
}
app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

app.use(express.json())
app.use(cookieParser())

// routes publiques
app.get('/health', (_req, res) => res.json({ status: 'OK' }))
app.use('/api/auth', authRoutes)

// protéger le reste
app.use(verifyToken)
app.use('/api', apiRoutes)

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`)
})

export default app