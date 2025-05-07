"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaEnvelope, FaLock, FaCheck, FaArrowRight } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyEmail, resendVerificationCode } = useAuth();
  
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  
  // Utilisation de useRef pour stocker les références des inputs
  const digitBoxesRef = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));
  
  useEffect(() => {
    // Get email from query params if available
    const emailParam = searchParams?.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);
  
  // Handle digit input for verification code
  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[value.length - 1];
    }
    
    // Update the code state
    const newCode = code.split('');
    newCode[index] = value;
    setCode(newCode.join(''));
    
    // Focus the next input if value is entered
    if (value && index < 5 && digitBoxesRef.current[index + 1]) {
      digitBoxesRef.current[index + 1]?.focus();
    }
  };
  
  // Handle backspace key to navigate to previous input
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      // Focus the previous input when backspace is pressed on an empty input
      digitBoxesRef.current[index - 1]?.focus();
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code.length !== 6 || !email) {
      setError('Veuillez entrer un code de vérification à 6 chiffres et votre email.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Utilisons le contexte d'authentification pour la vérification
      const result = await verifyEmail(email, code);
      
      if (!result.success) {
        setError(result.error || 'Code de vérification incorrect. Veuillez réessayer.');
        return;
      }
      
      setSuccess('Compte vérifié avec succès! Redirection...');
      
      // Redirect to homepage after successful verification
      setTimeout(() => {
        router.push('/');
      }, 2000);
      
    } catch (err) {
      console.error('Verification error:', err);
      setError('Une erreur est survenue lors de la vérification.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle resend verification code
  const handleResendCode = async () => {
    if (!email) {
      setError('Veuillez entrer votre email pour recevoir un nouveau code.');
      return;
    }
    
    setIsResending(true);
    setError(null);
    
    try {
      // Utiliser le contexte d'authentification pour renvoyer le code
      const result = await resendVerificationCode(email);
      
      if (!result.success) {
        setError(result.error || 'Impossible d\'envoyer un nouveau code.');
        return;
      }
      
      setSuccess('Un nouveau code a été envoyé à votre adresse email.');
      
      // Clear success message after a few seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
      
    } catch (err) {
      console.error('Resend error:', err);
      setError('Une erreur est survenue lors de l\'envoi du nouveau code.');
    } finally {
      setIsResending(false);
    }
  };
  
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background dark:bg-backgroundDark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary dark:text-primary">Vérification</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Entrez le code à 6 chiffres envoyé à votre adresse email
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
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="votre@email.com"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Code de vérification
              </label>
              <div className="flex justify-between mt-2">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    ref={(el) => {
                      digitBoxesRef.current[index] = el;
                    }}
                    value={code[index] || ''}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 p-0 text-center font-mono text-xl border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={code.length !== 6 || loading}
              className={`btn-primary w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                code.length !== 6 || loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Vérification en cours...' : 'Vérifier mon compte'}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isResending}
              className="text-sm font-medium text-primary hover:text-primary-dark dark:text-primary dark:hover:text-primary-light"
            >
              {isResending ? 'Envoi en cours...' : 'Renvoyer le code'}
            </button>
            
            <Link href="/login" className="text-sm font-medium text-primary hover:text-primary-dark dark:text-primary dark:hover:text-primary-light flex items-center">
              <span>Se connecter</span>
              <FaArrowRight className="ml-1" />
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
