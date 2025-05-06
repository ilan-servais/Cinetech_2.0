/**
 * Utilitaires pour la gestion des images TMDB dans l'application
 */

type ImageType = 'poster' | 'backdrop' | 'profile' | 'logo' | 'still';
type ImageSize = 'original' | 'w92' | 'w154' | 'w185' | 'w300' | 'w342' | 'w500' | 'w780' | 'h632';

/**
 * Construit l'URL d'une image TMDB en utilisant les variables d'environnement
 * 
 * @param path - Chemin partiel de l'image fourni par l'API TMDB
 * @param size - Taille de l'image (w185, w342, w500, original, etc.)
 * @param type - Type d'image (poster, backdrop, profile, etc.)
 * @returns L'URL complète de l'image ou l'URL de l'image de fallback
 */
export const getTMDBImageUrl = (
  path: string | null, 
  size: ImageSize = 'w500', 
  type: ImageType = 'poster'
): string => {
  // Si pas de chemin, retourner l'image de fallback appropriée
  if (!path) {
    return getFallbackImage(type);
  }

  // Déterminer l'URL de base selon la taille et les variables d'environnement
  const baseUrl = getBaseUrl(size);
  
  // Retourner l'URL complète
  return `${baseUrl}${path}`;
};

/**
 * Retourne l'URL de base pour les images TMDB selon la taille
 */
const getBaseUrl = (size: ImageSize): string => {
  switch (size) {
    case 'original':
      return process.env.NEXT_PUBLIC_TMDB_IMAGE_URL || 'https://image.tmdb.org/t/p/original';
    case 'w185':
      return process.env.NEXT_PUBLIC_TMDB_IMAGE_URL_W185 || 'https://image.tmdb.org/t/p/w185';
    case 'w342':
      return process.env.NEXT_PUBLIC_TMDB_IMAGE_URL_W342 || 'https://image.tmdb.org/t/p/w342';
    case 'w500':
    default:
      return process.env.NEXT_PUBLIC_TMDB_IMAGE_URL_W500 || 'https://image.tmdb.org/t/p/w500';
  }
};

/**
 * Retourne l'image de fallback appropriée selon le type d'image
 */
export const getFallbackImage = (type: ImageType): string => {
  switch (type) {
    case 'poster':
      return '/images/placeholder.jpg';
    case 'backdrop':
      return '/images/default-backdrop.webp';
    case 'profile':
      return '/images/person-placeholder.jpg';
    case 'logo':
      return '/images/logo-placeholder.png';
    case 'still':
      return '/images/still-placeholder.jpg';
    default:
      return '/images/placeholder.jpg';
  }
};
