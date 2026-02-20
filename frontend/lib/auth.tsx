'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

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

// Auth provider component using Better Auth
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Initialize auth state
  React.useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const token = localStorage.getItem('auth-token')
        if (token) {
          // Verify token and get user data
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (response.ok) {
            const userData = await response.json()
            setUser({
              id: userData.id,
              email: userData.email,
              firstName: userData.first_name,
              lastName: userData.last_name
            })
          }
        }
      } catch (error) {
        console.error('Error checking session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  // Get JWT token for API calls
  const getAuthToken = async (): Promise<string | null> => {
    try {
      const token = localStorage.getItem('auth-token')
      return token
    } catch (error) {
      console.error('Failed to get auth token:', error)
      return null
    }
  }

  // Logout function
  const logout = async () => {
    try {
      // Remove token from localStorage
      localStorage.removeItem('auth-token')

      // Clear user data
      setUser(null)

      // Optionally call backend logout endpoint
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }).catch(console.error)

      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const isSignedIn = !!user

  return (
    <AuthContext.Provider
      value={{
        user,
        getToken: getAuthToken,
        logout,
        isLoading,
        isSignedIn
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