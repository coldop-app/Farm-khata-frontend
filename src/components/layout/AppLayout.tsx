import { Outlet, useNavigate, useLocation } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/authStore';
import { useEffect } from 'react';
import { isTokenExpired, clearToken } from '@/lib/utils';
import { toast } from 'sonner';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from './app-sidebar';
import Navbar from './navbar';

export function AppLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check token expiration
    if (isTokenExpired() && isAuthenticated) {
      clearToken();
      logout();
      toast.error('Your session has expired. Please login again.');
      navigate({ to: '/login' });
      return;
    }

    const publicRoutes = ['/login', '/register'];
    if (!isAuthenticated && !publicRoutes.includes(location.pathname)) {
      navigate({ to: '/login' });
    }
  }, [isAuthenticated, location.pathname, navigate, logout]);

  const publicRoutes = ['/login', '/register'];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  if (!isAuthenticated && isPublicRoute) {
    return <Outlet />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Navbar />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
