import '../styles/globals.css';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Cinetech 2.0 - Films et Séries',
  description: 'Découvrez les derniers films et séries',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.themoviedb.org" />
        <link rel="preconnect" href="https://image.tmdb.org" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.themoviedb.org" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
      </head>
      <body className={`${inter.className} antialiased bg-background dark:bg-backgroundDark text-textDark dark:text-textLight`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Navbar />
          
          <main className="min-h-screen bg-background dark:bg-backgroundDark">
            {children}
          </main>
          
          <footer className="bg-primary text-textLight py-6 dark:bg-dark-navbar">
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
        </ThemeProvider>
      </body>
    </html>
  );
}
