import { createFileRoute } from '@tanstack/react-router';
import { DaybookForm } from '@/components/daybook/DaybookForm';
import { z } from 'zod';

const daybookNewSearchSchema = z.object({
  type: z.enum(['cash_in', 'cash_out']).optional(),
});

export const Route = createFileRoute('/daybook/new')({
  validateSearch: daybookNewSearchSchema,
  component: () => <DaybookForm />,
});
