import { Fragment } from 'react';
import { type UseFormRegister, type FieldErrors } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldError } from '../daybook-form-helpers';
import { type DaybookFormData } from '../daybook-form-schema';

interface AmountSectionProps {
  register: UseFormRegister<DaybookFormData>;
  errors: FieldErrors<DaybookFormData>;
  allocation: 'farm_inputs' | 'labour' | 'sold_stock' | 'other';
  inventoryQty: number | null | undefined;
  inventoryUnitCost: number | null | undefined;
}

export function AmountSection({
  register,
  errors,
  allocation,
  inventoryQty,
  inventoryUnitCost,
}: AmountSectionProps) {
  const isFarmInputs = allocation === 'farm_inputs';

  return (
    <Fragment>
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
          <FieldError message={errors.amount?.message} />
        </div>
      )}

      {isFarmInputs && inventoryQty && inventoryUnitCost && (
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
    </Fragment>
  );
}
