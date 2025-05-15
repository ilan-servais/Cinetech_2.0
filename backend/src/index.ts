import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Log des variables d'environnement pour le SMTP (supprimer en production)
console.log('SMTP Configuration:', {
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT
});

// Routes
app.use('/api/auth', authRoutes);

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
