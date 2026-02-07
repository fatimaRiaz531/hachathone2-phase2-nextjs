import { apiClient } from './client';
import { User } from '@/lib/types';

class UsersApi {
  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/users/me');
  }

  async updateUser(userData: Partial<User>): Promise<User> {
    return apiClient.put<User>('/users/me', userData);
  }

  async deleteUser(): Promise<void> {
    return apiClient.delete<void>('/users/me');
  }
}

export const usersApi = new UsersApi();