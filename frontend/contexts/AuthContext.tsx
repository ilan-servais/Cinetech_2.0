"use client";

import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

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
  initialized: boolean; // ✨ NOUVEAU: Flag pour savoir si l'initialisation est terminée
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  // 🎯 UNIQUE FETCH /api/auth/me - Point d'entrée central pour l'authentification
  const fetchCurrentUser = async () => {
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
        setUser(userData);
        return true;
      } else {
        console.log('❌ [AuthProvider] Not authenticated or session expired');
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('💥 [AuthProvider] Error fetching user:', error);
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
    console.log('🎬 [AuthProvider] Provider mounted - Starting unique auth check');
    fetchCurrentUser();
  }, []);

  // 🔐 FONCTION DE CONNEXION - Avec refresh automatique des données utilisateur
  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('🔑 [AuthProvider] Starting login process...');
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
        
        // 🎯 REFRESH via le fetch centralisé (pas de fetch direct ici)
        await fetchCurrentUser();
        
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Échec de la connexion');
      }
    } catch (error: any) {
      console.error('💥 [AuthProvider] Login error:', error);
      setLoading(false); // Reset loading en cas d'erreur
      throw error;
    }
  };

  // 🚪 FONCTION DE DÉCONNEXION - Reset complet du state
  const logout = async () => {
    console.log('🚪 [AuthProvider] Logout process started...');
    
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      console.log('✅ [AuthProvider] Server logout successful');
    } catch (err) {
      console.error('❌ [AuthProvider] Server logout failed:', err);
    } finally {
      // 🧹 RESET COMPLET du state local
      setUser(null);
      setLoading(false);
      setInitialized(true);
      
      // 📢 PURGE des données locales
      window.dispatchEvent(new CustomEvent('favorites-updated'));
      window.dispatchEvent(new CustomEvent('watched-updated'));
      window.dispatchEvent(new CustomEvent('watch-later-updated'));
      
      console.log('🏁 [AuthProvider] Local state reset completed');
    }
  };

  // 🔍 VÉRIFICATION D'AUTHENTIFICATION - Centralisée
  const checkAuth = async (): Promise<boolean> => {
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

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading,
      initialized, // ✨ NOUVEAU: Permet aux composants de savoir quand l'auth est prête
      login, 
      logout,
      isAuthenticated: !!user,
      checkAuth 
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
