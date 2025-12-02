import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import type { DaybookEntry, PaginatedResponse, Supplier } from '@/api/types';

export const useDaybookEntries = (filters?: {
  type?: string;
  allocation?: string;
  supplier_id?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['daybook', filters],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<DaybookEntry>>(API_ENDPOINTS.daybook, {
        params: filters,
      });
      return data;
    },
  });
};

export const useDaybookEntry = (id: string) => {
  return useQuery({
    queryKey: ['daybook', id],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: DaybookEntry }>(
        API_ENDPOINTS.daybookById(id)
      );
      return data.data;
    },
    enabled: !!id,
  });
};

export const useCreateDaybookEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: Partial<DaybookEntry>) => {
      const { data } = await apiClient.post(API_ENDPOINTS.daybook, entry);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daybook'] });
    },
  });
};

export const useUpdateDaybookEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...entry }: Partial<DaybookEntry> & { id: string }) => {
      const { data } = await apiClient.put(API_ENDPOINTS.daybookById(id), entry);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['daybook'] });
      queryClient.invalidateQueries({ queryKey: ['daybook', variables.id] });
    },
  });
};

export const useDeleteDaybookEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(API_ENDPOINTS.daybookById(id));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daybook'] });
    },
  });
};

export const useDaybookSuppliers = () => {
  return useQuery({
    queryKey: ['daybook', 'suppliers'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: Supplier[] }>(
        API_ENDPOINTS.daybookSuppliers
      );
      return data.data;
    },
  });
};
