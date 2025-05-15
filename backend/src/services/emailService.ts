import nodemailer from 'nodemailer';

// Créer un transporteur SMTP réutilisable avec les variables d'environnement
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'mailhog',
  port: parseInt(process.env.MAIL_PORT || '1025'),
  secure: false, // true pour 465, false pour les autres ports
});

// Fonction pour envoyer un email de vérification
export const sendVerificationEmail = async (to: string, verificationCode: string): Promise<boolean> => {
  try {
    // Log pour débogage
    console.log('Sending verification email to:', to);
    console.log('Using SMTP settings:', {
      host: process.env.MAIL_HOST || 'mailhog',
      port: parseInt(process.env.MAIL_PORT || '1025')
    });

    // Envoyer l'email
    const info = await transporter.sendMail({
      from: '"Cinetech 2.0" <noreply@cinetech.com>',
      to: to,
      subject: 'Vérifiez votre compte Cinetech',
      text: `Votre code de vérification est: ${verificationCode}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0D253F;">Bienvenue sur Cinetech 2.0!</h2>
          <p>Merci de vous être inscrit. Pour activer votre compte, veuillez utiliser le code de vérification suivant:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
            <strong>${verificationCode}</strong>
          </div>
          <p>Ce code est valable pendant 30 minutes.</p>
          <p>À bientôt sur Cinetech 2.0!</p>
        </div>
      `
    });

    console.log('Email sent successfully:', info.messageId);
    console.log(`✉️  Email envoyé à ${to} avec le code ${verificationCode}`);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};
