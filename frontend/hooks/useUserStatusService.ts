import { useAuth } from '@/contexts/AuthContext';
import { StatusType, UserStatusItem, 
  getAllUserStatuses, 
  getMediaStatus, 
  toggleUserStatus, 
  removeUserStatus, 
  getStatusItems 
} from '@/lib/userStatusService';

export function useUserStatusService() {
  const { user, isAuthenticated } = useAuth();

  // Récupérer tous les statuts d'un utilisateur
  const getUserStatuses = async (): Promise<UserStatusItem[]> => {
    if (!isAuthenticated || !user) return [];
    return getAllUserStatuses();
  };

  // Récupérer le statut d'un média spécifique
  const getStatus = async (mediaId: number, mediaType: string) => {
    if (!isAuthenticated || !user) {
      return { favorite: false, watched: false, watchLater: false };
    }
    return getMediaStatus(mediaId, mediaType);
  };

  // Ajouter ou mettre à jour un statut
  const toggleStatus = async (
    mediaId: number,
    mediaType: string,
    status: StatusType,
    title?: string,
    posterPath?: string | null
  ): Promise<boolean> => {
    if (!isAuthenticated || !user) return false;
    return toggleUserStatus(mediaId, mediaType, status, title, posterPath);
  };

  // Supprimer un statut
  const removeStatus = async (
    mediaId: number, 
    mediaType: string, 
    status: StatusType
  ): Promise<void> => {
    if (!isAuthenticated || !user) return;
    await removeUserStatus(mediaId, mediaType, status);
  };

  // Récupérer tous les médias avec un statut spécifique
  const getItemsByStatus = async (status: StatusType): Promise<UserStatusItem[]> => {
    if (!isAuthenticated || !user) return [];
    return getStatusItems(status);
  };

  return {
    getUserStatuses,
    getStatus,
    toggleStatus,
    removeStatus,
    getItemsByStatus,
    isAuthenticated,
    user
  };
}
