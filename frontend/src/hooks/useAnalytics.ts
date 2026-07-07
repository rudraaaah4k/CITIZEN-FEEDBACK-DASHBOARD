import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analyticsService';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: analyticsService.getDashboardStats,
    select: (data) => data.data.data,
    refetchInterval: 1000 * 60 * 2,
  });
};

export const useDepartmentAnalytics = () => {
  return useQuery({
    queryKey: ['department-analytics'],
    queryFn: analyticsService.getDepartmentAnalytics,
    select: (data) => data.data.data.analytics,
  });
};

export const useDepartmentAnalyticsById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['department-analytics-detail', id],
    queryFn: () => analyticsService.getDepartmentAnalyticsById(id),
    enabled: enabled && !!id,
    select: (data) => data.data.data,
  });
};

export const useSentimentTrend = (period = 30) => {
  return useQuery({
    queryKey: ['sentiment-trend', period],
    queryFn: () => analyticsService.getSentimentTrend(period),
    select: (data) => data.data.data,
  });
};

export const useTopicAnalysis = () => {
  return useQuery({
    queryKey: ['topic-analysis'],
    queryFn: analyticsService.getTopicAnalysis,
    select: (data) => data.data.data.topics,
  });
};

export const useEmotionAnalytics = () => {
  return useQuery({
    queryKey: ['emotion-analytics'],
    queryFn: analyticsService.getEmotionAnalytics,
    select: (data) => data.data.data.emotions,
  });
};
