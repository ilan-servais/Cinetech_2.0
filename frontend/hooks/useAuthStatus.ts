"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useHasMounted } from '@/lib/clientUtils';

/**
 * 🔐 HOOK UTILITAIRE POUR L'AUTHENTIFICATION
 * 
 * Simplifie l'usage du context en fournissant des états dérivés
 * et des méthodes de vérification optimisées.
 * 
 * Usage :
 * const { isReady, canAccess, requiresAuth } = useAuthStatus();
 * 
 * if (!isReady) return <Loading />;
 * if (requiresAuth) return <LoginPrompt />;
 * // Contenu protégé...
 */
export const useAuthStatus = () => {
  const { user, loading, initialized, isAuthenticated } = useAuth();
  const hasMounted = useHasMounted();

  // 🎯 ÉTAT CONSOLIDÉ
  const isReady = hasMounted && initialized && !loading;
  const canAccess = isReady && isAuthenticated;
  const requiresAuth = isReady && !isAuthenticated;
  const isLoading = !hasMounted || !initialized || loading;

  console.log('🔐 [useAuthStatus] Status:', {
    isReady,
    canAccess,
    requiresAuth,
    isLoading,
    userId: user?.id,
  });

  return {
    // États principaux
    user,
    isAuthenticated,
    
    // États dérivés optimisés
    isReady,          // ✅ Prêt pour render conditionnel
    canAccess,        // ✅ Peut accéder au contenu protégé
    requiresAuth,     // ⚠️ Doit afficher l'écran de connexion
    isLoading,        // ⏳ Afficher un loader
    
    // États bruts (pour debug)
    raw: {
      hasMounted,
      loading,
      initialized,
      isAuthenticated,
    }
  };
};

/**
 * 🛠️ HOOK POUR LES COMPOSANTS QUI N'ONT PAS BESOIN D'ATTENDRE
 * 
 * Pour les composants qui peuvent s'afficher même sans auth
 * mais qui ont besoin de connaître l'état utilisateur.
 * 
 * Usage :
 * const { user, showAuthFeatures } = useOptionalAuth();
 */
export const useOptionalAuth = () => {
  const { user, loading, initialized, isAuthenticated } = useAuth();
  const hasMounted = useHasMounted();

  const showAuthFeatures = hasMounted && initialized && !loading && isAuthenticated;
  const canShowUser = hasMounted && initialized && !loading;

  return {
    user: canShowUser ? user : null,
    isAuthenticated: showAuthFeatures,
    showAuthFeatures,      // ✅ Afficher les fonctionnalités auth
    canShowUser,          // ✅ Peut afficher les infos utilisateur
    isInitialized: hasMounted && initialized && !loading,
  };
};
