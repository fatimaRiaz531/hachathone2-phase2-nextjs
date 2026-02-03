// API client with JWT token handling
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // Generic request method that includes JWT token
  async request(endpoint: string, options: RequestInit = {}) {
    // Get token from localStorage (only if in browser)
    let token = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token');
    }

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header if token exists
    if (token) {
      (headers as any)['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      // If response is 401, redirect to login (only if in browser)
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return;
      }

      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `API request failed: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        } catch (e) {
          // If we can't parse the error, use the status text
        }

        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error: any) {
      // Handle network errors or fetch failures
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        // This is likely a network error (server not running, etc.)
        console.warn(`Network error when calling ${this.baseUrl}${endpoint}. Server may not be running.`);

        // For development, we could implement a fallback to in-memory storage
        // but for now, we'll throw a more descriptive error
        throw new Error('Unable to connect to the API server. Please make sure the backend server is running.');
      }

      throw error;
    }
  }

  // GET request
  get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // PATCH request
  patch(endpoint: string) {
    return this.request(endpoint, {
      method: 'PATCH',
    });
  }

  // DELETE request
  delete(endpoint: string) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();