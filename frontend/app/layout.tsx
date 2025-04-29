import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Cinetech 2.0 - Films et Séries',
  description: 'Découvrez les derniers films et séries populaires, consultez les tendances et créez votre liste de favoris sur Cinetech 2.0',
  keywords: 'films, séries, cinéma, TMDB, streaming, acteurs',
  authors: [{ name: 'Cinetech Team' }],
  openGraph: {
    title: 'Cinetech 2.0 - Films et Séries',
    description: 'Découvrez les derniers films et séries populaires, consultez les tendances et créez votre liste de favoris',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Cinetech 2.0',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        {/* Navbar with consistent styling */}
        <Navbar />
        
        {/* Main content area that will grow to fill available space */}
        <main className="flex-grow">
          {children}
        </main>
        
        {/* Footer with consistent styling */}
        <footer className="bg-primary text-textLight py-6">
          <div className="container-default">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm mb-4 md:mb-0">
                © {new Date().getFullYear()} Cinetech 2.0. Tous droits réservés.
              </p>
              <p className="text-sm">
                Propulsé par <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">TMDB</a>
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
