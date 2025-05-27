"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';
const verifyToken = async (req, res, next) => {
    try {
        // Récupérer le token du cookie
        const token = req.cookies.auth_token;
        console.log('Token reçu :', req.cookies.auth_token); // Log temporaire pour vérifier le token
        if (!token) {
            return res.status(401).json({ message: "Accès non autorisé. Veuillez vous connecter." });
        }
        // Vérifier le token
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Récupérer l'utilisateur depuis la base de données
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });
        if (!user) {
            return res.status(401).json({ message: "Utilisateur non trouvé. Veuillez vous connecter à nouveau." });
        }
        // Attacher l'utilisateur à la requête pour une utilisation ultérieure
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Error verifying token:', error);
        return res.status(401).json({ message: "Token invalide ou expiré. Veuillez vous connecter à nouveau." });
    }
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=authMiddleware.js.map