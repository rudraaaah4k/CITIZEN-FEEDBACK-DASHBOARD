import api from './api';
import { ApiResponse, Department } from '../types';

export const departmentService = {
  getAll: (params?: { isActive?: boolean; search?: string }) =>
    api.get<ApiResponse<{ departments: Department[] }>>('/departments', { params }),

  getById: (id: string) =>
    api.get<ApiResponse<{ department: Department }>>(`/departments/${id}`),

  create: (data: Partial<Department>) =>
    api.post<ApiResponse<{ department: Department }>>('/departments', data),

  update: (id: string, data: Partial<Department>) =>
    api.patch<ApiResponse<{ department: Department }>>(`/departments/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/departments/${id}`),
};
