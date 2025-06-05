"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaSearch, FaSignInAlt, FaUser, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import DarkModeToggle from './DarkModeToggle';
import { getAllUserStatuses } from '@/lib/userStatusService';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [favCount, setFavCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const pathname = usePathname();
  
  // Test function to fetch and log all user statuses
  useEffect(() => {
    const fetchStatuses = async () => {
      const statuses = await getAllUserStatuses();
      console.log('[TEST NAVBAR] Statuts utilisateur :', statuses);
    };
    fetchStatuses();
  }, []);
  
  // Check if the current path matches
  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };
  
  // Mark component as mounted to prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);
  useEffect(() => {
    if (!isMounted) return;
    
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    
    const fetchFavoriteCount = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/user/status/favorites`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const favorites = await response.json();
          setFavCount(favorites.length);
        } else {
          setFavCount(0);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des favoris:', error);
        setFavCount(0);
      }
    };

    fetchFavoriteCount();

    const handleFavoritesUpdated = async () => {
      await fetchFavoriteCount();
    };

    window.addEventListener('favorites-updated', handleFavoritesUpdated);
    return () => {
      window.removeEventListener('favorites-updated', handleFavoritesUpdated);
    };
  }, [isMounted]);  
  
  // Fonction pour obtenir le prénom de l'utilisateur
  const getFirstName = () => {
    if (!user) return '';
    if (user.firstName) return user.firstName;
    if (user.name) return user.name.split(' ')[0];
    return '';
  };
  
  // Gestion de la déconnexion
  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
  };
  
  return (
    <nav className="sticky top-0 z-30 bg-[#0D253F] text-white shadow-md">
      <div className="container-default">
        <div className="flex justify-between items-center py-4">
          {/* LEFT SECTION - Logo (unchanged) */}
          <Link href="/" className="flex items-center space-x-2" aria-label="Accueil Cinetech 2.0">
            <span className="font-display text-xl font-bold text-accent">Cinetech</span>
            <span className="font-display text-lg">2.0</span>
          </Link>
          
          {/* CENTER SECTION - Main navigation */}
          <div className="hidden md:flex items-center justify-center flex-1 mx-4 space-x-6">
            <Link 
              href="/" 
              className={`hover:text-accent transition-colors ${isActive('/') ? 'text-accent font-medium' : ''}`}
            >
              Accueil
            </Link>
            <Link 
              href="/movies" 
              className={`hover:text-accent transition-colors ${isActive('/movies') ? 'text-accent font-medium' : ''}`}
            >
              Films
            </Link>
            <Link 
              href="/series" 
              className={`hover:text-accent transition-colors ${isActive('/series') ? 'text-accent font-medium' : ''}`}
            >
              Séries
            </Link>
            <Link 
              href="/favorites" 
              className={`hover:text-accent transition-colors flex items-center ${isActive('/favorites') ? 'text-accent font-medium' : ''}`}
            >
              Favoris
              {isMounted && favCount > 0 && (
                <span className="ml-1 bg-accent text-primary text-xs h-5 w-5 rounded-full flex items-center justify-center">
                  {favCount}
                </span>
              )}
            </Link>
            
            <Link
              href="/search"
              className={`hover:text-accent transition-colors ${isActive('/search') ? 'text-accent font-medium' : ''}`}
              aria-label="Rechercher"
            >
              <FaSearch className="text-xl hover:scale-110 transition-transform duration-200 ease-in-out" />
            </Link>
            
            <DarkModeToggle className="ml-2" />
          </div>
          
          {/* RIGHT SECTION - Auth button */}
          <div className="hidden md:flex items-center">
            {isAuthenticated ? (
              <div className="relative ml-3">
                <div>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center space-x-2 text-sm rounded-full hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                  >
                    <span className="sr-only">Ouvrir le menu utilisateur</span>
                    <FaUserCircle className="h-6 w-6" />
                    <span>{getFirstName()}</span>
                  </button>
                </div>
                
                {showDropdown && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <Link 
                      href="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowDropdown(false)}
                    >
                      Mon profil
                    </Link>
                    <Link 
                      href="/favorites" 
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowDropdown(false)}
                    >
                      Mes favoris
                    </Link>
                    <button
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={handleLogout}
                    >
                      <span className="flex items-center">
                        <FaSignOutAlt className="mr-2" />
                        Déconnexion
                      </span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className={`hover:text-accent transition-colors flex items-center ${isActive('/login') ? 'text-accent font-medium' : ''}`}
                aria-label="Connexion"
              >
                <span className="mr-1">Connexion</span>
                <FaSignInAlt className="text-sm" />
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden text-textLight"
            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Mobile menu - same order as desktop */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-700 animate-fade-in">
            <ul className="space-y-4">
              <li>
                <Link 
                  href="/" 
                  className={`block px-4 py-2 rounded ${isActive('/') ? 'bg-accent/20 text-accent' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link 
                  href="/movies" 
                  className={`block px-4 py-2 rounded ${isActive('/movies') ? 'bg-accent/20 text-accent' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Films
                </Link>
              </li>
              <li>
                <Link 
                  href="/series" 
                  className={`block px-4 py-2 rounded ${isActive('/series') ? 'bg-accent/20 text-accent' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Séries
                </Link>
              </li>
              <li>
                <Link 
                  href="/favorites" 
                  className={`flex items-center px-4 py-2 rounded ${isActive('/favorites') ? 'bg-accent/20 text-accent' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>Favoris</span>
                  {isMounted && favCount > 0 && (
                    <span className="ml-2 bg-accent text-primary text-xs h-5 w-5 rounded-full flex items-center justify-center">
                      {favCount}
                    </span>
                  )}
                </Link>
              </li>
              <li>
                <Link 
                  href="/search" 
                  className={`flex items-center px-4 py-2 rounded ${isActive('/search') ? 'bg-accent/20 text-accent' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaSearch className="mr-2" />
                  <span>Rechercher</span>
                </Link>
              </li>
              <li className="px-4 py-2">
                <DarkModeToggle />
              </li>
              
              {/* Mobile auth button */}
              <li>
                {isAuthenticated ? (
                  <div className="relative">
                    <div>
                      <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="flex items-center space-x-2 px-4 py-2 text-sm rounded hover:bg-accent/20 transition-colors focus:outline-none"
                      >
                        <span className="sr-only">Ouvrir le menu utilisateur</span>
                        <FaUserCircle className="h-5 w-5" />
                        <span>{getFirstName()}</span>
                      </button>
                    </div>
                    
                    {showDropdown && (
                      <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                        <Link 
                          href="/profile" 
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => { setShowDropdown(false); setIsMenuOpen(false); }}
                        >
                          Mon profil
                        </Link>
                        <Link 
                          href="/favorites" 
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => { setShowDropdown(false); setIsMenuOpen(false); }}
                        >
                          Mes favoris
                        </Link>
                        <button
                          className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                        >
                          <span className="flex items-center">
                            <FaSignOutAlt className="mr-2" />
                            Déconnexion
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link 
                    href="/login" 
                    className={`flex items-center px-4 py-2 rounded ${isActive('/login') ? 'bg-accent/20 text-accent' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaSignInAlt className="mr-2" />
                    <span>Connexion</span>
                  </Link>
                )}
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
