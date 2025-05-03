import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/auth';
import { sign } from 'jsonwebtoken';
import { prisma, User } from '@/lib/prisma';

/**
 * TMDB API client for fetching movie and TV show data
 */
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p';

interface TMDBOptions {
  method?: string;
  headers?: Record<string, string>;
  cache?: RequestCache;
  next?: { revalidate?: number };
}

/**
 * Creates common options for TMDB API requests
 */
function getOptions(cache: RequestCache = 'force-cache'): TMDBOptions {
  return {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${TMDB_API_KEY}`
    },
    cache,
    next: { revalidate: 3600 } // Revalidate once per hour
  };
}

/**
 * Fetches data from TMDB API
 */
async function fetchFromTMDB(endpoint: string, cache: RequestCache = 'force-cache') {
  try {
    const url = `${BASE_URL}${endpoint}`;
    const options = getOptions(cache);
    
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error(`Error fetching from TMDB (${endpoint}):`, error);
    throw error;
  }
}

/**
 * Gets trending movies from TMDB
 */
export async function getTrendingMovies(page: number = 1) {
  return fetchFromTMDB(`/trending/movie/day?language=fr-FR&page=${page}`, 'no-store');
}

/**
 * Gets trending TV shows from TMDB
 */
export async function getTrendingTVShows(page: number = 1) {
  return fetchFromTMDB(`/trending/tv/day?language=fr-FR&page=${page}`, 'no-store');
}

/**
 * Gets details for a specific movie
 */
export async function getMovieDetails(id: number) {
  return fetchFromTMDB(`/movie/${id}?language=fr-FR&append_to_response=credits,recommendations,videos`);
}

/**
 * Gets details for a specific TV show
 */
export async function getTVDetails(id: number) {
  return fetchFromTMDB(`/tv/${id}?language=fr-FR&append_to_response=credits,recommendations,videos`);
}

/**
 * Searches for movies, TV shows, or people
 */
export async function searchMedia(query: string, page: number = 1, type: string = 'multi') {
  return fetchFromTMDB(`/search/${type}?language=fr-FR&query=${encodeURIComponent(query)}&page=${page}`, 'no-store');
}

/**
 * Get image URL from TMDB
 */
export function getImageUrl(path: string | null, size: string = 'original'): string {
  if (!path) return '/placeholder-image.jpg';
  return `${IMG_BASE_URL}/${size}${path}`;
}

/**
 * Handles user login by verifying credentials and returning a JWT token.
 * @param req - The request object containing user credentials.
 * @returns A JSON response with the JWT token and user information, or an error message.
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Validate request body
    if (!email || !password) {
      return NextResponse.json({ 
        error: 'Email et mot de passe requis' 
      }, { status: 400 });
    }

    // Find user with explicit type casting to handle additional fields
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        username: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        is_verified: true,
        hashed_password: true
      }
    }) as User | null;

    // Check if user exists
    if (!user) {
      return NextResponse.json({ 
        error: 'Identifiants invalides.' 
      }, { status: 401 });
    }

    // Check if user is verified
    if (!user.is_verified) {
      return NextResponse.json({ 
        error: 'Veuillez vérifier votre adresse email avant de vous connecter.' 
      }, { status: 403 });
    }

    // Verify password using the hashed_password field
    const passwordField = user.hashed_password || user.password;
    const passwordValid = await verifyPassword(password, passwordField);
    if (!passwordValid) {
      return NextResponse.json({ 
        error: 'Identifiants invalides.' 
      }, { status: 401 });
    }

    // Create JWT token with user id and email
    const token = sign(
      { 
        userId: user.id,
        email: user.email
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Return token and user info
    return NextResponse.json({
      token,
      user: {
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ 
      error: 'Une erreur s\'est produite lors de la connexion' 
    }, { status: 500 });
  }
}

// TMDB API service

export async function getUserMoviePreferences(user: User) {
  // Maintenant vous pouvez accéder à user.is_verified sans erreur TypeScript
  if (user.is_verified) {
    // ...code to get preferences...
  }
  // ...existing code...
}