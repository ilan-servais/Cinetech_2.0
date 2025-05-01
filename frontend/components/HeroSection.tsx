"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SearchBar from './SearchBar';
import { getPopularMovies } from '@/lib/tmdb';

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
  // État pour l'URL de l'image de fond
  const [bgImage, setBgImage] = useState('/images/default-backdrop.webp');
  const [isLoading, setIsLoading] = useState(true);
  
  // Charger une image de fond depuis TMDB au montage du composant
  useEffect(() => {
    // Fonction pour récupérer une image de film populaire
    async function loadBackgroundImage() {
      setIsLoading(true);
      try {
        const movies = await getPopularMovies(1);
        if (movies?.results?.length > 0) {
          // Sélectionner un film aléatoire parmi les 5 premiers
          const randomIndex = Math.floor(Math.random() * Math.min(5, movies.results.length));
          const backdropPath = movies.results[randomIndex]?.backdrop_path;
          
          if (backdropPath) {
            // Construire l'URL complète de l'image
            const imageUrl = `${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL_ORIGINAL}${backdropPath}`;
            setBgImage(imageUrl);
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'image de fond:", error);
        // En cas d'erreur, on garde l'image par défaut
      } finally {
        setIsLoading(false);
      }
    }
    
    // Charger l'image au montage du composant
    loadBackgroundImage();
  }, []);

  return (
    <section className="relative min-h-[60vh] mt-8 w-full flex items-center justify-center">
      {/* Conteneur d'image de fond */}
      <div className="absolute inset-0 w-full h-full overflow-hidden shadow-lg">
        <Image 
          src={bgImage}
          alt="Cinéma background"
          fill
          priority={true}
          sizes="100vw"
          className="object-cover"
          quality={65}
          placeholder="blur"
          blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Cpath d='M0 0h40v40H0z' fill='%2374d0f7'/%3E%3C/svg%3E"
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
          className="btn-primary no-dark mt-6 inline-block text-base py-2 px-6"
        >
          {ctaText}
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;
