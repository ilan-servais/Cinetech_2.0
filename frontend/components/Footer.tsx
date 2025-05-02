import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-[#0D253F] text-white py-6 mt-auto" style={{ backgroundColor: '#0D253F' }}>
      <div className="container-default">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold">Cinetech 2.0</span>
            </Link>
            <p className="text-sm mt-2 text-gray-300">
              Explorez les films et séries populaires
            </p>
          </div>
          
          <div className="flex flex-wrap gap-6">
            <div>
              <h3 className="font-semibold mb-2 text-white">Films</h3>
              <ul className="space-y-1 text-sm">
                <li><Link href="/movies">Populaires</Link></li>
                <li><Link href="/movies/now-playing">À l'affiche</Link></li>
                <li><Link href="/movies/top-rated">Mieux notés</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2 text-white">Séries</h3>
              <ul className="space-y-1 text-sm">
                <li><Link href="/series">Populaires</Link></li>
                <li><Link href="/tv/airing-today">Diffusion récente</Link></li>
                <li><Link href="/tv/top-rated">Mieux notées</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2 text-white">Liens</h3>
              <ul className="space-y-1 text-sm">
                <li><Link href="/search">Recherche</Link></li>
                <li><Link href="/favorites">Favoris</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-700 text-center text-sm text-gray-400">
          <p>
            Powered by{' '}
            <a 
              href="https://www.themoviedb.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#01b4e4] hover:underline"
            >
              TMDB API
            </a>
            {' | '}
            <span>© {new Date().getFullYear()} Cinetech 2.0</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
