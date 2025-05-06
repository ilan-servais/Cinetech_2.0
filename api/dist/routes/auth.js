"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router();
const authController = new authController_1.AuthController();
/**
 * @route POST /api/auth/register
 * @description Inscription d'un nouvel utilisateur
 * @access Public
 */
router.post('/register', (req, res) => authController.register(req, res));
/**
 * @route POST /api/auth/verify
 * @description Vérification du code envoyé par email
 * @access Public
 */
router.post('/verify', (req, res) => authController.verify(req, res));
/**
 * @route POST /api/auth/login
 * @description Connexion d'un utilisateur
 * @access Public
 */
router.post('/login', (req, res) => authController.login(req, res));
/**
 * @route POST /api/auth/logout
 * @description Déconnexion d'un utilisateur
 * @access Public
 */
router.post('/logout', (req, res) => authController.logout(req, res));
/**
 * @route POST /api/auth/resend-code
 * @description Renvoi du code de vérification
 * @access Public
 */
router.post('/resend-code', (req, res) => authController.resendCode(req, res));
/**
 * @route GET /api/auth/me
 * @description Récupération des informations de l'utilisateur connecté
 * @access Private
 */
router.get('/me', auth_1.authenticate, async (req, res) => {
    try {
        // L'utilisateur est déjà vérifié par le middleware authenticate
        if (!req.user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }
        return res.status(200).json({
            success: true,
            user: req.user
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        return res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de la récupération du profil'
        });
    }
});
exports.default = router;
