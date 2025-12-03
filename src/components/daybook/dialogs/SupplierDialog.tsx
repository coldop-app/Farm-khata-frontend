/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateSupplier } from '@/hooks/useSuppliers';
import { toast } from 'sonner';

interface SupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSupplierCreated: (supplierId: string) => void;
}

export function SupplierDialog({ open, onOpenChange, onSupplierCreated }: SupplierDialogProps) {
  const { mutateAsync: createSupplier, isPending: isCreatingSupplier } = useCreateSupplier();
  const [supplierFormData, setSupplierFormData] = useState({ name: '', phone: '' });

  const handleCreateSupplier = async () => {
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
        onSupplierCreated(response.data._id);
        onOpenChange(false);
        setSupplierFormData({ name: '', phone: '' });
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as any)?.response?.data?.message ||
        (error as any)?.message ||
        'Failed to create supplier';
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSupplierFormData({ name: '', phone: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              onChange={(e) => setSupplierFormData({ ...supplierFormData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supplier-phone">Phone Number (Optional)</Label>
            <Input
              id="supplier-phone"
              placeholder="Enter phone number"
              value={supplierFormData.phone}
              onChange={(e) => setSupplierFormData({ ...supplierFormData, phone: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCreateSupplier}
            disabled={isCreatingSupplier || !supplierFormData.name.trim()}
          >
            {isCreatingSupplier ? 'Creating...' : 'Create Supplier'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
