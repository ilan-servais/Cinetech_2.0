import { MediaItem, TMDBResponse, MediaDetails, CastResponse } from '../types/tmdb';

const API_URL = process.env.NEXT_PUBLIC_TMDB_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

async function fetchFromTMDB<T>(endpoint: string): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }
  
  return response.json();
}

export async function getTrending() {
  const data = await fetchFromTMDB<TMDBResponse>(
    `/trending/all/day?api_key=${API_KEY}&language=fr-FR`
  );
  return data.results;
}

export async function getNowPlayingMovies() {
  const data = await fetchFromTMDB<TMDBResponse>(
    `/movie/now_playing?api_key=${API_KEY}&language=fr-FR`
  );
  return data.results;
}

export async function getAiringTodaySeries() {
  const data = await fetchFromTMDB<TMDBResponse>(
    `/tv/airing_today?api_key=${API_KEY}&language=fr-FR`
  );
  return data.results;
}

export async function getPopularMovies() {
  const data = await fetchFromTMDB<TMDBResponse>(
    `/movie/popular?api_key=${API_KEY}&language=fr-FR`
  );
  return data.results;
}

export async function getPopularSeries() {
  const data = await fetchFromTMDB<TMDBResponse>(
    `/tv/popular?api_key=${API_KEY}&language=fr-FR`
  );
  return data.results;
}

// Get movie or TV show details
export async function getMediaDetails(id: number, mediaType?: string): Promise<MediaDetails> {
  // If media type is provided, use it directly
  if (mediaType && ['movie', 'tv'].includes(mediaType)) {
    return fetchFromTMDB<MediaDetails>(
      `/${mediaType}/${id}?api_key=${API_KEY}&language=fr-FR`
    );
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

// Search for movies, TV shows, and people
export async function searchMulti(query: string) {
  const data = await fetchFromTMDB<TMDBResponse>(
    `/search/multi?api_key=${API_KEY}&language=fr-FR&query=${encodeURIComponent(query)}`
  );
  return data.results;
}
