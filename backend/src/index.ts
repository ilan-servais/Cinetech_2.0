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
// Cette variable reste ton domaine prod fixe
const PROD_FRONTEND = process.env.FRONTEND_URL!

// On construit la liste « allowed » à partir de PROD + éventuellement vercel preview
const allowedOrigins = [
  PROD_FRONTEND,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
].filter(Boolean) as string[]

app.use(
  cors({
    origin(origin, callback) {
      // laissez passer si pas d’origin (postman, curl) ou si dans la liste
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      return callback(
        new Error(`Not allowed by CORS: ${origin}`),
        false
      )
    },
    credentials: true,
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','X-Requested-With','Accept'],
    optionsSuccessStatus: 204,
  })
)

// Préflight automatique
app.options('*', cors())

app.use(express.json())
app.use(cookieParser())

app.get('/health', (_req, res) => res.json({ status: 'OK' }))
app.use('/api/auth', authRoutes)

app.use(verifyToken)
app.use('/api', apiRoutes)

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`)
})
app.on('error', (err) => {
  console.error('Server error:', err)
})