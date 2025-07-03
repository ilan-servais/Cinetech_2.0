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
    // 🍪 SUPPRESSION FORCÉE DU COOKIE - Options IDENTIQUES au login
    const isProd = process.env.NODE_ENV === 'production';
    
    console.log('🚪 [Logout] Clearing auth_token cookie with options:', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
      environment: process.env.NODE_ENV
    });
    
    // Méthode 1: clearCookie avec les MÊMES options que lors de la création
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
    });
    
    // Méthode 2: Double sécurité - Poser un cookie expiré (fallback)
    res.cookie('auth_token', '', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
      expires: new Date(0), // Cookie expiré immédiatement
      maxAge: 0
    });
    
    console.log('✅ [Logout] Cookie suppression attempted');
    res.status(200).json({ 
      message: "Déconnexion réussie",
      success: true 
    });
  } catch (error) {
    console.error('❌ [Logout] Error during logout:', error);
    res.status(500).json({ 
      message: "Erreur lors de la déconnexion",
      success: false 
    });
  }
});

export default router;
