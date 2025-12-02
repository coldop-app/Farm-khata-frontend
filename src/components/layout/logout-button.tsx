import { LogOut } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface LogoutButtonProps {
  variant?: 'button' | 'dropdown';
  className?: string;
}

export function LogoutButton({ variant = 'button', className }: LogoutButtonProps) {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [isPending, setIsPending] = useState(false);

  const handleLogout = async () => {
    setIsPending(true);
    try {
      logout();
      navigate({ to: '/login' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsPending(false);
    }
  };

  if (variant === 'dropdown') {
    return (
      <Button
        variant="ghost"
        onClick={handleLogout}
        disabled={isPending}
        className={cn('w-full justify-start', className)}
      >
        <LogOut className="mr-2 h-4 w-4" />
        {isPending ? 'Signing out...' : 'Sign Out'}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      disabled={isPending}
      className={className}
    >
      <LogOut className="mr-2 h-4 w-4" />
      {isPending ? 'Signing out...' : 'Sign Out'}
    </Button>
  );
}
