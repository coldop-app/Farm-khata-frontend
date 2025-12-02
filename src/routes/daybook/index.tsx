import { createFileRoute } from '@tanstack/react-router';
import DaybookList from '@/components/daybook/DaybookList';

export const Route = createFileRoute('/daybook/')({
  component: DaybookList,
});
