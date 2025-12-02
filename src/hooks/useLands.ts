import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import type { Land, PaginatedResponse } from '@/api/types';

export const useLands = (filters?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['lands', filters],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Land>>(API_ENDPOINTS.lands, {
        params: filters,
      });
      return data;
    },
  });
};

export const useLand = (id: string) => {
  return useQuery({
    queryKey: ['lands', id],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: Land }>(
        API_ENDPOINTS.landById(id)
      );
      return data.data;
    },
    enabled: !!id,
  });
};

export const useCreateLand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (land: Partial<Land>) => {
      const { data } = await apiClient.post(API_ENDPOINTS.lands, land);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lands'] });
    },
  });
};

export const useUpdateLand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...land }: Partial<Land> & { id: string }) => {
      const { data } = await apiClient.put(API_ENDPOINTS.landById(id), land);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lands'] });
    },
  });
};

export const useDeleteLand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(API_ENDPOINTS.landById(id));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lands'] });
    },
  });
};
