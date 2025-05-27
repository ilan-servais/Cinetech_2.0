"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MediaDetails } from '@/types/tmdb';
import MediaStatusButton from './MediaStatusButton';
import { getMediaStatus } from '@/lib/userStatusService';
import { FaHeart, FaRegHeart, FaEye, FaRegEye, FaBookmark, FaRegBookmark } from 'react-icons/fa';

interface MediaStatusButtonsProps {
  media: MediaDetails;
  showLabels?: boolean;
  className?: string;
  vertical?: boolean;
}

const MediaStatusButtons: React.FC<MediaStatusButtonsProps> = ({
  media,
  showLabels = true,
  className = '',
  vertical = false
}) => {
  const { user, isAuthenticated } = useAuth();
  const [status, setStatus] = useState({
    favorite: false,
    watched: false,
    watchLater: false
  });
  const mediaType = media.media_type || (media.first_air_date ? 'tv' : 'movie');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        if (!user?.id) return;
        
        const mediaStatus = await getMediaStatus(media.id, mediaType);
        console.log('Media status result:', mediaStatus);
        setStatus(mediaStatus);
      } catch (error) {
        console.error('Error fetching media status:', error);
      }
    };

    fetchStatus();
    
    // Listen for status updates
    const handleStatusUpdate = fetchStatus;
    window.addEventListener('favorites-updated', handleStatusUpdate);
    window.addEventListener('watched-updated', handleStatusUpdate);
    window.addEventListener('watch-later-updated', handleStatusUpdate);
    
    return () => {
      window.removeEventListener('favorites-updated', handleStatusUpdate);
      window.removeEventListener('watched-updated', handleStatusUpdate);
      window.removeEventListener('watch-later-updated', handleStatusUpdate);
    };
  }, [media.id, mediaType, user?.id]);

  // Base styling for all buttons
  const baseButtonClass = `
    px-3 py-2 font-medium rounded-md
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent
  `;

  // Active/inactive classes
  const activeClass = "bg-primary text-white hover:bg-primary-dark";
  const inactiveClass = "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600";

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={`flex ${vertical ? 'flex-col space-y-2' : 'space-x-2'} ${className}`}>
      <MediaStatusButton
        media={media}
        statusType="FAVORITE"
        className={baseButtonClass}
        activeClassName={activeClass}
        inactiveClassName={inactiveClass}
        activeIcon={<FaHeart className="text-red-500" />}
        inactiveIcon={<FaRegHeart />}
        activeLabel={showLabels ? "Retiré des favoris" : ""}
        inactiveLabel={showLabels ? "Ajouter aux favoris" : ""}
      />
      
      <MediaStatusButton
        media={media}
        statusType="WATCHED"
        className={baseButtonClass}
        activeClassName={activeClass}
        inactiveClassName={inactiveClass}
        activeIcon={<FaEye className="text-green-500" />}
        inactiveIcon={<FaRegEye />}
        activeLabel={showLabels ? "Marquer comme non vu" : ""}
        inactiveLabel={showLabels ? "Marquer comme vu" : ""}
      />
      
      <MediaStatusButton
        media={media}
        statusType="WATCH_LATER"
        className={baseButtonClass}
        activeClassName={activeClass}
        inactiveClassName={inactiveClass}
        activeIcon={<FaBookmark className="text-yellow-500" />}
        inactiveIcon={<FaRegBookmark />}
        activeLabel={showLabels ? "Retirer de 'À voir'" : ""}
        inactiveLabel={showLabels ? "Ajouter à 'À voir'" : ""}
      />
    </div>
  );
};

export default MediaStatusButtons;
