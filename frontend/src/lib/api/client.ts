import { ApiConfig } from '@/lib/types';

class ApiClient {
  private config: ApiConfig;
  private token: string | null = null;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  public setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.token;

    // Ensure endpoint has /api/v1 prefix and no double slashes
    let normalizedEndpoint = endpoint.startsWith('/api/v1') ? endpoint : `/api/v1${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const url = `${this.config.baseUrl.replace(/\/$/, '')}${normalizedEndpoint}`;

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

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return {} as T;
    }
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
  baseUrl: process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8000` : 'http://localhost:8000'),
});

export { apiClient };