import express from 'express';
import { register, verify, login } from '../controllers/authController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = express.Router();

// Route d'inscription
router.post('/register', register);

// Route de vérification d'email
router.post('/verify', verify);

// Route de connexion
router.post('/login', login);

// Route pour récupérer les informations de l'utilisateur connecté
router.get('/me', verifyToken, async (req, res) => {
  try {
    // L'utilisateur est déjà attaché à la requête par le middleware verifyToken
    // @ts-ignore - Nous savons que req.user est défini grâce au middleware
    const user = req.user;
    
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    // Ne pas renvoyer de données sensibles comme le mot de passe
    const { password, verificationCode, ...userWithoutSensitiveData } = user;
    
    res.json(userWithoutSensitiveData);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: "Erreur lors de la récupération des données utilisateur" });
  }
});

// Route de déconnexion
router.post('/logout', (req, res) => {
  try {
    // Supprimer le cookie d'authentification
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    res.status(200).json({ message: "Déconnexion réussie" });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ message: "Erreur lors de la déconnexion" });
  }
});

export default router;
