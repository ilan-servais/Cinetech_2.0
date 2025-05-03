import { NextRequest, NextResponse } from 'next/server';
import { prisma, User } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const payload = verifyToken(token);
    if (!payload || typeof payload === 'string') {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    }) as User | null;
    
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }
    
    // Return user data without sensitive information
    return NextResponse.json({
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      is_verified: user.is_verified,
      createdAt: user.createdAt
    });
    
  } catch (error) {
    console.error('User fetch error:', error);
    return NextResponse.json({ 
      error: 'Une erreur s\'est produite lors de la récupération des données utilisateur' 
    }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const payload = verifyToken(token);
    if (!payload || typeof payload === 'string') {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }
    
    // Parse request body
    const { username, avatar } = await req.json();
    
    if (!username && !avatar) {
      return NextResponse.json({ 
        error: 'Aucune donnée à mettre à jour' 
      }, { status: 400 });
    }
    
    // Prepare update data
    const updateData: { username?: string, avatar?: string } = {};
    if (username) updateData.username = username;
    if (avatar) updateData.avatar = avatar;
    
    // Check if username already exists
    if (username) {
      const existingUser = await prisma.user.findUnique({
        where: { username }
      }) as User | null;
      
      if (existingUser && existingUser.id !== payload.userId) {
        return NextResponse.json({ 
          error: 'Ce nom d\'utilisateur est déjà utilisé' 
        }, { status: 409 });
      }
    }
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: updateData
    }) as User;
    
    return NextResponse.json({
      message: 'Profil mis à jour avec succès',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        avatar: updatedUser.avatar
      }
    });
    
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json({ 
      error: 'Une erreur s\'est produite lors de la mise à jour du profil' 
    }, { status: 500 });
  }
}
