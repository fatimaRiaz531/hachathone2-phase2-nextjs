'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Spinner } from '@/components/ui/Spinner';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const AuthGuard = ({ children, redirectTo = '/login' }: AuthGuardProps) => {
  const { user, isLoading: loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // // Disable auth redirect for development
    // if (!loading && !user) {
    //   router.push(redirectTo);
    // }
  }, [user, loading, router]);

  // // Always show content in development mode
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Phase II Bypass check
  if (!user && !loading) {
    // In demo mode, the AuthProvider should have set a user.
    // If not, we still redirect to login just in case, or we could force a user here.
    router.push('/login');
    return null;
  }

  return <>{children}</>;
};

export { AuthGuard };