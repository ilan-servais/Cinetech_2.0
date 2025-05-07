import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isTokenExpired } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ 
        error: 'Token requis' 
      }, { status: 400 });
    }    // Find user with verification token
    const user = await prisma.user.findFirst({
      where: { verification_token: token },
    });

    if (!user) {
      return NextResponse.json({ 
        error: 'Token invalide' 
      }, { status: 400 });
    }    // Check if token is expired
    if (isTokenExpired(user.token_expiration ?? undefined)) {
      return NextResponse.json({ 
        error: 'Token expiré' 
      }, { status: 400 });
    }// Verify user and clear token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        is_verified: true,
        verification_token: undefined,
        token_expiration: undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Email vérifié avec succès'
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ 
      error: 'Une erreur s\'est produite lors de la vérification' 
    }, { status: 500 });
  }
}
