import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import type { InventoryItem, PaginatedResponse } from '@/api/types';

export const useInventoryItems = (filters?: {
  category?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['inventory', filters],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<InventoryItem>>(
        API_ENDPOINTS.inventory,
        { params: filters }
      );
      return data;
    },
  });
};

export const useInventoryItem = (id: string) => {
  return useQuery({
    queryKey: ['inventory', id],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: InventoryItem }>(
        API_ENDPOINTS.inventoryById(id)
      );
      return data.data;
    },
    enabled: !!id,
  });
};

export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Partial<InventoryItem>) => {
      const { data } = await apiClient.post(API_ENDPOINTS.inventory, item);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...item }: Partial<InventoryItem> & { id: string }) => {
      const { data } = await apiClient.put(API_ENDPOINTS.inventoryById(id), item);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};

export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(API_ENDPOINTS.inventoryById(id));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};
