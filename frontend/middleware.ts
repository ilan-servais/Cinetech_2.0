import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Définir les routes protégées qui nécessitent une authentification
const protectedRoutes = [
  '/favorites',
  '/profile',
  '/watchlist',
];

export function middleware(request: NextRequest) {
  // Vérifier si l'utilisateur a un token d'authentification dans les cookies
  const hasAuthToken = request.cookies.has('auth_token');
  
  // Vérifier si la route actuelle est protégée
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );
  
  // Si c'est une route protégée et que l'utilisateur n'est pas authentifié,
  // rediriger vers la page de connexion
  if (isProtectedRoute && !hasAuthToken) {
    // Construire l'URL de redirection avec l'URL d'origine comme paramètre de redirection
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    
    return NextResponse.redirect(redirectUrl);
  }
  
  // Sinon, continuer normalement
  return NextResponse.next();
}

// Configurer sur quelles routes le middleware doit s'exécuter
export const config = {
  matcher: ['/favorites', '/profile', '/watchlist'],
};
