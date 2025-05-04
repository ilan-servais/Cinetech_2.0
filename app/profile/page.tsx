'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaUserCircle } from 'react-icons/fa';

export default function ProfilePage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  useEffect(() => {
    // Redirect if not authenticated and finished loading
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }

    // Set user avatar or default
    if (user) {
      // Use optional chaining to safely access avatar property
      setUserAvatar(user?.avatar || null);
    }
  }, [isAuthenticated, loading, router, user]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show profile if authenticated
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
          <div className="flex flex-col items-center">
            <div className="mb-6">
              {userAvatar ? (
                <Image
                  src={userAvatar}
                  alt={user.username || 'User'}
                  width={128}
                  height={128}
                  className="rounded-full"
                />
              ) : (
                <FaUserCircle className="h-32 w-32 text-gray-400" />
              )}
            </div>

            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {user.username || 'Utilisateur'}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {user.email}
              </p>
            </div>

            <div className="mt-8 w-full">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Informations
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Email
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {user.email}
                  </p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Nom d'utilisateur
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {user.username || 'Non défini'}
                  </p>
                </div>
                {/* Add more user information fields as needed */}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // This should not happen due to the redirect, but as a fallback
  return null;
}
