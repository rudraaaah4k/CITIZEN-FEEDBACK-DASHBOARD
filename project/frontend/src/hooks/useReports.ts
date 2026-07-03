import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reportService } from '../services/reportService';
import { useUIStore } from '../stores/uiStore';

export const useReports = () => {
  return useQuery({
    queryKey: ['reports'],
    queryFn: reportService.getAll,
    select: (data) => data.data.data.reports,
  });
};

export const useGenerateReport = () => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();
  return useMutation({
    mutationFn: reportService.generate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      addToast({ type: 'success', title: 'Report generated successfully' });
    },
    onError: () => addToast({ type: 'error', title: 'Failed to generate report' }),
  });
};

export const useDownloadReport = () => {
  const { addToast } = useUIStore();
  return useMutation({
    mutationFn: async ({ id, name, format }: { id: string; name: string; format: string }) => {
      const response = await reportService.download(id);
      const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${name}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
    onError: () => addToast({ type: 'error', title: 'Failed to download report' }),
  });
};

export const useDeleteReport = () => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();
  return useMutation({
    mutationFn: reportService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      addToast({ type: 'success', title: 'Report deleted' });
    },
  });
};
