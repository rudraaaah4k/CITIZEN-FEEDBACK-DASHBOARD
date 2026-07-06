import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '../stores/uiStore';
import { feedbackService } from '../services/feedbackService';
import { FeedbackFilters } from '../types';

export const useFeedback = (filters: FeedbackFilters = {}) => {
  return useQuery({
    queryKey: ['feedbacks', filters],
    queryFn: () => feedbackService.getAll(filters),
    select: (data) => ({
      feedbacks: data.data.data.feedbacks,
      pagination: data.data.pagination,
    }),
  });
};

export const useMyFeedback = (params?: { page?: number; limit?: number; status?: string }) => {
  return useQuery({
    queryKey: ['my-feedbacks', params],
    queryFn: () => feedbackService.getMy(params),
    select: (data) => ({
      feedbacks: data.data.data.feedbacks,
      pagination: data.data.pagination,
    }),
  });
};

export const useFeedbackById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['feedback', id],
    queryFn: () => feedbackService.getById(id),
    enabled: enabled && !!id,
    select: (data) => data.data.data.feedback,
  });
};

export const useTrackFeedback = (trackingId: string, enabled = true) => {
  return useQuery({
    queryKey: ['track-feedback', trackingId],
    queryFn: () => feedbackService.track(trackingId),
    enabled: enabled && !!trackingId,
    select: (data) => data.data.data.feedback,
  });
};

export const useSubmitFeedback = () => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: feedbackService.submit,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
      queryClient.invalidateQueries({ queryKey: ['my-feedbacks'] });
      addToast({
        type: 'success',
        title: 'Feedback Submitted! 🎉',
        message: `Tracking ID: ${data.data.data.feedback.trackingId}`,
        duration: 8000,
      });
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      addToast({
        type: 'error',
        title: 'Submission Failed',
        message: error.response?.data?.message || 'Failed to submit feedback',
      });
    },
  });
};

export const useUpdateFeedbackStatus = () => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: ({ id, status, note, assignedTo }: { id: string; status: string; note?: string; assignedTo?: string }) =>
      feedbackService.updateStatus(id, status, note, assignedTo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      addToast({ type: 'success', title: 'Status updated successfully' });
    },
    onError: () => {
      addToast({ type: 'error', title: 'Failed to update status' });
    },
  });
};

export const useDeleteFeedback = () => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: feedbackService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
      queryClient.invalidateQueries({ queryKey: ['my-feedbacks'] });
      addToast({ type: 'success', title: 'Feedback deleted' });
    },
    onError: () => {
      addToast({ type: 'error', title: 'Failed to delete feedback' });
    },
  });
};

export const useFeedbackStats = () => {
  return useQuery({
    queryKey: ['feedback-stats'],
    queryFn: feedbackService.getStats,
    select: (data) => data.data.data,
  });
};

export const useDownloadFeedbackPDF = () => {
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: async ({ id, trackingId }: { id: string; trackingId: string }) => {
      const response = await feedbackService.downloadPDF(id);
      const blob = new Blob([response.data as BlobPart], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `feedback-summary-${trackingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    onError: () => {
      addToast({ type: 'error', title: 'Failed to generate PDF summary' });
    },
  });
};
