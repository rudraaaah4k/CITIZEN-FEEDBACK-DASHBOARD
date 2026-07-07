import api from './api';
import { ApiResponse, DashboardStats, DepartmentAnalyticsDetail } from '../types';

export const analyticsService = {
  getDashboardStats: () =>
    api.get<ApiResponse<DashboardStats>>('/analytics/dashboard'),

  getDepartmentAnalytics: () =>
    api.get<ApiResponse<{ analytics: unknown[] }>>('/analytics/departments'),

  getDepartmentAnalyticsById: (id: string) =>
    api.get<ApiResponse<DepartmentAnalyticsDetail>>(`/analytics/departments/${id}`),

  getSentimentTrend: (period?: number) =>
    api.get<ApiResponse<{ trend: unknown[]; heatmapData: unknown[] }>>('/analytics/sentiment-trend', {
      params: { period },
    }),

  getTopicAnalysis: () =>
    api.get<ApiResponse<{ topics: unknown[] }>>('/analytics/topics'),

  getEmotionAnalytics: () =>
    api.get<ApiResponse<{ emotions: Record<string, number> }>>('/analytics/emotions'),
};
