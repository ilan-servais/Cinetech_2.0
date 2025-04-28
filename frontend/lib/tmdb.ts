import { MediaItem, TMDBResponse, MediaDetails } from '../types/tmdb';

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

export async function getMediaDetails(id: string): Promise<MediaDetails> {
  // Pour l'instant, on fait appel à l'endpoint movie
  // Plus tard, on pourra améliorer pour auto-détecter si c'est un film ou une série
  const data = await fetchFromTMDB<MediaDetails>(
    `/movie/${id}?api_key=${API_KEY}&language=fr-FR`
  );
  return data;
}
