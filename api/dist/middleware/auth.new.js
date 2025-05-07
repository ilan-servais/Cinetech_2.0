"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireVerified = exports.authenticate = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-dev';
/**
 * Vérifie et décode un token JWT
 */
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        return null;
    }
};
exports.verifyToken = verifyToken;
/**
 * Middleware d'authentification
 *
 * Vérifie si la requête contient un token JWT valide
 * Si oui, ajoute les informations de l'utilisateur à la requête
 * Sinon, retourne une erreur 401
 */
const authenticate = async (req, res, next) => {
    var _a, _b;
    try {
        // Récupérer le token depuis les cookies ou le header Authorization
        let token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token;
        if (!token && ((_b = req.headers.authorization) === null || _b === void 0 ? void 0 : _b.startsWith('Bearer '))) {
            token = req.headers.authorization.split(' ')[1];
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
            where: { id: decoded.id }
        });
        // Si l'utilisateur n'existe pas, retourner une erreur 401
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }
        // Ajouter l'utilisateur à la requête en utilisant any pour éviter les erreurs TypeScript
        // Les champs existent bien dans le schéma Prisma
        req.user = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            is_verified: user.is_verified
        };
        next();
    }
    catch (error) {
        console.error('Erreur d\'authentification:', error);
        return res.status(401).json({
            success: false,
            message: 'Token invalide ou expiré'
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
            message: 'Votre compte n\'est pas vérifié. Veuillez vérifier votre email.'
        });
    }
    next();
};
exports.requireVerified = requireVerified;
