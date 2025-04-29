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
    <div className="bg-background dark:bg-primary relative py-16 md:py-24">
      <div className="container-default text-center">
        <h1 className="heading-1 mb-4 max-w-3xl mx-auto">
          {title}
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-gray-700 dark:text-gray-300">
          {subtitle}
        </p>
        <SearchBar />
      </div>
    </div>
  );
};

export default HeroSection;
