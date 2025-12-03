import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCreateSupplier, useUpdateSupplier } from '@/hooks/useSuppliers';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

// Form validation schema
const supplierFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
});

type SupplierFormData = z.infer<typeof supplierFormSchema>;

interface SupplierFormProps {
  supplierId?: string;
  defaultValues?: Partial<SupplierFormData>;
}

export function SupplierForm({ supplierId, defaultValues }: SupplierFormProps) {
  const navigate = useNavigate();
  const { mutateAsync: createSupplier, isPending: isCreating } = useCreateSupplier();
  const { mutateAsync: updateSupplier, isPending: isUpdating } = useUpdateSupplier();

  const isEditMode = !!supplierId;
  const isPending = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: defaultValues || {
      name: '',
      phone: '',
    },
  });

  const onSubmit = async (data: SupplierFormData) => {
    try {
      const payload: {
        name: string;
        phone?: string;
      } = {
        name: data.name.trim(),
      };

      if (data.phone && data.phone.trim()) {
        payload.phone = data.phone.trim();
      }

      if (isEditMode && supplierId) {
        await updateSupplier({ id: supplierId, ...payload });
        toast.success('Supplier updated successfully');
        navigate({ to: '/suppliers/$id', params: { id: supplierId } });
      } else {
        const response = await createSupplier(payload);
        toast.success('Supplier created successfully');
        if (response?.data?._id) {
          navigate({ to: '/suppliers/$id', params: { id: response.data._id } });
        } else {
          navigate({ to: '/suppliers' });
        }
      }
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Failed to save supplier';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate({ to: '/suppliers' })} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? 'Edit Supplier' : 'Add Supplier'}</CardTitle>
          <CardDescription>
            {isEditMode
              ? 'Update the supplier details'
              : 'Create a new supplier to track purchases and payments'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Supplier Name *</Label>
              <Input
                id="name"
                placeholder="e.g., ABC Seeds, XYZ Fertilizers"
                {...register('name')}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                placeholder="e.g., +91 9876543210"
                {...register('phone')}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/suppliers' })}
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
                    ? 'Update Supplier'
                    : 'Create Supplier'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
