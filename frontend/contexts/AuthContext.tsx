"use client";

import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { clearMediaStatusCache } from '@/hooks/useMediaStatus';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  name?: string; // Pour compatibilité si l'API retourne un nom complet
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  checkAuth: () => Promise<boolean>;
  refreshUser: () => Promise<boolean>; // ✨ NOUVEAU: Fonction pour refresh manuel
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 🔍 DEBUG: Compteur d'instances pour détecter les multiples providers
let providerInstanceCount = 0;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  // 🔍 DEBUG: Monitoring du Provider
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      providerInstanceCount++;
      const timestamp = new Date().toISOString();
      const instanceId = Math.random().toString(36).substring(2, 8);
      
      console.log(`� [AuthProvider:${instanceId}] Provider mounted at ${timestamp}`);
      console.log(`📊 [AuthProvider] Active instances count: ${providerInstanceCount}`);
      
      if (providerInstanceCount > 1) {
        console.warn(`⚠️ [AuthProvider] MULTIPLE PROVIDER INSTANCES DETECTED! Count: ${providerInstanceCount}`);
        console.warn('🔍 [AuthProvider] This might cause authentication state conflicts');
      }

      return () => {
        providerInstanceCount--;
        const unmountTimestamp = new Date().toISOString();
        console.log(`🏁 [AuthProvider:${instanceId}] Provider unmounted at ${unmountTimestamp}`);
        console.log(`📊 [AuthProvider] Remaining instances count: ${providerInstanceCount}`);
      };
    }
  }, []);

  // �🎯 UNIQUE FETCH /api/auth/me - Point d'entrée central pour l'authentification
  const fetchCurrentUser = async () => {
    if (process.env.NODE_ENV !== 'production') {
      const timestamp = new Date().toISOString();
      console.log(`🔐 [AuthProvider] fetchCurrentUser() called at ${timestamp}`);
    }
    
    console.log('🔐 [AuthProvider] Fetching current user... (UNIQUE)');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('✅ [AuthProvider] User authenticated:', { id: userData.id, email: userData.email });
        
        if (process.env.NODE_ENV !== 'production') {
          console.log('🔍 [AuthProvider] User state change: null → authenticated', {
            userId: userData.id,
            email: userData.email,
            timestamp: new Date().toISOString()
          });
        }
        
        setUser(userData);
        return true;
      } else {
        console.log('❌ [AuthProvider] Not authenticated or session expired');
        
        if (process.env.NODE_ENV !== 'production' && user) {
          console.log('🔍 [AuthProvider] User state change: authenticated → null', {
            previousUserId: user.id,
            timestamp: new Date().toISOString()
          });
        }
        
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('💥 [AuthProvider] Error fetching user:', error);
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔍 [AuthProvider] fetchCurrentUser error details:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
      
      setUser(null);
      return false;
    } finally {
      setLoading(false);
      setInitialized(true);
      console.log('🏁 [AuthProvider] Loading completed. Ready for component access.');
    }
  };

  // 🚀 MONTAGE UNIQUE - Un seul appel au démarrage de l'application
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      const timestamp = new Date().toISOString();
      console.log(`🎬 [AuthProvider] Provider mounted - Starting unique auth check at ${timestamp}`);
    } else {
      console.log('🎬 [AuthProvider] Provider mounted - Starting unique auth check');
    }
    fetchCurrentUser();
  }, []);

  // 🔐 FONCTION DE CONNEXION - Avec refresh automatique des données utilisateur
  const login = async (email: string, password: string): Promise<boolean> => {
    if (process.env.NODE_ENV !== 'production') {
      const timestamp = new Date().toISOString();
      console.log(`🔑 [AuthProvider] login() called at ${timestamp}`, {
        email: email,
        passwordLength: password?.length || 0
      });
    } else {
      console.log('🔑 [AuthProvider] Starting login process...');
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        credentials: 'include', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ [AuthProvider] Login successful, refreshing user data...');
        
        if (process.env.NODE_ENV !== 'production') {
          console.log('🔍 [AuthProvider] Login success details:', {
            timestamp: new Date().toISOString(),
            email: email,
            userId: data.user?.id || 'unknown'
          });
        }
        
        // 🎯 REFRESH via le fetch centralisé (pas de fetch direct ici)
        // Attendre 100ms pour que le cookie soit disponible côté navigateur
        await new Promise(resolve => setTimeout(resolve, 100));
        await fetchCurrentUser();
        
        return true;
      } else {
        const error = await response.json();
        
        if (process.env.NODE_ENV !== 'production') {
          console.log('🔍 [AuthProvider] Login failed:', {
            timestamp: new Date().toISOString(),
            email: email,
            status: response.status,
            error: error.message || 'Unknown error'
          });
        }
        
        throw new Error(error.message || 'Échec de la connexion');
      }
    } catch (error: any) {
      console.error('💥 [AuthProvider] Login error:', error);
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔍 [AuthProvider] Login exception details:', {
          timestamp: new Date().toISOString(),
          email: email,
          errorMessage: error.message || 'Unknown error',
          errorType: error.constructor.name
        });
      }
      
      setLoading(false); // Reset loading en cas d'erreur
      throw error;
    }
  };

  // 🚪 FONCTION DE DÉCONNEXION - Reset complet du state
  const logout = async () => {
    if (process.env.NODE_ENV !== 'production') {
      const timestamp = new Date().toISOString();
      console.log(`🚪 [AuthProvider] logout() called at ${timestamp}`, {
        currentUserId: user?.id || 'none',
        currentUserEmail: user?.email || 'none'
      });
    } else {
      console.log('🚪 [AuthProvider] Logout process started...');
    }
    
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      console.log('✅ [AuthProvider] Server logout successful');
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔍 [AuthProvider] Server logout completed:', {
          timestamp: new Date().toISOString(),
          previousUserId: user?.id || 'unknown'
        });
      }
      
    } catch (err) {
      console.error('❌ [AuthProvider] Server logout failed:', err);
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔍 [AuthProvider] Server logout error details:', {
          timestamp: new Date().toISOString(),
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
      
    } finally {
      // 🧹 RESET COMPLET du state local + cache
      if (process.env.NODE_ENV !== 'production' && user) {
        console.log('🔍 [AuthProvider] User state change: authenticated → null (logout)', {
          previousUserId: user.id,
          previousUserEmail: user.email,
          timestamp: new Date().toISOString()
        });
      }
      
      setUser(null);
      setLoading(false);
      setInitialized(true);
      
      // 🧹 NETTOYAGE DU CACHE et des données locales
      clearMediaStatusCache(); // Vider le cache des statuts médias
      
      // 📢 PURGE des données locales
      window.dispatchEvent(new CustomEvent('favorites-updated'));
      window.dispatchEvent(new CustomEvent('watched-updated'));
      window.dispatchEvent(new CustomEvent('watch-later-updated'));
      
      console.log('🏁 [AuthProvider] Local state reset completed');
    }
  };

  // 🔍 VÉRIFICATION D'AUTHENTIFICATION - Centralisée
  const checkAuth = async (): Promise<boolean> => {
    if (process.env.NODE_ENV !== 'production') {
      const timestamp = new Date().toISOString();
      console.log(`🔍 [AuthProvider] checkAuth() called at ${timestamp}`, {
        currentState: {
          hasUser: !!user,
          loading,
          initialized,
          isAuthenticated: !!user
        }
      });
    }
    
    if (!initialized) {
      console.log('⏳ [AuthProvider] Not initialized yet, waiting...');
      return false;
    }
    
    if (user) {
      console.log('✅ [AuthProvider] User already authenticated');
      return true;
    }
    
    if (loading) {
      console.log('⏳ [AuthProvider] Auth check in progress...');
      return false;
    }
    
    console.log('🔄 [AuthProvider] Re-checking authentication...');
    return await fetchCurrentUser();
  };

  // 🔄 REFRESH MANUEL - Fonction publique pour rafraîchir les données utilisateur
  const refreshUser = async (): Promise<boolean> => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔄 [AuthProvider] Manual refresh requested');
    }
    return await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading,
      initialized,
      login, 
      logout,
      isAuthenticated: !!user,
      checkAuth,
      refreshUser // ✨ NOUVEAU: Exposition de la fonction de refresh
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
};
