import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Base URL for email verification links
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface SendVerificationEmailProps {
  email: string;
  token: string;
  username?: string;
}

// Send verification email
export async function sendVerificationEmail({ 
  email, 
  token, 
  username 
}: SendVerificationEmailProps) {
  const verificationLink = `${BASE_URL}/verify?token=${token}`;
  const name = username || email.split('@')[0];

  try {
    const { data, error } = await resend.emails.send({
      from: 'Cinetech <verification@cinetech.app>',
      to: email,
      subject: 'Vérifiez votre adresse email pour Cinetech 2.0',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0D253F; text-align: center; padding-top: 20px;">Bienvenue sur Cinetech 2.0!</h2>
          <p>Bonjour ${name},</p>
          <p>Merci de vous être inscrit sur Cinetech 2.0. Pour finaliser votre inscription, veuillez vérifier votre adresse email en cliquant sur le lien ci-dessous :</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #01B4E4; color: #FFFFFF; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Vérifier mon email
            </a>
          </div>
          <p>Ce lien expirera dans 24 heures.</p>
          <p>Si vous n'avez pas créé de compte sur Cinetech 2.0, vous pouvez ignorer cet email.</p>
          <p>À bientôt,<br>L'équipe Cinetech 2.0</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }

    return data;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
}
