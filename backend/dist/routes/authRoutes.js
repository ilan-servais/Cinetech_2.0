"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Route d'inscription
router.post('/register', authController_1.register);
// Route de vérification d'email
router.post('/verify', authController_1.verify);
// Route de connexion
router.post('/login', authController_1.login);
// Route pour récupérer les informations de l'utilisateur connecté
router.get('/me', authMiddleware_1.verifyToken, async (req, res) => {
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
    }
    catch (error) {
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
    }
    catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ message: "Erreur lors de la déconnexion" });
    }
});
exports.default = router;
//# sourceMappingURL=authRoutes.js.map