"use client";

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

interface DarkModeToggleProps {
  className?: string;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ className = '' }) => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // After mounting, we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Toggle dark mode using next-themes
  const toggleDarkMode = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };
  
  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return <div className={`w-10 h-5 bg-gray-300 rounded-full ${className}`}></div>;
  }
  
  return (
    <button 
      onClick={toggleDarkMode}
      className={`flex items-center gap-1 transition-colors ${className}`}
      title={isDarkMode ? "Passer au mode clair" : "Passer au mode sombre"}
      aria-label={isDarkMode ? "Passer au mode clair" : "Passer au mode sombre"}
    >
      <div className={`w-10 h-5 rounded-full transition-colors ${isDarkMode ? 'bg-accent' : 'bg-gray-300'} flex items-center px-0.5`}>
        <div 
          className={`w-4 h-4 rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-5' : 'translate-x-0'} shadow`}
        ></div>
      </div>
    </button>
  );
};

export default DarkModeToggle;
