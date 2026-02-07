// Better Auth Client Configuration
// This simulates the Better Auth integration for the frontend

// In a real implementation, we would use the actual Better Auth client library
// For this implementation, we'll create a proper client that integrates with our backend API

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

class BetterAuthClient {
  private state: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
  };

  constructor() {
    // Initialize from localStorage on creation
    // Only access localStorage if we're in the browser
    if (typeof window !== 'undefined') {
      this.checkStoredAuth();
    }
  }

  private checkStoredAuth(): void {
    // Ensure we're in the browser before accessing localStorage
    if (typeof window === 'undefined') {
      return;
    }

    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.state = {
          user,
          token,
          isAuthenticated: true,
        };
      } catch (e) {
        // Clear invalid stored auth
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }

  async signIn(email: string, password: string): Promise<{ user: User; token: string } | null> {
    console.log(`DEBUG: Frontend signIn - Email: '${email}', Password Length: ${password.length}`);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          // Log as warning instead of error to avoid confusion
          console.warn(`Authentication failed: ${errorData.detail}`);
          throw new Error('Incorrect email or password. Please try again.');
        } else {
          const text = await response.text();
          console.error('Login failed with non-JSON response:', text.substring(0, 200));
          throw new Error(`Login failed: Server returned ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();

      // Update internal state
      this.state = {
        user: {
          id: data.user.id || 'unknown',
          email: data.user.email,
          name: data.user.first_name || email.split('@')[0]
        },
        token: data.access_token,
        isAuthenticated: true,
      };

      // Store token and user in localStorage (only if in browser)
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(this.state.user));
      }

      return { user: this.state.user!, token: data.access_token };
    } catch (error: any) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  // Signup function - calls backend auth API
  async signUp(email: string, password: string, firstName?: string, lastName?: string): Promise<{ user: User; token: string } | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName
        }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Signup failed');
        } else {
          const text = await response.text();
          console.error('Signup failed with non-JSON response:', text.substring(0, 200));
          throw new Error(`Signup failed: Server returned ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();

      // Update internal state
      this.state = {
        user: {
          id: data.user.id || 'unknown',
          email: data.user.email,
          name: data.user.first_name || firstName || email.split('@')[0]
        },
        token: data.access_token,
        isAuthenticated: true,
      };

      // Store token and user in localStorage (only if in browser)
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(this.state.user));
      }

      return { user: this.state.user!, token: data.access_token };
    } catch (error: any) {
      console.error('Signup failed:', error);
      throw error;
    }
  }

  // Logout function
  async signOut(): Promise<void> {
    // Clear internal state
    this.state = {
      user: null,
      token: null,
      isAuthenticated: false,
    };

    // Remove stored auth data (only if in browser)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    // Check if we have a user in localStorage (only if in browser)
    if (typeof window === 'undefined') {
      return this.state.user;
    }

    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.state.user = user;
        this.state.isAuthenticated = true;
        return user;
      } catch (e) {
        // Clear invalid stored user
        localStorage.removeItem('user');
        return null;
      }
    }

    return this.state.user;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    // Check if we have a token in localStorage (only if in browser)
    if (typeof window === 'undefined') {
      return this.state.isAuthenticated;
    }

    const token = localStorage.getItem('token');
    if (token) {
      this.state.token = token;
      this.state.isAuthenticated = true;
      return true;
    }

    return this.state.isAuthenticated;
  }

  // Get JWT token
  getToken(): string | null {
    // Check if we have a token in localStorage (only if in browser)
    if (typeof window === 'undefined') {
      return this.state.token;
    }

    const token = localStorage.getItem('token');
    if (token) {
      this.state.token = token;
      return token;
    }

    return this.state.token;
  }
}

// Create a singleton instance
export const betterAuth = new BetterAuthClient();

// Export types
export type { User };