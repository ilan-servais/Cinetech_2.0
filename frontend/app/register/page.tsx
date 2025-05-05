"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUser } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
    // Form validation
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length >= 8;
  const doPasswordsMatch = password === confirmPassword;
  const isFirstNameValid = firstName.length >= 2;
  const isLastNameValid = lastName.length >= 2;
  const isFormValid = isEmailValid && isPasswordValid && isFirstNameValid && isLastNameValid && doPasswordsMatch;
  
  // Check password strength
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const passwordStrength = () => {
    if (password.length === 0) return { score: 0, text: '' };
    if (password.length < 6) return { score: 1, text: 'Très faible' };
    
    let score = 0;
    if (password.length >= 8) score += 1;
    if (hasUppercase) score += 1;
    if (hasLowercase) score += 1;
    if (hasNumber) score += 1;
    if (hasSpecialChar) score += 1;
    
    if (score <= 2) return { score: 2, text: 'Faible' };
    if (score <= 3) return { score: 3, text: 'Moyen' };
    if (score <= 4) return { score: 4, text: 'Fort' };
    return { score: 5, text: 'Très fort' };
  };
  
  const strength = passwordStrength();
  
  const getPasswordStrengthColor = () => {
    switch (strength.score) {
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-green-500';
      case 5: return 'bg-green-600';
      default: return 'bg-gray-300';
    }
  };  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) return;
    
    // Double check passwords match
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await register({
        email,
        password,
        firstName,
        lastName
      });
        if (result.success) {
        setSuccess('Inscription réussie! Vérifiez votre email pour activer votre compte...');
        
        // Redirect to verification page
        setTimeout(() => {
          router.push(`/verify?email=${encodeURIComponent(email)}`);
        }, 2000);
      } else {
        setError(result.error || 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.');
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la création du compte. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background dark:bg-backgroundDark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary dark:text-accent">Créer un compte</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Rejoignez Cinetech pour sauvegarder vos films et séries préférés
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
            
            <div>              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Prénom
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    firstName && !isFirstNameValid ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-accent focus:border-accent dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                  placeholder="Prénom"
                />
              </div>
              {firstName && !isFirstNameValid && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">Le prénom doit contenir au moins 2 caractères</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mot de passe
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
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
              
              {password && (
                <>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${getPasswordStrengthColor()} h-2 rounded-full`} 
                        style={{ width: `${(strength.score / 5) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {strength.text && `Force du mot de passe: ${strength.text}`}
                    </p>
                  </div>
                  
                  <ul className="mt-2 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <li className={password.length >= 8 ? 'text-green-600 dark:text-green-400' : ''}>
                      • Au moins 8 caractères
                    </li>
                    <li className={hasUppercase ? 'text-green-600 dark:text-green-400' : ''}>
                      • Au moins une majuscule (A-Z)
                    </li>
                    <li className={hasLowercase ? 'text-green-600 dark:text-green-400' : ''}>
                      • Au moins une minuscule (a-z)
                    </li>
                    <li className={hasNumber ? 'text-green-600 dark:text-green-400' : ''}>
                      • Au moins un chiffre (0-9)
                    </li>
                    <li className={hasSpecialChar ? 'text-green-600 dark:text-green-400' : ''}>
                      • Au moins un caractère spécial (!@#$...)
                    </li>
                  </ul>
                </>              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirmer le mot de passe
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`appearance-none block w-full pl-10 pr-10 py-2 border ${
                    confirmPassword && !doPasswordsMatch ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-accent focus:border-accent dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              {confirmPassword && !doPasswordsMatch && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">Les mots de passe ne correspondent pas</p>
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
                  Création en cours...
                </span>
              ) : (
                'Créer mon compte'
              )}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Déjà un compte ?{' '}
            <Link href="/login" className="font-medium text-accent hover:text-accent-dark">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
