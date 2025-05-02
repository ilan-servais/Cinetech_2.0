import React from 'react';
import { Metadata } from 'next';
import '@/styles/media-detail.css'; // Import du fichier CSS

export const metadata: Metadata = {
  title: 'Détails du média | Ciné Tech 2.0',
  description: 'Découvrez les détails de ce film ou cette série',
};

export default function MediaDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Override le mode sombre avec un fond fixe #E3F3FF
    <div className="media-detail-layout bg-[#E3F3FF] dark:bg-[#E3F3FF]">
      {/* Force le contenu à prendre tout l'espace disponible */}
      <main className="min-h-screen flex flex-col bg-[#E3F3FF] dark:bg-[#E3F3FF] text-[#0D253F] dark:text-[#0D253F]">
        {/* Container du contenu sans marge superflue */}
        <div className="flex-grow">{children}</div>
      </main>
    </div>
  );
}
