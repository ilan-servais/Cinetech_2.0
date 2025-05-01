"use client";

import { ReactNode } from 'react';
import { filterPureCinema } from '@/lib/utils';

interface CinemaModeProviderProps {
  children: (filteredData: any[]) => ReactNode;
  data: any[];
}

// Nouveau composant qui applique toujours le filtre cinéma
export default function PureCinemaProvider({ 
  children, 
  data
}: CinemaModeProviderProps) {
  // Toujours filtrer les données sans condition
  const filteredData = filterPureCinema(data);
  
  // Retourner simplement les données filtrées, sans état de "mode cinéma"
  return <>{children(filteredData)}</>;
}
