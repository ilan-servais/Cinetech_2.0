import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get current user profile information
 * Route: GET /api/user/me
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // User is attached by the verifyToken middleware
    const user = req.user;
     
    if (!user) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    // Format user data for frontend
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.first_name || user.username?.split(' ')[0] || '',
      lastName: user.last_name || user.username?.split(' ').slice(1).join(' ') || '',
      createdAt: user.created_at || user.createdAt,
      isVerified: user.is_verified,
      avatarUrl: user.avatarUrl // Ajout de l'URL de l'avatar
    };

    // Get counts for user status items
    const [favoriteCount, watchedCount, watchLaterCount] = await Promise.all([
      prisma.userStatus.count({
        where: {
          userId: user.id,
          status: 'FAVORITE'
        }
      }),
      prisma.userStatus.count({
        where: {
          userId: user.id,
          status: 'WATCHED'
        }
      }),
      prisma.userStatus.count({
        where: {
          userId: user.id,
          status: 'WATCH_LATER'
        }
      })
    ]);

    // Return user data with status counts
    return res.status(200).json({
      ...userData,
      counts: {
        favorites: favoriteCount,
        watched: watchedCount,
        watchLater: watchLaterCount
      }
    });
    
  } catch (error) {
    console.error('Error retrieving user profile:', error);
    return res.status(500).json({ message: "Une erreur est survenue lors de la récupération du profil" });
  }
};

/**
 * Update user avatar
 * Route: POST /api/user/upload-avatar
 */
export const updateAvatarController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier n'a été téléchargé" });
    }

    const userId = req.user.id;
    const filename = req.file.filename;
    
    // Construire l'URL relative pour accéder à l'image
    const avatarUrl = `/uploads/avatars/${filename}`;

    // Mettre à jour l'utilisateur dans la base de données
    await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl }
    });

    // Construire l'URL complète pour le frontend
    const fullAvatarUrl = `${process.env.API_URL || 'http://localhost:3001'}${avatarUrl}`;

    return res.status(200).json({
      success: true,
      message: "Avatar mis à jour avec succès",
      avatarUrl: fullAvatarUrl
    });
  } catch (error) {
    console.error('Error updating avatar:', error);
    return res.status(500).json({ 
      success: false,
      message: "Une erreur est survenue lors de la mise à jour de l'avatar"
    });
  }
};
