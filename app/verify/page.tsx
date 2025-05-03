"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmail() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const token = searchParams?.get('token');
  
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setVerificationStatus({
          success: false,
          message: 'Token manquant. Impossible de vérifier votre email.'
        });
        return;
      }
      
      setIsVerifying(true);
      
      try {
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          setVerificationStatus({
            success: false,
            message: data.error || 'Une erreur s\'est produite lors de la vérification'
          });
        } else {
          setVerificationStatus({
            success: true,
            message: 'Votre email a été vérifié avec succès. Vous pouvez maintenant vous connecter.'
          });
        }
      } catch (error) {
        setVerificationStatus({
          success: false,
          message: 'Une erreur s\'est produite lors de la vérification. Veuillez réessayer.'
        });
      } finally {
        setIsVerifying(false);
      }
    };
    
    verifyToken();
  }, [token]);
  
  return (
    <div className="container-default py-12 animate-fade-in">
      <div className="max-w-md mx-auto bg-white dark:bg-backgroundDark p-6 rounded-lg shadow-md">
        <h1 className="heading-1 text-center mb-6">Vérification de l'email</h1>
        
        <div className="text-center">
          {isVerifying ? (
            <div className="flex flex-col items-center justify-center">
              <div className="spinner mb-4"></div>
              <p className="dark:text-white">Vérification en cours...</p>
            </div>
          ) : verificationStatus.success ? (
            <div className="space-y-4">
              <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded mb-6 dark:bg-green-900 dark:text-green-100 dark:border-green-800">
                <svg className="w-6 h-6 mx-auto mb-2 text-green-600 dark:text-green-100" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <p>{verificationStatus.message}</p>
              </div>
              <Link href="/login" className="btn-primary">
                Se connecter
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 dark:bg-red-900 dark:text-red-100 dark:border-red-800">
                <svg className="w-6 h-6 mx-auto mb-2 text-red-600 dark:text-red-100" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                <p>{verificationStatus.message}</p>
              </div>
              <Link href="/register" className="btn-primary">
                Retour à l'inscription
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
