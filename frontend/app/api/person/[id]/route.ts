import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const API_URL = process.env.NEXT_PUBLIC_TMDB_API_URL || 'https://api.themoviedb.org/3';

export async function GET(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    const response = await fetch(
      `${API_URL}/person/${id}?api_key=${API_KEY}&language=fr-FR`, 
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `Erreur: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching person data:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
