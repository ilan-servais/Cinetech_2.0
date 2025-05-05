"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form validation
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length >= 6;
  const isFormValid = isEmailValid && isPasswordValid;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        setSuccess('Connexion réussie! Redirection...');
        
        // Redirect after login
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } else {
        setError(result.error || 'Identifiants incorrects. Veuillez réessayer.');
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background dark:bg-backgroundDark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary dark:text-accent">Connexion</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Accédez à votre compte Cinetech
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
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    email && !isEmailValid ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-accent focus:border-accent dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                  placeholder="votre@email.com"
                />
              </div>
              {email && !isEmailValid && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">Veuillez saisir un email valide</p>
              )}
            </div>
            
            <div>
              <div className="flex justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mot de passe
                </label>
                <Link href="/forgot-password" className="text-sm text-accent hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`appearance-none block w-full pl-10 pr-10 py-2 border ${
                    password && !isPasswordValid ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-accent focus:border-accent dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              {password && !isPasswordValid && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">Le mot de passe doit contenir au moins 6 caractères</p>
              )}
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={!isFormValid || loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isFormValid && !loading
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
                  Connexion...
                </span>
              ) : (
                'Se connecter'
              )}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Pas encore inscrit ?{' '}
            <Link href="/register" className="font-medium text-accent hover:text-accent-dark">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
