"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const router = useRouter();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };
  
  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          placeholder="Rechercher un film, une série, un artiste..."
          className="w-full px-5 py-3 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-accent"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button 
          type="submit" 
          className="absolute right-1 top-1 px-4 py-2 bg-accent text-white rounded-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
