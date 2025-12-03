import { createFileRoute } from '@tanstack/react-router';
import { SupplierForm } from '@/components/suppliers/SupplierForm';
import { useSupplier } from '@/hooks/useSuppliers';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

function SupplierEditComponent() {
  const { id } = useParams({ from: '/suppliers/$id/edit' });
  const navigate = useNavigate();
  const { data: supplier, isLoading } = useSupplier(id);
  const [defaultValues, setDefaultValues] = useState<Partial<any>>({});

  useEffect(() => {
    if (supplier) {
      setDefaultValues({
        name: supplier.name || '',
        phone: supplier.phone || '',
      });
    }
  }, [supplier]);

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

  if (!supplier) {
    return (
      <div className="container max-w-2xl mx-auto py-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold">Supplier Not Found</h2>
              <p className="text-muted-foreground">
                The supplier you're trying to edit doesn't exist or has been deleted.
              </p>
              <Button onClick={() => navigate({ to: '/suppliers' })} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Suppliers
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <SupplierForm supplierId={id} defaultValues={defaultValues} />;
}

export const Route = createFileRoute('/suppliers/$id/edit')({
  component: SupplierEditComponent,
});
