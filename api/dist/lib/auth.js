"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Récupérer la clé JWT du fichier .env
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-dev';
/**
 * Hache un mot de passe
 */
async function hashPassword(password) {
    const salt = await bcryptjs_1.default.genSalt(10);
    return bcryptjs_1.default.hash(password, salt);
}
/**
 * Vérifie si un mot de passe correspond au hash stocké
 */
async function verifyPassword(password, hashedPassword) {
    return bcryptjs_1.default.compare(password, hashedPassword);
}
/**
 * Génère un token JWT pour un utilisateur
 */
function generateToken(user) {
    return jsonwebtoken_1.default.sign({
        id: user.id,
        email: user.email,
        is_verified: user.is_verified
    }, JWT_SECRET, { expiresIn: '7d' });
}
/**
 * Vérifie un token JWT et retourne les données utilisateur
 */
function verifyToken(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        return decoded;
    }
    catch (error) {
        return undefined;
    }
}
// Fonction generateUsername supprimée car username n'est plus utilisé dans le modèle
