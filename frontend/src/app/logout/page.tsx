'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/Spinner';

const LogoutPage = () => {
  const { logout, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      logout();
      // Redirect to login page after logout
      setTimeout(() => {
        router.push('/login');
      }, 1000);
    } else {
      // If not logged in, redirect to login
      router.push('/login');
    }
  }, [user, logout, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-lg text-gray-600">Signing out...</p>
      </div>
    </div>
  );
};

export default LogoutPage;