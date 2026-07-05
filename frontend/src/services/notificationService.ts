import api from './api';
import { ApiResponse, Notification } from '../types';

export const notificationService = {
  getAll: (params?: { page?: number; limit?: number; isRead?: boolean }) =>
    api.get<ApiResponse<{ notifications: Notification[]; unreadCount: number }>>('/notifications', { params }),

  markAsRead: (id: string) =>
    api.patch<ApiResponse<null>>(`/notifications/${id}/read`),

  markAllAsRead: () =>
    api.patch<ApiResponse<null>>('/notifications/read-all'),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/notifications/${id}`),

  getUnreadCount: () =>
    api.get<ApiResponse<{ count: number }>>('/notifications/unread-count'),
};
