import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import type { Activity, PaginatedResponse } from '@/api/types';

export const useActivities = (filters?: { land_id?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['activities', filters],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Activity>>(API_ENDPOINTS.activities, {
        params: filters,
      });
      return data;
    },
  });
};

export const useActivity = (id: string) => {
  return useQuery({
    queryKey: ['activities', id],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: Activity }>(
        API_ENDPOINTS.activityById(id)
      );
      return data.data;
    },
    enabled: !!id,
  });
};

export const useCreateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activity: Partial<Activity>) => {
      const { data } = await apiClient.post(API_ENDPOINTS.activities, activity);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['lands'] });
    },
  });
};

export const useUpdateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...activity }: Partial<Activity> & { id: string }) => {
      const { data } = await apiClient.put(API_ENDPOINTS.activityById(id), activity);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['lands'] });
    },
  });
};

export const useDeleteActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(API_ENDPOINTS.activityById(id));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['lands'] });
    },
  });
};
