import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

// --- 1) Créez votre transporter avec SendGrid en prod ou Mailhog en dev ---
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'mailhog',
  port: parseInt(process.env.MAIL_PORT || '1025', 10),
  secure: process.env.MAIL_SECURE === 'true', // true si port 465 pour SendGrid
  auth: process.env.MAIL_USER
    ? {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      }
    : undefined,
})

// Valeurs par défaut si jamais vous n’avez pas défini les env vars
const DEFAULT_FROM = process.env.MAIL_FROM || '"CinéTech" <no.reply.cinetech@gmail.com>'
const DEFAULT_REPLY_TO = process.env.MAIL_REPLY_TO || '"CinéTech Support" <assistance.avu@gmail.com>'
const FRONTEND_URL = process.env.FRONTEND_URL!
if (!FRONTEND_URL) {
  console.error('❌ Missing FRONTEND_URL env var')
  process.exit(1)
}

// --- 2) Envoi de l’email de vérification ---
export const sendVerificationEmail = async (
  email: string,
  code: string
): Promise<boolean> => {
  try {
    const verificationUrl = `${FRONTEND_URL}/verify-account?code=${code}`

    const mailOptions = {
      from: DEFAULT_FROM,
      replyTo: DEFAULT_REPLY_TO,
      to: email,
      subject: '🔒 Vérifiez votre adresse email CinéTech',
      html: `
        <h1>Bienvenue sur CinéTech !</h1>
        <p>Merci de vous être inscrit·e. Cliquez sur le bouton ci-dessous pour vérifier votre adresse email :</p>
        <a href="${verificationUrl}" style="
          display:inline-block;
          padding:10px 20px;
          background-color:#0070f3;
          color:#fff;
          text-decoration:none;
          border-radius:4px;
        ">Vérifier mon email</a>
        <p>Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br/>
        ${verificationUrl}</p>
        <hr/>
        <p>Si vous n’avez pas créé de compte CinéTech, ignorez cet email.</p>
      `,
    }

    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('❌ Error sending verification email:', error)
    return false
  }
}

// --- 3) Envoi de l’email de réinitialisation de mot de passe ---
export const sendPasswordResetEmail = async (
  email: string,
  token: string
): Promise<boolean> => {
  try {
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`

    const mailOptions = {
      from: DEFAULT_FROM,
      replyTo: DEFAULT_REPLY_TO,
      to: email,
      subject: '🔑 Réinitialisation de votre mot de passe CinéTech',
      html: `
        <h1>Réinitialisation de mot de passe</h1>
        <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez ci-dessous :</p>
        <a href="${resetUrl}" style="
          display:inline-block;
          padding:10px 20px;
          background-color:#0070f3;
          color:#fff;
          text-decoration:none;
          border-radius:4px;
        ">Réinitialiser mon mot de passe</a>
        <p>Ce lien expire dans 1 heure.</p>
        <p>Si vous n’avez pas demandé cette réinitialisation, ignorez cet email.</p>
      `,
    }

    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('❌ Error sending password reset email:', error)
    return false
  }
}
