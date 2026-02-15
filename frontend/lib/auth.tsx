'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useAuth as useClerkAuth, useClerk } from '@clerk/nextjs'

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
}

interface AuthContextType {
  user: User | null
  getToken: () => Promise<string | null>
  logout: () => Promise<void>
  isLoading: boolean
  isSignedIn: boolean
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider component - wraps Clerk hooks for app-wide use
export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser()
  const { getToken } = useClerkAuth()
  const { signOut } = useClerk()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  // Sync Clerk user to local state
  useEffect(() => {
    if (isLoaded && isSignedIn && clerkUser) {
      setUser({
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        firstName: clerkUser.firstName || undefined,
        lastName: clerkUser.lastName || undefined,
      })
    } else if (isLoaded && !isSignedIn) {
      setUser(null)
    }
  }, [isLoaded, isSignedIn, clerkUser])

  // Get JWT token for API calls
  const getAuthToken = async (): Promise<string | null> => {
    try {
      const token = await getToken()
      return token
    } catch (error) {
      console.error('Failed to get auth token:', error)
      return null
    }
  }

  // Logout function
  const logout = async () => {
    await signOut()
    setUser(null)
    router.push('/')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        getToken: getAuthToken,
        logout,
        isLoading: !isLoaded,
        isSignedIn: isSignedIn ?? false
      }}
    >
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