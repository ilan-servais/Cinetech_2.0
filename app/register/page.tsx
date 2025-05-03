"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isValidEmail, isValidPassword } from '@/lib/auth';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState<{
    email?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
    form?: string;
  }>({});
  
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear specific error when user starts typing
    if (errors[e.target.name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [e.target.name]: undefined
      });
    }
  };
  
  const validateForm = () => {
    const newErrors: typeof errors = {};
    let isValid = true;
    
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
      isValid = false;
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
      isValid = false;
    }
    
    if (formData.username && formData.username.length < 3) {
      newErrors.username = 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
      isValid = false;
    }
    
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
      isValid = false;
    } else if (!isValidPassword(formData.password)) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre';
      isValid = false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username || undefined, // Don't send empty string
          password: formData.password
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setErrors({ form: data.error });
      } else {
        setSuccess(true);
        // Clear form
        setFormData({
          email: '',
          username: '',
          password: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      setErrors({ form: 'Une erreur s\'est produite. Veuillez réessayer.' });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container-default py-12 animate-fade-in">
      <div className="max-w-md mx-auto bg-white dark:bg-backgroundDark p-6 rounded-lg shadow-md">
        <h1 className="heading-1 text-center mb-6">Inscription</h1>
        
        {success ? (
          <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded mb-6 dark:bg-green-900 dark:text-green-100 dark:border-green-800">
            <h2 className="font-bold mb-2">Vérifiez votre email</h2>
            <p>
              Nous avons envoyé un lien de vérification à <strong>{formData.email}</strong>. Veuillez vérifier votre email pour activer votre compte.
            </p>
            <div className="mt-4 flex justify-center">
              <Link href="/login" className="btn-primary">
                Aller à la page de connexion
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.form && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded dark:bg-red-900 dark:text-red-100 dark:border-red-800">
                {errors.form}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1 dark:text-white">
                Email*
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input w-full"
                placeholder="votre@email.com"
                required
              />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-1 dark:text-white">
                Nom d'utilisateur (optionnel)
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="form-input w-full"
                placeholder="username"
              />
              {errors.username && <p className="text-red-600 text-sm mt-1">{errors.username}</p>}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1 dark:text-white">
                Mot de passe*
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input w-full"
                placeholder="••••••••"
                required
              />
              {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
              {!errors.password && (
                <p className="text-gray-600 text-xs mt-1 dark:text-gray-300">
                  Au moins 8 caractères, une majuscule, une minuscule et un chiffre.
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1 dark:text-white">
                Confirmer le mot de passe*
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input w-full"
                placeholder="••••••••"
                required
              />
              {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
            
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Création du compte...
                </span>
              ) : 'Créer un compte'}
            </button>
            
            <div className="text-center text-sm mt-4 dark:text-white">
              Vous avez déjà un compte?{' '}
              <Link href="/login" className="text-accent hover:underline">
                Se connecter
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
