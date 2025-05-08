'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ThemeProvider } from 'next-themes';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/lib/authContext';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMediaPage = pathname?.startsWith('/media');
    return (
    <div className={`antialiased min-h-screen ${isMediaPage ? 'light-layout bg-[#E3F3FF]' : 'bg-background dark:bg-backgroundDark dark:text-textLight'} flex flex-col`}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <Navbar />
          <main className={`flex-grow ${isMediaPage ? 'media-detail-page' : ''}`}>
            {children}
          </main>
          <Footer className={isMediaPage ? 'media-footer' : ''} />
        </AuthProvider>
      </ThemeProvider>
    </div>
  );
}
