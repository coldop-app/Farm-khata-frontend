import { createFileRoute } from '@tanstack/react-router';
import { DaybookEditForm } from '@/components/daybook/DaybookEditForm';

export const Route = createFileRoute('/daybook/$id/edit')({
  component: DaybookEditForm,
});
