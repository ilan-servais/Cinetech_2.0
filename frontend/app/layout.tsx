import '../styles/globals.css';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Cinetech 2.0 - Films et Séries',
  description: 'Découvrez les derniers films et séries',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen flex flex-col bg-background text-primary`}>
        <Navbar />
        
        <main className="flex-grow bg-background">
          {children}
        </main>
        
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
