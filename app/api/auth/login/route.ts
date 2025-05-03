import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import { sign } from 'jsonwebtoken';

// Separate the handler logic from the Next.js route handler
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
    });

    // Check if user exists
    if (!user) {
      return {
        status: 401,
        body: { error: 'Identifiants invalides.' }
      };
    }

    // Check if user is verified
    if (!user.is_verified) {
      return {
        status: 403,
        body: { error: 'Veuillez vérifier votre adresse email avant de vous connecter.' }
      };
    }

    // Verify password
    const passwordValid = await verifyPassword(password, user.hashed_password);
    if (!passwordValid) {
      return {
        status: 401,
        body: { error: 'Identifiants invalides.' }
      };
    }

    // Create JWT token with user id and email
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

// Next.js API route handler
export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await loginHandler(body);
  return NextResponse.json(result.body, { status: result.status });
}
