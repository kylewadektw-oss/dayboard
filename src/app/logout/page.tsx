"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '../../lib/authUtils';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Sign out from Supabase
        await authClient.auth.signOut();
        
        // Clear any additional local storage
        localStorage.removeItem('sb-csbwewirwzeitavhvykr-auth-token');
        localStorage.removeItem('sb-csbwewirwzeitavhvykr-auth-token-code-verifier');
        sessionStorage.clear();
        
        // Redirect to signin page
        router.push('/signin');
      } catch (error) {
        console.error('Logout error:', error);
        // Force redirect even if there's an error
        router.push('/signin');
      }
    };

    handleLogout();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-blue-800">Signing you out...</p>
      </div>
    </div>
  );
}
