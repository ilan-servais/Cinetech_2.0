"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getFavoritesCount } from '@/lib/favoritesService';
import DarkModeToggle from './DarkModeToggle';
import { FaSearch, FaSignInAlt, FaSignOutAlt, FaUser, FaUserCircle, FaChevronDown, FaSun, FaMoon } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext'; // Using the correct path
import { useTheme } from '@/contexts/ThemeContext';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [favCount, setFavCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const { user, loading, logout, isAuthenticated } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  
  // Check if the current path matches
  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };
  
  // Mark component as mounted to prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Update favorites count only after component is mounted
  useEffect(() => {
    if (!isMounted) return;
    
    setFavCount(getFavoritesCount());
    
    const handleFavoritesUpdated = () => {
      setFavCount(getFavoritesCount());
    };
    
    window.addEventListener('favorites-updated', handleFavoritesUpdated);
    return () => {
      window.removeEventListener('favorites-updated', handleFavoritesUpdated);
    };
  }, [isMounted]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  // Handle logout
  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  };

  // Toggle theme between light and dark
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Don't render theme toggle until mounted to avoid hydration mismatch
  const themeToggle = isMounted ? (
    <button 
      onClick={toggleTheme} 
      className="p-2 rounded-full hover:bg-gray-700 transition-colors"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? <FaSun /> : <FaMoon />}
    </button>
  ) : null;

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
          <div className="hidden md:flex items-center gap-4">
            {isMounted && !loading ? (
              isAuthenticated ? (
                <div className="flex items-center gap-4 relative" ref={menuRef}>
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-2 hover:text-accent transition-colors"
                  >
                    <FaUserCircle className="text-xl" />
                    <span className="text-sm text-accent">
                      {user?.username || user?.email}
                    </span>
                    <FaChevronDown className={`text-xs transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* User dropdown menu */}
                  {isMenuOpen && (
                    <div 
                      className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-20"
                    >
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <FaUser className="inline mr-2" />
                          Mon profil
                        </Link>
                        <Link
                          href="/favorites"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Mes favoris
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <FaSignOutAlt className="inline mr-2" />
                          Se déconnecter
                        </button>
                      </div>
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
              )
            ) : null}
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
              {isMounted && !loading ? (
                isAuthenticated ? (
                  <>
                    <li className="px-4 py-2 text-accent">
                      <FaUser className="inline mr-2" />
                      {user?.username || user?.email}
                    </li>
                    <li>
                      <Link 
                        href="/profile" 
                        className="flex items-center px-4 py-2 rounded"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FaUserCircle className="mr-2" />
                        <span>Mon profil</span>
                      </Link>
                    </li>
                    <li>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center px-4 py-2 rounded w-full text-left"
                      >
                        <FaSignOutAlt className="mr-2" />
                        <span>Se déconnecter</span>
                      </button>
                    </li>
                  </>
                ) : (
                  <li>
                    <Link 
                      href="/login" 
                      className={`flex items-center px-4 py-2 rounded ${isActive('/login') ? 'bg-accent/20 text-accent' : ''}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaSignInAlt className="mr-2" />
                      <span>Connexion</span>
                    </Link>
                  </li>
                )
              ) : null}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;