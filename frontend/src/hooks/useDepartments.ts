import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { departmentService } from '../services/departmentService';
import { Department } from '../types';
import { useUIStore } from '../stores/uiStore';

export const useDepartments = (params?: { isActive?: boolean; search?: string }) => {
  return useQuery({
    queryKey: ['departments', params],
    queryFn: () => departmentService.getAll(params),
    select: (data) => data.data.data.departments,
  });
};

export const useDepartment = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['department', id],
    queryFn: () => departmentService.getById(id),
    enabled: enabled && !!id,
    select: (data) => data.data.data.department,
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();
  return useMutation({
    mutationFn: (data: Partial<Department>) => departmentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      addToast({ type: 'success', title: 'Department created' });
    },
    onError: () => addToast({ type: 'error', title: 'Failed to create department' }),
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Department> }) => departmentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      addToast({ type: 'success', title: 'Department updated' });
    },
    onError: () => addToast({ type: 'error', title: 'Failed to update department' }),
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();
  return useMutation({
    mutationFn: (id: string) => departmentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      addToast({ type: 'success', title: 'Department deleted' });
    },
    onError: () => addToast({ type: 'error', title: 'Failed to delete department' }),
  });
};
