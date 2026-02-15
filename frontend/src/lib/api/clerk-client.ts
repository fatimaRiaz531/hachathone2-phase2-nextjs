'use client';

import { useAuth } from '@clerk/nextjs';
import { ApiConfig } from '@/lib/types';

/**
 * Clerk-integrated API client for authenticated requests
 * This wrapper ensures all API calls use Clerk's JWT token
 */
class ClerkApiClient {
    private config: ApiConfig;
    private getToken: (() => Promise<string | null>) | null = null;

    constructor(config: ApiConfig) {
        this.config = config;
    }

    /**
     * Initialize with Clerk's getToken function
     * Must be called from a component using useAuth()
     */
    setTokenProvider(getToken: () => Promise<string | null>) {
        this.getToken = getToken;
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        // Get token from Clerk
        const token = this.getToken ? await this.getToken() : null;

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
            if (response.status === 401) {
                console.warn('API returned 401 Unauthorized');
                throw new Error('Session expired. Please login again.');
            }

            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        // Handle 204 No Content or empty bodies
        if (response.status === 204 || response.status === 205) {
            return {} as T;
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            // Check if response has content before parsing
            const text = await response.text();
            if (!text) return {} as T;
            try {
                return JSON.parse(text);
            } catch (e) {
                console.error('Error parsing JSON:', e);
                return {} as T;
            }
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
const clerkApiClient = new ClerkApiClient({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
});

/**
 * Hook to get Clerk-authenticated API client
 * Use this in components to make authenticated API calls
 */
export function useClerkApi() {
    const { getToken } = useAuth();

    // Set token provider on each render
    clerkApiClient.setTokenProvider(getToken);

    return clerkApiClient;
}

export { clerkApiClient };
