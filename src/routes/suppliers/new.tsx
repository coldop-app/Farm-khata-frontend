import { createFileRoute } from '@tanstack/react-router';
import { SupplierForm } from '@/components/suppliers/SupplierForm';

export const Route = createFileRoute('/suppliers/new')({
  component: () => <SupplierForm />,
});
