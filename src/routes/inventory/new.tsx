import { createFileRoute } from '@tanstack/react-router';
import { InventoryForm } from '@/components/inventory/InventoryForm';

export const Route = createFileRoute('/inventory/new')({
  component: () => <InventoryForm />,
});
