"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">Profil de {user.firstName}</h1>
      <p><strong>Prénom :</strong> {user.firstName}</p>
      <p><strong>Nom :</strong> {user.lastName}</p>
      <p><strong>Email :</strong> {user.email}</p>

      <button
        onClick={logout}
        className="mt-6 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Se déconnecter
      </button>
    </div>
  );
}