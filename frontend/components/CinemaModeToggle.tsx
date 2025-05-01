"use client";

import React, { useState, useEffect } from 'react';
import { loadCinemaOnlyMode, saveCinemaOnlyMode } from '@/lib/utils';

interface CinemaModeToggleProps {
  className?: string;
}

const CinemaModeToggle: React.FC<CinemaModeToggleProps> = ({ className = '' }) => {
  const [cinemaOnly, setCinemaOnly] = useState(false);
  
  useEffect(() => {
    // Load the saved preference when the component mounts
    setCinemaOnly(loadCinemaOnlyMode());
    
    // Optional: Add listener for changes from other components
    const handleModeChange = () => {
      setCinemaOnly(loadCinemaOnlyMode());
    };
    
    window.addEventListener('cinema-mode-changed', handleModeChange);
    return () => window.removeEventListener('cinema-mode-changed', handleModeChange);
  }, []);
  
  const toggleCinemaMode = () => {
    const newMode = !cinemaOnly;
    setCinemaOnly(newMode);
    saveCinemaOnlyMode(newMode);
    
    // Reload the page to apply the filter
    window.location.reload();
  };
  
  return (
    <button 
      onClick={toggleCinemaMode}
      className={`flex items-center gap-1 transition-colors ${className}`}
      title={cinemaOnly ? "Désactiver le mode cinéma (masquage documentaires, talk-shows...)" : "Activer le mode cinéma (masquer documentaires, talk-shows...)"}
    >
      <div className={`w-10 h-5 rounded-full transition-colors ${cinemaOnly ? 'bg-accent' : 'bg-gray-300'} flex items-center px-0.5`}>
        <div 
          className={`w-4 h-4 rounded-full bg-white transition-transform ${cinemaOnly ? 'translate-x-5' : 'translate-x-0'} shadow`}
        ></div>
      </div>
      <span className="text-sm">Mode cinéma{cinemaOnly ? ' ✓' : ''}</span>
      <small className="text-xs text-gray-500 hidden sm:inline-block ml-1">(masque documentaires, talk-shows)</small>
    </button>
  );
};

export default CinemaModeToggle;
