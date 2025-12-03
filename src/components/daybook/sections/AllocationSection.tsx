import { type Control, Controller, type FieldErrors } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { FieldError } from '../daybook-form-helpers';
import { type DaybookFormData } from '../daybook-form-schema';

interface AllocationSectionProps {
  control: Control<DaybookFormData>;
  errors: FieldErrors<DaybookFormData>;
}

export function AllocationSection({ control, errors }: AllocationSectionProps) {
  return (
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
              <SelectItem value="farm_inputs">Farm Inputs</SelectItem>
              <SelectItem value="labour">Labour</SelectItem>
              <SelectItem value="sold_stock">Sold Stock</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
      <FieldError message={errors.allocation?.message} />
    </div>
  );
}
