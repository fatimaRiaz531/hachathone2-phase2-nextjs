'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoaded: boolean;
  userId: string | null;
  getToken: () => Promise<string | null>;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { email: string; password: string; firstName?: string; lastName?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check if user is logged in by making an authenticated request
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();

      // Store token in localStorage
      localStorage.setItem('auth-token', data.token);

      // Set user data
      setUser(data.user);
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (userData: { email: string; password: string; firstName?: string; lastName?: string }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();

      // Store token in localStorage
      localStorage.setItem('auth-token', data.token);

      // Set user data
      setUser(data.user);
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      // Remove token from localStorage
      localStorage.removeItem('auth-token');

      // Clear user data
      setUser(null);

      // Optionally call backend logout endpoint
      await fetch('/api/auth/logout', {
        method: 'POST',
      }).catch(console.error); // Don't let logout errors break the flow
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getToken = async (): Promise<string | null> => {
    return localStorage.getItem('auth-token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isLoaded: !loading,
      userId: user?.id ?? null,
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