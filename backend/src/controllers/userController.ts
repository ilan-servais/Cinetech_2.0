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
      isVerified: user.is_verified
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
