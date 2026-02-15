// Simplified API client for Phase II & III (Clerk Auth)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  // Generic request method
  async request(endpoint: string, options: RequestInit = {}) {
    // Normalize endpoint:
    // - If it starts with '/api/v1' or '/api/' or 'http' leave as-is
    // - Otherwise prefix with '/api/v1'
    let normalizedEndpoint = endpoint;
    if (
      !endpoint.startsWith('/api/v1') &&
      !endpoint.startsWith('/api/') &&
      !endpoint.startsWith('http')
    ) {
      normalizedEndpoint = `/api/v1${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    }

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    } as Record<string, string>;

    // Add Authorization header if token present
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${normalizedEndpoint}`, {
        ...options,
        headers,
      });

      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (!response.ok) {
        // Handle 401 Unauthorized globally
        if (response.status === 401) {
          console.warn('API returned 401 Unauthorized');
          // Clerk handles auth state, so we just throw error here
          throw new Error('Session expired. Please login again.');
        }

        let errorMessage = `API request failed: ${response.status} ${response.statusText}`;

        try {
          if (isJson) {
            const errorData = await response.json();
            errorMessage =
              errorData.detail || errorData.message || errorMessage;
          }
        } catch (e) {
          // Fallback to default message
        }

        console.error(`API Error (${normalizedEndpoint}):`, errorMessage);
        throw new Error(errorMessage);
      }

      if (response.status === 204) return null;

      if (isJson) {
        const parsed = await response.json();
        // If backend wraps payload in { data: ... } return the inner data for convenience
        if (parsed && typeof parsed === 'object' && 'data' in parsed) {
          // @ts-ignore
          return parsed.data;
        }
        return parsed;
      } else {
        return response.text();
      }
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(
          'Unable to connect to the API server. Please make sure the backend server is running on http://localhost:8000.',
        );
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

  // Chat request
  async chat(message: string, user_id?: string) {
    return this.post('/chat', {
      message,
      user_id,
    });
  }

  /* Convenience helpers for the Todo API */
  getTasks(userId?: string) {
    return this.get('/tasks');
  }

  createTask(userId: string, payload: any) {
    return this.post('/tasks', payload);
  }

  updateTask(userId: string, taskId: string, payload: any) {
    return this.put(`/tasks/${taskId}`, payload);
  }

  // Complete/uncomplete a task - uses PATCH /api/v1/tasks/{taskId}/complete
  completeTask(userId: string, taskId: string, completed: boolean) {
    return this.patch(`/tasks/${taskId}/complete`, { completed }); // Endpoint ignores body for now but good to send
  }

  deleteTaskById(userId: string, taskId: string) {
    return this.delete(`/tasks/${taskId}`);
  }
}

export const apiClient = new ApiClient();
