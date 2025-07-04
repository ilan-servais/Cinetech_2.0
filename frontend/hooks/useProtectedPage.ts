"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useHasMounted } from '@/lib/clientUtils';

/**
 * 🎯 HOOK SIMPLIFIÉ POUR LES PAGES PROTÉGÉES
 * 
 * Remplace le pattern répétitif du AuthGuard par une logique simple.
 * Retourne l'état d'authentification et les états de chargement.
 * 
 * Usage dans une page :
 * 
 * function MyPage() {
 *   const { user, loading } = useProtectedPage();
 *   
 *   if (loading) return <LoadingSpinner />;
 *   if (!user) return <OnboardingComponent />;
 *   
 *   return <PageContent />;
 * }
 */
export function useProtectedPage() {
  const { user, loading, initialized } = useAuth();
  const hasMounted = useHasMounted();

  const isLoading = !hasMounted || loading || !initialized;
  const isAuthenticated = !!user;

  if (process.env.NODE_ENV !== 'production') {
    console.log('🔒 [useProtectedPage] State:', {
      hasMounted,
      loading,
      initialized,
      isAuthenticated,
      hasUser: !!user
    });
  }

  return {
    user,
    loading: isLoading,
    isAuthenticated,
    initialized: hasMounted && initialized
  };
}

/**
 * 🎯 HOOK POUR LES PAGES MIXTES (authentifié + public)
 * 
 * Pour les pages qui affichent du contenu différent selon l'état d'auth
 * mais ne requièrent pas forcément d'être connecté.
 */
export function useMixedPage() {
  const { user, loading, initialized } = useAuth();
  const hasMounted = useHasMounted();

  const isLoading = !hasMounted || loading || !initialized;
  const isAuthenticated = !!user;

  return {
    user,
    loading: isLoading,
    isAuthenticated,
    isReady: hasMounted && initialized
  };
}
