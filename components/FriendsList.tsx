"use client";

import React, { useState, useEffect } from 'react';
import { getUserFriends, addFriend, removeFriend } from '@/lib/dbServices';
import { useSession } from 'next-auth/react';
import { Users, UserPlus, Trash2, Loader2 } from "lucide-react";

interface Friend {
  id: number;
  username: string;
  displayName: string;
  avatar: string | null;
}

const FriendsList = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newFriendUsername, setNewFriendUsername] = useState('');
  const [addingFriend, setAddingFriend] = useState(false);
  const [addFriendError, setAddFriendError] = useState<string | null>(null);
  
  const { data: session } = useSession();
  
  // Charger la liste des amis
  useEffect(() => {
    async function loadFriends() {
      if (!session?.user?.id) return;
      
      try {
        setLoading(true);
        const userId = parseInt(session.user.id);
        const result = await getUserFriends(userId);
        
        if (result.success) {
          setFriends(result.data);
        } else {
          setError(result.message || "Impossible de charger vos amis");
        }
      } catch (err) {
        console.error("Erreur lors du chargement des amis:", err);
        setError("Une erreur est survenue lors du chargement des amis");
      } finally {
        setLoading(false);
      }
    }
    
    loadFriends();
  }, [session]);
  
  // Fonction pour ajouter un ami
  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newFriendUsername.trim() || !session?.user?.id) return;
    
    try {
      setAddingFriend(true);
      setAddFriendError(null);
      
      const userId = parseInt(session.user.id);
      const result = await addFriend(userId, newFriendUsername);
      
      if (result.success) {
        // Recharger la liste des amis
        const updatedFriends = await getUserFriends(userId);
        if (updatedFriends.success) {
          setFriends(updatedFriends.data);
        }
        setNewFriendUsername('');
      } else {
        setAddFriendError(result.message);
      }
    } catch (err) {
      console.error("Erreur lors de l'ajout d'un ami:", err);
      setAddFriendError("Une erreur est survenue");
    } finally {
      setAddingFriend(false);
    }
  };
  
  // Fonction pour retirer un ami
  const handleRemoveFriend = async (friendId: number) => {
    if (!session?.user?.id) return;
    
    try {
      const userId = parseInt(session.user.id);
      const result = await removeFriend(userId, friendId);
      
      if (result.success) {
        // Mettre à jour la liste localement
        setFriends(friends.filter(friend => friend.id !== friendId));
      }
    } catch (err) {
      console.error("Erreur lors de la suppression d'un ami:", err);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-800 rounded-md">
        <p>{error}</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6">
      <div className="mb-6 flex items-center">
        <Users className="h-6 w-6 mr-2 text-primary" />
        <h2 className="text-xl font-bold">Mes amis ({friends.length})</h2>
      </div>
      
      {/* Formulaire pour ajouter un ami */}
      <form onSubmit={handleAddFriend} className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="text"
              value={newFriendUsername}
              onChange={(e) => setNewFriendUsername(e.target.value)}
              placeholder="Nom d'utilisateur (ex: jeanmartin#1234)"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {addFriendError && (
              <p className="text-sm text-red-500 mt-1">{addFriendError}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={addingFriend || !newFriendUsername.trim()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
          >
            {addingFriend ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <UserPlus className="h-5 w-5" />
            )}
          </button>
        </div>
      </form>
      
      {/* Liste des amis */}
      {friends.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
          Vous n'avez pas encore ajouté d'amis.
        </p>
      ) : (
        <ul className="space-y-3">
          {friends.map((friend) => (
            <li 
              key={friend.id} 
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-navbar rounded-md"
            >
              <div className="flex items-center">
                {friend.avatar ? (
                  <img 
                    src={friend.avatar} 
                    alt={friend.displayName} 
                    className="h-10 w-10 rounded-full mr-3"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary-light flex items-center justify-center mr-3 text-white">
                    {friend.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium">{friend.displayName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{friend.username}</p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveFriend(friend.id)}
                className="p-2 text-red-500 hover:bg-red-100 rounded-full"
                aria-label="Supprimer cet ami"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FriendsList;
