import { useParams, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowLeft, Edit, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useSupplier, useDeleteSupplier, useMakeSupplierPayment } from '@/hooks/useSuppliers';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { DaybookEntry, SupplierPayment } from '@/api/types';

const paymentFormSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
  mode: z.enum(['cash', 'upi', 'bank', 'other']),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

export function SupplierView() {
  const { id } = useParams({ from: '/suppliers/$id' });
  const navigate = useNavigate();
  const { data: supplier, isLoading, error } = useSupplier(id);
  const { mutateAsync: deleteSupplier, isPending: isDeleting } = useDeleteSupplier();
  const { mutateAsync: makePayment, isPending: isMakingPayment } = useMakeSupplierPayment();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      mode: 'cash',
      notes: '',
    },
  });

  const handleDelete = async () => {
    try {
      await deleteSupplier(id);
      toast.success('Supplier deleted successfully');
      setIsDeleteDialogOpen(false);
      navigate({ to: '/suppliers' });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to delete supplier';
      toast.error(errorMessage);
    }
  };

  const handlePaymentSubmit = async (data: PaymentFormData) => {
    try {
      await makePayment({
        supplierId: id,
        amount: data.amount,
        date: data.date,
        mode: data.mode,
        notes: data.notes,
      });
      toast.success('Payment recorded successfully');
      setIsPaymentDialogOpen(false);
      reset();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to record payment';
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

  if (error || !supplier) {
    return (
      <div className="container max-w-4xl mx-auto py-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold">Supplier Not Found</h2>
              <p className="text-muted-foreground">
                The supplier you're looking for doesn't exist or has been deleted.
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

  const purchases = supplier.purchases_detail || [];
  const payments = supplier.payments_detail || [];
  const totalPurchases = supplier.total_purchases || 0;
  const totalPaid = supplier.total_paid || 0;
  const outstanding = supplier.outstanding_amount || 0;

  return (
    <div className="container max-w-4xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/suppliers' })}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Suppliers
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsPaymentDialogOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Make Payment
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/suppliers/$id/edit', params: { id } })}
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
                  This action cannot be undone. This will permanently delete this supplier.
                  {outstanding > 0 && (
                    <span className="block mt-2 text-destructive font-semibold">
                      Warning: This supplier has an outstanding amount of ₹
                      {outstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}. You
                      cannot delete suppliers with outstanding amounts.
                    </span>
                  )}
                  {(purchases.length > 0 || payments.length > 0) && (
                    <span className="block mt-2 text-destructive font-semibold">
                      Warning: This supplier has transaction history. You cannot delete suppliers
                      with transactions.
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
                  disabled={isDeleting || outstanding > 0 || purchases.length > 0 || payments.length > 0}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Supplier Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{supplier.name}</CardTitle>
              <CardDescription className="mt-2">
                {supplier.phone && <span className="mr-4">Phone: {supplier.phone}</span>}
                Supplier Details
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="text-2xl font-bold">
                ₹{outstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-muted-foreground">Outstanding</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Purchases</p>
                <p className="font-semibold text-lg">
                  ₹{totalPurchases.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="font-semibold text-lg text-green-600 dark:text-green-400">
                  ₹{totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Outstanding Amount</p>
                <p className="font-semibold text-lg">
                  {outstanding > 0 ? (
                    <Badge variant="destructive" className="text-lg px-3 py-1">
                      ₹{outstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      ₹{outstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Badge>
                  )}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Purchases History */}
          {purchases.length > 0 && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-4">Purchase History</h3>
                <div className="space-y-2">
                  {purchases.map((purchase: DaybookEntry) => (
                    <Card key={purchase._id} className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{purchase.item_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(purchase.date), 'PPP')}
                            </p>
                            {purchase.payment_type && (
                              <Badge variant="outline" className="mt-1">
                                {purchase.payment_type === 'credit'
                                  ? 'Credit'
                                  : purchase.payment_type === 'partial'
                                    ? 'Partial'
                                    : 'Full Payment'}
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              ₹{purchase.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Payment History */}
          {payments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Payment History</h3>
              <div className="space-y-2">
                {payments.map((payment: SupplierPayment) => (
                  <Card key={payment._id} className="bg-green-50 dark:bg-green-950/20">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            Payment via {payment.mode?.toUpperCase() || 'Cash'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(payment.date), 'PPP')}
                          </p>
                          {payment.allocation_type && (
                            <Badge variant="outline" className="mt-1">
                              {payment.allocation_type === 'auto' ? 'Auto Allocated' : 'Manual'}
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600 dark:text-green-400">
                            ₹{payment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {purchases.length === 0 && payments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No transactions yet</p>
              <p className="text-sm mt-2">Purchases and payments will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make Payment to {supplier.name}</DialogTitle>
            <DialogDescription>
              Record a payment to this supplier. The payment will be automatically allocated to
              oldest pending invoices (FIFO).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handlePaymentSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('amount', { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input id="date" type="date" {...register('date')} />
              {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mode">Payment Mode *</Label>
              <Controller
                name="mode"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.mode && <p className="text-sm text-destructive">{errors.mode.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input id="notes" placeholder="Payment notes..." {...register('notes')} />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsPaymentDialogOpen(false);
                  reset();
                }}
                disabled={isMakingPayment}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isMakingPayment}>
                {isMakingPayment ? 'Processing...' : 'Record Payment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
