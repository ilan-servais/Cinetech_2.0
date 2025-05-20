import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Re-définition manuelle de StatusType (correspond à ton schema.prisma)
export enum StatusType {
  FAVORITE = 'FAVORITE',
  WATCHED = 'WATCHED',
  WATCH_LATER = 'WATCH_LATER',
}

// Type minimal local (utile pour typer les items.map)
export interface UserStatus {
  id: string;
  userId: string;
  mediaId: number;
  mediaType: string;
  status: StatusType;
  title?: string | null;
  posterPath?: string | null;
  createdAt: Date;
}
// Type pour les requêtes authentifiées avec userId
interface AuthRequest extends Request {
  user?: { id: string };
}

/**
 * Récupère tous les statuts pour un utilisateur et un média donné
 */
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

    // Récupérer tous les statuts pour ce média
    const statuses = await prisma.userStatus.findMany({
      where: {
        userId,
        mediaId: parseInt(mediaId),
        mediaType
      }
    });

    // Préparer l'objet de réponse (tous les statuts sont false par défaut)
    const result = {
      favorite: false,
      watched: false,
      watchLater: false
    };

    // Mettre à jour les statuts trouvés
    statuses.forEach((status: { status: any; }) => {
      if (status.status === StatusType.FAVORITE) {
        result.favorite = true;
      } else if (status.status === StatusType.WATCHED) {
        result.watched = true;
      } else if (status.status === StatusType.WATCH_LATER) {
        result.watchLater = true;
      }
    });

    return res.status(200).json({ 
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du statut:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Active ou désactive un statut (toggle)
 */
export const toggleStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
    }

    const { mediaId, mediaType, status, title, posterPath } = req.body;
    
    // Validation des données
    if (!mediaId || !mediaType || !status) {
      return res.status(400).json({ success: false, message: 'Données manquantes' });
    }

    // Convertir le status en enum StatusType
    let statusEnum: StatusType;
    try {
      statusEnum = status.toUpperCase() as StatusType;
      
      // Vérifier que le status est valide
      if (!Object.values(StatusType).includes(status as StatusType)) {
        return res.status(400).json({ success: false, message: 'Statut invalide' });
      }
    } catch (e) {
      return res.status(400).json({ success: false, message: 'Format de statut invalide' });
    }

    // Vérifier si le statut existe déjà
    const existingStatus = await prisma.userStatus.findFirst({
      where: {
        userId,
        mediaId: parseInt(String(mediaId)),
        mediaType,
        status: statusEnum
      }
    });

    let result;
    
    if (existingStatus) {
      // Si le statut existe, on le supprime (toggle off)
      await prisma.userStatus.delete({
        where: {
          id: existingStatus.id
        }
      });
      
      result = false;
    } else {
      // Si le statut n'existe pas encore, on le crée (toggle on)
      await prisma.userStatus.create({
        data: {
          userId,
          mediaId: parseInt(String(mediaId)),
          mediaType,
          status: statusEnum,
          title,
          posterPath
        }
      });
      
      // Si on ajoute WATCHED, on supprime éventuellement WATCH_LATER
      if (statusEnum === StatusType.WATCHED) {
        await prisma.userStatus.deleteMany({
          where: {
            userId,
            mediaId: parseInt(String(mediaId)),
            mediaType,
            status: StatusType.WATCH_LATER
          }
        });
      }
      
      result = true;
    }

    // Récupérer l'état actuel de tous les statuts après modification
    const currentStatuses = await prisma.userStatus.findMany({
      where: {
        userId,
        mediaId: parseInt(String(mediaId)),
        mediaType
      }
    });

    const statusResponse = {
      favorite: currentStatuses.some((s: { status: string }) => s.status === StatusType.FAVORITE),
      watched: currentStatuses.some((s: { status: string }) => s.status === StatusType.WATCHED),
      watchLater: currentStatuses.some((s: { status: string }) => s.status === StatusType.WATCH_LATER)
    };

    return res.status(200).json({
      success: true,
      // Retourne le status spécifique qui a été modifié
      [status.toLowerCase()]: result,
      ...statusResponse
    });
  } catch (error) {
    console.error('Erreur lors du toggle de statut:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Récupère tous les favoris d'un utilisateur
 */
export const getFavorites = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
    }

    const favorites = await prisma.userStatus.findMany({
      where: {
        userId,
        status: StatusType.FAVORITE
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transformer les résultats pour le format attendu
    const formattedFavorites = favorites.map((favorite: typeof favorites[number]) => ({
      id: favorite.id,
      mediaId: favorite.mediaId,
      mediaType: favorite.mediaType,
      title: favorite.title || '',
      posterPath: favorite.posterPath,
      createdAt: favorite.createdAt
    }));

    return res.status(200).json({ 
      success: true, 
      favorites: formattedFavorites 
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des favoris:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Supprime un statut spécifique
 */
export const removeStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
    }

    const { mediaType, mediaId, status } = req.params;
    
    // Vérifier que les paramètres sont valides
    if (!mediaType || !mediaId || isNaN(parseInt(mediaId)) || !status) {
      return res.status(400).json({ success: false, message: 'Paramètres invalides' });
    }

    // Convertir le status en enum StatusType
    let statusEnum: StatusType;
    try {
      statusEnum = status.toUpperCase() as StatusType;
      
      // Vérifier que le status est valide
      if (!Object.values(StatusType).includes(status as StatusType)) {
        return res.status(400).json({ success: false, message: 'Statut invalide' });
      }
    } catch (e) {
      return res.status(400).json({ success: false, message: 'Format de statut invalide' });
    }

    // Supprimer le statut
    const result = await prisma.userStatus.deleteMany({
      where: {
        userId,
        mediaId: parseInt(mediaId),
        mediaType,
        status: statusEnum
      }
    });

    return res.status(200).json({ 
      success: true, 
      removed: result.count > 0 
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du statut:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Fonctions compatibles avec d'anciennes API
export const removeFavorite = async (req: AuthRequest, res: Response) => {
  try {
    req.params.status = 'FAVORITE';
    return removeStatus(req, res);
  } catch (error) {
    console.error('Erreur lors de la suppression du favori:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const removeWatched = async (req: AuthRequest, res: Response) => {
  try {
    req.params.status = 'WATCHED';
    return removeStatus(req, res);
  } catch (error) {
    console.error('Erreur lors de la suppression du statut vu:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const removeWatchLater = async (req: AuthRequest, res: Response) => {
  try {
    req.params.status = 'WATCH_LATER';
    return removeStatus(req, res);
  } catch (error) {
    console.error('Erreur lors de la suppression du statut à voir plus tard:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Récupère tous les médias vus par un utilisateur
 */
export const getWatchedItems = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
    }

    const items = await prisma.userStatus.findMany({
      where: {
        userId,
        status: StatusType.WATCHED
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedItems = items.map((item: UserStatus) => ({
      id: item.id,
      mediaId: item.mediaId,
      mediaType: item.mediaType,
      title: item.title || '',
      posterPath: item.posterPath,
      createdAt: item.createdAt
    }));

    return res.status(200).json({ 
      success: true, 
      items: formattedItems 
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des médias vus:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

/**
 * Récupère tous les médias à voir plus tard d'un utilisateur
 */
export const getWatchLaterItems = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
    }

    const items = await prisma.userStatus.findMany({
      where: {
        userId,
        status: StatusType.WATCH_LATER
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedItems = items.map((item: { id: any; mediaId: any; mediaType: any; title: any; posterPath: any; createdAt: any; }) => ({
      id: item.id,
      mediaId: item.mediaId,
      mediaType: item.mediaType,
      title: item.title || '',
      posterPath: item.posterPath,
      createdAt: item.createdAt
    }));

    return res.status(200).json({ 
      success: true, 
      items: formattedItems 
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des médias à voir plus tard:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
