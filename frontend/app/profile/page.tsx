"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { FaUser, FaHeart, FaEye, FaClock, FaSignOutAlt, FaCamera, FaTimes, FaCheck } from 'react-icons/fa';
import Image from 'next/image';

interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  avatarUrl?: string;
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
  
  // États pour la gestion de l'avatar
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Gérer l'ouverture du modal pour changer l'avatar
  const handleOpenAvatarModal = () => {
    setShowAvatarModal(true);
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadError(null);
  };

  // Gérer la fermeture du modal
  const handleCloseAvatarModal = () => {
    setShowAvatarModal(false);
  };

  // Gérer la sélection du fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille du fichier (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setUploadError("Le fichier est trop volumineux. Taille maximale: 2 MB.");
        return;
      }
      
      // Vérifier le type du fichier
      if (!file.type.startsWith('image/')) {
        setUploadError("Seuls les images sont autorisées.");
        return;
      }

      setSelectedFile(file);
      setUploadError(null);
      
      // Créer un aperçu
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Gérer l'upload de l'avatar
  const handleAvatarUpload = async () => {
    if (!selectedFile) {
      setUploadError("Veuillez sélectionner un fichier.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('avatar', selectedFile);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/upload-avatar`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'upload');
      }

      const data = await response.json();
      
      // Mettre à jour le state avec le nouvel avatar
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          avatarUrl: data.avatarUrl
        });
      }
      
      // Fermer le modal
      setShowAvatarModal(false);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setUploadError(error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'upload.');
    } finally {
      setIsUploading(false);
    }
  };

  // Gérer le clic sur le bouton de sélection de fichier
  const handleSelectFileClick = () => {
    fileInputRef.current?.click();
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
            <div className="relative group">
              <div className="h-32 w-32 rounded-full overflow-hidden bg-primary/10 dark:bg-accent/10 flex items-center justify-center mb-4">
                {profile.avatarUrl ? (
                  <Image 
                    src={profile.avatarUrl} 
                    alt={`Avatar de ${profile.firstName}`} 
                    width={128} 
                    height={128} 
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <FaUser className="h-16 w-16 text-primary dark:text-accent" />
                )}
              </div>
              
              <button 
                onClick={handleOpenAvatarModal}
                className="mt-2 flex items-center justify-center text-sm text-primary dark:text-accent hover:underline"
              >
                <FaCamera className="mr-2" />
                Modifier ma photo
              </button>
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

      {/* Modal de changement d'avatar */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-primary dark:text-accent">Modifier votre avatar</h3>
              <button 
                onClick={handleCloseAvatarModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-center mb-4">
                {previewUrl ? (
                  <div className="h-40 w-40 rounded-full overflow-hidden">
                    <img 
                      src={previewUrl} 
                      alt="Aperçu" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : profile.avatarUrl ? (
                  <div className="h-40 w-40 rounded-full overflow-hidden">
                    <img 
                      src={profile.avatarUrl} 
                      alt="Avatar actuel" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-40 w-40 rounded-full bg-primary/10 dark:bg-accent/10 flex items-center justify-center">
                    <FaUser className="h-20 w-20 text-primary dark:text-accent" />
                  </div>
                )}
              </div>
              
              <div className="flex justify-center">
                <input 
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={handleSelectFileClick}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-accent hover:text-primary transition-colors flex items-center"
                  disabled={isUploading}
                >
                  <FaCamera className="mr-2" />
                  Sélectionner une image
                </button>
              </div>
              
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
                  {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                </p>
              )}
              
              {uploadError && (
                <div className="mt-3 p-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 text-sm rounded">
                  {uploadError}
                </div>
              )}
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={handleCloseAvatarModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                disabled={isUploading}
              >
                Annuler
              </button>
              <button
                onClick={handleAvatarUpload}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-accent hover:text-primary transition-colors flex items-center"
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <FaCheck className="mr-2" />
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
