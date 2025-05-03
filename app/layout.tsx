import './globals.css';
import { Inter, Lato } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/lib/authContext';

const inter = Inter({ subsets: ['latin'] });
const lato = Lato({ subsets: ['latin'] });

export const metadata = {
  title: 'Cinetech 2.0',
  description: 'Découvrez, notez et commentez vos films et séries préférés. Rejoignez la communauté Cinetech dès maintenant !',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main className={`min-h-screen ${lato.className}`}>
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}