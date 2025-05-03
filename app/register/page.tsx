"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isValidEmail, isValidPassword } from '@/lib/auth';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof typeof formData, string>> = {};

    if (!formData.email) {
      newErrors.email = 'Email requis';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.username) {
      newErrors.username = 'Nom d\'utilisateur requis';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
    }

    if (!formData.password) {
      newErrors.password = 'Mot de passe requis';
    } else if (!isValidPassword(formData.password)) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, et un chiffre';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof formData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    // Clear server error when user makes changes
    if (serverError) {
      setServerError(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setServerError(null);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Une erreur s\'est produite lors de l\'inscription');
      }
      
      // Show success message
      setSuccessMessage(data.message);
      
      // Reset form
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
      
    } catch (error) {
      if (error instanceof Error) {
        setServerError(error.message);
      } else {
        setServerError('Une erreur s\'est produite lors de l\'inscription');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-default py-12 animate-fade-in">
      <div className="max-w-md mx-auto bg-white dark:bg-backgroundDark p-6 rounded-lg shadow-md">
        <h1 className="heading-1 text-center mb-6">Créer un compte</h1>
        
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded mb-6 dark:bg-green-900 dark:text-green-100 dark:border-green-800">
            {successMessage}
          </div>
        )}
        
        {serverError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 dark:bg-red-900 dark:text-red-100 dark:border-red-800">
            {serverError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username field */}
          <div>
            <label htmlFor="username" className="block mb-2 font-medium text-text dark:text-textDark">
              Nom d'utilisateur
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400">
                <FaUser />
              </span>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-10 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 ${
                  errors.username ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-200 dark:focus:ring-blue-600'
                }`}
                placeholder="Entrez votre nom d'utilisateur"
                disabled={isLoading}
              />
            </div>
            {errors.username && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.username}</p>
            )}
          </div>
          
          {/* Email field */}
          <div>
            <label htmlFor="email" className="block mb-2 font-medium text-text dark:text-textDark">
              Email
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400">
                <FaEnvelope />
              </span>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-10 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 ${
                  errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-200 dark:focus:ring-blue-600'
                }`}
                placeholder="Entrez votre adresse email"
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
            )}
          </div>
          
          {/* Password field */}
          <div>
            <label htmlFor="password" className="block mb-2 font-medium text-text dark:text-textDark">
              Mot de passe
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400">
                <FaLock />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-10 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 ${
                  errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-200 dark:focus:ring-blue-600'
                }`}
                placeholder="Créez votre mot de passe"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
            )}
          </div>
          
          {/* Confirm Password field */}
          <div>
            <label htmlFor="confirmPassword" className="block mb-2 font-medium text-text dark:text-textDark">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400">
                <FaLock />
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-10 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 ${
                  errors.confirmPassword ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-200 dark:focus:ring-blue-600'
                }`}
                placeholder="Confirmez votre mot de passe"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
            )}
          </div>
          
          <button
            type="submit"
            className="w-full btn-primary py-3"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex justify-center items-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Inscription en cours...
              </span>
            ) : 'Créer un compte'}
          </button>
          
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Vous avez déjà un compte? {' '}
            <Link href="/login" className="text-accent hover:underline">
              Connexion
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
