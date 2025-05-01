"use client";

import React, { useEffect, useState } from 'react';

// Définition de l'interface pour les studios
interface Studio {
  id: number;
  name: string;
  logo?: string | null;
  origin_country?: string | null;
}

export default function MediaByTypeAndId({ params }: { params: { type: string; id: string } }) {
  const { type, id } = params;

  // Exemple de données de studios
  const studios: Studio[] = [
    { id: 1, name: "Studio Example 1", logo: "/logo1.png", origin_country: "US" },
    { id: 2, name: "Studio Example 2", logo: "/logo2.png", origin_country: "FR" },
    { id: 3, name: "Studio Example 3", logo: null, origin_country: "JP" }
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        {type.charAt(0).toUpperCase() + type.slice(1)} ID: {id}
      </h1>
      
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Studios</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {studios.map((studio: Studio) => (
            <div 
              key={studio.id} 
              className="rounded-md p-4 shadow-md bg-white"
            >
              {studio.logo && (
                <img 
                  src={studio.logo.startsWith('/') ? studio.logo : `https://image.tmdb.org/t/p/w500${studio.logo}`} 
                  alt={studio.name} 
                  className="h-16 object-contain mb-2"
                />
              )}
              <h4 className="font-medium">{studio.name}</h4>
              {studio.origin_country && (
                <p className="text-sm">{studio.origin_country}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
