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
  ctaLink = "/movies"
}) => {
  // État pour l'URL de l'image de fond
  const [bgImage, setBgImage] = useState('/images/default-backdrop.png');
  
  // Charger une image de fond depuis TMDB au montage du composant
  useEffect(() => {
    // Fonction pour récupérer une image de film populaire
    async function loadBackgroundImage() {
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
      }
    }
    
    // Charger l'image au montage du composant
    loadBackgroundImage();
  }, []);

  return (
    <section className="relative h-screen w-full flex items-center justify-center">
      {/* Conteneur d'image de fond */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <Image 
          src={bgImage}
          alt="Cinéma background"
          fill
          priority
          sizes="100vw"
          className="object-cover"
          quality={85}
        />
        
        {/* Overlay pour améliorer la lisibilité du texte */}
        <div className="absolute inset-0 bg-[#74d0f7]/50 backdrop-blur-[2px]"></div>
      </div>
      
      {/* Contenu principal */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-[#0D253F]">
          {title}
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl mb-8 max-w-3xl mx-auto text-[#0D253F]/90">
          {subtitle}
        </p>
        
        <div className="max-w-2xl mx-auto mb-8">
          <SearchBar />
        </div>
        
        <Link 
          href={ctaLink}
          className="btn-primary inline-block text-lg py-3 px-8"
        >
          {ctaText}
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;
