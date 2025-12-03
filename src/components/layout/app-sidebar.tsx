import { memo, useMemo } from 'react';
import { BookOpen, Package, Users, MapPin, Activity } from 'lucide-react';
import { useLocation, Link } from '@tanstack/react-router';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const navigationItems = [
  // { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Daybook', href: '/daybook', icon: BookOpen },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Suppliers', href: '/suppliers', icon: Users },
  { name: 'Lands', href: '/lands', icon: MapPin },
  { name: 'Activities', href: '/activities', icon: Activity },
];

const SidebarHeaderContent = memo(() => {
  return (
    <SidebarHeader>
      <div className="flex items-center gap-2 px-2 py-2">
        <h1 className="text-lg font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
          Farm Khata
          <span className="text-[10px] ml-1 font-medium text-muted-foreground">BETA</span>
        </h1>
      </div>
    </SidebarHeader>
  );
});
SidebarHeaderContent.displayName = 'SidebarHeaderContent';

const AppSidebar = () => {
  const { pathname } = useLocation();

  const navigationItemsWithState = useMemo(() => {
    return navigationItems.map((item) => {
      const isActive = pathname === item.href || pathname.startsWith(item.href);
      return { ...item, isActive };
    });
  }, [pathname]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeaderContent />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItemsWithState.map((item) => {
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={item.isActive} tooltip={item.name}>
                      <Link to={item.href}>
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default memo(AppSidebar);
