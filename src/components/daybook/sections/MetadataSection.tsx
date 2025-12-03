import { type UseFormRegister, type FieldErrors } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldError } from '../daybook-form-helpers';
import { type DaybookFormData } from '../daybook-form-schema';

interface MetadataSectionProps {
  register: UseFormRegister<DaybookFormData>;
  errors: FieldErrors<DaybookFormData>;
}

export function MetadataSection({ register, errors }: MetadataSectionProps) {
  return (
    <div className="space-y-2">
      <div className="space-y-2">
        <Label htmlFor="date">Date *</Label>
        <Input id="date" type="date" {...register('date')} />
        <FieldError message={errors.date?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Input id="notes" placeholder="Additional notes or comments" {...register('notes')} />
      </div>
    </div>
  );
}
