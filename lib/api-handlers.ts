// This file contains handlers for API routes that are separated from
// the Next.js route handlers to make them testable and properly typed

import { prisma } from './prisma';
import { verifyPassword, hashPassword, generateVerificationToken } from './auth';
import { sendVerificationEmail } from './email';
import { sign } from 'jsonwebtoken';

/**
 * Handler for login API endpoint
 */
export async function loginHandler(body: any) {
  try {
    const { email, password } = body;

    // Validate request body
    if (!email || !password) {
      return {
        status: 400,
        body: { error: 'Email et mot de passe requis' }
      };
    }

    // Find user with explicit type casting to handle additional fields
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        hashed_password: true,
        username: true,
        avatar: true,
        is_verified: true,
        token_expiration: true,
        createdAt: true,
        updatedAt: true,
      }
    });    if (!user) {
      return {
        status: 401,
        body: { error: 'Identifiants invalides.' }
      };
    }
    
    if (!user.is_verified) {
      return {
        status: 403,
        body: { error: 'Veuillez vérifier votre adresse email avant de vous connecter.' }
      };
    }

    // Check password
    const isValidPassword = await verifyPassword(password, user.hashed_password);
    if (!isValidPassword) {
      return {
        status: 401,
        body: { error: 'Identifiants invalides.' }
      };
    }

    // Generate JWT token
    const token = sign(
      { 
        userId: user.id,
        email: user.email
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Return token and user info
    return {
      status: 200,
      body: {
        token,
        user: {
          email: user.email,
          username: user.username,
          avatar: user.avatar
        }
      }
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      status: 500,
      body: { error: 'Une erreur s\'est produite lors de la connexion' }
    };
  }
}

/**
 * Handler for registration API endpoint
 */
export async function registerHandler(body: any) {
  try {
    const { email, username, password } = body;

    // Validation
    if (!email || !username || !password) {
      return {
        status: 400,
        body: {
          error: 'Email, username et mot de passe sont requis'
        }
      };
    }    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return {
        status: 409,
        body: {
          error: 'Un utilisateur avec cet email ou ce nom d\'utilisateur existe déjà'
        }
      };
    }

    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Generate verification token
    const { token, expiration } = generateVerificationToken();    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        hashed_password: hashedPassword,
        verification_token: token,
        token_expiration: expiration,
        is_verified: false,      }
    });
    
    // Send verification email
    try {
      await sendVerificationEmail(email, token);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Even if email sending fails, continue with successful registration
    }
    
    return {
      status: 201,
      body: {
        message: 'Inscription réussie. Veuillez vérifier votre email pour activer votre compte.',
        userId: newUser.id
      }    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      status: 500,
      body: {
        error: 'Une erreur s\'est produite lors de l\'inscription'
      }
    };
  }
}

/**
 * Handler for verification API endpoint
 */
export async function verifyHandler(body: any) {
  try {
    const { token } = body;

    if (!token) {
      return {
        status: 400,
        body: { error: 'Token required' }
      };
    }

    // Find user with this verification token
    const user = await prisma.user.findFirst({
      where: { 
        verification_token: token,
      },
      select: {
        id: true,
        email: true,
        is_verified: true,
        token_expiration: true,
      }
    });

    if (!user) {
      return {
        status: 400,
        body: { error: 'Token invalide ou expiré' }
      };
    }    // Check if token is expired
    if (user.token_expiration && new Date(user.token_expiration) < new Date()) {
      return {
        status: 400,
        body: { error: 'Token expiré. Veuillez demander un nouveau lien de vérification.' }
      };
    }

    // If user is already verified, just return success
    if (user.is_verified) {
      return {
        status: 200,
        body: { message: 'Email déjà vérifié' }
      };
    }

    // Update user to verified and clear token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        is_verified: true,
        verification_token: null,
        token_expiration: null,
      }
    });

    return {
      status: 200,
      body: { message: 'Email vérifié avec succès' }    };
  } catch (error) {
    console.error('Verification error:', error);
    return {
      status: 500,
      body: { error: 'Une erreur s\'est produite lors de la vérification' }
    };
  }
}
