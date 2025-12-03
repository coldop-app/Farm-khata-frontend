import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import type { Supplier, ApiResponse, SupplierPayment } from '@/api/types';

export const useSuppliers = (filters?: { search?: string }) => {
  return useQuery({
    queryKey: ['suppliers', filters],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Supplier[]>>(API_ENDPOINTS.suppliers, {
        params: filters,
      });
      return data;
    },
  });
};

export const useSupplier = (id: string) => {
  return useQuery({
    queryKey: ['suppliers', id],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: Supplier }>(
        API_ENDPOINTS.supplierById(id)
      );
      return data.data;
    },
    enabled: !!id,
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (supplier: Partial<Supplier>) => {
      const { data } = await apiClient.post(API_ENDPOINTS.suppliers, supplier);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['daybook', 'suppliers'] });
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...supplier }: Partial<Supplier> & { id: string }) => {
      const { data } = await apiClient.put(API_ENDPOINTS.supplierById(id), supplier);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(API_ENDPOINTS.supplierById(id));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
};

export const useSupplierPayments = (supplierId: string) => {
  return useQuery({
    queryKey: ['suppliers', supplierId, 'payments'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<SupplierPayment[]>>(
        API_ENDPOINTS.supplierPayments(supplierId)
      );
      return data;
    },
    enabled: !!supplierId,
  });
};

export const useMakeSupplierPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      supplierId,
      ...payment
    }: {
      supplierId: string;
      amount: number;
      date?: string;
      mode?: 'cash' | 'upi' | 'bank' | 'other';
      allocation_type?: 'auto' | 'manual';
      linked_purchase_ids?: string[];
      notes?: string;
    }) => {
      const { data } = await apiClient.post(API_ENDPOINTS.supplierPayments(supplierId), payment);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', variables.supplierId] });
      queryClient.invalidateQueries({ queryKey: ['suppliers', variables.supplierId, 'payments'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['daybook'] });
    },
  });
};
