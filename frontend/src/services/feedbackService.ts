import api from './api';
import { ApiResponse, Feedback, FeedbackFilters } from '../types';

export const feedbackService = {
  submit: (formData: FormData) =>
    api.post<ApiResponse<{ feedback: Feedback }>>('/feedback', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getAll: (filters: FeedbackFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params.append(key, String(value));
    });
    return api.get<ApiResponse<{ feedbacks: Feedback[] }>>(`/feedback?${params}`);
  },

  getById: (id: string) =>
    api.get<ApiResponse<{ feedback: Feedback }>>(`/feedback/${id}`),

  track: (trackingId: string) =>
    api.get<ApiResponse<{ feedback: Feedback }>>(`/feedback/track/${trackingId}`),

  getMy: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<ApiResponse<{ feedbacks: Feedback[] }>>('/feedback/my', { params }),

  updateStatus: (id: string, status: string, note?: string, assignedTo?: string) =>
    api.patch<ApiResponse<{ feedback: Feedback }>>(`/feedback/${id}/status`, { status, note, assignedTo }),

  addNote: (id: string, note: string) =>
    api.patch<ApiResponse<{ feedback: Feedback }>>(`/feedback/${id}/note`, { note }),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/feedback/${id}`),

  getStats: () =>
    api.get<ApiResponse<Record<string, unknown>>>('/feedback/stats'),

  downloadPDF: (id: string) =>
    api.get(`/feedback/${id}/pdf`, { responseType: 'blob' }),
};
