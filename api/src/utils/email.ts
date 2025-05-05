import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// Configuration des options d'envoi d'email
const resendApiKey = process.env.RESEND_API_KEY;
const emailServer = process.env.EMAIL_SERVER;
const emailFrom = process.env.EMAIL_FROM || 'noreply@cinetech.com';
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Créer une instance de Resend si une clé API est disponible
let resend: Resend | null = null;
if (resendApiKey) {
  resend = new Resend(resendApiKey);
}

/**
 * Envoie un email de vérification avec le code
 */
export async function sendVerificationEmail(email: string, code: string): Promise<void> {
  // Contenu de l'email
  const subject = 'Vérification de votre compte Cinetech';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Bienvenue sur Cinetech!</h2>
      <p>Merci de vous être inscrit. Pour activer votre compte, veuillez utiliser le code de vérification ci-dessous :</p>
      <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
        <strong>${code}</strong>
      </div>
      <p>Ce code est valable pendant 24 heures.</p>
      <p>Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email.</p>
      <p>Cordialement,<br>L'équipe Cinetech</p>
    </div>
  `;

  try {
    // Utiliser Resend si disponible, sinon utiliser nodemailer
    if (resend) {
      await resend.emails.send({
        from: emailFrom,
        to: email,
        subject,
        html
      });
    } else if (emailServer) {
      // Configuration de nodemailer avec la chaîne de connexion SMTP
      const transporter = nodemailer.createTransport(emailServer);
      
      await transporter.sendMail({
        from: emailFrom,
        to: email,
        subject,
        html
      });
    } else {
      console.warn('Aucune configuration d\'email trouvée. L\'email n\'a pas été envoyé.');
      console.info(`Code de vérification pour ${email}: ${code}`);
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de vérification:', error);
    throw new Error('Impossible d\'envoyer l\'email de vérification');
  }
}
