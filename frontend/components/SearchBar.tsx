"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  initialQuery?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsSearching(true);
      router.push(`/search?q=${encodeURIComponent(query)}`);
      // Reset isSearching after navigation
      setTimeout(() => setIsSearching(false), 300);
    }
  };
  
  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="relative" role="search" aria-label="Rechercher des films et séries">
        <label htmlFor="search-input" className="sr-only">Rechercher un film, une série, un artiste</label>
        <input
          id="search-input"
          type="text"
          placeholder="Rechercher un film, une série, un artiste..."
          className="w-full px-5 py-3 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-accent"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isSearching}
        />
        <button 
          type="submit" 
          className="absolute right-1 top-1 px-4 py-2 bg-accent text-primary hover:bg-primary hover:text-textLight rounded-full transition-colors duration-200 ease-in-out disabled:opacity-70"
          disabled={isSearching || !query.trim()}
          aria-label="Rechercher"
        >
          {isSearching ? (
            <span className="flex items-center justify-center w-5 h-5" aria-hidden="true">
              <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
            </span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          )}
          <span className="sr-only">Lancer la recherche</span>
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
