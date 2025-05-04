// Type definitions for index.ts
import type { MediaItem as TMDBMediaItem } from './tmdb';

// Common interface properties for both movies and TV shows
interface MediaBase extends TMDBMediaItem {
  genre_ids: number[];
  overview: string;
  popularity?: number;
  vote_average: number;
  vote_count?: number;
  original_language?: string;
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

// Re-export TMDB types to fix import issues
export type { MediaDetails, CastResponse, CastMember, CrewMember, MediaItem } from './tmdb';

// User type from Prisma (with all fields properly typed)
export interface User {
  id: number;
  email: string;
  username: string | null;
  hashed_password: string;
  is_verified: boolean;
  verification_token: string | null;
  token_expiration: Date | null;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Credits type for media
export interface Credits {
  id: number;
  cast: CastMember[];
  crew: CrewMember[];
}
