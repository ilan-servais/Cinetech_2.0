import express from 'express';
import { sendVerificationEmail } from '../services/emailService';

const router = express.Router();

// Route d'inscription
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Ici, vous ajouterez la logique pour créer un utilisateur dans votre base de données
    
    // Générer un code de vérification (à remplacer par votre propre logique)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Envoyer l'email de vérification
    const emailSent = await sendVerificationEmail(email, verificationCode);
    
    if (!emailSent) {
      return res.status(500).json({ message: "Erreur lors de l'envoi de l'email de vérification" });
    }
    
    res.status(201).json({
      message: "Utilisateur enregistré, veuillez vérifier votre email",
      success: true
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ message: "Erreur lors de l'inscription", error: String(error) });
  }
});

// Route de connexion
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Ici, vous ajouterez la logique pour authentifier l'utilisateur
    
    res.status(200).json({
      message: "Connexion réussie",
      token: "exemple-de-token", // À remplacer par un vrai token JWT
      user: { email, name: "Utilisateur test" }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(401).json({ message: "Email ou mot de passe incorrect" });
  }
});

// Route de vérification d'email
router.post('/verify', (req, res) => {
  try {
    const { email, code } = req.body;
    
    // Ici, vous ajouterez la logique pour vérifier le code et activer le compte
    
    res.status(200).json({ message: "Email vérifié avec succès", success: true });
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    res.status(400).json({ message: "Code de vérification invalide" });
  }
});

export default router;
