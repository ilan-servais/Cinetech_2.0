"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../services/authService");
const zod_1 = require("zod");
// Créer une instance du service d'authentification
const authService = new authService_1.AuthService();
// Schéma de validation pour l'inscription
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email({ message: "Email invalide" }),
    password: zod_1.z.string().min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" }),
    firstName: zod_1.z.string().min(2, { message: "Le prénom doit contenir au moins 2 caractères" }),
    lastName: zod_1.z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" })
});
// Schéma de validation pour la vérification
const verifySchema = zod_1.z.object({
    email: zod_1.z.string().email({ message: "Email invalide" }),
    code: zod_1.z.string().length(6, { message: "Le code de vérification doit contenir 6 chiffres" })
});
// Schéma de validation pour la connexion
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email({ message: "Email invalide" }),
    password: zod_1.z.string().min(1, { message: "Le mot de passe est requis" })
});
// Schéma de validation pour la réinitialisation du code
const resendCodeSchema = zod_1.z.object({
    email: zod_1.z.string().email({ message: "Email invalide" })
});
/**
 * Contrôleur gérant les routes d'authentification
 */
class AuthController {
    /**
     * Gère l'inscription d'un nouvel utilisateur
     */
    async register(req, res) {
        try {
            // Valider les données d'entrée
            const validation = registerSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    errors: validation.error.errors
                });
            }
            const { email, password, firstName, lastName } = validation.data;
            // Appeler le service d'authentification pour l'inscription
            const result = await authService.registerUser(email, password, firstName, lastName);
            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    message: result.message
                });
            }
            // Succès
            return res.status(200).json({
                success: true,
                message: result.message
            });
        }
        catch (error) {
            console.error('Erreur lors de l\'inscription:', error);
            return res.status(500).json({
                success: false,
                message: 'Une erreur est survenue lors de l\'inscription'
            });
        }
    }
    /**
     * Gère la vérification du code envoyé par email
     */
    async verify(req, res) {
        try {
            // Valider les données d'entrée
            const validation = verifySchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    errors: validation.error.errors
                });
            }
            const { email, code } = validation.data;
            // Appeler le service d'authentification pour la vérification
            const result = await authService.verifyUser(email, code);
            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    message: result.message
                });
            }
            // Définir le cookie HTTP-only
            res.cookie('token', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
                sameSite: 'strict'
            });
            // Succès
            return res.status(200).json({
                success: true,
                message: result.message,
                user: result.user
            });
        }
        catch (error) {
            console.error('Erreur lors de la vérification:', error);
            return res.status(500).json({
                success: false,
                message: 'Une erreur est survenue lors de la vérification'
            });
        }
    }
    /**
     * Gère la connexion d'un utilisateur
     */
    async login(req, res) {
        try {
            // Valider les données d'entrée
            const validation = loginSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    errors: validation.error.errors
                });
            }
            const { email, password } = validation.data;
            // Appeler le service d'authentification pour la connexion
            const result = await authService.loginUser(email, password);
            if (!result.success) {
                return res.status(401).json({
                    success: false,
                    message: result.message
                });
            }
            // Définir le cookie HTTP-only
            res.cookie('token', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
                sameSite: 'strict'
            });
            // Succès
            return res.status(200).json({
                success: true,
                user: result.user,
                token: result.token
            });
        }
        catch (error) {
            console.error('Erreur lors de la connexion:', error);
            return res.status(500).json({
                success: false,
                message: 'Une erreur est survenue lors de la connexion'
            });
        }
    }
    /**
     * Gère la déconnexion d'un utilisateur
     */
    logout(req, res) {
        // Supprimer le cookie d'authentification
        res.clearCookie('token');
        return res.status(200).json({
            success: true,
            message: 'Déconnecté avec succès'
        });
    }
    /**
     * Gère la réinitialisation du code de vérification
     */
    async resendCode(req, res) {
        try {
            // Valider les données d'entrée
            const validation = resendCodeSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    errors: validation.error.errors
                });
            }
            const { email } = validation.data;
            // Appeler le service d'authentification pour réinitialiser le code
            const result = await authService.resendVerificationCode(email);
            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    message: result.message
                });
            }
            // Succès
            return res.status(200).json({
                success: true,
                message: result.message
            });
        }
        catch (error) {
            console.error('Erreur lors de la réinitialisation du code:', error);
            return res.status(500).json({
                success: false,
                message: 'Une erreur est survenue lors de la réinitialisation du code'
            });
        }
    }
}
exports.AuthController = AuthController;
