/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type Control,
  Controller,
  type UseFormRegister,
  type UseFormSetValue,
  type FieldErrors,
} from 'react-hook-form';
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
import { FieldError } from '../daybook-form-helpers';
import { type DaybookFormData } from '../daybook-form-schema';

interface InventorySectionProps {
  control: Control<DaybookFormData>;
  register: UseFormRegister<DaybookFormData>;
  setValue: UseFormSetValue<DaybookFormData>;
  errors: FieldErrors<DaybookFormData>;
  inventoryData: any;
  inventoryLoading: boolean;
  openInventoryDialog: () => void;
}

export function InventorySection({
  control,
  register,
  errors,
  inventoryData,
  inventoryLoading,
  openInventoryDialog,
}: InventorySectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="inventory_item_id">Inventory Item *</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={openInventoryDialog}
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
                inventoryData.data.map((item: any) => (
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

      <div className="grid grid-cols-2 gap-4">
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
          <FieldError message={errors.inventory_qty?.message} />
        </div>

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
          <FieldError message={errors.inventory_unit_cost?.message} />
        </div>
      </div>
    </div>
  );
}
