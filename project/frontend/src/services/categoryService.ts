import api from './api';
import { ApiResponse, Category } from '../types';

export const categoryService = {
  getAll: (params?: { department?: string; isActive?: boolean }) =>
    api.get<ApiResponse<{ categories: Category[] }>>('/categories', { params }),

  create: (data: Partial<Category>) =>
    api.post<ApiResponse<{ category: Category }>>('/categories', data),

  update: (id: string, data: Partial<Category>) =>
    api.patch<ApiResponse<{ category: Category }>>(`/categories/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse<null>>(`/categories/${id}`),
};
