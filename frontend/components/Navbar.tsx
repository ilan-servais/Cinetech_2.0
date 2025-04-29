import React from 'react';
import Link from 'next/link';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-primary text-textLight shadow-md sticky top-0 z-50">
      <div className="container-default">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center space-x-2" aria-label="Accueil Cinetech 2.0">
            <span className="font-display text-xl font-bold text-accent">Cinetech</span>
            <span className="font-display text-lg">2.0</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="hover:text-accent">
              Accueil
            </Link>
            <Link href="/movies" className="hover:text-accent">
              Films
            </Link>
            <Link href="/series" className="hover:text-accent">
              Séries
            </Link>
            <Link href="/favorites" className="hover:text-accent">
              Favoris
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              className="btn-secondary !p-2 rounded-full" 
              aria-label="Rechercher"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </button>
            
            <button 
              className="md:hidden text-textLight" 
              aria-label="Ouvrir le menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <Link href="/login" className="hidden md:block btn-secondary">
              Connexion
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
