"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const email_1 = require("../utils/email");
const prisma_1 = require("../lib/prisma");
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-dev';
/**
 * Service gérant l'authentification des utilisateurs
 */
class AuthService {
    /**
     * Génère un code de vérification aléatoire à 6 chiffres
     */
    generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    /**
     * Hache un mot de passe
     */
    async hashPassword(password) {
        const salt = await bcryptjs_1.default.genSalt(10);
        return bcryptjs_1.default.hash(password, salt);
    }
    /**
     * Vérifie si un mot de passe correspond au hash stocké
     */
    async verifyPassword(password, hashedPassword) {
        return bcryptjs_1.default.compare(password, hashedPassword);
    }
    /**
     * Génère un token JWT pour un utilisateur
     */
    generateToken(userId, email) {
        return jsonwebtoken_1.default.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '7d' });
    }
    /**
     * Enregistre un nouvel utilisateur
     */
    async registerUser(email, password, firstName, lastName) {
        // Vérifier si l'email existe déjà
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            return { success: false, message: 'Cet email est déjà utilisé' };
        }
        // Générer un code de vérification
        const verificationCode = this.generateVerificationCode();
        // Hasher le mot de passe
        const hashedPassword = await this.hashPassword(password);
        // Définir l'expiration du token (15 minutes)
        const expirationDate = new Date();
        expirationDate.setMinutes(expirationDate.getMinutes() + 15);
        // Créer l'utilisateur
        try {
            await prisma_1.prisma.user.create({
                data: {
                    email,
                    firstName,
                    lastName,
                    hashed_password: hashedPassword,
                    verification_code: verificationCode,
                    token_expiration: expirationDate,
                    is_verified: false,
                    updatedAt: new Date(),
                    createdAt: new Date()
                }
            });
            // Envoyer l'email de vérification
            await (0, email_1.sendVerificationEmail)(email, verificationCode);
            return { success: true, message: 'Inscription réussie! Veuillez vérifier votre email pour activer votre compte' };
        }
        catch (error) {
            console.error('Error creating user:', error);
            return { success: false, message: 'Erreur lors de la création du compte' };
        }
    }
    /**
     * Vérifie le code de vérification d'un utilisateur
     */
    async verifyUser(email, code) {
        // Récupérer l'utilisateur
        const user = await prisma_1.prisma.user.findUnique({
            where: { email }
        });
        // Vérifier si l'utilisateur existe
        if (!user) {
            return { success: false, message: 'Utilisateur non trouvé' };
        }
        // Vérifier si l'utilisateur est déjà vérifié
        if (user.is_verified) {
            return { success: false, message: 'Votre compte est déjà vérifié' };
        }
        // Vérifier si le code est correct
        if (user.verification_code !== code) {
            return { success: false, message: 'Code de vérification invalide' };
        }
        // Vérifier si le token a expiré
        if (user.token_expiration && user.token_expiration < new Date()) {
            return { success: false, message: 'Le code de vérification a expiré. Veuillez demander un nouveau code.' };
        }
        // Mettre à jour l'utilisateur
        const updatedUser = await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                is_verified: true,
                verification_code: null,
                token_expiration: null,
                updatedAt: new Date()
            }
        });
        // Générer un token d'authentification
        const token = this.generateToken(user.id, user.email);
        // Préparer les données utilisateur à renvoyer
        const userData = {
            id: updatedUser.id,
            email: updatedUser.email,
            is_verified: updatedUser.is_verified
        };
        return {
            success: true,
            token,
            user: userData,
            message: 'Votre compte a été vérifié avec succès'
        };
    }
    /**
     * Connecte un utilisateur
     */
    async loginUser(email, password) {
        try {
            // Récupérer l'utilisateur
            const user = await prisma_1.prisma.user.findUnique({
                where: { email }
            });
            // Vérifier si l'utilisateur existe
            if (!user) {
                return { success: false, message: 'Email ou mot de passe incorrect' };
            }
            // Vérifier si le mot de passe est correct
            const passwordValid = await this.verifyPassword(password, user.hashed_password);
            if (!passwordValid) {
                return { success: false, message: 'Email ou mot de passe incorrect' };
            }
            // Vérifier si le compte est vérifié
            if (!user.is_verified) {
                return { success: false, message: 'Votre compte n\'est pas encore vérifié. Veuillez vérifier votre email.' };
            }
            // Générer un token d'authentification
            const token = this.generateToken(user.id, user.email);
            return {
                success: true,
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    is_verified: user.is_verified
                }
            };
        }
        catch (error) {
            console.error('Error logging in:', error);
            return { success: false, message: 'Erreur lors de la connexion' };
        }
    }
    /**
     * Regénère un code de vérification et l'envoie par email
     */
    async resendVerificationCode(email) {
        // Récupérer l'utilisateur
        const user = await prisma_1.prisma.user.findUnique({
            where: { email }
        });
        // Vérifier si l'utilisateur existe
        if (!user) {
            return { success: false, message: 'Utilisateur non trouvé' };
        }
        // Vérifier si l'utilisateur est déjà vérifié
        if (user.is_verified) {
            return { success: false, message: 'Votre compte est déjà vérifié' };
        }
        // Générer un nouveau code de vérification
        const verificationCode = this.generateVerificationCode();
        // Définir l'expiration du token (24 heures)
        const expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + 24);
        // Mettre à jour l'utilisateur    
        try {
            await prisma_1.prisma.user.update({
                where: { id: user.id },
                data: {
                    verification_code: verificationCode,
                    token_expiration: expirationDate,
                    updatedAt: new Date()
                }
            });
            // Envoyer l'email de vérification
            await (0, email_1.sendVerificationEmail)(email, verificationCode);
            return { success: true, message: 'Un nouveau code de vérification a été envoyé à votre adresse email' };
        }
        catch (error) {
            console.error('Error updating verification code:', error);
            return { success: false, message: 'Erreur lors de l\'envoi du code de vérification' };
        }
    }
}
exports.AuthService = AuthService;
