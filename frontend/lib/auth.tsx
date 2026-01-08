'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { betterAuth, User } from './better-auth-client'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name?: string) => Promise<void>
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

  // Check for existing auth state on mount
  useEffect(() => {
    // Check if user is already authenticated
    if (betterAuth.isAuthenticated()) {
      const currentUser = betterAuth.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    }
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

  const signup = async (email: string, password: string, name?: string) => {
    const result = await betterAuth.signUp(email, password, name);
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