import { z } from 'zod';

export const daybookFormSchema = z
  .object({
    type: z.enum(['cash_in', 'cash_out']),
    item_name: z.string().min(1, 'Item name is required'),
    amount: z.number().positive('Amount must be greater than 0').optional().nullable(),
    qty: z.number().positive().optional().nullable(),
    unit: z.string().optional().nullable(),
    payment_type: z.enum(['credit', 'full', 'partial']).default('full'),
    supplier_id: z.string().optional().nullable(),
    buyer: z.string().optional().nullable(),
    allocation: z.enum(['farm_inputs', 'labour', 'sold_stock', 'other']),
    date: z.string().min(1, 'Date is required'),
    notes: z.string().optional().nullable(),
    inventory_item_id: z.string().optional().nullable(),
    inventory_qty: z.number().positive().optional().nullable(),
    inventory_unit_cost: z.number().positive().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.type === 'cash_out' && data.allocation === 'farm_inputs') {
        return (
          data.inventory_item_id != null &&
          data.inventory_item_id.trim() !== '' &&
          data.inventory_qty != null &&
          data.inventory_qty > 0 &&
          data.inventory_unit_cost != null &&
          data.inventory_unit_cost > 0
        );
      }
      return true;
    },
    {
      message: 'Inventory item, quantity, and unit cost are required for farm inputs',
      path: ['inventory_item_id'],
    }
  )
  .refine(
    (data) => {
      if (data.type === 'cash_out' && data.allocation !== 'farm_inputs') {
        return data.amount != null && data.amount > 0;
      }
      if (data.type === 'cash_in') {
        return data.amount != null && data.amount > 0;
      }
      return true;
    },
    {
      message: 'Amount is required',
      path: ['amount'],
    }
  );

export type DaybookFormData = z.infer<typeof daybookFormSchema>;
