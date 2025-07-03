import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { StatusType } from '@prisma/client';
import type { UserStatus } from '@prisma/client';

// Define AuthRequest type to include userId from JWT verification
interface AuthRequest extends Request {
  userId?: string;
}

const prisma = new PrismaClient();

// Function to get media status for a specific user
export const getMediaStatus = async (req: Request, res: Response) => {
  const { mediaType, mediaId } = req.params;
  const userId = req.user?.id;

  console.log('🎯 getMediaStatus called with:', { mediaType, mediaId, userId, user: req.user });

  if (!userId || !mediaType || !mediaId) {
    console.warn('⛔ Paramètres manquants', { userId, mediaType, mediaId });
    return res.status(401).json({ message: "Utilisateur non authentifié ou paramètres invalides" });
  }

  if (!['movie', 'tv'].includes(mediaType)) {
    console.warn('⛔ mediaType non autorisé :', mediaType);
    return res.status(400).json({ message: "Type de média invalide. Utilisez 'movie' ou 'tv'" });
  }

  const mediaIdNum = parseInt(mediaId);
  if (isNaN(mediaIdNum)) {
    console.warn('⛔ mediaId non numérique :', mediaId);
    return res.status(400).json({ message: "ID de média invalide" });
  }

  // 🔍 DEBUG: Log détaillé de tous les paramètres
  console.log('🔍 DEBUG getMediaStatus - Paramètres détaillés:', {
    userId: userId,
    'typeof userId': typeof userId,
    mediaId: mediaIdNum,
    'typeof mediaId': typeof mediaIdNum,
    mediaType: mediaType,
    'typeof mediaType': typeof mediaType,
    originalMediaId: mediaId,
    'typeof originalMediaId': typeof mediaId
  });

  try {
    const whereClause = {
      userId: userId,
      mediaId: mediaIdNum,
      mediaType: mediaType,
    };
    
    console.log('🔍 DEBUG getMediaStatus - Where clause:', whereClause);

    const userStatuses = await prisma.userStatus.findMany({
      where: whereClause,
    });

    console.log('🔍 DEBUG getMediaStatus - Statuts trouvés:', {
      count: userStatuses.length,
      statuses: userStatuses.map(s => ({
        id: s.id,
        userId: s.userId,
        mediaId: s.mediaId,
        mediaType: s.mediaType,
        status: s.status,
        title: s.title
      }))
    });

    // 🔍 DEBUG: Vérifier s'il y a des statuts pour cet utilisateur
    const allUserStatuses = await prisma.userStatus.findMany({
      where: { userId: userId }
    });
    console.log('🔍 DEBUG getMediaStatus - Tous les statuts de l\'utilisateur:', {
      totalCount: allUserStatuses.length,
      statuses: allUserStatuses.map(s => ({
        mediaId: s.mediaId,
        mediaType: s.mediaType,
        status: s.status,
        title: s.title
      }))
    });

    const response = {
      favorite: userStatuses.some(status => status.status === 'FAVORITE'),
      watched: userStatuses.some(status => status.status === 'WATCHED'),
      watchLater: userStatuses.some(status => status.status === 'WATCH_LATER')
    };

    console.log('✅ Status trouvé :', response);
    return res.status(200).json(response);
  } catch (error) {
    console.error('🔥 Erreur lors de la récupération des statuts :', error);
    return res.status(500).json({ message: "Erreur serveur lors de la récupération du statut" });
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
      if (statusEnum === StatusType.WATCH_LATER) {
        await prisma.userStatus.deleteMany({
          where: {
            userId,
            mediaId: parseInt(String(mediaId)),
            mediaType,
            status: StatusType.WATCHED
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

// Supprimer un statut spécifique pour un média
export const removeStatus = async (req: Request, res: Response) => {
  const { status, mediaType, mediaId } = req.params;
  const userId = req.user?.id;

  console.log('🗑️ removeStatus called with:', { status, mediaType, mediaId, userId });

  if (!userId || !status || !mediaType || !mediaId) {
    console.warn('⛔ Paramètres manquants');
    return res.status(401).json({ message: "Utilisateur non authentifié ou paramètres invalides" });
  }

  if (!['FAVORITE', 'WATCHED', 'WATCH_LATER'].includes(status.toUpperCase())) {
    return res.status(400).json({ message: "Statut invalide" });
  }

  if (!['movie', 'tv'].includes(mediaType)) {
    return res.status(400).json({ message: "Type de média invalide" });
  }

  const mediaIdNum = parseInt(mediaId);
  if (isNaN(mediaIdNum)) {
    return res.status(400).json({ message: "ID de média invalide" });
  }

  try {
    const deleted = await prisma.userStatus.deleteMany({
      where: {
        userId: userId,
        mediaId: mediaIdNum,
        mediaType,
        status: status.toUpperCase() as StatusType,
      },
    });

    console.log(`🗑️ Statut supprimé :`, deleted);
    return res.status(200).json({ message: 'Statut supprimé', deleted });
  } catch (error) {
    console.error('🔥 Erreur lors de la suppression du statut :', error);
    return res.status(500).json({ message: "Erreur serveur lors de la suppression du statut" });
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

export const getAllStatuses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    const statuses = await prisma.userStatus.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json({ success: true, statuses });
  } catch (error) {
    console.error('Erreur lors de la récupération des statuts :', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
