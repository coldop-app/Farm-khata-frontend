import { createFileRoute } from '@tanstack/react-router';
import { DaybookPage } from './-DaybookPage';

export const Route = createFileRoute('/daybook/')({
  component: DaybookPage,
});
