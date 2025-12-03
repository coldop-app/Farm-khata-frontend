import { createFileRoute } from '@tanstack/react-router';
import { SupplierList } from '@/components/suppliers/SupplierList';

export const Route = createFileRoute('/suppliers/')({
  component: SupplierList,
});
