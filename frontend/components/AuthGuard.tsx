"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHasMounted } from '@/lib/clientUtils';
import LoadingSpinner from './LoadingSpinner';
import Link from 'next/link';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  requireAuth?: boolean; // Si false, affiche toujours le contenu (pour usage conditionnel)
}

/**
 * 🛡️ COMPOSANT AUTHGUARD REFACTORISÉ
 * 
 * Nouveau comportement :
 * - PLUS de redirection automatique
 * - Affichage conditionnel basé sur l'état d'authentification
 * - Loading states optimisés
 * - Fallback/Onboarding privilégié
 * 
 * Exemples d'usage :
 * 
 * 1. Page mixte (contenu différent selon auth) :
 * <AuthGuard fallback={<Onboarding />} requireAuth={false}>
 *   <AuthenticatedContent />
 * </AuthGuard>
 * 
 * 2. Contenu strictement protégé :
 * <AuthGuard fallback={<LoginPrompt />} requireAuth={true}>
 *   <ProtectedContent />
 * </AuthGuard>
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  fallback,
  loadingComponent,
  requireAuth = true
}) => {
  const { user, loading, initialized, isAuthenticated } = useAuth();
  const hasMounted = useHasMounted();

  // 📊 DEBUG pour le développement
  if (process.env.NODE_ENV !== 'production') {
    console.log('🛡️ [AuthGuard] State:', {
      hasMounted,
      loading,
      initialized,
      isAuthenticated,
      hasUser: !!user,
      requireAuth
    });
  }

  // 1️⃣ ATTENDRE le montage côté client
  if (!hasMounted) {
    console.log('⏳ [AuthGuard] Waiting for client mount...');
    return loadingComponent || (
      <div className="container-default py-8">
        <div className="flex justify-center items-center min-h-[50vh]">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  // 2️⃣ ATTENDRE l'initialisation du context
  if (!initialized || loading) {
    console.log('⏳ [AuthGuard] Waiting for auth initialization...');
    return loadingComponent || (
      <div className="container-default py-8">
        <div className="flex justify-center items-center min-h-[50vh]">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  // 3️⃣ GESTION DE L'AUTHENTIFICATION
  if (!isAuthenticated) {
    // Si requireAuth=false, on continue vers le contenu même sans auth
    if (!requireAuth) {
      console.log('ℹ️ [AuthGuard] User not authenticated but requireAuth=false, rendering content');
      return <>{children}</>;
    }

    // Si un fallback est fourni, l'afficher
    if (fallback) {
      console.log('🚨 [AuthGuard] User not authenticated, showing fallback');
      return <>{fallback}</>;
    }

    // Fallback par défaut avec onboarding
    console.log('🚨 [AuthGuard] User not authenticated, showing default fallback');
    return (
      <div className="container-default py-20">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 max-w-lg mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4 text-primary dark:text-accent">
            Connexion requise
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Vous devez être connecté pour accéder à cette section.
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              href="/login"
              className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Se connecter
            </Link>
            <Link 
              href="/register"
              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-6 rounded-lg transition-colors"
            >
              S'inscrire
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4️⃣ UTILISATEUR AUTHENTIFIÉ - Render du contenu protégé
  console.log('✅ [AuthGuard] User authenticated, rendering protected content');
  return <>{children}</>;
};

export default AuthGuard;
