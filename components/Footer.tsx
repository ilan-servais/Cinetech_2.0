import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0D253F] text-white py-8">
      <div className="container-default">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link href="/" className="flex items-center space-x-2" aria-label="Accueil Cinetech 2.0">
              <span className="font-display text-xl font-bold text-accent">Cinetech</span>
              <span className="font-display text-lg">2.0</span>
            </Link>
            <p className="text-sm mt-2 text-gray-300">
              Votre plateforme de découverte cinématographique
            </p>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-xs text-gray-400">
              Ce produit utilise l'API de TMDB mais n'est pas approuvé ou certifié par TMDB.
            </p>
            <div className="mt-2">
              <img 
                src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg" 
                alt="TMDB Logo" 
                className="h-4 inline-block"
              />
            </div>
            <p className="text-xs text-gray-400 mt-4">
              © {new Date().getFullYear()} Cinetech 2.0
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
