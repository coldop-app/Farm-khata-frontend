import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <h1>Welcome to Farm Khata Dashboard</h1>
    </div>
  );
}
