"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import SearchBar from './SearchBar';
import { getPopularMovies } from '@/lib/tmdb';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ 
  title = "Bienvenue sur Cinetech 2.0",
  subtitle = "Des millions de films, séries et artistes à découvrir. Explorez maintenant."
}) => {
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBackgroundImage = async () => {
      try {
        const moviesData = await getPopularMovies(1);
        // Prendre une image aléatoire parmi les 5 premiers films populaires
        const randomIndex = Math.floor(Math.random() * 5);
        const backdropPath = moviesData.results[randomIndex]?.backdrop_path;
        
        if (backdropPath) {
          setBgImageUrl(`${process.env.NEXT_PUBLIC_TMDB_IMAGE_URL_ORIGINAL}${backdropPath}`);
        } else {
          // Image par défaut si aucune n'est disponible
          setBgImageUrl('/images/default-backdrop.png');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'image de fond:', error);
        setBgImageUrl('/images/default-backdrop.png');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBackgroundImage();
  }, []);

  return (
    <section className="relative h-[70vh] flex items-center justify-center text-center text-[#0D253F]">
      <div className="absolute inset-0 -z-10">
        {!isLoading && bgImageUrl && (
          <Image
            src={bgImageUrl}
            alt="Hero background"
            fill
            className="object-cover"
            priority
            quality={85}
          />
        )}
        {/* Overlay bleu clair semi-transparent */}
        <div className="absolute inset-0 bg-[#E3F3FF]/30"></div>
      </div>

      <div className="z-10 px-4 sm:px-8 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-md">{title}</h1>
        <p className="text-lg md:text-xl mb-6 text-white drop-shadow-sm">{subtitle}</p>
        <div className="w-full">
          <SearchBar />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
