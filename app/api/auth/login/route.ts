import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import { cookies } from 'next/headers';
import { sign } from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Validate request body
    if (!email || !password) {
      return NextResponse.json({ 
        error: 'Email et mot de passe requis' 
      }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Generic error to prevent user enumeration
      return NextResponse.json({ 
        error: 'Identifiants invalides' 
      }, { status: 401 });
    }

    // Verify password
    const passwordValid = await verifyPassword(password, user.hashed_password);
    if (!passwordValid) {
      return NextResponse.json({ 
        error: 'Identifiants invalides' 
      }, { status: 401 });
    }

    // Check if user is verified
    if (!user.is_verified) {
      return NextResponse.json({ 
        error: 'Veuillez vérifier votre email avant de vous connecter' 
      }, { status: 403 });
    }

    // Create JWT token
    const token = sign(
      { 
        userId: user.id,
        email: user.email,
        username: user.username
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Set cookie
    cookies().set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Return user info (no sensitive data)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ 
      error: 'Une erreur s\'est produite lors de la connexion' 
    }, { status: 500 });
  }
}
