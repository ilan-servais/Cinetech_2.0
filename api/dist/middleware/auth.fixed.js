"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireVerified = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-dev';
/**
 * Middleware d'authentification
 *
 * Vérifie si la requête contient un token JWT valide
 * Si oui, ajoute les informations de l'utilisateur à la requête
 * Sinon, retourne une erreur 401
 */
const authenticate = async (req, res, next) => {
    var _a, _b, _c, _d, _e;
    try {
        // Extraire le token d'authentification
        const authHeader = req.headers.authorization;
        let token = '';
        if (authHeader && authHeader.startsWith('Bearer ')) {
            // Format "Bearer <token>"
            token = authHeader.substring(7);
        }
        else {
            // Essayer de récupérer le token depuis les cookies
            token = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token) || '';
        }
        // Si pas de token, retourner une erreur 401
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentification requise'
            });
        }
        // Vérifier et décoder le token
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Récupérer l'utilisateur
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                is_verified: true
            }
        });
        // Si l'utilisateur n'existe pas, retourner une erreur 401
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        } // Ajouter l'utilisateur à la requête
        req.user = {
            id: user.id,
            email: (_b = user.email) !== null && _b !== void 0 ? _b : undefined,
            firstName: (_c = user.firstName) !== null && _c !== void 0 ? _c : undefined,
            lastName: (_d = user.lastName) !== null && _d !== void 0 ? _d : undefined,
            is_verified: (_e = user.is_verified) !== null && _e !== void 0 ? _e : undefined
        };
        next();
    }
    catch (error) {
        console.error('Erreur d\'authentification:', error);
        return res.status(401).json({
            success: false,
            message: 'Token invalide'
        });
    }
};
exports.authenticate = authenticate;
/**
 * Middleware pour vérifier si l'utilisateur est vérifié
 */
const requireVerified = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentification requise'
        });
    }
    if (!req.user.is_verified) {
        return res.status(403).json({
            success: false,
            message: 'Votre compte n\'est pas encore vérifié'
        });
    }
    next();
};
exports.requireVerified = requireVerified;
