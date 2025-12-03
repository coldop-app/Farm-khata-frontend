import { useEffect, useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

// Hooks
import { useCreateDaybookEntry, useDaybookSuppliers } from '@/hooks/useDaybook';
import { useInventoryItems } from '@/hooks/useInventory';

// Schema and types
import { daybookFormSchema, type DaybookFormData } from './daybook-form-schema';

// Helper components
import { FieldError, Section } from './daybook-form-helpers';

// Section components
import { BasicSection } from './sections/BasicSection';
import { AllocationSection } from './sections/AllocationSection';
import { AmountSection } from './sections/AmountSection';
import { SupplierBuyerSection } from './sections/SupplierBuyerSection';
import { InventorySection } from './sections/InventorySection';
import { MetadataSection } from './sections/MetadataSection';

// Dialog components
import { SupplierDialog } from './dialogs/SupplierDialog';
import { InventoryDialog } from './dialogs/InventoryDialog';

export default function DaybookForm() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/daybook/new' });
  const { mutateAsync, isPending } = useCreateDaybookEntry();
  const { data: suppliers, isLoading: suppliersLoading } = useDaybookSuppliers();
  const { data: inventoryData, isLoading: inventoryLoading } = useInventoryItems({ limit: 1000 });

  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
  const [isInventoryDialogOpen, setIsInventoryDialogOpen] = useState(false);

  const initialType = (search?.type as 'cash_in' | 'cash_out' | undefined) || 'cash_out';

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<DaybookFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(daybookFormSchema as any) as any,
    defaultValues: {
      type: initialType,
      item_name: '',
      amount: null,
      qty: null,
      unit: null,
      payment_type: 'full',
      supplier_id: null,
      buyer: null,
      date: new Date().toISOString().split('T')[0],
      notes: null,
      inventory_item_id: null,
      inventory_qty: null,
      inventory_unit_cost: null,
    },
  });

  useEffect(() => {
    if (search?.type && (search.type === 'cash_in' || search.type === 'cash_out')) {
      setValue('type', search.type, { shouldValidate: true });
    }
  }, [search?.type, setValue]);

  const type = useWatch({ control, name: 'type' });
  const allocation = useWatch({ control, name: 'allocation' });
  const inventoryQty = useWatch({ control, name: 'inventory_qty' });
  const inventoryUnitCost = useWatch({ control, name: 'inventory_unit_cost' });

  useEffect(() => {
    if (allocation === 'farm_inputs' && inventoryQty && inventoryUnitCost) {
      setValue('amount', inventoryQty * inventoryUnitCost, { shouldValidate: true });
    }
  }, [allocation, inventoryQty, inventoryUnitCost, setValue]);

  useEffect(() => {
    if (allocation !== 'farm_inputs') {
      setValue('inventory_item_id', null, { shouldValidate: false });
      setValue('inventory_qty', null, { shouldValidate: false });
      setValue('inventory_unit_cost', null, { shouldValidate: false });
    }
  }, [allocation, setValue]);

  const onSubmit = async (data: DaybookFormData) => {
    try {
      let finalAmount = data.amount;

      if (data.type === 'cash_out' && data.allocation === 'farm_inputs') {
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
        if (!finalAmount || finalAmount <= 0) {
          toast.error('Please enter a valid amount greater than 0');
          return;
        }
      }

      const payload: {
        type: 'cash_in' | 'cash_out';
        item_name: string;
        amount: number;
        allocation: 'farm_inputs' | 'labour' | 'sold_stock' | 'other';
        date: string;
        payment_type: 'credit' | 'full' | 'partial';
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
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (error as { message?: string })?.message ||
        'Failed to create daybook entry';
      toast.error(errorMessage);
    }
  };

  const handleSupplierCreated = (supplierId: string) => {
    setValue('supplier_id', supplierId);
  };

  const handleInventoryCreated = (inventoryId: string) => {
    setValue('inventory_item_id', inventoryId, { shouldValidate: true });
  };

  const isFarmInputs = allocation === 'farm_inputs';
  const isCashOut = type === 'cash_out';

  return (
    <div className="container max-w-2xl mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Daybook Entry</CardTitle>
          <CardDescription>Record a new cash transaction</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit, (formErrors) => {
              const errorMessages = Object.values(formErrors)
                .map((err) => err?.message)
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
              <FieldError message={errors.type?.message} />
              {search?.type && (
                <p className="text-xs text-muted-foreground">
                  Transaction type is set based on the button you clicked
                </p>
              )}
            </div>

            {/* Basic Section */}
            <Section title="Basic Details">
              <BasicSection register={register} errors={errors} type={type} />
            </Section>

            {/* Allocation */}
            <Section title="Allocation">
              <AllocationSection control={control} errors={errors} />
            </Section>

            {/* Inventory (only for farm_inputs + cash_out) */}
            {isFarmInputs && isCashOut && (
              <Section title="Inventory Details">
                <InventorySection
                  control={control}
                  register={register}
                  setValue={setValue}
                  errors={errors}
                  inventoryData={inventoryData}
                  inventoryLoading={inventoryLoading}
                  openInventoryDialog={() => setIsInventoryDialogOpen(true)}
                />

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
              </Section>
            )}

            {/* Amount & Payment */}
            <Section title="Amount & Payment">
              <AmountSection
                register={register}
                errors={errors}
                allocation={allocation}
                inventoryQty={inventoryQty}
                inventoryUnitCost={inventoryUnitCost}
              />
            </Section>

            {/* Supplier / Buyer */}
            <Section title="Supplier / Buyer">
              <SupplierBuyerSection
                control={control}
                register={register}
                errors={errors}
                type={type}
                suppliers={suppliers}
                suppliersLoading={suppliersLoading}
                openSupplierDialog={() => setIsSupplierDialogOpen(true)}
              />
            </Section>

            {/* Metadata */}
            <Section title="Additional Information">
              <MetadataSection register={register} errors={errors} />
            </Section>

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

          {/* Supplier Dialog */}
          <SupplierDialog
            open={isSupplierDialogOpen}
            onOpenChange={setIsSupplierDialogOpen}
            onSupplierCreated={handleSupplierCreated}
          />

          {/* Inventory Dialog */}
          <InventoryDialog
            open={isInventoryDialogOpen}
            onOpenChange={setIsInventoryDialogOpen}
            onInventoryCreated={handleInventoryCreated}
          />
        </CardContent>
      </Card>
    </div>
  );
}
