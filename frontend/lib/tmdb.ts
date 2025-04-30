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
