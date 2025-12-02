import { useParams, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useDaybookEntry, useDeleteDaybookEntry } from '@/hooks/useDaybook';
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

export function DaybookEntryView() {
  const { id } = useParams({ from: '/daybook/$id' });
  const navigate = useNavigate();
  const { data: entry, isLoading, error } = useDaybookEntry(id);
  const { mutateAsync: deleteEntry, isPending: isDeleting } = useDeleteDaybookEntry();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteEntry(id);
      toast.success('Daybook entry deleted successfully');
      setIsDeleteDialogOpen(false);
      navigate({ to: '/daybook' });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to delete entry';
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

  if (error || !entry) {
    return (
      <div className="container max-w-4xl mx-auto py-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold">Entry Not Found</h2>
              <p className="text-muted-foreground">
                The daybook entry you're looking for doesn't exist or has been deleted.
              </p>
              <Button onClick={() => navigate({ to: '/daybook' })} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Daybook
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Type guard for populated supplier
  const supplier = entry.supplier_id as any;
  const isSupplierObject = supplier && typeof supplier === 'object' && supplier.name;

  // Type guard for populated activity
  const activity = entry.linked_activity_id as any;
  const isActivityObject = activity && typeof activity === 'object' && activity.category;

  // Format date
  const formattedDate = entry.date ? format(new Date(entry.date), 'PPP') : 'N/A';
  const formattedDateTime = entry.date
    ? format(new Date(entry.date), 'PPP p')
    : 'N/A';

  return (
    <div className="container max-w-4xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/daybook' })}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Daybook
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/daybook/$id/edit', params: { id } })}
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
                  This action cannot be undone. This will permanently delete this daybook entry
                  and may affect related inventory and supplier records.
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
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Entry Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{entry.item_name}</CardTitle>
              <CardDescription className="mt-2">{formattedDateTime}</CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge
                variant={entry.type === 'cash_in' ? 'default' : 'outline'}
                className={
                  entry.type === 'cash_out'
                    ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400'
                    : ''
                }
              >
                {entry.type === 'cash_in' ? 'Cash In' : 'Cash Out'}
              </Badge>
              <div className="text-2xl font-bold">
                ₹{entry.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{formattedDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Type</p>
                <Badge variant="outline" className="mt-1">
                  {entry.payment_type === 'credit'
                    ? 'Credit'
                    : entry.payment_type === 'partial'
                      ? 'Partial'
                      : 'Full Payment'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Allocation</p>
                <Badge variant="secondary" className="mt-1">
                  {entry.allocation === 'farm_inputs'
                    ? 'Farm Inputs'
                    : entry.allocation === 'labour'
                      ? 'Labour'
                      : entry.allocation === 'sold_stock'
                        ? 'Sold Stock'
                        : 'Other'}
                </Badge>
              </div>
              {(entry.qty || entry.unit) && (
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="font-medium">
                    {entry.qty} {entry.unit}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Supplier Information (for cash_out) */}
          {entry.type === 'cash_out' && (isSupplierObject || entry.supplier_id) && (
            <>
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
                      <p className="font-medium font-mono text-sm">{entry.supplier_id}</p>
                    </div>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Buyer Information (for cash_in) */}
          {entry.type === 'cash_in' && entry.buyer && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-4">Buyer Information</h3>
                <div>
                  <p className="text-sm text-muted-foreground">Buyer Name</p>
                  <p className="font-medium">{entry.buyer}</p>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Inventory Lines (for farm_inputs) */}
          {entry.allocation === 'farm_inputs' && entry.inventory_lines && entry.inventory_lines.length > 0 && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-4">Inventory Details</h3>
                <div className="space-y-4">
                  {entry.inventory_lines.map((line: any, index: number) => {
                    const item = line.item_id;
                    const isItemObject = item && typeof item === 'object' && item.name;
                    return (
                      <Card key={index} className="bg-muted/50">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Item</p>
                              <p className="font-medium">
                                {isItemObject ? item.name : 'Unknown Item'}
                              </p>
                              {isItemObject && item.unit && (
                                <p className="text-xs text-muted-foreground">Unit: {item.unit}</p>
                              )}
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Quantity</p>
                              <p className="font-medium">{line.qty}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Unit Cost</p>
                              <p className="font-medium">
                                ₹{line.unit_cost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t">
                            <p className="text-sm text-muted-foreground">Line Total</p>
                            <p className="font-semibold">
                              ₹{(line.qty * line.unit_cost).toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                              })}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Sold Lines (for cash_in with sold_stock) */}
          {entry.allocation === 'sold_stock' &&
            entry.sold_lines &&
            entry.sold_lines.length > 0 && (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Sold Items</h3>
                  <div className="space-y-4">
                    {entry.sold_lines.map((line: any, index: number) => {
                      const item = line.item_id;
                      const isItemObject = item && typeof item === 'object' && item.name;
                      return (
                        <Card key={index} className="bg-muted/50">
                          <CardContent className="p-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Item</p>
                                <p className="font-medium">
                                  {isItemObject ? item.name : 'Unknown Item'}
                                </p>
                                {isItemObject && item.unit && (
                                  <p className="text-xs text-muted-foreground">Unit: {item.unit}</p>
                                )}
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Quantity</p>
                                <p className="font-medium">{line.qty}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
                <Separator />
              </>
            )}

          {/* Linked Activity */}
          {(isActivityObject || entry.linked_activity_id) && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-4">Linked Activity</h3>
                <div className="space-y-2">
                  {isActivityObject ? (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Category</p>
                        <p className="font-medium">{activity.category}</p>
                      </div>
                      {activity.date && (
                        <div>
                          <p className="text-sm text-muted-foreground">Activity Date</p>
                          <p className="font-medium">
                            {format(new Date(activity.date), 'PPP')}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div>
                      <p className="text-sm text-muted-foreground">Activity ID</p>
                      <p className="font-medium font-mono text-sm">{entry.linked_activity_id}</p>
                    </div>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Notes */}
          {entry.notes && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Notes</h3>
              <p className="text-sm whitespace-pre-wrap">{entry.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
