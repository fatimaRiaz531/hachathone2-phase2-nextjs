// TypeScript type definitions that match backend schemas

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRegisterRequest {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface TokenRefreshRequest {
  refresh_token: string;
}

export interface TokenRefreshResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface LogoutResponse {
  message: string;
}

export interface TaskStatus {
  PENDING: 'pending';
  IN_PROGRESS: 'in_progress';
  COMPLETED: 'completed';
}

export interface TaskPriority {
  LOW: 'low';
  MEDIUM: 'medium';
  HIGH: 'high';
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  status: 'pending' | 'in_progress' | 'completed';
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface TaskCreateRequest {
  title: string;
  description?: string;
  due_date?: string;
  status?: 'pending' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
}

export interface TaskUpdateRequest {
  title: string;
  description?: string;
  due_date?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

export interface TaskPartialUpdateRequest {
  title?: string;
  description?: string;
  due_date?: string;
  status?: 'pending' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
}

export interface TaskResponse {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface TaskListResponse {
  data: TaskResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    has_next: boolean;
  };
}

export interface TaskStatsResponse {
  total_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  high_priority_tasks: number;
}

export interface UserProfileUpdateRequest {
  first_name?: string;
  last_name?: string;
}

export interface UserProfileResponse extends User { }

export interface ErrorResponse {
  detail: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface SuccessResponse {
  message: string;
}