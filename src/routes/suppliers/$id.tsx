import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router';
import { SupplierView } from '@/components/suppliers/SupplierView';

function SupplierIdComponent() {
  const location = useLocation();
  const isEditRoute = location.pathname.includes('/edit');

  if (isEditRoute) {
    return <Outlet />;
  }

  return <SupplierView />;
}

export const Route = createFileRoute('/suppliers/$id')({
  component: SupplierIdComponent,
});
