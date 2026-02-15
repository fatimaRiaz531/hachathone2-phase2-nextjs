'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useUser, useAuth as useClerkAuth, useClerk, useSignIn, useSignUp } from '@clerk/nextjs';
import { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  getToken: () => Promise<string | null>;
  logout: () => Promise<void>;
  // These are kept for compatibility with existing forms, but should ideally use Clerk's hooks directly
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { email: string; password: string; firstName?: string; lastName?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { getToken } = useClerkAuth();
  const { signOut } = useClerk();
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();

  const user: User | null = clerkUser ? {
    id: clerkUser.id,
    email: clerkUser.primaryEmailAddress?.emailAddress || '',
    first_name: clerkUser.firstName || '',
    last_name: clerkUser.lastName || '',
    created_at: clerkUser.createdAt ? new Date(clerkUser.createdAt).toISOString() : '',
    updated_at: clerkUser.updatedAt ? new Date(clerkUser.updatedAt).toISOString() : '',
  } : null;

  const login = async (email: string, password: string) => {
    if (!signInLoaded) return;
    const result = await signIn.create({
      identifier: email,
      password,
    });
    if (result.status !== 'complete') {
      throw new Error('Login failed: ' + result.status);
    }
  };

  const register = async (userData: { email: string; password: string; firstName?: string; lastName?: string }) => {
    if (!signUpLoaded) return;
    const result = await signUp.create({
      emailAddress: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
    });
    if (result.status !== 'complete') {
      throw new Error('Registration failed: ' + result.status);
    }
  };

  const logout = async () => {
    await signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading: !isLoaded,
      getToken,
      logout,
      login,
      register
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};