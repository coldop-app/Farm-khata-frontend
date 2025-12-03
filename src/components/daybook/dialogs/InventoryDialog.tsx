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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { useCreateInventoryItem } from '@/hooks/useInventory';
import { toast } from 'sonner';

interface InventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInventoryCreated: (inventoryId: string) => void;
}

export function InventoryDialog({ open, onOpenChange, onInventoryCreated }: InventoryDialogProps) {
  const { mutateAsync: createInventoryItem, isPending: isCreatingInventoryItem } =
    useCreateInventoryItem();

  const [inventoryFormData, setInventoryFormData] = useState({
    name: '',
    category: '',
    unit: 'kg',
  });

  const handleCreateInventory = async () => {
    if (!inventoryFormData.name.trim()) {
      toast.error('Item name is required');
      return;
    }
    if (!inventoryFormData.unit) {
      toast.error('Unit is required');
      return;
    }

    try {
      const payload: any = {
        name: inventoryFormData.name.trim(),
        unit: inventoryFormData.unit,
      };

      if (inventoryFormData.category.trim()) {
        payload.category = inventoryFormData.category.trim();
      }

      const response = await createInventoryItem(payload);

      if (response?.data?._id) {
        toast.success('Inventory item created successfully');
        onInventoryCreated(response.data._id);
        onOpenChange(false);

        // Reset form
        setInventoryFormData({
          name: '',
          category: '',
          unit: 'kg',
        });
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to create inventory item';
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setInventoryFormData({
      name: '',
      category: '',
      unit: 'kg',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Inventory Item</DialogTitle>
          <DialogDescription>
            Create a new inventory item to use in your daybook entries.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Item Name */}
          <div className="space-y-2">
            <Label htmlFor="inventory-name">Item Name *</Label>
            <Input
              id="inventory-name"
              placeholder="e.g., Urea, Seeds, Pesticide"
              value={inventoryFormData.name}
              onChange={(e) => setInventoryFormData({ ...inventoryFormData, name: e.target.value })}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="inventory-category">Category (Optional)</Label>
            <Input
              id="inventory-category"
              placeholder="e.g., Fertilizer, Seed, Pesticide"
              value={inventoryFormData.category}
              onChange={(e) =>
                setInventoryFormData({ ...inventoryFormData, category: e.target.value })
              }
            />
          </div>

          {/* Unit */}
          <div className="space-y-2">
            <Label htmlFor="inventory-unit">Unit *</Label>
            <Select
              value={inventoryFormData.unit}
              onValueChange={(value) => setInventoryFormData({ ...inventoryFormData, unit: value })}
            >
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
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleCreateInventory}
            disabled={
              isCreatingInventoryItem || !inventoryFormData.name.trim() || !inventoryFormData.unit
            }
          >
            {isCreatingInventoryItem ? 'Creating...' : 'Create Item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
