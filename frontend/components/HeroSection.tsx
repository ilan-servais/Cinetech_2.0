"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SearchBar from './SearchBar';
import { getPopularMovies } from '@/lib/tmdb';
import { MediaItem } from '@/types';
import TMDBImage from './TMDBImage';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ 
  title = "Découvrez des milliers de films et séries",
  subtitle = "Explorez une collection infinie de contenus audiovisuels et trouvez votre prochaine passion cinématographique",
  ctaText = "Explorer maintenant",
  ctaLink = "/trending"
}) => {
  // État pour le chemin de l'image de fond (backdrop_path de TMDB)
  const [backdropPath, setBackdropPath] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Charger une image de fond depuis TMDB au montage du composant
  useEffect(() => {
    // Fonction pour récupérer une image de film populaire
    async function loadBackgroundImage() {
      setIsLoading(true);
      try {
        // Récupérer les tendances populaires
        const data = await fetch('/api/trending?page=1');
        const json = await data.json();
        
        // Filtrer pour ne garder que les films/séries en français ou anglais
        const filteredResults = json.results.filter(
          (item: MediaItem) => item.original_language === 'fr' || item.original_language === 'en'
        );
        
        // Sélectionner un item aléatoire pour le hero
        if (filteredResults.length > 0) {
          const randomIndex = Math.floor(Math.random() * Math.min(5, filteredResults.length));
          const item = filteredResults[randomIndex];
          
          if (item?.backdrop_path) {
            setBackdropPath(item.backdrop_path);
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'image de fond:", error);
        // En cas d'erreur, on garde l'image null qui activera le fallback du TMDBImage
      } finally {
        setIsLoading(false);
      }
    }
    
    // Charger l'image au montage du composant
    loadBackgroundImage();
  }, []);

  return (
    <section className="relative min-h-[60vh] mt-8 w-full flex items-center justify-center">
      {/* Conteneur d'image de fond */}      <div className="absolute inset-0 w-full h-full overflow-hidden shadow-lg">
        <TMDBImage 
          path={backdropPath}
          type="backdrop"
          size="original"
          alt="Cinéma background"
          fill
          priority={true}
          sizes="100vw"
          className="object-cover"
          quality={65}
          loading="eager"
        />
        
        {/* Overlay pour améliorer la lisibilité du texte */}
        <div className="absolute inset-0 bg-[#74d0f7]/65 dark:bg-[#1c2a4f]/75 backdrop-blur-[2px]"></div>
      </div>
      
      {/* Contenu principal */}
      <div className="relative z-10 container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-[#0D253F] dark:text-white">
          {title}
        </h1>
        
        <p className="text-base md:text-lg lg:text-xl mb-6 max-w-2xl mx-auto text-[#0D253F]/90 dark:text-white/90">
          {subtitle}
        </p>
        
        <div className="max-w-2xl mx-auto mb-6">
          <SearchBar />
        </div>
        
        <Link 
          href={ctaLink}
          className="btn-primary mt-6 inline-block text-base py-2 px-6"
        >
          {ctaText}
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;
