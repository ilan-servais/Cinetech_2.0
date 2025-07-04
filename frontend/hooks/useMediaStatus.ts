"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { getMediaStatus } from '@/lib/userStatusService';
import { useAuth } from '@/contexts/AuthContext';

interface MediaStatusState {
  favorite: boolean;
  watched: boolean;
  watchLater: boolean;
}

interface UseMediaStatusReturn {
  status: MediaStatusState;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// 🎯 CACHE GLOBAL pour éviter les appels multiples
const statusCache = new Map<string, {
  data: MediaStatusState;
  timestamp: number;
  promise?: Promise<MediaStatusState>;
}>();

const CACHE_DURATION = 30000; // 30 secondes

/**
 * 🎯 HOOK OPTIMISÉ POUR LE STATUT D'UN MÉDIA
 * 
 * Évite les appels multiples pour le même média :
 * - Cache les résultats pendant 30 secondes
 * - Partage les promesses en cours entre composants
 * - Gère automatiquement l'invalidation du cache
 * 
 * Usage :
 * const { status, loading, error, refresh } = useMediaStatus(mediaId, mediaType);
 */
export function useMediaStatus(
  mediaId: number | null, 
  mediaType: string | null
): UseMediaStatusReturn {
  const { isAuthenticated, initialized } = useAuth();
  const [status, setStatus] = useState<MediaStatusState>({
    favorite: false,
    watched: false,
    watchLater: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref pour éviter les requêtes multiples simultanées
  const currentRequestRef = useRef<Promise<void> | null>(null);

  // Clé unique pour le cache
  const cacheKey = mediaId && mediaType ? `${mediaType}-${mediaId}` : null;

  // 🔍 FONCTION DE RÉCUPÉRATION AVEC CACHE
  const fetchStatus = useCallback(async (): Promise<MediaStatusState> => {
    if (!mediaId || !mediaType || !isAuthenticated) {
      return { favorite: false, watched: false, watchLater: false };
    }

    const now = Date.now();
    const cached = statusCache.get(cacheKey!);

    // Retourner le cache s'il est encore valide
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🎯 [useMediaStatus] Using cached data for ${cacheKey}`);
      }
      return cached.data;
    }

    // Si une promesse est déjà en cours, l'attendre
    if (cached?.promise) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`⏳ [useMediaStatus] Waiting for existing request for ${cacheKey}`);
      }
      return await cached.promise;
    }

    // Nouvelle requête
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔍 [useMediaStatus] Fetching status for ${cacheKey}`);
    }

    const promise = getMediaStatus(mediaId, mediaType);
    
    // Stocker la promesse dans le cache pour éviter les doublons
    statusCache.set(cacheKey!, {
      data: { favorite: false, watched: false, watchLater: false },
      timestamp: 0,
      promise
    });

    try {
      const result = await promise;
      
      // Mettre à jour le cache avec le résultat
      statusCache.set(cacheKey!, {
        data: result,
        timestamp: now,
        promise: undefined
      });

      return result;
    } catch (err) {
      // Supprimer du cache en cas d'erreur
      statusCache.delete(cacheKey!);
      throw err;
    }
  }, [mediaId, mediaType, isAuthenticated, cacheKey]);

  // 🔄 FONCTION DE REFRESH
  const refresh = useCallback(async () => {
    if (!cacheKey || !isAuthenticated || !initialized) return;

    // Éviter les requêtes multiples simultanées
    if (currentRequestRef.current) {
      await currentRequestRef.current;
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Invalider le cache
      statusCache.delete(cacheKey);
      
      const requestPromise = fetchStatus().then(result => {
        setStatus(result);
      });

      currentRequestRef.current = requestPromise;
      await requestPromise;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement du statut';
      setError(errorMessage);
      console.error(`[useMediaStatus] Error fetching status for ${cacheKey}:`, err);
    } finally {
      setLoading(false);
      currentRequestRef.current = null;
    }
  }, [cacheKey, isAuthenticated, initialized, fetchStatus]);

  // 📡 EFFET PRINCIPAL - Chargement automatique
  useEffect(() => {
    if (!isAuthenticated || !initialized || !mediaId || !mediaType) {
      setStatus({ favorite: false, watched: false, watchLater: false });
      setLoading(false);
      setError(null);
      return;
    }

    refresh();
  }, [refresh, isAuthenticated, initialized, mediaId, mediaType]);

  // 🎧 ÉCOUTE DES ÉVÉNEMENTS DE MISE À JOUR
  useEffect(() => {
    if (!cacheKey) return;

    const handleStatusUpdate = () => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🔔 [useMediaStatus] Status updated event received for ${cacheKey}`);
      }
      refresh();
    };

    // Écouter les événements de mise à jour
    window.addEventListener('favorites-updated', handleStatusUpdate);
    window.addEventListener('watched-updated', handleStatusUpdate);
    window.addEventListener('watch-later-updated', handleStatusUpdate);

    return () => {
      window.removeEventListener('favorites-updated', handleStatusUpdate);
      window.removeEventListener('watched-updated', handleStatusUpdate);
      window.removeEventListener('watch-later-updated', handleStatusUpdate);
    };
  }, [cacheKey, refresh]);

  return {
    status,
    loading,
    error,
    refresh
  };
}

/**
 * 🧹 FONCTION UTILITAIRE POUR VIDER LE CACHE
 * Utile lors de la déconnexion ou pour forcer un refresh global
 */
export function clearMediaStatusCache(): void {
  statusCache.clear();
  if (process.env.NODE_ENV !== 'production') {
    console.log('🧹 [useMediaStatus] Cache cleared');
  }
}

/**
 * 🎯 HOOK POUR PRÉCHARGER LE STATUT DE PLUSIEURS MÉDIAS
 * Utile pour les listes de médias (pages favorites, trending, etc.)
 */
export function useBulkMediaStatus(
  items: Array<{ id: number; media_type: string }>,
  enabled: boolean = true
): void {
  const { isAuthenticated, initialized } = useAuth();

  useEffect(() => {
    if (!enabled || !isAuthenticated || !initialized || !items.length) return;

    // Précharger en arrière-plan sans bloquer le UI
    const preloadStatuses = async () => {
      const promises = items
        .filter(item => item.id && item.media_type)
        .map(item => {
          const cacheKey = `${item.media_type}-${item.id}`;
          const cached = statusCache.get(cacheKey);
          const now = Date.now();

          // Skip si déjà en cache et valide
          if (cached && (now - cached.timestamp) < CACHE_DURATION) {
            return Promise.resolve();
          }

          // Précharger uniquement si pas déjà en cours
          if (!cached?.promise) {
            return getMediaStatus(item.id, item.media_type)
              .then(result => {
                statusCache.set(cacheKey, {
                  data: result,
                  timestamp: now,
                  promise: undefined
                });
              })
              .catch(err => {
                console.warn(`[useBulkMediaStatus] Failed to preload ${cacheKey}:`, err);
              });
          }

          return Promise.resolve();
        });

      await Promise.allSettled(promises);
    };

    // Délai pour éviter de surcharger le serveur
    const timeoutId = setTimeout(preloadStatuses, 100);
    return () => clearTimeout(timeoutId);
  }, [items, enabled, isAuthenticated, initialized]);
}
