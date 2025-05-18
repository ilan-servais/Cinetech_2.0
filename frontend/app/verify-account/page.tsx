"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyAccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  
  useEffect(() => {
    // Récupérer l'email depuis les paramètres d'URL
    const emailParam = searchParams?.get('email');
    
    if (emailParam) {
      setEmail(emailParam);
    } else {
      // Si pas d'email en paramètre, rediriger vers la page d'inscription
      router.push('/register');
      return;
    }
    
    // Si le code est présent dans l'URL, le définir et soumettre automatiquement
    const codeParam = searchParams?.get('code');
    if (codeParam && codeParam.length === 6) {
      setCode(codeParam);
      
      // Attendre le prochain cycle pour s'assurer que tout est initialisé
      setTimeout(() => {
        if (!autoSubmitted) {
          verifyAccount(emailParam, codeParam);
          setAutoSubmitted(true);
        }
      }, 500);
    }
  }, [searchParams, router, autoSubmitted]);

  const verifyAccount = async (userEmail: string, verificationCode: string) => {
    if (verificationCode.length !== 6) {
      setError('Veuillez entrer un code à 6 chiffres');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Appel à l'API de vérification
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          code: verificationCode
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSuccess('Compte vérifié avec succès! Redirection vers la page de connexion...');
        
        // Redirection vers la page de connexion
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.message || 'Code de vérification incorrect. Veuillez réessayer.');
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la vérification du compte.');
      console.error('Verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    verifyAccount(email, code);
  };

  const handleResendCode = async () => {
    if (!email) {
      setError('Adresse email manquante. Veuillez vous réinscrire.');
      return;
    }
    
    try {
      // Simuler une requête pour renvoyer le code
      // Remplacer cette partie par un appel réel à l'API
      setSuccess('Un nouveau code a été envoyé à votre adresse email.');
      
      // Exemple d'implémentation réelle:
      // const response = await fetch('http://localhost:3001/api/auth/resend-verification', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });
      // const data = await response.json();
      // if (response.ok) {
      //   setSuccess('Un nouveau code a été envoyé à votre adresse email.');
      // } else {
      //   setError(data.message);
      // }
    } catch (err) {
      setError('Erreur lors de l\'envoi du nouveau code.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background dark:bg-backgroundDark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary dark:text-accent">Vérification du compte</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Veuillez entrer le code à 6 chiffres envoyé à votre adresse email: {email}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative dark:bg-red-900 dark:border-red-800 dark:text-red-200" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative dark:bg-green-900 dark:border-green-800 dark:text-green-200" role="alert">
            <span className="block sm:inline">{success}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Code de vérification
            </label>
            <div className="mt-1">
              <input
                id="code"
                name="code"
                type="text"
                pattern="[0-9]*"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-accent focus:border-accent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-center text-2xl tracking-widest"
                placeholder="123456"
              />
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={code.length !== 6 || loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                code.length === 6 && !loading
                  ? 'bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent'
                  : 'bg-gray-400 cursor-not-allowed'
              } transition-colors duration-200`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Vérification en cours...
                </span>
              ) : (
                'Vérifier mon compte'
              )}
            </button>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Vous n&apos;avez pas reçu de code ?{' '}
              <button 
                type="button"
                className="font-medium text-accent hover:text-accent-dark"
                onClick={handleResendCode}
              >
                Renvoyer le code
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
