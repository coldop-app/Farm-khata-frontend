import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router';
import { InventoryItemView } from '@/components/inventory/InventoryItemView';

function InventoryIdComponent() {
  const location = useLocation();
  const isEditRoute = location.pathname.includes('/edit');

  if (isEditRoute) {
    return <Outlet />;
  }

  return <InventoryItemView />;
}

export const Route = createFileRoute('/inventory/$id')({
  component: InventoryIdComponent,
});
