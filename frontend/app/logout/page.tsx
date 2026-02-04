'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';

export default function LogoutPage() {
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
      } catch (error) {
        console.error('Logout error:', error);
        // Even if there's an error, redirect to login
        router.push('/login');
      }
    };

    // Only trigger logout on mount if we're authenticated
    performLogout();
  }, [logout, router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e75480] mx-auto"></div>
        <p className="mt-4 text-gray-300">Logging out...</p>
      </div>
    </div>
  );
}