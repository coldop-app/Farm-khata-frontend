import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useDaybookEntry,
  useUpdateDaybookEntry,
  useDaybookSuppliers,
} from '@/hooks/useDaybook';
import { useInventoryItems } from '@/hooks/useInventory';
import { useCreateSupplier } from '@/hooks/useSuppliers';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';

// Form validation schema - same as create form
const daybookFormSchema = z
  .object({
    type: z.enum(['cash_in', 'cash_out']),
    item_name: z.string().min(1, 'Item name is required'),
    amount: z.number().min(0.01, 'Amount must be greater than 0'),
    qty: z.number().optional(),
    unit: z.string().optional(),
    payment_type: z.enum(['credit', 'full', 'partial']).optional(),
    supplier_id: z.string().optional(),
    buyer: z.string().optional(),
    allocation: z.enum(['farm_inputs', 'labour', 'sold_stock', 'other']),
    date: z.string().min(1, 'Date is required'),
    notes: z.string().optional(),
    // For farm_inputs allocation - these are optional but validated conditionally
    inventory_item_id: z.string().optional(),
    inventory_qty: z.number().optional(),
    inventory_unit_cost: z.number().optional(),
  })
  .refine(
    (data) => {
      // If allocation is farm_inputs and type is cash_out, inventory fields are required
      if (data.type === 'cash_out' && data.allocation === 'farm_inputs') {
        return (
          data.inventory_item_id &&
          data.inventory_qty !== undefined &&
          data.inventory_qty !== null &&
          data.inventory_qty > 0 &&
          data.inventory_unit_cost !== undefined &&
          data.inventory_unit_cost !== null &&
          data.inventory_unit_cost > 0
        );
      }
      return true;
    },
    {
      message: 'All inventory fields are required for farm inputs allocation',
      path: ['inventory_item_id'],
    }
  );

type DaybookFormData = z.infer<typeof daybookFormSchema>;

export function DaybookEditForm() {
  const { id } = useParams({ from: '/daybook/$id/edit' });
  const navigate = useNavigate();
  const { data: entry, isLoading: isLoadingEntry, error } = useDaybookEntry(id);
  const { mutateAsync: updateEntry, isPending } = useUpdateDaybookEntry();
  const { data: suppliers, isLoading: suppliersLoading } = useDaybookSuppliers();
  const { data: inventoryData, isLoading: inventoryLoading } = useInventoryItems({ limit: 1000 });
  const { mutateAsync: createSupplier, isPending: isCreatingSupplier } = useCreateSupplier();
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
  const [supplierFormData, setSupplierFormData] = useState({ name: '', phone: '' });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<DaybookFormData>({
    // @ts-expect-error - Zod v4 type compatibility issue with @hookform/resolvers
    resolver: zodResolver(daybookFormSchema),
    defaultValues: {
      type: 'cash_out',
      item_name: '',
      amount: 0,
      qty: undefined,
      unit: 'kg',
      payment_type: 'full',
      supplier_id: undefined,
      buyer: '',
      allocation: 'other',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      inventory_item_id: '',
      inventory_qty: undefined,
      inventory_unit_cost: undefined,
    },
  });

  // Populate form when entry data loads
  useEffect(() => {
    if (entry) {
      // Handle supplier_id - could be string or populated object
      const supplierId =
        typeof entry.supplier_id === 'object' && entry.supplier_id !== null
          ? (entry.supplier_id as any)._id
          : entry.supplier_id;

      // Handle inventory_lines - extract first line if exists
      let inventoryItemId = '';
      let inventoryQty: number | undefined = undefined;
      let inventoryUnitCost: number | undefined = undefined;

      if (entry.inventory_lines && entry.inventory_lines.length > 0) {
        const firstLine = entry.inventory_lines[0] as any;
        inventoryItemId =
          typeof firstLine.item_id === 'object' && firstLine.item_id !== null
            ? firstLine.item_id._id
            : firstLine.item_id;
        inventoryQty = firstLine.qty;
        inventoryUnitCost = firstLine.unit_cost;
      }

      // Format date for input
      const entryDate = entry.date ? new Date(entry.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

      reset({
        type: entry.type,
        item_name: entry.item_name || '',
        amount: entry.amount || 0,
        qty: entry.qty || undefined,
        unit: entry.unit || 'kg',
        payment_type: entry.payment_type || 'full',
        supplier_id: supplierId || undefined,
        buyer: entry.buyer || '',
        allocation: entry.allocation || 'other',
        date: entryDate,
        notes: entry.notes || '',
        inventory_item_id: inventoryItemId || '',
        inventory_qty: inventoryQty,
        inventory_unit_cost: inventoryUnitCost,
      });
    }
  }, [entry, reset]);

  const type = watch('type');
  const allocation = watch('allocation');
  const inventoryQty = watch('inventory_qty');
  const inventoryUnitCost = watch('inventory_unit_cost');

  // Update amount when inventory fields change
  useEffect(() => {
    if (allocation === 'farm_inputs' && inventoryQty && inventoryUnitCost) {
      setValue('amount', inventoryQty * inventoryUnitCost, { shouldValidate: true });
    }
  }, [allocation, inventoryQty, inventoryUnitCost, setValue]);

  // Clear inventory fields when allocation changes away from farm_inputs
  useEffect(() => {
    if (allocation !== 'farm_inputs') {
      setValue('inventory_item_id', undefined, { shouldValidate: false });
      setValue('inventory_qty', undefined, { shouldValidate: false });
      setValue('inventory_unit_cost', undefined, { shouldValidate: false });
    }
  }, [allocation, setValue]);

  const onSubmit = async (data: DaybookFormData) => {
    try {
      // Validate amount
      if (!data.amount || data.amount <= 0) {
        toast.error('Please enter a valid amount greater than 0');
        return;
      }

      // Prepare the payload
      const payload: {
        type: 'cash_in' | 'cash_out';
        item_name: string;
        amount: number;
        allocation: 'farm_inputs' | 'labour' | 'sold_stock' | 'other';
        date: string;
        payment_type?: 'credit' | 'full' | 'partial';
        qty?: number;
        unit?: string;
        notes?: string;
        supplier_id?: string;
        buyer?: string;
        inventory_lines?: Array<{
          item_id: string;
          qty: number;
          unit_cost: number;
        }>;
      } = {
        type: data.type,
        item_name: data.item_name,
        amount: data.amount,
        allocation: data.allocation,
        date: new Date(data.date).toISOString(),
        payment_type: data.payment_type || 'full',
      };

      // Add optional fields
      if (data.qty !== undefined && data.qty !== null && !isNaN(data.qty)) payload.qty = data.qty;
      if (data.unit && data.unit.trim()) payload.unit = data.unit.trim();
      if (data.notes && data.notes.trim()) payload.notes = data.notes.trim();
      if (data.supplier_id && data.supplier_id.trim()) {
        payload.supplier_id = data.supplier_id.trim();
      }
      if (data.buyer && data.buyer.trim()) payload.buyer = data.buyer.trim();

      // Handle farm_inputs allocation - requires inventory_lines
      // Only for cash_out type (as per backend controller)
      if (data.type === 'cash_out' && data.allocation === 'farm_inputs') {
        if (!data.inventory_item_id || !data.inventory_qty || !data.inventory_unit_cost) {
          toast.error('Please fill in all inventory fields for farm inputs allocation');
          return;
        }
        payload.inventory_lines = [
          {
            item_id: data.inventory_item_id,
            qty: Number(data.inventory_qty),
            unit_cost: Number(data.inventory_unit_cost),
          },
        ];
      } else {
        // Clear inventory_lines if not farm_inputs
        payload.inventory_lines = [];
      }

      await updateEntry({ id, ...payload });
      toast.success('Daybook entry updated successfully');
      navigate({ to: '/daybook/$id', params: { id } });
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        'Failed to update daybook entry';
      toast.error(errorMessage);
    }
  };

  const isFarmInputs = allocation === 'farm_inputs';
  const isCashOut = type === 'cash_out';
  const isCashIn = type === 'cash_in';

  if (isLoadingEntry) {
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

  if (error || !entry) {
    return (
      <div className="container max-w-2xl mx-auto py-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold">Entry Not Found</h2>
              <p className="text-muted-foreground">
                The daybook entry you're trying to edit doesn't exist or has been deleted.
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

  return (
    <div className="container max-w-2xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/daybook/$id', params: { id } })}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Daybook Entry</CardTitle>
          <CardDescription>Update the daybook entry details</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(
              onSubmit,
              (errors) => {
                // Show validation errors
                console.log('Form validation errors:', errors);
                const errorMessages = Object.values(errors)
                  .map((error) => error?.message)
                  .filter(Boolean);
                if (errorMessages.length > 0) {
                  toast.error(errorMessages[0] || 'Please fix the form errors');
                } else {
                  toast.error('Please fill in all required fields');
                }
              }
            )}
            className="space-y-6"
            noValidate
          >
            {/* Transaction Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type *</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash_in">Cash In</SelectItem>
                      <SelectItem value="cash_out">Cash Out</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
            </div>

            {/* Item Name */}
            <div className="space-y-2">
              <Label htmlFor="item_name">
                {isCashIn ? 'Item Sold' : 'Item Name'} *
              </Label>
              <Input
                id="item_name"
                placeholder={isCashIn ? 'e.g., Wheat, Potatoes' : 'e.g., Fertilizer, Seeds'}
                {...register('item_name')}
              />
              {errors.item_name && (
                <p className="text-sm text-destructive">{errors.item_name.message}</p>
              )}
            </div>

            {/* Allocation */}
            <div className="space-y-2">
              <Label htmlFor="allocation">Allocation / Destination *</Label>
              <Controller
                name="allocation"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select allocation" />
                    </SelectTrigger>
                    <SelectContent>
                      {isCashOut && <SelectItem value="farm_inputs">Farm Inputs</SelectItem>}
                      {isCashOut && <SelectItem value="labour">Labour</SelectItem>}
                      {isCashIn && <SelectItem value="sold_stock">Sold Stock</SelectItem>}
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.allocation && (
                <p className="text-sm text-destructive">{errors.allocation.message}</p>
              )}
            </div>

            {/* Farm Inputs Section */}
            {isFarmInputs && isCashOut && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <h3 className="font-semibold text-sm">Inventory Details</h3>

                {/* Inventory Item */}
                <div className="space-y-2">
                  <Label htmlFor="inventory_item_id">Inventory Item *</Label>
                  <Controller
                    name="inventory_item_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={inventoryLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select inventory item" />
                        </SelectTrigger>
                        <SelectContent>
                          {inventoryData?.data && inventoryData.data.length > 0 ? (
                            inventoryData.data.map((item) => (
                              <SelectItem key={item._id} value={item._id}>
                                {item.name} ({item.unit})
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">
                              No inventory items available
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.inventory_item_id && (
                    <p className="text-sm text-destructive">
                      {errors.inventory_item_id.message}
                    </p>
                  )}
                </div>

                {/* Inventory Quantity */}
                <div className="space-y-2">
                  <Label htmlFor="inventory_qty">Quantity *</Label>
                  <Input
                    id="inventory_qty"
                    type="number"
                    step="0.01"
                    placeholder="Enter quantity"
                    {...register('inventory_qty', {
                      valueAsNumber: true,
                      validate: (value) => {
                        if (allocation === 'farm_inputs') {
                          if (!value || value <= 0) {
                            return 'Quantity is required and must be greater than 0';
                          }
                        }
                        return true;
                      },
                    })}
                  />
                  {errors.inventory_qty && (
                    <p className="text-sm text-destructive">{errors.inventory_qty.message}</p>
                  )}
                </div>

                {/* Unit Cost */}
                <div className="space-y-2">
                  <Label htmlFor="inventory_unit_cost">Unit Cost (₹) *</Label>
                  <Input
                    id="inventory_unit_cost"
                    type="number"
                    step="0.01"
                    placeholder="Enter cost per unit"
                    {...register('inventory_unit_cost', {
                      valueAsNumber: true,
                      validate: (value) => {
                        if (allocation === 'farm_inputs') {
                          if (!value || value <= 0) {
                            return 'Unit cost is required and must be greater than 0';
                          }
                        }
                        return true;
                      },
                    })}
                  />
                  {errors.inventory_unit_cost && (
                    <p className="text-sm text-destructive">
                      {errors.inventory_unit_cost.message}
                    </p>
                  )}
                </div>

                {/* Calculated Total */}
                {inventoryQty && inventoryUnitCost && (
                  <div className="space-y-2">
                    <Label>Total Amount</Label>
                    <Input
                      value={`₹ ${(inventoryQty * inventoryUnitCost).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`}
                      disabled
                      className="font-semibold"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Amount (for non-farm_inputs) */}
            {!isFarmInputs && (
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Enter amount"
                  {...register('amount', {
                    valueAsNumber: true,
                    required: 'Amount is required',
                    min: { value: 0.01, message: 'Amount must be greater than 0' },
                  })}
                />
                {errors.amount && (
                  <p className="text-sm text-destructive">{errors.amount.message}</p>
                )}
              </div>
            )}

            {/* Quantity and Unit (optional, for cash_in or other allocations) */}
            {!isFarmInputs && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qty">Quantity (Optional)</Label>
                  <Input
                    id="qty"
                    type="number"
                    step="0.01"
                    placeholder="Enter quantity"
                    {...register('qty', { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit (Optional)</Label>
                  <Input id="unit" placeholder="kg, litre, etc." {...register('unit')} />
                </div>
              </div>
            )}

            {/* Supplier (for cash_out) */}
            {isCashOut && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="supplier_id">Supplier (Optional)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSupplierDialogOpen(true)}
                    className="h-8"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Supplier
                  </Button>
                </div>
                <Controller
                  name="supplier_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={(value) => field.onChange(value || undefined)}
                      disabled={suppliersLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers && suppliers.length > 0 ? (
                          suppliers.map((supplier) => (
                            <SelectItem key={supplier._id} value={supplier._id}>
                              {supplier.name}
                              {supplier.phone && ` (${supplier.phone})`}
                              {supplier.outstanding_amount > 0 &&
                                ` - Outstanding: ₹${supplier.outstanding_amount.toLocaleString('en-IN')}`}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            No suppliers available
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}

            {/* Add Supplier Dialog */}
            <Dialog open={isSupplierDialogOpen} onOpenChange={setIsSupplierDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Supplier</DialogTitle>
                  <DialogDescription>
                    Create a new supplier to use in your daybook entries.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="supplier-name">Supplier Name *</Label>
                    <Input
                      id="supplier-name"
                      placeholder="Enter supplier name"
                      value={supplierFormData.name}
                      onChange={(e) =>
                        setSupplierFormData({ ...supplierFormData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplier-phone">Phone Number (Optional)</Label>
                    <Input
                      id="supplier-phone"
                      placeholder="Enter phone number"
                      value={supplierFormData.phone}
                      onChange={(e) =>
                        setSupplierFormData({ ...supplierFormData, phone: e.target.value })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsSupplierDialogOpen(false);
                      setSupplierFormData({ name: '', phone: '' });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={async () => {
                      if (!supplierFormData.name.trim()) {
                        toast.error('Supplier name is required');
                        return;
                      }

                      try {
                        const response = await createSupplier({
                          name: supplierFormData.name.trim(),
                          phone: supplierFormData.phone.trim() || undefined,
                        });

                        if (response?.data?._id) {
                          toast.success('Supplier created successfully');
                          setIsSupplierDialogOpen(false);
                          setSupplierFormData({ name: '', phone: '' });
                          // Select the newly created supplier
                          setValue('supplier_id', response.data._id);
                        }
                      } catch (error: unknown) {
                        const errorMessage =
                          (error as { response?: { data?: { message?: string } }; message?: string })
                            ?.response?.data?.message ||
                          (error as { message?: string })?.message ||
                          'Failed to create supplier';
                        toast.error(errorMessage);
                      }
                    }}
                    disabled={isCreatingSupplier || !supplierFormData.name.trim()}
                  >
                    {isCreatingSupplier ? 'Creating...' : 'Create Supplier'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Buyer (for cash_in) */}
            {isCashIn && (
              <div className="space-y-2">
                <Label htmlFor="buyer">Buyer (Optional)</Label>
                <Input
                  id="buyer"
                  placeholder="Enter buyer name"
                  {...register('buyer')}
                />
              </div>
            )}

            {/* Payment Type (for cash_out) */}
            {isCashOut && (
              <div className="space-y-2">
                <Label htmlFor="payment_type">Payment Type</Label>
                <Controller
                  name="payment_type"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full Payment</SelectItem>
                        <SelectItem value="credit">Credit</SelectItem>
                        <SelectItem value="partial">Partial Payment</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                {...register('date')}
              />
              {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                placeholder="Additional notes or comments"
                {...register('notes')}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/daybook/$id', params: { id } })}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="flex-1">
                {isPending ? 'Updating...' : 'Update Entry'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
