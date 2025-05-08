import '../styles/globals.css';
import { Lato } from 'next/font/google';
import { Metadata } from 'next';
import ClientLayout from '@/app/client-layout';

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-lato',
  display: 'swap',
});

// Metadata can now be exported since this is a server component
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
    <html lang="fr" className={`${lato.variable} font-lato`} suppressHydrationWarning>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}