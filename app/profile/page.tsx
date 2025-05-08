"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { FaUser, FaEnvelope, FaIdCard, FaSignOutAlt } from "react-icons/fa";

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  useEffect(() => {
    // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
    if (!loading && !user) {
      router.push("/login?redirect=/profile");
      return;
    }
    
    if (user) {
      // Si on a déjà des données utilisateur dans le contexte, on les utilise d'abord
      setUserData(user);
      
      // Ensuite, on fait un appel API pour obtenir les données complètes et à jour
      const fetchUserProfile = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/me`, {
            credentials: 'include'
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.user) {
              setUserData(data.user);
            }
          } else {
            // Si l'API retourne une erreur d'authentification, rediriger vers login
            if (response.status === 401) {
              router.push("/login?redirect=/profile");
            }
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du profil:', error);
        }
      };
      
      fetchUserProfile();
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-10 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="flex items-center space-x-6 mb-8">
        <div className="bg-gradient-to-r from-primary to-accent text-white h-20 w-20 rounded-full flex items-center justify-center text-3xl">
          <FaUser />
        </div>
        <div>
          <h1 className="text-2xl font-bold dark:text-white">
            {user.firstName || user.username || user.email.split('@')[0]}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {user.is_verified ? 'Compte vérifié ✓' : 'Compte en attente de vérification'}
          </p>
        </div>
      </div>
      
      <div className="space-y-4 mb-8">
        <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <FaIdCard className="text-primary mr-3" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Prénom</p>
            <p className="dark:text-white">{user.firstName || 'Non défini'}</p>
          </div>
        </div>
        
        <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <FaIdCard className="text-primary mr-3" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Nom</p>
            <p className="dark:text-white">{user.lastName || 'Non défini'}</p>
          </div>
        </div>
        
        <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <FaEnvelope className="text-primary mr-3" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
            <p className="dark:text-white">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="border-t dark:border-gray-600 pt-6">
        <button
          onClick={handleLogout}
          className="flex items-center px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
        >
          <FaSignOutAlt className="mr-2" />
          Se déconnecter
        </button>
      </div>
    </div>
  );
}