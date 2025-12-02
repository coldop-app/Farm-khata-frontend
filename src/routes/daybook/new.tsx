import { createFileRoute } from '@tanstack/react-router';
import { DaybookForm } from '@/components/daybook/DaybookForm';

export const Route = createFileRoute('/daybook/new')({
  component: () => <DaybookForm />,
});
