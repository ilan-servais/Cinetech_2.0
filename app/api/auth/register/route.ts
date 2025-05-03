import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  generateVerificationToken, 
  generateTokenExpiration, 
  hashPassword,
  isValidEmail,
  isValidPassword
} from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email, password, username } = await req.json();

    // Validate request body
    if (!email || !password) {
      return NextResponse.json({ 
        error: 'Email et mot de passe requis' 
      }, { status: 400 });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json({ 
        error: 'Format d\'email invalide' 
      }, { status: 400 });
    }

    // Validate password strength
    if (!isValidPassword(password)) {
      return NextResponse.json({ 
        error: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, et un chiffre' 
      }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Generic error to prevent user enumeration
      return NextResponse.json({ 
        error: 'Une erreur s\'est produite lors de l\'inscription' 
      }, { status: 400 });
    }

    // Check if username exists if provided
    if (username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUsername) {
        return NextResponse.json({ 
          error: 'Ce nom d\'utilisateur n\'est pas disponible' 
        }, { status: 400 });
      }
    }

    // Generate hashed password, verification token and expiration
    const hashedPassword = await hashPassword(password);
    const verificationToken = generateVerificationToken();
    const tokenExpiration = generateTokenExpiration();

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        hashed_password: hashedPassword,
        verification_token: verificationToken,
        token_expiration: tokenExpiration,
      },
    });

    // Send verification email
    await sendVerificationEmail({
      email,
      token: verificationToken,
      username,
    });

    // Return success without exposing user details
    return NextResponse.json({
      success: true,
      message: 'Inscription réussie. Veuillez vérifier votre email.'
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ 
      error: 'Une erreur s\'est produite lors de l\'inscription' 
    }, { status: 500 });
  }
}
