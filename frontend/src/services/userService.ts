import api from './api';
import { ApiResponse, User } from '../types';

export const userService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<ApiResponse<{ users: User[] }>>('/users', { params }),

  getById: (id: string) =>
    api.get<ApiResponse<{ user: User; feedbackStats: Record<string, number> }>>(`/users/${id}`),

  update: (id: string, data: Partial<User>) =>
    api.patch<ApiResponse<{ user: User }>>(`/users/${id}`, data),

  toggleStatus: (id: string) =>
    api.patch<ApiResponse<{ user: User }>>(`/users/${id}/toggle-status`),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/users/${id}`),

  getStats: () =>
    api.get<ApiResponse<Record<string, unknown>>>('/users/stats'),
};
