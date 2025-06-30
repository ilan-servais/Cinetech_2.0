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

// 1. Construis ta liste d'origines autorisées
const PROD_FRONTEND = process.env.FRONTEND_URL!
const allowedOrigins = [
  PROD_FRONTEND,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
].filter(Boolean) as string[]

// 2. Définis ici ton objet corsOptions **UNE SEULE FOIS**
//    il doit être visible **avant** de l’utiliser plus bas.
const corsOptions = {
  origin(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(new Error(`Not allowed by CORS: ${origin}`), false)
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With','Accept'],
  optionsSuccessStatus: 204,
}

app.use(cors(corsOptions))
// **Puis** pour bien réutiliser cette même config sur tous les pré-flights :
app.options('*', cors(corsOptions))

app.use(express.json())
app.use(cookieParser())

// 3. Tes routes publiques
app.get('/health', (_req, res) => res.json({ status: 'OK' }))
app.use('/api/auth', authRoutes)

// 4. Protéger le reste
app.use(verifyToken)
app.use('/api', apiRoutes)

// 5. démarrage
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`)
})

export default app
