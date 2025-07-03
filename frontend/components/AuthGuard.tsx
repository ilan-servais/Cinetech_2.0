"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHasMounted } from '@/lib/clientUtils';
import LoadingSpinner from './LoadingSpinner';
import Link from 'next/link';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * 🛡️ COMPOSANT AUTHGUARD
 * 
 * Usage optimal du context AuthContext :
 * - Attend que loading=false ET initialized=true
 * - Ne redirige jamais prématurément
 * - Évite les renders conditionnels hasardeux
 * 
 * Exemple d'usage :
 * <AuthGuard fallback={<LoginPrompt />}>
 *   <ProtectedContent />
 * </AuthGuard>
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  fallback,
  redirectTo = '/login' 
}) => {
  const { user, loading, initialized, isAuthenticated } = useAuth();
  const hasMounted = useHasMounted();

  console.log('🛡️ [AuthGuard] State:', {
    hasMounted,
    loading,
    initialized,
    isAuthenticated,
    hasUser: !!user
  });

  // 1️⃣ ATTENDRE le montage côté client
  if (!hasMounted) {
    console.log('⏳ [AuthGuard] Waiting for client mount...');
    return <LoadingSpinner />;
  }

  // 2️⃣ ATTENDRE l'initialisation du context
  if (!initialized || loading) {
    console.log('⏳ [AuthGuard] Waiting for auth initialization...');
    return <LoadingSpinner />;
  }

  // 3️⃣ VÉRIFICATION finale de l'authentification
  if (!isAuthenticated) {
    console.log('🚨 [AuthGuard] User not authenticated, showing fallback');
    
    if (fallback) {
      return <>{fallback}</>;
    }

    // Fallback par défaut
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
              href={redirectTo}
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
