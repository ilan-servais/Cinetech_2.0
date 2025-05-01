"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export interface Genre {
  id: number;
  name: string;
}

interface GenreSelectorProps {
  genres: Genre[];
  selectedGenreId?: number | null;
  baseUrl: string;
  currentPage: number;
  itemsPerPage?: number;
}

const GenreSelector: React.FC<GenreSelectorProps> = ({
  genres,
  selectedGenreId,
  baseUrl,
  currentPage,
  itemsPerPage
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Create URL with appropriate query parameters
  const createGenreUrl = (genreId: number | null) => {
    const params = new URLSearchParams();
    
    if (genreId) {
      params.append('genre', genreId.toString());
    }
    
    if (currentPage > 1) {
      params.append('page', '1'); // Reset to page 1 when changing genre
    }
    
    if (itemsPerPage) {
      params.append('items', itemsPerPage.toString());
    }
    
    const queryString = params.toString();
    return `${baseUrl}${queryString ? `?${queryString}` : ''}`;
  };

  // Find the selected genre name for display
  const selectedGenre = selectedGenreId 
    ? genres.find(genre => genre.id === selectedGenreId) 
    : null;

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-2">
        <label htmlFor="genreSelect" className="text-sm text-[#0D253F] dark:text-white">
          Genre:
        </label>
        <button
          id="genreSelect"
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-1 border rounded bg-white text-[#0D253F] text-sm focus:outline-none focus:ring-1 focus:ring-accent flex items-center justify-between min-w-[150px] dark:bg-gray-800 border-gray-300 dark:border-gray-700 dark:text-white"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className="truncate">
            {selectedGenre ? selectedGenre.name : 'Tous les genres'}
          </span>
          <svg 
            className="w-4 h-4 ml-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-56 max-h-60 overflow-auto rounded-md bg-white shadow-lg dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
          <ul className="py-1" role="listbox">
            <li>
              <Link 
                href={createGenreUrl(null)}
                className={`block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${!selectedGenreId ? 'bg-accent/10 text-accent font-medium dark:bg-accent/20 dark:text-accent' : 'text-[#0D253F] dark:text-white'}`}
                onClick={() => setIsOpen(false)}
                role="option"
                aria-selected={!selectedGenreId}
              >
                Tous les genres
              </Link>
            </li>
            {genres.map(genre => (
              <li key={genre.id}>
                <Link 
                  href={createGenreUrl(genre.id)}
                  className={`block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${selectedGenreId === genre.id ? 'bg-accent/10 text-accent font-medium dark:bg-accent/20 dark:text-accent' : 'text-[#0D253F] dark:text-white'}`}
                  onClick={() => setIsOpen(false)}
                  role="option"
                  aria-selected={selectedGenreId === genre.id}
                >
                  {genre.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GenreSelector;
