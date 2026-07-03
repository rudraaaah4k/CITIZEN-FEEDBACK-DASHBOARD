import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../services/categoryService';

export const useCategories = (department?: string) => {
  return useQuery({
    queryKey: ['categories', department],
    queryFn: () => categoryService.getAll(department ? { department } : undefined),
    select: (data) => data.data.data.categories,
  });
};
