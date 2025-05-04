import { prisma } from './prisma';
import { MediaItem } from '@/types/tmdb';

// Type pour représenter le résultat des opérations de toggle
export interface ToggleResult {
  success: boolean;
  message: string;
  action?: 'added' | 'removed' | null;
}

// Vérifications de statut
export async function isMediaInFavorites(userId: number, mediaId: number): Promise<boolean> {
  const favorite = await prisma.favorite.findFirst({
    where: { userId, mediaId }
  });
  return !!favorite;
}

export async function isMediaWatched(userId: number, mediaId: number): Promise<boolean> {
  const watched = await prisma.watchedItem.findFirst({
    where: { userId, mediaId }
  });
  return !!watched;
}

export async function isMediaInWatchLater(userId: number, mediaId: number): Promise<boolean> {
  const watchLater = await prisma.watchLaterItem.findFirst({
    where: { userId, mediaId }
  });
  return !!watchLater;
}

// Fonctions pour gérer les favoris
export async function toggleFavorite(userId: number, media: MediaItem): Promise<ToggleResult> {
  try {
    // Vérifier si le média existe déjà dans la base de données
    let dbMedia = await prisma.media.findUnique({
      where: { tmdbId: media.id }
    });

    // Si le média n'existe pas, le créer
    if (!dbMedia) {
      dbMedia = await prisma.media.create({
        data: {
          tmdbId: media.id,
          type: media.media_type || 'movie',
          title: media.title || media.name || 'Sans titre',
          posterPath: media.poster_path || null
        }
      });
    }

    // Vérifier si c'est déjà un favori
    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        userId,
        mediaId: dbMedia.id
      }
    });

    // Si c'est déjà un favori, le supprimer
    if (existingFavorite) {
      await prisma.favorite.delete({
        where: { id: existingFavorite.id }
      });
      return {
        success: true,
        message: 'Retiré des favoris avec succès',
        action: 'removed'
      };
    }

    // Sinon, l'ajouter aux favoris
    await prisma.favorite.create({
      data: {
        userId,
        mediaId: dbMedia.id
      }
    });

    return {
      success: true,
      message: 'Ajouté aux favoris avec succès',
      action: 'added'
    };
  } catch (error) {
    console.error('Erreur lors de la gestion des favoris:', error);
    return {
      success: false,
      message: 'Une erreur est survenue',
      action: null
    };
  }
}

export async function getFavorites(userId: number) {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        media: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return { success: true, data: favorites };
  } catch (error) {
    console.error('Erreur lors de la récupération des favoris:', error);
    return { success: false, error: 'Erreur lors de la récupération des favoris' };
  }
}

// Fonctions pour gérer les éléments vus
export async function toggleWatched(userId: number, media: MediaItem): Promise<ToggleResult> {
  try {
    // Vérifier si le média existe déjà dans la base de données
    let dbMedia = await prisma.media.findUnique({
      where: { tmdbId: media.id }
    });

    // Si le média n'existe pas, le créer
    if (!dbMedia) {
      dbMedia = await prisma.media.create({
        data: {
          tmdbId: media.id,
          type: media.media_type || 'movie',
          title: media.title || media.name || 'Sans titre',
          posterPath: media.poster_path || null
        }
      });
    }

    // Vérifier si c'est déjà marqué comme vu
    const existingWatchedItem = await prisma.watchedItem.findFirst({
      where: {
        userId,
        mediaId: dbMedia.id
      }
    });    // S'il est déjà dans les items vus, le supprimer
    if (existingWatchedItem) {
      await prisma.watchedItem.delete({
        where: { id: existingWatchedItem.id }
      });
      return {
        success: true,
        message: 'Retiré des éléments vus avec succès',
        action: 'removed'
      };
    }

    // Si l'élément est dans "à voir", le supprimer de cette liste
    const existingWatchLaterItem = await prisma.watchLaterItem.findFirst({
      where: {
        userId,
        mediaId: dbMedia.id
      }
    });

    if (existingWatchLaterItem) {
      await prisma.watchLaterItem.delete({
        where: { id: existingWatchLaterItem.id }
      });
    }

    // Ajouter aux items vus
    await prisma.watchedItem.create({
      data: {
        userId,
        mediaId: dbMedia.id
      }
    });

    return {
      success: true,
      message: 'Marqué comme déjà vu avec succès',
      action: 'added'
    };
  } catch (error) {
    console.error('Erreur lors de la gestion des éléments vus:', error);
    return {
      success: false,
      message: 'Une erreur est survenue',
      action: null
    };
  }
}

export async function getWatchedItems(userId: number) {
  try {
    const watchedItems = await prisma.watchedItem.findMany({
      where: { userId },
      include: {
        media: true
      },
      orderBy: {
        watchedAt: 'desc'
      }
    });

    return { success: true, data: watchedItems };
  } catch (error) {
    console.error('Erreur lors de la récupération des éléments vus:', error);
    return { success: false, error: 'Erreur lors de la récupération des éléments vus' };
  }
}

// Fonctions pour gérer les éléments à voir plus tard
export async function toggleWatchLater(userId: number, media: MediaItem): Promise<ToggleResult> {
  try {
    // Vérifier si le média existe déjà dans la base de données
    let dbMedia = await prisma.media.findUnique({
      where: { tmdbId: media.id }
    });

    // Si le média n'existe pas, le créer
    if (!dbMedia) {
      dbMedia = await prisma.media.create({
        data: {
          tmdbId: media.id,
          type: media.media_type || 'movie',
          title: media.title || media.name || 'Sans titre',
          posterPath: media.poster_path || null
        }
      });
    }

    // Vérifier s'il est déjà dans la liste "à voir"
    const existingWatchLaterItem = await prisma.watchLaterItem.findFirst({
      where: {
        userId,
        mediaId: dbMedia.id
      }
    });

    // S'il est déjà dans la liste "à voir", le supprimer
    if (existingWatchLaterItem) {
      await prisma.watchLaterItem.delete({
        where: { id: existingWatchLaterItem.id }
      });
      return {
        success: true,
        message: 'Retiré de la liste "à voir" avec succès',
        action: 'removed'
      };
    }

    // Si l'élément est dans "déjà vu", le supprimer de cette liste
    const existingWatchedItem = await prisma.watchedItem.findFirst({
      where: {
        userId,
        mediaId: dbMedia.id
      }
    });

    if (existingWatchedItem) {
      await prisma.watchedItem.delete({
        where: { id: existingWatchedItem.id }
      });
    }

    // Ajouter aux items "à voir"
    await prisma.watchLaterItem.create({
      data: {
        userId,
        mediaId: dbMedia.id
      }
    });

    return {
      success: true,
      message: 'Ajouté à la liste "à voir" avec succès',
      action: 'added'
    };
  } catch (error) {
    console.error('Erreur lors de la gestion des éléments à voir:', error);
    return {
      success: false,
      message: 'Une erreur est survenue',
      action: null
    };
  }
}

export async function getWatchLaterItems(userId: number) {
  try {
    const watchLaterItems = await prisma.watchLaterItem.findMany({
      where: { userId },
      include: {
        media: true
      },
      orderBy: {
        addedAt: 'desc'
      }
    });

    return { success: true, data: watchLaterItems };
  } catch (error) {
    console.error('Erreur lors de la récupération des éléments à voir:', error);
    return { success: false, error: 'Erreur lors de la récupération des éléments à voir' };
  }
}

// Gestion des amis
export async function addFriend(userId: number, friendUsername: string) {
  try {
    // Trouver l'ami par son nom d'utilisateur
    const friend = await prisma.user.findUnique({
      where: { username: friendUsername }
    });

    if (!friend) {
      return { success: false, message: 'Utilisateur non trouvé' };
    }

    // Vérifier s'ils sont déjà amis
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        userId,
        friendId: friend.id
      }
    });

    if (existingFriendship) {
      return { success: false, message: 'Cet utilisateur est déjà dans votre liste d\'amis' };
    }

    // Créer la relation d'amitié
    await prisma.friendship.create({
      data: {
        userId,
        friendId: friend.id
      }
    });

    return { success: true, message: 'Ami ajouté avec succès' };
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'un ami:', error);
    return { success: false, message: 'Une erreur est survenue' };
  }
}

export async function removeFriend(userId: number, friendId: number) {
  try {
    // Trouver la relation d'amitié
    const friendship = await prisma.friendship.findFirst({
      where: {
        userId,
        friendId
      }
    });

    if (!friendship) {
      return { success: false, message: 'Relation d\'amitié non trouvée' };
    }

    // Supprimer la relation
    await prisma.friendship.delete({
      where: { id: friendship.id }
    });

    return { success: true, message: 'Ami retiré avec succès' };
  } catch (error) {
    console.error('Erreur lors de la suppression d\'un ami:', error);
    return { success: false, message: 'Une erreur est survenue' };
  }
}

export async function getUserFriends(userId: number) {
  try {
    const friendships = await prisma.friendship.findMany({
      where: { userId },
      include: {
        friend: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        }
      }
    });

    return { success: true, data: friendships.map(fs => fs.friend) };
  } catch (error) {
    console.error('Erreur lors de la récupération des amis:', error);
    return { success: false, message: 'Une erreur est survenue' };
  }
}

// Fonction pour générer un displayName au format prenomnom#1234
export async function generateDisplayName(firstName: string, lastName: string): Promise<string> {
  const baseName = `${firstName.toLowerCase()}${lastName.toLowerCase()}`;
  const randomSuffix = Math.floor(1000 + Math.random() * 9000); // Nombre entre 1000 et 9999
  return `${baseName}#${randomSuffix}`;
}
