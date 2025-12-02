import { memo, useMemo } from 'react';
import { User } from 'lucide-react';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { LogoutButton } from './logout-button';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '../ui/skeleton';
import { SidebarTrigger } from '@/components/ui/sidebar';

// TanStack Router
import { useLocation } from '@tanstack/react-router';

// Zustand store
import { useAuthStore } from '@/stores/authStore';

import { UserAvatar } from './user-avatar';
import type { Farmer } from '@/api/types';

interface UserMenuProps {
  farmer: Farmer;
}

const UserMenuComponent = ({ farmer }: UserMenuProps) => {
  return (
    <DropdownMenuContent align="end" className="w-56">
      <DropdownMenuLabel>
        <div className="flex items-center gap-3 py-2">
          <UserAvatar name={farmer.name} />
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold">{farmer.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{farmer.role}</p>
            <p className="text-xs text-muted-foreground">🇮🇳 +91 {farmer.mobileNumber}</p>
            {farmer.location && <p className="text-xs text-muted-foreground">{farmer.location}</p>}
          </div>
        </div>
      </DropdownMenuLabel>

      <DropdownMenuSeparator />

      <DropdownMenuItem>
        <User className="mr-2 h-4 w-4" />
        <span>Profile</span>
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem asChild>
        <LogoutButton variant="dropdown" />
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
};

const UserMenu = memo(UserMenuComponent);

// Static navbar parts that don't need to re-render on route changes
const NavbarStaticContentComponent = ({ farmer }: { farmer: Farmer }) => {
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex items-center space-x-4">
        <span className="text-sm text-muted-foreground">Welcome, {farmer.name}</span>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <UserAvatar name={farmer.name} />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>

          <UserMenu farmer={farmer} />
        </DropdownMenu>
      </div>

      {/* Mobile */}
      <div className="md:hidden flex items-center space-x-2">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <UserAvatar name={farmer.name} />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>

          <UserMenu farmer={farmer} />
        </DropdownMenu>
      </div>
    </>
  );
};

const NavbarStaticContent = memo(NavbarStaticContentComponent);

// Dynamic page title that updates on route changes
const PageTitleComponent = () => {
  const pathname = useLocation().pathname;

  const formatted = useMemo(() => {
    // Handle specific routes
    const routeMap: Record<string, string> = {
      '/': 'Dashboard',
      '/dashboard': 'Dashboard',
      '/daybook': 'Daybook',
      '/inventory': 'Inventory',
      '/suppliers': 'Suppliers',
      '/lands': 'Lands',
      '/activities': 'Activities',
      '/login': 'Login',
      '/register': 'Register',
    };

    if (routeMap[pathname]) {
      return routeMap[pathname];
    }

    // Fallback: format pathname
    const segments = pathname.split('/').filter(Boolean);
    const last = segments.at(-1) ?? '';

    return last
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }, [pathname]);

  return (
    <div className="ml-2 md:ml-6 md:pl-6 border-l border-border">
      <h1 className="text-2xl font-bold text-foreground tracking-tight">{formatted}</h1>
    </div>
  );
};

const PageTitle = memo(PageTitleComponent);

function Navbar() {
  // Zustand store - only subscribe to what we need
  const farmer = useAuthStore((state) => state.farmer);

  // Skeleton while farmer data is loading
  if (!farmer) {
    return (
      <nav className="sticky top-0 z-40 bg-background shadow-sm border-b border-border">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <SidebarTrigger />
            <div className="ml-2 md:ml-6 md:pl-6 border-l border-border">
              <Skeleton className="h-6 w-48 rounded-md" />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-40 bg-background shadow-sm border-b border-border">
      <div className="px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        {/* Left: Sidebar + page title */}
        <div className="flex items-center">
          <SidebarTrigger />
          <PageTitle />
        </div>

        <NavbarStaticContent farmer={farmer} />
      </div>
    </nav>
  );
}

const NavbarComponent = Navbar;

export default memo(NavbarComponent);
