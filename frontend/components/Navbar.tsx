"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getFavoritesCount } from '@/lib/favoritesService';
import DarkModeToggle from './DarkModeToggle';
import { FaSearch } from 'react-icons/fa';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [favCount, setFavCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  
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
  
  return (
    <nav className="sticky top-0 z-30 bg-[#0D253F] text-white shadow-md">
      <div className="container-default">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center space-x-2" aria-label="Accueil Cinetech 2.0">
            <span className="font-display text-xl font-bold text-accent">Cinetech</span>
            <span className="font-display text-lg">2.0</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
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
            <DarkModeToggle className="ml-2" />
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              href="/search"
              className="hover:opacity-80 transition-opacity"
              aria-label="Rechercher"
            >
              <FaSearch className="text-xl text-[#01B4E4] hover:opacity-80 hover:scale-110 transition-transform duration-200 ease-in-out" />
            </Link>
            
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
        </div>
        
        {/* Mobile menu */}
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
              <li className="px-4 py-2">
                <DarkModeToggle />
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
