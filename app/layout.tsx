import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Fix the font loading by adding the weight property
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '700']
});

export const metadata: Metadata = {
  title: 'Cinetech 2.0',
  description: 'Explorez des films et séries TV avec Cinetech',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <Navbar />
            <main>{children}</main>
            <footer className="bg-gray-800 text-white text-center py-6 mt-12">
              <p>© {new Date().getFullYear()} Cinetech 2.0</p>
            </footer>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}