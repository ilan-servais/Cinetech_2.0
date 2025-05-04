"use client";

import React from 'react';

interface MediaTypeFilterProps {
  selectedMediaType: 'movie' | 'tv' | undefined;
  onMediaTypeChange: (mediaType: 'movie' | 'tv' | undefined) => void;
}

/**
 * Composant permettant de filtrer les résultats par type de média (films ou séries)
 */
const MediaTypeFilter: React.FC<MediaTypeFilterProps> = ({ 
  selectedMediaType, 
  onMediaTypeChange 
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-white rounded-lg shadow-sm dark:bg-gray-800">
      <span className="font-medium text-[#0D253F] dark:text-white">Filtrer par type :</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onMediaTypeChange(undefined)}
          className={`px-4 py-2 rounded-md transition-colors ${
            selectedMediaType === undefined
              ? 'bg-accent text-white font-medium'
              : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
          }`}
        >
          Tous
        </button>
        <button
          onClick={() => onMediaTypeChange('movie')}
          className={`px-4 py-2 rounded-md transition-colors ${
            selectedMediaType === 'movie'
              ? 'bg-accent text-white font-medium'
              : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
          }`}
        >
          Films
        </button>
        <button
          onClick={() => onMediaTypeChange('tv')}
          className={`px-4 py-2 rounded-md transition-colors ${
            selectedMediaType === 'tv'
              ? 'bg-accent text-white font-medium'
              : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
          }`}
        >
          Séries
        </button>
      </div>
    </div>
  );
};

export default MediaTypeFilter;
