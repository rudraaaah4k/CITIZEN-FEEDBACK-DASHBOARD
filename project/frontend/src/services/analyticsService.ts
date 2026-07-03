import api from './api';
import { ApiResponse, DashboardStats } from '../types';

export const analyticsService = {
  getDashboardStats: () =>
    api.get<ApiResponse<DashboardStats>>('/analytics/dashboard'),

  getDepartmentAnalytics: () =>
    api.get<ApiResponse<{ analytics: unknown[] }>>('/analytics/departments'),

  getSentimentTrend: (period?: number) =>
    api.get<ApiResponse<{ trend: unknown[]; heatmapData: unknown[] }>>('/analytics/sentiment-trend', {
      params: { period },
    }),

  getTopicAnalysis: () =>
    api.get<ApiResponse<{ topics: unknown[] }>>('/analytics/topics'),

  getEmotionAnalytics: () =>
    api.get<ApiResponse<{ emotions: Record<string, number> }>>('/analytics/emotions'),
};
