// Common interface properties for both movies and TV shows
interface MediaBase {
  id: number;
  backdrop_path: string | null;
  genre_ids: number[];
  overview: string;
  popularity?: number;
  poster_path: string | null;
  vote_average: number;
  vote_count?: number;
}

// Media type definition
export type MediaType = 'movie' | 'tv';

// Movie specific interface
export interface Movie extends MediaBase {
  title: string;
  original_title?: string;
  release_date: string;
  adult?: boolean;
  video?: boolean;
  media_type?: 'movie';
}

// TV Show specific interface
export interface TVShow extends MediaBase {
  name: string;
  original_name?: string;
  first_air_date: string;
  origin_country?: string[];
  media_type?: 'tv';
}

// Combined type for handling both movies and TV shows
export type MediaItem = Movie | TVShow;

// Helper to determine if a media item is a movie
export function isMovie(media: MediaItem): media is Movie {
  return media.media_type === 'movie';
}

// Helper to determine if a media item is a TV show
export function isTVShow(media: MediaItem): media is TVShow {
  return media.media_type === 'tv';
}

// Response type for API calls
export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_results: number;
  total_pages: number;
}

// Genre type
export interface Genre {
  id: number;
  name: string;
}

// Cast member type
export interface CastMember {
  adult?: boolean;
  gender?: number;
  id: number;
  known_for_department?: string;
  name: string;
  original_name?: string;
  popularity?: number;
  profile_path: string | null;
  cast_id?: number;
  character: string;
  credit_id: string;
  order: number;
}

// Crew member type
export interface CrewMember {
  adult?: boolean;
  gender?: number;
  id: number;
  known_for_department?: string;
  name: string;
  original_name?: string;
  popularity?: number;
  profile_path: string | null;
  credit_id: string;
  department: string;
  job: string;
}

// Credits response
export interface Credits {
  id: number;
  cast: CastMember[];
  crew: CrewMember[];
}
