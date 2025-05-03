import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Separate the handler logic from the Next.js route handler
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
    }

    // Check if token is expired
    if (user.token_expiration && user.token_expiration < new Date()) {
      return {
        status: 400,
        body: { error: 'Token expiré. Veuillez demander un nouveau lien de vérification.' }
      };
    }

    // Update user to verified status
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
      body: { message: 'Email vérifié avec succès' }
    };

  } catch (error) {
    console.error('Verification error:', error);
    return {
      status: 500,
      body: { error: 'Une erreur s\'est produite lors de la vérification' }
    };
  }
}

// Next.js API route handler
export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await verifyHandler(body);
  return NextResponse.json(result.body, { status: result.status });
}
