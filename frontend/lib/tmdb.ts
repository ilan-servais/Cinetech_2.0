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

// Suppression de la redéclaration d'interface qui crée un conflit
// avec l'importation depuis types/tmdb.ts

// Nouvelle fonction pour récupérer les détails d'un média (film ou série)
export async function getMediaDetails(id: number): Promise<MediaDetails> {
  // D'abord on essaie de récupérer en tant que film
  try {
    const movieData = await fetchFromTMDB<MediaDetails>(
      `/movie/${id}?api_key=${API_KEY}&language=fr-FR`
    );
    return movieData;
  } catch (error) {
    // Si ce n'est pas un film, on essaie en tant que série
    try {
      const tvData = await fetchFromTMDB<MediaDetails>(
        `/tv/${id}?api_key=${API_KEY}&language=fr-FR`
      );
      return tvData;
    } catch (tvError) {
      throw new Error(`Média non trouvé avec l'ID: ${id}`);
    }
  }
}
