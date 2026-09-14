import { apiClient } from './client';
import { APIResponse, AuthResponse, User } from '@/types';

export const authApi = {
  register: async (payload: { name: string; email: string; password: string; role: string }) => {
    const res = await apiClient.post<APIResponse<User>>('/auth/register', payload);
    return res.data;
  },

  login: async (payload: { email: string; password: string }) => {
    const res = await apiClient.post<APIResponse<AuthResponse>>('/auth/login', payload);
    return res.data;
  },

  refresh: async () => {
    const res = await apiClient.post<APIResponse<{ access_token: string }>>('/auth/refresh');
    return res.data;
  },

  logout: async () => {
    const res = await apiClient.post<APIResponse<{ message: string }>>('/auth/logout');
    return res.data;
  },

  me: async () => {
    const res = await apiClient.get<APIResponse<User>>('/auth/me');
    return res.data;
  },
};
