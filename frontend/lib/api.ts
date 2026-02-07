// Simplified API client for Phase II (No Authentication)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // Generic request method
  async request(endpoint: string, options: RequestInit = {}) {
    // Ensure endpoint has /api/v1 prefix if not already present
    let normalizedEndpoint = endpoint;
    if (!endpoint.startsWith('/api/v1') && !endpoint.startsWith('http')) {
      normalizedEndpoint = `/api/v1${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    }

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(`${this.baseUrl}${normalizedEndpoint}`, {
        ...options,
        headers,
      });

      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (!response.ok) {
        let errorMessage = `API request failed: ${response.status} ${response.statusText}`;

        try {
          if (isJson) {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorData.message || errorMessage;
          }
        } catch (e) {
          // Fallback to default message
        }

        console.error(`API Error (${normalizedEndpoint}):`, errorMessage);
        throw new Error(errorMessage);
      }

      if (response.status === 204) return null;

      if (isJson) {
        return response.json();
      } else {
        return response.text();
      }
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to the API server. Please make sure the backend server is running on http://localhost:8000.');
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
  patch(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
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