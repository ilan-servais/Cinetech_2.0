"use client";

import { ReactNode, useEffect, useState } from 'react';
import { loadCinemaOnlyMode, filterPureCinema } from '@/lib/utils';

interface CinemaModeProviderProps {
  children: (filteredData: any[], isCinemaMode: boolean) => ReactNode;
  data: any[];
  initialFiltered?: boolean;
}

export default function CinemaModeProvider({ 
  children, 
  data,
  initialFiltered = false 
}: CinemaModeProviderProps) {
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [filteredData, setFilteredData] = useState(initialFiltered ? filterPureCinema(data) : data);
  
  useEffect(() => {
    // Check cinema mode setting
    const cinemaMode = loadCinemaOnlyMode();
    setIsCinemaMode(cinemaMode);
    
    // Apply filter if cinema mode is active
    if (cinemaMode) {
      setFilteredData(filterPureCinema(data));
    } else {
      setFilteredData(data);
    }
    
    // Listen for changes to cinema mode
    const handleCinemaModeChange = () => {
      const newMode = loadCinemaOnlyMode();
      setIsCinemaMode(newMode);
      setFilteredData(newMode ? filterPureCinema(data) : data);
    };
    
    window.addEventListener('cinema-mode-changed', handleCinemaModeChange);
    return () => {
      window.removeEventListener('cinema-mode-changed', handleCinemaModeChange);
    };
  }, [data]);
  
  return <>{children(filteredData, isCinemaMode)}</>;
}
