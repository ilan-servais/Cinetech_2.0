"use client";

import React, { useState, useEffect } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';

interface DarkModeToggleProps {
  className?: string;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ className = '' }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark = localStorage.getItem('darkMode') === 'true' || 
      (!localStorage.getItem('darkMode') && 
      window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setDarkMode(isDark);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (!mounted) return <div className={`w-9 h-6 ${className}`}></div>;

  return (
    <button 
      onClick={toggleDarkMode}
      className={`p-1 rounded-full transition-colors ${
        darkMode ? 'text-yellow-300 hover:text-yellow-200' : 'text-gray-300 hover:text-white'
      } ${className}`}
      aria-label={darkMode ? "Activer le mode clair" : "Activer le mode sombre"}
    >
      {darkMode ? <FaSun size={18} /> : <FaMoon size={16} />}
    </button>
  );
};

export default DarkModeToggle;
