import api from './api';
import { ApiResponse, Report } from '../types';

export const reportService = {
  generate: (data: { name: string; type: string; format: string; filters?: Record<string, unknown> }) =>
    api.post<ApiResponse<{ report: Report }>>('/reports/generate', data),

  getAll: () =>
    api.get<ApiResponse<{ reports: Report[] }>>('/reports'),

  download: (id: string) =>
    api.get(`/reports/${id}/download`, { responseType: 'blob' }),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/reports/${id}`),
};
