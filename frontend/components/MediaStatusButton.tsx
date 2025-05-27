"use client";

import React, { useState, useEffect } from 'react';
import { toggleUserStatus, removeUserStatus, StatusType, getMediaStatus } from '@/lib/userStatusService';
import { useAuth } from '@/contexts/AuthContext';
import { MediaDetails } from '@/types/tmdb';

interface MediaStatusButtonProps {
  media: MediaDetails;
  statusType: StatusType;
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
  activeIcon?: React.ReactNode;
  inactiveIcon?: React.ReactNode;
  activeLabel: string;
  inactiveLabel: string;
}

const MediaStatusButton: React.FC<MediaStatusButtonProps> = ({
  media,
  statusType,
  className = '',
  activeClassName = '',
  inactiveClassName = '',
  activeIcon,
  inactiveIcon,
  activeLabel,
  inactiveLabel
}) => {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const mediaType = media.media_type || (media.first_air_date ? 'tv' : 'movie');

  const getStatusKey = (type: StatusType): 'favorite' | 'watched' | 'watchLater' => {
    switch(type) {
      case 'FAVORITE': return 'favorite';
      case 'WATCHED': return 'watched';
      case 'WATCH_LATER': return 'watchLater';
    }
  };

  useEffect(() => {
    const checkStatus = async () => {
      try {
        if (user?.id) {
          const status = await getMediaStatus(media.id, mediaType);
          const statusKey = getStatusKey(statusType);
          setIsActive(status[statusKey]);
        }
      } catch (error) {
        console.error(`Error checking ${statusType} status:`, error);
      }
    };

    checkStatus();

    const statusEventMap = {
      'FAVORITE': 'favorites-updated',
      'WATCHED': 'watched-updated',
      'WATCH_LATER': 'watch-later-updated'
    };

    const eventType = statusEventMap[statusType];
    const handleStatusUpdate = checkStatus;

    window.addEventListener(eventType, handleStatusUpdate);
    return () => {
      window.removeEventListener(eventType, handleStatusUpdate);
    };
  }, [media.id, mediaType, statusType, user?.id]);

  const handleToggleStatus = async () => {
    if (!user?.id) {
      console.log('User not authenticated, redirect to login');
      return;
    }

    setIsLoading(true);
    try {
      await toggleUserStatus(
        media.id,
        mediaType,
        statusType,
        media.title || media.name,
        media.poster_path
      );

      // 🔁 Forcer la récupération de l'état après le toggle
      const updatedStatus = await getMediaStatus(media.id, mediaType);
      const statusKey = getStatusKey(statusType);
      setIsActive(updatedStatus[statusKey]);

    } catch (error) {
      console.error(`Error toggling ${statusType}:`, error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleRemoveStatus = async () => {
    if (!user?.id) {
      console.log('User not authenticated, redirect to login');
      return;
    }

    setIsLoading(true);
    try {
      await removeUserStatus(media.id, mediaType, statusType);

      // 🔁 Forcer la récupération de l'état après la suppression
      const updatedStatus = await getMediaStatus(media.id, mediaType);
      const statusKey = getStatusKey(statusType);
      setIsActive(updatedStatus[statusKey]);

    } catch (error) {
      console.error(`Error removing ${statusType}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={isActive ? handleRemoveStatus : handleToggleStatus}
      disabled={isLoading}
      className={`
        ${className}
        ${isActive ? activeClassName : inactiveClassName}
        ${isLoading ? 'opacity-70 cursor-wait' : ''}
        transition-all duration-200 ease-in-out
      `}
      aria-label={isActive ? activeLabel : inactiveLabel}
    >
      <span className="flex items-center justify-center space-x-2">
        <span>{isActive ? activeIcon : inactiveIcon}</span>
        <span>{isActive ? activeLabel : inactiveLabel}</span>
      </span>
    </button>
  );
};

export default MediaStatusButton;
