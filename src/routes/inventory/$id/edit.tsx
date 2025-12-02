import { createFileRoute } from '@tanstack/react-router';
import { InventoryForm } from '@/components/inventory/InventoryForm';
import { useInventoryItem } from '@/hooks/useInventory';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

function InventoryEditComponent() {
  const { id } = useParams({ from: '/inventory/$id/edit' });
  const navigate = useNavigate();
  const { data: item, isLoading } = useInventoryItem(id);
  const [defaultValues, setDefaultValues] = useState<Partial<any>>({});

  useEffect(() => {
    if (item) {
      const supplierId =
        typeof item.supplier_id === 'object' && item.supplier_id !== null
          ? (item.supplier_id as any)._id
          : item.supplier_id;

      setDefaultValues({
        name: item.name || '',
        category: item.category || '',
        unit: item.unit || 'kg',
        supplier_id: supplierId || undefined,
      });
    }
  }, [item]);

  if (isLoading) {
    return (
      <div className="container max-w-2xl mx-auto py-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container max-w-2xl mx-auto py-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold">Item Not Found</h2>
              <p className="text-muted-foreground">
                The inventory item you're trying to edit doesn't exist or has been deleted.
              </p>
              <Button onClick={() => navigate({ to: '/inventory' })} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Inventory
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <InventoryForm itemId={id} defaultValues={defaultValues} />;
}

export const Route = createFileRoute('/inventory/$id/edit')({
  component: InventoryEditComponent,
});
