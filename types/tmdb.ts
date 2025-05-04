export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  media_type?: string;
  backdrop_path?: string | null;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  genre_ids?: number[];
  original_language?: string;
}

export interface TMDBResponse<T = MediaItem> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface MediaDetails {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  genres: Array<{
    id: number;
    name: string;
  }>;
  runtime?: number;
  episode_run_time?: number[];
  status: string;
  tagline?: string;
  budget?: number;
  revenue?: number;
  homepage?: string;
  media_type?: string;
  production_companies?: Array<{
    id: number;
    name: string;
    logo_path: string | null;
  }>;
  spoken_languages?: Array<{
    english_name: string;
    name: string;
  }>;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface CastResponse {
  id: number;
  cast: CastMember[];
  crew: CrewMember[];
}

export interface Provider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}
