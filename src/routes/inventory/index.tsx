import { createFileRoute } from '@tanstack/react-router';
import { InventoryList } from '@/components/inventory/InventoryList';

export const Route = createFileRoute('/inventory/')({
  component: InventoryList,
});
