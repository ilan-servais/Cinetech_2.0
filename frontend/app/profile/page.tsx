"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { FaUser, FaHeart, FaEye, FaClock, FaSignOutAlt } from 'react-icons/fa';

interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  counts: {
    favorites: number;
    watched: number;
    watchLater: number;
  };
}

export default function ProfilePage() {
  const { isAuthenticated, loading, logout, user: authUser } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Skip if still loading auth or not authenticated
    if (loading) return;
    
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/me`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const data = await response.json();
        setUserProfile(data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Une erreur est survenue lors de la récupération de votre profil.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [isAuthenticated, loading]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Format date helper function
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
    } catch (error) {
      return 'Date inconnue';
    }
  };

  if (loading || isLoading) {
    return (
      <div className="container-default py-12">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container-default py-12">
        <div className="bg-white dark:bg-backgroundDark shadow-md rounded-lg p-8 max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-6 text-primary dark:text-accent">Accès restreint</h1>
          <p className="text-lg mb-8 dark:text-gray-300">
            Vous devez être connecté pour accéder à votre profil.
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              href="/login" 
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-accent hover:text-primary transition-colors"
            >
              Se connecter
            </Link>
            <Link 
              href="/register" 
              className="px-6 py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-white dark:border-accent dark:text-accent dark:hover:bg-accent dark:hover:text-primary transition-colors"
            >
              S'inscrire
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-default py-12">
        <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 p-4 mb-8 rounded">
          <p className="text-red-700 dark:text-red-200">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-accent hover:text-primary transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const profile = userProfile || {
    id: authUser?.id || 0,
    email: authUser?.email || '',
    firstName: authUser?.firstName || '',
    lastName: authUser?.lastName || '',
    createdAt: new Date().toISOString(),
    counts: {
      favorites: 0,
      watched: 0,
      watchLater: 0
    }
  };

  return (
    <div className="container-default py-12 animate-fade-in">
      <div className="bg-white dark:bg-backgroundDark shadow-md rounded-lg overflow-hidden max-w-4xl mx-auto">
        <div className="md:flex">
          {/* Left side - Avatar & Basic Info */}
          <div className="md:w-1/3 bg-gray-50 dark:bg-gray-800 p-6 flex flex-col items-center">
            <div className="h-32 w-32 rounded-full bg-primary/10 dark:bg-accent/10 flex items-center justify-center mb-4">
              <FaUser className="h-16 w-16 text-primary dark:text-accent" />
            </div>
            <h2 className="text-xl font-bold text-center mb-1 dark:text-gray-200">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">{profile.email}</p>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Membre depuis {formatDate(profile.createdAt)}
            </div>
            <button
              onClick={handleLogout}
              className="w-full mt-auto flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-accent hover:text-primary transition-colors"
            >
              <FaSignOutAlt className="mr-2" /> Déconnexion
            </button>
          </div>
          
          {/* Right side - Statistics & More Info */}
          <div className="md:w-2/3 p-6">
            <h1 className="text-2xl font-bold mb-6 text-primary dark:text-accent">Mon Profil</h1>
            
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3 dark:text-gray-200">Ma bibliothèque</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mr-3">
                      <FaHeart className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Favoris</div>
                      <div className="text-xl font-bold dark:text-gray-200">{profile.counts.favorites}</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3">
                      <FaEye className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Déjà vus</div>
                      <div className="text-xl font-bold dark:text-gray-200">{profile.counts.watched}</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center mr-3">
                      <FaClock className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">À voir</div>
                      <div className="text-xl font-bold dark:text-gray-200">{profile.counts.watchLater}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Link
                href="/favorites"
                className="px-4 py-2 bg-primary/10 text-primary dark:bg-accent/10 dark:text-accent rounded-md hover:bg-primary/20 dark:hover:bg-accent/20 transition-colors"
              >
                Ma bibliothèque
              </Link>
              <Link
                href="/"
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Découvrir des films
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
