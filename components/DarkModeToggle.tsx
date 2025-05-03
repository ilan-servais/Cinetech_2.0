"use client";

import React, { useState, useEffect } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from '@/contexts/ThemeContext';

interface DarkModeToggleProps {
  className?: string;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ className = '' }) => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleDarkMode = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) return <div className={`w-9 h-6 ${className}`}></div>;

  return (
    <button 
      onClick={toggleDarkMode}
      className={`p-1 rounded-full transition-colors ${
        theme === 'dark' ? 'text-yellow-300 hover:text-yellow-200' : 'text-gray-300 hover:text-white'
      } ${className}`}
      aria-label={theme === 'dark' ? "Activer le mode clair" : "Activer le mode sombre"}
    >
      {theme === 'dark' ? <FaSun size={18} /> : <FaMoon size={16} />}
    </button>
  );
};

export default DarkModeToggle;
