import { type UseFormRegister, type FieldErrors } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldError } from '../daybook-form-helpers';
import { type DaybookFormData } from '../daybook-form-schema';

interface BasicSectionProps {
  register: UseFormRegister<DaybookFormData>;
  errors: FieldErrors<DaybookFormData>;
  type: 'cash_in' | 'cash_out';
}

export function BasicSection({ register, errors, type }: BasicSectionProps) {
  const isCashIn = type === 'cash_in';
  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="space-y-2">
        <Label htmlFor="item_name">{isCashIn ? 'Item Sold' : 'Item Name'} *</Label>
        <Input
          id="item_name"
          placeholder={isCashIn ? 'e.g., Wheat, Potatoes' : 'e.g., Fertilizer, Seeds'}
          {...register('item_name')}
        />
        <FieldError message={errors.item_name?.message} />
      </div>

      {/* <div className="grid grid-cols-2 gap-4">
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
      </div> */}
    </div>
  );
}
