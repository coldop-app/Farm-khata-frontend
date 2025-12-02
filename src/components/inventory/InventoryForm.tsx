import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from '@tanstack/react-router';
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
import { useCreateInventoryItem, useUpdateInventoryItem } from '@/hooks/useInventory';
import { useSuppliers, useCreateSupplier } from '@/hooks/useSuppliers';
import { toast } from 'sonner';
import { useState } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';

// Form validation schema
const inventoryFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().optional(),
  unit: z.string().min(1, 'Unit is required'),
  supplier_id: z.string().optional(),
});

type InventoryFormData = z.infer<typeof inventoryFormSchema>;

interface InventoryFormProps {
  itemId?: string;
  defaultValues?: Partial<InventoryFormData>;
}

export function InventoryForm({ itemId, defaultValues }: InventoryFormProps) {
  const navigate = useNavigate();
  const { mutateAsync: createItem, isPending: isCreating } = useCreateInventoryItem();
  const { mutateAsync: updateItem, isPending: isUpdating } = useUpdateInventoryItem();
  const { data: suppliersData, isLoading: suppliersLoading } = useSuppliers();
  const { mutateAsync: createSupplier, isPending: isCreatingSupplier } = useCreateSupplier();
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
  const [supplierFormData, setSupplierFormData] = useState({ name: '', phone: '' });

  const isEditMode = !!itemId;
  const isPending = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<InventoryFormData>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: defaultValues || {
      name: '',
      category: '',
      unit: 'kg',
      supplier_id: undefined,
    },
  });

  const onSubmit = async (data: InventoryFormData) => {
    try {
      const payload: {
        name: string;
        unit: string;
        category?: string;
        supplier_id?: string;
      } = {
        name: data.name.trim(),
        unit: data.unit,
      };

      if (data.category && data.category.trim()) {
        payload.category = data.category.trim();
      }

      if (data.supplier_id && data.supplier_id.trim()) {
        payload.supplier_id = data.supplier_id.trim();
      }

      if (isEditMode && itemId) {
        await updateItem({ id: itemId, ...payload });
        toast.success('Inventory item updated successfully');
        navigate({ to: '/inventory/$id', params: { id: itemId } });
      } else {
        const response = await createItem(payload);
        toast.success('Inventory item created successfully');
        if (response?.data?._id) {
          navigate({ to: '/inventory/$id', params: { id: response.data._id } });
        } else {
          navigate({ to: '/inventory' });
        }
      }
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Failed to save inventory item';
      toast.error(errorMessage);
    }
  };

  const suppliers = suppliersData?.data || [];

  return (
    <div className="container max-w-2xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate({ to: '/inventory' })} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? 'Edit Inventory Item' : 'Add Inventory Item'}</CardTitle>
          <CardDescription>
            {isEditMode
              ? 'Update the inventory item details'
              : 'Create a new inventory item to track your farm inputs'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Urea, NPK Fertilizer, Wheat Seeds"
                {...register('name')}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category (Optional)</Label>
              <Input
                id="category"
                placeholder="e.g., Fertilizer, Seed, Pesticide"
                {...register('category')}
              />
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>

            {/* Unit */}
            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Controller
                name="unit"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
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
                )}
              />
              {errors.unit && <p className="text-sm text-destructive">{errors.unit.message}</p>}
            </div>

            {/* Supplier */}
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
                      {suppliers.length > 0 ? (
                        suppliers.map((supplier) => (
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
                )}
              />
            </div>

            {/* Add Supplier Dialog */}
            <Dialog open={isSupplierDialogOpen} onOpenChange={setIsSupplierDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Supplier</DialogTitle>
                  <DialogDescription>
                    Create a new supplier to use in your inventory items.
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
                        const err = error as {
                          response?: { data?: { message?: string } };
                          message?: string;
                        };
                        const errorMessage =
                          err?.response?.data?.message || err?.message || 'Failed to create supplier';
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

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/inventory' })}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="flex-1">
                {isPending
                  ? isEditMode
                    ? 'Updating...'
                    : 'Creating...'
                  : isEditMode
                    ? 'Update Item'
                    : 'Create Item'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
