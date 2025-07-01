import nodemailer from 'nodemailer';

// Récupération des variables d'environnement avec valeurs par défaut
const MAIL_HOST = process.env.MAIL_HOST || 'smtp.sendgrid.net';
const MAIL_PORT = parseInt(process.env.MAIL_PORT || '587', 10);
const MAIL_USER = process.env.MAIL_USER || '';
const MAIL_PASS = process.env.MAIL_PASS || '';
const MAIL_FROM = process.env.MAIL_FROM || 'no.reply.cinetech@gmail.com';
const MAIL_REPLY_TO = process.env.MAIL_REPLY_TO || 'assistance.avu@gmail.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Création du transporteur SMTP avec sécurité TLS
const transporter = nodemailer.createTransport({
  host: MAIL_HOST,
  port: MAIL_PORT,
  secure: false, // true pour 465, false pour les autres ports
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
  tls: {
    // Ne pas échouer sur les certificats auto-signés
    rejectUnauthorized: process.env.NODE_ENV === 'production'
  }
});

// Vérifier la configuration au démarrage
(async () => {
  try {
    if (MAIL_USER && MAIL_PASS) {
      const verification = await transporter.verify();
      console.log('📧 Email service ready:', verification);
    } else {
      console.warn('⚠️ Email credentials missing, service will be disabled');
    }
  } catch (error) {
    console.error('❌ Email service configuration error:', error);
  }
})();

/**
 * Envoie un email de vérification à l'utilisateur
 * 
 * @param to Email du destinataire
 * @param code Code de vérification à 6 chiffres
 * @returns Promise<boolean> Succès de l'envoi
 */
export const sendVerificationEmail = async (to: string, code: string): Promise<boolean> => {
  // Si les identifiants email ne sont pas configurés, simuler un succès en dev
  if (!MAIL_USER || !MAIL_PASS) {
    console.log(`📧 [DEV MODE] Email would be sent to ${to} with code ${code}`);
    return process.env.NODE_ENV !== 'production';
  }

  try {
    const mailOptions = {
      from: {
        name: 'Cinetech',
        address: MAIL_FROM
      },
      replyTo: MAIL_REPLY_TO,
      to,
      subject: 'Vérification de votre compte Cinetech',
      text: `Votre code de vérification est : ${code}\n\nCe code expirera dans une heure.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #01B4E4;">Bienvenue sur Cinetech !</h2>
          <p>Merci de vous être inscrit(e). Pour finaliser votre inscription, veuillez saisir le code de vérification suivant :</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
            ${code}
          </div>
          <p style="margin-top: 20px;">Ce code expirera dans une heure.</p>
          <p>Si vous n'avez pas demandé cette inscription, veuillez ignorer cet email.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            <p>© ${new Date().getFullYear()} Cinetech. Tous droits réservés.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return false;
  }
};

/**
 * Envoie un email de réinitialisation de mot de passe
 * 
 * @param to Email du destinataire
 * @param resetToken Token de réinitialisation
 * @returns Promise<boolean> Succès de l'envoi
 */
export const sendPasswordResetEmail = async (to: string, resetToken: string): Promise<boolean> => {
  if (!MAIL_USER || !MAIL_PASS) {
    console.log(`📧 [DEV MODE] Password reset email would be sent to ${to}`);
    return process.env.NODE_ENV !== 'production';
  }

  const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

  try {
    const mailOptions = {
      from: {
        name: 'Cinetech',
        address: MAIL_FROM
      },
      replyTo: MAIL_REPLY_TO,
      to,
      subject: 'Réinitialisation de votre mot de passe Cinetech',
      text: `Pour réinitialiser votre mot de passe, cliquez sur ce lien : ${resetUrl}\n\nCe lien expirera dans 1 heure.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #01B4E4;">Réinitialisation de mot de passe</h2>
          <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour continuer :</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${resetUrl}" style="background-color: #01B4E4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          <p>Si le bouton ne fonctionne pas, vous pouvez copier-coller ce lien dans votre navigateur :</p>
          <p style="word-break: break-all; background-color: #f4f4f4; padding: 10px; font-size: 12px;">
            ${resetUrl}
          </p>
          <p>Ce lien expirera dans 1 heure.</p>
          <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            <p>© ${new Date().getFullYear()} Cinetech. Tous droits réservés.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Password reset email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    return false;
  }
};
