"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/Tabs";
import { Heart, CheckCircle, Clock } from "lucide-react";
import MediaCard from './MediaCard';
import { Favorite, WatchedItem, WatchLaterItem } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// Extend the types to include media information
interface ExtendedFavorite extends Favorite {
  media: {
    tmdbId: number;
    title: string;
    posterPath: string | null;
    type: string;
  };
}

interface ExtendedWatchedItem extends WatchedItem {
  media: {
    tmdbId: number;
    title: string;
    posterPath: string | null;
    type: string;
  };
}

interface ExtendedWatchLaterItem extends WatchLaterItem {
  media: {
    tmdbId: number;
    title: string;
    posterPath: string | null;
    type: string;
  };
}

interface FriendMediaListsProps {
  friendId: number;
  friendName: string;
}

const FriendMediaLists: React.FC<FriendMediaListsProps> = ({ friendId, friendName }) => {
  const [favorites, setFavorites] = useState<ExtendedFavorite[]>([]);
  const [watched, setWatched] = useState<ExtendedWatchedItem[]>([]);
  const [watchLater, setWatchLater] = useState<ExtendedWatchLaterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    async function fetchFriendLists() {
      if (!friendId) return;
      
      try {
        setLoading(true);
        
        // Fetch favorites
        const favoritesData = await prisma.favorite.findMany({
          where: { userId: friendId },
          include: { media: true },
          orderBy: { createdAt: 'desc' },
        });
        setFavorites(favoritesData as ExtendedFavorite[]);
        
        // Fetch watched items
        const watchedData = await prisma.watchedItem.findMany({
          where: { userId: friendId },
          include: { media: true },
          orderBy: { watchedAt: 'desc' },
        });
        setWatched(watchedData as ExtendedWatchedItem[]);
        
        // Fetch watch later items
        const watchLaterData = await prisma.watchLaterItem.findMany({
          where: { userId: friendId },
          include: { media: true },
          orderBy: { addedAt: 'desc' },
        });
        setWatchLater(watchLaterData as ExtendedWatchLaterItem[]);
        
      } catch (err) {
        console.error("Erreur lors du chargement des listes:", err);
        setError("Une erreur est survenue lors du chargement des médias");
      } finally {
        setLoading(false);
      }
    }
    
    fetchFriendLists();
  }, [friendId]);

  if (loading) {
    return <div className="p-8 text-center">Chargement des listes...</div>;
  }
  
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6">Listes de {friendName}</h2>
      
      <Tabs defaultValue="favorites">
        <TabsList className="mb-6">
          <TabsTrigger value="favorites" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span>Favoris ({favorites.length})</span>
          </TabsTrigger>
          <TabsTrigger value="watched" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span>Vus ({watched.length})</span>
          </TabsTrigger>
          <TabsTrigger value="watchLater" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>À voir ({watchLater.length})</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="favorites">
          {favorites.length === 0 ? (
            <p className="text-center py-8 text-gray-500">Aucun favori trouvé</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {favorites.map((item) => (
                <MediaCard
                  key={`fav-${item.id}`}
                  id={item.media.tmdbId}
                  title={item.media.title}
                  posterPath={item.media.posterPath}
                  mediaType={item.media.type}
                  showControls={false}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="watched">
          {watched.length === 0 ? (
            <p className="text-center py-8 text-gray-500">Aucun média vu trouvé</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {watched.map((item) => (
                <MediaCard
                  key={`watched-${item.id}`}
                  id={item.media.tmdbId}
                  title={item.media.title}
                  posterPath={item.media.posterPath}
                  mediaType={item.media.type}
                  showControls={false}
                  statusIndicator="watched"
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="watchLater">
          {watchLater.length === 0 ? (
            <p className="text-center py-8 text-gray-500">Aucun média à voir trouvé</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {watchLater.map((item) => (
                <MediaCard
                  key={`watchlater-${item.id}`}
                  id={item.media.tmdbId}
                  title={item.media.title}
                  posterPath={item.media.posterPath}
                  mediaType={item.media.type}
                  showControls={false}
                  statusIndicator="watchLater"
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FriendMediaLists;
