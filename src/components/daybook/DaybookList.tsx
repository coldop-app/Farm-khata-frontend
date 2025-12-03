import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDaybookEntries } from '@/hooks/useDaybook';
import { columns, type DaybookEntry } from './daybook-columns';
import { DaybookDataTable } from './daybook-data-table';

export function DaybookList() {
  const navigate = useNavigate();

  // Fetch all data - TanStack Table handles filtering/pagination client-side
  const { data, isLoading } = useDaybookEntries({
    type: '',
    allocation: '',
    page: 1,
    limit: 1000, // Fetch more data for client-side operations
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <Card className="border border-border/40 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Transaction Breakdown</CardTitle>
          <CardAction>
            <div className="flex gap-2">
              <Button
                onClick={() => navigate({ to: '/daybook/new', search: { type: 'cash_in' } })}
                size="sm"
                variant="default"
              >
                <Plus className="mr-2 h-4 w-4" />
                Cash In
              </Button>
              <Button
                onClick={() => navigate({ to: '/daybook/new', search: { type: 'cash_out' } })}
                size="sm"
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                Cash Out
              </Button>
            </div>
          </CardAction>
        </CardHeader>
      </Card>

      {/* Table */}
      <Card className="border border-border/40 shadow-sm">
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex gap-4">
                <Skeleton className="h-10 w-full max-w-sm" />
                <Skeleton className="h-10 w-[180px]" />
                <Skeleton className="h-10 w-[120px] ml-auto" />
              </div>
              <div className="border rounded-md">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-4 p-4 border-b last:border-b-0">
                    <Skeleton className="h-5 w-8" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-8 ml-auto" />
                  </div>
                ))}
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-5 w-32" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            </div>
          ) : (
            <DaybookDataTable
              columns={columns}
              data={(data?.data as DaybookEntry[]) || []}
              navigate={navigate}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
