import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { connectSocket, disconnectSocket } from '../lib/socket';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';

/**
 * Establishes the websocket connection for the authenticated user and keeps
 * relevant react-query caches (notifications, feedback lists, dashboard and
 * department analytics) fresh in real time instead of relying purely on polling.
 * Mounted once at the dashboard layout level so every authenticated page benefits.
 */
export const useRealtime = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, accessToken } = useAuthStore();
  const addToast = useUIStore((s) => s.addToast);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket();
    if (!socket) return;

    const onNotificationNew = (payload: { title: string; message: string }) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
      addToast({ type: 'info', title: payload.title, message: payload.message });
    };

    const onNotificationRead = () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    };

    const onFeedbackNew = () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['department-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['department-analytics-detail'] });
    };

    const onFeedbackUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      queryClient.invalidateQueries({ queryKey: ['my-feedbacks'] });
      queryClient.invalidateQueries({ queryKey: ['track-feedback'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['department-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['department-analytics-detail'] });
    };

    socket.on('notification:new', onNotificationNew);
    socket.on('notification:read', onNotificationRead);
    socket.on('notification:read-all', onNotificationRead);
    socket.on('feedback:new', onFeedbackNew);
    socket.on('feedback:updated', onFeedbackUpdated);

    return () => {
      socket.off('notification:new', onNotificationNew);
      socket.off('notification:read', onNotificationRead);
      socket.off('notification:read-all', onNotificationRead);
      socket.off('feedback:new', onFeedbackNew);
      socket.off('feedback:updated', onFeedbackUpdated);
    };
  }, [isAuthenticated, accessToken, queryClient, addToast]);
};

/**
 * Subscribes to real-time updates for one specific feedback item (feedback detail /
 * feedback summary pages), so status changes made elsewhere show up instantly.
 */
export const useFeedbackRealtime = (feedbackId: string | undefined) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!feedbackId) return;
    const socket = connectSocket();
    if (!socket) return;

    socket.emit('feedback:subscribe', feedbackId);

    const onUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ['feedback', feedbackId] });
    };

    socket.on('feedback:updated', onUpdated);

    return () => {
      socket.emit('feedback:unsubscribe', feedbackId);
      socket.off('feedback:updated', onUpdated);
    };
  }, [feedbackId, queryClient]);
};
