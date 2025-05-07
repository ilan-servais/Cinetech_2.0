"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  email: string;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  resendVerificationCode: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login handler - store token and set user
  const login = (token: string) => {
    try {
      const decodedToken = jwtDecode<User>(token);
      setUser(decodedToken);
    } catch (error) {
      console.error("Token decode failed:", error);
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setUser(null);
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  // Fonction de vérification d'email
  const verifyEmail = async (email: string, code: string) => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Échec de la vérification',
        };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la vérification', error);
      return {
        success: false,
        error: 'Erreur lors de la vérification. Veuillez réessayer.',
      };
    }
  };

  // Fonction pour renvoyer le code de vérification
  const resendVerificationCode = async (email: string) => {
    try {
      const response = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      verifyEmail, 
      resendVerificationCode 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
