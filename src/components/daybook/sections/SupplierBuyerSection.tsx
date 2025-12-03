/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Control, Controller, type UseFormRegister, type FieldErrors } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { type DaybookFormData } from '../daybook-form-schema';

interface SupplierBuyerSectionProps {
  control: Control<DaybookFormData>;
  register: UseFormRegister<DaybookFormData>;
  errors: FieldErrors<DaybookFormData>;
  type: 'cash_in' | 'cash_out';
  suppliers: any[] | undefined;
  suppliersLoading: boolean;
  openSupplierDialog: () => void;
}

export function SupplierBuyerSection({
  control,
  register,
  type,
  suppliers,
  suppliersLoading,
  openSupplierDialog,
}: SupplierBuyerSectionProps) {
  const isCashOut = type === 'cash_out';
  const isCashIn = type === 'cash_in';

  return (
    <div className="space-y-4">
      {isCashOut && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="supplier_id">Supplier (Optional)</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openSupplierDialog}
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
                    suppliers.map((supplier: any) => (
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

      {isCashIn && (
        <div className="space-y-2">
          <Label htmlFor="buyer">Buyer (Optional)</Label>
          <Input id="buyer" placeholder="Enter buyer name" {...register('buyer')} />
        </div>
      )}

      {/* Payment Type for cash_out */}
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
    </div>
  );
}
