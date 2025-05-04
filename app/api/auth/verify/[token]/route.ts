import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const { token } = params;

  if (!token) {
    return NextResponse.json(
      { error: 'Token required' },
      { status: 400 }
    );
  }

  try {
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
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (user.token_expiration && new Date(user.token_expiration) < new Date()) {
      return NextResponse.json(
        { error: 'Token expiré' },
        { status: 400 }
      );
    }

    // If user is already verified, just return success
    if (user.is_verified) {
      return NextResponse.json(
        { message: 'Email déjà vérifié' },
        { status: 200 }
      );
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

    return NextResponse.json(
      { message: 'Email vérifié avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la vérification' },
      { status: 500 }
    );
  }
}