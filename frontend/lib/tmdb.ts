import { MediaType, TMDBResponse, Movie, TVShow, MediaItem, Credits } from '@/types';
import { MediaDetails, CastResponse } from '@/types/tmdb';

// API configuration constants
const TMDB_API_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || '';
const LANGUAGE = 'fr-FR';

// Constante pour la limite de pages TMDB
const TMDB_MAX_PAGE = 500;

/**
 * Fonction utilitaire pour vérifier et limiter la page demandée
 * @param page Le numéro de page demandé
 * @returns Le numéro de page sécurisé (max 500)
 */
function ensureSafePage(page: number): number {
  if (page < 1) return 1;
  if (page > TMDB_MAX_PAGE) return TMDB_MAX_PAGE;
  return page;
}

async function fetchFromTMDB<T>(endpoint: string): Promise<T> {
  const url = `${TMDB_API_URL}${endpoint}`;
  const response = await fetch(url, { next: { revalidate: 3600 } }); // Revalidate once per hour
  
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Helper function to handle itemsPerPage by making multiple requests if needed
 * @param fetchFunction The TMDB fetch function to call
 * @param page Current page number
 * @param itemsPerPage Number of items requested per page
 * @returns Combined results with the requested number of items
 */
export async function fetchWithItemsPerPage<T extends { results: any[], total_pages: number, total_results: number }>(
  fetchFunction: (page: number) => Promise<T>,
  page: number,
  itemsPerPage: number = 20
): Promise<T> {
  // Si la page demandée dépasse la limite, limitons-la
  const safePage = ensureSafePage(page);
  
  // If default TMDB page size (20) is requested, just return regular results
  if (itemsPerPage <= 20) {
    return fetchFunction(safePage);
  }
  
  // Calculate how many pages we need to fetch to get the requested number of items
  const pagesToFetch = Math.ceil(itemsPerPage / 20);
  const startPage = ((safePage - 1) * pagesToFetch) + 1;
  
  // Fetch all required pages
  const requests: Promise<T>[] = [];
  for (let i = 0; i < pagesToFetch; i++) {
    // Make sure we don't exceed TMDB_MAX_PAGE
    if (startPage + i <= TMDB_MAX_PAGE) {
      requests.push(fetchFunction(startPage + i));
    }
  }
  
  const responses = await Promise.all(requests);
  
  if (responses.length === 0) {
    throw new Error('Failed to fetch data');
  }
  
  // Combine all results
  const combinedResults = responses.flatMap(response => response.results);
  
  // Calculate the starting index based on the requested page and items per page
  const startIdx = 0;
  const endIdx = itemsPerPage;
  
  // Create a new result object with the combined data
  const result = {
    ...responses[0],
    results: combinedResults.slice(startIdx, endIdx),
    // Adjust total pages based on new items per page and TMDB maximum
    total_pages: Math.min(Math.ceil(responses[0].total_results / itemsPerPage), TMDB_MAX_PAGE)
  };
  
  return result as T;
}

export async function getTrending(page = 1) {
  const safePage = ensureSafePage(page);
  const data = await fetchFromTMDB<TMDBResponse<MediaItem>>(
    `/trending/all/day?api_key=${TMDB_API_KEY}&language=${LANGUAGE}&page=${safePage}`
  );
  // Limiter le nombre de pages total retourné
  data.total_pages = Math.min(data.total_pages, TMDB_MAX_PAGE);
  return data;
}

export async function getNowPlayingMovies(page = 1) {
  const safePage = ensureSafePage(page);
  const data = await fetchFromTMDB<TMDBResponse<Movie>>(
    `/movie/now_playing?api_key=${TMDB_API_KEY}&language=${LANGUAGE}&page=${safePage}&region=FR`
  );
  data.total_pages = Math.min(data.total_pages, TMDB_MAX_PAGE);
  return data;
}

/**
 * Récupère les séries diffusées aujourd'hui filtrées pour éviter les talk-shows
 * Cette fonction s'assure de récupérer au moins 'minResults' séries valides
 * en faisant des requêtes supplémentaires si nécessaire
 */
export async function getAiringTodaySeriesFiltered(
  minResults: number = 10,
  maxPages: number = 5
): Promise<{ results: TVShow[] }> {
  // IDs des genres à exclure (talk shows, news, reality, documentaries)
  const excludedGenreIds = [10767, 10763, 10764, 99];
  
  let allResults: TVShow[] = [];
  let page = 1;
  let attemptsLeft = maxPages;

  while (allResults.length < minResults && attemptsLeft > 0) {
    try {
      const data = await fetchFromTMDB<TMDBResponse<TVShow>>(
        `/tv/airing_today?api_key=${TMDB_API_KEY}&language=${LANGUAGE}&page=${page}`
      );

      // Filtrer les résultats pour exclure les talk-shows et autres genres non désirés
      const filteredResults = data.results.filter(show => {
        if (!show.genre_ids || show.genre_ids.length === 0) return true;
        return !show.genre_ids.some(id => excludedGenreIds.includes(id));
      });

      // Ajouter les résultats filtrés à notre collection
      allResults = [...allResults, ...filteredResults];
      
      // Passer à la page suivante et décrémenter les tentatives restantes
      page++;
      attemptsLeft--;
      
      // Si on a atteint la dernière page de résultats, on sort de la boucle
      if (page > data.total_pages || page > TMDB_MAX_PAGE) {
        break;
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des séries diffusées aujourd'hui:", error);
      break;
    }
  }

  // Limiter aux 'minResults' premiers résultats valides
  return { results: allResults.slice(0, minResults) };
}

export async function getPopularMovies(page = 1) {
  const safePage = ensureSafePage(page);
  const data = await fetchFromTMDB<TMDBResponse<Movie>>(
    `/movie/popular?api_key=${TMDB_API_KEY}&language=${LANGUAGE}&page=${safePage}`
  );
  data.total_pages = Math.min(data.total_pages, TMDB_MAX_PAGE);
  return data;
}

export async function getPopularSeries(page = 1) {
  const safePage = ensureSafePage(page);
  const data = await fetchFromTMDB<TMDBResponse<TVShow>>(
    `/tv/popular?api_key=${TMDB_API_KEY}&language=${LANGUAGE}&page=${safePage}`
  );
  data.total_pages = Math.min(data.total_pages, TMDB_MAX_PAGE);
  return data;
}

export async function getTopRatedMovies(page = 1) {
  const safePage = ensureSafePage(page);
  const data = await fetchFromTMDB<TMDBResponse<Movie>>(
    `/movie/top_rated?api_key=${TMDB_API_KEY}&language=${LANGUAGE}&page=${safePage}`
  );
  data.total_pages = Math.min(data.total_pages, TMDB_MAX_PAGE);
  return data;
}

export async function getTopRatedSeries(page = 1) {
  const safePage = ensureSafePage(page);
  const data = await fetchFromTMDB<TMDBResponse<TVShow>>(
    `/tv/top_rated?api_key=${TMDB_API_KEY}&language=${LANGUAGE}&page=${safePage}`
  );
  data.total_pages = Math.min(data.total_pages, TMDB_MAX_PAGE);
  return data;
}

// Get movie or TV show details
export async function getMediaDetails(id: number, mediaType?: string): Promise<MediaDetails> {
  // If media type is provided, use it directly
  if (mediaType && ['movie', 'tv'].includes(mediaType)) {
    try {
      const result = await fetchFromTMDB<MediaDetails>(
        `/${mediaType}/${id}?api_key=${TMDB_API_KEY}&language=${LANGUAGE}`
      );
      return { ...result, media_type: mediaType };
    } catch (error) {
      console.error(`Error fetching ${mediaType} with ID ${id}:`, error);
      // If specified media type fails, try the other type
      const otherType = mediaType === 'movie' ? 'tv' : 'movie';
      try {
        const result = await fetchFromTMDB<MediaDetails>(
          `/${otherType}/${id}?api_key=${TMDB_API_KEY}&language=${LANGUAGE}`
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
      `/movie/${id}?api_key=${TMDB_API_KEY}&language=${LANGUAGE}`
    );
    return { ...movieData, media_type: 'movie' };
  } catch (error) {
    try {
      const tvData = await fetchFromTMDB<MediaDetails>(
        `/tv/${id}?api_key=${TMDB_API_KEY}&language=${LANGUAGE}`
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
    `/${mediaType}/${id}/credits?api_key=${TMDB_API_KEY}&language=${LANGUAGE}`
  );
}

// Get video information (trailers, teasers, etc.)
export async function getMediaVideos(id: number, mediaType: 'movie' | 'tv') {
  return fetchFromTMDB<{ results: any[] }>(
    `/${mediaType}/${id}/videos?api_key=${TMDB_API_KEY}&language=${LANGUAGE}`
  );
}

// Search for movies, TV shows, and people
export async function searchMulti(query: string, page = 1) {
  const safePage = ensureSafePage(page);
  const data = await fetchFromTMDB<TMDBResponse<MediaItem>>(
    `/search/multi?api_key=${TMDB_API_KEY}&language=${LANGUAGE}&query=${encodeURIComponent(query)}&page=${safePage}`
  );
  
  // S'assurer que tous les résultats ont un media_type valide
  data.results = data.results.map((item: any) => {
    if (!item.media_type || (item.media_type !== 'movie' && item.media_type !== 'tv')) {
      return {
        ...item,
        media_type: item.title ? 'movie' : 'tv'
      };
    }
    return item;
  });
  
  // Limiter le nombre de pages
  data.total_pages = Math.min(data.total_pages, TMDB_MAX_PAGE);
  
  return data;
}

// Get media by IDs (for favorites)
export async function getMediaByIds(ids: number[], mediaType: 'movie' | 'tv') {
  const promises = ids.map(id => 
    fetchFromTMDB<MediaDetails>(
      `/${mediaType}/${id}?api_key=${TMDB_API_KEY}&language=${LANGUAGE}`
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
    `/${mediaType}/${id}/watch/providers?api_key=${TMDB_API_KEY}`
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
      watchProvidersCache.set(cacheKey, null);
      return null;
    }
    
    const result = extractProviders(providersData.results[countryCode], fallbackToRent, fallbackToBuy);
    watchProvidersCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error(`Error fetching watch providers for ${mediaType} ${id}:`, error);
    watchProvidersCache.set(cacheKey, null);
    return null;
  }
}

// Add alias for getPopularSeries as getPopularTvShows for compatibility
export const getPopularTvShows = getPopularSeries;

// Add fetchPopular function that fetches popular content for both movies and TV shows
export async function fetchPopular(mediaType: 'movie' | 'tv', page = 1) {
  if (mediaType === 'movie') {
    return getPopularMovies(page);
  } else {
    return getPopularSeries(page);
  }
}

/**
 * Interface for genre definition
 */
export interface Genre {
  id: number;
  name: string;
}

/**
 * Get all genres for movies
 * @returns Array of genres
 */
export async function getMovieGenres(): Promise<Genre[]> {
  const data = await fetchFromTMDB<{genres: Genre[]}>(
    `/genre/movie/list?api_key=${TMDB_API_KEY}&language=${LANGUAGE}`
  );
  return data.genres;
}

/**
 * Get all genres for TV shows
 * @returns Array of genres
 */
export async function getTVGenres(): Promise<Genre[]> {
  const data = await fetchFromTMDB<{genres: Genre[]}>(
    `/genre/tv/list?api_key=${TMDB_API_KEY}&language=${LANGUAGE}`
  );
  return data.genres;
}

/**
 * Discover movies by genre
 * @param genreId Genre ID to filter by
 * @param page Page number
 * @returns Movies filtered by genre
 */
export async function discoverMoviesByGenre(genreId: number, page = 1) {
  const safePage = ensureSafePage(page);
  const data = await fetchFromTMDB<TMDBResponse<Movie>>(
    `/discover/movie?api_key=${TMDB_API_KEY}&language=${LANGUAGE}&with_genres=${genreId}&page=${safePage}`
  );
  data.total_pages = Math.min(data.total_pages, TMDB_MAX_PAGE);
  return data;
}

/**
 * Discover TV shows by genre
 * @param genreId Genre ID to filter by
 * @param page Page number
 * @returns TV shows filtered by genre
 */
export async function discoverTVByGenre(genreId: number, page = 1) {
  const safePage = ensureSafePage(page);
  const data = await fetchFromTMDB<TMDBResponse<TVShow>>(
    `/discover/tv?api_key=${TMDB_API_KEY}&language=${LANGUAGE}&with_genres=${genreId}&page=${safePage}`
  );
  data.total_pages = Math.min(data.total_pages, TMDB_MAX_PAGE);
  return data;
}

// Export the TMDB_MAX_PAGE constant for use in components
export { TMDB_MAX_PAGE };
