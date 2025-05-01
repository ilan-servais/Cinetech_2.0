import { MediaItem, TMDBResponse, MediaDetails, CastResponse } from '../types/tmdb';

const API_URL = process.env.NEXT_PUBLIC_TMDB_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

async function fetchFromTMDB<T>(endpoint: string): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, { next: { revalidate: 3600 } }); // Revalidate once per hour
  
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }
  
  return response.json();
}

export async function getTrending(page = 1) {
  const data = await fetchFromTMDB<TMDBResponse>(
    `/trending/all/day?api_key=${API_KEY}&language=fr-FR&page=${page}`
  );
  return data;
}

export async function getNowPlayingMovies(page = 1) {
  const data = await fetchFromTMDB<TMDBResponse>(
    `/movie/now_playing?api_key=${API_KEY}&language=fr-FR&page=${page}&region=FR`
  );
  return data;
}

export async function getAiringTodaySeries(page = 1) {
  const data = await fetchFromTMDB<TMDBResponse>(
    `/tv/airing_today?api_key=${API_KEY}&language=fr-FR&page=${page}`
  );
  return data;
}

export async function getPopularMovies(page = 1) {
  const data = await fetchFromTMDB<TMDBResponse>(
    `/movie/popular?api_key=${API_KEY}&language=fr-FR&page=${page}`
  );
  return data;
}

export async function getPopularSeries(page = 1) {
  const data = await fetchFromTMDB<TMDBResponse>(
    `/tv/popular?api_key=${API_KEY}&language=fr-FR&page=${page}`
  );
  return data;
}

export async function getTopRatedMovies(page = 1) {
  const data = await fetchFromTMDB<TMDBResponse>(
    `/movie/top_rated?api_key=${API_KEY}&language=fr-FR&page=${page}`
  );
  return data;
}

export async function getTopRatedSeries(page = 1) {
  const data = await fetchFromTMDB<TMDBResponse>(
    `/tv/top_rated?api_key=${API_KEY}&language=fr-FR&page=${page}`
  );
  return data;
}

// Get movie or TV show details
export async function getMediaDetails(id: number, mediaType?: string): Promise<MediaDetails> {
  // If media type is provided, use it directly
  if (mediaType && ['movie', 'tv'].includes(mediaType)) {
    try {
      const result = await fetchFromTMDB<MediaDetails>(
        `/${mediaType}/${id}?api_key=${API_KEY}&language=fr-FR`
      );
      return { ...result, media_type: mediaType };
    } catch (error) {
      console.error(`Error fetching ${mediaType} with ID ${id}:`, error);
      // If specified media type fails, try the other type
      const otherType = mediaType === 'movie' ? 'tv' : 'movie';
      try {
        const result = await fetchFromTMDB<MediaDetails>(
          `/${otherType}/${id}?api_key=${API_KEY}&language=fr-FR`
        );
        return { ...result, media_type: otherType };
      } catch (otherError) {
        throw new Error(`Média non trouvé avec l'ID: ${id}`);
      }
    }
  }
  
  // If media type is not provided, try movie first, then TV
  try {
    const movieData = await fetchFromTMDB<MediaDetails>(
      `/movie/${id}?api_key=${API_KEY}&language=fr-FR`
    );
    return { ...movieData, media_type: 'movie' };
  } catch (error) {
    try {
      const tvData = await fetchFromTMDB<MediaDetails>(
        `/tv/${id}?api_key=${API_KEY}&language=fr-FR`
      );
      return { ...tvData, media_type: 'tv' };
    } catch (tvError) {
      throw new Error(`Média non trouvé avec l'ID: ${id}`);
    }
  }
}

// Get cast information
export async function getMediaCredits(id: number, mediaType: 'movie' | 'tv') {
  return fetchFromTMDB<CastResponse>(
    `/${mediaType}/${id}/credits?api_key=${API_KEY}&language=fr-FR`
  );
}

// Get video information (trailers, teasers, etc.)
export async function getMediaVideos(id: number, mediaType: 'movie' | 'tv') {
  return fetchFromTMDB<{ results: any[] }>(
    `/${mediaType}/${id}/videos?api_key=${API_KEY}&language=fr-FR`
  );
}

// Search for movies, TV shows, and people
export async function searchMulti(query: string, page = 1) {
  const data = await fetchFromTMDB<TMDBResponse>(
    `/search/multi?api_key=${API_KEY}&language=fr-FR&query=${encodeURIComponent(query)}&page=${page}`
  );
  
  // S'assurer que tous les résultats ont un media_type valide
  data.results = data.results.map(item => {
    if (!item.media_type || (item.media_type !== 'movie' && item.media_type !== 'tv')) {
      return {
        ...item,
        media_type: item.title ? 'movie' : 'tv'
      };
    }
    return item;
  });
  
  return data;
}

// Get media by IDs (for favorites)
export async function getMediaByIds(ids: number[], mediaType: 'movie' | 'tv') {
  const promises = ids.map(id => 
    fetchFromTMDB<MediaDetails>(
      `/${mediaType}/${id}?api_key=${API_KEY}&language=fr-FR`
    ).catch(err => {
      console.error(`Error fetching ${mediaType} with ID ${id}:`, err);
      return null;
    })
  );
  
  const results = await Promise.all(promises);
  return results.filter(Boolean) as MediaDetails[];
}

/**
 * Interface for streaming provider response
 */
export interface WatchProviders {
  id: number;
  results: {
    [countryCode: string]: {
      link: string;
      flatrate?: Array<Provider>;
      rent?: Array<Provider>;
      buy?: Array<Provider>;
    }
  }
}

export interface Provider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

/**
 * Fetches streaming providers for a specific movie or TV show
 * @param id Media ID
 * @param mediaType 'movie' or 'tv'
 * @returns Object containing streaming provider data
 */
export async function getWatchProviders(id: number, mediaType: 'movie' | 'tv'): Promise<WatchProviders> {
  const data = await fetchFromTMDB<WatchProviders>(
    `/${mediaType}/${id}/watch/providers?api_key=${API_KEY}`
  );
  return data;
}

// Cache for watch providers to reduce API calls
const watchProvidersCache = new Map<string, any>();

/**
 * Extract providers based on availability, with fallbacks
 */
function extractProviders(
  countryData: any, 
  fallbackToRent: boolean = true,
  fallbackToBuy: boolean = true
): { providers: Provider[], type: 'flatrate' | 'rent' | 'buy' | null } | null {
  // First try flatrate (streaming)
  if (countryData.flatrate && countryData.flatrate.length > 0) {
    return { providers: countryData.flatrate, type: 'flatrate' };
  }
  
  // Fallback to rent if no flatrate
  if (fallbackToRent && countryData.rent && countryData.rent.length > 0) {
    return { providers: countryData.rent, type: 'rent' };
  }
  
  // Fallback to buy if no flatrate or rent
  if (fallbackToBuy && countryData.buy && countryData.buy.length > 0) {
    return { providers: countryData.buy, type: 'buy' };
  }
  
  return null;
}

/**
 * Gets streaming providers with caching
 * @param id Media ID
 * @param mediaType 'movie' or 'tv'
 * @param countryCode Country code to get providers for (default: FR)
 * @param fallbackToRent Whether to use rent providers if flatrate isn't available
 * @param fallbackToBuy Whether to use buy providers if flatrate and rent aren't available
 * @returns Object containing streaming provider data or null
 */
export async function getCachedWatchProviders(
  id: number, 
  mediaType: 'movie' | 'tv',
  countryCode = 'FR',
  fallbackToRent = true,
  fallbackToBuy = true
): Promise<{ providers: Provider[], type: 'flatrate' | 'rent' | 'buy' | null } | null> {
  const cacheKey = `${mediaType}_${id}_${countryCode}`;
  
  if (watchProvidersCache.has(cacheKey)) {
    return watchProvidersCache.get(cacheKey);
  }
  
  try {
    const providersData = await getWatchProviders(id, mediaType);
    
    if (!providersData.results || !providersData.results[countryCode]) {
      // Try other common country codes if the preferred one isn't available
      const alternativeCountries = ['US', 'GB', 'CA', 'DE'];
      for (const altCountry of alternativeCountries) {
        if (providersData.results && providersData.results[altCountry]) {
          const result = extractProviders(providersData.results[altCountry], fallbackToRent, fallbackToBuy);
          if (result) {
            watchProvidersCache.set(cacheKey, result);
            return result;
          }
        }
      }
      return null;
    }
    
    const countryProviders = providersData.results[countryCode];
    const result = extractProviders(countryProviders, fallbackToRent, fallbackToBuy);
    
    if (result) {
      watchProvidersCache.set(cacheKey, result);
    }
    
    return result;
  } catch (error) {
    console.error(`Error fetching watch providers for ${mediaType} ${id}:`, error);
    return null;
  }
}
