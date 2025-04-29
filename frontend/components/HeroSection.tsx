import React from 'react';
import SearchBar from './SearchBar';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ 
  title = "Bienvenue sur Cinetech 2.0",
  subtitle = "Des millions de films, séries et artistes à découvrir. Explorez maintenant."
}) => {
  return (
    <div className="bg-background dark:bg-primary relative py-16 md:py-24 animate-fade-in">
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background dark:from-primary/50 dark:to-primary"></div>
      <div className="container-default text-center relative z-10">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4 text-primary dark:text-textLight">
          {title}
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-gray-700 dark:text-gray-300">
          {subtitle}
        </p>
        <div className="max-w-2xl mx-auto">
          <SearchBar />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
