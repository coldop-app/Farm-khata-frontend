import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Farmer } from '@/api/types';
import { clearToken } from '@/lib/utils';

interface AuthState {
  farmer: Farmer | null;
  isAuthenticated: boolean;
  setFarmer: (farmer: Farmer | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      farmer: null,
      isAuthenticated: false,
      setFarmer: (farmer) => set({ farmer, isAuthenticated: !!farmer }),
      logout: () => {
        clearToken();
        set({ farmer: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
