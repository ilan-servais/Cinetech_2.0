// lib/utils.ts
import { ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Genre IDs to exclude from cinema/TV content (TMDB genre_ids)
export const EXCLUDED_GENRE_IDS = [
  99,     // Documentary
  10763,  // News/Talk shows
  10764,  // Reality
  10767,  // Talk Show
  // 10766,  // Soap - Removing this to allow more TV content
  // 10770   // TV Movie - Removing this to allow more TV content
]; 

// Genre names to exclude (for cases where we have genre objects instead of IDs)
const excludedGenreNames = ["Documentary", "Talk Show", "News", "Reality"];

// Title keywords that suggest content to exclude
const excludedTitleKeywords = [
  'saturday night live', 
  'talk show', 
  'variety', 
  'game show', 
  'news',
  'interview'
];

/**
 * Filters out media items with excluded genres based on genre_ids
 * @param items Array of media items from TMDB API
 * @param excludedIds Array of genre IDs to exclude
 * @returns Filtered array without excluded genres
 */
export function filterByCustomCategories(items: any[], excludedIds = EXCLUDED_GENRE_IDS) {
  if (!Array.isArray(items)) return [];
  
  return items.filter((item) => {
    // Skip items without genre_ids
    if (!item.genre_ids || item.genre_ids.length === 0) return true;
    
    // Keep the item if none of its genre_ids are in the excluded list
    return !item.genre_ids.some((id: number) => excludedIds.includes(id));
  });
}

/**
 * Filters out non-cinematic content like documentaries, talk shows, news, etc.
 * Comprehensive filter that checks genre_ids, genre objects, and title keywords
 * @param items Array of media items from TMDB API
 * @returns Filtered array containing only pure cinema/TV fiction content
 */
export function filterPureCinema(items: any[]) {
  if (!Array.isArray(items)) return [];
  
  // Log filtering stats for debugging
  const originalLength = items.length;
  
  const filtered = items.filter((item) => {
    // Check by genre IDs if available
    const genreIds = item.genre_ids || [];
    if (genreIds.some((id: number) => EXCLUDED_GENRE_IDS.includes(id))) {
      return false;
    }
    
    // Check by genre names if available (less strict for TV content)
    const genreNames = (item.genres || []).map((g: any) => g.name);
    if (genreNames.some((name: string) => 
      excludedGenreNames.some(excluded => 
        name.toLowerCase() === excluded.toLowerCase() // Exact match only instead of includes
      )
    )) {
      return false;
    }
    
    // Check by title keywords - only for exact matches to reduce filtering
    const title = (item.title || item.name || '').toLowerCase();
    if (excludedTitleKeywords.some(keyword => title === keyword)) {
      return false;
    }
    
    return true;
  });

  // For debugging in browser console
  if (typeof window !== 'undefined') {
    console.log(`Filtering: ${originalLength} -> ${filtered.length} items (${originalLength - filtered.length} removed)`);
  }
  
  return filtered;
}

/**
 * Applies permanent cinema filtering to content items
 * @param items Content items to filter
 * @returns Filtered items with non-cinema content removed
 */
export function applyPermanentFiltering(items: any[]): any[] {
  if (!Array.isArray(items)) return [];
  return filterPureCinema(items);
}

/**
 * Loads the excluded genre settings from localStorage
 * @returns Array of excluded genre IDs or default list if not found
 */
export function loadExcludedGenres(): number[] {
  if (typeof window === 'undefined') return EXCLUDED_GENRE_IDS;
  
  try {
    const savedExcluded = localStorage.getItem('cinetech_excluded_genres');
    return savedExcluded ? JSON.parse(savedExcluded) : EXCLUDED_GENRE_IDS;
  } catch {
    return EXCLUDED_GENRE_IDS;
  }
}

/**
 * Saves the excluded genre settings to localStorage
 * @param excludedIds Array of genre IDs to exclude
 */
export function saveExcludedGenres(excludedIds: number[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('cinetech_excluded_genres', JSON.stringify(excludedIds));
}

/**
 * Combines filtering by excluded genres with release date filtering
 * @param items Array of media items
 * @param excludedIds Array of genre IDs to exclude
 * @returns Filtered items with no excluded genres
 */
export function getCleanMediaItems(items: any[], excludedIds = EXCLUDED_GENRE_IDS) {
  return filterByCustomCategories(items, excludedIds);
}

import type { MediaItem } from '@/types';

/**
 * Filtre les résultats pour ne retenir que les contenus pertinents pour un public francophone
 * @param items Liste des contenus à filtrer
 * @returns Liste filtrée
 */
export function filterForFrenchAudience<T extends MediaItem>(items: T[]): T[] {
  return items.filter(item => {
    const lang = item.original_language as string | undefined;
    return lang === 'fr' || lang === 'en';
  });
}