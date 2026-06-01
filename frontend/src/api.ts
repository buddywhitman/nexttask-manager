const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface User {
  id: string;
  email: string;
  name: string;
}

export type Stage = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  stage: Stage;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export const setToken = (token: string) => {
  localStorage.setItem('task_manager_token', token);
};

export const getToken = (): string | null => {
  return localStorage.getItem('task_manager_token');
};

export const clearToken = () => {
  localStorage.removeItem('task_manager_token');
};

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(responseData.error || 'Something went wrong');
  }

  return responseData as T;
}

export const api = {
  register: (email: string, password: string, name: string) => 
    apiRequest<{ message: string; token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email: string, password: string) => 
    apiRequest<{ message: string; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getProfile: () => 
    apiRequest<{ user: User }>('/auth/me'),

  getTasks: () => 
    apiRequest<Task[]>('/tasks'),

  createTask: (title: string, description?: string, stage?: Stage) => 
    apiRequest<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify({ title, description, stage }),
    }),

  updateTask: (id: string, updates: { title?: string; description?: string | null; stage?: Stage }) => 
    apiRequest<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  deleteTask: (id: string) => 
    apiRequest<{ message: string; id: string }>(`/tasks/${id}`, {
      method: 'DELETE',
    }),
};
