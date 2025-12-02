import { useParams, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useInventoryItem, useDeleteInventoryItem } from '@/hooks/useInventory';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function InventoryItemView() {
  const { id } = useParams({ from: '/inventory/$id' });
  const navigate = useNavigate();
  const { data: item, isLoading, error } = useInventoryItem(id);
  const { mutateAsync: deleteItem, isPending: isDeleting } = useDeleteInventoryItem();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteItem(id);
      toast.success('Inventory item deleted successfully');
      setIsDeleteDialogOpen(false);
      navigate({ to: '/inventory' });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to delete item';
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-6 space-y-6">
        <Skeleton className="h-10 w-32" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container max-w-4xl mx-auto py-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold">Item Not Found</h2>
              <p className="text-muted-foreground">
                The inventory item you're looking for doesn't exist or has been deleted.
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

  // Type guard for populated supplier
  const supplier = item.supplier_id as any;
  const isSupplierObject = supplier && typeof supplier === 'object' && supplier.name;

  // Format date
  const formattedLastPurchase = item.last_purchase
    ? format(new Date(item.last_purchase), 'PPP')
    : 'Never';

  return (
    <div className="container max-w-4xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate({ to: '/inventory' })} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Inventory
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/inventory/$id/edit', params: { id } })}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <Button
              variant="destructive"
              className="gap-2"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete this inventory item.
                  {item.total_qty > 0 && (
                    <span className="block mt-2 text-destructive font-semibold">
                      Warning: This item has {item.total_qty} {item.unit} in stock. You cannot
                      delete items with existing stock.
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting || item.total_qty > 0}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Item Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{item.name}</CardTitle>
              <CardDescription className="mt-2">
                {item.category && (
                  <Badge variant="secondary" className="mr-2">
                    {item.category}
                  </Badge>
                )}
                Inventory Item
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="text-2xl font-bold">
                {item.total_qty.toLocaleString('en-IN', { minimumFractionDigits: 2 })} {item.unit}
              </div>
              <div className="text-sm text-muted-foreground">In Stock</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{item.name}</p>
              </div>
              {item.category && (
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <Badge variant="secondary" className="mt-1">
                    {item.category}
                  </Badge>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Unit</p>
                <p className="font-medium">{item.unit}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Cost</p>
                <p className="font-medium">
                  ₹{item.avg_cost.toLocaleString('en-IN', { minimumFractionDigits: 2 })} per{' '}
                  {item.unit}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Quantity</p>
                <p className="font-medium">
                  {item.total_qty.toLocaleString('en-IN', { minimumFractionDigits: 2 })} {item.unit}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Purchase</p>
                <p className="font-medium">{formattedLastPurchase}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Supplier Information */}
          {(isSupplierObject || item.supplier_id) && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Supplier Information</h3>
              <div className="space-y-2">
                {isSupplierObject ? (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Supplier Name</p>
                      <p className="font-medium">{supplier.name}</p>
                    </div>
                    {supplier.phone && (
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{supplier.phone}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div>
                    <p className="text-sm text-muted-foreground">Supplier ID</p>
                    <p className="font-medium font-mono text-sm">{item.supplier_id}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Transaction History - if available */}
          {(item as any).transactions && (item as any).transactions.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
                <div className="space-y-2">
                  {(item as any).transactions.slice(0, 5).map((transaction: any, index: number) => (
                    <Card key={index} className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{transaction.item_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(transaction.date), 'PPP')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              ₹
                              {transaction.amount.toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                              })}
                            </p>
                            <Badge variant={transaction.type === 'cash_in' ? 'default' : 'outline'}>
                              {transaction.type === 'cash_in' ? 'Cash In' : 'Cash Out'}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
