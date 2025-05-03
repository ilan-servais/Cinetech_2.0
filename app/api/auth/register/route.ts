import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateVerificationToken } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';

// Separate the handler logic from the Next.js route handler
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
    }

    // Check if user already exists
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

    // Generate verification token and expiration date (24 hours from now)
    const verificationToken = generateVerificationToken();
    const tokenExpiration = new Date();
    tokenExpiration.setHours(tokenExpiration.getHours() + 24);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        hashed_password: hashedPassword,
        is_verified: false,
        verification_token: verificationToken,
        token_expiration: tokenExpiration
      }
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Even if email fails, we still created the user
    }

    return {
      status: 201,
      body: {
        message: 'Inscription réussie. Veuillez vérifier votre email pour activer votre compte.',
        userId: user.id
      }
    };
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

// Next.js API route handler
export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await registerHandler(body);
  return NextResponse.json(result.body, { status: result.status });
}
