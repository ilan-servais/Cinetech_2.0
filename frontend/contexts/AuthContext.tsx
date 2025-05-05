"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: number;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  isVerified: boolean;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  verifyEmail: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  resendVerificationCode: (email: string) => Promise<{ success: boolean; error?: string }>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fonction pour récupérer les informations de l'utilisateur connecté
  const refreshUser = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/me`, {
        method: 'GET',
        credentials: 'include', // Important pour les cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return;
      }
      
      // Si pas de réponse OK, on considère qu'il n'y a pas d'utilisateur connecté
      setUser(null);
    } catch (error) {
      console.error('Erreur lors de la récupération des informations utilisateur', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier automatiquement si l'utilisateur est connecté au chargement
  useEffect(() => {
    refreshUser();
  }, []);

  // Fonction de connexion
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Échec de la connexion',
        };
      }

      setUser(data.user);
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la connexion', error);
      return {
        success: false,
        error: 'Erreur lors de la connexion. Veuillez réessayer.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction d'inscription
  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.errors?.[0]?.message || 'Échec de l\'inscription',
        };
      }

      setUser(data.user);
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de l\'inscription', error);
      return {
        success: false,
        error: 'Erreur lors de l\'inscription. Veuillez réessayer.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion', error);
    }
  };
  // Fonction de vérification d'email
  const verifyEmail = async (email: string, code: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/verify`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Échec de la vérification',
        };
      }

      // Si la vérification réussit, on met à jour l'utilisateur
      await refreshUser();
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la vérification', error);
      return {
        success: false,
        error: 'Erreur lors de la vérification. Veuillez réessayer.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour renvoyer le code de vérification
  const resendVerificationCode = async (email: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/resend-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Échec de l\'envoi du code',
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de l\'envoi du code', error);
      return {
        success: false,
        error: 'Erreur lors de l\'envoi du code. Veuillez réessayer.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    verifyEmail,
    logout,
    refreshUser,
    resendVerificationCode
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
