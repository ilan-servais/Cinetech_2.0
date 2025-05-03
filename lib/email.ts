import nodemailer from 'nodemailer';

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: Boolean(process.env.EMAIL_SECURE === 'true'),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send verification email to new users
 */
export async function sendVerificationEmail(to: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verificationUrl = `${baseUrl}/api/auth/verify?token=${token}`;
  
  const mailOptions = {
    from: `"Cinetech 2.0" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to,
    subject: 'Vérifiez votre adresse email - Cinetech 2.0',
    text: `Bienvenue sur Cinetech 2.0 ! Veuillez vérifier votre email en cliquant sur ce lien: ${verificationUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Bienvenue sur Cinetech 2.0 !</h2>
        <p>Merci de vous être inscrit. Veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Vérifier mon email
          </a>
        </div>
        <p>Ou copiez ce lien dans votre navigateur :</p>
        <p style="word-break: break-all;">${verificationUrl}</p>
        <p>Ce lien expirera dans 24 heures.</p>
        <p>Si vous n'avez pas créé de compte, veuillez ignorer cet email.</p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(to: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: `"Cinetech 2.0" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to,
    subject: 'Réinitialisation de votre mot de passe - Cinetech 2.0',
    text: `Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur ce lien pour procéder : ${resetUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Réinitialisation de mot de passe</h2>
        <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Réinitialiser mon mot de passe
          </a>
        </div>
        <p>Ou copiez ce lien dans votre navigateur :</p>
        <p style="word-break: break-all;">${resetUrl}</p>
        <p>Ce lien expirera dans 1 heure.</p>
        <p>Si vous n'avez pas demandé à réinitialiser votre mot de passe, veuillez ignorer cet email.</p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
}
