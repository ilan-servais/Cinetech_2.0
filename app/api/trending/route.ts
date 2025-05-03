import { NextRequest, NextResponse } from 'next/server';
import { getTrendingMovies } from '@/lib/tmdb';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = url.searchParams.get('page') || '1';
    
    const trendingData = await getTrendingMovies(parseInt(page, 10));
    
    return NextResponse.json(trendingData);
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    return NextResponse.json({ 
      error: 'Une erreur s\'est produite lors de la récupération des films tendances' 
    }, { status: 500 });
  }
}
