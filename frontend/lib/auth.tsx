'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { betterAuth, User } from './better-auth-client'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check for existing auth state on mount (only in browser)
  useEffect(() => {
    // Phase II Bypass: Always use a demo user
    const demoUser: User = {
      id: 'demo-user-phase-ii',
      email: 'demo@example.com',
      name: 'Demo User',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setUser(demoUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const result = await betterAuth.signIn(email, password);
    if (result) {
      setUser(result.user);
      router.push('/dashboard');
    } else {
      throw new Error('Login failed');
    }
  };

  const signup = async (email: string, password: string, firstName?: string, lastName?: string) => {
    const result = await betterAuth.signUp(email, password, firstName, lastName);
    if (result) {
      setUser(result.user);
      router.push('/dashboard');
    } else {
      throw new Error('Signup failed');
    }
  };

  const logout = async () => {
    await betterAuth.signOut();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}