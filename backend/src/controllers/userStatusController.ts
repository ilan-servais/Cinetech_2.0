import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Type pour les requêtes authentifiées avec userId
interface AuthRequest extends Request {
  user?: { id: string };
}

// Récupérer le statut d'un média pour l'utilisateur courant
export const getMediaStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    const { mediaType, mediaId } = req.params;
    
    // Vérifier que les paramètres sont valides
    if (!mediaType || !mediaId || isNaN(parseInt(mediaId))) {
      return res.status(400).json({ message: 'Paramètres invalides' });
    }

    // Récupérer ou créer le statut du média
    const status = await prisma.userStatus.findUnique({
      where: {
        userId_mediaId_mediaType: {
          userId,
          mediaId: parseInt(mediaId),
          mediaType
        }
      }
    });

    // Si aucun statut n'existe, retourner les valeurs par défaut
    if (!status) {
      return res.status(200).json({
        favorite: false,
        watched: false,
        watchLater: false
      });
    }

    // Retourner les statuts existants
    return res.status(200).json({
      favorite: status.favorite,
      watched: status.watched,
      watchLater: status.watchLater
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du statut:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Modifier le statut favori d'un média
export const toggleFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    const { mediaId, mediaType, title, posterPath } = req.body;
    
    // Vérifier que les paramètres sont valides
    if (!mediaId || !mediaType) {
      return res.status(400).json({ message: 'Paramètres invalides' });
    }

    // Récupérer le statut existant ou en créer un nouveau
    const existingStatus = await prisma.userStatus.findUnique({
      where: {
        userId_mediaId_mediaType: {
          userId,
          mediaId: parseInt(mediaId.toString()),
          mediaType
        }
      }
    });

    let updatedStatus;
    
    if (existingStatus) {
      // Mettre à jour le statut existant
      updatedStatus = await prisma.userStatus.update({
        where: { id: existingStatus.id },
        data: { favorite: !existingStatus.favorite }
      });
    } else {
      // Créer un nouveau statut
      updatedStatus = await prisma.userStatus.create({
        data: {
          userId,
          mediaId: parseInt(mediaId.toString()),
          mediaType,
          favorite: true
        }
      });
    }

    return res.status(200).json({ 
      isFavorite: updatedStatus.favorite,
      favorite: updatedStatus.favorite,
      watched: updatedStatus.watched,
      watchLater: updatedStatus.watchLater
    });
  } catch (error) {
    console.error('Erreur lors de la modification du statut favori:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Modifier le statut "déjà vu" d'un média
export const toggleWatched = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    const { mediaId, mediaType, title, posterPath } = req.body;
    
    // Vérifier que les paramètres sont valides
    if (!mediaId || !mediaType) {
      return res.status(400).json({ message: 'Paramètres invalides' });
    }

    // Récupérer le statut existant ou en créer un nouveau
    const existingStatus = await prisma.userStatus.findUnique({
      where: {
        userId_mediaId_mediaType: {
          userId,
          mediaId: parseInt(mediaId.toString()),
          mediaType
        }
      }
    });

    let updatedStatus;
    
    if (existingStatus) {
      // Mettre à jour le statut existant
      updatedStatus = await prisma.userStatus.update({
        where: { id: existingStatus.id },
        data: { 
          watched: !existingStatus.watched,
          // Si marqué comme vu, enlever de "à voir plus tard"
          watchLater: !existingStatus.watched ? false : existingStatus.watchLater
        }
      });
    } else {
      // Créer un nouveau statut
      updatedStatus = await prisma.userStatus.create({
        data: {
          userId,
          mediaId: parseInt(mediaId.toString()),
          mediaType,
          watched: true
        }
      });
    }

    return res.status(200).json({ 
      watched: updatedStatus.watched,
      favorite: updatedStatus.favorite,
      watchLater: updatedStatus.watchLater
    });
  } catch (error) {
    console.error('Erreur lors de la modification du statut vu:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Modifier le statut "à voir plus tard" d'un média
export const toggleWatchLater = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    const { mediaId, mediaType, title, posterPath } = req.body;
    
    // Vérifier que les paramètres sont valides
    if (!mediaId || !mediaType) {
      return res.status(400).json({ message: 'Paramètres invalides' });
    }

    // Récupérer le statut existant ou en créer un nouveau
    const existingStatus = await prisma.userStatus.findUnique({
      where: {
        userId_mediaId_mediaType: {
          userId,
          mediaId: parseInt(mediaId.toString()),
          mediaType
        }
      }
    });

    let updatedStatus;
    
    if (existingStatus) {
      // Mettre à jour le statut existant
      updatedStatus = await prisma.userStatus.update({
        where: { id: existingStatus.id },
        data: { watchLater: !existingStatus.watchLater }
      });
    } else {
      // Créer un nouveau statut
      updatedStatus = await prisma.userStatus.create({
        data: {
          userId,
          mediaId: parseInt(mediaId.toString()),
          mediaType,
          watchLater: true
        }
      });
    }

    return res.status(200).json({ 
      watchLater: updatedStatus.watchLater,
      favorite: updatedStatus.favorite,
      watched: updatedStatus.watched
    });
  } catch (error) {
    console.error('Erreur lors de la modification du statut à voir plus tard:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer tous les favoris de l'utilisateur
export const getFavorites = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    const favorites = await prisma.userStatus.findMany({
      where: {
        userId,
        favorite: true
      },
      orderBy: {
        addedAt: 'desc'
      }
    });

    return res.status(200).json({ favorites });
  } catch (error) {
    console.error('Erreur lors de la récupération des favoris:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer tous les médias vus par l'utilisateur
export const getWatchedItems = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    const items = await prisma.userStatus.findMany({
      where: {
        userId,
        watched: true
      },
      orderBy: {
        addedAt: 'desc'
      }
    });

    return res.status(200).json({ items });
  } catch (error) {
    console.error('Erreur lors de la récupération des médias vus:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer tous les médias à voir plus tard
export const getWatchLaterItems = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    const items = await prisma.userStatus.findMany({
      where: {
        userId,
        watchLater: true
      },
      orderBy: {
        addedAt: 'desc'
      }
    });

    return res.status(200).json({ items });
  } catch (error) {
    console.error('Erreur lors de la récupération des médias à voir plus tard:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer un média des favoris
export const removeFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    const { mediaType, mediaId } = req.params;
    
    // Vérifier que les paramètres sont valides
    if (!mediaType || !mediaId || isNaN(parseInt(mediaId))) {
      return res.status(400).json({ message: 'Paramètres invalides' });
    }

    // Mettre à jour le statut
    await prisma.userStatus.updateMany({
      where: {
        userId,
        mediaId: parseInt(mediaId),
        mediaType
      },
      data: {
        favorite: false
      }
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du favori:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer un média des "déjà vus"
export const removeWatched = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    const { mediaType, mediaId } = req.params;
    
    // Vérifier que les paramètres sont valides
    if (!mediaType || !mediaId || isNaN(parseInt(mediaId))) {
      return res.status(400).json({ message: 'Paramètres invalides' });
    }

    // Mettre à jour le statut
    await prisma.userStatus.updateMany({
      where: {
        userId,
        mediaId: parseInt(mediaId),
        mediaType
      },
      data: {
        watched: false
      }
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du statut vu:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer un média des "à voir plus tard"
export const removeWatchLater = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    const { mediaType, mediaId } = req.params;
    
    // Vérifier que les paramètres sont valides
    if (!mediaType || !mediaId || isNaN(parseInt(mediaId))) {
      return res.status(400).json({ message: 'Paramètres invalides' });
    }

    // Mettre à jour le statut
    await prisma.userStatus.updateMany({
      where: {
        userId,
        mediaId: parseInt(mediaId),
        mediaType
      },
      data: {
        watchLater: false
      }
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du statut à voir plus tard:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
