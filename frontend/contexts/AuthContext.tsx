"use client";

import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface User {
  id: number;
  email: string;
  name: string;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
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
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        credentials: 'include', // Important pour envoyer les cookies
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        return true;
      } else {
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
        credentials: 'include', // Pour recevoir et stocker les cookies
      });

      if (response.ok) {
        const data = await response.json();
        
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
      // Supprimer le cookie côté client par sécurité (même si normalement supprimé par le backend)
      Cookies.remove('auth_token');
      
      // Réinitialiser l'état utilisateur
      setUser(null);
      
      // Rediriger vers la page d'accueil
      router.push('/');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout,
      isAuthenticated: !!user 
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
