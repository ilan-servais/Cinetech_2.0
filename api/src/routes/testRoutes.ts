import express from 'express';
import { sendVerificationEmail } from '../utils/email';

const router = express.Router();

// Route de test pour l'envoi d'email
router.get('/test-email', async (req, res) => {
  try {
    await sendVerificationEmail('test@example.com', '123456');
    res.json({ success: true, message: 'Email test envoyé' });
  } catch (error) {
    console.error('Erreur lors du test d\'envoi d\'email:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'envoi de l\'email test' });
  }
});

export default router;
