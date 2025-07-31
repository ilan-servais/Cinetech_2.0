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
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] 🔄 toggleStatus appelé`);
  
  try {
    const userId = req.user?.id;
    if (!userId) {
      console.log(`[${requestId}] ❌ Utilisateur non authentifié`);
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
    }

    const { mediaId, mediaType, status, title, posterPath } = req.body;
    
    console.log(`[${requestId}] 📥 Données reçues:`, { userId, mediaId, mediaType, status, title });
    
    // Validation des données
    if (!mediaId || !mediaType || !status) {
      console.log(`[${requestId}] ❌ Données manquantes:`, { mediaId, mediaType, status });
      return res.status(400).json({ success: false, message: 'Données manquantes' });
    }

    // Convertir le status en enum StatusType
    let statusEnum: StatusType;
    try {
      statusEnum = status.toUpperCase() as StatusType;
      console.log(`[${requestId}] 🔄 Status converti en enum:`, statusEnum);
      
      // Vérifier explicitement chaque valeur possible de StatusType
      if (statusEnum !== 'FAVORITE' && statusEnum !== 'WATCHED' && statusEnum !== 'WATCH_LATER') {
        console.log(`[${requestId}] ❌ Statut invalide:`, statusEnum);
        console.log(`[${requestId}] ℹ️ Valeurs valides: FAVORITE, WATCHED, WATCH_LATER`);
        return res.status(400).json({ success: false, message: 'Statut invalide' });
      }
      
      console.log(`[${requestId}] ✅ Statut validé:`, statusEnum);
    } catch (e) {
      console.log(`[${requestId}] ❌ Format de statut invalide:`, status);
      return res.status(400).json({ success: false, message: 'Format de statut invalide' });
    }

    const mediaIdInt = parseInt(String(mediaId));
    console.log(`[${requestId}] 🔍 Recherche du statut existant:`, { userId, mediaIdInt, mediaType, statusEnum });

    // Vérifier si le statut existe déjà
    const existingStatus = await prisma.userStatus.findFirst({
      where: {
        userId,
        mediaId: mediaIdInt,
        mediaType,
        status: statusEnum
      }
    });

    console.log(`[${requestId}] 🔍 Statut existant trouvé:`, existingStatus ? 'Oui' : 'Non', existingStatus);

    let result;
    
    if (existingStatus) {
      // Si le statut existe, on le supprime (toggle off)
      console.log(`[${requestId}] 🗑️ Suppression du statut:`, { 
        id: existingStatus.id,
        status: existingStatus.status,
        userId: existingStatus.userId,
        mediaId: existingStatus.mediaId,
        mediaType: existingStatus.mediaType
      });
      
      try {
        // Vérification supplémentaire pour WATCHED et WATCH_LATER
        if (statusEnum === StatusType.WATCHED || statusEnum === StatusType.WATCH_LATER) {
          console.log(`[${requestId}] 🔍 Vérification spéciale pour la suppression de ${statusEnum}`);
        }
        
        const deleted = await prisma.userStatus.delete({
          where: {
            id: existingStatus.id
          }
        });
        
        console.log(`[${requestId}] 🗑️ Résultat de la suppression:`, deleted);
        
        // Vérification supplémentaire après suppression
        const checkAfterDelete = await prisma.userStatus.findFirst({
          where: {
            userId,
            mediaId: mediaIdInt,
            mediaType,
            status: statusEnum
          }
        });
        
        if (checkAfterDelete) {
          console.log(`[${requestId}] ⚠️ ALERTE: Le statut ${statusEnum} existe toujours après tentative de suppression!`);
        } else {
          console.log(`[${requestId}] ✅ Suppression confirmée: Le statut ${statusEnum} a bien été supprimé`);
        }
        
        result = false;
      } catch (deleteError) {
        console.error(`[${requestId}] 💥 Erreur lors de la suppression:`, deleteError);
        throw deleteError;
      }
    } else {
      // Si le statut n'existe pas encore, on le crée (toggle on)
      console.log(`[${requestId}] ➕ Création du statut:`, { 
        userId, 
        mediaId: mediaIdInt, 
        mediaType, 
        status: statusEnum 
      });
      
      const created = await prisma.userStatus.create({
        data: {
          userId,
          mediaId: mediaIdInt,
          mediaType,
          status: statusEnum,
          title,
          posterPath
        }
      });
      
      console.log(`[${requestId}] ➕ Statut créé:`, created);
      
      // Si on ajoute WATCHED, on supprime éventuellement WATCH_LATER
      if (statusEnum === StatusType.WATCHED) {
        console.log(`[${requestId}] 🔄 Suppression du statut WATCH_LATER puisque WATCHED a été ajouté`);
        const deletedWatchLater = await prisma.userStatus.deleteMany({
          where: {
            userId,
            mediaId: mediaIdInt,
            mediaType,
            status: StatusType.WATCH_LATER
          }
        });
        console.log(`[${requestId}] 🗑️ Résultat de la suppression WATCH_LATER:`, deletedWatchLater);
      } 
      // Si on ajoute WATCH_LATER, on supprime éventuellement WATCHED
      else if (statusEnum === StatusType.WATCH_LATER) {
        console.log(`[${requestId}] 🔄 Suppression du statut WATCHED puisque WATCH_LATER a été ajouté`);
        const deletedWatched = await prisma.userStatus.deleteMany({
          where: {
            userId,
            mediaId: mediaIdInt,
            mediaType,
            status: StatusType.WATCHED
          }
        });
        console.log(`[${requestId}] 🗑️ Résultat de la suppression WATCHED:`, deletedWatched);
      }
      
      result = true;
    }

    // Récupérer l'état actuel de tous les statuts après modification
    console.log(`[${requestId}] 🔍 Vérification des statuts après modification`);
    
    const currentStatuses = await prisma.userStatus.findMany({
      where: {
        userId,
        mediaId: mediaIdInt,
        mediaType
      }
    });

    console.log(`[${requestId}] 📊 Statuts actuels:`, currentStatuses.map(s => ({
      status: s.status,
      id: s.id,
      mediaId: s.mediaId,
      mediaType: s.mediaType
    })));

    const statusResponse = {
      favorite: currentStatuses.some((s: { status: string }) => s.status === StatusType.FAVORITE),
      watched: currentStatuses.some((s: { status: string }) => s.status === StatusType.WATCHED),
      watchLater: currentStatuses.some((s: { status: string }) => s.status === StatusType.WATCH_LATER)
    };

    console.log(`[${requestId}] 📊 Réponse des statuts:`, statusResponse);

    // Créer la propriété dynamique correspondant au statut modifié
    // Conversion en camelCase pour être cohérent avec le frontend
    let statusKey;
    
    console.log(`[${requestId}] 🔍 Traitement de la clé de statut - statut original:`, status);
    
    // Normalisation des clés pour le format camelCase utilisé par le frontend
    if (status === 'WATCH_LATER') {
      statusKey = 'watchLater';
      console.log(`[${requestId}] 🔍 Normalisation de WATCH_LATER en watchLater`);
    } 
    else if (status === 'WATCHED') {
      statusKey = 'watched'; 
      console.log(`[${requestId}] 🔍 Normalisation de WATCHED en watched`);
    }
    else if (status === 'FAVORITE') {
      statusKey = 'favorite';
      console.log(`[${requestId}] 🔍 Normalisation de FAVORITE en favorite`);
    } else {
      // Si on arrive ici, c'est qu'il y a une erreur
      console.log(`[${requestId}] ⚠️ ATTENTION: Status inconnu rencontré:`, status);
      statusKey = status.toLowerCase();
    }
    
    console.log(`[${requestId}] 🔑 Clé de statut finale utilisée dans la réponse:`, statusKey);
    console.log(`[${requestId}] 🔑 Résultat du toggle (true=ajouté, false=supprimé):`, result);
    console.log(`[${requestId}] 🔑 Type de result:`, typeof result);
    
    // Ne PAS inclure les versions avec underscore des clés
    const response = {
      success: true,
      [statusKey]: result,
      ...statusResponse
    };
    
    // Utiliser une approche de logging plus sûre pour éviter les erreurs TypeScript
    console.log(`[${requestId}] 📤 Valeur finale de la réponse:`, response);
    
    console.log(`[${requestId}] 📤 Réponse finale:`, response);

    return res.status(200).json(response);
  } catch (error) {
    console.error(`[${requestId}] 💥 Erreur lors du toggle de statut:`, error);
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
    const formattedFavorites = favorites.map((favorite) => ({
      id: favorite.id,
      mediaId: favorite.mediaId,
      mediaType: favorite.mediaType,
      title: favorite.title || '',
      posterPath: favorite.posterPath,
      createdAt: (favorite as any).createdAt // Utilise createdAt qui est le nom correct du champ
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

    const formattedItems = items.map((item) => ({
      id: item.id,
      mediaId: item.mediaId,
      mediaType: item.mediaType,
      title: item.title || '',
      posterPath: item.posterPath,
      createdAt: (item as any).createdAt // Utilise createdAt qui est le nom correct du champ
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

    const formattedItems = items.map((item) => ({
      id: item.id,
      mediaId: item.mediaId,
      mediaType: item.mediaType,
      title: item.title || '',
      posterPath: item.posterPath,
      createdAt: (item as any).createdAt // Utilise createdAt qui est le nom correct du champ
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
