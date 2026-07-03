import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';
import { User } from '../types';
import { useUIStore } from '../stores/uiStore';

export const useUsers = (params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userService.getAll(params),
    select: (data) => ({ users: data.data.data.users, pagination: data.data.pagination }),
  });
};

export const useUser = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getById(id),
    enabled: enabled && !!id,
    select: (data) => data.data.data,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) => userService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      addToast({ type: 'success', title: 'User updated' });
    },
    onError: () => addToast({ type: 'error', title: 'Failed to update user' }),
  });
};

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();
  return useMutation({
    mutationFn: (id: string) => userService.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      addToast({ type: 'success', title: 'User status updated' });
    },
    onError: () => addToast({ type: 'error', title: 'Failed to update status' }),
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();
  return useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      addToast({ type: 'success', title: 'User deleted' });
    },
    onError: () => addToast({ type: 'error', title: 'Failed to delete user' }),
  });
};

export const useUserStats = () => {
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: userService.getStats,
    select: (data) => data.data.data,
  });
};
