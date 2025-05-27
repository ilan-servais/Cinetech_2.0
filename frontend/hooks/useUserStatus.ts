"use client";

import { useState, useEffect } from 'react';
import { useHasMounted } from '@/lib/clientUtils';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface UserStatusProps {
  mediaId: number;
  mediaType: string;
}

export function useUserStatus({ mediaId, mediaType }: UserStatusProps) {
  const [status, setStatus] = useState({
    favorite: false,
    watched: false,
    watchLater: false,
    loading: true
  });
  const hasMounted = useHasMounted();
  const { isAuthenticated } = useAuth();

  const fetchStatus = async () => {
    if (!isAuthenticated) {
      setStatus({ favorite: false, watched: false, watchLater: false, loading: false });
      return;
    }

    setStatus(prev => ({ ...prev, loading: true }));

    try {
      const response = await fetch(`${API_BASE_URL}/api/user/status/${mediaType}/${mediaId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStatus({
          favorite: data.favorite || false,
          watched: data.watched || false,
          watchLater: data.watchLater || false,
          loading: false
        });
      } else {
        setStatus({ favorite: false, watched: false, watchLater: false, loading: false });
      }
    } catch (error) {
      console.error('Error fetching user status:', error);
      setStatus({ favorite: false, watched: false, watchLater: false, loading: false });
    }
  };

  useEffect(() => {
    if (hasMounted && mediaId && mediaType) {
      fetchStatus();
      
      const handleStatusUpdated = () => {
        fetchStatus();
      };
      
      window.addEventListener('favorites-updated', handleStatusUpdated);
      window.addEventListener('watched-updated', handleStatusUpdated);
      window.addEventListener('watch-later-updated', handleStatusUpdated);
      
      return () => {
        window.removeEventListener('favorites-updated', handleStatusUpdated);
        window.removeEventListener('watched-updated', handleStatusUpdated);
        window.removeEventListener('watch-later-updated', handleStatusUpdated);
      };
    }
  }, [mediaId, mediaType, hasMounted, isAuthenticated]);

  return status;
}
