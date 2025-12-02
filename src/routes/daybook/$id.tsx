import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router';
import { DaybookEntryView } from '@/components/daybook/DaybookEntryView';

function DaybookIdComponent() {
  const location = useLocation();
  const isEditRoute = location.pathname.includes('/edit');

  if (isEditRoute) {
    return <Outlet />;
  }

  return <DaybookEntryView />;
}

export const Route = createFileRoute('/daybook/$id')({
  component: DaybookIdComponent,
});
