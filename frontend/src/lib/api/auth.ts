import { apiClient } from './client';
import { LoginCredentials, RegisterData, AuthTokens, User } from '@/lib/types';

class AuthApi {
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    return apiClient.post<AuthTokens>('/auth/login', credentials);
  }

  async register(userData: RegisterData): Promise<User> {
    return apiClient.post<User>('/auth/register', userData);
  }

  async logout(): Promise<void> {
    return apiClient.post('/auth/logout');
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    return apiClient.post<AuthTokens>('/auth/refresh', { refresh_token: refreshToken });
  }

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/users/me');
  }

  async updateCurrentUser(userData: Partial<User>): Promise<User> {
    return apiClient.put<User>('/users/me', userData);
  }
}

export const authApi = new AuthApi();