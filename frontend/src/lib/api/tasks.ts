import { apiClient } from './client';
import { Task, PaginatedResponse } from '@/lib/types';

class TasksApi {
  setToken(token: string | null) {
    apiClient.setToken(token);
  }

  async getAllTasks(params?: {
    page?: number;
    size?: number;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Task>> {
    const queryParams: Record<string, string> = {};

    if (params?.page !== undefined) queryParams.page = params.page.toString();
    if (params?.size !== undefined) queryParams.size = params.size.toString();
    if (params?.status) queryParams.status = params.status;
    if (params?.search) queryParams.search = params.search;
    if (params?.sortBy) queryParams.sort_by = params.sortBy;
    if (params?.sortOrder) queryParams.sort_order = params.sortOrder;

    return apiClient.get<PaginatedResponse<Task>>('/tasks', queryParams);
  }

  async getTaskById(id: string): Promise<Task> {
    return apiClient.get<Task>(`/tasks/${id}`);
  }

  async createTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Task> {
    return apiClient.post<Task>('/tasks', taskData);
  }

  async updateTask(id: string, taskData: Partial<Task>): Promise<Task> {
    return apiClient.put<Task>(`/tasks/${id}`, taskData);
  }

  async patchTask(id: string, taskData: Partial<Task>): Promise<Task> {
    return apiClient.patch<Task>(`/tasks/${id}`, taskData);
  }

  async deleteTask(id: string): Promise<void> {
    return apiClient.delete<void>(`/tasks/${id}`);
  }

  async toggleTaskCompletion(id: string): Promise<Task> {
    return apiClient.patch<Task>(`/tasks/${id}`, { status: 'completed' });
  }

  async getTaskStats(): Promise<{ total_tasks: number; completed_tasks: number; pending_tasks: number; in_progress_tasks: number }> {
    return apiClient.get<{ total_tasks: number; completed_tasks: number; pending_tasks: number; in_progress_tasks: number }>('/users/me/tasks/stats');
  }
}

export const tasksApi = new TasksApi();