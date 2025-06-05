import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Configuration CORS spécifique à ce router
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
const corsOptions = {
  origin: frontendUrl,
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  optionsSuccessStatus: 204,
};

// Appliquer CORS à toutes les routes de ce router
router.use(cors(corsOptions));
// Gérer explicitement les requêtes OPTIONS
router.options('*', cors(corsOptions));

// POST /api/test/reset
router.post('/reset', async (req, res) => {
  try {
    await prisma.user.deleteMany({});
    res.json({ message: 'Tous les utilisateurs ont été supprimés.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la suppression des utilisateurs.' });
  }
});

export default router;
