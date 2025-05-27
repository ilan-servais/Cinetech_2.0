"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = exports.sendVerificationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Configuration de Nodemailer pour Mailhog (en dev) ou un service réel en prod
const transporter = nodemailer_1.default.createTransport({
    host: process.env.MAIL_HOST || 'mailhog',
    port: parseInt(process.env.MAIL_PORT || '1025'),
    secure: false, // true pour 465, false pour les autres ports
    auth: process.env.MAIL_USER ? {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    } : undefined
});
/**
 * Envoie un email de vérification à l'utilisateur
 * @param email - L'adresse email du destinataire
 * @param code - Le code de vérification à 6 chiffres
 * @returns Promise<boolean> - true si l'email a été envoyé avec succès, false sinon
 */
const sendVerificationEmail = async (email, code) => {
    try {
        const mailOptions = {
            from: process.env.MAIL_FROM || 'noreply@cinetech.com',
            to: email,
            subject: 'Vérification de votre compte Cinetech',
            html: `
        <h1>Bienvenue sur Cinetech</h1>
        <p>Merci de vous être inscrit ! Pour vérifier votre compte, veuillez utiliser le code suivant :</p>
        <h2 style="font-size: 24px; letter-spacing: 2px; text-align: center; padding: 10px; background-color: #f4f4f4; border-radius: 5px;">${code}</h2>
        <p>Ce code est valable pendant 30 minutes.</p>
        <p>Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email.</p>
      `
        };
        await transporter.sendMail(mailOptions);
        return true;
    }
    catch (error) {
        console.error('Error sending verification email:', error);
        return false;
    }
};
exports.sendVerificationEmail = sendVerificationEmail;
/**
 * Envoie un email de réinitialisation de mot de passe
 * @param email - L'adresse email du destinataire
 * @param token - Le token de réinitialisation
 * @returns Promise<boolean> - true si l'email a été envoyé avec succès, false sinon
 */
const sendPasswordResetEmail = async (email, token) => {
    try {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
        const mailOptions = {
            from: process.env.MAIL_FROM || 'noreply@cinetech.com',
            to: email,
            subject: 'Réinitialisation de votre mot de passe Cinetech',
            html: `
        <h1>Réinitialisation de mot de passe</h1>
        <p>Vous avez demandé une réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Réinitialiser mon mot de passe</a>
        <p>Ce lien est valable pendant 1 heure.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
      `
        };
        await transporter.sendMail(mailOptions);
        return true;
    }
    catch (error) {
        console.error('Error sending password reset email:', error);
        return false;
    }
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
//# sourceMappingURL=emailService.js.map