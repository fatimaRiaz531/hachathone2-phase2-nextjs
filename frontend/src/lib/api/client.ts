import { ApiConfig } from '@/lib/types';

class ApiClient {
  private config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Extract user ID from token if it's a task-related endpoint that requires user_id
    let normalizedEndpoint = endpoint;
    const token = this.getAuthToken();

    if (endpoint.includes('/tasks')) {
      if (token) {
        try {
          // Decode JWT token to get user ID
          const payload = JSON.parse(atob(token.split('.')[1]));
          const userId = payload.sub || payload.user_id; // Common claims for user ID

          if (userId) {
            // Replace /tasks with /{user_id}/tasks if it's a task-related endpoint
            if (endpoint.startsWith('/tasks')) {
              normalizedEndpoint = `/api/v1/${userId}${endpoint}`;
            } else if (endpoint.includes('/tasks') && !endpoint.match(/\/api\/v1\/[a-f0-9-]{36}\/tasks/)) {
              // If it's already in the format /api/v1/some_user_id/tasks, don't modify it again
              // Otherwise, if it contains /tasks but doesn't have a UUID after api/v1, add the user ID
              normalizedEndpoint = `/api/v1/${userId}${endpoint}`;
            } else {
              // If it already has the correct format, just ensure it has /api/v1 prefix
              normalizedEndpoint = endpoint.startsWith('/api/v1') ? endpoint : `/api/v1${endpoint}`;
            }
          }
        } catch (e) {
          console.error('Error decoding token to extract user ID:', e);
          // If we can't decode the token, proceed with the original endpoint
          normalizedEndpoint = endpoint.startsWith('/api/v1') ? endpoint : `/api/v1${endpoint}`;
        }
      } else {
        // If no token, the request will fail anyway due to authentication
        normalizedEndpoint = endpoint.startsWith('/api/v1') ? endpoint : `/api/v1${endpoint}`;
      }
    } else {
      // For non-task endpoints, use the standard prefix
      normalizedEndpoint = endpoint.startsWith('/api/v1') ? endpoint : `/api/v1${endpoint}`;
    }

    const url = `${this.config.baseUrl}${normalizedEndpoint}`;

    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const config: RequestInit = {
      ...this.config,
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    // Handle responses that don't have JSON bodies (like DELETE requests)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return {} as T;
    }
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  public async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<T>(`${endpoint}${queryString}`, { method: 'GET' });
  }

  public async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Initialize API client with base configuration
const apiClient = new ApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8000` : 'http://localhost:8000'),
});

export { apiClient };