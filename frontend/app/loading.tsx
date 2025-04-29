import React from 'react';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center">
        <div className="h-16 w-16 border-t-4 border-b-4 border-accent rounded-full animate-spin"></div>
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Chargement en cours...</p>
      </div>
    </div>
  );
}
