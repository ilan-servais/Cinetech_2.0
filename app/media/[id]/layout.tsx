import React from 'react';
import { Metadata } from 'next';

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
    <div className="bg-[#E3F3FF]">
      {children}
    </div>
  );
}
