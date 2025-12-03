import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSuppliers } from '@/hooks/useSuppliers';
import { columns, type Supplier } from './supplier-columns';
import { SupplierDataTable } from './supplier-data-table';

export function SupplierList() {
  const navigate = useNavigate();

  // Fetch all data - TanStack Table handles filtering/pagination client-side
  const { data, isLoading } = useSuppliers();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border border-border/40 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Suppliers</CardTitle>
          <CardAction>
            <Button onClick={() => navigate({ to: '/suppliers/new' })} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
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
            <SupplierDataTable
              columns={columns}
              data={(data?.data as Supplier[]) || []}
              navigate={navigate}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
