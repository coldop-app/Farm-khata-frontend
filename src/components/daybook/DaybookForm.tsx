import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearch } from '@tanstack/react-router';
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
import { useCreateDaybookEntry, useDaybookSuppliers } from '@/hooks/useDaybook';
import { useInventoryItems, useCreateInventoryItem } from '@/hooks/useInventory';
import { useCreateSupplier, useSuppliers } from '@/hooks/useSuppliers';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

// Form validation schema with improved validation
const daybookFormSchema = z
  .object({
    type: z.enum(['cash_in', 'cash_out']),
    item_name: z.string().min(1, 'Item name is required'),
    amount: z.number().positive('Amount must be greater than 0').optional().nullable(),
    qty: z.number().positive().optional().nullable(),
    unit: z.string().optional().nullable(),
    payment_type: z.enum(['credit', 'full', 'partial']).default('full'),
    supplier_id: z.string().optional().nullable(),
    buyer: z.string().optional().nullable(),
    allocation: z.enum(['farm_inputs', 'labour', 'sold_stock', 'other']),
    date: z.string().min(1, 'Date is required'),
    notes: z.string().optional().nullable(),
    // For farm_inputs allocation - make these nullable
    inventory_item_id: z.string().optional().nullable(),
    inventory_qty: z.number().positive().optional().nullable(),
    inventory_unit_cost: z.number().positive().optional().nullable(),
  })
  .refine(
    (data) => {
      // Only validate inventory fields for cash_out with farm_inputs allocation
      if (data.type === 'cash_out' && data.allocation === 'farm_inputs') {
        return (
          data.inventory_item_id != null &&
          data.inventory_item_id.trim() !== '' &&
          data.inventory_qty != null &&
          data.inventory_qty > 0 &&
          data.inventory_unit_cost != null &&
          data.inventory_unit_cost > 0
        );
      }
      return true;
    },
    {
      message: 'Inventory item, quantity, and unit cost are required for farm inputs',
      path: ['inventory_item_id'],
    }
  )
  .refine(
    (data) => {
      // For non-farm_inputs, ensure amount is provided
      if (data.type === 'cash_out' && data.allocation !== 'farm_inputs') {
        return data.amount != null && data.amount > 0;
      }
      if (data.type === 'cash_in') {
        return data.amount != null && data.amount > 0;
      }
      return true;
    },
    {
      message: 'Amount is required',
      path: ['amount'],
    }
  );

type DaybookFormData = z.infer<typeof daybookFormSchema>;

export function DaybookForm() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/daybook/new' });
  const { mutateAsync, isPending } = useCreateDaybookEntry();
  const { data: suppliers, isLoading: suppliersLoading } = useDaybookSuppliers();
  const { data: inventoryData, isLoading: inventoryLoading } = useInventoryItems({ limit: 1000 });
  const { mutateAsync: createSupplier, isPending: isCreatingSupplier } = useCreateSupplier();
  const { mutateAsync: createInventoryItem, isPending: isCreatingInventoryItem } =
    useCreateInventoryItem();
  const { data: suppliersData, isLoading: suppliersDataLoading } = useSuppliers();
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
  const [supplierFormData, setSupplierFormData] = useState({ name: '', phone: '' });
  const [isInventoryDialogOpen, setIsInventoryDialogOpen] = useState(false);
  const [inventoryFormData, setInventoryFormData] = useState({
    name: '',
    category: '',
    unit: 'kg',
    supplier_id: '',
  });

  // Get type from search params or default to cash_out
  const initialType = (search?.type as 'cash_in' | 'cash_out' | undefined) || 'cash_out';

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<DaybookFormData>({
    // @ts-expect-error - Zod v4 type compatibility issue with @hookform/resolvers
    resolver: zodResolver(daybookFormSchema),
    defaultValues: {
      type: initialType,
      item_name: '',
      amount: null,
      qty: null,
      unit: null,
      payment_type: 'full',
      supplier_id: null,
      buyer: null,
      allocation: 'other',
      date: new Date().toISOString().split('T')[0],
      notes: null,
      inventory_item_id: null,
      inventory_qty: null,
      inventory_unit_cost: null,
    },
  });

  // Update type when search params change
  useEffect(() => {
    if (search?.type && (search.type === 'cash_in' || search.type === 'cash_out')) {
      setValue('type', search.type, { shouldValidate: true });
    }
  }, [search?.type, setValue]);

  const type = useWatch({ control, name: 'type' });
  const allocation = useWatch({ control, name: 'allocation' });
  const inventoryQty = useWatch({ control, name: 'inventory_qty' });
  const inventoryUnitCost = useWatch({ control, name: 'inventory_unit_cost' });

  // Update amount when inventory fields change
  useEffect(() => {
    if (allocation === 'farm_inputs' && inventoryQty && inventoryUnitCost) {
      setValue('amount', inventoryQty * inventoryUnitCost, { shouldValidate: true });
    }
  }, [allocation, inventoryQty, inventoryUnitCost, setValue]);

  // Clear inventory fields when allocation changes away from farm_inputs
  useEffect(() => {
    if (allocation !== 'farm_inputs') {
      setValue('inventory_item_id', null, { shouldValidate: false });
      setValue('inventory_qty', null, { shouldValidate: false });
      setValue('inventory_unit_cost', null, { shouldValidate: false });
    }
  }, [allocation, setValue]);

  const onSubmit = async (data: DaybookFormData) => {
    try {
      // Calculate final amount
      let finalAmount = data.amount;

      // For farm_inputs, amount is calculated from inventory fields
      if (data.type === 'cash_out' && data.allocation === 'farm_inputs') {
        // Amount should be calculated from inventory_qty * inventory_unit_cost
        if (data.inventory_qty && data.inventory_unit_cost) {
          finalAmount = data.inventory_qty * data.inventory_unit_cost;
          if (finalAmount <= 0) {
            toast.error('Please enter valid inventory quantity and unit cost');
            return;
          }
        } else {
          toast.error('Please fill in all inventory fields for farm inputs allocation');
          return;
        }
      } else {
        // Validate amount for non-farm_inputs
        if (!finalAmount || finalAmount <= 0) {
          toast.error('Please enter a valid amount greater than 0');
          return;
        }
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
        item_name: data.item_name.trim(),
        amount: finalAmount,
        allocation: data.allocation,
        date: new Date(data.date).toISOString(),
        payment_type: data.payment_type || 'full',
      };

      // Add optional fields - only include if they have valid values
      if (data.qty != null && data.qty > 0) {
        payload.qty = data.qty;
      }
      if (data.unit && typeof data.unit === 'string' && data.unit.trim()) {
        payload.unit = data.unit.trim();
      }
      if (data.notes && typeof data.notes === 'string' && data.notes.trim()) {
        payload.notes = data.notes.trim();
      }
      if (data.supplier_id && typeof data.supplier_id === 'string' && data.supplier_id.trim()) {
        payload.supplier_id = data.supplier_id.trim();
      }
      if (data.buyer && typeof data.buyer === 'string' && data.buyer.trim()) {
        payload.buyer = data.buyer.trim();
      }

      // Handle farm_inputs allocation - requires inventory_lines
      // Only for cash_out type (as per backend controller)
      if (data.type === 'cash_out' && data.allocation === 'farm_inputs') {
        if (
          !data.inventory_item_id ||
          data.inventory_item_id.trim() === '' ||
          data.inventory_qty == null ||
          data.inventory_qty <= 0 ||
          data.inventory_unit_cost == null ||
          data.inventory_unit_cost <= 0
        ) {
          toast.error('Please fill in all inventory fields for farm inputs allocation');
          return;
        }
        payload.inventory_lines = [
          {
            item_id: data.inventory_item_id.trim(),
            qty: Number(data.inventory_qty),
            unit_cost: Number(data.inventory_unit_cost),
          },
        ];
      }

      await mutateAsync(payload);
      toast.success('Daybook entry created successfully');
      navigate({ to: '/daybook' });
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data
          ?.message ||
        (error as { message?: string })?.message ||
        'Failed to create daybook entry';
      toast.error(errorMessage);
    }
  };

  const isFarmInputs = allocation === 'farm_inputs';
  const isCashOut = type === 'cash_out';
  const isCashIn = type === 'cash_in';

  return (
    <div className="container max-w-2xl mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Daybook Entry</CardTitle>
          <CardDescription>Record a new cash transaction</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            // @ts-expect-error - Type inference issue with react-hook-form and zod resolver
            onSubmit={handleSubmit(onSubmit, (errors) => {
              // Show validation errors
              const errorMessages = Object.values(errors)
                .map((error) => error?.message)
                .filter(Boolean);
              if (errorMessages.length > 0) {
                toast.error(errorMessages[0] || 'Please fix the form errors');
              } else {
                toast.error('Please fill in all required fields');
              }
            })}
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
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!!search?.type}
                  >
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
              {search?.type && (
                <p className="text-xs text-muted-foreground">
                  Transaction type is set based on the button you clicked
                </p>
              )}
            </div>

            {/* Item Name */}
            <div className="space-y-2">
              <Label htmlFor="item_name">{isCashIn ? 'Item Sold' : 'Item Name'} *</Label>
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="inventory_item_id">Inventory Item *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsInventoryDialogOpen(true)}
                      className="h-8"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </div>
                  <Controller
                    name="inventory_item_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || ''}
                        onValueChange={(value) => field.onChange(value || null)}
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
                    <p className="text-sm text-destructive">{errors.inventory_item_id.message}</p>
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
                      setValueAs: (v) => (v === '' || v === null ? null : parseFloat(v)),
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
                      setValueAs: (v) => (v === '' || v === null ? null : parseFloat(v)),
                    })}
                  />
                  {errors.inventory_unit_cost && (
                    <p className="text-sm text-destructive">{errors.inventory_unit_cost.message}</p>
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
                    setValueAs: (v) => (v === '' || v === null ? null : parseFloat(v)),
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
                    {...register('qty', {
                      setValueAs: (v) => (v === '' || v === null ? null : parseFloat(v)),
                    })}
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
                      onValueChange={(value) => field.onChange(value || null)}
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
                          (
                            error as {
                              response?: { data?: { message?: string } };
                              message?: string;
                            }
                          )?.response?.data?.message ||
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
                <Input id="buyer" placeholder="Enter buyer name" {...register('buyer')} />
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
              <Input id="date" type="date" {...register('date')} />
              {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input id="notes" placeholder="Additional notes or comments" {...register('notes')} />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/daybook' })}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="flex-1">
                {isPending ? 'Creating...' : 'Create Entry'}
              </Button>
            </div>
          </form>

          {/* Add Inventory Item Dialog */}
          <Dialog open={isInventoryDialogOpen} onOpenChange={setIsInventoryDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Inventory Item</DialogTitle>
                <DialogDescription>
                  Create a new inventory item to use in your daybook entries.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="inventory-name">Item Name *</Label>
                  <Input
                    id="inventory-name"
                    placeholder="e.g., Urea, NPK Fertilizer, Wheat Seeds"
                    value={inventoryFormData.name}
                    onChange={(e) =>
                      setInventoryFormData({ ...inventoryFormData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inventory-category">Category (Optional)</Label>
                  <Input
                    id="inventory-category"
                    placeholder="e.g., Fertilizer, Seed, Pesticide"
                    value={inventoryFormData.category}
                    onChange={(e) =>
                      setInventoryFormData({ ...inventoryFormData, category: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inventory-unit">Unit *</Label>
                  <Select
                    value={inventoryFormData.unit}
                    onValueChange={(value) =>
                      setInventoryFormData({ ...inventoryFormData, unit: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg (Kilogram)</SelectItem>
                      <SelectItem value="g">g (Gram)</SelectItem>
                      <SelectItem value="litre">Litre</SelectItem>
                      <SelectItem value="ml">ml (Milliliter)</SelectItem>
                      <SelectItem value="nos">Nos (Numbers)</SelectItem>
                      <SelectItem value="packet">Packet</SelectItem>
                      <SelectItem value="bag">Bag</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="inventory-supplier">Supplier (Optional)</Label>
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
                  <Select
                    value={inventoryFormData.supplier_id || undefined}
                    onValueChange={(value) =>
                      setInventoryFormData({ ...inventoryFormData, supplier_id: value || '' })
                    }
                    disabled={suppliersDataLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliersData?.data && suppliersData.data.length > 0 ? (
                        suppliersData.data.map((supplier) => (
                          <SelectItem key={supplier._id} value={supplier._id}>
                            {supplier.name}
                            {supplier.phone && ` (${supplier.phone})`}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          No suppliers available
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsInventoryDialogOpen(false);
                    setInventoryFormData({
                      name: '',
                      category: '',
                      unit: 'kg',
                      supplier_id: '',
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={async () => {
                    if (!inventoryFormData.name.trim()) {
                      toast.error('Item name is required');
                      return;
                    }
                    if (!inventoryFormData.unit) {
                      toast.error('Unit is required');
                      return;
                    }

                    try {
                      const payload: {
                        name: string;
                        unit: string;
                        category?: string;
                        supplier_id?: string;
                      } = {
                        name: inventoryFormData.name.trim(),
                        unit: inventoryFormData.unit,
                      };

                      if (inventoryFormData.category && inventoryFormData.category.trim()) {
                        payload.category = inventoryFormData.category.trim();
                      }

                      if (inventoryFormData.supplier_id && inventoryFormData.supplier_id.trim()) {
                        payload.supplier_id = inventoryFormData.supplier_id.trim();
                      }

                      const response = await createInventoryItem(payload);

                      if (response?.data?._id) {
                        toast.success('Inventory item created successfully');
                        setIsInventoryDialogOpen(false);
                        setInventoryFormData({
                          name: '',
                          category: '',
                          unit: 'kg',
                          supplier_id: '',
                        });
                        // Select the newly created inventory item
                        setValue('inventory_item_id', response.data._id, {
                          shouldValidate: true,
                        });
                      }
                    } catch (error: unknown) {
                      const errorMessage =
                        (
                          error as {
                            response?: { data?: { message?: string } };
                            message?: string;
                          }
                        )?.response?.data?.message ||
                        (error as { message?: string })?.message ||
                        'Failed to create inventory item';
                      toast.error(errorMessage);
                    }
                  }}
                  disabled={
                    isCreatingInventoryItem ||
                    !inventoryFormData.name.trim() ||
                    !inventoryFormData.unit
                  }
                >
                  {isCreatingInventoryItem ? 'Creating...' : 'Create Item'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
