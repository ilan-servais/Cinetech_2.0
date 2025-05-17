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
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  // Fonction pour vérifier si l'utilisateur est connecté au chargement
  const fetchCurrentUser = async () => {
    try {
      console.log('Fetching current user...');
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include', // Déjà correct
        headers: {
          'Content-Type': 'application/json',
          // Ajout pour débogage - afficher les cookies envoyés
          'X-Debug-Cookies': document.cookie ? 'has-cookies' : 'no-cookies'
        },
      });

      console.log('Auth cookies in request:', document.cookie ? 'Present' : 'Not present');
      
      if (response.ok) {
        const userData = await response.json();
        console.log('User authenticated:', userData);
        setUser(userData);
        return true;
      } else {
        console.log('Not authenticated or session expired');
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Vérifier l'authentification au chargement du composant
  useEffect(() => {
    fetchCurrentUser();
    // Pas de dépendances, on ne veut exécuter qu'au montage initial
  }, []);

  // Fonction de connexion
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Déjà correct
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful, cookies received:', document.cookie ? 'Yes' : 'No');
        
        // Vérifier explicitement que le cookie a été correctement défini
        setTimeout(() => {
          // Vérification après un court délai pour laisser le temps au navigateur de traiter le cookie
          console.log('Cookies after login:', document.cookie);
        }, 100);
        
        // Rafraîchir les informations utilisateur
        await fetchCurrentUser();
        
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Échec de la connexion');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = async (): Promise<void> => {
    try {
      // Appel de l'API pour déconnecter l'utilisateur côté serveur
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Réinitialiser l'état utilisateur
      setUser(null);
      
      // Rediriger vers la page d'accueil
      router.push('/');
    }
  };

  // Fonction pour vérifier l'authentification (utilisable depuis les routes)
  const checkAuth = async (): Promise<boolean> => {
    if (user) return true; // Déjà authentifié
    if (!loading) return await fetchCurrentUser(); // Réessayer si non chargé
    return false; // En chargement, retourner false par défaut
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
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
