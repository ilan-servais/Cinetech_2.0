import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

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
